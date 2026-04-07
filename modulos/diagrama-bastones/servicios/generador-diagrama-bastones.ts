import type {
  BastonCalculado,
  ConfiguracionEjeManual,
  FilaDiagramaBastones,
  OpcionesRenderDiagramaBastones,
} from "@/modulos/diagrama-bastones/tipos";

const COLORES_BASE = [
  "#A13A37",
  "#B64A46",
  "#8E2F2C",
  "#C15A56",
  "#983632",
  "#C86863",
];

interface EscalaNumerica {
  minimo: number;
  maximo: number;
  paso: number;
}

const formateadorNumero = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatearNumeroVisible(valor: number): string {
  return formateadorNumero.format(valor);
}

function esConfiguracionValida(
  configuracion?: ConfiguracionEjeManual,
): configuracion is ConfiguracionEjeManual {
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
}

function mezclarColor(color: string, cantidad: number): string {
  const colorLimpio = color.replace("#", "");

  if (colorLimpio.length !== 6) {
    return color;
  }

  const rojo = parseInt(colorLimpio.slice(0, 2), 16);
  const verde = parseInt(colorLimpio.slice(2, 4), 16);
  const azul = parseInt(colorLimpio.slice(4, 6), 16);

  const ajustar = (valor: number) =>
    Math.max(0, Math.min(255, valor + cantidad))
      .toString(16)
      .padStart(2, "0");

  return `#${ajustar(rojo)}${ajustar(verde)}${ajustar(azul)}`;
}

function calcularPasoBonito(valorMaximo: number): number {
  if (valorMaximo <= 0) {
    return 1;
  }

  const pasoBase = valorMaximo / 5;
  const magnitud = 10 ** Math.floor(Math.log10(pasoBase));
  const normalizado = pasoBase / magnitud;

  if (normalizado <= 1) return magnitud;
  if (normalizado <= 2) return 2 * magnitud;
  if (normalizado <= 5) return 5 * magnitud;
  return 10 * magnitud;
}

function crearTicks(escala: EscalaNumerica): number[] {
  const ticks: number[] = [];

  for (
    let actual = escala.minimo, indice = 0;
    actual <= escala.maximo + escala.paso * 0.25 && indice < 100;
    actual += escala.paso, indice += 1
  ) {
    ticks.push(Number(actual.toFixed(6)));
  }

  if (ticks[ticks.length - 1] !== escala.maximo) {
    ticks.push(escala.maximo);
  }

  return ticks;
}

function calcularEscalaX(
  datos: FilaDiagramaBastones[],
  configuracionManual?: ConfiguracionEjeManual,
): EscalaNumerica {
  if (esConfiguracionValida(configuracionManual)) {
    return configuracionManual;
  }

  const valorMinimo = Math.min(...datos.map((dato) => dato.valor), 0);
  const valorMaximo = Math.max(...datos.map((dato) => dato.valor), 0);
  const rango = Math.max(valorMaximo - valorMinimo, 1);
  const paso =
    Number.isInteger(valorMinimo) &&
    Number.isInteger(valorMaximo) &&
    rango <= 10
      ? 1
      : calcularPasoBonito(rango / 5 || 1);
  const minimo = Math.floor(valorMinimo / paso) * paso;
  const maximo = Math.max(minimo + paso, Math.ceil(valorMaximo / paso) * paso);

  return { minimo, maximo, paso };
}

function calcularEscalaY(
  datos: FilaDiagramaBastones[],
  configuracionManual?: ConfiguracionEjeManual,
): EscalaNumerica {
  if (esConfiguracionValida(configuracionManual)) {
    return configuracionManual;
  }

  const valorMaximo = Math.max(...datos.map((dato) => dato.frecuencia), 0);
  const paso = calcularPasoBonito(valorMaximo || 1);
  const maximo = Math.max(paso, Math.ceil(valorMaximo / paso) * paso);

  return {
    minimo: 0,
    maximo,
    paso,
  };
}

export function generarColoresBastonesDefault(cantidad: number): string[] {
  return Array.from(
    { length: cantidad },
    (_, indice) => COLORES_BASE[indice % COLORES_BASE.length],
  );
}

export function calcularBastonesDiagrama(
  datos: FilaDiagramaBastones[],
  anchoCanvas: number,
  altoCanvas: number,
  opciones: OpcionesRenderDiagramaBastones,
): BastonCalculado[] {
  const margenIzquierdo = 90;
  const margenDerecho = 60;
  const margenSuperior = 60;
  const margenInferior = 130;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaX = calcularEscalaX(datos, opciones.ejeXManual);
  const escalaY = calcularEscalaY(datos, opciones.ejeYManual);

  return datos.map((dato) => {
    const proporcionX =
      (dato.valor - escalaX.minimo) / (escalaX.maximo - escalaX.minimo || 1);
    const proporcionY =
      (dato.frecuencia - escalaY.minimo) / (escalaY.maximo - escalaY.minimo || 1);

    return {
      xCentro: margenIzquierdo + proporcionX * anchoUtil,
      yTop: margenSuperior + altoUtil - proporcionY * altoUtil,
      yBase: margenSuperior + altoUtil,
      radio: 11,
      valor: dato.valor,
      frecuencia: dato.frecuencia,
      color: dato.color || "#A13A37",
    };
  });
}

