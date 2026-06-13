import type {
  PrecisionResultado,
  ResultadoFormulaSegundoParcial,
  TipoProbabilidad,
} from "@/modulos/formulas-segundo-parcial/tipos";
import { crearPlanAcumulacion } from "@/modulos/formulas-segundo-parcial/services/acumulaciones.service";
import {
  interpretarDistribucion,
  resolverContextoProbabilidad,
} from "@/modulos/formulas-segundo-parcial/services/interpretaciones.service";
import { combinacionBigInt } from "@/modulos/formulas-segundo-parcial/utils/combinacion.util";
import {
  describirPrecision,
  formatearBigInt,
  formatearNumero,
  formatearPorcentaje,
} from "@/modulos/formulas-segundo-parcial/utils/formatear-numero.util";
import { factorialBigInt } from "@/modulos/formulas-segundo-parcial/utils/factorial.util";

interface TerminoProbabilidad {
  x: number;
  formula: string;
  valor: number;
}

function asegurarEnteroNoNegativo(valor: number, etiqueta: string) {
  if (!Number.isInteger(valor) || valor < 0) {
    throw new Error(`El campo ${etiqueta} debe ser un entero no negativo.`);
  }
}

function construirTablaTerminos(
  titulo: string,
  precision: PrecisionResultado,
  terminos: TerminoProbabilidad[],
) {
  return {
    titulo,
    columnas: ["Valor", "Reemplazo", "Decimal", "Porcentaje"],
    filas: terminos.map((termino) => [
      `${termino.x}`,
      termino.formula,
      formatearNumero(termino.valor, precision),
      formatearPorcentaje(termino.valor, precision),
    ]),
  };
}

function construirTarjetasProbabilidad(
  precision: PrecisionResultado,
  extras: Array<{ titulo: string; valor: string }>,
  probabilidad: number,
) {
  return [
    ...extras,
    {
      titulo: `Resultado decimal (${describirPrecision(precision)})`,
      valor: formatearNumero(probabilidad, precision),
    },
    {
      titulo: `Resultado porcentual (${describirPrecision(precision)})`,
      valor: formatearPorcentaje(probabilidad, precision),
    },
  ];
}

function evaluarPlanProbabilidad(params: {
  tipoProbabilidad: TipoProbabilidad;
  x: number;
  inicio: number;
  fin?: number;
  calcularExacta: (valor: number) => TerminoProbabilidad;
  precision: PrecisionResultado;
  etiquetaTrivialCero: string;
  etiquetaTrivialUno: string;
}) {
  const plan = crearPlanAcumulacion(params.tipoProbabilidad, params.x, {
    inicio: params.inicio,
    fin: params.fin,
  });

  if (plan.resultadoTrivial === 0) {
    return {
      probabilidad: 0,
      pasos: [
        {
          titulo: "Plan de calculo",
          expresion: plan.descripcion,
          resultado: params.etiquetaTrivialCero,
        },
      ],
      tablas: [] as ResultadoFormulaSegundoParcial["tablas"],
      observacion: plan.expresion,
    };
  }

  if (plan.resultadoTrivial === 1) {
    return {
      probabilidad: 1,
      pasos: [
        {
          titulo: "Plan de calculo",
          expresion: plan.descripcion,
          resultado: params.etiquetaTrivialUno,
        },
      ],
      tablas: [] as ResultadoFormulaSegundoParcial["tablas"],
      observacion: plan.expresion,
    };
  }

  const terminos = plan.valores.map(params.calcularExacta);
  const sumaTerminos = terminos.reduce((acumulado, termino) => acumulado + termino.valor, 0);

  if (plan.modo === "directo") {
    return {
      probabilidad: sumaTerminos,
      pasos: [
        {
          titulo: "Plan de calculo",
          expresion: plan.expresion,
          resultado: plan.descripcion,
        },
      ],
      tablas: [
        construirTablaTerminos("Terminos evaluados", params.precision, terminos),
      ],
      observacion: undefined,
    };
  }

  return {
    probabilidad: 1 - sumaTerminos,
    pasos: [
      {
        titulo: "Complemento usado",
        expresion: plan.expresion,
        resultado: plan.descripcion,
      },
      {
        titulo: "Probabilidad complementaria",
        expresion: `Suma de la parte calculada = ${formatearNumero(sumaTerminos, params.precision)}`,
        resultado: `1 - ${formatearNumero(sumaTerminos, params.precision)} = ${formatearNumero(1 - sumaTerminos, params.precision)}`,
      },
    ],
    tablas: [
      construirTablaTerminos("Terminos de la parte complementaria", params.precision, terminos),
    ],
    observacion: plan.expresion,
  };
}

