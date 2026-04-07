import type { FilaDiagramaDispersion } from "@/modulos/diagrama-dispersion/tipos";
import {
  agregarCanvasComoImagen,
  aplicarColorDeMuestra,
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

interface ConfiguracionExportacionDispersion {
  datos: FilaDiagramaDispersion[];
  tituloTabla: string;
  nombreVariableX: string;
  nombreVariableY: string;
}

export async function exportarExcelDispersion(
  configuracion: ConfiguracionExportacionDispersion,
  nombreArchivo: string,
  canvas?: HTMLCanvasElement,
): Promise<void> {
  const { libro } = await crearLibroExcel();
  const hoja = libro.addWorksheet("Dispersion");
  const totalColumnas = Math.max(2, configuracion.datos.length + 1);

  hoja.mergeCells(1, 1, 1, totalColumnas);
  hoja.getCell("A1").value = configuracion.tituloTabla;
  aplicarEstiloTitulo(hoja.getCell("A1"));
  hoja.getRow(1).height = 26;

  hoja.getCell(3, 1).value = "Dato";
  aplicarEstiloEncabezado(hoja.getCell(3, 1), "4F6228");

  configuracion.datos.forEach((_, indice) => {
    const celda = hoja.getCell(3, indice + 2);
    celda.value = indice + 1;
    aplicarEstiloEncabezado(celda, "4F6228");
  });

  hoja.getCell(4, 1).value = configuracion.nombreVariableX;
  hoja.getCell(5, 1).value = configuracion.nombreVariableY;
  hoja.getCell(6, 1).value = "Color";

  [4, 5, 6].forEach((fila) => {
    const celda = hoja.getCell(fila, 1);
    aplicarEstiloEncabezado(celda, "4F6228");
  });

  configuracion.datos.forEach((fila, indice) => {
    const columna = indice + 2;
    hoja.getCell(4, columna).value = fila.x;
    hoja.getCell(5, columna).value = fila.y;
    hoja.getCell(6, columna).value = fila.color || "";

    aplicarEstiloCeldaTabla(hoja.getCell(4, columna), true);
    aplicarEstiloCeldaTabla(hoja.getCell(5, columna), true);
    aplicarEstiloCeldaTabla(hoja.getCell(6, columna), true);

    if (fila.color) {
      aplicarColorDeMuestra(hoja.getCell(6, columna), fila.color);
    }
  });

  hoja.columns = Array.from({ length: totalColumnas }, (_, indice) => ({
    width: indice === 0 ? 28 : 12,
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
