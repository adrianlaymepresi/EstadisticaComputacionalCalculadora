import type { ResultadoMetodoSimpleInspeccion } from "@/modulos/metodo-simple-inspeccion/tipos";
import {
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

export interface ConfiguracionExportacionSimpleInspeccion {
  numeroTabla: string;
  tituloDescriptivo: string;
  datosOriginales: string[][];
  resultado: ResultadoMetodoSimpleInspeccion;
}

export async function exportarExcelSimpleInspeccion(
  configuracion: ConfiguracionExportacionSimpleInspeccion,
  nombreArchivo: string,
): Promise<void> {
  const { libro } = await crearLibroExcel();
  const hojaResumen = libro.addWorksheet("Resumen");
  const hojaDatos = libro.addWorksheet("Datos");

  hojaResumen.mergeCells("A1:H1");
  hojaResumen.getCell("A1").value = `Tabla N° ${configuracion.numeroTabla}`;
  aplicarEstiloTitulo(hojaResumen.getCell("A1"));

  hojaResumen.mergeCells("A2:H2");
  hojaResumen.getCell("A2").value = configuracion.tituloDescriptivo;
  aplicarEstiloTitulo(hojaResumen.getCell("A2"));

  const filasResumen: Array<[string, string | number | boolean]> = [
    ["Metodo", "Simple inspeccion"],
    ["Numero de datos (n)", configuracion.resultado.n],
    [
      "Valores distintos detectados",
      configuracion.resultado.cantidadValoresDistintos,
    ],
    ["Todos los datos son numericos", configuracion.resultado.todosSonNumericos],
    ["Precision numerica detectada", configuracion.resultado.precisionNumerica],
  ];

  filasResumen.forEach(([etiqueta, valor], indice) => {
    const fila = indice + 4;
    hojaResumen.getCell(fila, 1).value = etiqueta;
    hojaResumen.getCell(fila, 2).value = valor as string | number | boolean;
    aplicarEstiloEncabezado(hojaResumen.getCell(fila, 1), "8B4513");
    aplicarEstiloCeldaTabla(hojaResumen.getCell(fila, 2), true);
  });

  const filaTabla = filasResumen.length + 7;
  const encabezados = ["Valor", "Conteo", "fi", "hi", "pi", "Fi", "Hi", "Pi"];
  encabezados.forEach((encabezado, indice) => {
    const celda = hojaResumen.getCell(filaTabla, indice + 1);
    celda.value = encabezado;
    aplicarEstiloEncabezado(celda, "A25508");
  });

  configuracion.resultado.filas.forEach((filaResultado, indice) => {
    const fila = filaTabla + indice + 1;
    const valores = [
      filaResultado.valor,
      filaResultado.conteo,
      filaResultado.fi,
      filaResultado.hi.toFixed(4).replace(".", ","),
      `${filaResultado.pi.toFixed(2).replace(".", ",")}%`,
      filaResultado.Fi,
      filaResultado.Hi.toFixed(4).replace(".", ","),
      `${filaResultado.Pi.toFixed(2).replace(".", ",")}%`,
    ];

    valores.forEach((valor, indiceValor) => {
      const celda = hojaResumen.getCell(fila, indiceValor + 1);
      celda.value = valor;
      aplicarEstiloCeldaTabla(celda, true);
    });
  });

  const filaTotal = filaTabla + configuracion.resultado.filas.length + 1;
  hojaResumen.getCell(filaTotal, 1).value = "TOTAL";
  hojaResumen.getCell(filaTotal, 2).value = "-";
  hojaResumen.getCell(filaTotal, 3).value = configuracion.resultado.n;
  hojaResumen.getCell(filaTotal, 4).value = "1,0000";
  hojaResumen.getCell(filaTotal, 5).value = "100,00%";
  hojaResumen.getCell(filaTotal, 6).value = configuracion.resultado.n;
  hojaResumen.getCell(filaTotal, 7).value = "1,0000";
  hojaResumen.getCell(filaTotal, 8).value = "100,00%";

  for (let columna = 1; columna <= 8; columna += 1) {
    aplicarEstiloCeldaTabla(hojaResumen.getCell(filaTotal, columna), true);
    hojaResumen.getCell(filaTotal, columna).font = { bold: true };
  }

  hojaResumen.columns = [
    { width: 28 },
    { width: 18 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
    { width: 10 },
    { width: 12 },
    { width: 12 },
  ];

  hojaDatos.getCell("A1").value = "Datos originales";
  aplicarEstiloTitulo(hojaDatos.getCell("A1"));

  configuracion.datosOriginales.forEach((fila, indiceFila) => {
    fila.forEach((valor, indiceColumna) => {
      const celda = hojaDatos.getCell(indiceFila + 3, indiceColumna + 1);
      celda.value = valor;
      aplicarEstiloCeldaTabla(celda, true);
    });
  });

  await descargarLibroExcel(libro, nombreArchivo);
}
