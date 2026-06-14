"use client";

import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  manejarTeclaEntradaNumerica,
  sanitizarTextoEntradaNumerica,
} from "@/modulos/medidas-posicion/servicios/entrada-numerica-medidas-posicion";
import type {
  ConfiguracionGraficaRegresion,
  ResultadoCalculoRegresion,
  ResultadoEstimacionRegresion,
} from "@/modulos/regresiones/tipos";
import {
  MARGENES_GRAFICA_REGRESION,
  ajustarRangoManualRegresion,
  centrarRangoEnOrigenRegresion,
  construirRangoAmplioRegresion,
  construirRangoEnfocadoDatosRegresion,
  dibujarGraficaRegresionEnCanvas,
  desplazarRangoRegresion,
  hacerZoomRangoRegresion,
  type RangoGraficaRegresion,
} from "@/modulos/regresiones/utilidades/grafica-regresion";
import {
  obtenerNombreVariableXVisible,
  obtenerNombreVariableYVisible,
} from "@/modulos/regresiones/utilidades/formateo-regresion";

interface GraficaRegresionCanvasProps {
  resultado: ResultadoCalculoRegresion;
  configuracionGrafica: ConfiguracionGraficaRegresion;
  estimaciones: ResultadoEstimacionRegresion[];
  lienzoRefExterno: RefObject<HTMLCanvasElement | null>;
}

interface MensajeVista {
  tipo: "error" | "info";
  texto: string;
}

type ModoVistaRegresion = "datos" | "amplia" | "manual";

interface EstadoArrastre {
  clienteX: number;
  clienteY: number;
  rangoInicial: RangoGraficaRegresion;
}

function formatearValorControl(valor: number) {
  if (!Number.isFinite(valor)) {
    return "";
  }

  const texto = valor.toFixed(6).replace(/\.?0+$/, "");
  return texto;
}

function parsearNumeroControl(texto: string) {
  const textoLimpio = texto.trim().replace(",", ".");

  if (!textoLimpio) {
    return null;
  }

  const numero = Number(textoLimpio);
  return Number.isFinite(numero) ? numero : null;
}

function construirTextoModoVista(modoVista: ModoVistaRegresion) {
  switch (modoVista) {
    case "amplia":
      return "Vista amplia";
    case "manual":
      return "Vista manual";
    default:
      return "Ajustada a datos";
  }
}

function obtenerDescripcionDominio(
  resultado: ResultadoCalculoRegresion,
) {
  switch (resultado.metadatosModelo.tipo) {
    case "potencial":
      return "Dominio del modelo: X > 0 y Y > 0.";
    case "exponencial":
      return "La curva se dibuja en el plano original X, Y sin forzar valores negativos artificiales.";
    case "cuadratica":
      return "La vista amplia incluye curvatura y considera el vertice cuando ayuda a leer mejor la parabola.";
    default:
      return "La recta puede extenderse a izquierda y derecha para apreciar mejor la pendiente.";
  }
}

function obtenerClasesMensajeVista(tipo: MensajeVista["tipo"]) {
  if (tipo === "error") {
    return "border-alerta/20 bg-alerta/8 text-alerta";
  }

  return "border-acento-principal/15 bg-acento-principal/8 text-acento-principal";
}

function sonIgualesRangos(
  primerRango: RangoGraficaRegresion,
  segundoRango: RangoGraficaRegresion,
) {
  const tolerancia = 0.000001;

  return (
    Math.abs(primerRango.minimoX - segundoRango.minimoX) <= tolerancia &&
    Math.abs(primerRango.maximoX - segundoRango.maximoX) <= tolerancia &&
    Math.abs(primerRango.minimoY - segundoRango.minimoY) <= tolerancia &&
    Math.abs(primerRango.maximoY - segundoRango.maximoY) <= tolerancia
  );
}

