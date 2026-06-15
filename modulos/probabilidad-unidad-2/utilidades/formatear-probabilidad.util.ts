import {
  formatearNumero,
  formatearPorcentaje,
} from "@/modulos/formulas-segundo-parcial/utils/formatear-numero.util";
import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import type { ModoValorProbabilidad } from "@/modulos/probabilidad-unidad-2/tipos";

export function formatearDecimalProbabilidad(
  valor: number,
  precision: PrecisionResultado,
) {
  return formatearNumero(valor, precision);
}

export function formatearPorcentajeProbabilidad(
  valor: number,
  precision: PrecisionResultado,
) {
  return formatearPorcentaje(valor, precision);
}

export function formatearValorSegunModo(
  valor: number,
  modo: ModoValorProbabilidad,
  precision: PrecisionResultado,
) {
  if (modo === "cantidades") {
    return formatearNumero(valor, { modo: "decimales", decimales: 0 });
  }

  if (modo === "porcentaje") {
    return formatearPorcentaje(valor, precision);
  }

  return formatearNumero(valor, precision);
}

export function formatearValorMixto(
  valorBruto: number,
  probabilidad: number,
  modo: ModoValorProbabilidad,
  precision: PrecisionResultado,
) {
  if (modo === "cantidades") {
    return `${formatearNumero(valorBruto, {
      modo: "decimales",
      decimales: 0,
    })} | ${formatearPorcentaje(probabilidad, precision)}`;
  }

  return `${formatearNumero(probabilidad, precision)} | ${formatearPorcentaje(
    probabilidad,
    precision,
  )}`;
}

export function formatearRelacionConUniverso(
  numerador: number,
  denominador: number,
) {
  return `${formatearNumero(numerador, {
    modo: "decimales",
    decimales: 0,
  })} / ${formatearNumero(denominador, {
    modo: "decimales",
    decimales: 0,
  })}`;
}
