import type {
  ConfiguracionColumnas,
  FilaDatos,
  OpcionesVisualizacion,
} from "@/modulos/diagrama-burbujas/tipos";

export interface RangosEscala {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minTamanio: number;
  maxTamanio: number;
}

export interface ConfiguracionEjeManual {
  minimo: number;
  maximo: number;
  paso: number;
}

export interface OpcionesRenderDiagrama {
  mostrarTituloDiagrama?: boolean;
  tituloDiagrama?: string;
  ejeXManual?: ConfiguracionEjeManual;
  ejeYManual?: ConfiguracionEjeManual;
  indiceBurbujaSeleccionada?: number | null;
}

export interface DatosBurbuja {
  x: number;
  y: number;
  radio: number;
  color: string;
  valorX: number;
  valorY: number;
  valorTamanio: number;
  valorColor?: string;
}

export const calcularRangos = (datos: FilaDatos[]): RangosEscala => {
  if (datos.length === 0) {
    return {
      minX: 0,
      maxX: 10,
      minY: 0,
      maxY: 10,
      minTamanio: 1,
      maxTamanio: 10,
    };
  }

  const valoresX = datos.map((dato) => dato.x);
  const valoresY = datos.map((dato) => dato.y);
  const valoresTamanio = datos.map((dato) => dato.tamanio);

  let minX = Math.min(...valoresX);
  let maxX = Math.max(...valoresX);
  let minY = Math.min(...valoresY);
  let maxY = Math.max(...valoresY);
  let minTamanio = Math.min(...valoresTamanio);
  let maxTamanio = Math.max(...valoresTamanio);

  if (maxX === minX) {
    const base = minX === 0 ? 1 : Math.abs(minX) * 0.1;
    minX -= base;
    maxX += base;
  }

  if (maxY === minY) {
    const base = minY === 0 ? 1 : Math.abs(minY) * 0.1;
    minY -= base;
    maxY += base;
  }

  if (maxTamanio === minTamanio) {
    minTamanio = Math.max(0, minTamanio - 1);
    maxTamanio += 1;
  }

  const rangoX = maxX - minX;
  const rangoY = maxY - minY;
  const margenX = rangoX * (rangoX < 10 ? 0.2 : 0.15);
  const margenY = rangoY * (rangoY < 10 ? 0.2 : 0.15);

  return {
    minX: minX - margenX,
    maxX: maxX + margenX,
    minY: minY - margenY,
    maxY: maxY + margenY,
    minTamanio,
    maxTamanio,
  };
};

export const escalarValor = (
  valor: number,
  min: number,
  max: number,
  rangoSalida: [number, number],
): number => {
  if (max === min) {
    return (rangoSalida[0] + rangoSalida[1]) / 2;
  }

  return (
    ((valor - min) / (max - min)) * (rangoSalida[1] - rangoSalida[0]) +
    rangoSalida[0]
  );
};

export const generarColoresDefault = (cantidad: number): string[] => {
  const colores = [
    "#8B5CF6",
    "#6366F1",
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#EC4899",
    "#14B8A6",
    "#8B5CF6",
    "#6366F1",
  ];

  return Array.from({ length: cantidad }, (_, indice) => colores[indice % colores.length]);
};

const MAPA_COLORES_CATEGORIAS: Record<string, string> = {
  sube: "#10B981",
  subida: "#10B981",
  alto: "#10B981",
  positivo: "#10B981",
  arriba: "#10B981",
  baja: "#EF4444",
  bajada: "#EF4444",
  bajo: "#EF4444",
  negativo: "#EF4444",
  abajo: "#EF4444",
  estable: "#6B7280",
  neutro: "#6B7280",
  medio: "#F59E0B",
  moderado: "#F59E0B",
  verde: "#10B981",
  rojo: "#EF4444",
  azul: "#3B82F6",
  amarillo: "#F59E0B",
  morado: "#8B5CF6",
};

const esColorCSSValido = (color: string): boolean => {
  const limpio = color.trim().toLowerCase();

  if (/^#([a-f0-9]{6}|[a-f0-9]{3})$/i.test(limpio)) {
    return true;
  }

  if (/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i.test(limpio)) {
    return true;
  }

  if (/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/i.test(limpio)) {
    return true;
  }

  return [
    "red",
    "green",
    "blue",
    "yellow",
    "purple",
    "orange",
    "pink",
    "cyan",
    "magenta",
    "black",
    "white",
    "gray",
    "brown",
  ].includes(limpio);
};

