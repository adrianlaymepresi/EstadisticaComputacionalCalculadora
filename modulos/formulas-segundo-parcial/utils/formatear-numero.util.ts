import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";

function recortarCeros(texto: string) {
  return texto.replace(/\.?0+$/, "");
}

function cambiarPuntoPorComa(texto: string) {
  return texto.replace(".", ",");
}

export function formatearBigInt(valor: bigint) {
  return valor.toString();
}

export function formatearNumero(
  valor: number,
  precision: PrecisionResultado,
  opciones: {
    porcentaje?: boolean;
  } = {},
) {
  const valorAFormatear = opciones.porcentaje ? valor * 100 : valor;

  if (!Number.isFinite(valorAFormatear)) {
    return "No definido";
  }

  if (precision.modo === "decimales") {
    const texto = valorAFormatear.toFixed(precision.decimales);
    return cambiarPuntoPorComa(texto);
  }

  if (valorAFormatear !== 0 && Math.abs(valorAFormatear) < 1e-10) {
    return cambiarPuntoPorComa(valorAFormatear.toExponential(10));
  }

  const decimalesCompletos = recortarCeros(valorAFormatear.toFixed(12));
  return cambiarPuntoPorComa(decimalesCompletos);
}

export function formatearPorcentaje(valor: number, precision: PrecisionResultado) {
  return `${formatearNumero(valor, precision, { porcentaje: true })}%`;
}

export function describirPrecision(precision: PrecisionResultado) {
  return precision.modo === "completo"
    ? "decimal completo"
    : `${precision.decimales} decimales`;
}