export function calcularBinomial(params: {
  n: number;
  p: number;
  x: number;
  tipoProbabilidad: TipoProbabilidad;
  precision: PrecisionResultado;
  textos: Record<string, string>;
}) {
  asegurarEnteroNoNegativo(params.n, "n");
  asegurarEnteroNoNegativo(params.x, "x");

  if (params.tipoProbabilidad === "exactamente" && (params.x < 0 || params.x > params.n)) {
    throw new Error("En binomial se requiere que x este entre 0 y n para el calculo exacto.");
  }

  const q = 1 - params.p;
  const exacta = (valor: number): TerminoProbabilidad => {
    const combinacion = combinacionBigInt(params.n, valor);
    const probabilidad =
      Number(combinacion) *
      params.p ** valor *
      q ** (params.n - valor);

    return {
      x: valor,
      formula: `C(${params.n}, ${valor}) x ${formatearNumero(params.p, params.precision)}^${valor} x ${formatearNumero(q, params.precision)}^${params.n - valor}`,
      valor: probabilidad,
    };
  };

  const evaluacion = evaluarPlanProbabilidad({
    tipoProbabilidad: params.tipoProbabilidad,
    x: params.tipoProbabilidad === "ninguna" ? 0 : params.x,
    inicio: 0,
    fin: params.n,
    calcularExacta: exacta,
    precision: params.precision,
    etiquetaTrivialCero: "0",
    etiquetaTrivialUno: "1",
  });

  const contexto = resolverContextoProbabilidad(params.textos);

  return {
    tarjetas: construirTarjetasProbabilidad(
      params.precision,
      [
        { titulo: "q = 1 - p", valor: formatearNumero(q, params.precision) },
        { titulo: "Rango de X", valor: `0 <= X <= ${params.n}` },
      ],
      evaluacion.probabilidad,
    ),
    pasos: [
      {
        titulo: "Datos generales",
        expresion: `n = ${params.n}, p = ${formatearNumero(params.p, params.precision)}, q = ${formatearNumero(q, params.precision)}, x = ${params.tipoProbabilidad === "ninguna" ? 0 : params.x}`,
      },
      ...evaluacion.pasos,
    ],
    tablas: evaluacion.tablas,
    interpretacion: interpretarDistribucion(
      params.tipoProbabilidad,
      evaluacion.probabilidad,
      params.precision,
      {
        exactamente:
          "La probabilidad de que exactamente {x} {exito} ocurran en {n} {ensayo} dentro de {contexto} es de {porcentaje}.",
        menor:
          "La probabilidad de que ocurran menos de {x} {exito} en {n} {ensayo} dentro de {contexto} es de {porcentaje}.",
        "menor-igual":
          "La probabilidad de que ocurran como maximo {x} {exito} en {n} {ensayo} dentro de {contexto} es de {porcentaje}.",
        mayor:
          "La probabilidad de que ocurran mas de {x} {exito} en {n} {ensayo} dentro de {contexto} es de {porcentaje}.",
        "mayor-igual":
          "La probabilidad de que ocurran al menos {x} {exito} en {n} {ensayo} dentro de {contexto} es de {porcentaje}.",
        ninguna:
          "La probabilidad de que no ocurra ningun exito en {n} {ensayo} dentro de {contexto} es de {porcentaje}.",
      },
      {
        x: params.tipoProbabilidad === "ninguna" ? 0 : params.x,
        n: params.n,
        exito: contexto.exito,
        ensayo: contexto.ensayo,
        contexto: contexto.contexto,
      },
    ),
    observacion: evaluacion.observacion,
    alertas:
      params.p === 0 || params.p === 1
        ? ["Se detecto un valor extremo de p, por lo que la distribucion puede degenerarse en casos limites."]
        : undefined,
  } satisfies ResultadoFormulaSegundoParcial;
}

