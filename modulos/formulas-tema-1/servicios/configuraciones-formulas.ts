import type {
  CampoNumericoFormula,
  CampoTextoFormula,
  EstadoCalculoFormula,
  IdentificadorFormulaTema1,
  OpcionFormula,
  ResultadoFormulaTema1,
} from "@/modulos/formulas-tema-1/tipos";
import {
  compararRacionales,
  crearRacional,
  crearRacionalDesdeEntero,
  describirPrecision,
  dividirRacionales,
  esEnteroRacional,
  formatearRacionalSegunModo,
  multiplicarRacionales,
  racionalACadenaFraccion,
  racionalADecimalCompleto,
  restarRacionales,
  sumarRacionales,
  type Racional,
  valorAbsolutoRacional,
} from "@/modulos/formulas-tema-1/servicios/racionales";

interface DefinicionVariable {
  simbolo: string;
  descripcion: string;
}

interface ConfiguracionFormulaTema1 {
  id: IdentificadorFormulaTema1;
  titulo: string;
  resumen: string;
  expresiones: string[];
  definiciones: DefinicionVariable[];
  condiciones: string[];
  camposNumericos: CampoNumericoFormula[];
  camposTexto: CampoTextoFormula[];
  opciones?: OpcionFormula[];
  calcular: (estado: EstadoCalculoFormula, racionales: Record<string, Racional>) => ResultadoFormulaTema1;
}

function etiquetaPersonalizada(
  textos: Record<string, string>,
  id: string,
  respaldo: string,
) {
  return textos[id]?.trim() || respaldo;
}

function decimalSegunModo(
  valor: Racional,
  estado: EstadoCalculoFormula,
) {
  return formatearRacionalSegunModo(
    valor,
    estado.modoPrecision,
    estado.decimalesPersonalizados,
  );
}

function descripcionPrecision(estado: EstadoCalculoFormula) {
  return describirPrecision(
    estado.modoPrecision,
    estado.decimalesPersonalizados,
  );
}

function valorEntrada(racional: Racional) {
  return racionalADecimalCompleto(racional);
}

function razonComoRelacion(racional: Racional) {
  return `${racional.numerador.toString()} : ${racional.denominador.toString()}`;
}

const cero = crearRacionalDesdeEntero(0);
const cien = crearRacionalDesdeEntero(100);

export const configuracionesFormulasTema1: Record<
  IdentificadorFormulaTema1,
  ConfiguracionFormulaTema1
