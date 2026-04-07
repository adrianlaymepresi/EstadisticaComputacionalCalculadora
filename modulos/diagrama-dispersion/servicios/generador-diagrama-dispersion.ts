import type {
  ConfiguracionEjeManualDispersion,
  FilaDiagramaDispersion,
  OpcionesRenderDiagramaDispersion,
  PuntoDispersionCalculado,
} from "@/modulos/diagrama-dispersion/tipos";

const COLORES_BASE = [
  "#4F86C6",
  "#5B9BD5",
  "#2E75B6",
  "#6A9AD1",
  "#4472C4",
  "#6D9EEB",
  "#4C78A8",
  "#3E6FB0",
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
  configuracion?: ConfiguracionEjeManualDispersion,
): configuracion is ConfiguracionEjeManualDispersion {
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

  let minimo = Math.min(...valores);
  let maximo = Math.max(...valores);

  if (maximo === minimo) {
    const base = minimo === 0 ? 1 : Math.abs(minimo) * 0.1;
    minimo -= base;
    maximo += base;
  }

  const rango = maximo - minimo || 1;
  const margen = rango < 10 ? 0.2 : 0.15;
  const minimoExpandido = minimo - rango * margen;
  const maximoExpandido = maximo + rango * margen;
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
  configuracionManual?: ConfiguracionEjeManualDispersion,
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

export function generarColoresDispersionDefault(cantidad: number): string[] {
  return Array.from(
    { length: cantidad },
    (_, indice) => COLORES_BASE[indice % COLORES_BASE.length],
  );
}

export function calcularPuntosDiagramaDispersion(
  datos: FilaDiagramaDispersion[],
  anchoCanvas: number,
  altoCanvas: number,
  opciones: OpcionesRenderDiagramaDispersion,
): PuntoDispersionCalculado[] {
  const margenIzquierdo = 95;
  const margenDerecho = 55;
  const margenSuperior = 55;
  const margenInferior = 110;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaX = obtenerEscala(
    datos.map((dato) => dato.x),
    opciones.ejeXManual,
  );
  const escalaY = obtenerEscala(
    datos.map((dato) => dato.y),
    opciones.ejeYManual,
  );
  const colores = generarColoresDispersionDefault(datos.length);

  return datos.map((dato, indice) => ({
    x: escalarValor(
      dato.x,
      escalaX.minimo,
      escalaX.maximo,
      margenIzquierdo,
      margenIzquierdo + anchoUtil,
    ),
    y: escalarValor(
      dato.y,
      escalaY.minimo,
      escalaY.maximo,
      margenSuperior + altoUtil,
      margenSuperior,
    ),
    radio: 10,
    valorX: dato.x,
    valorY: dato.y,
    color: dato.color || colores[indice],
  }));
}

export function dibujarDiagramaDispersion(
  canvas: HTMLCanvasElement,
  datos: FilaDiagramaDispersion[],
  opciones: OpcionesRenderDiagramaDispersion,
): PuntoDispersionCalculado[] {
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    return [];
  }

  const anchoCanvas = canvas.width;
  const altoCanvas = canvas.height;
  const margenIzquierdo = 95;
  const margenDerecho = 55;
  const margenSuperior = 55;
  const margenInferior = 110;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaX = obtenerEscala(
    datos.map((dato) => dato.x),
    opciones.ejeXManual,
  );
  const escalaY = obtenerEscala(
    datos.map((dato) => dato.y),
    opciones.ejeYManual,
  );
  const ticksX = crearTicks(escalaX);
  const ticksY = crearTicks(escalaY);
  const puntos = calcularPuntosDiagramaDispersion(
    datos,
    anchoCanvas,
    altoCanvas,
    opciones,
  );

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

    contexto.strokeStyle = "rgba(77, 73, 68, 0.25)";
    contexto.lineWidth = 1;
    contexto.beginPath();
    contexto.moveTo(margenIzquierdo, y);
    contexto.lineTo(margenIzquierdo + anchoUtil, y);
    contexto.stroke();

    contexto.textAlign = "right";
    contexto.fillText(formatearNumeroVisible(tick), margenIzquierdo - 18, y + 5);
  });

  ticksX.forEach((tick) => {
    const x = escalarValor(
      tick,
      escalaX.minimo,
      escalaX.maximo,
      margenIzquierdo,
      margenIzquierdo + anchoUtil,
    );

    contexto.strokeStyle = "rgba(77, 73, 68, 0.15)";
    contexto.lineWidth = 1;
    contexto.beginPath();
    contexto.moveTo(x, margenSuperior);
    contexto.lineTo(x, margenSuperior + altoUtil);
    contexto.stroke();

    contexto.textAlign = "center";
    contexto.fillText(
      formatearNumeroVisible(tick),
      x,
      margenSuperior + altoUtil + 36,
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
  contexto.font = "bold 18px sans-serif";
  contexto.fillText(
    opciones.nombreEjeX,
    margenIzquierdo + anchoUtil / 2,
    altoCanvas - 28,
  );

  puntos.forEach((punto, indice) => {
    contexto.beginPath();
    contexto.fillStyle = punto.color;
    contexto.arc(punto.x, punto.y, punto.radio, 0, Math.PI * 2);
    contexto.fill();

    contexto.lineWidth = opciones.indiceSeleccionado === indice ? 3 : 1.5;
    contexto.strokeStyle =
      opciones.indiceSeleccionado === indice ? "#111111" : "rgba(30, 57, 50, 0.4)";
    contexto.stroke();
  });

  return puntos;
}