export function calcularGeometrica(params: {
  p: number;
  x: number;
  tipoProbabilidad: TipoProbabilidad;
  precision: PrecisionResultado;
  textos: Record<string, string>;
}) {
  asegurarEnteroNoNegativo(params.x, "x");
  if (params.tipoProbabilidad === "ninguna") {
    throw new Error("La distribucion geometrica no permite X = 0, porque X representa el intento del primer exito.");
  }
  if (params.x < 1) {
    throw new Error("En geometrica se requiere x >= 1.");
  }

  const q = 1 - params.p;
  const exacta = (valor: number): TerminoProbabilidad => ({
    x: valor,
    formula: `${formatearNumero(params.p, params.precision)} x ${formatearNumero(q, params.precision)}^${valor - 1}`,
    valor: params.p * q ** (valor - 1),
  });

  const evaluacion = evaluarPlanProbabilidad({
    tipoProbabilidad: params.tipoProbabilidad,
    x: params.x,
    inicio: 1,
    calcularExacta: exacta,
    precision: params.precision,
    etiquetaTrivialCero: "0",
    etiquetaTrivialUno: "1",
  });

  const contexto = resolverContextoProbabilidad(params.textos);

  return {
    tarjetas: construirTarjetasProbabilidad(
      params.precision,
      [
        { titulo: "q = 1 - p", valor: formatearNumero(q, params.precision) },
        { titulo: "Soporte", valor: "X >= 1" },
      ],
      evaluacion.probabilidad,
    ),
    pasos: [
      {
        titulo: "Datos generales",
        expresion: `p = ${formatearNumero(params.p, params.precision)}, q = ${formatearNumero(q, params.precision)}, x = ${params.x}`,
      },
      ...evaluacion.pasos,
    ],
    tablas: evaluacion.tablas,
    interpretacion: interpretarDistribucion(
      params.tipoProbabilidad,
      evaluacion.probabilidad,
      params.precision,
      {
        exactamente:
          "La probabilidad de que el primer {exito} ocurra exactamente en el intento {x} dentro de {contexto} es de {porcentaje}.",
        menor:
          "La probabilidad de que el primer {exito} ocurra antes del intento {x} dentro de {contexto} es de {porcentaje}.",
        "menor-igual":
          "La probabilidad de que el primer {exito} ocurra a lo mucho en el intento {x} dentro de {contexto} es de {porcentaje}.",
        mayor:
          "La probabilidad de que se necesiten mas de {x} {ensayo} para el primer {exito} dentro de {contexto} es de {porcentaje}.",
        "mayor-igual":
          "La probabilidad de que se necesiten al menos {x} {ensayo} para el primer {exito} dentro de {contexto} es de {porcentaje}.",
        ninguna:
          "La distribucion geometrica no permite X = 0.",
      },
      {
        x: params.x,
        exito: contexto.exito,
        ensayo: contexto.ensayo,
        contexto: contexto.contexto,
      },
    ),
    observacion:
      params.tipoProbabilidad === "mayor"
        ? `Tambien puede verificarse con q^x = ${formatearNumero(q ** params.x, params.precision)}.`
        : params.tipoProbabilidad === "mayor-igual"
          ? `Tambien puede verificarse con q^(x-1) = ${formatearNumber(q ** (params.x - 1), params.precision)}.`
          : evaluacion.observacion,
    alertas:
      params.p === 1
        ? ["Cuando p = 1, el primer exito ocurre necesariamente en el intento 1."]
        : undefined,
  } satisfies ResultadoFormulaSegundoParcial;
}

