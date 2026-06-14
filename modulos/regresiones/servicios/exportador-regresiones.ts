import {
  agregarCanvasComoImagen,
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";
import type { ResultadoCalculoRegresion } from "@/modulos/regresiones/tipos";

interface DatosExportacionRegresion {
  numeroTabla: string;
  tituloDescriptivo: string;
  resultado: ResultadoCalculoRegresion;
  canvasGrafica: HTMLCanvasElement;
}

export async function exportarExcelRegresion(
  datos: DatosExportacionRegresion,
  nombreArchivo: string,
) {
  const { libro } = await crearLibroExcel();
  const hoja = libro.addWorksheet("Regresion");

  hoja.columns = [
    { width: 20 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ];

  hoja.mergeCells("A1:G1");
  const celdaTitulo = hoja.getCell("A1");
  celdaTitulo.value = datos.resultado.titulo;
  aplicarEstiloTitulo(celdaTitulo);

  hoja.mergeCells("A2:G2");
  hoja.getCell("A2").value = `Tabla No. ${datos.numeroTabla}`;
  hoja.getCell("A2").alignment = { horizontal: "center" };
  hoja.getCell("A2").font = { bold: true, size: 14 };

  hoja.mergeCells("A3:G3");
  hoja.getCell("A3").value = datos.tituloDescriptivo;
  hoja.getCell("A3").alignment = {
    horizontal: "center",
    wrapText: true,
  };

  hoja.getCell("A5").value = "Datos originales";
  hoja.getCell("A5").font = { bold: true, size: 13, color: { argb: "1E3932" } };

  ["X", "Y"].forEach((encabezado, indice) => {
    const celda = hoja.getCell(6, indice + 1);
    celda.value = encabezado;
    aplicarEstiloEncabezado(celda);
  });

  datos.resultado.paresOriginales.forEach((par, indice) => {
    const fila = 7 + indice;
    hoja.getCell(fila, 1).value = par.x;
    hoja.getCell(fila, 2).value = par.y;
    aplicarEstiloCeldaTabla(hoja.getCell(fila, 1), true);
    aplicarEstiloCeldaTabla(hoja.getCell(fila, 2), true);
  });

  let filaActual = 8 + datos.resultado.paresOriginales.length;
  hoja.getCell(filaActual, 1).value = "Tabla de calculo";
  hoja.getCell(filaActual, 1).font = {
    bold: true,
    size: 13,
    color: { argb: "1E3932" },
  };
  filaActual += 1;

  datos.resultado.tablaCalculo.columnas.forEach((encabezado, indice) => {
    const celda = hoja.getCell(filaActual, indice + 1);
    celda.value = encabezado;
    aplicarEstiloEncabezado(celda);
  });

  filaActual += 1;

  datos.resultado.tablaCalculo.filas.forEach((fila) => {
    fila.valores.forEach((valor, indice) => {
      const celda = hoja.getCell(filaActual, indice + 1);
      celda.value = `${valor}`;
      aplicarEstiloCeldaTabla(celda, true);
    });
    filaActual += 1;
  });

  filaActual += 1;
  hoja.getCell(filaActual, 1).value = "Sumatorias";
  hoja.getCell(filaActual, 1).font = {
    bold: true,
    size: 13,
    color: { argb: "1E3932" },
  };
  filaActual += 1;

  ["Concepto", "Valor"].forEach((encabezado, indice) => {
    const celda = hoja.getCell(filaActual, indice + 1);
    celda.value = encabezado;
    aplicarEstiloEncabezado(celda);
  });
  filaActual += 1;

  datos.resultado.sumatorias.forEach((sumatoria) => {
    hoja.getCell(filaActual, 1).value = sumatoria.etiqueta;
    hoja.getCell(filaActual, 2).value = sumatoria.valorVisible;
    aplicarEstiloCeldaTabla(hoja.getCell(filaActual, 1));
    aplicarEstiloCeldaTabla(hoja.getCell(filaActual, 2), true);
    filaActual += 1;
  });

  filaActual += 1;
  hoja.getCell(filaActual, 1).value = "Coeficientes";
  hoja.getCell(filaActual, 1).font = {
    bold: true,
    size: 13,
    color: { argb: "1E3932" },
  };
  filaActual += 1;

  ["Simbolo", "Valor"].forEach((encabezado, indice) => {
    const celda = hoja.getCell(filaActual, indice + 1);
    celda.value = encabezado;
    aplicarEstiloEncabezado(celda);
  });
  filaActual += 1;

  datos.resultado.coeficientes.forEach((coeficiente) => {
    hoja.getCell(filaActual, 1).value = coeficiente.simbolo;
    hoja.getCell(filaActual, 2).value = coeficiente.valorVisible;
    aplicarEstiloCeldaTabla(hoja.getCell(filaActual, 1), true);
    aplicarEstiloCeldaTabla(hoja.getCell(filaActual, 2), true);
    filaActual += 1;
  });

  filaActual += 1;
  hoja.getCell(filaActual, 1).value = "Ecuacion final";
  hoja.getCell(filaActual, 1).font = {
    bold: true,
    size: 13,
    color: { argb: "1E3932" },
  };
  hoja.mergeCells(filaActual, 2, filaActual, 7);
  hoja.getCell(filaActual, 2).value = datos.resultado.ecuacionFinal;
  filaActual += 1;

  if (datos.resultado.ecuacionAlterna) {
    hoja.getCell(filaActual, 1).value = "Ecuacion alterna";
    hoja.mergeCells(filaActual, 2, filaActual, 7);
    hoja.getCell(filaActual, 2).value = datos.resultado.ecuacionAlterna;
    filaActual += 1;
  }

  filaActual += 1;
  hoja.getCell(filaActual, 1).value = "Interpretacion";
  hoja.getCell(filaActual, 1).font = {
    bold: true,
    size: 13,
    color: { argb: "1E3932" },
  };
  hoja.mergeCells(filaActual, 2, filaActual + 1, 7);
  hoja.getCell(filaActual, 2).value = datos.resultado.interpretacion;
  hoja.getCell(filaActual, 2).alignment = {
    wrapText: true,
    vertical: "top",
  };
  filaActual += 3;

  if (datos.resultado.estimaciones.length > 0) {
    hoja.getCell(filaActual, 1).value = "Estimaciones";
    hoja.getCell(filaActual, 1).font = {
      bold: true,
      size: 13,
      color: { argb: "1E3932" },
    };
    filaActual += 1;

    ["Tipo", "Entrada", "Resultado", "Detalle"].forEach((encabezado, indice) => {
      const celda = hoja.getCell(filaActual, indice + 1);
      celda.value = encabezado;
      aplicarEstiloEncabezado(celda);
    });
    filaActual += 1;

    datos.resultado.estimaciones.forEach((estimacion) => {
      hoja.getCell(filaActual, 1).value = estimacion.titulo;
      hoja.getCell(filaActual, 2).value = estimacion.entrada;
      hoja.getCell(filaActual, 3).value = estimacion.resultadoVisible;
      hoja.getCell(filaActual, 4).value = estimacion.detalle;

      for (let columna = 1; columna <= 4; columna += 1) {
        aplicarEstiloCeldaTabla(hoja.getCell(filaActual, columna));
      }

      filaActual += 1;
    });
  }

  filaActual += 1;
  hoja.getCell(filaActual, 1).value = "Grafica de regresion";
  hoja.getCell(filaActual, 1).font = {
    bold: true,
    size: 13,
    color: { argb: "1E3932" },
  };
  filaActual += 1;

  agregarCanvasComoImagen(libro, hoja, datos.canvasGrafica, filaActual, 7);

  await descargarLibroExcel(libro, nombreArchivo);
}