> = {
  "formula-razon": {
    id: "formula-razon",
    titulo: "Formula Razon",
    resumen: "Calcula la razon entre dos magnitudes a y b mediante el cociente a / b.",
    expresiones: ["Razón = a / b"],
    definiciones: [
      { simbolo: "a", descripcion: "Primera magnitud observada." },
      { simbolo: "b", descripcion: "Segunda magnitud observada." },
    ],
    condiciones: [
      "b debe ser distinto de 0.",
      "Para este tema se recomienda usar magnitudes no negativas.",
    ],
    camposNumericos: [
      {
        id: "a",
        simbolo: "a",
        etiqueta: "Valor de a",
        descripcion: "Primera magnitud de la razon.",
        placeholder: "Ejemplo: 60",
        entero: true,
        noNegativo: true,
      },
      {
        id: "b",
        simbolo: "b",
        etiqueta: "Valor de b",
        descripcion: "Segunda magnitud de la razon.",
        placeholder: "Ejemplo: 20",
        entero: true,
        positivo: true,
      },
    ],
    camposTexto: [
      {
        id: "etiqueta-a",
        etiqueta: "Descripcion de a",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: aprobados",
        valorInicial: "a",
      },
      {
        id: "etiqueta-b",
        etiqueta: "Descripcion de b",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: reprobados",
        valorInicial: "b",
      },
    ],
    calcular: (estado, racionales) => {
      const razon = dividirRacionales(racionales.a, racionales.b);
      const etiquetaA = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-a", "a");
      const etiquetaB = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-b", "b");
      const fraccionSimplificada = racionalACadenaFraccion(razon);
      const razonDecimal = decimalSegunModo(razon, estado);

      return {
        tarjetas: [
          { titulo: "Fraccion simplificada", valor: fraccionSimplificada },
          { titulo: "Razon equivalente", valor: razonComoRelacion(razon) },
          {
            titulo: `Valor decimal extra (${descripcionPrecision(estado)})`,
            valor: razonDecimal,
          },
        ],
        pasos: [
          {
            titulo: "Formula general",
            expresion: "Razón = a / b",
          },
          {
            titulo: "Sustitucion",
            expresion: `${valorEntrada(racionales.a)} / ${valorEntrada(racionales.b)}`,
            resultado: fraccionSimplificada,
          },
          {
            titulo: "Razon simplificada",
            expresion: fraccionSimplificada,
            resultado: razonComoRelacion(razon),
          },
          {
            titulo: "Apoyo decimal",
            expresion: fraccionSimplificada,
            resultado: razonDecimal,
          },
        ],
        interpretacion: `La razon simplificada entre ${etiquetaA} y ${etiquetaB} es ${razonComoRelacion(razon)}. Es decir, por cada ${razon.denominador.toString()} de ${etiquetaB}, existen ${razon.numerador.toString()} de ${etiquetaA}.`,
        observacion:
          "El valor decimal se muestra solo como apoyo extra. La salida principal para razon se conserva en su fraccion minima o forma equivalente a:b.",
      };
    },
  },
  "formula-indice": {
    id: "formula-indice",
    titulo: "Formula Indice",
    resumen: "Calcula el indice como una razon multiplicada por 100.",
    expresiones: ["Índice = Razón * 100 = (a / b) * 100"],
    definiciones: [
      { simbolo: "a", descripcion: "Primera magnitud observada." },
      { simbolo: "b", descripcion: "Segunda magnitud observada." },
    ],
    condiciones: [
      "b debe ser distinto de 0.",
      "Para este tema se recomienda usar magnitudes no negativas.",
    ],
    camposNumericos: [
      {
        id: "a",
        simbolo: "a",
        etiqueta: "Valor de a",
        descripcion: "Primera magnitud del indice.",
        placeholder: "Ejemplo: 60",
        entero: true,
        noNegativo: true,
      },
      {
        id: "b",
        simbolo: "b",
        etiqueta: "Valor de b",
        descripcion: "Segunda magnitud del indice.",
        placeholder: "Ejemplo: 20",
        entero: true,
        positivo: true,
      },
    ],
    camposTexto: [
      {
        id: "etiqueta-a",
        etiqueta: "Descripcion de a",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: aprobados",
        valorInicial: "a",
      },
      {
        id: "etiqueta-b",
        etiqueta: "Descripcion de b",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: reprobados",
        valorInicial: "b",
      },
    ],
    calcular: (estado, racionales) => {
      const razon = dividirRacionales(racionales.a, racionales.b);
      const indice = multiplicarRacionales(razon, cien);
      const etiquetaA = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-a", "a");
      const etiquetaB = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-b", "b");

      return {
        tarjetas: [
          { titulo: "Razon base", valor: racionalACadenaFraccion(razon) },
          {
            titulo: `Indice (${descripcionPrecision(estado)})`,
            valor: `${decimalSegunModo(indice, estado)}%`,
          },
        ],
        pasos: [
          {
            titulo: "Razon base",
            expresion: `${valorEntrada(racionales.a)} / ${valorEntrada(racionales.b)}`,
            resultado: racionalACadenaFraccion(razon),
          },
          {
            titulo: "Aplicacion del indice",
            expresion: `${racionalACadenaFraccion(razon)} * 100`,
            resultado: `${decimalSegunModo(indice, estado)}%`,
          },
        ],
        interpretacion: `${etiquetaA} representa ${decimalSegunModo(indice, estado)}% respecto a ${etiquetaB}.`,
      };
    },
  },
  "formula-proporcion": {
    id: "formula-proporcion",
    titulo: "Formula Proporcion",
    resumen: "Calcula la proporcion de a o b respecto al total a + b.",
    expresiones: ["Proporción = a / (a + b)", "Proporción = b / (a + b)"],
    definiciones: [
      { simbolo: "a", descripcion: "Primera magnitud observada." },
      { simbolo: "b", descripcion: "Segunda magnitud observada." },
      { simbolo: "a+b", descripcion: "Total de ambas magnitudes." },
    ],
    condiciones: [
      "a y b deben ser no negativos.",
      "La suma a + b debe ser mayor a 0.",
    ],
    camposNumericos: [
      {
        id: "a",
        simbolo: "a",
        etiqueta: "Valor de a",
        descripcion: "Primera magnitud del total.",
        placeholder: "Ejemplo: 40",
        entero: true,
        noNegativo: true,
      },
      {
        id: "b",
        simbolo: "b",
        etiqueta: "Valor de b",
        descripcion: "Segunda magnitud del total.",
        placeholder: "Ejemplo: 10",
        entero: true,
        noNegativo: true,
      },
    ],
    camposTexto: [
      {
        id: "etiqueta-a",
        etiqueta: "Descripcion de a",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: aprobados",
        valorInicial: "a",
      },
      {
        id: "etiqueta-b",
        etiqueta: "Descripcion de b",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: reprobados",
        valorInicial: "b",
      },
    ],
    opciones: [
      {
        id: "variable-proporcion",
        etiqueta: "Calcular proporcion respecto a",
        opciones: [
          { valor: "a", etiqueta: "a" },
          { valor: "b", etiqueta: "b" },
        ],
      },
    ],
    calcular: (estado, racionales) => {
      const total = sumarRacionales(racionales.a, racionales.b);
      if (compararRacionales(total, cero) === 0) {
        throw new Error("La suma a + b debe ser mayor a 0.");
      }

      const opcion = estado.opciones["variable-proporcion"] || "a";
      const numerador = opcion === "b" ? racionales.b : racionales.a;
      const proporcion = dividirRacionales(numerador, total);
      const etiquetaA = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-a", "a");
      const etiquetaB = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-b", "b");
      const etiquetaSeleccionada = opcion === "b" ? etiquetaB : etiquetaA;
      const fraccionSimplificada = racionalACadenaFraccion(proporcion);

      return {
        tarjetas: [
          { titulo: "Fraccion simplificada", valor: fraccionSimplificada },
          {
            titulo: `Valor decimal extra (${descripcionPrecision(estado)})`,
            valor: decimalSegunModo(proporcion, estado),
          },
          {
            titulo: "Total",
            valor: valorEntrada(total),
          },
        ],
        pasos: [
          {
            titulo: "Total",
            expresion: `${valorEntrada(racionales.a)} + ${valorEntrada(racionales.b)}`,
            resultado: valorEntrada(total),
          },
          {
            titulo: "Sustitucion",
            expresion:
              opcion === "b"
                ? `${valorEntrada(racionales.b)} / (${valorEntrada(total)})`
                : `${valorEntrada(racionales.a)} / (${valorEntrada(total)})`,
            resultado: fraccionSimplificada,
          },
          {
            titulo: "Apoyo decimal",
            expresion: fraccionSimplificada,
            resultado: decimalSegunModo(proporcion, estado),
          },
        ],
        interpretacion: `${etiquetaSeleccionada} representa ${fraccionSimplificada} del total formado por ${etiquetaA} y ${etiquetaB}.`,
        observacion:
          "En proporcion se conserva primero la fraccion simplificada. El valor decimal queda como apoyo adicional.",
      };
    },
  },
  "formula-porcentaje": {
    id: "formula-porcentaje",
    titulo: "Formula Porcentaje",
    resumen: "Calcula el porcentaje como una proporcion multiplicada por 100.",
    expresiones: ["Porcentaje = proporción * 100"],
    definiciones: [
      { simbolo: "a", descripcion: "Primera magnitud observada." },
      { simbolo: "b", descripcion: "Segunda magnitud observada." },
      { simbolo: "a+b", descripcion: "Total de ambas magnitudes." },
    ],
    condiciones: [
      "a y b deben ser no negativos.",
      "La suma a + b debe ser mayor a 0.",
    ],
    camposNumericos: [
      {
        id: "a",
        simbolo: "a",
        etiqueta: "Valor de a",
        descripcion: "Primera magnitud del total.",
        placeholder: "Ejemplo: 40",
        entero: true,
        noNegativo: true,
      },
      {
        id: "b",
        simbolo: "b",
        etiqueta: "Valor de b",
        descripcion: "Segunda magnitud del total.",
        placeholder: "Ejemplo: 10",
        entero: true,
        noNegativo: true,
      },
    ],
    camposTexto: [
      {
        id: "etiqueta-a",
        etiqueta: "Descripcion de a",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: aprobados",
        valorInicial: "a",
      },
      {
        id: "etiqueta-b",
        etiqueta: "Descripcion de b",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: reprobados",
        valorInicial: "b",
      },
    ],
    opciones: [
      {
        id: "variable-porcentaje",
        etiqueta: "Calcular porcentaje respecto a",
        opciones: [
          { valor: "a", etiqueta: "a" },
          { valor: "b", etiqueta: "b" },
        ],
      },
    ],
    calcular: (estado, racionales) => {
      const total = sumarRacionales(racionales.a, racionales.b);
      if (compararRacionales(total, cero) === 0) {
        throw new Error("La suma a + b debe ser mayor a 0.");
      }

      const opcion = estado.opciones["variable-porcentaje"] || "a";
      const numerador = opcion === "b" ? racionales.b : racionales.a;
      const proporcion = dividirRacionales(numerador, total);
      const porcentaje = multiplicarRacionales(proporcion, cien);
      const etiquetaA = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-a", "a");
      const etiquetaB = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-b", "b");
      const etiquetaSeleccionada = opcion === "b" ? etiquetaB : etiquetaA;

      return {
        tarjetas: [
          { titulo: "Proporcion base", valor: racionalACadenaFraccion(proporcion) },
          {
            titulo: `Porcentaje (${descripcionPrecision(estado)})`,
            valor: `${decimalSegunModo(porcentaje, estado)}%`,
          },
        ],
        pasos: [
          {
            titulo: "Total",
            expresion: `${valorEntrada(racionales.a)} + ${valorEntrada(racionales.b)}`,
            resultado: valorEntrada(total),
          },
          {
            titulo: "Proporcion",
            expresion:
              opcion === "b"
                ? `${valorEntrada(racionales.b)} / (${valorEntrada(total)})`
                : `${valorEntrada(racionales.a)} / (${valorEntrada(total)})`,
            resultado: racionalACadenaFraccion(proporcion),
          },
          {
            titulo: "Porcentaje",
            expresion: `${racionalACadenaFraccion(proporcion)} * 100`,
            resultado: `${decimalSegunModo(porcentaje, estado)}%`,
          },
        ],
        interpretacion: `${etiquetaSeleccionada} representa ${decimalSegunModo(porcentaje, estado)}% del total formado por ${etiquetaA} y ${etiquetaB}.`,
      };
    },
  },
  "formula-porcentaje-cambio": {
    id: "formula-porcentaje-cambio",
    titulo: "Formula Porcentajes de Cambio",
    resumen: "Calcula el porcentaje de incremento y de decremento entre dos cantidades donde h < H.",
    expresiones: [
      "Porc. Incr. = ((H - h) / h) * 100",
      "Porc. Decr. = ((H - h) / H) * 100",
    ],
    definiciones: [
      { simbolo: "h", descripcion: "Valor menor o valor inicial." },
      { simbolo: "H", descripcion: "Valor mayor o valor final." },
    ],
    condiciones: [
      "h debe ser mayor a 0.",
      "H debe ser mayor a 0.",
      "Se requiere que h < H.",
    ],
    camposNumericos: [
      {
        id: "h",
        simbolo: "h",
        etiqueta: "Valor de h",
        descripcion: "Cantidad menor o inicial.",
        placeholder: "Ejemplo: 60",
        entero: true,
        positivo: true,
      },
      {
        id: "H",
        simbolo: "H",
        etiqueta: "Valor de H",
        descripcion: "Cantidad mayor o final.",
        placeholder: "Ejemplo: 72",
        entero: true,
        positivo: true,
      },
    ],
    camposTexto: [
      {
        id: "etiqueta-h",
        etiqueta: "Descripcion de h",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: porcentaje inicial",
        valorInicial: "h",
      },
      {
        id: "etiqueta-H",
        etiqueta: "Descripcion de H",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: porcentaje final",
        valorInicial: "H",
      },
    ],
    calcular: (estado, racionales) => {
      if (compararRacionales(racionales.h, racionales.H) >= 0) {
        throw new Error("Para esta formula se necesita que h sea menor que H.");
      }

      const diferencia = restarRacionales(racionales.H, racionales.h);
      const incremento = multiplicarRacionales(
        dividirRacionales(diferencia, racionales.h),
        cien,
      );
      const decremento = multiplicarRacionales(
        dividirRacionales(diferencia, racionales.H),
        cien,
      );
      const etiquetaHMenor = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-h", "h");
      const etiquetaHMayor = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-H", "H");

      return {
        tarjetas: [
          { titulo: "Diferencia H - h", valor: valorEntrada(diferencia) },
          {
            titulo: `% incremento (${descripcionPrecision(estado)})`,
            valor: `${decimalSegunModo(incremento, estado)}%`,
          },
          {
            titulo: `% decremento (${descripcionPrecision(estado)})`,
            valor: `${decimalSegunModo(decremento, estado)}%`,
          },
        ],
        pasos: [
          {
            titulo: "Diferencia",
            expresion: `${valorEntrada(racionales.H)} - ${valorEntrada(racionales.h)}`,
            resultado: valorEntrada(diferencia),
          },
          {
            titulo: "Porcentaje de incremento",
            expresion: `(${racionalACadenaFraccion(diferencia)} / ${valorEntrada(racionales.h)}) * 100`,
            resultado: `${decimalSegunModo(incremento, estado)}%`,
          },
          {
            titulo: "Porcentaje de decremento",
            expresion: `(${racionalACadenaFraccion(diferencia)} / ${valorEntrada(racionales.H)}) * 100`,
            resultado: `${decimalSegunModo(decremento, estado)}%`,
          },
        ],
        interpretacion: `Al pasar de ${etiquetaHMenor} a ${etiquetaHMayor}, el incremento relativo respecto a h es ${decimalSegunModo(incremento, estado)}% y el decremento equivalente respecto a H es ${decimalSegunModo(decremento, estado)}%.`,
      };
    },
  },
  "formula-porcentaje-error": {
    id: "formula-porcentaje-error",
    titulo: "Formula Porcentaje de Error",
    resumen: "Calcula el porcentaje de error entre un valor exacto A y uno aproximado B.",
    expresiones: ["Porc. Error = |A - B| / A * 100"],
    definiciones: [
      { simbolo: "A", descripcion: "Valor exacto." },
      { simbolo: "B", descripcion: "Valor aproximado." },
    ],
    condiciones: [
      "A debe ser mayor a 0.",
      "B debe ser no negativo.",
      "El denominador A no puede ser 0.",
    ],
    camposNumericos: [
      {
        id: "A",
        simbolo: "A",
        etiqueta: "Valor exacto A",
        descripcion: "Valor tomado como referencia exacta.",
        placeholder: "Ejemplo: 25",
        entero: true,
        positivo: true,
      },
      {
        id: "B",
        simbolo: "B",
        etiqueta: "Valor aproximado B",
        descripcion: "Valor medido o aproximado.",
        placeholder: "Ejemplo: 27",
        entero: true,
        noNegativo: true,
      },
    ],
    camposTexto: [
      {
        id: "etiqueta-A",
        etiqueta: "Descripcion de A",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: tiempo exacto",
        valorInicial: "valor exacto",
      },
      {
        id: "etiqueta-B",
        etiqueta: "Descripcion de B",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: tiempo aproximado",
        valorInicial: "valor aproximado",
      },
    ],
    calcular: (estado, racionales) => {
      const diferencia = valorAbsolutoRacional(
        restarRacionales(racionales.A, racionales.B),
      );
      const porcentajeError = multiplicarRacionales(
        dividirRacionales(diferencia, racionales.A),
        cien,
      );
      const etiquetaA = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-A", "valor exacto");
      const etiquetaB = etiquetaPersonalizada(estado.textosInterpretacion, "etiqueta-B", "valor aproximado");

      return {
        tarjetas: [
          { titulo: "Error absoluto", valor: valorEntrada(diferencia) },
          {
            titulo: `% error (${descripcionPrecision(estado)})`,
            valor: `${decimalSegunModo(porcentajeError, estado)}%`,
          },
        ],
        pasos: [
          {
            titulo: "Diferencia absoluta",
            expresion: `|${valorEntrada(racionales.A)} - ${valorEntrada(racionales.B)}|`,
            resultado: valorEntrada(diferencia),
          },
          {
            titulo: "Porcentaje de error",
            expresion: `(${racionalACadenaFraccion(diferencia)} / ${valorEntrada(racionales.A)}) * 100`,
            resultado: `${decimalSegunModo(porcentajeError, estado)}%`,
          },
        ],
        interpretacion: `${etiquetaB} difiere en ${decimalSegunModo(porcentajeError, estado)}% respecto a ${etiquetaA}.`,
      };
    },
  },
  "formula-tasa": {
    id: "formula-tasa",
    titulo: "Formula Tasas",
    resumen: "Calcula una tasa como la razon entre ocurrencias y poblacion multiplicada por una potencia de 10.",
    expresiones: ["Tasa = (Nº ocurrencia / Nº población) * 10^n"],
    definiciones: [
      { simbolo: "Nº ocurrencia", descripcion: "Cantidad de eventos observados." },
      { simbolo: "Nº población", descripcion: "Tamaño de la población de referencia." },
      { simbolo: "n", descripcion: "Exponente de 10 usado para escalar la tasa." },
    ],
    condiciones: [
      "El número de ocurrencias debe ser entero y no negativo.",
      "La población debe ser un entero mayor a 0.",
      "n debe ser un entero entre 0 y 10.",
    ],
    camposNumericos: [
      {
        id: "ocurrencias",
        simbolo: "Nº ocurrencia",
        etiqueta: "Numero de ocurrencias",
        descripcion: "Cantidad observada del evento.",
        placeholder: "Ejemplo: 20000",
        entero: true,
        noNegativo: true,
      },
      {
        id: "poblacion",
        simbolo: "Nº población",
        etiqueta: "Numero de poblacion",
        descripcion: "Poblacion de referencia.",
        placeholder: "Ejemplo: 8000000",
        entero: true,
        positivo: true,
      },
      {
        id: "n",
        simbolo: "n",
        etiqueta: "Exponente n",
        descripcion: "Potencia de 10 usada en la tasa.",
        placeholder: "Ejemplo: 3",
        entero: true,
        noNegativo: true,
      },
    ],
    camposTexto: [
      {
        id: "etiqueta-ocurrencias",
        etiqueta: "Descripcion de la ocurrencia",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: nacimientos",
        valorInicial: "ocurrencias",
      },
      {
        id: "etiqueta-poblacion",
        etiqueta: "Descripcion de la poblacion",
        descripcion: "Sirve para la interpretacion final.",
        placeholder: "Ejemplo: habitantes",
        valorInicial: "habitantes",
      },
    ],
    calcular: (estado, racionales) => {
      if (!esEnteroRacional(racionales.n)) {
        throw new Error("n debe ser un numero entero.");
      }

      const exponente = Number(racionales.n.numerador);
      if (exponente < 0 || exponente > 10) {
        throw new Error("n debe estar entre 0 y 10.");
      }

      const factor = crearRacional(10n ** BigInt(exponente), 1n);
      const razonBase = dividirRacionales(racionales.ocurrencias, racionales.poblacion);
      const tasa = multiplicarRacionales(razonBase, factor);
      const etiquetaOcurrencias = etiquetaPersonalizada(
        estado.textosInterpretacion,
        "etiqueta-ocurrencias",
        "ocurrencias",
      );
      const etiquetaPoblacion = etiquetaPersonalizada(
        estado.textosInterpretacion,
        "etiqueta-poblacion",
        "habitantes",
      );

      return {
        tarjetas: [
          { titulo: "Razon base", valor: racionalACadenaFraccion(razonBase) },
          { titulo: "Factor 10^n", valor: `${10 ** exponente}` },
          {
            titulo: `Tasa (${descripcionPrecision(estado)})`,
            valor: decimalSegunModo(tasa, estado),
          },
        ],
        pasos: [
          {
            titulo: "Razon base",
            expresion: `${valorEntrada(racionales.ocurrencias)} / ${valorEntrada(racionales.poblacion)}`,
            resultado: racionalACadenaFraccion(razonBase),
          },
          {
            titulo: "Factor de escala",
            expresion: `10^${exponente}`,
            resultado: `${10 ** exponente}`,
          },
          {
            titulo: "Tasa",
            expresion: `${racionalACadenaFraccion(razonBase)} * ${10 ** exponente}`,
            resultado: decimalSegunModo(tasa, estado),
          },
        ],
        interpretacion: `La tasa es ${decimalSegunModo(tasa, estado)} ${etiquetaOcurrencias} por cada ${10 ** exponente} ${etiquetaPoblacion}.`,
      };
    },
  },
};