export const resolverColorBurbuja = (
  valorColor: string | undefined,
  colorDefault: string,
): string => {
  if (!valorColor || valorColor.trim() === "") {
    return colorDefault;
  }

  const valorNormalizado = valorColor.trim().toLowerCase();

  if (esColorCSSValido(valorColor)) {
    return valorColor;
  }

  return MAPA_COLORES_CATEGORIAS[valorNormalizado] ?? colorDefault;
};

export const calcularRadiosDinamicos = (
  anchoCanvas: number,
  altoCanvas: number,
): { min: number; max: number } => {
  const areaUtil = Math.min(anchoCanvas, altoCanvas) - 180;
  const radioMin = Math.max(6, areaUtil * 0.01);
  const radioMax = Math.min(60, areaUtil * 0.08);

  return { min: radioMin, max: radioMax };
};

export const calcularRadioVisualBurbuja = (
  tamanio: number,
  tamanioMaximo: number,
  radioMinimo: number,
  radioMaximo: number,
): number => {
  if (tamanioMaximo === 0 || tamanio <= 0) {
    return radioMinimo;
  }

  const tamanioNormalizado = tamanio / tamanioMaximo;
  const radioVisual =
    radioMinimo +
    Math.sqrt(tamanioNormalizado) * (radioMaximo - radioMinimo);

  return Math.max(radioMinimo, Math.min(radioMaximo, radioVisual));
};

export const calcularDatosBurbujas = (
  datos: FilaDatos[],
  anchoCanvas: number,
  altoCanvas: number,
  margen: number,
  opcionesRender?: OpcionesRenderDiagrama,
): DatosBurbuja[] => {
  const rangos = obtenerRangosParaDiagrama(datos, opcionesRender);
  const coloresDefault = generarColoresDefault(datos.length);
  const { min: radioMin, max: radioMax } = calcularRadiosDinamicos(
    anchoCanvas,
    altoCanvas,
  );

  const anchoUtil = anchoCanvas - 2 * margen;
  const altoUtil = altoCanvas - 2 * margen;
  const tamanioMaximo = Math.max(...datos.map((dato) => dato.tamanio), 0);

  return datos.map((fila, indice) => {
    const xEscalado = escalarValor(fila.x, rangos.minX, rangos.maxX, [
      margen,
      margen + anchoUtil,
    ]);
    const yEscalado = escalarValor(fila.y, rangos.minY, rangos.maxY, [
      margen + altoUtil,
      margen,
    ]);
    const x = Math.min(margen + anchoUtil, Math.max(margen, xEscalado));
    const y = Math.min(margen + altoUtil, Math.max(margen, yEscalado));
    const radio = calcularRadioVisualBurbuja(
      fila.tamanio,
      tamanioMaximo,
      radioMin,
      radioMax,
    );
    const color = resolverColorBurbuja(fila.color, coloresDefault[indice]);

    return {
      x,
      y,
      radio,
      color,
      valorX: fila.x,
      valorY: fila.y,
      valorTamanio: fila.tamanio,
      valorColor: fila.color,
    };
  });
};

const formatearNumeroEje = (valor: number): string => {
  const valorAbsoluto = Math.abs(valor);

  if (valorAbsoluto === 0) {
    return "0";
  }
  if (valorAbsoluto >= 1_000_000) {
    return `${(valor / 1_000_000).toFixed(1)}M`;
  }
  if (valorAbsoluto >= 1_000) {
    return `${(valor / 1_000).toFixed(1)}K`;
  }
  if (valorAbsoluto >= 100) {
    return valor.toFixed(0);
  }
  if (valorAbsoluto >= 1) {
    return valor.toFixed(1);
  }
  if (valorAbsoluto >= 0.01) {
    return valor.toFixed(2);
  }
  return valor.toExponential(1);
};

const esConfiguracionEjeManualValida = (
  configuracion?: ConfiguracionEjeManual,
): configuracion is ConfiguracionEjeManual => {
  if (!configuracion) {
    return false;
  }

  return (
    Number.isFinite(configuracion.minimo) &&
    Number.isFinite(configuracion.maximo) &&
    Number.isFinite(configuracion.paso) &&
    configuracion.maximo > configuracion.minimo &&
    configuracion.paso > 0
  );
};

