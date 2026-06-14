export function contarDecimalesSignificativos(
  textoNormalizado: string,
): number {
  const partes = textoNormalizado.split(".");
  const decimales = partes[1]?.replace(/0+$/, "") ?? "";
  return decimales.length;
}
