import { factorialBigInt } from "@/modulos/formulas-segundo-parcial/utils/factorial.util";

export function combinacionBigInt(total: number, seleccionados: number) {
  if (seleccionados < 0 || total < 0 || seleccionados > total) {
    return 0n;
  }

  const ajustado = Math.min(seleccionados, total - seleccionados);
  if (ajustado === 0) {
    return 1n;
  }

  let numerador = 1n;
  let denominador = 1n;

  for (let paso = 1; paso <= ajustado; paso += 1) {
    numerador *= BigInt(total - ajustado + paso);
    denominador *= BigInt(paso);
  }

  return numerador / denominador;
}

export function variacionSinRepeticionBigInt(total: number, seleccionados: number) {
  if (seleccionados < 0 || total < 0 || seleccionados > total) {
    return 0n;
  }

  let resultado = 1n;
  for (let paso = 0; paso < seleccionados; paso += 1) {
    resultado *= BigInt(total - paso);
  }
  return resultado;
}

export function permutacionConRepeticionBigInt(
  total: number,
  repeticiones: number[],
) {
  let denominador = 1n;
  for (const repeticion of repeticiones) {
    denominador *= factorialBigInt(repeticion);
  }

  return factorialBigInt(total) / denominador;
}
