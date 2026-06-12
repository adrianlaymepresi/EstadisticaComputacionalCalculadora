import type { ModoPrecisionResultado } from "@/modulos/formulas-tema-1/tipos";

export interface Racional {
  numerador: bigint;
  denominador: bigint;
}

function absolutoBigInt(valor: bigint) {
  return valor < 0n ? -valor : valor;
}

function mcd(a: bigint, b: bigint): bigint {
  let x = absolutoBigInt(a);
  let y = absolutoBigInt(b);

  while (y !== 0n) {
    const resto = x % y;
    x = y;
    y = resto;
  }

  return x === 0n ? 1n : x;
}

function normalizarRacional(
  numerador: bigint,
  denominador: bigint,
): Racional {
  if (denominador === 0n) {
    throw new Error("No se puede dividir entre cero.");
  }

  const signo = denominador < 0n ? -1n : 1n;
  const divisor = mcd(numerador, denominador);

  return {
    numerador: (numerador / divisor) * signo,
    denominador: absolutoBigInt(denominador / divisor),
  };
}

export function crearRacional(
  numerador: bigint,
  denominador: bigint,
): Racional {
  return normalizarRacional(numerador, denominador);
}

export function crearRacionalDesdeEntero(valor: number): Racional {
  return crearRacional(BigInt(valor), 1n);
}

export function normalizarTextoNumerico(texto: string): string {
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

export function parsearRacional(texto: string): Racional | null {
  const normalizado = normalizarTextoNumerico(texto);

  if (!normalizado) {
    return null;
  }

  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) {
    return null;
  }

  const esNegativo = normalizado.startsWith("-");
  const textoSinSigno = esNegativo ? normalizado.slice(1) : normalizado;
  const [parteEntera, parteDecimal = ""] = textoSinSigno.split(".");
  const escala = 10n ** BigInt(parteDecimal.length);
  const enteroCompleto = BigInt(`${parteEntera}${parteDecimal}`);
  const numerador = esNegativo ? -enteroCompleto : enteroCompleto;

  return crearRacional(numerador, escala);
}

export function sumarRacionales(a: Racional, b: Racional): Racional {
  return crearRacional(
    a.numerador * b.denominador + b.numerador * a.denominador,
    a.denominador * b.denominador,
  );
}

export function restarRacionales(a: Racional, b: Racional): Racional {
  return crearRacional(
    a.numerador * b.denominador - b.numerador * a.denominador,
    a.denominador * b.denominador,
  );
}

export function multiplicarRacionales(a: Racional, b: Racional): Racional {
  return crearRacional(
    a.numerador * b.numerador,
    a.denominador * b.denominador,
  );
}

export function dividirRacionales(a: Racional, b: Racional): Racional {
  return crearRacional(
    a.numerador * b.denominador,
    a.denominador * b.numerador,
  );
}

export function valorAbsolutoRacional(valor: Racional): Racional {
  return crearRacional(absolutoBigInt(valor.numerador), valor.denominador);
}

export function compararRacionales(a: Racional, b: Racional): number {
  const izquierda = a.numerador * b.denominador;
  const derecha = b.numerador * a.denominador;

  if (izquierda < derecha) {
    return -1;
  }

  if (izquierda > derecha) {
    return 1;
  }

  return 0;
}

export function esEnteroRacional(valor: Racional): boolean {
  return valor.denominador === 1n;
}

export function racionalACadenaFraccion(valor: Racional): string {
  const numerador = valor.numerador.toString();
  const denominador = valor.denominador.toString();

  if (valor.denominador === 1n) {
    return numerador;
  }

  return `${numerador}/${denominador}`;
}

function aplicarRedondeoDecimal(
  parteEntera: bigint,
  decimales: number[],
  siguienteDigito: number,
): { parteEntera: bigint; decimales: number[] } {
  const redondearHaciaArriba = siguienteDigito >= 5;

  if (!redondearHaciaArriba) {
    return { parteEntera, decimales };
  }

  const digitos = [...decimales];

  for (let indice = digitos.length - 1; indice >= 0; indice -= 1) {
    if (digitos[indice] < 9) {
      digitos[indice] += 1;
      return { parteEntera, decimales: digitos };
    }

    digitos[indice] = 0;
  }

  return { parteEntera: parteEntera + 1n, decimales: digitos };
}

export function racionalADecimalConPrecision(
  valor: Racional,
  decimales: number,
): string {
  const precision = Math.max(0, decimales);
  const signo = valor.numerador < 0n ? "-" : "";
  const numerador = absolutoBigInt(valor.numerador);
  const denominador = valor.denominador;

  let parteEntera = numerador / denominador;
  let resto = numerador % denominador;
  const digitos: number[] = [];

  for (let indice = 0; indice < precision + 1; indice += 1) {
    resto *= 10n;
    digitos.push(Number(resto / denominador));
    resto %= denominador;
  }

  const digitosMostrados = digitos.slice(0, precision);
  const siguienteDigito = digitos[precision] ?? 0;
  const redondeado = aplicarRedondeoDecimal(
    parteEntera,
    digitosMostrados,
    siguienteDigito,
  );
  parteEntera = redondeado.parteEntera;

  if (precision === 0) {
    return `${signo}${parteEntera.toString()}`;
  }

  return `${signo}${parteEntera.toString()},${redondeado.decimales.join("")}`;
}

export function racionalADecimalCompleto(
  valor: Racional,
  maximoDecimales = 15,
): string {
  const signo = valor.numerador < 0n ? "-" : "";
  const numerador = absolutoBigInt(valor.numerador);
  const denominador = valor.denominador;
  const parteEntera = numerador / denominador;
  let resto = numerador % denominador;

  if (resto === 0n) {
    return `${signo}${parteEntera.toString()}`;
  }

  const digitos: number[] = [];

  while (resto !== 0n && digitos.length < maximoDecimales) {
    resto *= 10n;
    digitos.push(Number(resto / denominador));
    resto %= denominador;
  }

  while (digitos.length > 0 && digitos[digitos.length - 1] === 0) {
    digitos.pop();
  }

  const sufijo = resto !== 0n ? "..." : "";

  return `${signo}${parteEntera.toString()},${digitos.join("")}${sufijo}`;
}

export function formatearRacionalSegunModo(
  valor: Racional,
  modo: ModoPrecisionResultado,
  decimalesPersonalizados: number,
): string {
  if (modo === "completo") {
    return racionalADecimalCompleto(valor);
  }

  if (modo === "personalizado") {
    return racionalADecimalConPrecision(valor, decimalesPersonalizados);
  }

  return racionalADecimalConPrecision(valor, 2);
}

export function describirPrecision(
  modo: ModoPrecisionResultado,
  decimalesPersonalizados: number,
): string {
  if (modo === "completo") {
    return "decimal completo";
  }

  if (modo === "personalizado") {
    return `${decimalesPersonalizados} decimales`;
  }

  return "2 decimales";
}
