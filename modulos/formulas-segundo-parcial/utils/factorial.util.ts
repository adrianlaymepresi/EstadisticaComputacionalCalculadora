const cacheFactoriales = new Map<number, bigint>([
  [0, 1n],
  [1, 1n],
]);

export function factorialBigInt(valor: number) {
  if (!Number.isInteger(valor) || valor < 0) {
    throw new Error("No se puede calcular factorial para valores negativos o no enteros.");
  }

  const guardado = cacheFactoriales.get(valor);
  if (guardado !== undefined) {
    return guardado;
  }

  let ultimoIndice = 1;
  let ultimoValor = 1n;

  for (const [indice, factorial] of cacheFactoriales.entries()) {
    if (indice > ultimoIndice) {
      ultimoIndice = indice;
      ultimoValor = factorial;
    }
  }

  for (let indice = ultimoIndice + 1; indice <= valor; indice += 1) {
    ultimoValor *= BigInt(indice);
    cacheFactoriales.set(indice, ultimoValor);
  }

  return ultimoValor;
}

export function desarrollarFactorial(valor: number) {
  if (valor <= 1) {
    return `${valor}! = 1`;
  }

  const factores = Array.from({ length: valor }, (_, indice) => valor - indice);
  const visibles =
    factores.length > 12
      ? [...factores.slice(0, 6), "...", ...factores.slice(-3)]
      : factores;

  return `${valor}! = ${visibles.join(" x ")}`;
}
