import type { ResultadoCalculoMedidasPosicion } from "@/modulos/medidas-posicion/tipos";
import {
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

export interface ConfiguracionExportacionMedidasPosicion {
  numeroTabla: string;
  tituloDescriptivo: string;
  medidaTitulo: string;
  tipoDatos: string;
  resultado: ResultadoCalculoMedidasPosicion;
  matrizNoClasificada: string[][];
  filasClasificadas: Array<{
    li: string;
    ls: string;
    fi: string;
  }>;
}

export async function exportarExcelMedidasPosicion(
  configuracion: ConfiguracionExportacionMedidasPosicion,
  nombreArchivo: string,
) {
  const { libro } = await crearLibroExcel();
  const hojaResumen = libro.addWorksheet("Resumen");
  const hojaDatos = libro.addWorksheet("Datos");

  hojaResumen.mergeCells("A1:F1");
  hojaResumen.getCell("A1").value = `Tabla N° ${configuracion.numeroTabla}`;
  aplicarEstiloTitulo(hojaResumen.getCell("A1"));

  hojaResumen.mergeCells("A2:F2");
  hojaResumen.getCell("A2").value = configuracion.tituloDescriptivo;
  aplicarEstiloTitulo(hojaResumen.getCell("A2"));

  hojaResumen.getCell("A4").value = "Modulo";
  aplicarEstiloEncabezado(hojaResumen.getCell("A4"), "8B4513");
  hojaResumen.getCell("B4").value = configuracion.medidaTitulo;
  aplicarEstiloCeldaTabla(hojaResumen.getCell("B4"), false);

  hojaResumen.getCell("A5").value = "Tipo de datos";
  aplicarEstiloEncabezado(hojaResumen.getCell("A5"), "8B4513");
  hojaResumen.getCell("B5").value = configuracion.tipoDatos;
  aplicarEstiloCeldaTabla(hojaResumen.getCell("B5"), false);

  let filaActual = 7;

  if (configuracion.resultado.tipo === "todos") {
    const encabezados = ["Medida", "Resultado", "Observacion"];

    encabezados.forEach((encabezado, indice) => {
      const celda = hojaResumen.getCell(filaActual, indice + 1);
      celda.value = encabezado;
      aplicarEstiloEncabezado(celda, "A25508");
    });

    configuracion.resultado.detalle.resumen.forEach((item, indice) => {
      const fila = filaActual + indice + 1;
      [item.medida, item.resultado, item.observacion].forEach((valor, columna) => {
        const celda = hojaResumen.getCell(fila, columna + 1);
        celda.value = valor;
        aplicarEstiloCeldaTabla(celda, columna === 1);
      });
    });

    const filaObservacion = filaActual + configuracion.resultado.detalle.resumen.length + 2;
    hojaResumen.getCell(filaObservacion, 1).value = "Observacion general";
    aplicarEstiloEncabezado(hojaResumen.getCell(filaObservacion, 1), "8B4513");
    hojaResumen.mergeCells(filaObservacion, 2, filaObservacion, 6);
    hojaResumen.getCell(filaObservacion, 2).value =
      configuracion.resultado.detalle.observacionGeneral;
    aplicarEstiloCeldaTabla(hojaResumen.getCell(filaObservacion, 2), false);
  } else {
    hojaResumen.getCell(filaActual, 1).value = "Resultado";
    aplicarEstiloEncabezado(hojaResumen.getCell(filaActual, 1), "A25508");
    hojaResumen.getCell(filaActual, 2).value =
      configuracion.resultado.detalle.valorPrincipal;
    aplicarEstiloCeldaTabla(hojaResumen.getCell(filaActual, 2), true);

    hojaResumen.getCell(filaActual + 1, 1).value = "Observacion";
    aplicarEstiloEncabezado(hojaResumen.getCell(filaActual + 1, 1), "8B4513");
    hojaResumen.mergeCells(filaActual + 1, 2, filaActual + 1, 6);
    hojaResumen.getCell(filaActual + 1, 2).value =
      configuracion.resultado.detalle.observacion;
    aplicarEstiloCeldaTabla(hojaResumen.getCell(filaActual + 1, 2), false);

    hojaResumen.getCell(filaActual + 2, 1).value = "Interpretacion";
    aplicarEstiloEncabezado(hojaResumen.getCell(filaActual + 2, 1), "8B4513");
    hojaResumen.mergeCells(filaActual + 2, 2, filaActual + 2, 6);
    hojaResumen.getCell(filaActual + 2, 2).value =
      configuracion.resultado.detalle.interpretacion ?? "-";
    aplicarEstiloCeldaTabla(hojaResumen.getCell(filaActual + 2, 2), false);

    filaActual += 5;

    if (configuracion.resultado.detalle.pasos.length > 0) {
      const encabezadosPasos = ["Paso", "Descripcion", "Expresion", "Resultado"];

      encabezadosPasos.forEach((encabezado, indice) => {
        const celda = hojaResumen.getCell(filaActual, indice + 1);
        celda.value = encabezado;
        aplicarEstiloEncabezado(celda, "A25508");
      });

      configuracion.resultado.detalle.pasos.forEach((paso, indice) => {
        const fila = filaActual + indice + 1;
        const valores = [
          paso.titulo,
          paso.descripcion ?? "",
          paso.expresion ?? "",
          paso.resultado ?? "",
        ];

        valores.forEach((valor, columna) => {
          const celda = hojaResumen.getCell(fila, columna + 1);
          celda.value = valor;
          aplicarEstiloCeldaTabla(celda, false);
        });
      });

      filaActual += configuracion.resultado.detalle.pasos.length + 3;
    }

    configuracion.resultado.detalle.tablas.forEach((tabla) => {
      hojaResumen.getCell(filaActual, 1).value = tabla.titulo;
      aplicarEstiloTitulo(hojaResumen.getCell(filaActual, 1));
      filaActual += 1;

      tabla.columnas.forEach((encabezado, indice) => {
        const celda = hojaResumen.getCell(filaActual, indice + 1);
        celda.value = encabezado;
        aplicarEstiloEncabezado(celda, "A25508");
      });

      tabla.filas.forEach((filaTabla, indiceFila) => {
        const fila = filaActual + indiceFila + 1;
        filaTabla.forEach((valor, indiceColumna) => {
          const celda = hojaResumen.getCell(fila, indiceColumna + 1);
          celda.value = valor;
          aplicarEstiloCeldaTabla(celda, true);
        });
      });

      filaActual += tabla.filas.length + 3;
    });
  }

  hojaResumen.columns = [
    { width: 24 },
    { width: 28 },
    { width: 28 },
    { width: 24 },
    { width: 18 },
    { width: 18 },
  ];

  hojaDatos.getCell("A1").value = "Datos originales";
  aplicarEstiloTitulo(hojaDatos.getCell("A1"));

  if (configuracion.tipoDatos === "No clasificados") {
    configuracion.matrizNoClasificada.forEach((fila, indiceFila) => {
      fila.forEach((valor, indiceColumna) => {
        const celda = hojaDatos.getCell(indiceFila + 3, indiceColumna + 1);
        celda.value = valor;
        aplicarEstiloCeldaTabla(celda, true);
      });
    });
  } else {
    const encabezados = ["Li", "Ls", "fi"];

    encabezados.forEach((encabezado, indice) => {
      const celda = hojaDatos.getCell(3, indice + 1);
      celda.value = encabezado;
      aplicarEstiloEncabezado(celda, "A25508");
    });

    configuracion.filasClasificadas.forEach((fila, indiceFila) => {
      [fila.li, fila.ls, fila.fi].forEach((valor, indiceColumna) => {
        const celda = hojaDatos.getCell(indiceFila + 4, indiceColumna + 1);
        celda.value = valor;
        aplicarEstiloCeldaTabla(celda, true);
      });
    });
  }

  await descargarLibroExcel(libro, nombreArchivo);
}
