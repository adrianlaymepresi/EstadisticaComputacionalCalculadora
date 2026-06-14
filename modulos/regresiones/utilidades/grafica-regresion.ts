import type {
  ConfiguracionGraficaRegresion,
  ParRegresion,
  ResultadoCalculoRegresion,
  ResultadoEstimacionRegresion,
} from "@/modulos/regresiones/tipos";
import { redondearValor } from "@/modulos/regresiones/utilidades/formateo-regresion";

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

export const MARGENES_GRAFICA_REGRESION = {
  izquierdo: 92,
  derecho: 48,
  superior: 84,
  inferior: 92,
} as const;

interface OpcionesDibujoRegresion {
  ancho: number;
  alto: number;
  nombreEjeX: string;
  nombreEjeY: string;
  titulo: string;
  ecuacion: string;
  configuracion: ConfiguracionGraficaRegresion;
  estimaciones: ResultadoEstimacionRegresion[];
  rangoVisible: RangoGraficaRegresion;
  pasoEjeX?: number;
  pasoEjeY?: number;
  mostrarEcuacion: boolean;
  mostrarValoresEspeciales: boolean;
}

interface MarcaEspecialRegresion {
  x: number;
  y: number;
  etiqueta: string;
  color: string;
}

const EPSILON_POTENCIAL = 0.000001;

function limpiarCerosFinales(texto: string) {
  return texto.replace(/\.?0+$/, "");
}

function formatearValorEje(valor: number) {
  if (!Number.isFinite(valor)) {
    return "-";
  }

  const valorAbsoluto = Math.abs(valor);

  if (valorAbsoluto >= 1_000_000 || (valorAbsoluto > 0 && valorAbsoluto < 0.0001)) {
    return valor.toExponential(2);
  }

  if (valorAbsoluto >= 1000) {
    return limpiarCerosFinales(valor.toFixed(2));
  }

  if (Number.isInteger(valor)) {
    return `${valor}`;
  }

  return limpiarCerosFinales(valor.toFixed(4));
}

function esRangoValido(rango: RangoGraficaRegresion) {
  return (
    Number.isFinite(rango.minimoX) &&
    Number.isFinite(rango.maximoX) &&
    Number.isFinite(rango.minimoY) &&
    Number.isFinite(rango.maximoY) &&
    rango.minimoX < rango.maximoX &&
    rango.minimoY < rango.maximoY
  );
}

function clonarRango(rango: RangoGraficaRegresion): RangoGraficaRegresion {
  return {
    minimoX: rango.minimoX,
    maximoX: rango.maximoX,
    minimoY: rango.minimoY,
    maximoY: rango.maximoY,
  };
}

