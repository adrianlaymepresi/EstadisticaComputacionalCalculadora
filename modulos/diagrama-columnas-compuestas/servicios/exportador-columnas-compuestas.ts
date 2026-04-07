import type { FilaColumnaCompuesta } from "@/modulos/diagrama-columnas-compuestas/tipos";
import {
  agregarCanvasComoImagen,
  aplicarColorDeMuestra,
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

interface ConfiguracionExportacionCompuesta {
  datos: FilaColumnaCompuesta[];
  tituloTabla: string;
  nombreVariablePrincipal: string;
  nombreVariableSecundaria: string;
  nombreSerieA: string;
  nombreSerieB: string;
}

export async function exportarExcelColumnasCompuestas(
  configuracion: ConfiguracionExportacionCompuesta,
  nombreArchivo: string,
  canvas?: HTMLCanvasElement,
): Promise<void> {
  const { libro } = await crearLibroExcel();
  const hoja = libro.addWorksheet("Columnas compuestas");
  const totalSerieA = configuracion.datos.reduce(
    (acumulado, fila) => acumulado + fila.valorSerieA,
    0,
  );
  const totalSerieB = configuracion.datos.reduce(
    (acumulado, fila) => acumulado + fila.valorSerieB,
    0,
  );

  hoja.mergeCells(1, 1, 1, 5);
  hoja.getCell("A1").value = configuracion.tituloTabla;
  aplicarEstiloTitulo(hoja.getCell("A1"));
  hoja.getRow(1).height = 26;

  hoja.mergeCells(3, 2, 3, 3);
  hoja.getCell("B3").value = configuracion.nombreVariableSecundaria;
  aplicarEstiloEncabezado(hoja.getCell("B3"));
  aplicarEstiloEncabezado(hoja.getCell("C3"));

  hoja.getCell("A4").value = configuracion.nombreVariablePrincipal;
  hoja.getCell("B4").value = configuracion.nombreSerieA;
  hoja.getCell("C4").value = configuracion.nombreSerieB;
  hoja.getCell("D4").value = "Color A";
  hoja.getCell("E4").value = "Color B";

  ["A4", "B4", "C4", "D4", "E4"].forEach((referencia) => {
    aplicarEstiloEncabezado(hoja.getCell(referencia));
  });

  configuracion.datos.forEach((fila, indice) => {
    const numeroFila = 5 + indice;
    const filaExcel = hoja.getRow(numeroFila);
    filaExcel.getCell(1).value = fila.categoria;
    filaExcel.getCell(2).value = fila.valorSerieA;
    filaExcel.getCell(3).value = fila.valorSerieB;
    filaExcel.getCell(4).value = fila.colorSerieA || "";
    filaExcel.getCell(5).value = fila.colorSerieB || "";

    for (let columna = 1; columna <= 5; columna += 1) {
      aplicarEstiloCeldaTabla(filaExcel.getCell(columna), columna !== 1);
    }

    if (fila.colorSerieA) {
      aplicarColorDeMuestra(filaExcel.getCell(4), fila.colorSerieA);
    }

    if (fila.colorSerieB) {
      aplicarColorDeMuestra(filaExcel.getCell(5), fila.colorSerieB);
    }
  });

  const filaTotal = hoja.getRow(configuracion.datos.length + 5);
  filaTotal.getCell(1).value = "TOTAL";
  filaTotal.getCell(2).value = totalSerieA;
  filaTotal.getCell(3).value = totalSerieB;
  filaTotal.getCell(4).value = "";
  filaTotal.getCell(5).value = "";
  for (let columna = 1; columna <= 5; columna += 1) {
    aplicarEstiloCeldaTabla(filaTotal.getCell(columna), columna !== 1);
    filaTotal.getCell(columna).font = { bold: true };
  }

  hoja.columns = [
    { width: 26 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
    { width: 14 },
  ];

  if (canvas) {
    const filaImagen = configuracion.datos.length + 8;
    hoja.mergeCells(filaImagen, 1, filaImagen, 5);
    hoja.getCell(filaImagen, 1).value = "Vista previa del diagrama";
    aplicarEstiloTitulo(hoja.getCell(filaImagen, 1));
    agregarCanvasComoImagen(libro, hoja, canvas, filaImagen + 1, 5);
  }

  await descargarLibroExcel(libro, nombreArchivo);
}
