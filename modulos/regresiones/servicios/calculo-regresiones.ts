import { obtenerConfiguracionRegresion } from "@/modulos/regresiones/servicios/configuraciones-regresiones";
import type {
  CoeficienteRegresionVisible,
  ConfiguracionRegresion,
  EstadoConfiguracionRegresion,
  IdentificadorRegresion,
  ParRegresion,
  PasoProcedimientoRegresion,
  ResultadoCalculoCompletoRegresion,
  ResultadoCalculoRegresion,
  ResultadoEstimacionRegresion,
  SumatoriaRegresion,
  TablaCalculoRegresion,
  TipoLogaritmoRegresion,
} from "@/modulos/regresiones/tipos";
import {
  aplicarPrecisionProceso,
  construirEcuacionCuadraticaVisible,
  construirEcuacionExponencialAlternaVisible,
  construirEcuacionExponencialVisible,
  construirEcuacionLinealVisible,
  construirEcuacionPotencialVisible,
  construirInterpretacionGenerica,
  formatearNumeroRegresion,
} from "@/modulos/regresiones/utilidades/formateo-regresion";
import { resolverSistema3x3 } from "@/modulos/regresiones/utilidades/matriz-regresion";
import { parsearNumeroRegresion } from "@/modulos/regresiones/utilidades/parseo-regresion";

function logaritmoSegunTipo(valor: number, tipo: TipoLogaritmoRegresion) {
  return tipo === "ln" ? Math.log(valor) : Math.log10(valor);
}

function potenciaBaseSegunTipo(valor: number, tipo: TipoLogaritmoRegresion) {
  return tipo === "ln" ? Math.exp(valor) : 10 ** valor;
}

function crearSumatoria(
  etiqueta: string,
  valor: number,
  precisionProceso: EstadoConfiguracionRegresion["precisionProceso"],
): SumatoriaRegresion {
  return {
    etiqueta,
    valor,
    valorVisible: formatearNumeroRegresion(valor, precisionProceso),
  };
}

function crearCoeficienteVisible(
  simbolo: string,
  valor: number,
  precisionResultado: EstadoConfiguracionRegresion["precisionResultado"],
): CoeficienteRegresionVisible {
  return {
    simbolo,
    valorInterno: valor,
    valorVisible: formatearNumeroRegresion(valor, precisionResultado),
  };
}

function generarCurva(
  resultadoBase: {
    tipo:
      | "lineal"
      | "cuadratica"
      | "exponencial"
      | "potencial";
    a: number;
    b: number;
    c?: number;
    tipoLogaritmo?: TipoLogaritmoRegresion;
  },
  pares: ParRegresion[],
) {
  const advertencias: string[] = [];
  const minimoX = Math.min(...pares.map((par) => par.x));
  const maximoX = Math.max(...pares.map((par) => par.x));
  const rango = maximoX - minimoX || 1;
  const totalPuntos = 160;
  const puntosCurva: ParRegresion[] = [];

  for (let indice = 0; indice < totalPuntos; indice += 1) {
    const x = minimoX + (rango * indice) / (totalPuntos - 1);
    let y = Number.NaN;

    if (resultadoBase.tipo === "lineal") {
      y = resultadoBase.a + resultadoBase.b * x;
    } else if (resultadoBase.tipo === "cuadratica") {
      y =
        resultadoBase.a +
        resultadoBase.b * x +
        (resultadoBase.c ?? 0) * x * x;
    } else if (resultadoBase.tipo === "exponencial") {
      y =
        resultadoBase.tipoLogaritmo === "ln"
          ? resultadoBase.a * Math.exp(resultadoBase.b * x)
          : resultadoBase.a * 10 ** (resultadoBase.b * x);
    } else if (resultadoBase.tipo === "potencial") {
      y = resultadoBase.a * x ** resultadoBase.b;
    }

    if (Number.isFinite(y)) {
      puntosCurva.push({ x, y });
    }
  }

  if (puntosCurva.length < totalPuntos) {
    advertencias.push(
      "Se omitieron algunos puntos de la curva porque generaban valores no validos para la grafica.",
    );
  }

  return { puntosCurva, advertencias };
}

function construirTabla(filas: Array<Array<string | number>>, columnas: string[]): TablaCalculoRegresion {
  return {
    columnas,
    filas: filas.map((valores, indice) => ({
      etiquetaFila: `fila-${indice + 1}`,
      valores,
    })),
  };
}

function construirLineaDeSustitucion(
  titulo: string,
  expresion: string,
  resultado: string,
): PasoProcedimientoRegresion {
  return { titulo, expresion, resultado };
}