function obtenerMinimoPositivoPotencial(
  referencia: number,
  factor: number,
) {
  return Math.max(EPSILON_POTENCIAL, referencia * factor);
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

function valorDentroDeRango(valor: number, minimo: number, maximo: number) {
  const tolerancia = Math.max(Math.abs(maximo - minimo) * 0.000001, 0.000001);
  return valor >= minimo - tolerancia && valor <= maximo + tolerancia;
}

function obtenerParesBase(
  resultado: ResultadoCalculoRegresion,
  estimaciones: ResultadoEstimacionRegresion[],
) {
  return [...resultado.paresOriginales, ...obtenerPuntosEstimados(estimaciones)];
}

function evaluarModeloEnX(
  resultado: ResultadoCalculoRegresion,
  valorX: number,
) {
  if (!Number.isFinite(valorX)) {
    return null;
  }

  if (resultado.metadatosModelo.tipo === "lineal") {
    const valorY =
      resultado.metadatosModelo.a + resultado.metadatosModelo.b * valorX;
    return Number.isFinite(valorY) ? valorY : null;
  }

  if (resultado.metadatosModelo.tipo === "cuadratica") {
    const valorY =
      resultado.metadatosModelo.a +
      resultado.metadatosModelo.b * valorX +
      resultado.metadatosModelo.c * valorX ** 2;
    return Number.isFinite(valorY) ? valorY : null;
  }

  if (resultado.metadatosModelo.tipo === "exponencial") {
    const valorY =
      resultado.metadatosModelo.tipoLogaritmo === "ln"
        ? resultado.metadatosModelo.a *
          Math.exp(resultado.metadatosModelo.b * valorX)
        : resultado.metadatosModelo.a *
          10 ** (resultado.metadatosModelo.b * valorX);
    return Number.isFinite(valorY) ? valorY : null;
  }

  if (valorX <= 0) {
    return null;
  }

  const valorY =
    resultado.metadatosModelo.a * valorX ** resultado.metadatosModelo.b;
  return Number.isFinite(valorY) ? valorY : null;
}

function obtenerVerticeCuadratico(resultado: ResultadoCalculoRegresion) {
  if (resultado.metadatosModelo.tipo !== "cuadratica") {
    return null;
  }

  if (Math.abs(resultado.metadatosModelo.c) < 1e-12) {
    return null;
  }

  const x = -resultado.metadatosModelo.b / (2 * resultado.metadatosModelo.c);
  const y = evaluarModeloEnX(resultado, x);

  if (y === null) {
    return null;
  }

  return { x, y };
}

function generarPuntosCurvaParaRango(
  resultado: ResultadoCalculoRegresion,
  rango: Pick<RangoGraficaRegresion, "minimoX" | "maximoX">,
  cantidadPuntos = 220,
) {
  const puntos: ParRegresion[] = [];
  let minimoX = rango.minimoX;
  const maximoX = rango.maximoX;

  if (resultado.metadatosModelo.tipo === "potencial") {
    minimoX = Math.max(minimoX, EPSILON_POTENCIAL);
  }

  if (!Number.isFinite(minimoX) || !Number.isFinite(maximoX) || minimoX >= maximoX) {
    return puntos;
  }

  const paso = (maximoX - minimoX) / Math.max(cantidadPuntos - 1, 1);

  for (let indice = 0; indice < cantidadPuntos; indice += 1) {
    const x = indice === cantidadPuntos - 1 ? maximoX : minimoX + paso * indice;
    const y = evaluarModeloEnX(resultado, x);

    if (y !== null) {
      puntos.push({ x, y });
    }
  }

  return puntos;
}

function construirRangoY(
  resultado: ResultadoCalculoRegresion,
  estimaciones: ResultadoEstimacionRegresion[],
  minimoX: number,
  maximoX: number,
) {
  const puntosCurva = generarPuntosCurvaParaRango(resultado, {
    minimoX,
    maximoX,
  });
  const puntosDatos = obtenerParesBase(resultado, estimaciones).filter((punto) =>
    valorDentroDeRango(punto.x, minimoX, maximoX),
  );
  const vertice = obtenerVerticeCuadratico(resultado);

  const valoresY = [
    ...puntosCurva.map((punto) => punto.y),
    ...puntosDatos.map((punto) => punto.y),
    ...(vertice && valorDentroDeRango(vertice.x, minimoX, maximoX)
      ? [vertice.y]
      : []),
  ].filter(Number.isFinite);

  if (valoresY.length === 0) {
    return { minimoY: -1, maximoY: 1 };
  }

  let minimoY = Math.min(...valoresY);
  let maximoY = Math.max(...valoresY);
  const rangoYBase =
    maximoY - minimoY || Math.max(Math.abs(maximoY), Math.abs(minimoY), 1);

  if (minimoY > 0 && minimoY <= rangoYBase * 0.2) {
    minimoY = 0;
  }

  if (maximoY < 0 && Math.abs(maximoY) <= rangoYBase * 0.2) {
    maximoY = 0;
  }

  const rangoYFinal =
    maximoY - minimoY || Math.max(Math.abs(maximoY), Math.abs(minimoY), 1);
  const margenY = Math.max(rangoYFinal * 0.14, 0.6);

  return {
    minimoY: minimoY - margenY,
    maximoY: maximoY + margenY,
  };
}

function construirRangoDesdeLimitesX(
  resultado: ResultadoCalculoRegresion,
  estimaciones: ResultadoEstimacionRegresion[],
  minimoX: number,
  maximoX: number,
) {
  const rangoY = construirRangoY(resultado, estimaciones, minimoX, maximoX);

  return {
    minimoX,
    maximoX,
    minimoY: rangoY.minimoY,
    maximoY: rangoY.maximoY,
  };
}

function ajustarLimitesXDominio(
  resultado: ResultadoCalculoRegresion,
  minimoX: number,
  maximoX: number,
  modo: "datos" | "amplia",
) {
  if (resultado.metadatosModelo.tipo !== "potencial") {
    return { minimoX, maximoX };
  }

  const minimoDato = Math.min(...resultado.paresOriginales.map((par) => par.x));
  const minimoPermitido =
    modo === "amplia"
      ? obtenerMinimoPositivoPotencial(minimoDato, 0.08)
      : obtenerMinimoPositivoPotencial(minimoDato, 0.2);

  return {
    minimoX: Math.max(minimoX, minimoPermitido),
    maximoX: Math.max(maximoX, minimoPermitido + 1),
  };
}

export function obtenerPuntosEstimados(
  estimaciones: ResultadoEstimacionRegresion[],
) {
  return estimaciones.flatMap((estimacion) => estimacion.puntosGrafica ?? []);
}

export function construirRangoEnfocadoDatosRegresion(
  resultado: ResultadoCalculoRegresion,
  estimaciones: ResultadoEstimacionRegresion[],
): RangoGraficaRegresion {
  const puntosBase = obtenerParesBase(resultado, estimaciones);
  const valoresX = puntosBase.map((punto) => punto.x).filter(Number.isFinite);
  const minimoDato = Math.min(...valoresX);
  const maximoDato = Math.max(...valoresX);
  const amplitudX =
    maximoDato - minimoDato || Math.max(Math.abs(maximoDato), 1);

  let minimoX = minimoDato - amplitudX * 0.22;
  let maximoX = maximoDato + amplitudX * 0.22;

  const vertice = obtenerVerticeCuadratico(resultado);
  if (vertice) {
    const margenVertice = amplitudX * 0.18;
    if (
      vertice.x >= minimoX - amplitudX * 0.35 &&
      vertice.x <= maximoX + amplitudX * 0.35
    ) {
      minimoX = Math.min(minimoX, vertice.x - margenVertice);
      maximoX = Math.max(maximoX, vertice.x + margenVertice);
    }
  }

  const limitesX = ajustarLimitesXDominio(
    resultado,
    minimoX,
    maximoX,
    "datos",
  );

  return construirRangoDesdeLimitesX(
    resultado,
    estimaciones,
    limitesX.minimoX,
    limitesX.maximoX,
  );
}

export function construirRangoAmplioRegresion(
  resultado: ResultadoCalculoRegresion,
  estimaciones: ResultadoEstimacionRegresion[],
): RangoGraficaRegresion {
  const puntosBase = obtenerParesBase(resultado, estimaciones);
  const valoresX = puntosBase.map((punto) => punto.x).filter(Number.isFinite);
  const minimoDato = Math.min(...valoresX);
  const maximoDato = Math.max(...valoresX);
  const amplitudX =
    maximoDato - minimoDato || Math.max(Math.abs(maximoDato), 1);

  let minimoX = minimoDato - amplitudX * 0.95;
  let maximoX = maximoDato + amplitudX * 0.95;

  const vertice = obtenerVerticeCuadratico(resultado);
  if (vertice) {
    const margenVertice = Math.max(amplitudX * 0.7, 1);
    minimoX = Math.min(minimoX, vertice.x - margenVertice);
    maximoX = Math.max(maximoX, vertice.x + margenVertice);
  }

  const limitesX = ajustarLimitesXDominio(
    resultado,
    minimoX,
    maximoX,
    "amplia",
  );

  return construirRangoDesdeLimitesX(
    resultado,
    estimaciones,
    limitesX.minimoX,
    limitesX.maximoX,
  );
}

export function ajustarRangoManualRegresion(
  resultado: ResultadoCalculoRegresion,
  rangoManual: RangoGraficaRegresion,
) {
  if (!esRangoValido(rangoManual)) {
    throw new Error(
      "La vista manual requiere que X minimo sea menor que X maximo y Y minimo menor que Y maximo.",
    );
  }

  if (
    resultado.metadatosModelo.tipo === "potencial" &&
    rangoManual.minimoX <= 0
  ) {
    throw new Error(
      "La regresion potencial requiere una vista manual con X minimo mayor que 0.",
    );
  }

  return clonarRango(rangoManual);
}

export function centrarRangoEnOrigenRegresion(
  resultado: ResultadoCalculoRegresion,
  rangoActual: RangoGraficaRegresion,
) {
  const ancho = rangoActual.maximoX - rangoActual.minimoX || 1;
  const alto = rangoActual.maximoY - rangoActual.minimoY || 1;

  if (resultado.metadatosModelo.tipo === "potencial") {
    const minimoX = Math.max(ancho * 0.02, EPSILON_POTENCIAL);
    return {
      minimoX,
      maximoX: minimoX + ancho,
      minimoY: -alto / 2,
      maximoY: alto / 2,
    };
  }

  return {
    minimoX: -ancho / 2,
    maximoX: ancho / 2,
    minimoY: -alto / 2,
    maximoY: alto / 2,
  };
}

export function hacerZoomRangoRegresion(
  resultado: ResultadoCalculoRegresion,
  rangoActual: RangoGraficaRegresion,
  factor: number,
  centroX?: number,
  centroY?: number,
) {
  if (!Number.isFinite(factor) || factor <= 0) {
    return clonarRango(rangoActual);
  }

  const anchoIzquierda = (centroX ?? (rangoActual.minimoX + rangoActual.maximoX) / 2) - rangoActual.minimoX;
  const anchoDerecha = rangoActual.maximoX - (centroX ?? (rangoActual.minimoX + rangoActual.maximoX) / 2);
  const altoAbajo = (centroY ?? (rangoActual.minimoY + rangoActual.maximoY) / 2) - rangoActual.minimoY;
  const altoArriba = rangoActual.maximoY - (centroY ?? (rangoActual.minimoY + rangoActual.maximoY) / 2);

  const escala = 1 / factor;
  let minimoX = (centroX ?? (rangoActual.minimoX + rangoActual.maximoX) / 2) - anchoIzquierda * escala;
  let maximoX = (centroX ?? (rangoActual.minimoX + rangoActual.maximoX) / 2) + anchoDerecha * escala;
  const minimoY = (centroY ?? (rangoActual.minimoY + rangoActual.maximoY) / 2) - altoAbajo * escala;
  const maximoY = (centroY ?? (rangoActual.minimoY + rangoActual.maximoY) / 2) + altoArriba * escala;

  if (resultado.metadatosModelo.tipo === "potencial" && minimoX <= EPSILON_POTENCIAL) {
    const desplazamiento = EPSILON_POTENCIAL - minimoX;
    minimoX += desplazamiento;
    maximoX += desplazamiento;
  }

  return {
    minimoX,
    maximoX,
    minimoY,
    maximoY,
  };
}

export function desplazarRangoRegresion(
  resultado: ResultadoCalculoRegresion,
  rangoActual: RangoGraficaRegresion,
  deltaX: number,
  deltaY: number,
) {
  let minimoX = rangoActual.minimoX + deltaX;
  let maximoX = rangoActual.maximoX + deltaX;

  if (resultado.metadatosModelo.tipo === "potencial" && minimoX <= EPSILON_POTENCIAL) {
    const desplazamiento = EPSILON_POTENCIAL - minimoX;
    minimoX += desplazamiento;
    maximoX += desplazamiento;
  }

  return {
    minimoX,
    maximoX,
    minimoY: rangoActual.minimoY + deltaY,
    maximoY: rangoActual.maximoY + deltaY,
  };
}

function construirPasoAutomatico(rango: number, divisionesObjetivo: number) {
  const bruto = Math.abs(rango) / Math.max(divisionesObjetivo, 1);

  if (!Number.isFinite(bruto) || bruto <= 0) {
    return 1;
  }

  const magnitud = 10 ** Math.floor(Math.log10(bruto));
  const fraccion = bruto / magnitud;

  let factor = 1;

  if (fraccion <= 1) {
    factor = 1;
  } else if (fraccion <= 2) {
    factor = 2;
  } else if (fraccion <= 2.5) {
    factor = 2.5;
  } else if (fraccion <= 5) {
    factor = 5;
  } else {
    factor = 10;
  }

  return factor * magnitud;
}

function construirMarcasEje(minimo: number, maximo: number, paso: number) {
  if (!Number.isFinite(minimo) || !Number.isFinite(maximo) || !Number.isFinite(paso) || paso <= 0) {
    return [];
  }

  const inicio = Math.ceil((minimo - paso * 0.000001) / paso) * paso;
  const marcas: number[] = [];

  for (let indice = 0; indice < 600; indice += 1) {
    const valor = redondearValor(inicio + paso * indice, 10);
    if (valor > maximo + paso * 0.000001) {
      break;
    }

    marcas.push(valor);
  }

  if (marcas.length <= 90) {
    return marcas;
  }

  const salto = Math.ceil(marcas.length / 90);
  return marcas.filter((_, indice) => indice % salto === 0);
}

function dibujarEtiquetaPunto(
  contexto: CanvasRenderingContext2D,
  texto: string,
  x: number,
  y: number,
  colorTexto = "#1E3932",
) {
  contexto.save();
  contexto.font = "600 12px sans-serif";
  const anchoTexto = contexto.measureText(texto).width;
  const anchoCaja = anchoTexto + 16;
  const altoCaja = 22;

  contexto.fillStyle = "rgba(255,255,255,0.92)";
  contexto.strokeStyle = "rgba(30,57,50,0.12)";
  contexto.lineWidth = 1;
  contexto.beginPath();
  contexto.roundRect(x, y - altoCaja + 3, anchoCaja, altoCaja, 10);
  contexto.fill();
  contexto.stroke();

  contexto.fillStyle = colorTexto;
  contexto.fillText(texto, x + 8, y - 6);
  contexto.restore();
}

function dibujarCuadriculaYEtiquetas(
  contexto: CanvasRenderingContext2D,
  rango: RangoGraficaRegresion,
  ancho: number,
  alto: number,
  pasoEjeX: number,
  pasoEjeY: number,
) {
  const margenIzquierdo = MARGENES_GRAFICA_REGRESION.izquierdo;
  const margenDerecho = MARGENES_GRAFICA_REGRESION.derecho;
  const margenSuperior = MARGENES_GRAFICA_REGRESION.superior;
  const margenInferior = MARGENES_GRAFICA_REGRESION.inferior;
  const anchoUtil = ancho - margenIzquierdo - margenDerecho;
  const altoUtil = alto - margenSuperior - margenInferior;
  const yEjeX = valorDentroDeRango(0, rango.minimoY, rango.maximoY)
    ? convertirValorYAPixel(0, rango, margenSuperior, altoUtil)
    : rango.minimoY > 0
      ? margenSuperior + altoUtil
      : margenSuperior;
  const xEjeY = valorDentroDeRango(0, rango.minimoX, rango.maximoX)
    ? convertirValorXAPixel(0, rango, margenIzquierdo, anchoUtil)
    : rango.minimoX > 0
      ? margenIzquierdo
      : margenIzquierdo + anchoUtil;
  const marcasX = construirMarcasEje(rango.minimoX, rango.maximoX, pasoEjeX);
  const marcasY = construirMarcasEje(rango.minimoY, rango.maximoY, pasoEjeY);

  contexto.save();
  contexto.font = "500 12px sans-serif";
  contexto.fillStyle = "#607168";
  contexto.strokeStyle = "rgba(30,57,50,0.12)";
  contexto.lineWidth = 1;

  marcasX.forEach((marca) => {
    const x = convertirValorXAPixel(marca, rango, margenIzquierdo, anchoUtil);

    contexto.beginPath();
    contexto.moveTo(x, margenSuperior);
    contexto.lineTo(x, margenSuperior + altoUtil);
    contexto.stroke();

    const texto = formatearValorEje(marca);
    contexto.textAlign = "center";
    contexto.fillText(texto, x, Math.min(alto - 28, yEjeX + 24));
  });

  marcasY.forEach((marca) => {
    const y = convertirValorYAPixel(marca, rango, margenSuperior, altoUtil);

    contexto.beginPath();
    contexto.moveTo(margenIzquierdo, y);
    contexto.lineTo(margenIzquierdo + anchoUtil, y);
    contexto.stroke();

    const texto = formatearValorEje(marca);
    contexto.textAlign = "right";
    contexto.fillText(texto, xEjeY - 10, y + 4);
  });

  contexto.restore();

  return { xEjeY, yEjeX, anchoUtil, altoUtil };
}

function dibujarEjes(
  contexto: CanvasRenderingContext2D,
  anchoUtil: number,
  altoUtil: number,
  xEjeY: number,
  yEjeX: number,
) {
  const margenIzquierdo = MARGENES_GRAFICA_REGRESION.izquierdo;
  const margenSuperior = MARGENES_GRAFICA_REGRESION.superior;

  contexto.save();
  contexto.strokeStyle = "#1E3932";
  contexto.lineWidth = 1.7;

  contexto.beginPath();
  contexto.moveTo(xEjeY, margenSuperior);
  contexto.lineTo(xEjeY, margenSuperior + altoUtil);
  contexto.moveTo(margenIzquierdo, yEjeX);
  contexto.lineTo(margenIzquierdo + anchoUtil, yEjeX);
  contexto.stroke();
  contexto.restore();
}

function dibujarCurvaModelo(
  contexto: CanvasRenderingContext2D,
  resultado: ResultadoCalculoRegresion,
  rango: RangoGraficaRegresion,
  anchoUtil: number,
  altoUtil: number,
) {
  const margenIzquierdo = MARGENES_GRAFICA_REGRESION.izquierdo;
  const margenSuperior = MARGENES_GRAFICA_REGRESION.superior;
  const puntosCurva = generarPuntosCurvaParaRango(resultado, rango, 240);

  if (puntosCurva.length < 2) {
    return;
  }

  contexto.save();
  contexto.strokeStyle = "#006241";
  contexto.lineWidth = 3;
  contexto.lineJoin = "round";
  contexto.lineCap = "round";
  contexto.beginPath();

  let inicioSegmento = true;

  puntosCurva.forEach((punto) => {
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

    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      inicioSegmento = true;
      return;
    }

    if (inicioSegmento) {
      contexto.moveTo(x, y);
      inicioSegmento = false;
      return;
    }

    contexto.lineTo(x, y);
  });

  contexto.stroke();
  contexto.restore();
}