export function GraficaRegresionCanvas({
  resultado,
  configuracionGrafica,
  estimaciones,
  lienzoRefExterno,
}: GraficaRegresionCanvasProps) {
  const rangoInicial = useMemo(
    () => construirRangoEnfocadoDatosRegresion(resultado, estimaciones),
    [estimaciones, resultado],
  );
  const rangoAmplio = useMemo(
    () => construirRangoAmplioRegresion(resultado, estimaciones),
    [estimaciones, resultado],
  );
  const nombreEjeX = useMemo(
    () =>
      obtenerNombreVariableXVisible(resultado.configuracion.personalizacion),
    [resultado.configuracion.personalizacion],
  );
  const nombreEjeY = useMemo(
    () =>
      obtenerNombreVariableYVisible(resultado.configuracion.personalizacion),
    [resultado.configuracion.personalizacion],
  );
  const contenedorRef = useRef<HTMLDivElement>(null);
  const arrastreRef = useRef<EstadoArrastre | null>(null);
  const [dimensiones, setDimensiones] = useState({
    ancho: 980,
    alto: 580,
  });
  const [modoVista, setModoVista] = useState<ModoVistaRegresion>("datos");
  const [rangoVisible, setRangoVisible] =
    useState<RangoGraficaRegresion>(rangoInicial);
  const [textoPasoEjeX, setTextoPasoEjeX] = useState("");
  const [textoPasoEjeY, setTextoPasoEjeY] = useState("");
  const [textoXMin, setTextoXMin] = useState(formatearValorControl(rangoInicial.minimoX));
  const [textoXMax, setTextoXMax] = useState(formatearValorControl(rangoInicial.maximoX));
  const [textoYMin, setTextoYMin] = useState(formatearValorControl(rangoInicial.minimoY));
  const [textoYMax, setTextoYMax] = useState(formatearValorControl(rangoInicial.maximoY));
  const [mostrarEcuacionGrafica, setMostrarEcuacionGrafica] = useState(true);
  const [mostrarValoresEspeciales, setMostrarValoresEspeciales] =
    useState(true);
  const [mensajeVista, setMensajeVista] = useState<MensajeVista | null>(null);
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const pasoEjeXManual = parsearNumeroControl(textoPasoEjeX);
  const pasoEjeYManual = parsearNumeroControl(textoPasoEjeY);

  const errorPasoEjeX =
    textoPasoEjeX.trim() && (!pasoEjeXManual || pasoEjeXManual <= 0)
      ? "El paso del eje X debe ser mayor que 0."
      : null;
  const errorPasoEjeY =
    textoPasoEjeY.trim() && (!pasoEjeYManual || pasoEjeYManual <= 0)
      ? "El paso del eje Y debe ser mayor que 0."
      : null;

  useEffect(() => {
    const actualizarDimensiones = () => {
      const contenedor = contenedorRef.current;

      if (!contenedor) {
        return;
      }

      const anchoDisponible = contenedor.offsetWidth - 18;
      const ancho = Math.max(700, anchoDisponible);
      const alto = Math.max(460, Math.round(ancho * 0.6));

      setDimensiones((estadoActual) =>
        estadoActual.ancho === ancho && estadoActual.alto === alto
          ? estadoActual
          : { ancho, alto },
      );
    };

    actualizarDimensiones();
    window.addEventListener("resize", actualizarDimensiones);

    return () => window.removeEventListener("resize", actualizarDimensiones);
  }, []);

  useEffect(() => {
    const lienzo = lienzoRefExterno.current;

    if (!lienzo) {
      return;
    }

    dibujarGraficaRegresionEnCanvas(lienzo, resultado, {
      ancho: dimensiones.ancho,
      alto: dimensiones.alto,
      nombreEjeX,
      nombreEjeY,
      titulo: `Grafica de ${resultado.titulo.toLowerCase()}`,
      ecuacion: resultado.ecuacionFinal,
      configuracion: configuracionGrafica,
      estimaciones,
      rangoVisible,
      pasoEjeX:
        errorPasoEjeX || !pasoEjeXManual || pasoEjeXManual <= 0
          ? undefined
          : pasoEjeXManual,
      pasoEjeY:
        errorPasoEjeY || !pasoEjeYManual || pasoEjeYManual <= 0
          ? undefined
          : pasoEjeYManual,
      mostrarEcuacion: mostrarEcuacionGrafica,
      mostrarValoresEspeciales,
    });
  }, [
    configuracionGrafica,
    dimensiones.alto,
    dimensiones.ancho,
    errorPasoEjeX,
    errorPasoEjeY,
    estimaciones,
    lienzoRefExterno,
    mostrarEcuacionGrafica,
    mostrarValoresEspeciales,
    nombreEjeX,
    nombreEjeY,
    pasoEjeXManual,
    pasoEjeYManual,
    rangoVisible,
    resultado,
  ]);

  useEffect(() => {
    if (!estaArrastrando) {
      return;
    }

    const manejarMovimiento = (evento: PointerEvent) => {
      const estadoArrastre = arrastreRef.current;

      if (!estadoArrastre) {
        return;
      }

      const anchoUtil = Math.max(
        dimensiones.ancho -
          MARGENES_GRAFICA_REGRESION.izquierdo -
          MARGENES_GRAFICA_REGRESION.derecho,
        1,
      );
      const altoUtil = Math.max(
        dimensiones.alto -
          MARGENES_GRAFICA_REGRESION.superior -
          MARGENES_GRAFICA_REGRESION.inferior,
        1,
      );
      const desplazamientoXCliente = evento.clientX - estadoArrastre.clienteX;
      const desplazamientoYCliente = evento.clientY - estadoArrastre.clienteY;
      const deltaXValor =
        (-desplazamientoXCliente / anchoUtil) *
        (estadoArrastre.rangoInicial.maximoX -
          estadoArrastre.rangoInicial.minimoX);
      const deltaYValor =
        (desplazamientoYCliente / altoUtil) *
        (estadoArrastre.rangoInicial.maximoY -
          estadoArrastre.rangoInicial.minimoY);

      setRangoVisible(
        desplazarRangoRegresion(
          resultado,
          estadoArrastre.rangoInicial,
          deltaXValor,
          deltaYValor,
        ),
      );
      setModoVista("manual");
    };

    const finalizarArrastre = () => {
      arrastreRef.current = null;
      setEstaArrastrando(false);
    };

    window.addEventListener("pointermove", manejarMovimiento);
    window.addEventListener("pointerup", finalizarArrastre);

    return () => {
      window.removeEventListener("pointermove", manejarMovimiento);
      window.removeEventListener("pointerup", finalizarArrastre);
    };
  }, [dimensiones.alto, dimensiones.ancho, estaArrastrando, resultado]);

  const sincronizarCamposManual = (rango: RangoGraficaRegresion) => {
    setTextoXMin(formatearValorControl(rango.minimoX));
    setTextoXMax(formatearValorControl(rango.maximoX));
    setTextoYMin(formatearValorControl(rango.minimoY));
    setTextoYMax(formatearValorControl(rango.maximoY));
  };

  const aplicarVistaDatos = () => {
    setModoVista("datos");
    setRangoVisible(rangoInicial);
    sincronizarCamposManual(rangoInicial);
    setMensajeVista(null);
  };

  const aplicarVistaAmplia = () => {
    setModoVista("amplia");
    setRangoVisible(rangoAmplio);
    sincronizarCamposManual(rangoAmplio);
    setMensajeVista(null);
  };

  const restablecerVista = () => {
    setModoVista("datos");
    setRangoVisible(rangoInicial);
    sincronizarCamposManual(rangoInicial);
    setTextoPasoEjeX("");
    setTextoPasoEjeY("");
    setMensajeVista(null);
  };

  const centrarEnOrigen = () => {
    const siguienteRango = centrarRangoEnOrigenRegresion(resultado, rangoVisible);
    setModoVista("manual");
    setRangoVisible(siguienteRango);
    sincronizarCamposManual(siguienteRango);
    setMensajeVista(null);
  };

  const aplicarVistaManual = () => {
    const minimoX = parsearNumeroControl(textoXMin);
    const maximoX = parsearNumeroControl(textoXMax);
    const minimoY = parsearNumeroControl(textoYMin);
    const maximoY = parsearNumeroControl(textoYMax);

    if (
      minimoX === null ||
      maximoX === null ||
      minimoY === null ||
      maximoY === null
    ) {
      setMensajeVista({
        tipo: "error",
        texto:
          "Completa los cuatro limites manuales con numeros validos antes de aplicar la vista.",
      });
      return;
    }

    try {
      const rangoManual = ajustarRangoManualRegresion(resultado, {
        minimoX,
        maximoX,
        minimoY,
        maximoY,
      });

      setModoVista("manual");
      setRangoVisible(rangoManual);
      sincronizarCamposManual(rangoManual);
      setMensajeVista(null);
    } catch (error) {
      setMensajeVista({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo aplicar la vista manual.",
      });
    }
  };

  const aplicarZoom = (factor: number) => {
    setModoVista("manual");
    setRangoVisible((estadoActual) =>
      hacerZoomRangoRegresion(resultado, estadoActual, factor),
    );
    setMensajeVista(null);
  };

  const manejarRueda = (evento: React.WheelEvent<HTMLCanvasElement>) => {
    evento.preventDefault();

    const lienzo = lienzoRefExterno.current;

    if (!lienzo) {
      return;
    }

    const rect = lienzo.getBoundingClientRect();
    const anchoLocal = Math.max(rect.width, 1);
    const altoLocal = Math.max(rect.height, 1);
    const posicionX = Math.min(
      Math.max((evento.clientX - rect.left) / anchoLocal, 0),
      1,
    );
    const posicionY = Math.min(
      Math.max((evento.clientY - rect.top) / altoLocal, 0),
      1,
    );
    const centroX =
      rangoVisible.minimoX +
      posicionX * (rangoVisible.maximoX - rangoVisible.minimoX);
    const centroY =
      rangoVisible.maximoY -
      posicionY * (rangoVisible.maximoY - rangoVisible.minimoY);
    const factor = evento.deltaY < 0 ? 1.15 : 0.87;

    setModoVista("manual");
    setRangoVisible((estadoActual) =>
      hacerZoomRangoRegresion(
        resultado,
        estadoActual,
        factor,
        centroX,
        centroY,
      ),
    );
    setMensajeVista(null);
  };

  const iniciarArrastre = (
    evento: ReactPointerEvent<HTMLCanvasElement>,
  ) => {
    if (evento.button !== 0) {
      return;
    }

    arrastreRef.current = {
      clienteX: evento.clientX,
      clienteY: evento.clientY,
      rangoInicial: rangoVisible,
    };
    setEstaArrastrando(true);
    evento.currentTarget.setPointerCapture(evento.pointerId);
  };

  const rangoCoincideConDatos = sonIgualesRangos(rangoVisible, rangoInicial);
  const rangoCoincideConVistaAmplia = sonIgualesRangos(
    rangoVisible,
    rangoAmplio,
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-[1.65rem] border border-verde-claro bg-[#f7faf7] p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={aplicarVistaDatos}
              className={`min-h-12 rounded-[1.05rem] px-5 text-sm font-semibold transition ${
                rangoCoincideConDatos && modoVista === "datos"
                  ? "bg-acento-principal text-white shadow-[0_10px_24px_rgba(0,98,65,0.18)]"
                  : "border border-verde-claro bg-white text-acento-principal hover:border-acento-principal hover:bg-verde-suave"
              }`}
            >
              Ajustar a datos
            </button>

            <button
              type="button"
              onClick={aplicarVistaAmplia}
              className={`min-h-12 rounded-[1.05rem] px-5 text-sm font-semibold transition ${
                rangoCoincideConVistaAmplia && modoVista === "amplia"
                  ? "bg-acento-principal text-white shadow-[0_10px_24px_rgba(0,98,65,0.18)]"
                  : "border border-verde-claro bg-white text-acento-principal hover:border-acento-principal hover:bg-verde-suave"
              }`}
            >
              Vista amplia
            </button>

            <button
              type="button"
              onClick={aplicarVistaManual}
              className={`min-h-12 rounded-[1.05rem] px-5 text-sm font-semibold transition ${
                modoVista === "manual"
                  ? "bg-acento-principal text-white shadow-[0_10px_24px_rgba(0,98,65,0.18)]"
                  : "border border-verde-claro bg-white text-acento-principal hover:border-acento-principal hover:bg-verde-suave"
              }`}
            >
              Vista manual
            </button>

            <button
              type="button"
              onClick={restablecerVista}
              className="min-h-12 rounded-[1.05rem] border border-verde-claro bg-white px-5 text-sm font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
            >
              Restablecer vista
            </button>

            <button
              type="button"
              onClick={centrarEnOrigen}
              className="min-h-12 rounded-[1.05rem] border border-verde-claro bg-white px-5 text-sm font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
            >
              Centrar en origen
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_1fr]">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-texto-secundario">
                  Paso del eje X
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={textoPasoEjeX}
                  onKeyDown={(evento) =>
                    manejarTeclaEntradaNumerica(evento, {
                      permitirDecimal: true,
                      permitirNegativo: false,
                    })
                  }
                  onChange={(evento) =>
                    setTextoPasoEjeX(
                      sanitizarTextoEntradaNumerica(evento.target.value, {
                        permitirDecimal: true,
                        permitirNegativo: false,
                      }),
                    )
                  }
                  placeholder="Automatico"
                  className={`min-h-12 rounded-[1rem] border px-4 text-sm text-texto-principal outline-none transition focus:ring-4 ${
                    errorPasoEjeX
                      ? "border-alerta/45 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                      : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                  }`}
                />
                {errorPasoEjeX ? (
                  <p className="text-sm text-alerta">{errorPasoEjeX}</p>
                ) : (
                  <p className="text-xs leading-6 text-texto-secundario">
                    Dejalo vacio para calculo automatico.
                  </p>
                )}
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-texto-secundario">
                  Paso del eje Y
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={textoPasoEjeY}
                  onKeyDown={(evento) =>
                    manejarTeclaEntradaNumerica(evento, {
                      permitirDecimal: true,
                      permitirNegativo: false,
                    })
                  }
                  onChange={(evento) =>
                    setTextoPasoEjeY(
                      sanitizarTextoEntradaNumerica(evento.target.value, {
                        permitirDecimal: true,
                        permitirNegativo: false,
                      }),
                    )
                  }
                  placeholder="Automatico"
                  className={`min-h-12 rounded-[1rem] border px-4 text-sm text-texto-principal outline-none transition focus:ring-4 ${
                    errorPasoEjeY
                      ? "border-alerta/45 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                      : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                  }`}
                />
                {errorPasoEjeY ? (
                  <p className="text-sm text-alerta">{errorPasoEjeY}</p>
                ) : (
                  <p className="text-xs leading-6 text-texto-secundario">
                    Controla cada cuanto aparecen las marcas visibles del eje.
                  </p>
                )}
              </label>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-[1rem] border border-verde-claro bg-white px-4 py-3 text-sm text-texto-principal">
                <input
                  type="checkbox"
                  checked={mostrarEcuacionGrafica}
                  onChange={(evento) =>
                    setMostrarEcuacionGrafica(evento.target.checked)
                  }
                  className="h-5 w-5 accent-[var(--color-acento-principal)]"
                />
                Mostrar ecuacion en la grafica
              </label>

              <label className="flex items-center gap-3 rounded-[1rem] border border-verde-claro bg-white px-4 py-3 text-sm text-texto-principal">
                <input
                  type="checkbox"
                  checked={mostrarValoresEspeciales}
                  onChange={(evento) =>
                    setMostrarValoresEspeciales(evento.target.checked)
                  }
                  className="h-5 w-5 accent-[var(--color-acento-principal)]"
                />
                Mostrar valores especiales
              </label>

              <button
                type="button"
                onClick={() => aplicarZoom(1.18)}
                className="min-h-12 rounded-[1rem] border border-verde-claro bg-white px-4 text-sm font-semibold text-acento-principal transition hover:border-acento-principal hover:bg-verde-suave"
              >
                Zoom +
              </button>

              <button
                type="button"
                onClick={() => aplicarZoom(0.84)}
                className="min-h-12 rounded-[1rem] border border-verde-claro bg-white px-4 text-sm font-semibold text-acento-principal transition hover:border-acento-principal hover:bg-verde-suave"
              >
                Zoom -
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-texto-secundario">
                X minimo
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={textoXMin}
                onKeyDown={(evento) =>
                  manejarTeclaEntradaNumerica(evento, {
                    permitirDecimal: true,
                    permitirNegativo: true,
                  })
                }
                onChange={(evento) =>
                  setTextoXMin(
                    sanitizarTextoEntradaNumerica(evento.target.value, {
                      permitirDecimal: true,
                      permitirNegativo: true,
                    }),
                  )
                }
                className="min-h-12 rounded-[1rem] border border-verde-claro bg-white px-4 text-sm text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-texto-secundario">
                X maximo
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={textoXMax}
                onKeyDown={(evento) =>
                  manejarTeclaEntradaNumerica(evento, {
                    permitirDecimal: true,
                    permitirNegativo: true,
                  })
                }
                onChange={(evento) =>
                  setTextoXMax(
                    sanitizarTextoEntradaNumerica(evento.target.value, {
                      permitirDecimal: true,
                      permitirNegativo: true,
                    }),
                  )
                }
                className="min-h-12 rounded-[1rem] border border-verde-claro bg-white px-4 text-sm text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-texto-secundario">
                Y minimo
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={textoYMin}
                onKeyDown={(evento) =>
                  manejarTeclaEntradaNumerica(evento, {
                    permitirDecimal: true,
                    permitirNegativo: true,
                  })
                }
                onChange={(evento) =>
                  setTextoYMin(
                    sanitizarTextoEntradaNumerica(evento.target.value, {
                      permitirDecimal: true,
                      permitirNegativo: true,
                    }),
                  )
                }
                className="min-h-12 rounded-[1rem] border border-verde-claro bg-white px-4 text-sm text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-texto-secundario">
                Y maximo
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={textoYMax}
                onKeyDown={(evento) =>
                  manejarTeclaEntradaNumerica(evento, {
                    permitirDecimal: true,
                    permitirNegativo: true,
                  })
                }
                onChange={(evento) =>
                  setTextoYMax(
                    sanitizarTextoEntradaNumerica(evento.target.value, {
                      permitirDecimal: true,
                      permitirNegativo: true,
                    }),
                  )
                }
                className="min-h-12 rounded-[1rem] border border-verde-claro bg-white px-4 text-sm text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-acento-oscuro">
              Modo activo: {construirTextoModoVista(modoVista)}
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm text-texto-secundario">
              Arrastra la grafica para desplazarte y usa la rueda del mouse para zoom.
            </div>
          </div>

          <p className="text-sm leading-7 text-texto-secundario">
            {obtenerDescripcionDominio(resultado)}
          </p>

          {mensajeVista ? (
            <div
              className={`rounded-[1.15rem] border px-4 py-3 text-sm leading-7 ${obtenerClasesMensajeVista(
                mensajeVista.tipo,
              )}`}
            >
              {mensajeVista.texto}
            </div>
          ) : null}
        </div>
      </div>

      <div
        ref={contenedorRef}
        className="overflow-auto rounded-[1.7rem] border border-verde-claro bg-[#f8fbf8] p-4"
      >
        <canvas
          ref={lienzoRefExterno}
          onWheel={manejarRueda}
          onPointerDown={iniciarArrastre}
          className={`mx-auto h-auto min-w-[700px] touch-none rounded-[1.2rem] bg-[#fbfcfa] ${
            estaArrastrando ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{ width: `${dimensiones.ancho}px`, maxWidth: "none" }}
        />
      </div>
    </div>
  );
}