function calcularLineal(
  pares: ParRegresion[],
  configuracion: ConfiguracionRegresion,
  estado: EstadoConfiguracionRegresion,
): ResultadoCalculoRegresion {
  const filasTabla = pares.map((par) => {
    const xy = aplicarPrecisionProceso(par.x * par.y, estado.precisionProceso);
    const x2 = aplicarPrecisionProceso(par.x * par.x, estado.precisionProceso);

    return {
      x: par.x,
      y: par.y,
      xy,
      x2,
    };
  });

  const sumaX = pares.reduce((acumulado, par) => acumulado + par.x, 0);
  const sumaY = pares.reduce((acumulado, par) => acumulado + par.y, 0);
  const sumaXY = filasTabla.reduce((acumulado, fila) => acumulado + fila.xy, 0);
  const sumaX2 = filasTabla.reduce((acumulado, fila) => acumulado + fila.x2, 0);
  const n = pares.length;
  const denominador = n * sumaX2 - sumaX ** 2;

  if (Math.abs(denominador) < 1e-12) {
    throw new Error(
      "No se puede calcular la regresion lineal porque el denominador queda en 0.",
    );
  }

  const numeradorB = n * sumaXY - sumaX * sumaY;
  const b = numeradorB / denominador;
  const a = (sumaY - b * sumaX) / n;
  const ecuacionFinal = construirEcuacionLinealVisible(
    a,
    b,
    estado.precisionResultado,
  );
  const { puntosCurva, advertencias } = generarCurva(
    { tipo: "lineal", a, b },
    pares,
  );

  const tablaCalculo = construirTabla(
    filasTabla.map((fila) => [
      formatearNumeroRegresion(fila.x, "completo"),
      formatearNumeroRegresion(fila.y, "completo"),
      formatearNumeroRegresion(fila.xy, estado.precisionProceso),
      formatearNumeroRegresion(fila.x2, estado.precisionProceso),
    ]),
    configuracion.columnasTabla,
  );

  const sumatorias = [
    crearSumatoria("n", n, estado.precisionProceso),
    crearSumatoria("ΣX", sumaX, estado.precisionProceso),
    crearSumatoria("ΣY", sumaY, estado.precisionProceso),
    crearSumatoria("ΣXY", sumaXY, estado.precisionProceso),
    crearSumatoria("ΣX^2", sumaX2, estado.precisionProceso),
  ];

  const pasos = [
    construirLineaDeSustitucion(
      "Pendiente B",
      `B = [${n}(${formatearNumeroRegresion(
        sumaXY,
        estado.precisionProceso,
      )}) - (${formatearNumeroRegresion(
        sumaX,
        estado.precisionProceso,
      )})(${formatearNumeroRegresion(
        sumaY,
        estado.precisionProceso,
      )})] / [${n}(${formatearNumeroRegresion(
        sumaX2,
        estado.precisionProceso,
      )}) - (${formatearNumeroRegresion(
        sumaX,
        estado.precisionProceso,
      )})^2]`,
      `B = ${formatearNumeroRegresion(b, estado.precisionResultado)}`,
    ),
    construirLineaDeSustitucion(
      "Intercepto A",
      `A = [${formatearNumeroRegresion(
        sumaY,
        estado.precisionProceso,
      )} - (${formatearNumeroRegresion(
        b,
        estado.precisionResultado,
      )})(${formatearNumeroRegresion(
        sumaX,
        estado.precisionProceso,
      )})] / ${n}`,
      `A = ${formatearNumeroRegresion(a, estado.precisionResultado)}`,
    ),
    {
      titulo: "Ecuacion final",
      resultado: ecuacionFinal,
    },
  ];

  return {
    id: configuracion.id,
    titulo: configuracion.titulo,
    resumen: configuracion.resumen,
    paresOriginales: pares,
    tablaCalculo,
    sumatorias,
    pasos,
    coeficientes: [
      crearCoeficienteVisible("A", a, estado.precisionResultado),
      crearCoeficienteVisible("B", b, estado.precisionResultado),
    ],
    ecuacionFinal,
    interpretacion: construirInterpretacionGenerica(
      configuracion,
      estado.personalizacion,
      b > 0
        ? "Existe una relacion directa: cuando X aumenta, Y tiende a aumentar de manera aproximadamente lineal."
        : b < 0
          ? "Existe una relacion inversa: cuando X aumenta, Y tiende a disminuir de manera aproximadamente lineal."
          : "La pendiente es 0, por lo que no se observa cambio lineal de Y respecto a X.",
    ),
    observaciones: [
      "A representa el valor estimado de Y cuando X = 0. Si X = 0 no tiene sentido en el contexto, se interpreta solo como parametro matematico.",
    ],
    configuracion: estado,
    estimaciones: [],
    puntosCurva,
    advertenciasGrafica: advertencias,
    dominioGrafica: {
      minimoX: Math.min(...pares.map((par) => par.x)),
      maximoX: Math.max(...pares.map((par) => par.x)),
    },
    metadatosModelo: {
      tipo: "lineal",
      a,
      b,
    },
  };
}

