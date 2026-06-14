import type {
  CampoPersonalizacionRegresion,
  ConfiguracionRegresion,
  ModoPrecisionRegresion,
  TipoLogaritmoRegresion,
} from "@/modulos/regresiones/tipos";

function limpiarCerosFinales(texto: string) {
  if (!texto.includes(".")) {
    return texto;
  }

  return texto.replace(/\.?0+$/, "");
}

export function redondearValor(
  valor: number,
  cantidadDecimales: number,
): number {
  if (!Number.isFinite(valor)) {
    return valor;
  }

  const factor = 10 ** cantidadDecimales;
  return Math.round((valor + Number.EPSILON) * factor) / factor;
}

export function aplicarPrecisionProceso(
  valor: number,
  precision: ModoPrecisionRegresion,
): number {
  if (precision === "completo") {
    return valor;
  }

  return redondearValor(valor, precision);
}

export function formatearNumeroRegresion(
  valor: number,
  precision: ModoPrecisionRegresion,
): string {
  if (!Number.isFinite(valor)) {
    return "-";
  }

  if (precision === "completo") {
    return limpiarCerosFinales(valor.toFixed(12));
  }

  return valor.toFixed(precision);
}

export function formatearEnteroVisible(valor: number) {
  return Number.isInteger(valor)
    ? `${valor}`
    : limpiarCerosFinales(valor.toFixed(12));
}

export function construirNombreVariableVisible(nombre: string, unidad: string) {
  const nombreLimpio = nombre.trim();
  const unidadLimpia = unidad.trim();

  if (nombreLimpio && unidadLimpia) {
    return `${nombreLimpio} (${unidadLimpia})`;
  }

  if (nombreLimpio) {
    return nombreLimpio;
  }

  return "";
}

export function obtenerNombreVariableXVisible(
  personalizacion: CampoPersonalizacionRegresion,
) {
  return (
    construirNombreVariableVisible(
      personalizacion.nombreVariableX,
      personalizacion.unidadVariableX,
    ) || "Variable independiente X"
  );
}

export function obtenerNombreVariableYVisible(
  personalizacion: CampoPersonalizacionRegresion,
) {
  return (
    construirNombreVariableVisible(
      personalizacion.nombreVariableY,
      personalizacion.unidadVariableY,
    ) || "Variable dependiente Y"
  );
}

export function obtenerDescripcionContexto(
  personalizacion: CampoPersonalizacionRegresion,
) {
  const contexto = personalizacion.contexto.trim();
  return contexto || "un contexto general de analisis";
}

export function construirEcuacionLinealVisible(
  a: number,
  b: number,
  precision: ModoPrecisionRegresion,
) {
  const aVisible = formatearNumeroRegresion(a, precision);
  const bVisible = formatearNumeroRegresion(Math.abs(b), precision);
  const signoB = b >= 0 ? "+" : "-";

  return `Y = ${aVisible} ${signoB} ${bVisible}X`;
}

export function construirEcuacionCuadraticaVisible(
  a: number,
  b: number,
  c: number,
  precision: ModoPrecisionRegresion,
) {
  const aVisible = formatearNumeroRegresion(a, precision);
  const bVisible = formatearNumeroRegresion(Math.abs(b), precision);
  const cVisible = formatearNumeroRegresion(Math.abs(c), precision);
  const signoB = b >= 0 ? "+" : "-";
  const signoC = c >= 0 ? "+" : "-";

  return `Y = ${aVisible} ${signoB} ${bVisible}X ${signoC} ${cVisible}X^2`;
}

export function construirEcuacionExponencialVisible(
  a: number,
  b: number,
  precision: ModoPrecisionRegresion,
  tipoLogaritmo: TipoLogaritmoRegresion,
) {
  const aVisible = formatearNumeroRegresion(a, precision);
  const bVisible = formatearNumeroRegresion(b, precision);

  if (tipoLogaritmo === "ln") {
    return `Y = ${aVisible} * e^(${bVisible}X)`;
  }

  return `Y = ${aVisible} * 10^(${bVisible}X)`;
}

export function construirEcuacionExponencialAlternaVisible(
  a: number,
  b: number,
  precision: ModoPrecisionRegresion,
) {
  const aVisible = formatearNumeroRegresion(a, precision);
  const bVisible = formatearNumeroRegresion(b, precision);

  return `Y = ${aVisible} * e^(${bVisible}X)`;
}

export function construirEcuacionPotencialVisible(
  a: number,
  b: number,
  precision: ModoPrecisionRegresion,
) {
  const aVisible = formatearNumeroRegresion(a, precision);
  const bVisible = formatearNumeroRegresion(b, precision);

  return `Y = ${aVisible} * X^${bVisible}`;
}

export function construirInterpretacionGenerica(
  configuracion: ConfiguracionRegresion,
  personalizacion: CampoPersonalizacionRegresion,
  contenido: string,
) {
  const nombreX = obtenerNombreVariableXVisible(personalizacion);
  const nombreY = obtenerNombreVariableYVisible(personalizacion);
  const contexto = obtenerDescripcionContexto(personalizacion);

  return `${configuracion.titulo}: ${nombreX} actua como variable independiente y ${nombreY} como variable dependiente dentro de ${contexto}. ${contenido}`;
}

export function construirListaDecimales() {
  return Array.from({ length: 10 }, (_, indice) => indice + 1);
}
