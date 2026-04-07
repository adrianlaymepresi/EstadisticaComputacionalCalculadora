import type {
  ConfiguracionEjeYManualPictogramas,
  FilaDiagramaPictogramas,
  ImagenPictogramaRender,
  OpcionesRenderPictogramas,
  PictogramaCalculado,
} from "@/modulos/diagrama-pictogramas/tipos";

interface ConfiguracionEscalaY {
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
  configuracion?: ConfiguracionEjeYManualPictogramas,
): configuracion is ConfiguracionEjeYManualPictogramas {
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

function calcularEscalaY(
  datos: FilaDiagramaPictogramas[],
  configuracionManual?: ConfiguracionEjeYManualPictogramas,
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

export function calcularPictogramasDiagrama(
  datos: FilaDiagramaPictogramas[],
  imagenes: ImagenPictogramaRender[],
  anchoCanvas: number,
  altoCanvas: number,
  opciones: OpcionesRenderPictogramas,
): PictogramaCalculado[] {
  const margenIzquierdo = 90;
  const margenDerecho = 60;
  const margenSuperior = 55;
  const margenInferior = 150;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaY = calcularEscalaY(datos, opciones.ejeYManual);
  const espacioPorElemento = anchoUtil / Math.max(datos.length, 1);
  const altoMaximoPictograma = altoUtil * 0.82;

  return datos.map((dato, indice) => {
    const relacionAspecto = imagenes[indice]?.relacionAspecto || 1;
    const proporcion =
      (dato.valor - escalaY.minimo) / (escalaY.maximo - escalaY.minimo || 1);
    let alto =
      proporcion <= 0 ? 0 : Math.max(52, proporcion * altoMaximoPictograma);
    let ancho = alto * relacionAspecto;
    const anchoMaximo = espacioPorElemento * 0.7;

    if (ancho > anchoMaximo) {
      const escala = anchoMaximo / ancho;
      ancho *= escala;
      alto *= escala;
    }

    const x =
      margenIzquierdo +
      indice * espacioPorElemento +
      (espacioPorElemento - ancho) / 2;
    const y = margenSuperior + altoUtil - alto;

    return {
      x,
      y,
      ancho,
      alto,
      etiqueta: dato.categoria,
      valor: dato.valor,
    };
  });
}

export function dibujarDiagramaPictogramas(
  canvas: HTMLCanvasElement,
  datos: FilaDiagramaPictogramas[],
  imagenes: ImagenPictogramaRender[],
  opciones: OpcionesRenderPictogramas,
): PictogramaCalculado[] {
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    return [];
  }

  const anchoCanvas = canvas.width;
  const altoCanvas = canvas.height;
  const margenIzquierdo = 90;
  const margenDerecho = 60;
  const margenSuperior = 55;
  const margenInferior = 150;
  const anchoUtil = anchoCanvas - margenIzquierdo - margenDerecho;
  const altoUtil = altoCanvas - margenSuperior - margenInferior;
  const escalaY = calcularEscalaY(datos, opciones.ejeYManual);
  const ticksY = crearTicksY(escalaY);
  const pictogramas = calcularPictogramasDiagrama(
    datos,
    imagenes,
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
  contexto.fillStyle = "#1E3932";
  contexto.fillText(
    opciones.nombreEjeX,
    margenIzquierdo + anchoUtil / 2,
    altoCanvas - 26,
  );

  pictogramas.forEach((pictograma, indice) => {
    const imagen = imagenes[indice]?.imagen;

    if (!imagen) {
      return;
    }

    contexto.drawImage(
      imagen,
      pictograma.x,
      pictograma.y,
      pictograma.ancho,
      pictograma.alto,
    );

    if (opciones.indiceSeleccionado === indice) {
      contexto.strokeStyle = "#111111";
      contexto.lineWidth = 2;
      contexto.strokeRect(
        pictograma.x - 2,
        pictograma.y - 2,
        pictograma.ancho + 4,
        pictograma.alto + 4,
      );
    }

    contexto.fillStyle = "#111111";
    contexto.font = "bold 18px sans-serif";
    contexto.textAlign = "center";
    contexto.fillText(
      formatearNumeroVisible(pictograma.valor),
      pictograma.x + pictograma.ancho / 2,
      pictograma.y - 12,
    );

    contexto.font = "15px sans-serif";
    contexto.fillStyle = "#1E3932";
    dividirEtiqueta(pictograma.etiqueta).forEach((linea, lineaIndice) => {
      contexto.fillText(
        linea,
        pictograma.x + pictograma.ancho / 2,
        margenSuperior + altoUtil + 42 + lineaIndice * 18,
      );
    });
  });

  return pictogramas;
}