function calcularCuadratica(
  pares: ParRegresion[],
  configuracion: ConfiguracionRegresion,
  estado: EstadoConfiguracionRegresion,
): ResultadoCalculoRegresion {
  const filasTabla = pares.map((par) => {
    const xy = aplicarPrecisionProceso(par.x * par.y, estado.precisionProceso);
    const x2 = aplicarPrecisionProceso(par.x ** 2, estado.precisionProceso);
    const x3 = aplicarPrecisionProceso(par.x ** 3, estado.precisionProceso);
    const x4 = aplicarPrecisionProceso(par.x ** 4, estado.precisionProceso);
    const x2y = aplicarPrecisionProceso(par.x ** 2 * par.y, estado.precisionProceso);

    return {
      x: par.x,
      y: par.y,
      xy,
      x2,
      x3,
      x4,
      x2y,
    };
  });

  const n = pares.length;
  const sumaX = pares.reduce((acumulado, par) => acumulado + par.x, 0);
  const sumaY = pares.reduce((acumulado, par) => acumulado + par.y, 0);
  const sumaXY = filasTabla.reduce((acumulado, fila) => acumulado + fila.xy, 0);
  const sumaX2 = filasTabla.reduce((acumulado, fila) => acumulado + fila.x2, 0);
  const sumaX3 = filasTabla.reduce((acumulado, fila) => acumulado + fila.x3, 0);
  const sumaX4 = filasTabla.reduce((acumulado, fila) => acumulado + fila.x4, 0);
  const sumaX2Y = filasTabla.reduce((acumulado, fila) => acumulado + fila.x2y, 0);

  const [a, b, c] = resolverSistema3x3(
    [
      [n, sumaX, sumaX2],
      [sumaX, sumaX2, sumaX3],
      [sumaX2, sumaX3, sumaX4],
    ],
    [sumaY, sumaXY, sumaX2Y],
  );

  const ecuacionFinal = construirEcuacionCuadraticaVisible(
    a,
    b,
    c,
    estado.precisionResultado,
  );
  const { puntosCurva, advertencias } = generarCurva(
    { tipo: "cuadratica", a, b, c },
    pares,
  );

  const tablaCalculo = construirTabla(
    filasTabla.map((fila) => [
      formatearNumeroRegresion(fila.x, "completo"),
      formatearNumeroRegresion(fila.y, "completo"),
      formatearNumeroRegresion(fila.xy, estado.precisionProceso),
      formatearNumeroRegresion(fila.x2, estado.precisionProceso),
      formatearNumeroRegresion(fila.x3, estado.precisionProceso),
      formatearNumeroRegresion(fila.x4, estado.precisionProceso),
      formatearNumeroRegresion(fila.x2y, estado.precisionProceso),
    ]),
    configuracion.columnasTabla,
  );

  const sumatorias = [
    crearSumatoria("n", n, estado.precisionProceso),
    crearSumatoria("ΣX", sumaX, estado.precisionProceso),
    crearSumatoria("ΣY", sumaY, estado.precisionProceso),
    crearSumatoria("ΣXY", sumaXY, estado.precisionProceso),
    crearSumatoria("ΣX^2", sumaX2, estado.precisionProceso),
    crearSumatoria("ΣX^3", sumaX3, estado.precisionProceso),
    crearSumatoria("ΣX^4", sumaX4, estado.precisionProceso),
    crearSumatoria("ΣX^2Y", sumaX2Y, estado.precisionProceso),
  ];

  const pasos = [
    {
      titulo: "Sistema normal",
      descripcion:
        "Se arma el sistema con las ecuaciones normales de la regresion cuadratica.",
      expresion: `ΣY = ${n}A + (${formatearNumeroRegresion(
        sumaX,
        estado.precisionProceso,
      )})B + (${formatearNumeroRegresion(
        sumaX2,
        estado.precisionProceso,
      )})C`,
    },
    {
      titulo: "Segunda ecuacion",
      expresion: `ΣXY = (${formatearNumeroRegresion(
        sumaX,
        estado.precisionProceso,
      )})A + (${formatearNumeroRegresion(
        sumaX2,
        estado.precisionProceso,
      )})B + (${formatearNumeroRegresion(
        sumaX3,
        estado.precisionProceso,
      )})C`,
    },
    {
      titulo: "Tercera ecuacion",
      expresion: `ΣX^2Y = (${formatearNumeroRegresion(
        sumaX2,
        estado.precisionProceso,
      )})A + (${formatearNumeroRegresion(
        sumaX3,
        estado.precisionProceso,
      )})B + (${formatearNumeroRegresion(
        sumaX4,
        estado.precisionProceso,
      )})C`,
      resultado: `A = ${formatearNumeroRegresion(
        a,
        estado.precisionResultado,
      )}, B = ${formatearNumeroRegresion(
        b,
        estado.precisionResultado,
      )}, C = ${formatearNumeroRegresion(c, estado.precisionResultado)}`,
    },
    {
      titulo: "Ecuacion final",
      resultado: ecuacionFinal,
    },
  ];

  return {
    id: configuracion.id,
    titulo: configuracion.titulo,
    resumen: configuracion.resumen,
    paresOriginales: pares,
    tablaCalculo,
    sumatorias,
    pasos,
    coeficientes: [
      crearCoeficienteVisible("A", a, estado.precisionResultado),
      crearCoeficienteVisible("B", b, estado.precisionResultado),
      crearCoeficienteVisible("C", c, estado.precisionResultado),
    ],
    ecuacionFinal,
    interpretacion: construirInterpretacionGenerica(
      configuracion,
      estado.personalizacion,
      c > 0
        ? "La parabola abre hacia arriba y el modelo presenta un punto minimo."
        : c < 0
          ? "La parabola abre hacia abajo y el modelo presenta un punto maximo."
          : "El coeficiente cuadratico es 0, por lo que el modelo se reduce a un comportamiento lineal.",
    ),
    observaciones: [
      "Este modelo es util cuando la relacion entre X y Y presenta curvatura.",
    ],
    configuracion: estado,
    estimaciones: [],
    puntosCurva,
    advertenciasGrafica: advertencias,
    dominioGrafica: {
      minimoX: Math.min(...pares.map((par) => par.x)),
      maximoX: Math.max(...pares.map((par) => par.x)),
    },
    metadatosModelo: {
      tipo: "cuadratica",
      a,
      b,
      c,
    },
  };
}