export const tarjetasFormulaTema1 = [
  {
    id: "formula-razon" as const,
    titulo: "FORMULA RAZON",
    resumen: "Calcula la razon entre dos magnitudes a y b.",
    palabrasClave: ["razon", "a", "b", "cociente"],
  },
  {
    id: "formula-indice" as const,
    titulo: "FORMULA INDICE",
    resumen: "Calcula el indice como una razon multiplicada por 100.",
    palabrasClave: ["indice", "razon", "porcentaje", "a", "b"],
  },
  {
    id: "formula-proporcion" as const,
    titulo: "FORMULA PROPORCIONES",
    resumen: "Calcula la proporcion de a o b respecto al total.",
    palabrasClave: ["proporcion", "a", "b", "total"],
  },
  {
    id: "formula-porcentaje" as const,
    titulo: "FORMULA PORCENTAJE",
    resumen: "Calcula el porcentaje a partir de una proporcion.",
    palabrasClave: ["porcentaje", "proporcion", "a", "b"],
  },
  {
    id: "formula-porcentaje-cambio" as const,
    titulo: "FORMULA PORCENTAJES DE CAMBIO",
    resumen: "Calcula porcentajes de incremento y decremento entre h y H.",
    palabrasClave: ["cambio", "incremento", "decremento", "h", "H"],
  },
  {
    id: "formula-porcentaje-error" as const,
    titulo: "FORMULA PORCENTAJES DE ERROR",
    resumen: "Calcula el porcentaje de error entre A y B.",
    palabrasClave: ["error", "A", "B", "porcentaje de error"],
  },
  {
    id: "formula-tasa" as const,
    titulo: "FORMULA TASAS",
    resumen: "Calcula una tasa usando ocurrencias, poblacion y 10^n.",
    palabrasClave: ["tasas", "ocurrencia", "poblacion", "10^n"],
  },
];

export function obtenerConfiguracionFormulaTema1(
  id: IdentificadorFormulaTema1,
) {
  return configuracionesFormulasTema1[id];
}
