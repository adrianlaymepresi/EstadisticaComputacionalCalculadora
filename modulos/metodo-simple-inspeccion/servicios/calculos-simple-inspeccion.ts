import type {
  FilaMetodoSimpleInspeccion,
  ResultadoMetodoSimpleInspeccion,
} from "@/modulos/metodo-simple-inspeccion/tipos";

const MAXIMO_VALORES_DISTINTOS = 10;

function normalizarNumero(texto: string): string {
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
    const partes = limpio.split(".");

    if (partes.length > 2) {
      return limpio.replace(/\./g, "");
    }

    if (partes.length === 2 && partes[1].length === 3) {
      return limpio.replace(/\./g, "");
    }

    return limpio;
  }

  if (tieneComa) {
    const partes = limpio.split(",");

    if (partes.length > 2) {
      return limpio.replace(/,/g, "");
    }

    if (partes.length === 2 && partes[1].length === 3) {
      return limpio.replace(/,/g, "");
    }

    return limpio.replace(",", ".");
  }

  return limpio;
}

function parsearNumero(texto: string): number | null {
  const normalizado = normalizarNumero(texto);

  if (!normalizado) {
    return null;
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

function contarDecimalesDesdeTexto(texto: string): number {
  const normalizado = normalizarNumero(texto);
  const partes = normalizado.split(".");
  return partes[1]?.length ?? 0;
}

function aRomano(valor: number): string {
  if (!Number.isInteger(valor) || valor <= 0 || valor >= 4000) {
    return `${valor}`;
  }

  const simbolos: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let restante = valor;
  let resultado = "";

  simbolos.forEach(([magnitud, simbolo]) => {
    while (restante >= magnitud) {
      resultado += simbolo;
      restante -= magnitud;
    }
  });

  return resultado;
}

interface GrupoTemporal {
  valor: string;
  fi: number;
  valorNumerico: number | null;
}

export function calcularMetodoSimpleInspeccion(
  datosCrudos: string[],
): ResultadoMetodoSimpleInspeccion {
  const datos = datosCrudos
    .map((dato) => dato.trim())
    .filter((dato) => dato !== "");

  if (datos.length === 0) {
    throw new Error("Debes ingresar al menos un dato para construir la tabla.");
  }

  const todosSonNumericos = datos.every((dato) => parsearNumero(dato) !== null);
  const precisionNumerica = todosSonNumericos
    ? datos.reduce(
        (maximo, dato) => Math.max(maximo, contarDecimalesDesdeTexto(dato)),
        0,
      )
    : 0;

  const grupos = new Map<string, GrupoTemporal>();

  datos.forEach((dato) => {
    if (todosSonNumericos) {
      const valorNumerico = parsearNumero(dato) as number;
      const clave = `numero:${valorNumerico}`;
      const grupoExistente = grupos.get(clave);

      if (grupoExistente) {
        grupoExistente.fi += 1;
        return;
      }

      grupos.set(clave, {
        valor:
          precisionNumerica > 0
            ? valorNumerico.toFixed(precisionNumerica).replace(".", ",")
            : `${valorNumerico}`,
        fi: 1,
        valorNumerico,
      });
      return;
    }

    const clave = `texto:${dato.toLocaleLowerCase()}`;
    const grupoExistente = grupos.get(clave);

    if (grupoExistente) {
      grupoExistente.fi += 1;
      return;
    }

    grupos.set(clave, {
      valor: dato,
      fi: 1,
      valorNumerico: null,
    });
  });

  const gruposOrdenados = Array.from(grupos.values());

  if (todosSonNumericos) {
    gruposOrdenados.sort(
      (grupoA, grupoB) =>
        (grupoA.valorNumerico ?? 0) - (grupoB.valorNumerico ?? 0),
    );
  }

  if (gruposOrdenados.length > MAXIMO_VALORES_DISTINTOS) {
    throw new Error(
      "La tecnica de simple inspeccion solo admite hasta 10 datos distintos.",
    );
  }

  let acumuladoFi = 0;
  let acumuladoHi = 0;
  let acumuladoPi = 0;

  const filas: FilaMetodoSimpleInspeccion[] = gruposOrdenados.map((grupo) => {
    const hi = grupo.fi / datos.length;
    const pi = hi * 100;
    acumuladoFi += grupo.fi;
    acumuladoHi += hi;
    acumuladoPi += pi;

    return {
      valor: grupo.valor,
      conteo: aRomano(grupo.fi),
      fi: grupo.fi,
      hi,
      pi,
      Fi: acumuladoFi,
      Hi: acumuladoHi,
      Pi: acumuladoPi,
    };
  });

  return {
    n: datos.length,
    cantidadValoresDistintos: gruposOrdenados.length,
    todosSonNumericos,
    precisionNumerica,
    filas,
  };
}
