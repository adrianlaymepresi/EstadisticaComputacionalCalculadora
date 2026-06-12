export function convertirPuntoAComa(texto: string) {
  return texto.replace(".", ",");
}

export function formatearNumeroResultado(
  valor: number,
  decimales: number | "todos",
) {
  if (!Number.isFinite(valor)) {
    return "-";
  }

  if (decimales === "todos") {
    const texto = valor.toFixed(12).replace(/\.?0+$/, "");
    return convertirPuntoAComa(texto === "-0" ? "0" : texto);
  }

  return convertirPuntoAComa(valor.toFixed(decimales));
}

export function formatearNumeroConPrecisionFija(
  valor: number,
  precision: number,
) {
  return convertirPuntoAComa(valor.toFixed(Math.max(precision, 0)));
}

export function formatearPorcentajeResultado(
  valor: number,
  decimales: number | "todos",
) {
  return `${formatearNumeroResultado(valor, decimales)}%`;
}

export function formatearNumeroCompacto(valor: number) {
  const texto = valor.toFixed(12).replace(/\.?0+$/, "");
  return convertirPuntoAComa(texto === "-0" ? "0" : texto);
}
