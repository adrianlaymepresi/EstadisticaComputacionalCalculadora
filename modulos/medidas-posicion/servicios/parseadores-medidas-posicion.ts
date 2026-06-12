import type {
  FilaTablaClasificadaEntrada,
  FilaTablaClasificadaValidada,
  TablaClasificadaExtendida,
} from "@/modulos/medidas-posicion/tipos";

export function crearMatriz(filas: number, columnas: number): string[][] {
  return Array.from({ length: filas }, () =>
    Array.from({ length: columnas }, () => ""),
  );
}

export function ajustarMatriz(
  matrizActual: string[][],
  filas: number,
  columnas: number,
) {
  return Array.from({ length: filas }, (_, indiceFila) =>
    Array.from(
      { length: columnas },
      (_, indiceColumna) => matrizActual[indiceFila]?.[indiceColumna] ?? "",
    ),
  );
}

export function normalizarNumeroTexto(texto: string): string {
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

  if (tieneComa) {
    const partes = limpio.split(",");

    if (partes.length === 2 && partes[1].length === 3) {
      return limpio.replace(/,/g, "");
    }

    if (partes.length > 2) {
      return limpio.replace(/,/g, "");
    }

    return limpio.replace(",", ".");
  }

  if (tienePunto) {
    const partes = limpio.split(".");

    if (partes.length === 2 && partes[1].length === 3) {
      return limpio.replace(/\./g, "");
    }

    if (partes.length > 2) {
      return limpio.replace(/\./g, "");
    }
  }

  return limpio;
}

export function parsearNumeroDesdeTexto(texto: string) {
  const normalizado = normalizarNumeroTexto(texto);

  if (!normalizado) {
    return null;
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

export function contarDecimalesDesdeTexto(texto: string) {
  const normalizado = normalizarNumeroTexto(texto);
  const partes = normalizado.split(".");
  return partes[1]?.length ?? 0;
}

export function parsearTablaDesdePortapapeles(textoPegado: string) {
  return textoPegado
    .trim()
    .split(/\r?\n/)
    .map((linea) => linea.split("\t").map((celda) => celda.trim()))
    .filter((fila) => fila.some((celda) => celda !== ""));
}

export function convertirTextoPegadoAMatrizNoClasificada(textoPegado: string) {
  const tablaPlegable = parsearTablaDesdePortapapeles(textoPegado);

  if (
    tablaPlegable.length > 1 ||
    (tablaPlegable.length === 1 && tablaPlegable[0].length > 1)
  ) {
    return tablaPlegable;
  }

  const textoNormalizado = textoPegado
    .replace(/\r/g, "\n")
    .replace(/\t/g, ";")
    .replace(/\n/g, ";");

  let tokens = textoNormalizado
    .split(";")
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length <= 1) {
    tokens = textoPegado
      .split(/\s{2,}/)
      .map((token) => token.trim())
      .filter(Boolean);
  }

  if (tokens.length === 0) {
    return [];
  }

  return [tokens];
}

export function extraerDatosNoClasificadosDesdeMatriz(matriz: string[][]) {
  const tokens = matriz.flat().map((token) => token.trim()).filter(Boolean);
  const valoresNumericos: number[] = [];
  const textosInvalidos: string[] = [];

  tokens.forEach((token) => {
    const valor = parsearNumeroDesdeTexto(token);

    if (valor === null) {
      textosInvalidos.push(token);
      return;
    }

    valoresNumericos.push(valor);
  });

  return {
    tokens,
    valoresNumericos,
    textosInvalidos,
  };
}

export function validarFilasClasificadas(
  filasEntrada: FilaTablaClasificadaEntrada[],
) {
  const filasLlenas = filasEntrada.filter(
    (fila) => fila.li.trim() || fila.ls.trim() || fila.fi.trim(),
  );

  if (filasLlenas.length === 0) {
    throw new Error("Debes ingresar al menos una fila clasificada.");
  }

  const filasValidadas: FilaTablaClasificadaValidada[] = filasLlenas.map(
    (fila, indice) => {
      if (!fila.li.trim() || !fila.ls.trim() || !fila.fi.trim()) {
        throw new Error(
          `La fila ${indice + 1} debe completar Li, Ls y fi antes de calcular.`,
        );
      }

      const li = parsearNumeroDesdeTexto(fila.li);
      const ls = parsearNumeroDesdeTexto(fila.ls);
      const fi = parsearNumeroDesdeTexto(fila.fi);

      if (li === null || ls === null || fi === null) {
        throw new Error(
          `La fila ${indice + 1} contiene valores no numericos validos.`,
        );
      }

      if (!Number.isInteger(fi) || fi <= 0) {
        throw new Error(
          `La frecuencia fi de la fila ${indice + 1} debe ser un entero positivo.`,
        );
      }

      if (ls <= li) {
        throw new Error(
          `En la fila ${indice + 1} el limite superior debe ser mayor que el inferior.`,
        );
      }

      return {
        li,
        ls,
        fi,
        textoLi: fila.li.trim(),
        textoLs: fila.ls.trim(),
      };
    },
  );

  filasValidadas.forEach((filaActual, indice) => {
    if (indice === 0) {
      return;
    }

    const filaAnterior = filasValidadas[indice - 1];

    if (filaActual.li < filaAnterior.li) {
      throw new Error(
        "Las clases deben estar ordenadas de menor a mayor segun Li.",
      );
    }

    if (filaActual.li < filaAnterior.ls) {
      throw new Error(
        "Las clases no deben traslaparse. Revisa Li y Ls de las filas ingresadas.",
      );
    }
  });

  return filasValidadas;
}

export function crearTablaClasificadaExtendida(
  filasValidadas: FilaTablaClasificadaValidada[],
): TablaClasificadaExtendida {
  const precisionIntervalos = filasValidadas.reduce(
    (maximo, fila) =>
      Math.max(
        maximo,
        contarDecimalesDesdeTexto(fila.textoLi),
        contarDecimalesDesdeTexto(fila.textoLs),
      ),
    0,
  );

  const n = filasValidadas.reduce((acumulado, fila) => acumulado + fila.fi, 0);
  let acumuladoFi = 0;

  return {
    n,
    precisionIntervalos,
    filas: filasValidadas.map((fila, indice) => {
      const xi = (fila.li + fila.ls) / 2;
      const hi = fila.fi / n;
      const pi = hi * 100;
      acumuladoFi += fila.fi;
      const Hi = acumuladoFi / n;

      return {
        indice: indice + 1,
        Li: fila.li,
        Ls: fila.ls,
        xi,
        fi: fila.fi,
        hi,
        pi,
        Fi: acumuladoFi,
        Hi,
        Pi: Hi * 100,
        amplitud: fila.ls - fila.li,
      };
    }),
  };
}

export function convertirTextoPegadoAFilasClasificadas(textoPegado: string) {
  const tabla = parsearTablaDesdePortapapeles(textoPegado);

  if (tabla.length === 0) {
    return [];
  }

  const primeraFila = tabla[0].slice(0, 3).map((celda) => celda.toLowerCase());
  const tieneEncabezados =
    primeraFila.includes("li") ||
    primeraFila.includes("ls") ||
    primeraFila.includes("fi");

  const filasUtiles = tieneEncabezados ? tabla.slice(1) : tabla;

  return filasUtiles
    .filter((fila) => fila.some((celda) => celda.trim() !== ""))
    .map((fila) => ({
      li: fila[0]?.trim() ?? "",
      ls: fila[1]?.trim() ?? "",
      fi: fila[2]?.trim() ?? "",
    }));
}