function dibujarPuntosOriginales(
  contexto: CanvasRenderingContext2D,
  resultado: ResultadoCalculoRegresion,
  rango: RangoGraficaRegresion,
  configuracion: ConfiguracionGraficaRegresion,
  anchoUtil: number,
  altoUtil: number,
) {
  const margenIzquierdo = MARGENES_GRAFICA_REGRESION.izquierdo;
  const margenSuperior = MARGENES_GRAFICA_REGRESION.superior;

  resultado.paresOriginales.forEach((punto, indice) => {
    if (
      !valorDentroDeRango(punto.x, rango.minimoX, rango.maximoX) ||
      !valorDentroDeRango(punto.y, rango.minimoY, rango.maximoY)
    ) {
      return;
    }

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

    contexto.save();
    contexto.fillStyle = "#A64B3C";
    contexto.strokeStyle = "#6F2F22";
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.arc(x, y, 5.5, 0, Math.PI * 2);
    contexto.fill();
    contexto.stroke();
    contexto.restore();

    if (configuracion.mostrarEtiquetasPuntos) {
      dibujarEtiquetaPunto(contexto, `${indice + 1}`, x + 8, y - 8);
    }
  });
}

function dibujarPuntosEstimados(
  contexto: CanvasRenderingContext2D,
  estimaciones: ResultadoEstimacionRegresion[],
  rango: RangoGraficaRegresion,
  anchoUtil: number,
  altoUtil: number,
) {
  const margenIzquierdo = MARGENES_GRAFICA_REGRESION.izquierdo;
  const margenSuperior = MARGENES_GRAFICA_REGRESION.superior;

  obtenerPuntosEstimados(estimaciones).forEach((punto) => {
    if (
      !valorDentroDeRango(punto.x, rango.minimoX, rango.maximoX) ||
      !valorDentroDeRango(punto.y, rango.minimoY, rango.maximoY)
    ) {
      return;
    }

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

    contexto.save();
    contexto.fillStyle = punto.color ?? "#D97706";
    contexto.strokeStyle = "#7C2D12";
    contexto.lineWidth = 2;
    contexto.beginPath();
    contexto.arc(x, y, 7, 0, Math.PI * 2);
    contexto.fill();
    contexto.stroke();
    contexto.restore();

    dibujarEtiquetaPunto(
      contexto,
      punto.etiqueta,
      x + 10,
      y - 8,
      "#7C2D12",
    );
  });
}