function calcularExponencial(
  pares: ParRegresion[],
  configuracion: ConfiguracionRegresion,
  estado: EstadoConfiguracionRegresion,
): ResultadoCalculoRegresion {
  const filasTabla = pares.map((par) => {
    const vBase = logaritmoSegunTipo(par.y, estado.tipoLogaritmo);
    const v = aplicarPrecisionProceso(vBase, estado.precisionProceso);
    const x2 = aplicarPrecisionProceso(par.x ** 2, estado.precisionProceso);
    const xv = aplicarPrecisionProceso(par.x * v, estado.precisionProceso);

    return {
      x: par.x,
      y: par.y,
      v,
      x2,
      xv,
    };
  });

  const n = pares.length;
  const sumaX = pares.reduce((acumulado, par) => acumulado + par.x, 0);
  const sumaV = filasTabla.reduce((acumulado, fila) => acumulado + fila.v, 0);
  const sumaX2 = filasTabla.reduce((acumulado, fila) => acumulado + fila.x2, 0);
  const sumaXV = filasTabla.reduce((acumulado, fila) => acumulado + fila.xv, 0);
  const denominador = n * sumaX2 - sumaX ** 2;

  if (Math.abs(denominador) < 1e-12) {
    throw new Error(
      "No se puede calcular la regresion exponencial porque el denominador queda en 0.",
    );
  }

  const bTransformado = (n * sumaXV - sumaX * sumaV) / denominador;
  const aTransformado = (sumaV - bTransformado * sumaX) / n;
  const a = potenciaBaseSegunTipo(aTransformado, estado.tipoLogaritmo);
  const ecuacionFinal = construirEcuacionExponencialVisible(
    a,
    bTransformado,
    estado.precisionResultado,
    estado.tipoLogaritmo,
  );
  const ecuacionAlterna =
    estado.tipoLogaritmo === "log10"
      ? construirEcuacionExponencialAlternaVisible(
          a,
          bTransformado * Math.log(10),
          estado.precisionResultado,
        )
      : undefined;
  const { puntosCurva, advertencias } = generarCurva(
    {
      tipo: "exponencial",
      a,
      b: bTransformado,
      tipoLogaritmo: estado.tipoLogaritmo,
    },
    pares,
  );

  const tablaCalculo = construirTabla(
    filasTabla.map((fila) => [
      formatearNumeroRegresion(fila.x, "completo"),
      formatearNumeroRegresion(fila.y, "completo"),
      formatearNumeroRegresion(fila.v, estado.precisionProceso),
      formatearNumeroRegresion(fila.x2, estado.precisionProceso),
      formatearNumeroRegresion(fila.xv, estado.precisionProceso),
    ]),
    configuracion.columnasTabla.map((columna) =>
      columna === "V"
        ? estado.tipoLogaritmo === "ln"
          ? "V = ln(Y)"
          : "V = log10(Y)"
        : columna,
    ),
  );

  const sumatorias = [
    crearSumatoria("n", n, estado.precisionProceso),
    crearSumatoria("ΣX", sumaX, estado.precisionProceso),
    crearSumatoria("ΣV", sumaV, estado.precisionProceso),
    crearSumatoria("ΣX^2", sumaX2, estado.precisionProceso),
    crearSumatoria("ΣXV", sumaXV, estado.precisionProceso),
  ];

  const pasos = [
    {
      titulo: "Transformacion logaritmica",
      descripcion:
        estado.tipoLogaritmo === "ln"
          ? "Se aplica V = ln(Y) para convertir el modelo exponencial en una recta."
          : "Se aplica V = log10(Y) para convertir el modelo exponencial en una recta.",
      resultado: `V = A + BX`,
    },
    construirLineaDeSustitucion(
      "Pendiente B",
      `B = [${n}(${formatearNumeroRegresion(
        sumaXV,
        estado.precisionProceso,
      )}) - (${formatearNumeroRegresion(
        sumaX,
        estado.precisionProceso,
      )})(${formatearNumeroRegresion(
        sumaV,
        estado.precisionProceso,
      )})] / [${n}(${formatearNumeroRegresion(
        sumaX2,
        estado.precisionProceso,
      )}) - (${formatearNumeroRegresion(
        sumaX,
        estado.precisionProceso,
      )})^2]`,
      `B = ${formatearNumeroRegresion(
        bTransformado,
        estado.precisionResultado,
      )}`,
    ),
    construirLineaDeSustitucion(
      "Intercepto transformado A",
      `A = [${formatearNumeroRegresion(
        sumaV,
        estado.precisionProceso,
      )} - (${formatearNumeroRegresion(
        bTransformado,
        estado.precisionResultado,
      )})(${formatearNumeroRegresion(
        sumaX,
        estado.precisionProceso,
      )})] / ${n}`,
      `A = ${formatearNumeroRegresion(
        aTransformado,
        estado.precisionResultado,
      )}`,
    ),
    {
      titulo: "Regreso al modelo original",
      resultado:
        estado.tipoLogaritmo === "ln"
          ? `a = e^A = ${formatearNumeroRegresion(
              a,
              estado.precisionResultado,
            )}`
          : `a = 10^A = ${formatearNumeroRegresion(
              a,
              estado.precisionResultado,
            )}`,
    },
    {
      titulo: "Ecuacion final",
      resultado: ecuacionFinal,
    },
  ];

  return {
    id: configuracion.id,
    titulo: configuracion.titulo,
    resumen: configuracion.resumen,
    paresOriginales: pares,
    tablaCalculo,
    sumatorias,
    pasos,
    coeficientes: [
      crearCoeficienteVisible("A", aTransformado, estado.precisionResultado),
      crearCoeficienteVisible("B", bTransformado, estado.precisionResultado),
      crearCoeficienteVisible("a", a, estado.precisionResultado),
      crearCoeficienteVisible(
        "b",
        estado.tipoLogaritmo === "ln"
          ? bTransformado
          : bTransformado * Math.log(10),
        estado.precisionResultado,
      ),
    ],
    ecuacionFinal,
    ecuacionAlterna,
    interpretacion: construirInterpretacionGenerica(
      configuracion,
      estado.personalizacion,
      bTransformado > 0
        ? "Existe crecimiento exponencial: al aumentar X, Y tiende a aumentar de forma multiplicativa."
        : bTransformado < 0
          ? "Existe decrecimiento exponencial: al aumentar X, Y tiende a disminuir de forma multiplicativa."
          : "El coeficiente de crecimiento es 0 y el modelo no muestra variacion exponencial.",
    ),
    observaciones: [
      estado.tipoLogaritmo === "ln"
        ? "La ecuacion final se expresa con base e."
        : "La ecuacion final se expresa con base 10 y se muestra una forma equivalente con base e.",
    ],
    configuracion: estado,
    estimaciones: [],
    puntosCurva,
    advertenciasGrafica: advertencias,
    dominioGrafica: {
      minimoX: Math.min(...pares.map((par) => par.x)),
      maximoX: Math.max(...pares.map((par) => par.x)),
    },
    metadatosModelo: {
      tipo: "exponencial",
      a,
      b: bTransformado,
      tipoLogaritmo: estado.tipoLogaritmo,
    },
  };
}