const crearTicksManual = (configuracion: ConfiguracionEjeManual): number[] => {
  const ticks: number[] = [];
  const limiteMaximo = 120;

  for (
    let actual = configuracion.minimo, indice = 0;
    actual <= configuracion.maximo + configuracion.paso * 0.25 &&
    indice < limiteMaximo;
    actual += configuracion.paso, indice += 1
  ) {
    ticks.push(Number(actual.toFixed(6)));
  }

  if (ticks.length === 0) {
    return [configuracion.minimo, configuracion.maximo];
  }

  const ultimoTick = ticks[ticks.length - 1];
  if (Math.abs(ultimoTick - configuracion.maximo) > 0.000001) {
    ticks.push(configuracion.maximo);
  }

  return ticks;
};

const obtenerRangosParaDiagrama = (
  datos: FilaDatos[],
  opcionesRender?: OpcionesRenderDiagrama,
): RangosEscala => {
  const rangosBase = calcularRangos(datos);

  return {
    ...rangosBase,
    minX: esConfiguracionEjeManualValida(opcionesRender?.ejeXManual)
      ? opcionesRender.ejeXManual.minimo
      : rangosBase.minX,
    maxX: esConfiguracionEjeManualValida(opcionesRender?.ejeXManual)
      ? opcionesRender.ejeXManual.maximo
      : rangosBase.maxX,
    minY: esConfiguracionEjeManualValida(opcionesRender?.ejeYManual)
      ? opcionesRender.ejeYManual.minimo
      : rangosBase.minY,
    maxY: esConfiguracionEjeManualValida(opcionesRender?.ejeYManual)
      ? opcionesRender.ejeYManual.maximo
      : rangosBase.maxY,
  };
};

const calcularTicksInteligentes = (
  datos: FilaDatos[],
  campo: "x" | "y",
  minRango: number,
  maxRango: number,
): number[] => {
  const valoresUnicos = [...new Set(datos.map((dato) => dato[campo]))].sort(
    (valorA, valorB) => valorA - valorB,
  );
  const ticks = new Set<number>([minRango, maxRango]);
  valoresUnicos.forEach((valor) => ticks.add(valor));

  const ticksOrdenados = Array.from(ticks).sort(
    (valorA, valorB) => valorA - valorB,
  );

  if (ticksOrdenados.length <= 10) {
    return ticksOrdenados;
  }

  const ticksReducidos = [ticksOrdenados[0]];
  const paso = Math.floor(ticksOrdenados.length / 8);

  for (let indice = paso; indice < ticksOrdenados.length - 1; indice += paso) {
    ticksReducidos.push(ticksOrdenados[indice]);
  }

  ticksReducidos.push(ticksOrdenados[ticksOrdenados.length - 1]);
  return ticksReducidos;
};

const dibujarCuadricula = (
  contexto: CanvasRenderingContext2D,
  anchoCanvas: number,
  altoCanvas: number,
  margen: number,
  opciones: OpcionesVisualizacion,
): void => {
  if (!opciones.cuadricula.mostrarHorizontal && !opciones.cuadricula.mostrarVertical) {
    return;
  }

  const pasos = 10;
  contexto.strokeStyle = opciones.cuadricula.color;
  contexto.lineWidth = opciones.cuadricula.grosor;

  if (opciones.cuadricula.mostrarVertical) {
    for (let indice = 1; indice < pasos; indice += 1) {
      const x = margen + ((anchoCanvas - 2 * margen) * indice) / pasos;
      contexto.beginPath();
      contexto.moveTo(x, margen);
      contexto.lineTo(x, altoCanvas - margen);
      contexto.stroke();
    }
  }

  if (opciones.cuadricula.mostrarHorizontal) {
    for (let indice = 1; indice < pasos; indice += 1) {
      const y = margen + ((altoCanvas - 2 * margen) * indice) / pasos;
      contexto.beginPath();
      contexto.moveTo(margen, y);
      contexto.lineTo(anchoCanvas - margen, y);
      contexto.stroke();
    }
  }
};

