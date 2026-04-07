import type { FilaDiagramaBarras } from "@/modulos/diagrama-barras/tipos";
import {
  agregarCanvasComoImagen,
  aplicarColorDeMuestra,
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

interface ConfiguracionExportacionBarras {
  datos: FilaDiagramaBarras[];
  nombreVariable: string;
  nombreSerie: string;
  tituloTabla: string;
}

function calcularTotal(datos: FilaDiagramaBarras[]): number {
  return datos.reduce((acumulado, fila) => acumulado + fila.valor, 0);
}

export async function exportarExcelBarras(
  configuracion: ConfiguracionExportacionBarras,
  nombreArchivo: string,
  canvas?: HTMLCanvasElement,
): Promise<void> {
  const total = calcularTotal(configuracion.datos);
  const { libro } = await crearLibroExcel();
  const hoja = libro.addWorksheet("Diagrama de barras");
  const encabezados = [
    configuracion.nombreVariable,
    configuracion.nombreSerie,
    "Color",
    "Muestra",
  ];

  hoja.mergeCells(1, 1, 1, encabezados.length);
  hoja.getCell("A1").value = configuracion.tituloTabla;
  aplicarEstiloTitulo(hoja.getCell("A1"));
  hoja.getRow(1).height = 26;

  encabezados.forEach((encabezado, indice) => {
    const celda = hoja.getCell(3, indice + 1);
    celda.value = encabezado;
    aplicarEstiloEncabezado(celda);
  });

  configuracion.datos.forEach((fila, indice) => {
    const numeroFila = 4 + indice;
    const filaExcel = hoja.getRow(numeroFila);

    filaExcel.getCell(1).value = fila.categoria;
    filaExcel.getCell(2).value = fila.valor;
    filaExcel.getCell(3).value = fila.color || "";
    filaExcel.getCell(4).value = "";

    aplicarEstiloCeldaTabla(filaExcel.getCell(1));
    aplicarEstiloCeldaTabla(filaExcel.getCell(2), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(3), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(4), true);

    if (fila.color) {
      aplicarColorDeMuestra(filaExcel.getCell(4), fila.color);
    }
  });

  const filaTotal = hoja.getRow(configuracion.datos.length + 4);
  filaTotal.getCell(1).value = "TOTAL";
  filaTotal.getCell(2).value = total;
  filaTotal.getCell(3).value = "";
  filaTotal.getCell(4).value = "";
  for (let indice = 1; indice <= 4; indice += 1) {
    aplicarEstiloCeldaTabla(filaTotal.getCell(indice), indice !== 1);
    filaTotal.getCell(indice).font = { bold: true };
  }

  hoja.columns = [
    { width: 30 },
    { width: 18 },
    { width: 16 },
    { width: 12 },
  ];

  if (canvas) {
    const filaImagen = configuracion.datos.length + 7;
    hoja.mergeCells(filaImagen, 1, filaImagen, encabezados.length);
    hoja.getCell(filaImagen, 1).value = "Vista previa del diagrama";
    aplicarEstiloTitulo(hoja.getCell(filaImagen, 1));
    agregarCanvasComoImagen(libro, hoja, canvas, filaImagen + 1, encabezados.length);
  }

  await descargarLibroExcel(libro, nombreArchivo);
}