export function dibujarDiagramaBastones(
  canvas: HTMLCanvasElement,
  datos: FilaDiagramaBastones[],
  opciones: OpcionesRenderDiagramaBastones,
): void {
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    return;
  }

  const anchoCanvas = canvas.width;
  const altoCanvas = canvas.height;
  const margenIzquierdo = 90;
  const margenDerecho = 60;
  const margenSuperior = 60;
  const margenInferior = 130;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaX = calcularEscalaX(datos, opciones.ejeXManual);
  const escalaY = calcularEscalaY(datos, opciones.ejeYManual);
  const ticksX = crearTicks(escalaX);
  const ticksY = crearTicks(escalaY);
  const bastones = calcularBastonesDiagrama(datos, anchoCanvas, altoCanvas, opciones);

  contexto.clearRect(0, 0, anchoCanvas, altoCanvas);
  contexto.fillStyle = "#FFFFFF";
  contexto.fillRect(0, 0, anchoCanvas, altoCanvas);

  contexto.strokeStyle = "#8A8F98";
  contexto.lineWidth = 2;
  contexto.beginPath();
  contexto.moveTo(margenIzquierdo, margenSuperior);
  contexto.lineTo(margenIzquierdo, margenSuperior + altoUtil);
  contexto.lineTo(margenIzquierdo + anchoUtil, margenSuperior + altoUtil);
  contexto.stroke();

  contexto.font = "16px sans-serif";
  contexto.fillStyle = "#4D4944";

  ticksY.forEach((tick) => {
    const proporcion =
      (tick - escalaY.minimo) / (escalaY.maximo - escalaY.minimo || 1);
    const y = margenSuperior + altoUtil - proporcion * altoUtil;

    contexto.strokeStyle = "rgba(77, 73, 68, 0.35)";
    contexto.lineWidth = 1;
    contexto.beginPath();
    contexto.moveTo(margenIzquierdo, y);
    contexto.lineTo(margenIzquierdo + anchoUtil, y);
    contexto.stroke();

    contexto.textAlign = "right";
    contexto.fillText(formatearNumeroVisible(tick), margenIzquierdo - 18, y + 5);
  });

  ticksX.forEach((tick) => {
    const proporcion =
      (tick - escalaX.minimo) / (escalaX.maximo - escalaX.minimo || 1);
    const x = margenIzquierdo + proporcion * anchoUtil;

    contexto.strokeStyle = "rgba(77, 73, 68, 0.18)";
    contexto.lineWidth = 1;
    contexto.beginPath();
    contexto.moveTo(x, margenSuperior);
    contexto.lineTo(x, margenSuperior + altoUtil);
    contexto.stroke();

    contexto.fillStyle = "#4D4944";
    contexto.textAlign = "center";
    contexto.fillText(
      formatearNumeroVisible(tick),
      x,
      margenSuperior + altoUtil + 40,
    );
  });

  contexto.save();
  contexto.translate(28, margenSuperior + altoUtil / 2);
  contexto.rotate(-Math.PI / 2);
  contexto.textAlign = "center";
  contexto.fillStyle = "#1E3932";
  contexto.font = "bold 18px sans-serif";
  contexto.fillText(opciones.nombreEjeY, 0, 0);
  contexto.restore();

  contexto.textAlign = "center";
  contexto.fillStyle = "#1E3932";
  contexto.fillText(
    opciones.nombreEjeX,
    margenIzquierdo + anchoUtil / 2,
    altoCanvas - 26,
  );

  bastones.forEach((baston, indice) => {
    const seleccionado = opciones.indiceSeleccionado === indice;
    const colorBaston = seleccionado ? "#8E2F2C" : baston.color;
    const colorBorde = seleccionado
      ? "#8E2F2C"
      : mezclarColor(baston.color, -45);
    const anchoBaston = seleccionado ? 24 : 20;
    const xInicio = baston.xCentro - anchoBaston / 2;
    const alturaBaston = Math.max(2, baston.yBase - baston.yTop);

    contexto.fillStyle = colorBaston;
    contexto.fillRect(xInicio, baston.yTop, anchoBaston, alturaBaston);
    contexto.strokeStyle = colorBorde;
    contexto.lineWidth = seleccionado ? 3 : 2;
    contexto.strokeRect(xInicio, baston.yTop, anchoBaston, alturaBaston);

    contexto.fillStyle = "#111111";
    contexto.font = "bold 18px sans-serif";
    contexto.textAlign = "center";
    contexto.fillText(
      formatearNumeroVisible(baston.frecuencia),
      baston.xCentro,
      baston.yTop - 18,
    );
  });
}