function formatearNumber(valor: number, precision: PrecisionResultado) {
  return formatearNumero(valor, precision);
}

export function calcularPascal(params: {
  r: number;
  p: number;
  x: number;
  tipoProbabilidad: TipoProbabilidad;
  precision: PrecisionResultado;
  textos: Record<string, string>;
}) {
  asegurarEnteroNoNegativo(params.r, "r");
  asegurarEnteroNoNegativo(params.x, "x");
  if (params.r < 1) {
    throw new Error("En Pascal se requiere r >= 1.");
  }
  if (params.tipoProbabilidad === "ninguna") {
    throw new Error("La distribucion de Pascal no se trabaja con la opcion X = 0 en este modulo.");
  }
  if (params.tipoProbabilidad === "exactamente" && params.x < params.r) {
    throw new Error("No se puede calcular P(X=x) porque en Pascal se requiere x >= r.");
  }

  const q = 1 - params.p;
  const exacta = (valor: number): TerminoProbabilidad => {
    const combinacion = combinacionBigInt(valor - 1, params.r - 1);
    const probabilidad =
      Number(combinacion) *
      params.p ** params.r *
      q ** (valor - params.r);

    return {
      x: valor,
      formula: `C(${valor - 1}, ${params.r - 1}) x ${formatearNumero(params.p, params.precision)}^${params.r} x ${formatearNumero(q, params.precision)}^${valor - params.r}`,
      valor: probabilidad,
    };
  };

  const evaluacion = evaluarPlanProbabilidad({
    tipoProbabilidad: params.tipoProbabilidad,
    x: params.x,
    inicio: params.r,
    calcularExacta: exacta,
    precision: params.precision,
    etiquetaTrivialCero: "0",
    etiquetaTrivialUno: "1",
  });

  const contexto = resolverContextoProbabilidad(params.textos);

  return {
    tarjetas: construirTarjetasProbabilidad(
      params.precision,
      [
        { titulo: "q = 1 - p", valor: formatearNumero(q, params.precision) },
        { titulo: "Soporte", valor: `X >= ${params.r}` },
      ],
      evaluacion.probabilidad,
    ),
    pasos: [
      {
        titulo: "Datos generales",
        expresion: `r = ${params.r}, p = ${formatearNumero(params.p, params.precision)}, q = ${formatearNumero(q, params.precision)}, x = ${params.x}`,
      },
      ...evaluacion.pasos,
    ],
    tablas: evaluacion.tablas,
    interpretacion: interpretarDistribucion(
      params.tipoProbabilidad,
      evaluacion.probabilidad,
      params.precision,
      {
        exactamente:
          "La probabilidad de que el exito numero {r} ocurra exactamente en el intento {x} dentro de {contexto} es de {porcentaje}.",
        menor:
          "La probabilidad de completar {r} exitos antes del intento {x} dentro de {contexto} es de {porcentaje}.",
        "menor-igual":
          "La probabilidad de completar {r} exitos a lo mucho en {x} intentos dentro de {contexto} es de {porcentaje}.",
        mayor:
          "La probabilidad de necesitar mas de {x} intentos para completar {r} exitos dentro de {contexto} es de {porcentaje}.",
        "mayor-igual":
          "La probabilidad de necesitar al menos {x} intentos para completar {r} exitos dentro de {contexto} es de {porcentaje}.",
        ninguna:
          "La distribucion de Pascal no usa la opcion X = 0 en este contexto.",
      },
      {
        x: params.x,
        r: params.r,
        contexto: contexto.contexto,
      },
    ),
    observacion: evaluacion.observacion,
    alertas:
      params.p === 1
        ? [`Con p = 1, el exito numero ${params.r} ocurre exactamente en x = r.`]
        : undefined,
  } satisfies ResultadoFormulaSegundoParcial;
}

