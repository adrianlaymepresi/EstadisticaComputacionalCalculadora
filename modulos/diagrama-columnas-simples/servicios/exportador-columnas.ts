import type { FilaColumnaSimple } from "@/modulos/diagrama-columnas-simples/tipos";
import {
  agregarCanvasComoImagen,
  aplicarColorDeMuestra,
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

interface ConfiguracionExportacionColumnas {
  datos: FilaColumnaSimple[];
  nombreVariable: string;
  tituloTabla: string;
}

function calcularTotal(datos: FilaColumnaSimple[]): number {
  return datos.reduce((acumulado, fila) => acumulado + fila.valor, 0);
}

function formatearPorcentaje(valor: number): string {
  return `${valor.toFixed(2).replace(".", ",")}%`;
}

export async function exportarExcelColumnasSimples(
  configuracion: ConfiguracionExportacionColumnas,
  nombreArchivo: string,
  canvas?: HTMLCanvasElement,
): Promise<void> {
  const total = calcularTotal(configuracion.datos);
  const { libro } = await crearLibroExcel();
  const hoja = libro.addWorksheet("Columnas simples");
  const encabezados = [configuracion.nombreVariable, "fi", "pi", "Color", "Muestra"];

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
    const porcentaje = total > 0 ? (fila.valor / total) * 100 : 0;
    const filaExcel = hoja.getRow(numeroFila);

    filaExcel.getCell(1).value = fila.categoria;
    filaExcel.getCell(2).value = fila.valor;
    filaExcel.getCell(3).value = formatearPorcentaje(porcentaje);
    filaExcel.getCell(4).value = fila.color || "";
    filaExcel.getCell(5).value = "";

    aplicarEstiloCeldaTabla(filaExcel.getCell(1));
    aplicarEstiloCeldaTabla(filaExcel.getCell(2), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(3), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(4), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(5), true);

    if (fila.color) {
      aplicarColorDeMuestra(filaExcel.getCell(5), fila.color);
    }
  });

  const filaTotal = hoja.getRow(configuracion.datos.length + 4);
  filaTotal.getCell(1).value = "TOTAL";
  filaTotal.getCell(2).value = total;
  filaTotal.getCell(3).value = formatearPorcentaje(total > 0 ? 100 : 0);
  filaTotal.getCell(4).value = "";
  filaTotal.getCell(5).value = "";
  for (let indice = 1; indice <= 5; indice += 1) {
    aplicarEstiloCeldaTabla(filaTotal.getCell(indice), indice !== 1);
    filaTotal.getCell(indice).font = { bold: true };
  }

  hoja.columns = [
    { width: 28 },
    { width: 12 },
    { width: 14 },
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
