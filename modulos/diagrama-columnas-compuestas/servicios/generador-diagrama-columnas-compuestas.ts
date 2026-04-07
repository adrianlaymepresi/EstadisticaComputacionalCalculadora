import type {
  BarraCompuestaCalculada,
  ConfiguracionEjeYManualCompuesta,
  FilaColumnaCompuesta,
  OpcionesRenderColumnasCompuestas,
} from "@/modulos/diagrama-columnas-compuestas/tipos";

interface ConfiguracionEscalaY {
  minimo: number;
  maximo: number;
  paso: number;
}

const COLORES_SERIES = {
  serieA: "#C4514D",
  serieB: "#5B87C2",
};

function formatearNumeroVisible(valor: number): string {
  const texto = Number.isInteger(valor)
    ? `${valor}`
    : parseFloat(valor.toFixed(2)).toString();

  return texto.replace(".", ",");
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

function esConfiguracionManualValida(
  configuracion?: ConfiguracionEjeYManualCompuesta,
): configuracion is ConfiguracionEjeYManualCompuesta {
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

function calcularEscalaY(
  datos: FilaColumnaCompuesta[],
  configuracionManual?: ConfiguracionEjeYManualCompuesta,
): ConfiguracionEscalaY {
  if (esConfiguracionManualValida(configuracionManual)) {
    return configuracionManual;
  }

  const valorMaximo = Math.max(
    ...datos.map((dato) => Math.max(dato.valorSerieA, dato.valorSerieB)),
    0,
  );
  const paso = calcularPasoBonito(valorMaximo || 1);
  const maximo = Math.max(paso, Math.ceil(valorMaximo / paso) * paso);

  return { minimo: 0, maximo, paso };
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

export function calcularBarrasColumnasCompuestas(
  datos: FilaColumnaCompuesta[],
  anchoCanvas: number,
  altoCanvas: number,
  opciones: OpcionesRenderColumnasCompuestas,
): BarraCompuestaCalculada[] {
  const margenIzquierdo = 90;
  const margenDerecho = 220;
  const margenSuperior = 50;
  const margenInferior = 140;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaY = calcularEscalaY(datos, opciones.ejeYManual);
  const espacioGrupo = anchoUtil / Math.max(datos.length, 1);
  const anchoGrupo = Math.min(150, espacioGrupo * 0.68);
  const espacioInterno = 12;
  const anchoBarra = (anchoGrupo - espacioInterno) / 2;

  return datos.flatMap((dato, indice) => {
    const xGrupo =
      margenIzquierdo + indice * espacioGrupo + (espacioGrupo - anchoGrupo) / 2;

    const crearBarra = (
      serie: "serieA" | "serieB",
      valor: number,
      desplazamiento: number,
      colorBase: string,
    ): BarraCompuestaCalculada => {
      const alto =
        ((valor - escalaY.minimo) / (escalaY.maximo - escalaY.minimo || 1)) *
        altoUtil;
      return {
        x: xGrupo + desplazamiento,
        y: margenSuperior + altoUtil - alto,
        ancho: anchoBarra,
        alto,
        valor,
        categoria: dato.categoria,
        serie,
        color:
          serie === "serieA"
            ? dato.colorSerieA || colorBase
            : dato.colorSerieB || colorBase,
      };
    };

    return [
      crearBarra("serieA", dato.valorSerieA, 0, COLORES_SERIES.serieA),
      crearBarra(
        "serieB",
        dato.valorSerieB,
        anchoBarra + espacioInterno,
        COLORES_SERIES.serieB,
      ),
    ];
  });
}

export function dibujarDiagramaColumnasCompuestas(
  canvas: HTMLCanvasElement,
  datos: FilaColumnaCompuesta[],
  opciones: OpcionesRenderColumnasCompuestas,
): void {
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    return;
  }

  const anchoCanvas = canvas.width;
  const altoCanvas = canvas.height;
  const margenIzquierdo = 90;
  const margenDerecho = 220;
  const margenSuperior = 50;
  const margenInferior = 140;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaY = calcularEscalaY(datos, opciones.ejeYManual);
  const ticksY = crearTicksY(escalaY);
  const barras = calcularBarrasColumnasCompuestas(
    datos,
    anchoCanvas,
    altoCanvas,
    opciones,
  );
  const espacioGrupo = anchoUtil / Math.max(datos.length, 1);

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

  contexto.save();
  contexto.translate(28, margenSuperior + altoUtil / 2);
  contexto.rotate(-Math.PI / 2);
  contexto.textAlign = "center";
  contexto.fillStyle = "#1E3932";
  contexto.font = "bold 18px sans-serif";
  contexto.fillText(opciones.nombreEjeY, 0, 0);
  contexto.restore();

  contexto.textAlign = "center";
  contexto.fillText(
    opciones.nombreEjeX,
    margenIzquierdo + anchoUtil / 2,
    altoCanvas - 26,
  );

  barras.forEach((barra) => {
    const degradado = contexto.createLinearGradient(0, barra.y, 0, barra.y + barra.alto);
    degradado.addColorStop(0, mezclarColor(barra.color, 26));
    degradado.addColorStop(1, mezclarColor(barra.color, -20));

    contexto.fillStyle = degradado;
    contexto.fillRect(barra.x, barra.y, barra.ancho, barra.alto);

    const seleccionada =
      opciones.seleccion?.categoriaIndice ===
        datos.findIndex((dato) => dato.categoria === barra.categoria) &&
      opciones.seleccion.serie === barra.serie;

    contexto.strokeStyle = seleccionada
      ? "#1E3932"
      : mezclarColor(barra.color, -40);
    contexto.lineWidth = seleccionada ? 4 : 2;
    contexto.strokeRect(barra.x, barra.y, barra.ancho, barra.alto);

    contexto.fillStyle = "#111111";
    contexto.font = "bold 18px sans-serif";
    contexto.textAlign = "center";
    contexto.fillText(
      formatearNumeroVisible(barra.valor),
      barra.x + barra.ancho / 2,
      barra.y - 12,
    );
  });

  contexto.font = "15px sans-serif";
  contexto.fillStyle = "#1E3932";
  datos.forEach((dato, indice) => {
    const centroX = margenIzquierdo + indice * espacioGrupo + espacioGrupo / 2;
    contexto.fillText(dato.categoria, centroX, margenSuperior + altoUtil + 42);
  });

  const legendX = anchoCanvas - 180;
  const legendY = margenSuperior + altoUtil / 2 - 40;
  const legendas = [
    { color: COLORES_SERIES.serieA, texto: opciones.nombreSerieA },
    { color: COLORES_SERIES.serieB, texto: opciones.nombreSerieB },
  ];

  contexto.font = "bold 16px sans-serif";
  contexto.textAlign = "left";
  legendas.forEach((leyenda, indice) => {
    const y = legendY + indice * 42;
    contexto.fillStyle = leyenda.color;
    contexto.fillRect(legendX, y, 18, 18);
    contexto.strokeStyle = mezclarColor(leyenda.color, -35);
    contexto.lineWidth = 1.5;
    contexto.strokeRect(legendX, y, 18, 18);
    contexto.fillStyle = "#1E3932";
    contexto.fillText(leyenda.texto, legendX + 28, y + 15);
  });
}
