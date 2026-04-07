import type {
  BarraCalculada,
  ConfiguracionEjeYManual,
  FilaColumnaSimple,
  OpcionesRenderColumnasSimples,
} from "@/modulos/diagrama-columnas-simples/tipos";

const COLORES_BASE = [
  "#F97316",
  "#3B82F6",
  "#B94242",
  "#6B8E23",
  "#14B8A6",
  "#A855F7",
  "#F59E0B",
  "#0EA5E9",
];

interface ConfiguracionEscalaY {
  minimo: number;
  maximo: number;
  paso: number;
}

function esConfiguracionEjeValida(
  configuracion?: ConfiguracionEjeYManual,
): configuracion is ConfiguracionEjeYManual {
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

export function generarColoresColumnasDefault(cantidad: number): string[] {
  return Array.from(
    { length: cantidad },
    (_, indice) => COLORES_BASE[indice % COLORES_BASE.length],
  );
}

export function calcularEscalaY(
  datos: FilaColumnaSimple[],
  configuracionManual?: ConfiguracionEjeYManual,
): ConfiguracionEscalaY {
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

function crearTicksY(escala: ConfiguracionEscalaY): number[] {
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

function dividirEtiqueta(etiqueta: string, maximoCaracteres = 14): string[] {
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

export function calcularBarrasDiagrama(
  datos: FilaColumnaSimple[],
  anchoCanvas: number,
  altoCanvas: number,
  opciones: OpcionesRenderColumnasSimples,
): BarraCalculada[] {
  const margenIzquierdo = 90;
  const margenDerecho = 50;
  const margenSuperior = 50;
  const margenInferior = 140;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaY = calcularEscalaY(datos, opciones.ejeYManual);
  const espacioPorBarra = anchoUtil / Math.max(datos.length, 1);
  const anchoBarra = Math.min(120, espacioPorBarra * 0.62);
  const colores = generarColoresColumnasDefault(datos.length);

  return datos.map((dato, indice) => {
    const alto =
      ((dato.valor - escalaY.minimo) / (escalaY.maximo - escalaY.minimo || 1)) *
      altoUtil;
    const x =
      margenIzquierdo +
      indice * espacioPorBarra +
      (espacioPorBarra - anchoBarra) / 2;
    const y = margenSuperior + altoUtil - alto;

    return {
      x,
      y,
      ancho: anchoBarra,
      alto,
      etiqueta: dato.categoria,
      valor: dato.valor,
      color: dato.color || colores[indice],
    };
  });
}

export function dibujarDiagramaColumnasSimple(
  canvas: HTMLCanvasElement,
  datos: FilaColumnaSimple[],
  opciones: OpcionesRenderColumnasSimples,
): void {
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    return;
  }

  const anchoCanvas = canvas.width;
  const altoCanvas = canvas.height;
  const margenIzquierdo = 90;
  const margenDerecho = 50;
  const margenSuperior = 50;
  const margenInferior = 140;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaY = calcularEscalaY(datos, opciones.ejeYManual);
  const ticksY = crearTicksY(escalaY);
  const barras = calcularBarrasDiagrama(datos, anchoCanvas, altoCanvas, opciones);

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
  contexto.textAlign = "center";

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
    contexto.fillText(`${tick}`, margenIzquierdo - 18, y + 5);
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
  contexto.fillText(opciones.nombreEjeX, margenIzquierdo + anchoUtil / 2, altoCanvas - 26);

  barras.forEach((barra, indice) => {
    const degradado = contexto.createLinearGradient(0, barra.y, 0, barra.y + barra.alto);
    degradado.addColorStop(0, mezclarColor(barra.color, 30));
    degradado.addColorStop(1, mezclarColor(barra.color, -25));

    contexto.fillStyle = degradado;
    contexto.fillRect(barra.x, barra.y, barra.ancho, barra.alto);
    contexto.strokeStyle =
      opciones.indiceSeleccionado === indice ? "#1E3932" : mezclarColor(barra.color, -45);
    contexto.lineWidth = opciones.indiceSeleccionado === indice ? 4 : 2;
    contexto.strokeRect(barra.x, barra.y, barra.ancho, barra.alto);

    contexto.fillStyle = "#111111";
    contexto.font = "bold 18px sans-serif";
    contexto.textAlign = "center";
    contexto.fillText(`${barra.valor}`, barra.x + barra.ancho / 2, barra.y - 12);

    contexto.font = "15px sans-serif";
    contexto.fillStyle = "#1E3932";
    dividirEtiqueta(barra.etiqueta).forEach((linea, lineaIndice) => {
      contexto.fillText(
        linea,
        barra.x + barra.ancho / 2,
        margenSuperior + altoUtil + 40 + lineaIndice * 18,
      );
    });
  });
}
