import { parsearDecimalTexto } from "@/modulos/formulas-segundo-parcial/utils/validar-enteros.util";

export function convertirProbabilidadDesdeEntrada(
  texto: string,
  etiqueta: string,
  modo: "decimal" | "porcentaje",
) {
  const valorBase = parsearDecimalTexto(texto, etiqueta, { minimo: 0 });
  const valor = modo === "porcentaje" ? valorBase / 100 : valorBase;

  if (valor < 0 || valor > 1) {
    throw new Error(`La probabilidad ${etiqueta} debe estar entre 0 y 1.`);
  }

  return valor;
}

export function validarProbabilidadExito(
  valor: number,
  etiqueta: string,
  opciones: {
    permitirCero?: boolean;
    permitirUno?: boolean;
  } = {},
) {
  if (!opciones.permitirCero && valor === 0) {
    throw new Error(`La probabilidad ${etiqueta} no puede ser 0 en esta formula.`);
  }

  if (!opciones.permitirUno && valor === 1) {
    throw new Error(`La probabilidad ${etiqueta} no puede ser 1 en esta formula.`);
  }
}
