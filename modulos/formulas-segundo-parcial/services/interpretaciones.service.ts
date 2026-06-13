import {
  formatearNumero,
  formatearPorcentaje,
} from "@/modulos/formulas-segundo-parcial/utils/formatear-numero.util";
import type { PrecisionResultado, TipoProbabilidad } from "@/modulos/formulas-segundo-parcial/tipos";

function resolverTexto(
  textos: Record<string, string>,
  id: string,
  respaldo: string,
) {
  return textos[id]?.trim() || respaldo;
}

export function interpretarCombinatoria(
  plantilla: string,
  reemplazos: Record<string, string | number>,
) {
  return Object.entries(reemplazos).reduce(
    (texto, [clave, valor]) => texto.replaceAll(`{${clave}}`, String(valor)),
    plantilla,
  );
}

export function interpretarDistribucion(
  tipoProbabilidad: TipoProbabilidad,
  probabilidad: number,
  precision: PrecisionResultado,
  mensajes: Record<TipoProbabilidad, string>,
  reemplazos: Record<string, string | number>,
) {
  const porcentaje = formatearPorcentaje(probabilidad, precision);
  const decimal = formatearNumero(probabilidad, precision);

  const textoBase = mensajes[tipoProbabilidad] ?? mensajes.exactamente;
  const conPorcentaje = textoBase
    .replaceAll("{probabilidad}", probabilidad.toString())
    .replaceAll("{porcentaje}", porcentaje)
    .replaceAll("{decimal}", decimal);

  return Object.entries(reemplazos).reduce(
    (texto, [clave, valor]) => texto.replaceAll(`{${clave}}`, String(valor)),
    conPorcentaje,
  );
}

export function resolverContextoProbabilidad(
  textos: Record<string, string>,
  claves: {
    nombreVariable?: string;
    exito?: string;
    fracaso?: string;
    ensayo?: string;
    contexto?: string;
    poblacion?: string;
    muestra?: string;
    unidadTiempo?: string;
  } = {},
) {
  return {
    nombreVariable: resolverTexto(textos, claves.nombreVariable ?? "nombre-variable", "X"),
    exito: resolverTexto(textos, claves.exito ?? "descripcion-exito", "exitos"),
    fracaso: resolverTexto(textos, claves.fracaso ?? "descripcion-fracaso", "fracasos"),
    ensayo: resolverTexto(textos, claves.ensayo ?? "descripcion-ensayo", "ensayos"),
    contexto: resolverTexto(textos, claves.contexto ?? "descripcion-contexto", "el contexto indicado"),
    poblacion: resolverTexto(textos, claves.poblacion ?? "descripcion-poblacion", "poblacion"),
    muestra: resolverTexto(textos, claves.muestra ?? "descripcion-muestra", "muestra"),
    unidadTiempo: resolverTexto(textos, claves.unidadTiempo ?? "unidad-tiempo", "intervalo"),
  };
}
