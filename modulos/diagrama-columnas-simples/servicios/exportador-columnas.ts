import type { FilaColumnaSimple } from "@/modulos/diagrama-columnas-simples/tipos";

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
  const XLSX = await import("xlsx");

  const total = calcularTotal(configuracion.datos);
  const filas = configuracion.datos.map((fila) => [
    fila.categoria,
    fila.valor,
    formatearPorcentaje(total > 0 ? (fila.valor / total) * 100 : 0),
  ]);

  const hojaDatos = XLSX.utils.aoa_to_sheet([
    [configuracion.tituloTabla],
    [""],
    [configuracion.nombreVariable, "fi", "pi"],
    ...filas,
    ["TOTAL", total, formatearPorcentaje(total > 0 ? 100 : 0)],
  ]);

  hojaDatos["!cols"] = [{ wch: 28 }, { wch: 12 }, { wch: 14 }];

  ["A3", "B3", "C3"].forEach((celda) => {
    if (!hojaDatos[celda]) {
      return;
    }

    hojaDatos[celda].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1E3932" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  });

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hojaDatos, "Tabla");

  if (canvas) {
    const hojaDiagrama = XLSX.utils.aoa_to_sheet([
      ["Diagrama de columnas simple"],
      [""],
      ["El archivo incluye la tabla estadistica y el diagrama exportado desde la web."],
    ]);
    XLSX.utils.book_append_sheet(libro, hojaDiagrama, "Diagrama");
  }

  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`);
}
