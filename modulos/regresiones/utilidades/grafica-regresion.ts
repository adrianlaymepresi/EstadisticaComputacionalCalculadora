import type {
  ConfiguracionGraficaRegresion,
  ParRegresion,
  ResultadoCalculoRegresion,
  ResultadoEstimacionRegresion,
} from "@/modulos/regresiones/tipos";

export interface PuntoCanvasRegresion {
  x: number;
  y: number;
}

export interface RangoGraficaRegresion {
  minimoX: number;
  maximoX: number;
  minimoY: number;
  maximoY: number;
}

interface OpcionesDibujoRegresion {
  ancho: number;
  alto: number;
  nombreEjeX: string;
  nombreEjeY: string;
  titulo: string;
  ecuacion: string;
  configuracion: ConfiguracionGraficaRegresion;
  estimaciones: ResultadoEstimacionRegresion[];
}

function convertirValorXAPixel(
  x: number,
  rango: RangoGraficaRegresion,
  margenIzquierdo: number,
  anchoUtil: number,
) {
  return (
    margenIzquierdo +
    ((x - rango.minimoX) / (rango.maximoX - rango.minimoX || 1)) * anchoUtil
  );
}

function convertirValorYAPixel(
  y: number,
  rango: RangoGraficaRegresion,
  margenSuperior: number,
  altoUtil: number,
) {
  return (
    margenSuperior +
    altoUtil -
    ((y - rango.minimoY) / (rango.maximoY - rango.minimoY || 1)) * altoUtil
  );
}

export function obtenerPuntosEstimados(
  estimaciones: ResultadoEstimacionRegresion[],
) {
  return estimaciones.flatMap((estimacion) => estimacion.puntosGrafica ?? []);
}

export function construirRangoGraficaRegresion(
  resultado: ResultadoCalculoRegresion,
  estimaciones: ResultadoEstimacionRegresion[],
): RangoGraficaRegresion {
  const puntosEstimados = obtenerPuntosEstimados(estimaciones);
  const puntosBase = [
    ...resultado.paresOriginales,
    ...resultado.puntosCurva,
    ...puntosEstimados,
  ];

  const xs = puntosBase.map((punto) => punto.x).filter(Number.isFinite);
  const ys = puntosBase.map((punto) => punto.y).filter(Number.isFinite);

  const minimoX = Math.min(...xs);
  const maximoX = Math.max(...xs);
  const minimoY = Math.min(...ys);
  const maximoY = Math.max(...ys);
  const rangoX = maximoX - minimoX || 1;
  const rangoY = maximoY - minimoY || 1;
  const margenX = rangoX * 0.08;
  const margenY = rangoY * 0.1;

  return {
    minimoX: minimoX - margenX,
    maximoX: maximoX + margenX,
    minimoY: minimoY - margenY,
    maximoY: maximoY + margenY,
  };
}

function dibujarEtiqueta(
  contexto: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
) {
  contexto.fillStyle = "#1E3932";
  contexto.font = "600 12px sans-serif";
  contexto.fillText(texto, x, y);
}

function dibujarCuadricula(
  contexto: CanvasRenderingContext2D,
  rango: RangoGraficaRegresion,
  ancho: number,
  alto: number,
  margenIzquierdo: number,
  margenDerecho: number,
  margenSuperior: number,
  margenInferior: number,
) {
  const anchoUtil = ancho - margenIzquierdo - margenDerecho;
  const altoUtil = alto - margenSuperior - margenInferior;
  const divisiones = 5;

  contexto.save();
  contexto.strokeStyle = "rgba(30,57,50,0.12)";
  contexto.lineWidth = 1;
  contexto.fillStyle = "#5F6F68";
  contexto.font = "500 12px sans-serif";

  for (let indice = 0; indice <= divisiones; indice += 1) {
    const proporcion = indice / divisiones;
    const x = margenIzquierdo + proporcion * anchoUtil;
    const y = margenSuperior + proporcion * altoUtil;
    const valorX = rango.minimoX + proporcion * (rango.maximoX - rango.minimoX);
    const valorY = rango.maximoY - proporcion * (rango.maximoY - rango.minimoY);

    contexto.beginPath();
    contexto.moveTo(x, margenSuperior);
    contexto.lineTo(x, margenSuperior + altoUtil);
    contexto.stroke();

    contexto.beginPath();
    contexto.moveTo(margenIzquierdo, y);
    contexto.lineTo(margenIzquierdo + anchoUtil, y);
    contexto.stroke();

    contexto.fillText(valorX.toFixed(2), x - 14, margenSuperior + altoUtil + 24);
    contexto.fillText(valorY.toFixed(2), margenIzquierdo - 54, y + 4);
  }

  contexto.restore();
}

