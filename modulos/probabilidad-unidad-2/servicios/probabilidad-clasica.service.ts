import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import type { ResultadoCalculadoProbabilidad } from "@/modulos/probabilidad-unidad-2/tipos";
import { simplificarFraccion } from "@/modulos/probabilidad-unidad-2/utilidades/fracciones.util";
import {
  formatearDecimalProbabilidad,
  formatearPorcentajeProbabilidad,
  formatearRelacionConUniverso,
} from "@/modulos/probabilidad-unidad-2/utilidades/formatear-probabilidad.util";
import { validarSubconjunto } from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";

interface EntradaClasicaCantidad {
  tipoEntrada: "cantidades";
  nombreExperimento: string;
  nombreEvento: string;
  nombreUniverso: string;
  totalCasos: number;
  casosFavorables: number;
  precision: PrecisionResultado;
}

interface EntradaClasicaListado {
  tipoEntrada: "listado";
  nombreExperimento: string;
  nombreEvento: string;
  nombreUniverso: string;
  espacioMuestral: string[];
  elementosEvento: string[];
  precision: PrecisionResultado;
}

export type EntradaProbabilidadClasica =
  | EntradaClasicaCantidad
  | EntradaClasicaListado;

function construirInterpretacionClasica(
  nombreEvento: string,
  nombreExperimento: string,
  probabilidad: number,
  precision: PrecisionResultado,
) {
  return `La probabilidad de que ocurra ${nombreEvento} en ${nombreExperimento} es ${formatearDecimalProbabilidad(
    probabilidad,
    precision,
  )}, equivalente a ${formatearPorcentajeProbabilidad(
    probabilidad,
    precision,
  )}.`;
}

export function calcularProbabilidadClasica(
  entrada: EntradaProbabilidadClasica,
): ResultadoCalculadoProbabilidad {
  const totalCasos =
    entrada.tipoEntrada === "cantidades"
      ? entrada.totalCasos
      : entrada.espacioMuestral.length;
  const casosFavorables =
    entrada.tipoEntrada === "cantidades"
      ? entrada.casosFavorables
      : entrada.elementosEvento.length;

  if (!Number.isSafeInteger(totalCasos) || totalCasos <= 0) {
    throw new Error(
      "El numero total de casos posibles debe ser un entero positivo mayor a 0.",
    );
  }

  if (!Number.isSafeInteger(casosFavorables) || casosFavorables < 0) {
    throw new Error(
      "El numero de casos favorables debe ser un entero no negativo.",
    );
  }

  if (entrada.tipoEntrada === "listado") {
    validarSubconjunto(
      entrada.espacioMuestral,
      entrada.elementosEvento,
      entrada.nombreEvento,
    );
  }

  if (casosFavorables > totalCasos) {
    throw new Error(
      "Los casos favorables no pueden ser mayores que el total de casos posibles.",
    );
  }

  const probabilidad = casosFavorables / totalCasos;
  const fraccion = simplificarFraccion(casosFavorables, totalCasos);
  const pasos = [
    {
      titulo: "Identificar el total de casos posibles",
      expresion: `n(S) = ${totalCasos}`,
      resultado: `${totalCasos}`,
    },
    {
      titulo: "Identificar los casos favorables",
      expresion: `n(E) = ${casosFavorables}`,
      resultado: `${casosFavorables}`,
    },
    {
      titulo: "Reemplazar en la formula clasica",
      expresion: `P(E) = n(E) / n(S) = ${casosFavorables} / ${totalCasos}`,
      resultado: formatearRelacionConUniverso(casosFavorables, totalCasos),
    },
    {
      titulo: "Simplificar la fraccion",
      expresion: `${casosFavorables}/${totalCasos} = ${fraccion.texto}`,
      resultado: fraccion.texto,
    },
    {
      titulo: "Expresar el resultado en decimal y porcentaje",
      expresion: `P(E) = ${formatearDecimalProbabilidad(
        probabilidad,
        entrada.precision,
      )} = ${formatearPorcentajeProbabilidad(probabilidad, entrada.precision)}`,
      resultado: formatearPorcentajeProbabilidad(probabilidad, entrada.precision),
    },
  ];

  const filasTabla =
    entrada.tipoEntrada === "listado"
      ? Array.from(
          {
            length: Math.max(
              entrada.espacioMuestral.length,
              entrada.elementosEvento.length,
            ),
          },
          (_, indice) => [
            entrada.espacioMuestral[indice] ?? "",
            entrada.elementosEvento[indice] ?? "",
          ],
        )
      : undefined;

  return {
    panel: {
      tarjetas: [
        {
          titulo: "Fraccion exacta",
          valor: `${casosFavorables}/${totalCasos}`,
          detalle: `Fraccion simplificada: ${fraccion.texto}`,
        },
        {
          titulo: "Resultado decimal",
          valor: formatearDecimalProbabilidad(probabilidad, entrada.precision),
        },
        {
          titulo: "Resultado porcentual",
          valor: formatearPorcentajeProbabilidad(probabilidad, entrada.precision),
        },
      ],
      pasos,
      tablas: filasTabla
        ? [
            {
              titulo: "Resumen del espacio muestral y del evento",
              columnas: [entrada.nombreUniverso, entrada.nombreEvento],
              filas: filasTabla,
            },
          ]
        : undefined,
      interpretacion: construirInterpretacionClasica(
        entrada.nombreEvento,
        entrada.nombreExperimento,
        probabilidad,
        entrada.precision,
      ),
      observacion:
        entrada.tipoEntrada === "listado"
          ? `Se reconocieron ${totalCasos} resultados posibles y ${casosFavorables} favorables a ${entrada.nombreEvento}.`
          : `La razon entre casos favorables y casos posibles queda en la fraccion simplificada ${fraccion.texto}.`,
    },
    visual: {
      tipo: "espacio-muestral",
      titulo: "Representacion del espacio muestral",
      universoEtiqueta: entrada.nombreUniverso,
      eventoEtiqueta: entrada.nombreEvento,
      regiones: {
        evento: {
          id: "evento",
          etiqueta: entrada.nombreEvento,
          valor: `${casosFavorables} de ${totalCasos}`,
          resaltada: true,
        },
        complemento: {
          id: "complemento",
          etiqueta: `No ${entrada.nombreEvento}`,
          valor: `${totalCasos - casosFavorables} de ${totalCasos}`,
        },
      },
      elementosEspacio:
        entrada.tipoEntrada === "listado" ? entrada.espacioMuestral : undefined,
      elementosEvento:
        entrada.tipoEntrada === "listado" ? entrada.elementosEvento : undefined,
    },
  };
}
