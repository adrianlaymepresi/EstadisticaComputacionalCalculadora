import type {
  PrecisionResultado,
  ResultadoFormulaSegundoParcial,
} from "@/modulos/formulas-segundo-parcial/tipos";
import {
  combinacionBigInt,
  permutacionConRepeticionBigInt,
  variacionSinRepeticionBigInt,
} from "@/modulos/formulas-segundo-parcial/utils/combinacion.util";
import {
  describirPrecision,
  formatearBigInt,
  formatearNumero,
} from "@/modulos/formulas-segundo-parcial/utils/formatear-numero.util";
import {
  desarrollarFactorial,
  factorialBigInt,
} from "@/modulos/formulas-segundo-parcial/utils/factorial.util";
import { interpretarCombinatoria } from "@/modulos/formulas-segundo-parcial/services/interpretaciones.service";

function resolverDescripcion(texto: string | undefined, respaldo: string) {
  return texto?.trim() || respaldo;
}

function convertirBigIntANumeroSeguro(valor: bigint) {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function tarjetaDecimalExtra(
  valor: bigint,
  precision: PrecisionResultado,
) {
  const comoNumero = convertirBigIntANumeroSeguro(valor);
  if (comoNumero === null) {
    return null;
  }

  return {
    titulo: `Aproximacion decimal (${describirPrecision(precision)})`,
    valor: formatearNumero(comoNumero, precision),
    detalle: "Apoyo extra cuando el resultado exacto es entero.",
  };
}

export function calcularPermutacionLineal(params: {
  n: number;
  precision: PrecisionResultado;
  descripcionElementos?: string;
}): ResultadoFormulaSegundoParcial {
  const resultado = factorialBigInt(params.n);
  const descripcion = resolverDescripcion(params.descripcionElementos, "elementos");
  const tarjetas = [
    { titulo: "Resultado exacto", valor: formatearBigInt(resultado) },
  ];
  const tarjetaExtra = tarjetaDecimalExtra(resultado, params.precision);
  if (tarjetaExtra) {
    tarjetas.push(tarjetaExtra);
  }

  return {
    tarjetas,
    pasos: [
      { titulo: "Formula general", expresion: "Pn = n!" },
      {
        titulo: "Sustitucion",
        expresion: `P${params.n} = ${params.n}!`,
      },
      {
        titulo: "Desarrollo del factorial",
        expresion: desarrollarFactorial(params.n),
        resultado: formatearBigInt(resultado),
      },
    ],
    interpretacion: interpretarCombinatoria(
      "Hay {resultado} formas distintas de ordenar los {n} {descripcion}.",
      {
        resultado: formatearBigInt(resultado),
        n: params.n,
        descripcion,
      },
    ),
  };
}

export function calcularPermutacionConRepeticion(params: {
  n: number;
  repeticiones: number[];
  precision: PrecisionResultado;
  descripcionElementos?: string;
}): ResultadoFormulaSegundoParcial {
  const resultado = permutacionConRepeticionBigInt(params.n, params.repeticiones);
  const factorialesDenominador =
    params.repeticiones.length > 0
      ? params.repeticiones.map((valor) => `${valor}!`).join(" x ")
      : "1";
  const detalleDenominador =
    params.repeticiones.length > 0
      ? params.repeticiones
          .map((valor) => `${valor}! = ${formatearBigInt(factorialBigInt(valor))}`)
          .join(" | ")
      : "Sin repeticiones registradas, la formula se reduce a n!.";
  const descripcion = resolverDescripcion(params.descripcionElementos, "elementos");
  const tarjetas = [
    { titulo: "Resultado exacto", valor: formatearBigInt(resultado) },
    { titulo: "Factoriales repetidos", valor: factorialesDenominador },
  ];
  const tarjetaExtra = tarjetaDecimalExtra(resultado, params.precision);
  if (tarjetaExtra) {
    tarjetas.push(tarjetaExtra);
  }

  return {
    tarjetas,
    pasos: [
      {
        titulo: "Formula general",
        expresion: "PRn = n! / (n1! x n2! x ... x nk!)",
      },
      {
        titulo: "Sustitucion",
        expresion: `PR${params.n} = ${params.n}! / (${factorialesDenominador})`,
      },
      {
        titulo: "Factoriales usados",
        expresion: `${desarrollarFactorial(params.n)} | ${detalleDenominador}`,
        resultado: formatearBigInt(resultado),
      },
    ],
    interpretacion: interpretarCombinatoria(
      "Hay {resultado} formas distintas de ordenar los {n} {descripcion} considerando las repeticiones indicadas.",
      {
        resultado: formatearBigInt(resultado),
        n: params.n,
        descripcion,
      },
    ),
    observacion:
      params.repeticiones.length === 0
        ? "No se ingresaron repeticiones, por lo que la formula quedo equivalente a n!."
        : undefined,
  };
}

export function calcularPermutacionCircular(params: {
  n: number;
  precision: PrecisionResultado;
  descripcionElementos?: string;
}): ResultadoFormulaSegundoParcial {
  const resultado = factorialBigInt(params.n - 1);
  const descripcion = resolverDescripcion(params.descripcionElementos, "elementos");
  const tarjetas = [
    { titulo: "Resultado exacto", valor: formatearBigInt(resultado) },
    { titulo: "Pivote fijo", valor: "1 posicion fija" },
  ];
  const tarjetaExtra = tarjetaDecimalExtra(resultado, params.precision);
  if (tarjetaExtra) {
    tarjetas.push(tarjetaExtra);
  }

  return {
    tarjetas,
    pasos: [
      { titulo: "Formula general", expresion: "Pcn = (n - 1)!" },
      {
        titulo: "Sustitucion",
        expresion: `Pc${params.n} = (${params.n} - 1)! = ${params.n - 1}!`,
      },
      {
        titulo: "Desarrollo del factorial",
        expresion: desarrollarFactorial(params.n - 1),
        resultado: formatearBigInt(resultado),
      },
    ],
    interpretacion: interpretarCombinatoria(
      "Hay {resultado} formas distintas de ordenar circularmente los {n} {descripcion}, considerando una posicion fija.",
      {
        resultado: formatearBigInt(resultado),
        n: params.n,
        descripcion,
      },
    ),
  };
}

export function calcularVariacionSinRepeticion(params: {
  n: number;
  r: number;
  precision: PrecisionResultado;
  descripcionElementos?: string;
}): ResultadoFormulaSegundoParcial {
  const resultado = variacionSinRepeticionBigInt(params.n, params.r);
  const descripcion = resolverDescripcion(params.descripcionElementos, "elementos");
  const tarjetas = [
    { titulo: "Resultado exacto", valor: formatearBigInt(resultado) },
    { titulo: "Termino (n-r)", valor: `${params.n - params.r}` },
  ];
  const tarjetaExtra = tarjetaDecimalExtra(resultado, params.precision);
  if (tarjetaExtra) {
    tarjetas.push(tarjetaExtra);
  }

  return {
    tarjetas,
    pasos: [
      { titulo: "Formula general", expresion: "V(n,r) = n! / (n - r)!" },
      {
        titulo: "Sustitucion",
        expresion: `V(${params.n},${params.r}) = ${params.n}! / (${params.n - params.r})!`,
      },
      {
        titulo: "Desarrollo",
        expresion: `${desarrollarFactorial(params.n)} / ${desarrollarFactorial(params.n - params.r)}`,
        resultado: formatearBigInt(resultado),
      },
    ],
    interpretacion: interpretarCombinatoria(
      "Hay {resultado} variaciones sin repeticion posibles al ordenar {r} {descripcion} tomados de {n} disponibles.",
      {
        resultado: formatearBigInt(resultado),
        r: params.r,
        n: params.n,
        descripcion,
      },
    ),
  };
}

export function calcularVariacionConRepeticion(params: {
  n: number;
  r: number;
  precision: PrecisionResultado;
  descripcionElementos?: string;
}): ResultadoFormulaSegundoParcial {
  const resultado = BigInt(params.n) ** BigInt(params.r);
  const descripcion = resolverDescripcion(params.descripcionElementos, "elementos");
  const tarjetas = [
    { titulo: "Resultado exacto", valor: formatearBigInt(resultado) },
    { titulo: "Potencia usada", valor: `${params.n}^${params.r}` },
  ];
  const tarjetaExtra = tarjetaDecimalExtra(resultado, params.precision);
  if (tarjetaExtra) {
    tarjetas.push(tarjetaExtra);
  }

  return {
    tarjetas,
    pasos: [
      { titulo: "Formula general", expresion: "V'(n,r) = n^r" },
      {
        titulo: "Sustitucion",
        expresion: `V'(${params.n},${params.r}) = ${params.n}^${params.r}`,
      },
      {
        titulo: "Desarrollo",
        expresion: `${params.n} repetido ${params.r} veces como factor`,
        resultado: formatearBigInt(resultado),
      },
    ],
    interpretacion: interpretarCombinatoria(
      "Hay {resultado} variaciones con repeticion posibles usando {n} {descripcion} en {r} posiciones.",
      {
        resultado: formatearBigInt(resultado),
        n: params.n,
        r: params.r,
        descripcion,
      },
    ),
  };
}

export function calcularCombinacion(params: {
  n: number;
  r: number;
  precision: PrecisionResultado;
  descripcionElementos?: string;
}): ResultadoFormulaSegundoParcial {
  const resultado = combinacionBigInt(params.n, params.r);
  const descripcion = resolverDescripcion(params.descripcionElementos, "elementos");
  const tarjetas = [
    { titulo: "Resultado exacto", valor: formatearBigInt(resultado) },
    { titulo: "Termino (n-r)", valor: `${params.n - params.r}` },
  ];
  const tarjetaExtra = tarjetaDecimalExtra(resultado, params.precision);
  if (tarjetaExtra) {
    tarjetas.push(tarjetaExtra);
  }

  return {
    tarjetas,
    pasos: [
      { titulo: "Formula general", expresion: "C(n,r) = n! / (r! x (n-r)!)" },
      {
        titulo: "Sustitucion",
        expresion: `C(${params.n},${params.r}) = ${params.n}! / (${params.r}! x ${params.n - params.r}!)`,
      },
      {
        titulo: "Desarrollo",
        expresion: `${desarrollarFactorial(params.n)} / (${desarrollarFactorial(params.r)} x ${desarrollarFactorial(params.n - params.r)})`,
        resultado: formatearBigInt(resultado),
      },
    ],
    interpretacion: interpretarCombinatoria(
      "Hay {resultado} combinaciones posibles al seleccionar {r} {descripcion} de un total de {n}, sin importar el orden.",
      {
        resultado: formatearBigInt(resultado),
        r: params.r,
        n: params.n,
        descripcion,
      },
    ),
  };
}