const dibujarEjes = (
  contexto: CanvasRenderingContext2D,
  anchoCanvas: number,
  altoCanvas: number,
  margen: number,
  rangos: RangosEscala,
  columnas: ConfiguracionColumnas,
  datos: FilaDatos[],
  opciones: OpcionesVisualizacion,
  opcionesRender?: OpcionesRenderDiagrama,
): void => {
  contexto.strokeStyle = opciones.ejes.colorLinea;
  contexto.lineWidth = opciones.ejes.grosorLinea;
  contexto.beginPath();
  contexto.moveTo(margen, margen);
  contexto.lineTo(margen, altoCanvas - margen);
  contexto.lineTo(anchoCanvas - margen, altoCanvas - margen);
  contexto.stroke();

  contexto.fillStyle = "#1E293B";
  const tituloDiagrama =
    opcionesRender?.mostrarTituloDiagrama === false
      ? ""
      : opcionesRender?.tituloDiagrama?.trim() ||
        `Diagrama de Burbujas: ${columnas.nombreTamanio}`;

  if (tituloDiagrama) {
    contexto.font = "bold 20px sans-serif";
    contexto.textAlign = "center";
    contexto.fillText(tituloDiagrama, anchoCanvas / 2, 35);
  }

  contexto.font = "bold 14px sans-serif";

  if (opciones.ejes.mostrarTituloY) {
    const tituloY = opciones.ejes.tituloYPersonalizado || columnas.nombreY;
    contexto.save();
    contexto.translate(25, altoCanvas / 2);
    contexto.rotate(-Math.PI / 2);
    contexto.fillText(tituloY, 0, 0);
    contexto.restore();
  }

  if (opciones.ejes.mostrarTituloX) {
    const tituloX = opciones.ejes.tituloXPersonalizado || columnas.nombreX;
    contexto.fillText(tituloX, anchoCanvas / 2, altoCanvas - 20);
  }

  const ticksX = esConfiguracionEjeManualValida(opcionesRender?.ejeXManual)
    ? crearTicksManual(opcionesRender.ejeXManual)
    : calcularTicksInteligentes(datos, "x", rangos.minX, rangos.maxX);
  const ticksY = esConfiguracionEjeManualValida(opcionesRender?.ejeYManual)
    ? crearTicksManual(opcionesRender.ejeYManual)
    : calcularTicksInteligentes(datos, "y", rangos.minY, rangos.maxY);

  contexto.font = "11px sans-serif";
  contexto.fillStyle = "#64748B";

  ticksX.forEach((valorX) => {
    const proporcion = (valorX - rangos.minX) / (rangos.maxX - rangos.minX);
    const x = margen + (anchoCanvas - 2 * margen) * proporcion;

    contexto.textAlign = "center";
    contexto.fillText(formatearNumeroEje(valorX), x, altoCanvas - margen + 18);
    contexto.beginPath();
    contexto.moveTo(x, altoCanvas - margen);
    contexto.lineTo(x, altoCanvas - margen + 5);
    contexto.strokeStyle = "#94A3B8";
    contexto.lineWidth = 1;
    contexto.stroke();
  });

  ticksY.forEach((valorY) => {
    const proporcion = (valorY - rangos.minY) / (rangos.maxY - rangos.minY);
    const y = altoCanvas - margen - (altoCanvas - 2 * margen) * proporcion;

    contexto.textAlign = "right";
    contexto.fillText(formatearNumeroEje(valorY), margen - 8, y + 4);
    contexto.beginPath();
    contexto.moveTo(margen - 5, y);
    contexto.lineTo(margen, y);
    contexto.strokeStyle = "#94A3B8";
    contexto.lineWidth = 1;
    contexto.stroke();
  });
};

const dibujarLineasConexion = (
  contexto: CanvasRenderingContext2D,
  burbujas: DatosBurbuja[],
  opciones: OpcionesVisualizacion,
): void => {
  if (!opciones.lineasConexion.mostrar || burbujas.length < 2) {
    return;
  }

  contexto.strokeStyle = opciones.lineasConexion.color;
  contexto.lineWidth = opciones.lineasConexion.grosor;
  contexto.setLineDash(
    opciones.lineasConexion.estilo === "punteada" ? [5, 5] : [],
  );

  contexto.beginPath();
  contexto.moveTo(burbujas[0].x, burbujas[0].y);
  for (let indice = 1; indice < burbujas.length; indice += 1) {
    contexto.lineTo(burbujas[indice].x, burbujas[indice].y);
  }
  contexto.stroke();
  contexto.setLineDash([]);
};

