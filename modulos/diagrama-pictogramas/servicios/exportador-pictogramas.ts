import type { FilaDiagramaPictogramas } from "@/modulos/diagrama-pictogramas/tipos";
import {
  agregarCanvasComoImagen,
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

interface ConfiguracionExportacionPictogramas {
  datos: FilaDiagramaPictogramas[];
  tituloTabla: string;
  nombreVariableCualitativa: string;
  nombreVariableCuantitativa: string;
  imagenGeneral?: string | null;
}

function calcularTotal(datos: FilaDiagramaPictogramas[]): number {
  return datos.reduce((acumulado, fila) => acumulado + fila.valor, 0);
}

function formatearPorcentaje(valor: number): string {
  return `${valor.toFixed(2).replace(".", ",")}%`;
}

function crearMiniaturaDesdeFuente(fuente: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const imagen = new Image();

    imagen.onload = () => {
      const anchoOriginal = imagen.naturalWidth || imagen.width;
      const altoOriginal = imagen.naturalHeight || imagen.height;
      const ladoMaximo = 96;
      const escala = Math.min(
        1,
        ladoMaximo / Math.max(anchoOriginal || 1, altoOriginal || 1),
      );
      const ancho = Math.max(1, Math.round(anchoOriginal * escala));
      const alto = Math.max(1, Math.round(altoOriginal * escala));
      const canvas = document.createElement("canvas");
      const contexto = canvas.getContext("2d");

      if (!contexto) {
        reject(new Error("No se pudo preparar la miniatura."));
        return;
      }

      canvas.width = ancho;
      canvas.height = alto;
      contexto.clearRect(0, 0, ancho, alto);
      contexto.drawImage(imagen, 0, 0, ancho, alto);
      resolve(canvas.toDataURL("image/png"));
    };

    imagen.onerror = () =>
      reject(new Error("No se pudo cargar la imagen para la exportacion."));
    imagen.src = fuente;
  });
}

async function agregarMiniaturaEnCelda(
  libro: Awaited<ReturnType<typeof crearLibroExcel>>["libro"],
  hoja: ReturnType<Awaited<ReturnType<typeof crearLibroExcel>>["libro"]["addWorksheet"]>,
  fuente: string,
  fila: number,
  columna: number,
) {
  const miniaturaPng = await crearMiniaturaDesdeFuente(fuente);
  const imagenId = libro.addImage({
    base64: miniaturaPng,
    extension: "png",
  });

  hoja.getRow(fila).height = Math.max(hoja.getRow(fila).height ?? 18, 38);
  hoja.addImage(imagenId, {
    tl: { col: columna - 1 + 0.18, row: fila - 1 + 0.12 },
    ext: { width: 32, height: 32 },
    editAs: "oneCell",
  });
}

export async function exportarExcelPictogramas(
  configuracion: ConfiguracionExportacionPictogramas,
  nombreArchivo: string,
  canvas?: HTMLCanvasElement,
): Promise<void> {
  const total = calcularTotal(configuracion.datos);
  const { libro } = await crearLibroExcel();
  const hoja = libro.addWorksheet("Pictogramas");
  const encabezados = [
    configuracion.nombreVariableCualitativa,
    configuracion.nombreVariableCuantitativa,
    "pi",
    "Imagen",
    "Vista",
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

  for (const [indice, fila] of configuracion.datos.entries()) {
    const numeroFila = 4 + indice;
    const porcentaje = total > 0 ? (fila.valor / total) * 100 : 0;
    const filaExcel = hoja.getRow(numeroFila);
    const fuenteImagen = fila.imagenIndividual || configuracion.imagenGeneral || "";

    filaExcel.getCell(1).value = fila.categoria;
    filaExcel.getCell(2).value = fila.valor;
    filaExcel.getCell(3).value = formatearPorcentaje(porcentaje);
    filaExcel.getCell(4).value = fila.imagenIndividual ? "Personalizada" : "General";
    filaExcel.getCell(5).value = fuenteImagen ? "" : "Sin imagen";

    aplicarEstiloCeldaTabla(filaExcel.getCell(1));
    aplicarEstiloCeldaTabla(filaExcel.getCell(2), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(3), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(4), true);
    aplicarEstiloCeldaTabla(filaExcel.getCell(5), true);

    if (fuenteImagen) {
      try {
        await agregarMiniaturaEnCelda(libro, hoja, fuenteImagen, numeroFila, 5);
      } catch (error) {
        console.error("No se pudo insertar la miniatura del pictograma:", error);
        filaExcel.getCell(5).value = "No disponible";
      }
    }
  }

  const filaTotal = hoja.getRow(configuracion.datos.length + 4);
  filaTotal.getCell(1).value = "TOTAL";
  filaTotal.getCell(2).value = total;
  filaTotal.getCell(3).value = formatearPorcentaje(total > 0 ? 100 : 0);
  filaTotal.getCell(4).value = "";
  filaTotal.getCell(5).value = "";

  for (let indice = 1; indice <= encabezados.length; indice += 1) {
    aplicarEstiloCeldaTabla(filaTotal.getCell(indice), indice !== 1);
    filaTotal.getCell(indice).font = { bold: true };
  }

  hoja.columns = [
    { width: 30 },
    { width: 14 },
    { width: 14 },
    { width: 16 },
    { width: 14 },
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