export function calcularHipergeometrica(params: {
  N: number;
  K: number;
  n: number;
  x: number;
  tipoProbabilidad: TipoProbabilidad;
  precision: PrecisionResultado;
  textos: Record<string, string>;
}) {
  asegurarEnteroNoNegativo(params.N, "N");
  asegurarEnteroNoNegativo(params.K, "K");
  asegurarEnteroNoNegativo(params.n, "n");
  asegurarEnteroNoNegativo(params.x, "x");

  if (params.N <= 0) {
    throw new Error("En la distribucion hipergeometrica se requiere N > 0.");
  }
  if (params.K > params.N) {
    throw new Error("En la distribucion hipergeometrica se requiere 0 <= K <= N.");
  }
  if (params.n > params.N) {
    throw new Error("En la distribucion hipergeometrica se requiere 0 <= n <= N.");
  }

  const minimoX = Math.max(0, params.n - (params.N - params.K));
  const maximoX = Math.min(params.n, params.K);

  const exacta = (valor: number): TerminoProbabilidad => {
    if (valor < minimoX || valor > maximoX) {
      return {
        x: valor,
        formula: `X = ${valor} esta fuera del rango valido`,
        valor: 0,
      };
    }

    const exitos = combinacionBigInt(params.K, valor);
    const fracasos = combinacionBigInt(params.N - params.K, params.n - valor);
    const total = combinacionBigInt(params.N, params.n);
    const probabilidad = (Number(exitos) * Number(fracasos)) / Number(total);

    return {
      x: valor,
      formula: `[C(${params.K}, ${valor}) x C(${params.N - params.K}, ${params.n - valor})] / C(${params.N}, ${params.n})`,
      valor: probabilidad,
    };
  };

  const evaluacion = evaluarPlanProbabilidad({
    tipoProbabilidad: params.tipoProbabilidad,
    x: params.tipoProbabilidad === "ninguna" ? 0 : params.x,
    inicio: minimoX,
    fin: maximoX,
    calcularExacta: exacta,
    precision: params.precision,
    etiquetaTrivialCero: "0",
    etiquetaTrivialUno: "1",
  });

  const contexto = resolverContextoProbabilidad(params.textos);

  return {
    tarjetas: construirTarjetasProbabilidad(
      params.precision,
      [
        { titulo: "Rango valido de X", valor: `${minimoX} <= X <= ${maximoX}` },
        { titulo: "Fracasos en poblacion", valor: `${params.N - params.K}` },
      ],
      evaluacion.probabilidad,
    ),
    pasos: [
      {
        titulo: "Datos generales",
        expresion: `N = ${params.N}, K = ${params.K}, n = ${params.n}, x = ${params.tipoProbabilidad === "ninguna" ? 0 : params.x}`,
      },
      ...evaluacion.pasos,
    ],
    tablas: evaluacion.tablas,
    interpretacion: interpretarDistribucion(
      params.tipoProbabilidad,
      evaluacion.probabilidad,
      params.precision,
      {
        exactamente:
          "La probabilidad de que exactamente {x} elementos de la {muestra} sean {exito} dentro de {contexto} es de {porcentaje}.",
        menor:
          "La probabilidad de que menos de {x} elementos de la {muestra} sean {exito} dentro de {contexto} es de {porcentaje}.",
        "menor-igual":
          "La probabilidad de que como maximo {x} elementos de la {muestra} sean {exito} dentro de {contexto} es de {porcentaje}.",
        mayor:
          "La probabilidad de que mas de {x} elementos de la {muestra} sean {exito} dentro de {contexto} es de {porcentaje}.",
        "mayor-igual":
          "La probabilidad de que al menos {x} elementos de la {muestra} sean {exito} dentro de {contexto} es de {porcentaje}.",
        ninguna:
          "La probabilidad de no encontrar ningun elemento {exito} en la {muestra} dentro de {contexto} es de {porcentaje}.",
      },
      {
        x: params.tipoProbabilidad === "ninguna" ? 0 : params.x,
        muestra: contexto.muestra,
        exito: contexto.exito,
        contexto: contexto.contexto,
      },
    ),
    observacion: evaluacion.observacion,
    alertas:
      params.tipoProbabilidad === "exactamente" &&
      (params.x < minimoX || params.x > maximoX)
        ? [
            `El valor x = ${params.x} esta fuera del rango valido [${minimoX}, ${maximoX}], por eso la probabilidad exacta es 0.`,
          ]
        : undefined,
  } satisfies ResultadoFormulaSegundoParcial;
}