const dibujarEtiquetasBurbujas = (
  contexto: CanvasRenderingContext2D,
  burbujas: DatosBurbuja[],
  columnas: ConfiguracionColumnas,
  opciones: OpcionesVisualizacion,
): void => {
  if (!opciones.etiquetas.mostrar) {
    return;
  }

  contexto.font = `${opciones.etiquetas.tamanioFuente}px sans-serif`;
  contexto.textAlign = "center";
  contexto.textBaseline = "middle";

  burbujas.forEach((burbuja) => {
    const etiquetas: string[] = [];

    if (opciones.etiquetas.mostrarX) {
      etiquetas.push(`${columnas.nombreX}: ${formatearNumeroEje(burbuja.valorX)}`);
    }
    if (opciones.etiquetas.mostrarY) {
      etiquetas.push(`${columnas.nombreY}: ${formatearNumeroEje(burbuja.valorY)}`);
    }
    if (opciones.etiquetas.mostrarTamanio) {
      etiquetas.push(formatearNumeroEje(burbuja.valorTamanio));
    }
    if (opciones.etiquetas.mostrarColor && burbuja.valorColor) {
      etiquetas.push(burbuja.valorColor);
    }

    const offsetY = burbuja.radio + 8;

    etiquetas.forEach((etiqueta, indice) => {
      const y = burbuja.y - offsetY - indice * (opciones.etiquetas.tamanioFuente + 4);
      const medidaTexto = contexto.measureText(etiqueta);
      const paddingHorizontal = 6;
      const paddingVertical = 3;

      contexto.fillStyle = "rgba(255, 255, 255, 0.92)";
      contexto.fillRect(
        burbuja.x - medidaTexto.width / 2 - paddingHorizontal,
        y - opciones.etiquetas.tamanioFuente / 2 - paddingVertical,
        medidaTexto.width + paddingHorizontal * 2,
        opciones.etiquetas.tamanioFuente + paddingVertical * 2,
      );

      contexto.strokeStyle = "rgba(30, 57, 50, 0.12)";
      contexto.lineWidth = 1;
      contexto.strokeRect(
        burbuja.x - medidaTexto.width / 2 - paddingHorizontal,
        y - opciones.etiquetas.tamanioFuente / 2 - paddingVertical,
        medidaTexto.width + paddingHorizontal * 2,
        opciones.etiquetas.tamanioFuente + paddingVertical * 2,
      );

      contexto.fillStyle = opciones.etiquetas.color;
      contexto.fillText(etiqueta, burbuja.x, y);
    });
  });
};

const dibujarLeyenda = (
  contexto: CanvasRenderingContext2D,
  datos: FilaDatos[],
  anchoCanvas: number,
  altoCanvas: number,
  margen: number,
  columnas: ConfiguracionColumnas,
  opciones: OpcionesVisualizacion,
): void => {
  if (!opciones.leyenda.mostrar || !columnas.nombreColor) {
    return;
  }

  const coloresUnicos = new Map<string, string>();
  datos.forEach((fila, indice) => {
    if (!fila.color) {
      return;
    }

    const colorResuelto = resolverColorBurbuja(
      fila.color,
      generarColoresDefault(datos.length)[indice],
    );
    coloresUnicos.set(fila.color, colorResuelto);
  });

  if (coloresUnicos.size === 0) {
    return;
  }

  const items = Array.from(coloresUnicos.entries());
  let posicionX = margen + 20;
  let posicionY = altoCanvas - margen + 40;

  if (opciones.leyenda.posicion === "derecha") {
    posicionX = anchoCanvas - 200;
    posicionY = 60;
  }

  contexto.font = "bold 12px sans-serif";
  contexto.fillStyle = "#1E293B";
  contexto.textAlign = "left";
  contexto.fillText(`${columnas.nombreColor}:`, posicionX, posicionY);
  posicionY += 20;

  contexto.font = "11px sans-serif";

  if (opciones.leyenda.posicion === "derecha") {
    items.forEach(([valor, color], indice) => {
      const y = posicionY + indice * 22;

      contexto.fillStyle = color;
      contexto.globalAlpha = opciones.burbujas.transparencia / 100;
      contexto.fillRect(posicionX, y - 10, 14, 14);
      contexto.globalAlpha = 1;
      contexto.strokeStyle = "#94A3B8";
      contexto.lineWidth = 1;
      contexto.strokeRect(posicionX, y - 10, 14, 14);
      contexto.fillStyle = "#475569";
      contexto.fillText(
        valor.length > 15 ? `${valor.slice(0, 15)}...` : valor,
        posicionX + 20,
        y,
      );
    });
    return;
  }

  let desplazamientoX = 0;
  items.forEach(([valor, color]) => {
    contexto.fillStyle = color;
    contexto.globalAlpha = opciones.burbujas.transparencia / 100;
    contexto.fillRect(posicionX + desplazamientoX, posicionY - 10, 14, 14);
    contexto.globalAlpha = 1;
    contexto.strokeStyle = "#94A3B8";
    contexto.lineWidth = 1;
    contexto.strokeRect(posicionX + desplazamientoX, posicionY - 10, 14, 14);

    const textoCorto = valor.length > 12 ? `${valor.slice(0, 12)}...` : valor;
    contexto.fillStyle = "#475569";
    contexto.fillText(textoCorto, posicionX + desplazamientoX + 20, posicionY);
    desplazamientoX += contexto.measureText(textoCorto).width + 40;
  });
};

