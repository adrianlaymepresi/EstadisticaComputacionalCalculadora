import type { ConfiguracionDiagrama } from "@/modulos/diagrama-burbujas/tipos";
import {
  agregarCanvasComoImagen,
  aplicarColorDeMuestra,
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

export const exportarComoImagen = async (
  canvas: HTMLCanvasElement,
  nombreArchivo: string,
): Promise<void> => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve();
        return;
      }

      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `${nombreArchivo}.png`;
      enlace.click();
      URL.revokeObjectURL(url);
      resolve();
    });
  });
};

export const exportarComoPDF = async (
  canvas: HTMLCanvasElement,
  nombreArchivo: string,
  configuracion: ConfiguracionDiagrama,
): Promise<void> => {
  void configuracion;

  const { jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  const imagenData = canvas.toDataURL("image/png");
  pdf.addImage(imagenData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(`${nombreArchivo}.pdf`);
};

export const exportarComoExcel = async (
  configuracion: ConfiguracionDiagrama,
  nombreArchivo: string,
  canvas?: HTMLCanvasElement,
): Promise<void> => {
  const { libro } = await crearLibroExcel();
  const hoja = libro.addWorksheet("Diagrama");
  const incluirColor = configuracion.datos.some((fila) => Boolean(fila.color));
  const encabezados = [
    configuracion.configuracionColumnas.nombreX,
    configuracion.configuracionColumnas.nombreY,
    configuracion.configuracionColumnas.nombreTamanio,
    ...(incluirColor
      ? [
          configuracion.configuracionColumnas.nombreColor || "Color aplicado",
          "Muestra",
        ]
      : []),
  ];

  hoja.mergeCells(1, 1, 1, encabezados.length);
  hoja.getCell("A1").value = "Diagrama de Burbujas";
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
    filaExcel.getCell(1).value = fila.x;
    filaExcel.getCell(2).value = fila.y;
    filaExcel.getCell(3).value = fila.tamanio;

    aplicarEstiloCeldaTabla(filaExcel.getCell(1), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(2), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(3), true);

    if (incluirColor) {
      filaExcel.getCell(4).value = fila.color || "";
      filaExcel.getCell(5).value = "";
      aplicarEstiloCeldaTabla(filaExcel.getCell(4), true);
      aplicarEstiloCeldaTabla(filaExcel.getCell(5), true);

      if (fila.color) {
        aplicarColorDeMuestra(filaExcel.getCell(5), fila.color);
      }
    }
  });

  hoja.columns = encabezados.map((_, indice) => ({
    width: indice === 0 ? 18 : 16,
  }));

  if (canvas) {
    const filaImagen = configuracion.datos.length + 7;
    hoja.mergeCells(filaImagen, 1, filaImagen, encabezados.length);
    hoja.getCell(filaImagen, 1).value = "Vista previa del diagrama";
    aplicarEstiloTitulo(hoja.getCell(filaImagen, 1));
    agregarCanvasComoImagen(libro, hoja, canvas, filaImagen + 1, encabezados.length);
  }

  await descargarLibroExcel(libro, nombreArchivo);
};

export const normalizarNombreArchivo = (nombre: string): string => {
  return nombre.trim().replace(/[^a-z0-9]/gi, "_").toLowerCase();
};
