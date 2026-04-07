import type {
  ConfiguracionEjeManualLineal,
  FilaDiagramaLineal,
  OpcionesRenderDiagramaLineal,
  PuntoLinealCalculado,
} from "@/modulos/diagrama-lineal/tipos";

const COLORES_BASE = [
  "#C55252",
  "#D06A6A",
  "#A94442",
  "#C46E4F",
  "#B65D46",
  "#D17C5C",
  "#B84A62",
  "#A95574",
];

const formateadorNumero = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

interface ConfiguracionEscala {
  minimo: number;
  maximo: number;
  paso: number;
}

function formatearNumeroVisible(valor: number): string {
  return formateadorNumero.format(valor);
}

function esConfiguracionEjeValida(
  configuracion?: ConfiguracionEjeManualLineal,
): configuracion is ConfiguracionEjeManualLineal {
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

function calcularEscalaAutomatica(valores: number[]): ConfiguracionEscala {
  if (valores.length === 0) {
    return {
      minimo: 0,
      maximo: 10,
      paso: 2,
    };
  }

  const minimoReal = Math.min(...valores);
  const maximoReal = Math.max(...valores);

  if (minimoReal === maximoReal) {
    const base = minimoReal === 0 ? 1 : Math.abs(minimoReal) * 0.15;
    const minimoExpandido =
      minimoReal >= 0 ? Math.max(0, minimoReal - base) : minimoReal - base;
    const maximoExpandido = maximoReal + base;
    const paso = calcularPasoBonito(maximoExpandido - minimoExpandido || 1);

    return {
      minimo: Math.floor(minimoExpandido / paso) * paso,
      maximo: Math.ceil(maximoExpandido / paso) * paso,
      paso,
    };
  }

  const rango = maximoReal - minimoReal;
  const minimoExpandido =
    minimoReal >= 0 ? 0 : minimoReal - rango * 0.15;
  const maximoExpandido = maximoReal + rango * 0.15;
  const paso = calcularPasoBonito(maximoExpandido - minimoExpandido || 1);
  const minimoVisual = Math.floor(minimoExpandido / paso) * paso;
  const maximoVisual = Math.ceil(maximoExpandido / paso) * paso;

  return {
    minimo: minimoVisual,
    maximo: Math.max(maximoVisual, minimoVisual + paso),
    paso,
  };
}

function obtenerEscala(
  valores: number[],
  configuracionManual?: ConfiguracionEjeManualLineal,
): ConfiguracionEscala {
  if (esConfiguracionEjeValida(configuracionManual)) {
    return configuracionManual;
  }

  return calcularEscalaAutomatica(valores);
}

function crearTicks(escala: ConfiguracionEscala): number[] {
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

function escalarValor(
  valor: number,
  minimo: number,
  maximo: number,
  salidaMinima: number,
  salidaMaxima: number,
) {
  if (maximo === minimo) {
    return (salidaMinima + salidaMaxima) / 2;
  }

  return (
    ((valor - minimo) / (maximo - minimo)) * (salidaMaxima - salidaMinima) +
    salidaMinima
  );
}

function dibujarEtiquetaCategoria(
  contexto: CanvasRenderingContext2D,
  etiqueta: string,
  x: number,
  y: number,
  usarRotacion: boolean,
) {
  contexto.save();
  contexto.translate(x, y);

  if (usarRotacion) {
    contexto.rotate(-Math.PI / 5);
    contexto.textAlign = "right";
    contexto.fillText(etiqueta, 0, 0);
  } else {
    contexto.textAlign = "center";
    contexto.fillText(etiqueta, 0, 0);
  }

  contexto.restore();
}

export function generarColoresLinealDefault(cantidad: number): string[] {
  return Array.from(
    { length: cantidad },
    (_, indice) => COLORES_BASE[indice % COLORES_BASE.length],
  );
}

export function calcularPuntosDiagramaLineal(
  datos: FilaDiagramaLineal[],
  anchoCanvas: number,
  altoCanvas: number,
  opciones: OpcionesRenderDiagramaLineal,
): PuntoLinealCalculado[] {
  const margenIzquierdo = 105;
  const margenDerecho = 55;
  const margenSuperior = 60;
  const margenInferior = 140;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaY = obtenerEscala(
    datos.map((dato) => dato.valor),
    opciones.ejeYManual,
  );
  const colores = generarColoresLinealDefault(datos.length);
  const divisor = Math.max(1, datos.length - 1);

  return datos.map((dato, indice) => ({
    x:
      datos.length === 1
        ? margenIzquierdo + anchoUtil / 2
        : margenIzquierdo + (anchoUtil / divisor) * indice,
    y: escalarValor(
      dato.valor,
      escalaY.minimo,
      escalaY.maximo,
      margenSuperior + altoUtil,
      margenSuperior,
    ),
    radio: 9,
    categoria: dato.categoria,
    valor: dato.valor,
    color: dato.color || colores[indice],
  }));
}

export function dibujarDiagramaLineal(
  canvas: HTMLCanvasElement,
  datos: FilaDiagramaLineal[],
  opciones: OpcionesRenderDiagramaLineal,
): PuntoLinealCalculado[] {
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    return [];
  }

  const anchoCanvas = canvas.width;
  const altoCanvas = canvas.height;
  const margenIzquierdo = 105;
  const margenDerecho = 55;
  const margenSuperior = 60;
  const margenInferior = 140;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaY = obtenerEscala(
    datos.map((dato) => dato.valor),
    opciones.ejeYManual,
  );
  const ticksY = crearTicks(escalaY);
  const puntos = calcularPuntosDiagramaLineal(
    datos,
    anchoCanvas,
    altoCanvas,
    opciones,
  );
  const usarRotacionEtiquetas =
    datos.length > 8 ||
    datos.some((dato) => dato.categoria.trim().length > 8);

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
    const y = escalarValor(
      tick,
      escalaY.minimo,
      escalaY.maximo,
      margenSuperior + altoUtil,
      margenSuperior,
    );

    contexto.strokeStyle = "rgba(77, 73, 68, 0.22)";
    contexto.lineWidth = 1;
    contexto.beginPath();
    contexto.moveTo(margenIzquierdo, y);
    contexto.lineTo(margenIzquierdo + anchoUtil, y);
    contexto.stroke();

    contexto.textAlign = "right";
    contexto.fillText(formatearNumeroVisible(tick), margenIzquierdo - 18, y + 5);
  });

  puntos.forEach((punto) => {
    contexto.strokeStyle = "rgba(77, 73, 68, 0.12)";
    contexto.lineWidth = 1;
    contexto.beginPath();
    contexto.moveTo(punto.x, margenSuperior);
    contexto.lineTo(punto.x, margenSuperior + altoUtil);
    contexto.stroke();
  });

  contexto.save();
  contexto.translate(34, margenSuperior + altoUtil / 2);
  contexto.rotate(-Math.PI / 2);
  contexto.textAlign = "center";
  contexto.fillStyle = "#1E3932";
  contexto.font = "bold 18px sans-serif";
  contexto.fillText(opciones.nombreEjeY, 0, 0);
  contexto.restore();

  contexto.textAlign = "center";
  contexto.fillStyle = "#1E3932";
  contexto.font = "bold 18px sans-serif";
  contexto.fillText(
    opciones.nombreEjeX,
    margenIzquierdo + anchoUtil / 2,
    altoCanvas - 24,
  );

  contexto.strokeStyle = opciones.colorLinea;
  contexto.lineWidth = 4;
  contexto.lineJoin = "round";
  contexto.lineCap = "round";

  if (puntos.length > 0) {
    contexto.beginPath();
    contexto.moveTo(puntos[0].x, puntos[0].y);
    puntos.slice(1).forEach((punto) => {
      contexto.lineTo(punto.x, punto.y);
    });
    contexto.stroke();
  }

  puntos.forEach((punto, indice) => {
    contexto.beginPath();
    contexto.fillStyle = punto.color;
    contexto.arc(punto.x, punto.y, punto.radio, 0, Math.PI * 2);
    contexto.fill();

    contexto.lineWidth = opciones.indiceSeleccionado === indice ? 3 : 1.5;
    contexto.strokeStyle =
      opciones.indiceSeleccionado === indice
        ? "#111111"
        : "rgba(30, 57, 50, 0.35)";
    contexto.stroke();
  });

  contexto.fillStyle = "#4D4944";
  contexto.font = "16px sans-serif";

  puntos.forEach((punto) => {
    dibujarEtiquetaCategoria(
      contexto,
      punto.categoria,
      punto.x,
      margenSuperior + altoUtil + (usarRotacionEtiquetas ? 60 : 36),
      usarRotacionEtiquetas,
    );
  });

  return puntos;
}