const dibujarEstadoVacio = (
  contexto: CanvasRenderingContext2D,
  anchoCanvas: number,
  altoCanvas: number,
) => {
  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, anchoCanvas, altoCanvas);
  contexto.fillStyle = "#1e3932";
  contexto.font = "bold 24px sans-serif";
  contexto.textAlign = "center";
  contexto.fillText(
    "No hay datos para mostrar el diagrama",
    anchoCanvas / 2,
    altoCanvas / 2 - 10,
  );
  contexto.font = "14px sans-serif";
  contexto.fillStyle = "#4d4944";
  contexto.fillText(
    "Completa la tabla y vuelve a generar la visualizacion.",
    anchoCanvas / 2,
    altoCanvas / 2 + 24,
  );
};

export const dibujarDiagrama = (
  canvas: HTMLCanvasElement,
  datos: FilaDatos[],
  columnas: ConfiguracionColumnas,
  opciones: OpcionesVisualizacion,
  opcionesRender?: OpcionesRenderDiagrama,
): void => {
  const contexto = canvas.getContext("2d");
  if (!contexto) {
    return;
  }

  const margen = 90;
  const anchoCanvas = canvas.width;
  const altoCanvas = canvas.height;

  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, anchoCanvas, altoCanvas);

  if (datos.length === 0) {
    dibujarEstadoVacio(contexto, anchoCanvas, altoCanvas);
    return;
  }

  const rangos = obtenerRangosParaDiagrama(datos, opcionesRender);
  dibujarCuadricula(contexto, anchoCanvas, altoCanvas, margen, opciones);
  dibujarEjes(
    contexto,
    anchoCanvas,
    altoCanvas,
    margen,
    rangos,
    columnas,
    datos,
    opciones,
    opcionesRender,
  );

  const burbujas = calcularDatosBurbujas(
    datos,
    anchoCanvas,
    altoCanvas,
    margen,
    opcionesRender,
  );
  dibujarLineasConexion(contexto, burbujas, opciones);

  burbujas.forEach((burbuja, indice) => {
    contexto.fillStyle = burbuja.color;
    contexto.globalAlpha = opciones.burbujas.transparencia / 100;
    contexto.beginPath();
    contexto.arc(burbuja.x, burbuja.y, burbuja.radio, 0, 2 * Math.PI);
    contexto.fill();
    contexto.globalAlpha = 1;

    const esBurbujaSeleccionada =
      opcionesRender?.indiceBurbujaSeleccionada === indice;

    if (esBurbujaSeleccionada) {
      contexto.strokeStyle = "#1E3932";
      contexto.lineWidth = Math.max(4, opciones.burbujas.grosorBorde + 2);
      contexto.stroke();
    } else if (
      opciones.burbujas.mostrarBorde &&
      opciones.burbujas.grosorBorde > 0
    ) {
      contexto.strokeStyle = opciones.burbujas.colorBorde;
      contexto.lineWidth = opciones.burbujas.grosorBorde;
      contexto.stroke();
    }
  });

  dibujarEtiquetasBurbujas(contexto, burbujas, columnas, opciones);
  dibujarLeyenda(
    contexto,
    datos,
    anchoCanvas,
    altoCanvas,
    margen,
    columnas,
    opciones,
  );
};
