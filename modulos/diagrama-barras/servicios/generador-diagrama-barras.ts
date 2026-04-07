import type {
  BarraHorizontalCalculada,
  ConfiguracionEjeXManual,
  FilaDiagramaBarras,
  OpcionesRenderDiagramaBarras,
} from "@/modulos/diagrama-barras/tipos";

const COLORES_BASE = [
  "#A7C957",
  "#8FBF5F",
  "#C0D77A",
  "#7FAF55",
  "#D6E88A",
  "#96B86B",
  "#B7CF70",
  "#89AA5D",
];

interface ConfiguracionEscalaX {
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

function esConfiguracionEjeValida(
  configuracion?: ConfiguracionEjeXManual,
): configuracion is ConfiguracionEjeXManual {
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

function dividirEtiqueta(etiqueta: string, maximoCaracteres = 22): string[] {
  const palabras = etiqueta.split(" ");
  const lineas: string[] = [];
  let lineaActual = "";

  palabras.forEach((palabra) => {
    const propuesta = lineaActual ? `${lineaActual} ${palabra}` : palabra;

    if (propuesta.length > maximoCaracteres && lineaActual) {
      lineas.push(lineaActual);
      lineaActual = palabra;
    } else {
      lineaActual = propuesta;
    }
  });

  if (lineaActual) {
    lineas.push(lineaActual);
  }

  return lineas.slice(0, 2);
}

function calcularMargenIzquierdo(datos: FilaDiagramaBarras[]): number {
  const longitudMaxima = Math.max(...datos.map((dato) => dato.categoria.length), 10);
  return Math.max(180, Math.min(320, longitudMaxima * 8 + 40));
}

export function generarColoresBarrasDefault(cantidad: number): string[] {
  return Array.from(
    { length: cantidad },
    (_, indice) => COLORES_BASE[indice % COLORES_BASE.length],
  );
}

export function calcularEscalaX(
  datos: FilaDiagramaBarras[],
  configuracionManual?: ConfiguracionEjeXManual,
): ConfiguracionEscalaX {
  if (esConfiguracionEjeValida(configuracionManual)) {
    return configuracionManual;
  }

  const valorMaximo = Math.max(...datos.map((dato) => dato.valor), 0);
  const paso = calcularPasoBonito(valorMaximo || 1);
  const maximo = Math.max(paso, Math.ceil(valorMaximo / paso) * paso);

  return {
    minimo: 0,
    maximo,
    paso,
  };
}

function crearTicksX(escala: ConfiguracionEscalaX): number[] {
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

export function calcularBarrasDiagramaBarras(
  datos: FilaDiagramaBarras[],
  anchoCanvas: number,
  altoCanvas: number,
  opciones: OpcionesRenderDiagramaBarras,
): BarraHorizontalCalculada[] {
  const margenIzquierdo = calcularMargenIzquierdo(datos);
  const margenDerecho = 210;
  const margenSuperior = 50;
  const margenInferior = 100;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaX = calcularEscalaX(datos, opciones.ejeXManual);
  const espacioPorBarra = altoUtil / Math.max(datos.length, 1);
  const altoBarra = Math.min(46, espacioPorBarra * 0.58);
  const colores = generarColoresBarrasDefault(datos.length);

  return datos.map((dato, indice) => {
    const ancho =
      ((dato.valor - escalaX.minimo) / (escalaX.maximo - escalaX.minimo || 1)) *
      anchoUtil;
    const y =
      margenSuperior +
      indice * espacioPorBarra +
      (espacioPorBarra - altoBarra) / 2;

    return {
      x: margenIzquierdo,
      y,
      ancho,
      alto: altoBarra,
      etiqueta: dato.categoria,
      valor: dato.valor,
      color: dato.color || colores[indice],
    };
  });
}

export function dibujarDiagramaBarras(
  canvas: HTMLCanvasElement,
  datos: FilaDiagramaBarras[],
  opciones: OpcionesRenderDiagramaBarras,
): void {
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    return;
  }

  const anchoCanvas = canvas.width;
  const altoCanvas = canvas.height;
  const margenIzquierdo = calcularMargenIzquierdo(datos);
  const margenDerecho = 210;
  const margenSuperior = 50;
  const margenInferior = 100;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaX = calcularEscalaX(datos, opciones.ejeXManual);
  const ticksX = crearTicksX(escalaX);
  const barras = calcularBarrasDiagramaBarras(datos, anchoCanvas, altoCanvas, opciones);

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

  ticksX.forEach((tick) => {
    const proporcion =
      (tick - escalaX.minimo) / (escalaX.maximo - escalaX.minimo || 1);
    const x = margenIzquierdo + proporcion * anchoUtil;

    contexto.strokeStyle = "rgba(77, 73, 68, 0.35)";
    contexto.lineWidth = 1;
    contexto.beginPath();
    contexto.moveTo(x, margenSuperior);
    contexto.lineTo(x, margenSuperior + altoUtil);
    contexto.stroke();

    contexto.textAlign = "center";
    contexto.fillText(
      formatearNumeroVisible(tick),
      x,
      margenSuperior + altoUtil + 38,
    );
  });

  contexto.save();
  contexto.translate(30, margenSuperior + altoUtil / 2);
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

  barras.forEach((barra, indice) => {
    const degradado = contexto.createLinearGradient(
      barra.x,
      0,
      barra.x + barra.ancho,
      0,
    );
    degradado.addColorStop(0, mezclarColor(barra.color, 26));
    degradado.addColorStop(0.55, barra.color);
    degradado.addColorStop(1, mezclarColor(barra.color, -18));

    contexto.fillStyle = degradado;
    contexto.fillRect(barra.x, barra.y, barra.ancho, barra.alto);
    contexto.strokeStyle =
      opciones.indiceSeleccionado === indice
        ? "#1E3932"
        : mezclarColor(barra.color, -40);
    contexto.lineWidth = opciones.indiceSeleccionado === indice ? 4 : 2;
    contexto.strokeRect(barra.x, barra.y, barra.ancho, barra.alto);

    contexto.fillStyle = "#111111";
    contexto.font = "bold 18px sans-serif";
    contexto.textAlign = "left";
    contexto.fillText(
      formatearNumeroVisible(barra.valor),
      Math.min(barra.x + barra.ancho + 14, margenIzquierdo + anchoUtil - 20),
      barra.y + barra.alto / 2 + 6,
    );

    contexto.font = "15px sans-serif";
    contexto.fillStyle = "#1E3932";
    contexto.textAlign = "right";
    const lineas = dividirEtiqueta(barra.etiqueta);
    const desfaseInicial = lineas.length === 2 ? -8 : 0;
    lineas.forEach((linea, lineaIndice) => {
      contexto.fillText(
        linea,
        margenIzquierdo - 16,
        barra.y + barra.alto / 2 + desfaseInicial + lineaIndice * 18 + 5,
      );
    });
  });

  const legendX = anchoCanvas - 175;
  const legendY = margenSuperior + altoUtil / 2 - 9;

  contexto.fillStyle = COLORES_BASE[0];
  contexto.fillRect(legendX, legendY, 18, 18);
  contexto.strokeStyle = mezclarColor(COLORES_BASE[0], -35);
  contexto.lineWidth = 1.5;
  contexto.strokeRect(legendX, legendY, 18, 18);
  contexto.fillStyle = "#1E3932";
  contexto.font = "bold 16px sans-serif";
  contexto.textAlign = "left";
  contexto.fillText(opciones.nombreSerie, legendX + 28, legendY + 15);
}
