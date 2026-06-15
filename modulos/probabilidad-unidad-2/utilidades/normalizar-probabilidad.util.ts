import {
  parsearDecimalTexto,
  parsearEnteroTexto,
} from "@/modulos/formulas-segundo-parcial/utils/validar-enteros.util";
import type { ModoValorProbabilidad } from "@/modulos/probabilidad-unidad-2/tipos";

export function normalizarNombreEvento(
  texto: string,
  respaldo: string,
) {
  const textoLimpio = texto.trim();
  return textoLimpio || respaldo;
}

export function parsearValorProbabilidadSegunModo(
  texto: string,
  etiqueta: string,
  modo: ModoValorProbabilidad,
  opciones: {
    permitirCero?: boolean;
    permitirUno?: boolean;
    permitirVacio?: boolean;
  } = {},
) {
  if (modo === "cantidades") {
    return parsearEnteroTexto(texto, etiqueta, {
      minimo: opciones.permitirCero ? 0 : 1,
    });
  }

  const valorBase = parsearDecimalTexto(texto, etiqueta, {
    minimo: 0,
  });
  const probabilidad = modo === "porcentaje" ? valorBase / 100 : valorBase;

  if (!opciones.permitirCero && probabilidad === 0) {
    throw new Error(`El campo ${etiqueta} debe ser mayor a 0.`);
  }

  if (!opciones.permitirUno && probabilidad === 1) {
    throw new Error(`El campo ${etiqueta} debe ser menor a 1.`);
  }

  if (probabilidad < 0 || probabilidad > 1) {
    if (modo === "porcentaje") {
      throw new Error(`El campo ${etiqueta} debe estar entre 0% y 100%.`);
    }

    throw new Error(`El campo ${etiqueta} debe estar entre 0 y 1.`);
  }

  return probabilidad;
}

export function parsearUniversoSegunModo(
  texto: string,
  modo: ModoValorProbabilidad,
) {
  if (modo !== "cantidades") {
    return 1;
  }

  return parsearEnteroTexto(texto, "Total del universo", {
    minimo: 1,
  });
}

export function dividirPorUniversoSiCorresponde(
  valor: number,
  universo: number,
  modo: ModoValorProbabilidad,
) {
  return modo === "cantidades" ? valor / universo : valor;
}

export function asegurarSumaCercana(
  valores: number[],
  objetivo: number,
  etiqueta: string,
  tolerancia = 1e-8,
) {
  const suma = valores.reduce((acumulado, valor) => acumulado + valor, 0);

  if (Math.abs(suma - objetivo) > tolerancia) {
    throw new Error(`${etiqueta} debe sumar ${objetivo}.`);
  }
}

export function limpiarNegativoCercano(valor: number, tolerancia = 1e-10) {
  if (valor < 0 && Math.abs(valor) <= tolerancia) {
    return 0;
  }

  return valor;
}

export function validarNoNegativo(
  valor: number,
  etiqueta: string,
  tolerancia = 1e-10,
) {
  const valorCorregido = limpiarNegativoCercano(valor, tolerancia);

  if (valorCorregido < 0) {
    throw new Error(
      `Los datos ingresados no son consistentes porque la region ${etiqueta} queda negativa.`,
    );
  }

  return valorCorregido;
}

export function parsearListaElementos(texto: string, etiqueta: string) {
  const elementos = texto
    .split(/[\n,;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!elementos.length) {
    throw new Error(`Debes completar el campo ${etiqueta}.`);
  }

  const vistos = new Set<string>();
  for (const elemento of elementos) {
    const clave = elemento.toLowerCase();
    if (vistos.has(clave)) {
      throw new Error(
        `El campo ${etiqueta} no debe contener elementos repetidos: ${elemento}.`,
      );
    }

    vistos.add(clave);
  }

  return elementos;
}

export function validarSubconjunto(
  espacioMuestral: string[],
  evento: string[],
  etiquetaEvento: string,
) {
  const espacioNormalizado = new Map(
    espacioMuestral.map((item) => [item.toLowerCase(), item]),
  );

  for (const elemento of evento) {
    if (!espacioNormalizado.has(elemento.toLowerCase())) {
      throw new Error(
        `El elemento ${elemento} de ${etiquetaEvento} no pertenece al espacio muestral.`,
      );
    }
  }
}
