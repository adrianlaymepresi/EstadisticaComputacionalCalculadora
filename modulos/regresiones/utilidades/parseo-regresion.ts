import type {
  FilaEntradaRegresion,
  ParRegresion,
  ResultadoValidacionRegresion,
} from "@/modulos/regresiones/tipos";

function esSeparadorDecimalUnico(texto: string, separador: "." | ",") {
  const partes = texto.split(separador);
  return partes.length === 2 && partes[0] !== "" && partes[1] !== "";
}

export function normalizarNumeroRegresion(texto: string): string {
  const limpio = texto.replace(/\s+/g, "").trim();

  if (!limpio) {
    return "";
  }

  const tieneComa = limpio.includes(",");
  const tienePunto = limpio.includes(".");

  if (tieneComa && tienePunto) {
    if (limpio.lastIndexOf(",") > limpio.lastIndexOf(".")) {
      return limpio.replace(/\./g, "").replace(",", ".");
    }

    return limpio.replace(/,/g, "");
  }

  if (tienePunto) {
    if (esSeparadorDecimalUnico(limpio, ".")) {
      return limpio;
    }

    return limpio.replace(/\./g, "");
  }

  if (tieneComa) {
    if (esSeparadorDecimalUnico(limpio, ",")) {
      return limpio.replace(",", ".");
    }

    return limpio.replace(/,/g, "");
  }

  return limpio;
}

export function parsearNumeroRegresion(texto: string): number | null {
  const normalizado = normalizarNumeroRegresion(texto);

  if (!normalizado) {
    return null;
  }

  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) {
    return null;
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

export function construirFilasVaciasRegresion(cantidad: number): FilaEntradaRegresion[] {
  return Array.from({ length: cantidad }, (_, indice) => ({
    id: `regresion-fila-${indice + 1}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    x: "",
    y: "",
  }));
}

export function parsearTextoPegadoRegresion(textoPegado: string): string[][] {
  const lineas = textoPegado
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0);

  if (lineas.length === 0) {
    return [];
  }

  const filasBase = lineas.map((linea) => {
    if (linea.includes("\t")) {
      return linea
        .split("\t")
        .map((celda) => celda.trim())
        .filter((celda) => celda.length > 0);
    }

    if (linea.includes(";")) {
      return linea
        .split(";")
        .map((celda) => celda.trim())
        .filter((celda) => celda.length > 0);
    }

    return linea
      .split(/\s+/)
      .map((celda) => celda.trim())
      .filter((celda) => celda.length > 0);
  });

  if (filasBase.every((fila) => fila.length === 2)) {
    return filasBase;
  }

  const tokens = filasBase.flat();
  const filasAgrupadas: string[][] = [];

  for (let indice = 0; indice < tokens.length; indice += 2) {
    filasAgrupadas.push([tokens[indice] ?? "", tokens[indice + 1] ?? ""]);
  }

  return filasAgrupadas;
}

export function validarParesRegresion(
  filas: FilaEntradaRegresion[],
  minimoPares: number,
  restricciones?: {
    xMayorQueCero?: boolean;
    yMayorQueCero?: boolean;
    xNoTodosIguales?: boolean;
  },
): ResultadoValidacionRegresion {
  const pares: ParRegresion[] = [];
  const observaciones: string[] = [];

  filas.forEach((fila, indice) => {
    const textoX = fila.x.trim();
    const textoY = fila.y.trim();
    const filaVacia = textoX === "" && textoY === "";

    if (filaVacia) {
      return;
    }

    if (textoX === "" || textoY === "") {
      throw new Error(
        `La fila ${indice + 1} debe contener tanto X como Y antes de calcular.`,
      );
    }

    const valorX = parsearNumeroRegresion(textoX);
    const valorY = parsearNumeroRegresion(textoY);

    if (valorX === null || valorY === null) {
      throw new Error(
        `La fila ${indice + 1} contiene datos invalidos. Usa solo numeros, coma decimal o punto decimal.`,
      );
    }

    if (restricciones?.xMayorQueCero && valorX <= 0) {
      throw new Error(
        `La fila ${indice + 1} requiere valores de X mayores que 0 para este modelo.`,
      );
    }

    if (restricciones?.yMayorQueCero && valorY <= 0) {
      throw new Error(
        `La fila ${indice + 1} requiere valores de Y mayores que 0 para este modelo.`,
      );
    }

    pares.push({ x: valorX, y: valorY });
  });

  if (pares.length < minimoPares) {
    throw new Error(
      `Debes ingresar como minimo ${minimoPares} pares completos para esta regresion.`,
    );
  }

  if (restricciones?.xNoTodosIguales) {
    const conjuntoX = new Set(pares.map((par) => par.x));
    if (conjuntoX.size <= 1) {
      throw new Error(
        "Los valores de X no pueden ser todos iguales porque el modelo no se puede ajustar correctamente.",
      );
    }
  }

  if (pares.length >= 2) {
    const xMinimo = Math.min(...pares.map((par) => par.x));
    const xMaximo = Math.max(...pares.map((par) => par.x));
    const yMinimo = Math.min(...pares.map((par) => par.y));
    const yMaximo = Math.max(...pares.map((par) => par.y));
    observaciones.push(
      `Rango X: ${xMinimo} a ${xMaximo}. Rango Y: ${yMinimo} a ${yMaximo}.`,
    );
  }

  return { pares, observaciones };
}
