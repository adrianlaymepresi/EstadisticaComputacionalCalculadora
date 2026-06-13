import type { TipoProbabilidad } from "@/modulos/formulas-segundo-parcial/tipos";

export interface SoporteDistribucion {
  inicio: number;
  fin?: number;
}

export interface PlanAcumulacion {
  modo: "directo" | "complemento";
  valores: number[];
  resultadoTrivial?: 0 | 1;
  descripcion: string;
  expresion: string;
}

function rangoEntero(inicio: number, fin: number) {
  if (fin < inicio) {
    return [];
  }

  return Array.from({ length: fin - inicio + 1 }, (_, indice) => inicio + indice);
}

export function crearPlanAcumulacion(
  tipo: TipoProbabilidad,
  x: number,
  soporte: SoporteDistribucion,
) {
  const inicio = soporte.inicio;
  const fin = soporte.fin;

  switch (tipo) {
    case "exactamente":
      return {
        modo: "directo",
        valores: [x],
        descripcion: `Calculo exacto para X = ${x}.`,
        expresion: `P(X = ${x})`,
      } satisfies PlanAcumulacion;
    case "ninguna":
      return {
        modo: "directo",
        valores: [0],
        descripcion: "Calculo directo para X = 0.",
        expresion: "P(X = 0)",
      } satisfies PlanAcumulacion;
    case "menor":
      if (x <= inicio) {
        return {
          modo: "directo",
          valores: [],
          resultadoTrivial: 0,
          descripcion: `No existen valores del soporte menores que ${x}.`,
          expresion: `P(X < ${x}) = 0`,
        } satisfies PlanAcumulacion;
      }

      return {
        modo: "directo",
        valores: rangoEntero(inicio, x - 1),
        descripcion: `Suma directa desde ${inicio} hasta ${x - 1}.`,
        expresion: `P(X < ${x})`,
      } satisfies PlanAcumulacion;
    case "menor-igual":
      if (x < inicio) {
        return {
          modo: "directo",
          valores: [],
          resultadoTrivial: 0,
          descripcion: `No existen valores del soporte menores o iguales que ${x}.`,
          expresion: `P(X <= ${x}) = 0`,
        } satisfies PlanAcumulacion;
      }

      return {
        modo: "directo",
        valores: rangoEntero(inicio, x),
        descripcion: `Suma directa desde ${inicio} hasta ${x}.`,
        expresion: `P(X <= ${x})`,
      } satisfies PlanAcumulacion;
    case "mayor":
      if (fin !== undefined && x >= fin) {
        return {
          modo: "complemento",
          valores: rangoEntero(inicio, fin),
          resultadoTrivial: 0,
          descripcion: `Todos los valores del soporte son menores o iguales que ${x}.`,
          expresion: `P(X > ${x}) = 0`,
        } satisfies PlanAcumulacion;
      }

      if (x < inicio) {
        return {
          modo: "complemento",
          valores: [],
          resultadoTrivial: 1,
          descripcion: `Todo el soporte es mayor que ${x}.`,
          expresion: `P(X > ${x}) = 1`,
        } satisfies PlanAcumulacion;
      }

      return {
        modo: "complemento",
        valores: rangoEntero(inicio, x),
        descripcion: `Se usa complemento con P(X > ${x}) = 1 - P(X <= ${x}).`,
        expresion: `P(X > ${x}) = 1 - P(X <= ${x})`,
      } satisfies PlanAcumulacion;
    case "mayor-igual":
      if (fin !== undefined && x > fin) {
        return {
          modo: "complemento",
          valores: rangoEntero(inicio, fin),
          resultadoTrivial: 0,
          descripcion: `No existen valores del soporte mayores o iguales que ${x}.`,
          expresion: `P(X >= ${x}) = 0`,
        } satisfies PlanAcumulacion;
      }

      if (x <= inicio) {
        return {
          modo: "complemento",
          valores: [],
          resultadoTrivial: 1,
          descripcion: `Todo el soporte es mayor o igual que ${x}.`,
          expresion: `P(X >= ${x}) = 1`,
        } satisfies PlanAcumulacion;
      }

      return {
        modo: "complemento",
        valores: rangoEntero(inicio, x - 1),
        descripcion: `Se usa complemento con P(X >= ${x}) = 1 - P(X < ${x}).`,
        expresion: `P(X >= ${x}) = 1 - P(X < ${x})`,
      } satisfies PlanAcumulacion;
    default:
      return {
        modo: "directo",
        valores: [x],
        descripcion: `Calculo exacto para X = ${x}.`,
        expresion: `P(X = ${x})`,
      } satisfies PlanAcumulacion;
  }
}
