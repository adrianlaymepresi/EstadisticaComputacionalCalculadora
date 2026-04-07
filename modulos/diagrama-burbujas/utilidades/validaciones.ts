export const validarNumeroFilas = (numero: number): boolean => {
  return numero >= 3 && numero <= 20;
};

export const validarNombreColumna = (nombre: string): boolean => {
  return nombre.trim().length > 0;
};

export const parsearDatosTabla = (datos: string): string[][] => {
  const lineas = datos.trim().split("\n");
  return lineas.map((linea) => linea.split("\t").map((celda) => celda.trim()));
};
