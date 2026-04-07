"use client";

import { useEffect, useRef, useState } from "react";
import { PanelPersonalizacionBurbujas } from "@/modulos/diagrama-burbujas/componentes/panel-personalizacion-burbujas";
import {
  calcularDatosBurbujas,
  dibujarDiagrama,
} from "@/modulos/diagrama-burbujas/servicios/generador-diagrama";
import {
  exportarComoExcel,
  exportarComoImagen,
  exportarComoPDF,
  normalizarNombreArchivo,
} from "@/modulos/diagrama-burbujas/servicios/exportador";
import {
  OPCIONES_VISUALIZACION_DEFAULT,
  type ConfiguracionDiagrama,
  type FormatoExportacion,
  type OpcionesVisualizacion,
} from "@/modulos/diagrama-burbujas/tipos";

interface PropiedadesVisualizadorDiagrama {
  configuracion: ConfiguracionDiagrama;
  alNuevoDiagrama: () => void;
}

interface InfoTooltip {
  visible: boolean;
  x: number;
  y: number;
  valorX: number;
  valorY: number;
  valorTamanio: number;
  valorColor?: string;
}

export function VisualizadorDiagramaBurbujas({
  configuracion,
  alNuevoDiagrama,
}: PropiedadesVisualizadorDiagrama) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [dimensionesCanvas, setDimensionesCanvas] = useState({
    ancho: 900,
    alto: 600,
  });
  const [tooltip, setTooltip] = useState<InfoTooltip>({
    visible: false,
    x: 0,
    y: 0,
    valorX: 0,
    valorY: 0,
    valorTamanio: 0,
  });
  const [opciones, setOpciones] = useState<OpcionesVisualizacion>(
    OPCIONES_VISUALIZACION_DEFAULT,
  );
  const [panelAbierto, setPanelAbierto] = useState<boolean>(true);

  const tieneColor = Boolean(configuracion.configuracionColumnas.nombreColor);

  useEffect(() => {
    const actualizarDimensiones = () => {
      if (contenedorRef.current) {
        const ancho = contenedorRef.current.offsetWidth - 32;
        const alto = ancho * 0.65;
        setDimensionesCanvas({ ancho: Math.max(600, ancho), alto: Math.max(400, alto) });
      }
    };

    actualizarDimensiones();
    window.addEventListener("resize", actualizarDimensiones);
    return () => window.removeEventListener("resize", actualizarDimensiones);
  }, [panelAbierto]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = dimensionesCanvas.ancho;
      canvas.height = dimensionesCanvas.alto;
      dibujarDiagrama(
        canvas,
        configuracion.datos,
        configuracion.configuracionColumnas,
        opciones,
      );
    }
  }, [configuracion, dimensionesCanvas, opciones]);

  const manejarMovimientoMouse = (
    evento: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    if (!canvasRef.current || !opciones.tooltip.mostrar) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const mouseX = (evento.clientX - rect.left) * scaleX;
    const mouseY = (evento.clientY - rect.top) * scaleY;

    const margen = 90;
    const burbujas = calcularDatosBurbujas(
      configuracion.datos,
      dimensionesCanvas.ancho,
      dimensionesCanvas.alto,
      margen,
    );

    const burbujaDetectada = burbujas.find((burbuja) => {
      const distancia = Math.sqrt(
        (mouseX - burbuja.x) ** 2 + (mouseY - burbuja.y) ** 2,
      );
      return distancia <= burbuja.radio;
    });

    if (burbujaDetectada) {
      setTooltip({
        visible: true,
        x: evento.clientX,
        y: evento.clientY,
        valorX: burbujaDetectada.valorX,
        valorY: burbujaDetectada.valorY,
        valorTamanio: burbujaDetectada.valorTamanio,
        valorColor: burbujaDetectada.valorColor,
      });
    } else {
      setTooltip((tooltipActual) => ({ ...tooltipActual, visible: false }));
    }
  };

  const manejarSalidaMouse = () => {
    setTooltip((tooltipActual) => ({ ...tooltipActual, visible: false }));
  };

  const manejarExportacion = async (formato: FormatoExportacion) => {
    if (!canvasRef.current) {
      return;
    }

    const nombreArchivo = normalizarNombreArchivo(
      configuracion.configuracionColumnas.nombreTamanio,
    );

    try {
      switch (formato) {
        case "imagen":
          await exportarComoImagen(canvasRef.current, nombreArchivo);
          break;
        case "pdf":
          await exportarComoPDF(canvasRef.current, nombreArchivo, configuracion);
          break;
        case "excel":
          await exportarComoExcel(configuracion, nombreArchivo, canvasRef.current);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar el diagrama");
    }
  };

  const formatearNumeroTooltip = (valor: number): string => {
    if (opciones.tooltip.formatoNumeros === "compacto") {
      const valorAbsoluto = Math.abs(valor);
      if (valorAbsoluto >= 1_000_000) return `${(valor / 1_000_000).toFixed(1)}M`;
      if (valorAbsoluto >= 1_000) return `${(valor / 1_000).toFixed(1)}K`;
    }
    return valor.toFixed(2);
  };

  return (
    <div className="w-full">
      <div className="rounded-t-2xl border border-b-0 border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
          <div>
            <h2 className="mb-1 text-2xl font-bold text-white">
              Diagrama de Burbujas
            </h2>
            <p className="text-sm text-purple-100">
              Personalice la visualizacion usando el panel de opciones
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPanelAbierto(!panelAbierto)}
            className="rounded-lg bg-white/20 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/30"
          >
            {panelAbierto ? "<- Ocultar Panel" : "Mostrar Panel ->"}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-b-2xl border border-gray-200 bg-white shadow-lg">
        <div className="flex">
          <div className={`flex-1 transition-all duration-300 ${panelAbierto ? "" : "w-full"}`}>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6">
              <div
                ref={contenedorRef}
                className="relative overflow-hidden rounded-xl border-2 border-gray-300 bg-white p-4 shadow-xl"
              >
                <canvas
                  ref={canvasRef}
                  onMouseMove={manejarMovimientoMouse}
                  onMouseLeave={manejarSalidaMouse}
                  className="h-auto w-full cursor-crosshair"
                  style={{ maxWidth: "100%", height: "auto" }}
                />

                {tooltip.visible && opciones.tooltip.mostrar ? (
                  <div
                    className="pointer-events-none fixed z-50 rounded-xl border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-3 text-sm text-white shadow-2xl"
                    style={{
                      left: tooltip.x + 15,
                      top: tooltip.y - 10,
                      transform: "translateY(-100%)",
                    }}
                  >
                    <div className="mb-2 text-base font-bold text-purple-300">
                      {configuracion.configuracionColumnas.nombreTamanio}
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">
                          {configuracion.configuracionColumnas.nombreX}:
                        </span>
                        <span className="font-semibold">
                          {formatearNumeroTooltip(tooltip.valorX)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">
                          {configuracion.configuracionColumnas.nombreY}:
                        </span>
                        <span className="font-semibold">
                          {formatearNumeroTooltip(tooltip.valorY)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-gray-400">Tamano:</span>
                        <span className="font-semibold text-purple-300">
                          {formatearNumeroTooltip(tooltip.valorTamanio)}
                        </span>
                      </div>
                      {tooltip.valorColor &&
                      configuracion.configuracionColumnas.nombreColor ? (
                        <div className="flex justify-between gap-4 border-t border-gray-700 pt-1">
                          <span className="text-gray-400">
                            {configuracion.configuracionColumnas.nombreColor}:
                          </span>
                          <span className="font-semibold text-green-300">
                            {tooltip.valorColor}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              {opciones.tooltip.mostrar ? (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-600">
                    Pase el cursor sobre las burbujas para ver informacion
                    detallada
                  </p>
                </div>
              ) : null}
            </div>

            <div className="bg-white px-6 pb-6">
              <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => manejarExportacion("imagen")}
                  className="flex flex-col items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  <span>Imagen PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => manejarExportacion("pdf")}
                  className="flex flex-col items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                >
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => manejarExportacion("excel")}
                  className="flex flex-col items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100"
                >
                  <span>Excel</span>
                </button>
              </div>

              <button
                type="button"
                onClick={alNuevoDiagrama}
                className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-base font-bold text-white transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg"
              >
                {"<- Crear Nuevo Diagrama"}
              </button>
            </div>
          </div>

          {panelAbierto ? (
            <div className="h-[calc(100vh-250px)] w-80 flex-shrink-0 overflow-hidden">
              <PanelPersonalizacionBurbujas
                opciones={opciones}
                alCambiar={setOpciones}
                mostrarOpcionColor={tieneColor}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
