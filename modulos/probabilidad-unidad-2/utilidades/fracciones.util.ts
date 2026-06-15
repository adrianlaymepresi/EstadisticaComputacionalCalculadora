export interface FraccionSimplificada {
  numerador: number;
  denominador: number;
  texto: string;
}

function valorAbsolutoEntero(valor: number) {
  return Math.abs(Math.trunc(valor));
}

export function calcularMaximoComunDivisor(a: number, b: number) {
  let valorA = valorAbsolutoEntero(a);
  let valorB = valorAbsolutoEntero(b);

  while (valorB !== 0) {
    const temporal = valorB;
    valorB = valorA % valorB;
    valorA = temporal;
  }

  return valorA === 0 ? 1 : valorA;
}

export function simplificarFraccion(
  numerador: number,
  denominador: number,
): FraccionSimplificada {
  if (denominador === 0) {
    return {
      numerador,
      denominador,
      texto: `${numerador}/${denominador}`,
    };
  }

  const divisor = calcularMaximoComunDivisor(numerador, denominador);
  const numeradorReducido = numerador / divisor;
  const denominadorReducido = denominador / divisor;

  return {
    numerador: numeradorReducido,
    denominador: denominadorReducido,
    texto: `${numeradorReducido}/${denominadorReducido}`,
  };
}