function calcularPotencial(
  pares: ParRegresion[],
  configuracion: ConfiguracionRegresion,
  estado: EstadoConfiguracionRegresion,
): ResultadoCalculoRegresion {
  const filasTabla = pares.map((par) => {
    const vBase = logaritmoSegunTipo(par.x, estado.tipoLogaritmo);
    const uBase = logaritmoSegunTipo(par.y, estado.tipoLogaritmo);
    const v = aplicarPrecisionProceso(vBase, estado.precisionProceso);
    const u = aplicarPrecisionProceso(uBase, estado.precisionProceso);
    const uv = aplicarPrecisionProceso(u * v, estado.precisionProceso);
    const v2 = aplicarPrecisionProceso(v * v, estado.precisionProceso);

    return {
      x: par.x,
      y: par.y,
      v,
      u,
      uv,
      v2,
    };
  });

  const n = pares.length;
  const sumaV = filasTabla.reduce((acumulado, fila) => acumulado + fila.v, 0);
  const sumaU = filasTabla.reduce((acumulado, fila) => acumulado + fila.u, 0);
  const sumaUV = filasTabla.reduce((acumulado, fila) => acumulado + fila.uv, 0);
  const sumaV2 = filasTabla.reduce((acumulado, fila) => acumulado + fila.v2, 0);
  const denominador = n * sumaV2 - sumaV ** 2;

  if (Math.abs(denominador) < 1e-12) {
    throw new Error(
      "No se puede calcular la regresion potencial porque el denominador queda en 0.",
    );
  }

  const b = (n * sumaUV - sumaV * sumaU) / denominador;
  const aTransformado = (sumaU - b * sumaV) / n;
  const a = potenciaBaseSegunTipo(aTransformado, estado.tipoLogaritmo);
  const ecuacionFinal = construirEcuacionPotencialVisible(
    a,
    b,
    estado.precisionResultado,
  );
  const { puntosCurva, advertencias } = generarCurva(
    { tipo: "potencial", a, b },
    pares,
  );

  const tablaCalculo = construirTabla(
    filasTabla.map((fila) => [
      formatearNumeroRegresion(fila.x, "completo"),
      formatearNumeroRegresion(fila.y, "completo"),
      formatearNumeroRegresion(fila.v, estado.precisionProceso),
      formatearNumeroRegresion(fila.u, estado.precisionProceso),
      formatearNumeroRegresion(fila.uv, estado.precisionProceso),
      formatearNumeroRegresion(fila.v2, estado.precisionProceso),
    ]),
    configuracion.columnasTabla.map((columna) => {
      if (columna === "V") {
        return estado.tipoLogaritmo === "ln" ? "V = ln(X)" : "V = log10(X)";
      }

      if (columna === "U") {
        return estado.tipoLogaritmo === "ln" ? "U = ln(Y)" : "U = log10(Y)";
      }

      return columna;
    }),
  );

  const sumatorias = [
    crearSumatoria("n", n, estado.precisionProceso),
    crearSumatoria("ΣV", sumaV, estado.precisionProceso),
    crearSumatoria("ΣU", sumaU, estado.precisionProceso),
    crearSumatoria("ΣUV", sumaUV, estado.precisionProceso),
    crearSumatoria("ΣV^2", sumaV2, estado.precisionProceso),
  ];

  const pasos = [
    {
      titulo: "Transformacion logaritmica",
      descripcion:
        estado.tipoLogaritmo === "ln"
          ? "Se calcula U = ln(Y) y V = ln(X) para linealizar el modelo potencial."
          : "Se calcula U = log10(Y) y V = log10(X) para linealizar el modelo potencial.",
      resultado: "U = A + BV",
    },
    construirLineaDeSustitucion(
      "Pendiente B",
      `B = [${n}(${formatearNumeroRegresion(
        sumaUV,
        estado.precisionProceso,
      )}) - (${formatearNumeroRegresion(
        sumaV,
        estado.precisionProceso,
      )})(${formatearNumeroRegresion(
        sumaU,
        estado.precisionProceso,
      )})] / [${n}(${formatearNumeroRegresion(
        sumaV2,
        estado.precisionProceso,
      )}) - (${formatearNumeroRegresion(
        sumaV,
        estado.precisionProceso,
      )})^2]`,
      `B = ${formatearNumeroRegresion(b, estado.precisionResultado)}`,
    ),
    {
      titulo: "Intercepto transformado A",
      expresion: `A = [${formatearNumeroRegresion(
        sumaU,
        estado.precisionProceso,
      )} - (${formatearNumeroRegresion(
        b,
        estado.precisionResultado,
      )})(${formatearNumeroRegresion(
        sumaV,
        estado.precisionProceso,
      )})] / ${n}`,
      resultado: `A = ${formatearNumeroRegresion(
        aTransformado,
        estado.precisionResultado,
      )}`,
    },
    {
      titulo: "Regreso al modelo original",
      resultado:
        estado.tipoLogaritmo === "ln"
          ? `a = e^A = ${formatearNumeroRegresion(
              a,
              estado.precisionResultado,
            )}`
          : `a = 10^A = ${formatearNumeroRegresion(
              a,
              estado.precisionResultado,
            )}`,
    },
    {
      titulo: "Ecuacion final",
      resultado: ecuacionFinal,
    },
  ];

  return {
    id: configuracion.id,
    titulo: configuracion.titulo,
    resumen: configuracion.resumen,
    paresOriginales: pares,
    tablaCalculo,
    sumatorias,
    pasos,
    coeficientes: [
      crearCoeficienteVisible("A", aTransformado, estado.precisionResultado),
      crearCoeficienteVisible("B", b, estado.precisionResultado),
      crearCoeficienteVisible("a", a, estado.precisionResultado),
      crearCoeficienteVisible("b", b, estado.precisionResultado),
    ],
    ecuacionFinal,
    interpretacion: construirInterpretacionGenerica(
      configuracion,
      estado.personalizacion,
      b > 0
        ? "Existe una relacion potencial directa: al aumentar X, Y tiende a aumentar segun una potencia."
        : b < 0
          ? "Existe una relacion potencial inversa: al aumentar X, Y tiende a disminuir segun una potencia."
          : "El exponente es 0 y Y tiende a comportarse como un valor constante respecto a X.",
    ),
    observaciones: [
      "En este modelo se usa V^2 = [log(X)]^2 para el calculo del denominador y de la pendiente.",
    ],
    configuracion: estado,
    estimaciones: [],
    puntosCurva,
    advertenciasGrafica: advertencias,
    dominioGrafica: {
      minimoX: Math.min(...pares.map((par) => par.x)),
      maximoX: Math.max(...pares.map((par) => par.x)),
    },
    metadatosModelo: {
      tipo: "potencial",
      a,
      b,
      tipoLogaritmo: estado.tipoLogaritmo,
    },
  };
}