export function calcularPoisson(params: {
  lambda: number;
  x: number;
  tipoProbabilidad: TipoProbabilidad;
  precision: PrecisionResultado;
  textos: Record<string, string>;
  detalleLambda?: string;
}) {
  asegurarEnteroNoNegativo(params.x, "x");
  if (!(params.lambda > 0)) {
    throw new Error("En la distribucion de Poisson se requiere lambda > 0.");
  }

  const exacta = (valor: number): TerminoProbabilidad => {
    const factorial = factorialBigInt(valor);
    const probabilidad =
      (Math.exp(-params.lambda) * params.lambda ** valor) / Number(factorial);

    return {
      x: valor,
      formula: `(e^-${formatearNumero(params.lambda, params.precision)} x ${formatearNumero(params.lambda, params.precision)}^${valor}) / ${formatearBigInt(factorial)}`,
      valor: probabilidad,
    };
  };

  const evaluacion = evaluarPlanProbabilidad({
    tipoProbabilidad: params.tipoProbabilidad,
    x: params.tipoProbabilidad === "ninguna" ? 0 : params.x,
    inicio: 0,
    calcularExacta: exacta,
    precision: params.precision,
    etiquetaTrivialCero: "0",
    etiquetaTrivialUno: "1",
  });

  const contexto = resolverContextoProbabilidad(params.textos);

  return {
    tarjetas: construirTarjetasProbabilidad(
      params.precision,
      [
        { titulo: "Lambda", valor: formatearNumero(params.lambda, params.precision) },
        { titulo: "Soporte", valor: "X >= 0" },
      ],
      evaluacion.probabilidad,
    ),
    pasos: [
      {
        titulo: "Datos generales",
        expresion: params.detalleLambda
          ? `${params.detalleLambda} | x = ${params.tipoProbabilidad === "ninguna" ? 0 : params.x}`
          : `lambda = ${formatearNumero(params.lambda, params.precision)}, x = ${params.tipoProbabilidad === "ninguna" ? 0 : params.x}`,
      },
      ...evaluacion.pasos,
    ],
    tablas: evaluacion.tablas,
    interpretacion: interpretarDistribucion(
      params.tipoProbabilidad,
      evaluacion.probabilidad,
      params.precision,
      {
        exactamente:
          "La probabilidad de que ocurran exactamente {x} eventos en {unidadTiempo} dentro de {contexto} es de {porcentaje}.",
        menor:
          "La probabilidad de que ocurran menos de {x} eventos en {unidadTiempo} dentro de {contexto} es de {porcentaje}.",
        "menor-igual":
          "La probabilidad de que ocurran como maximo {x} eventos en {unidadTiempo} dentro de {contexto} es de {porcentaje}.",
        mayor:
          "La probabilidad de que ocurran mas de {x} eventos en {unidadTiempo} dentro de {contexto} es de {porcentaje}.",
        "mayor-igual":
          "La probabilidad de que ocurran al menos {x} eventos en {unidadTiempo} dentro de {contexto} es de {porcentaje}.",
        ninguna:
          "La probabilidad de que no ocurra ningun evento en {unidadTiempo} dentro de {contexto} es de {porcentaje}.",
      },
      {
        x: params.tipoProbabilidad === "ninguna" ? 0 : params.x,
        unidadTiempo: contexto.unidadTiempo,
        contexto: contexto.contexto,
      },
    ),
    observacion: evaluacion.observacion,
  } satisfies ResultadoFormulaSegundoParcial;
}
