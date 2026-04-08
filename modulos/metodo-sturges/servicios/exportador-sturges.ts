import type { ConfiguracionExportacionTablaAgrupada } from "@/modulos/tablas-estadisticas/componentes/modulo-tabla-estadistica-agrupada";
import {
  aplicarEstiloCeldaTabla,
  aplicarEstiloEncabezado,
  aplicarEstiloTitulo,
  crearLibroExcel,
  descargarLibroExcel,
} from "@/modulos/comun/servicios/exportador-excel";

function formatearValorConPrecision(valor: number, precision: number): string {
  return valor.toFixed(Math.max(precision, 0)).replace(".", ",");
}

export async function exportarExcelSturges(
  configuracion: ConfiguracionExportacionTablaAgrupada,
  nombreArchivo: string,
): Promise<void> {
  const { libro } = await crearLibroExcel();
  const hojaResumen = libro.addWorksheet("Resumen");
  const hojaDatos = libro.addWorksheet("Datos");

  hojaResumen.mergeCells("A1:H1");
  hojaResumen.getCell("A1").value = configuracion.numeroTabla;
  aplicarEstiloTitulo(hojaResumen.getCell("A1"));

  hojaResumen.mergeCells("A2:H2");
  hojaResumen.getCell("A2").value = configuracion.tituloDescriptivo;
  aplicarEstiloTitulo(hojaResumen.getCell("A2"));

  const filasResumen: Array<[string, string | number | boolean]> = [
    ["Metodo", "Sturges"],
    ["Numero de datos (n)", configuracion.resultado.n],
    [
      "k exacto = 1 + 3,3 * log10(n)",
      configuracion.resumenMetodo.kExacto ?? "",
    ],
    [
      "Redondeo inicial",
      configuracion.resumenMetodo.direccionRedondeo === "arriba"
        ? "Hacia arriba"
        : "Hacia abajo",
    ],
    ["k aplicado", configuracion.resultado.k],
    ["k fue manual", configuracion.resumenMetodo.kFueManual],
    ["Dato minimo (d)", configuracion.resultado.d],
    ["Dato maximo (D)", configuracion.resultado.D],
    ["Precision detectada", configuracion.resultado.precision],
    ["c", configuracion.resultado.c],
    ["Longitud de alcance (la)", configuracion.resultado.longitudAlcance],
    ["t bruto", configuracion.resultado.tBruto],
    ["t ajustado", configuracion.resultado.tAjustado],
    ["Cobertura t*k", configuracion.resultado.cobertura],
    ["Correccion", configuracion.resultado.correccion],
    [
      "Ajuste inferior predeterminado",
      configuracion.resultado.ajusteInferiorPredeterminado,
    ],
    [
      "Ajuste superior predeterminado",
      configuracion.resultado.ajusteSuperiorPredeterminado,
    ],
    ["Ajuste inferior", configuracion.resultado.ajusteInferior],
    ["Ajuste superior", configuracion.resultado.ajusteSuperior],
    ["Minimo corregido", configuracion.resultado.minimoCorregido],
    ["Maximo corregido", configuracion.resultado.maximoCorregido],
    ["No permitir negativos", configuracion.resultado.noPermitirNegativos],
  ];

  filasResumen.forEach(([etiqueta, valor], indice) => {
    const fila = indice + 4;
    hojaResumen.getCell(fila, 1).value = etiqueta;
    hojaResumen.getCell(fila, 2).value = valor as string | number | boolean;
    aplicarEstiloEncabezado(hojaResumen.getCell(fila, 1), "8B4513");
    aplicarEstiloCeldaTabla(hojaResumen.getCell(fila, 2), true);
  });

  const filaTabla = filasResumen.length + 7;
  const encabezados = ["li", "Conteo", "fi", "hi", "pi", "Fi", "Hi", "Pi"];
  encabezados.forEach((encabezado, indice) => {
    const celda = hojaResumen.getCell(filaTabla, indice + 1);
    celda.value = encabezado;
    aplicarEstiloEncabezado(celda, "A25508");
  });

  configuracion.resultado.intervalos.forEach((intervalo, indice) => {
    const fila = filaTabla + indice + 1;
    const valores = [
      `[${formatearValorConPrecision(
        intervalo.limiteInferior,
        configuracion.resultado.precision,
      )}; ${formatearValorConPrecision(
        intervalo.limiteSuperior,
        configuracion.resultado.precision,
      )})`,
      intervalo.conteo,
      intervalo.fi,
      intervalo.hi.toFixed(4).replace(".", ","),
      `${intervalo.pi.toFixed(2).replace(".", ",")}%`,
      intervalo.Fi,
      intervalo.Hi.toFixed(4).replace(".", ","),
      `${intervalo.Pi.toFixed(2).replace(".", ",")}%`,
    ];

    valores.forEach((valor, indiceValor) => {
      const celda = hojaResumen.getCell(fila, indiceValor + 1);
      celda.value = valor;
      aplicarEstiloCeldaTabla(celda, true);
    });
  });

  const filaTotal = filaTabla + configuracion.resultado.intervalos.length + 1;
  hojaResumen.getCell(filaTotal, 1).value = "TOTAL";
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
