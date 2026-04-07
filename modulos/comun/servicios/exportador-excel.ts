type ModuloExcelJS = typeof import("exceljs");
type LibroExcel = InstanceType<ModuloExcelJS["Workbook"]>;
type HojaExcel = ReturnType<LibroExcel["addWorksheet"]>;
type CeldaExcel = ReturnType<HojaExcel["getCell"]>;

function normalizarColorHex(color: string, colorPorDefecto = "1E3932"): string {
  const limpio = color.replace("#", "").trim();

  if (/^[0-9A-Fa-f]{6}$/.test(limpio)) {
    return limpio.toUpperCase();
  }

  if (/^[0-9A-Fa-f]{3}$/.test(limpio)) {
    return limpio
      .split("")
      .map((caracter) => `${caracter}${caracter}`)
      .join("")
      .toUpperCase();
  }

  return colorPorDefecto;
}

export async function crearLibroExcel() {
  const ExcelJS = await import("exceljs");
  const libro = new ExcelJS.Workbook();
  libro.creator = "Estadistica Computacional";
  libro.created = new Date();
  libro.modified = new Date();

  return { ExcelJS, libro };
}

export function aplicarEstiloTitulo(celda: CeldaExcel) {
  celda.font = {
    bold: true,
    size: 18,
    color: { argb: "1E3932" },
  };
  celda.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
}

export function aplicarEstiloEncabezado(
  celda: CeldaExcel,
  colorHex = "1E3932",
) {
  celda.font = {
    bold: true,
    size: 12,
    color: { argb: "FFFFFFFF" },
  };
  celda.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: normalizarColorHex(colorHex) },
  };
  celda.alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  celda.border = {
    top: { style: "thin", color: { argb: "FF9CA3AF" } },
    left: { style: "thin", color: { argb: "FF9CA3AF" } },
    bottom: { style: "thin", color: { argb: "FF9CA3AF" } },
    right: { style: "thin", color: { argb: "FF9CA3AF" } },
  };
}

export function aplicarEstiloCeldaTabla(
  celda: CeldaExcel,
  centrado = false,
) {
  celda.alignment = {
    horizontal: centrado ? "center" : "left",
    vertical: "middle",
  };
  celda.border = {
    top: { style: "thin", color: { argb: "FFD1D5DB" } },
    left: { style: "thin", color: { argb: "FFD1D5DB" } },
    bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
    right: { style: "thin", color: { argb: "FFD1D5DB" } },
  };
}

export function aplicarColorDeMuestra(celda: CeldaExcel, color: string) {
  celda.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: normalizarColorHex(color, "9BC3A4") },
  };
}

export function agregarCanvasComoImagen(
  libro: LibroExcel,
  hoja: HojaExcel,
  canvas: HTMLCanvasElement,
  filaInicial: number,
  columnasAncho: number,
) {
  const imagenId = libro.addImage({
    base64: canvas.toDataURL("image/png"),
    extension: "png",
  });

  hoja.addImage(imagenId, {
    tl: { col: 0, row: filaInicial - 1 },
    ext: {
      width: canvas.width,
      height: canvas.height,
    },
    editAs: "oneCell",
  });

  const filasNecesarias = Math.max(12, Math.ceil(canvas.height / 20));
  for (let indice = 0; indice < filasNecesarias; indice += 1) {
    hoja.getRow(filaInicial + indice).height = 20;
  }

  hoja.mergeCells(
    filaInicial,
    1,
    filaInicial,
    Math.max(2, columnasAncho),
  );
}

export async function descargarLibroExcel(
  libro: LibroExcel,
  nombreArchivo: string,
) {
  const buffer = await libro.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${nombreArchivo}.xlsx`;
  enlace.click();
  URL.revokeObjectURL(url);
}