function obtenerMarcasEspeciales(
  resultado: ResultadoCalculoRegresion,
  rango: RangoGraficaRegresion,
) {
  const marcas: MarcaEspecialRegresion[] = [];

  if (resultado.metadatosModelo.tipo === "lineal") {
    const { a, b } = resultado.metadatosModelo;

    if (valorDentroDeRango(0, rango.minimoX, rango.maximoX) && valorDentroDeRango(a, rango.minimoY, rango.maximoY)) {
      marcas.push({
        x: 0,
        y: a,
        etiqueta: "Corte Y",
        color: "#2563EB",
      });
    }

    if (Math.abs(b) > 1e-12) {
      const x = -a / b;
      if (
        valorDentroDeRango(x, rango.minimoX, rango.maximoX) &&
        valorDentroDeRango(0, rango.minimoY, rango.maximoY)
      ) {
        marcas.push({
          x,
          y: 0,
          etiqueta: "Corte X",
          color: "#2563EB",
        });
      }
    }
  }

  if (resultado.metadatosModelo.tipo === "cuadratica") {
    const vertice = obtenerVerticeCuadratico(resultado);
    if (
      vertice &&
      valorDentroDeRango(vertice.x, rango.minimoX, rango.maximoX) &&
      valorDentroDeRango(vertice.y, rango.minimoY, rango.maximoY)
    ) {
      marcas.push({
        x: vertice.x,
        y: vertice.y,
        etiqueta: "Vertice",
        color: "#1D4ED8",
      });
    }
  }

  return marcas;
}

