import type { FilaDiagramaLineal } from "@/modulos/diagrama-lineal/tipos";
import {
  agregarCanvasComoImagen,
  aplicarColorDeMuestra,
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

interface ConfiguracionExportacionLineal {
  datos: FilaDiagramaLineal[];
  tituloTabla: string;
  nombreVariableX: string;
  nombreVariableY: string;
  colorLinea: string;
}

export async function exportarExcelLineal(
  configuracion: ConfiguracionExportacionLineal,
  nombreArchivo: string,
  canvas?: HTMLCanvasElement,
): Promise<void> {
  const { libro } = await crearLibroExcel();
  const hoja = libro.addWorksheet("Lineal");
  const totalColumnas = Math.max(2, configuracion.datos.length + 1);

  hoja.mergeCells(1, 1, 1, totalColumnas);
  hoja.getCell("A1").value = configuracion.tituloTabla;
  aplicarEstiloTitulo(hoja.getCell("A1"));
  hoja.getRow(1).height = 26;

  hoja.getCell(3, 1).value = configuracion.nombreVariableX;
  hoja.getCell(4, 1).value = configuracion.nombreVariableY;
  hoja.getCell(5, 1).value = "Color de punto";
  hoja.getCell(6, 1).value = "Color de linea";

  [3, 4, 5, 6].forEach((fila) => {
    aplicarEstiloEncabezado(hoja.getCell(fila, 1), "4B3B68");
  });

  configuracion.datos.forEach((fila, indice) => {
    const columna = indice + 2;

    hoja.getCell(3, columna).value = fila.categoria;
    hoja.getCell(4, columna).value = fila.valor;
    hoja.getCell(5, columna).value = fila.color || "";

    aplicarEstiloCeldaTabla(hoja.getCell(3, columna), true);
    aplicarEstiloCeldaTabla(hoja.getCell(4, columna), true);
    aplicarEstiloCeldaTabla(hoja.getCell(5, columna), true);

    if (fila.color) {
      aplicarColorDeMuestra(hoja.getCell(5, columna), fila.color);
    }
  });

  hoja.mergeCells(6, 2, 6, totalColumnas);
  hoja.getCell(6, 2).value = configuracion.colorLinea;
  aplicarEstiloCeldaTabla(hoja.getCell(6, 2), true);
  aplicarColorDeMuestra(hoja.getCell(6, 2), configuracion.colorLinea);

  hoja.columns = Array.from({ length: totalColumnas }, (_, indice) => ({
    width: indice === 0 ? 24 : 16,
  }));

  if (canvas) {
    const filaImagen = 9;
    hoja.mergeCells(filaImagen, 1, filaImagen, totalColumnas);
    hoja.getCell(filaImagen, 1).value = "Vista previa del diagrama";
    aplicarEstiloTitulo(hoja.getCell(filaImagen, 1));
    agregarCanvasComoImagen(libro, hoja, canvas, filaImagen + 1, totalColumnas);
  }

  await descargarLibroExcel(libro, nombreArchivo);
}
