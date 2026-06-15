import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import type { ResultadoCalculadoProbabilidad } from "@/modulos/probabilidad-unidad-2/tipos";
import {
  formatearDecimalProbabilidad,
  formatearPorcentajeProbabilidad,
} from "@/modulos/probabilidad-unidad-2/utilidades/formatear-probabilidad.util";

export interface HipotesisBayesEntrada {
  nombre: string;
  probabilidadPrevia: number;
  probabilidadEvidenciaDadaHipotesis: number;
}

export interface EntradaBayes {
  precision: PrecisionResultado;
  contexto: string;
  nombreEvidencia: string;
  nombreComplemento: string;
  hipotesis: HipotesisBayesEntrada[];
  indiceHipotesisObjetivo: number;
  usarComplemento: boolean;
}

export function calcularTeoremaBayes(
  entrada: EntradaBayes,
): ResultadoCalculadoProbabilidad {
  if (entrada.hipotesis.length < 2 || entrada.hipotesis.length > 6) {
    throw new Error("Debes trabajar con entre 2 y 6 hipotesis.");
  }

  if (
    entrada.indiceHipotesisObjetivo < 0 ||
    entrada.indiceHipotesisObjetivo >= entrada.hipotesis.length
  ) {
    throw new Error("Debes seleccionar una hipotesis objetivo valida.");
  }

  entrada.hipotesis.forEach((hipotesis, indice) => {
    if (!hipotesis.nombre.trim()) {
      throw new Error(`La hipotesis ${indice + 1} debe tener un nombre.`);
    }

    if (
      hipotesis.probabilidadPrevia < 0 ||
      hipotesis.probabilidadPrevia > 1
    ) {
      throw new Error(
        `La probabilidad previa de ${hipotesis.nombre} debe estar entre 0 y 1.`,
      );
    }

    if (
      hipotesis.probabilidadEvidenciaDadaHipotesis < 0 ||
      hipotesis.probabilidadEvidenciaDadaHipotesis > 1
    ) {
      throw new Error(
        `La probabilidad de la evidencia dada ${hipotesis.nombre} debe estar entre 0 y 1.`,
      );
    }
  });

  const sumaPrevias = entrada.hipotesis.reduce(
    (acumulado, hipotesis) => acumulado + hipotesis.probabilidadPrevia,
    0,
  );

  if (Math.abs(sumaPrevias - 1) > 1e-8) {
    throw new Error(
      "Las probabilidades previas deben sumar 1 o 100% segun el modo de ingreso.",
    );
  }

  const ramas = entrada.hipotesis.map((hipotesis) => {
    const probabilidadCondicional = entrada.usarComplemento
      ? 1 - hipotesis.probabilidadEvidenciaDadaHipotesis
      : hipotesis.probabilidadEvidenciaDadaHipotesis;
    const probabilidadComplementaria = entrada.usarComplemento
      ? hipotesis.probabilidadEvidenciaDadaHipotesis
      : 1 - hipotesis.probabilidadEvidenciaDadaHipotesis;

    return {
      ...hipotesis,
      probabilidadCondicional,
      probabilidadComplementaria,
      probabilidadConjunta:
        hipotesis.probabilidadPrevia * probabilidadCondicional,
      probabilidadConjuntaComplementaria:
        hipotesis.probabilidadPrevia * probabilidadComplementaria,
    };
  });

  const denominador = ramas.reduce(
    (acumulado, rama) => acumulado + rama.probabilidadConjunta,
    0,
  );

  if (denominador <= 0) {
    throw new Error(
      "No se puede aplicar Bayes porque la probabilidad total de la evidencia es 0.",
    );
  }

  const hipotesisObjetivo = ramas[entrada.indiceHipotesisObjetivo];
  const posterior = hipotesisObjetivo.probabilidadConjunta / denominador;
  const etiquetaEvidencia = entrada.usarComplemento
    ? entrada.nombreComplemento
    : entrada.nombreEvidencia;

  return {
    panel: {
      tarjetas: [
        {
          titulo: "Hipotesis objetivo",
          valor: hipotesisObjetivo.nombre,
          detalle: `Consulta: P(${hipotesisObjetivo.nombre} | ${etiquetaEvidencia})`,
        },
        {
          titulo: "Probabilidad total de la evidencia",
          valor: formatearDecimalProbabilidad(denominador, entrada.precision),
          detalle: formatearPorcentajeProbabilidad(denominador, entrada.precision),
        },
        {
          titulo: "Resultado posterior",
          valor: formatearDecimalProbabilidad(posterior, entrada.precision),
          detalle: formatearPorcentajeProbabilidad(posterior, entrada.precision),
        },
      ],
      pasos: [
        {
          titulo: "Calcular las probabilidades conjuntas de cada rama",
          expresion: ramas
            .map(
              (rama) =>
                `${rama.nombre}: ${formatearDecimalProbabilidad(
                  rama.probabilidadPrevia,
                  entrada.precision,
                )} x ${formatearDecimalProbabilidad(
                  rama.probabilidadCondicional,
                  entrada.precision,
                )} = ${formatearDecimalProbabilidad(
                  rama.probabilidadConjunta,
                  entrada.precision,
                )}`,
            )
            .join(" | "),
        },
        {
          titulo: "Sumar la probabilidad total de la evidencia",
          expresion: `P(${etiquetaEvidencia}) = ${ramas
            .map((rama) =>
              formatearDecimalProbabilidad(
                rama.probabilidadConjunta,
                entrada.precision,
              ),
            )
            .join(" + ")}`,
          resultado: formatearDecimalProbabilidad(denominador, entrada.precision),
        },
        {
          titulo: "Aplicar el teorema de Bayes",
          expresion: `P(${hipotesisObjetivo.nombre}|${etiquetaEvidencia}) = ${formatearDecimalProbabilidad(
            hipotesisObjetivo.probabilidadConjunta,
            entrada.precision,
          )} / ${formatearDecimalProbabilidad(denominador, entrada.precision)}`,
          resultado: `${formatearDecimalProbabilidad(
            posterior,
            entrada.precision,
          )} = ${formatearPorcentajeProbabilidad(posterior, entrada.precision)}`,
        },
      ],
      tablas: [
        {
          titulo: "Resumen de hipotesis y ramas",
          columnas: [
            "Hipotesis",
            "P(Hi)",
            `P(${entrada.nombreEvidencia}|Hi)`,
            `P(${entrada.nombreComplemento}|Hi)`,
            `P(Hi interseccion ${etiquetaEvidencia})`,
          ],
          filas: ramas.map((rama) => [
            rama.nombre,
            formatearDecimalProbabilidad(rama.probabilidadPrevia, entrada.precision),
            formatearDecimalProbabilidad(
              rama.probabilidadEvidenciaDadaHipotesis,
              entrada.precision,
            ),
            formatearDecimalProbabilidad(
              1 - rama.probabilidadEvidenciaDadaHipotesis,
              entrada.precision,
            ),
            formatearDecimalProbabilidad(
              rama.probabilidadConjunta,
              entrada.precision,
            ),
          ]),
        },
      ],
      interpretacion: `La probabilidad de que la hipotesis ${hipotesisObjetivo.nombre} sea la correcta dado ${etiquetaEvidencia} en ${entrada.contexto} es ${formatearDecimalProbabilidad(
        posterior,
        entrada.precision,
      )}, equivalente a ${formatearPorcentajeProbabilidad(
        posterior,
        entrada.precision,
      )}.`,
      observacion:
        "El denominador de Bayes se obtiene sumando todas las rutas donde ocurre la evidencia seleccionada.",
    },
    visual: {
      tipo: "arbol-bayes",
      titulo: "Arbol de decision de Bayes",
      evidencia: entrada.nombreEvidencia,
      complemento: entrada.nombreComplemento,
      ramas: ramas.map((rama, indice) => ({
        id: `h-${indice + 1}`,
        hipotesis: rama.nombre,
        previa: formatearDecimalProbabilidad(
          rama.probabilidadPrevia,
          entrada.precision,
        ),
        evidencia: formatearDecimalProbabilidad(
          rama.probabilidadEvidenciaDadaHipotesis,
          entrada.precision,
        ),
        complemento: formatearDecimalProbabilidad(
          1 - rama.probabilidadEvidenciaDadaHipotesis,
          entrada.precision,
        ),
        conjuntaEvidencia: formatearDecimalProbabilidad(
          rama.probabilidadPrevia * rama.probabilidadEvidenciaDadaHipotesis,
          entrada.precision,
        ),
        conjuntaComplemento: formatearDecimalProbabilidad(
          rama.probabilidadPrevia *
            (1 - rama.probabilidadEvidenciaDadaHipotesis),
          entrada.precision,
        ),
        resaltada: indice === entrada.indiceHipotesisObjetivo,
      })),
    },
  };
}