export function dibujarGraficaRegresionEnCanvas(
  canvas: HTMLCanvasElement,
  resultado: ResultadoCalculoRegresion,
  opciones: OpcionesDibujoRegresion,
) {
  const contexto = canvas.getContext("2d");

  if (!contexto) {
    return;
  }

  canvas.width = opciones.ancho;
  canvas.height = opciones.alto;

  const margenIzquierdo = 88;
  const margenDerecho = 36;
  const margenSuperior = 78;
  const margenInferior = 88;
  const anchoUtil = opciones.ancho - margenIzquierdo - margenDerecho;
  const altoUtil = opciones.alto - margenSuperior - margenInferior;
  const rango = construirRangoGraficaRegresion(resultado, opciones.estimaciones);

  contexto.clearRect(0, 0, opciones.ancho, opciones.alto);
  contexto.fillStyle = "#FBFCFA";
  contexto.fillRect(0, 0, opciones.ancho, opciones.alto);

  if (opciones.configuracion.mostrarCuadricula) {
    dibujarCuadricula(
      contexto,
      rango,
      opciones.ancho,
      opciones.alto,
      margenIzquierdo,
      margenDerecho,
      margenSuperior,
      margenInferior,
    );
  }

  contexto.save();
  contexto.strokeStyle = "#1E3932";
  contexto.lineWidth = 1.5;

  contexto.beginPath();
  contexto.moveTo(margenIzquierdo, margenSuperior);
  contexto.lineTo(margenIzquierdo, margenSuperior + altoUtil);
  contexto.lineTo(margenIzquierdo + anchoUtil, margenSuperior + altoUtil);
  contexto.stroke();
  contexto.restore();

  if (opciones.configuracion.mostrarCurvaRegresion) {
    const puntosCurva = resultado.puntosCurva.filter(
      (punto) => Number.isFinite(punto.x) && Number.isFinite(punto.y),
    );

    if (puntosCurva.length >= 2) {
      contexto.save();
      contexto.strokeStyle = "#006241";
      contexto.lineWidth = 3;
      contexto.beginPath();

      puntosCurva.forEach((punto, indice) => {
        const x = convertirValorXAPixel(
          punto.x,
          rango,
          margenIzquierdo,
          anchoUtil,
        );
        const y = convertirValorYAPixel(
          punto.y,
          rango,
          margenSuperior,
          altoUtil,
        );

        if (indice === 0) {
          contexto.moveTo(x, y);
        } else {
          contexto.lineTo(x, y);
        }
      });

      contexto.stroke();
      contexto.restore();
    }
  }

  if (opciones.configuracion.mostrarPuntosOriginales) {
    resultado.paresOriginales.forEach((punto, indice) => {
      const x = convertirValorXAPixel(punto.x, rango, margenIzquierdo, anchoUtil);
      const y = convertirValorYAPixel(punto.y, rango, margenSuperior, altoUtil);

      contexto.save();
      contexto.fillStyle = "#A64B3C";
      contexto.strokeStyle = "#5F261D";
      contexto.lineWidth = 2;
      contexto.beginPath();
      contexto.arc(x, y, 5.5, 0, Math.PI * 2);
      contexto.fill();
      contexto.stroke();
      contexto.restore();

      if (opciones.configuracion.mostrarEtiquetasPuntos) {
        dibujarEtiqueta(contexto, `${indice + 1}`, x + 8, y - 8);
      }
    });
  }

  obtenerPuntosEstimados(opciones.estimaciones).forEach((punto) => {
    const x = convertirValorXAPixel(punto.x, rango, margenIzquierdo, anchoUtil);
    const y = convertirValorYAPixel(punto.y, rango, margenSuperior, altoUtil);

    contexto.save();
    contexto.fillStyle = punto.color ?? "#D97706";
    contexto.strokeStyle = "#7C2D12";
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.arc(x, y, 7, 0, Math.PI * 2);
    contexto.fill();
    contexto.stroke();
    contexto.restore();

    dibujarEtiqueta(contexto, punto.etiqueta, x + 10, y - 10);
  });

  contexto.save();
  contexto.fillStyle = "#1E3932";
  contexto.font = "700 24px sans-serif";
  contexto.textAlign = "center";
  contexto.fillText(opciones.titulo, opciones.ancho / 2, 34);
  contexto.restore();

  contexto.save();
  contexto.fillStyle = "#1E3932";
  contexto.font = "600 14px sans-serif";
  contexto.textAlign = "center";
  contexto.fillText(
    opciones.ecuacion,
    opciones.ancho / 2,
    opciones.alto - 22,
  );
  contexto.restore();

  contexto.save();
  contexto.fillStyle = "#1E3932";
  contexto.font = "600 16px sans-serif";
  contexto.textAlign = "center";
  contexto.fillText(
    opciones.nombreEjeX,
    margenIzquierdo + anchoUtil / 2,
    opciones.alto - 52,
  );
  contexto.translate(28, margenSuperior + altoUtil / 2);
  contexto.rotate(-Math.PI / 2);
  contexto.fillText(opciones.nombreEjeY, 0, 0);
  contexto.restore();
}