function dibujarMarcasEspeciales(
  contexto: CanvasRenderingContext2D,
  resultado: ResultadoCalculoRegresion,
  rango: RangoGraficaRegresion,
  anchoUtil: number,
  altoUtil: number,
) {
  const margenIzquierdo = MARGENES_GRAFICA_REGRESION.izquierdo;
  const margenSuperior = MARGENES_GRAFICA_REGRESION.superior;
  const marcas = obtenerMarcasEspeciales(resultado, rango);

  marcas.forEach((marca) => {
    const x = convertirValorXAPixel(
      marca.x,
      rango,
      margenIzquierdo,
      anchoUtil,
    );
    const y = convertirValorYAPixel(
      marca.y,
      rango,
      margenSuperior,
      altoUtil,
    );

    contexto.save();
    contexto.fillStyle = marca.color;
    contexto.strokeStyle = "#FFFFFF";
    contexto.lineWidth = 2.5;
    contexto.beginPath();
    contexto.arc(x, y, 6.3, 0, Math.PI * 2);
    contexto.fill();
    contexto.stroke();
    contexto.restore();

    dibujarEtiquetaPunto(contexto, marca.etiqueta, x + 10, y - 8, marca.color);
  });

  if (
    resultado.metadatosModelo.tipo === "exponencial" &&
    valorDentroDeRango(0, rango.minimoY, rango.maximoY)
  ) {
    const y = convertirValorYAPixel(
      0,
      rango,
      margenSuperior,
      altoUtil,
    );

    contexto.save();
    contexto.setLineDash([7, 7]);
    contexto.strokeStyle = "rgba(37,99,235,0.55)";
    contexto.lineWidth = 1.4;
    contexto.beginPath();
    contexto.moveTo(margenIzquierdo, y);
    contexto.lineTo(margenIzquierdo + anchoUtil, y);
    contexto.stroke();
    contexto.restore();

    dibujarEtiquetaPunto(
      contexto,
      "Asintota Y = 0",
      margenIzquierdo + anchoUtil - 122,
      y - 8,
      "#1D4ED8",
    );
  }
}

