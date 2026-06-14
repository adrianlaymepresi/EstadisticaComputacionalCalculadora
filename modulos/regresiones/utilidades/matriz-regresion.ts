export function resolverSistema3x3(
  matrizEntrada: number[][],
  vectorEntrada: number[],
): [number, number, number] {
  const matriz = matrizEntrada.map((fila) => [...fila]);
  const vector = [...vectorEntrada];

  for (let pivote = 0; pivote < 3; pivote += 1) {
    let filaMaxima = pivote;

    for (let fila = pivote + 1; fila < 3; fila += 1) {
      if (Math.abs(matriz[fila][pivote]) > Math.abs(matriz[filaMaxima][pivote])) {
        filaMaxima = fila;
      }
    }

    if (Math.abs(matriz[filaMaxima][pivote]) < 1e-12) {
      throw new Error(
        "No se pudo resolver el sistema cuadratico porque la matriz es singular o casi singular.",
      );
    }

    if (filaMaxima !== pivote) {
      [matriz[pivote], matriz[filaMaxima]] = [matriz[filaMaxima], matriz[pivote]];
      [vector[pivote], vector[filaMaxima]] = [vector[filaMaxima], vector[pivote]];
    }

    const divisor = matriz[pivote][pivote];

    for (let columna = pivote; columna < 3; columna += 1) {
      matriz[pivote][columna] /= divisor;
    }
    vector[pivote] /= divisor;

    for (let fila = 0; fila < 3; fila += 1) {
      if (fila === pivote) {
        continue;
      }

      const factor = matriz[fila][pivote];

      for (let columna = pivote; columna < 3; columna += 1) {
        matriz[fila][columna] -= factor * matriz[pivote][columna];
      }

      vector[fila] -= factor * vector[pivote];
    }
  }

  return [vector[0], vector[1], vector[2]];
}