export function calcularRegresion(
  regresionId: IdentificadorRegresion,
  pares: ParRegresion[],
  estado: EstadoConfiguracionRegresion,
): ResultadoCalculoCompletoRegresion {
  const configuracion = obtenerConfiguracionRegresion(regresionId);

  let resultado: ResultadoCalculoRegresion;

  if (regresionId === "regresion-lineal-simple") {
    resultado = calcularLineal(pares, configuracion, estado);
  } else if (regresionId === "regresion-cuadratica") {
    resultado = calcularCuadratica(pares, configuracion, estado);
  } else if (regresionId === "regresion-exponencial") {
    resultado = calcularExponencial(pares, configuracion, estado);
  } else {
    resultado = calcularPotencial(pares, configuracion, estado);
  }

  return {
    resultado,
    advertencias: resultado.advertenciasGrafica,
  };
}

function formatearEntradaEstimacion(texto: string) {
  return texto.trim().replace(",", ".");
}

export function calcularEstimacionesRegresion(
  resultado: ResultadoCalculoRegresion,
  valorXTexto: string,
  valorYTexto: string,
): ResultadoEstimacionRegresion[] {
  const estimaciones: ResultadoEstimacionRegresion[] = [];
  const precisionResultado = resultado.configuracion.precisionResultado;
  const valorX = valorXTexto.trim() ? parsearNumeroRegresion(valorXTexto) : null;
  const valorY = valorYTexto.trim() ? parsearNumeroRegresion(valorYTexto) : null;

  if (valorXTexto.trim() && valorX === null) {
    throw new Error("El valor de X para estimar Y no es valido.");
  }

  if (valorYTexto.trim() && valorY === null) {
    throw new Error("El valor de Y para estimar X no es valido.");
  }

  if (valorX !== null) {
    let yEstimado = 0;

    if (resultado.metadatosModelo.tipo === "lineal") {
      yEstimado =
        resultado.metadatosModelo.a + resultado.metadatosModelo.b * valorX;
    } else if (resultado.metadatosModelo.tipo === "cuadratica") {
      yEstimado =
        resultado.metadatosModelo.a +
        resultado.metadatosModelo.b * valorX +
        resultado.metadatosModelo.c * valorX ** 2;
    } else if (resultado.metadatosModelo.tipo === "exponencial") {
      yEstimado =
        resultado.metadatosModelo.tipoLogaritmo === "ln"
          ? resultado.metadatosModelo.a *
            Math.exp(resultado.metadatosModelo.b * valorX)
          : resultado.metadatosModelo.a *
            10 ** (resultado.metadatosModelo.b * valorX);
    } else {
      if (valorX <= 0) {
        throw new Error(
          "La regresion potencial requiere valores de X mayores que 0 para estimar Y.",
        );
      }

      yEstimado =
        resultado.metadatosModelo.a * valorX ** resultado.metadatosModelo.b;
    }

    estimaciones.push({
      titulo: "Estimacion de Y dado X",
      entrada: `X = ${formatearEntradaEstimacion(valorXTexto)}`,
      resultadoVisible: `Y estimada = ${formatearNumeroRegresion(
        yEstimado,
        precisionResultado,
      )}`,
      detalle: "Se reemplaza el valor de X en la ecuacion final obtenida.",
      puntosGrafica: [
        {
          x: valorX,
          y: yEstimado,
          etiqueta: "Estimado Y",
          color: "#D97706",
        },
      ],
    });
  }

  if (valorY !== null) {
    if (resultado.metadatosModelo.tipo === "lineal") {
      if (Math.abs(resultado.metadatosModelo.b) < 1e-12) {
        throw new Error(
          "No se puede despejar X porque la pendiente B es 0.",
        );
      }

      const xEstimado =
        (valorY - resultado.metadatosModelo.a) / resultado.metadatosModelo.b;
      estimaciones.push({
        titulo: "Estimacion de X dado Y",
        entrada: `Y = ${formatearEntradaEstimacion(valorYTexto)}`,
        resultadoVisible: `X estimada = ${formatearNumeroRegresion(
          xEstimado,
          precisionResultado,
        )}`,
        detalle: "Se despeja X a partir del modelo lineal final.",
        puntosGrafica: [
          {
            x: xEstimado,
            y: valorY,
            etiqueta: "Estimado X",
            color: "#2563EB",
          },
        ],
      });
    } else if (resultado.metadatosModelo.tipo === "cuadratica") {
      const { a, b, c } = resultado.metadatosModelo;

      if (Math.abs(c) < 1e-12) {
        if (Math.abs(b) < 1e-12) {
          throw new Error(
            "No se puede despejar X porque los coeficientes lineal y cuadratico son 0.",
          );
        }

        const xEstimado = (valorY - a) / b;
        estimaciones.push({
          titulo: "Estimacion de X dado Y",
          entrada: `Y = ${formatearEntradaEstimacion(valorYTexto)}`,
          resultadoVisible: `X estimada = ${formatearNumeroRegresion(
            xEstimado,
            precisionResultado,
          )}`,
          detalle: "Como C es 0, el modelo se despeja como una ecuacion lineal.",
          puntosGrafica: [
            {
              x: xEstimado,
              y: valorY,
              etiqueta: "Estimado X",
              color: "#2563EB",
            },
          ],
        });
      } else {
        const discriminante = b ** 2 - 4 * c * (a - valorY);

        if (discriminante < 0) {
          throw new Error(
            "No existen soluciones reales para X con ese valor de Y.",
          );
        }

        const raiz = Math.sqrt(discriminante);
        const x1 = (-b + raiz) / (2 * c);
        const x2 = (-b - raiz) / (2 * c);
        const resultados = discriminante === 0 ? [x1] : [x1, x2];

        estimaciones.push({
          titulo: "Estimacion de X dado Y",
          entrada: `Y = ${formatearEntradaEstimacion(valorYTexto)}`,
          resultadoVisible: resultados
            .map(
              (valor, indice) =>
                `X${indice + 1} = ${formatearNumeroRegresion(
                  valor,
                  precisionResultado,
                )}`,
            )
            .join(" | "),
          detalle:
            discriminante === 0
              ? "El discriminante es 0, por lo que existe una sola solucion real."
              : "El discriminante es positivo, por lo que existen dos soluciones reales para X.",
          puntosGrafica: resultados.map((valor, indice) => ({
            x: valor,
            y: valorY,
            etiqueta: `Estimado X${indice + 1}`,
            color: "#2563EB",
          })),
        });
      }
    } else if (resultado.metadatosModelo.tipo === "exponencial") {
      if (valorY <= 0) {
        throw new Error(
          "La regresion exponencial requiere un valor de Y mayor que 0 para despejar X.",
        );
      }

      const { a, b, tipoLogaritmo } = resultado.metadatosModelo;
      if (Math.abs(b) < 1e-12) {
        throw new Error(
          "No se puede despejar X porque el coeficiente de crecimiento es 0.",
        );
      }

      const xEstimado =
        tipoLogaritmo === "ln"
          ? Math.log(valorY / a) / b
          : Math.log10(valorY / a) / b;

      estimaciones.push({
        titulo: "Estimacion de X dado Y",
        entrada: `Y = ${formatearEntradaEstimacion(valorYTexto)}`,
        resultadoVisible: `X estimada = ${formatearNumeroRegresion(
          xEstimado,
          precisionResultado,
        )}`,
        detalle:
          tipoLogaritmo === "ln"
            ? "Se despeja X usando ln(Y/a) / b."
            : "Se despeja X usando log10(Y/a) / B.",
        puntosGrafica: [
          {
            x: xEstimado,
            y: valorY,
            etiqueta: "Estimado X",
            color: "#2563EB",
          },
        ],
      });
    } else {
      if (valorY <= 0) {
        throw new Error(
          "La regresion potencial requiere un valor de Y mayor que 0 para despejar X.",
        );
      }

      const { a, b } = resultado.metadatosModelo;
      if (Math.abs(b) < 1e-12) {
        throw new Error("No se puede despejar X porque el exponente b es 0.");
      }

      const xEstimado = (valorY / a) ** (1 / b);
      estimaciones.push({
        titulo: "Estimacion de X dado Y",
        entrada: `Y = ${formatearEntradaEstimacion(valorYTexto)}`,
        resultadoVisible: `X estimada = ${formatearNumeroRegresion(
          xEstimado,
          precisionResultado,
        )}`,
        detalle: "Se despeja X desde el modelo potencial Y = a * X^b.",
        puntosGrafica: [
          {
            x: xEstimado,
            y: valorY,
            etiqueta: "Estimado X",
            color: "#2563EB",
          },
        ],
      });
    }
  }

  return estimaciones;
}