function dibujarEncabezados(
  contexto: CanvasRenderingContext2D,
  resultado: ResultadoCalculoRegresion,
  opciones: OpcionesDibujoRegresion,
  rango: RangoGraficaRegresion,
  anchoUtil: number,
  altoUtil: number,
) {
  const margenIzquierdo = MARGENES_GRAFICA_REGRESION.izquierdo;
  const margenSuperior = MARGENES_GRAFICA_REGRESION.superior;

  contexto.save();
  contexto.fillStyle = "#1E3932";
  contexto.font = "700 24px sans-serif";
  contexto.textAlign = "center";
  contexto.fillText(opciones.titulo, opciones.ancho / 2, 36);
  contexto.restore();

  if (opciones.mostrarEcuacion) {
    contexto.save();
    contexto.font = "600 13px sans-serif";
    const anchoCaja = Math.min(
      opciones.ancho - margenIzquierdo - 32,
      contexto.measureText(opciones.ecuacion).width + 24,
    );
    contexto.fillStyle = "rgba(255,255,255,0.94)";
    contexto.strokeStyle = "rgba(30,57,50,0.14)";
    contexto.lineWidth = 1;
    contexto.beginPath();
    contexto.roundRect(margenIzquierdo + 12, 50, anchoCaja, 28, 12);
    contexto.fill();
    contexto.stroke();
    contexto.fillStyle = "#1E3932";
    contexto.textAlign = "left";
    contexto.fillText(opciones.ecuacion, margenIzquierdo + 24, 69);
    contexto.restore();
  }

  contexto.save();
  contexto.fillStyle = "#1E3932";
  contexto.font = "600 16px sans-serif";
  contexto.textAlign = "center";
  contexto.fillText(
    opciones.nombreEjeX,
    margenIzquierdo + anchoUtil / 2,
    opciones.alto - 36,
  );
  contexto.translate(30, margenSuperior + altoUtil / 2);
  contexto.rotate(-Math.PI / 2);
  contexto.fillText(opciones.nombreEjeY, 0, 0);
  contexto.restore();

  if (opciones.mostrarValoresEspeciales) {
    const etiquetaDominio =
      resultado.metadatosModelo.tipo === "potencial"
        ? "Dominio: X > 0"
        : resultado.metadatosModelo.tipo === "exponencial"
          ? "Curva original en plano X, Y"
          : "Vista ampliable del modelo";

    contexto.save();
    contexto.font = "600 12px sans-serif";
    contexto.textAlign = "right";
    contexto.fillStyle = "#5F6F68";
    contexto.fillText(etiquetaDominio, opciones.ancho - 18, opciones.alto - 16);
    contexto.restore();
  }

  contexto.save();
  contexto.font = "500 12px sans-serif";
  contexto.textAlign = "left";
  contexto.fillStyle = "#5F6F68";
  const rangoTexto = `X: ${formatearValorEje(rango.minimoX)} a ${formatearValorEje(
    rango.maximoX,
  )} | Y: ${formatearValorEje(rango.minimoY)} a ${formatearValorEje(
    rango.maximoY,
  )}`;
  contexto.fillText(rangoTexto, margenIzquierdo, opciones.alto - 16);
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

  const rango = esRangoValido(opciones.rangoVisible)
    ? opciones.rangoVisible
    : construirRangoEnfocadoDatosRegresion(resultado, opciones.estimaciones);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const ancho = opciones.ancho;
  const alto = opciones.alto;

  canvas.width = Math.round(ancho * dpr);
  canvas.height = Math.round(alto * dpr);
  contexto.setTransform(dpr, 0, 0, dpr, 0, 0);

  const margenIzquierdo = MARGENES_GRAFICA_REGRESION.izquierdo;
  const margenDerecho = MARGENES_GRAFICA_REGRESION.derecho;
  const margenSuperior = MARGENES_GRAFICA_REGRESION.superior;
  const margenInferior = MARGENES_GRAFICA_REGRESION.inferior;
  const anchoUtil = ancho - margenIzquierdo - margenDerecho;
  const altoUtil = alto - margenSuperior - margenInferior;
  const pasoEjeX =
    opciones.pasoEjeX && opciones.pasoEjeX > 0
      ? opciones.pasoEjeX
      : construirPasoAutomatico(rango.maximoX - rango.minimoX, 8);
  const pasoEjeY =
    opciones.pasoEjeY && opciones.pasoEjeY > 0
      ? opciones.pasoEjeY
      : construirPasoAutomatico(rango.maximoY - rango.minimoY, 7);

  contexto.clearRect(0, 0, ancho, alto);
  contexto.fillStyle = "#FBFCFA";
  contexto.fillRect(0, 0, ancho, alto);

  if (opciones.configuracion.mostrarCuadricula) {
    const { xEjeY, yEjeX } = dibujarCuadriculaYEtiquetas(
      contexto,
      rango,
      ancho,
      alto,
      pasoEjeX,
      pasoEjeY,
    );
    dibujarEjes(contexto, anchoUtil, altoUtil, xEjeY, yEjeX);
  } else {
    const xEjeY = valorDentroDeRango(0, rango.minimoX, rango.maximoX)
      ? convertirValorXAPixel(0, rango, margenIzquierdo, anchoUtil)
      : rango.minimoX > 0
        ? margenIzquierdo
        : margenIzquierdo + anchoUtil;
    const yEjeX = valorDentroDeRango(0, rango.minimoY, rango.maximoY)
      ? convertirValorYAPixel(0, rango, margenSuperior, altoUtil)
      : rango.minimoY > 0
        ? margenSuperior + altoUtil
        : margenSuperior;
    dibujarEjes(contexto, anchoUtil, altoUtil, xEjeY, yEjeX);
  }

  if (opciones.configuracion.mostrarCurvaRegresion) {
    dibujarCurvaModelo(contexto, resultado, rango, anchoUtil, altoUtil);
  }

  if (opciones.configuracion.mostrarPuntosOriginales) {
    dibujarPuntosOriginales(
      contexto,
      resultado,
      rango,
      opciones.configuracion,
      anchoUtil,
      altoUtil,
    );
  }

  dibujarPuntosEstimados(
    contexto,
    opciones.estimaciones,
    rango,
    anchoUtil,
    altoUtil,
  );

  if (opciones.mostrarValoresEspeciales) {
    dibujarMarcasEspeciales(
      contexto,
      resultado,
      rango,
      anchoUtil,
      altoUtil,
    );
  }

  dibujarEncabezados(
    contexto,
    resultado,
    opciones,
    rango,
    anchoUtil,
    altoUtil,
  );
}
