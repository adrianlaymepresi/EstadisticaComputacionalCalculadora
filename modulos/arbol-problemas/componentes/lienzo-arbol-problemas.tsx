"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BarraHerramientasArbol } from "@/modulos/arbol-problemas/componentes/barra-herramientas-arbol";
import { NodoArbolProblemas } from "@/modulos/arbol-problemas/componentes/nodo-arbol-problemas";
import {
  ZOOM_INICIAL_ARBOL_PROBLEMAS,
  ZOOM_MAXIMO_ARBOL_PROBLEMAS,
  ZOOM_MINIMO_ARBOL_PROBLEMAS,
} from "@/modulos/arbol-problemas/constantes";
import { obtenerDescendientesNodo } from "@/modulos/arbol-problemas/servicios/layout-arbol-problemas";
import type {
  EstadoArbolProblema,
  NodoRenderArbolProblema,
  PosicionArbolProblema,
  VistaArbolProblema,
} from "@/modulos/arbol-problemas/tipos";

interface LienzoArbolProblemasProps {
  estado: EstadoArbolProblema;
  vista: VistaArbolProblema;
  nodoSeleccionadoId: string | null;
  tokenAutoajuste: number;
  onSeleccionarNodo: (nodoId: string | null) => void;
  onEditarRapidoNodo: (nodoId: string) => void;
  onMoverGrupoNodos: (
    ids: string[],
    posicionesActuales: Map<string, PosicionArbolProblema>,
    delta: PosicionArbolProblema,
  ) => void;
  onActualizarZoom: (zoom: number) => void;
  onActualizarDesplazamiento: (desplazamiento: PosicionArbolProblema) => void;
  onAlternarControles: () => void;
  onReordenar: () => void;
  onCargarEjemplo: () => void;
  onLimpiar: () => void;
}

type EstadoInteraccion =
  | null
  | {
      tipo: "paneo";
      origenCliente: PosicionArbolProblema;
      desplazamientoInicial: PosicionArbolProblema;
    }
  | {
      tipo: "arrastre-nodo";
      ids: string[];
      origenMundo: PosicionArbolProblema;
      posicionesBase: Map<string, PosicionArbolProblema>;
    };

function limitarZoom(zoom: number) {
  return Math.min(
    ZOOM_MAXIMO_ARBOL_PROBLEMAS,
    Math.max(ZOOM_MINIMO_ARBOL_PROBLEMAS, zoom),
  );
}

function construirTrayectoriaConexion(
  desde: NodoRenderArbolProblema,
  hacia: NodoRenderArbolProblema,
) {
  const inicio = {
    x: desde.posicion.x,
    y: desde.posicion.y - desde.alto / 2,
  };
  const fin = {
    x: hacia.posicion.x,
    y: hacia.posicion.y + hacia.alto / 2,
  };
  const amplitud = Math.max(55, Math.abs(fin.y - inicio.y) * 0.45);
  return `M ${inicio.x} ${inicio.y} C ${inicio.x} ${inicio.y - amplitud}, ${fin.x} ${fin.y + amplitud}, ${fin.x} ${fin.y}`;
}

export function LienzoArbolProblemas({
  estado,
  vista,
  nodoSeleccionadoId,
  tokenAutoajuste,
  onSeleccionarNodo,
  onEditarRapidoNodo,
  onMoverGrupoNodos,
  onActualizarZoom,
  onActualizarDesplazamiento,
  onAlternarControles,
  onReordenar,
  onCargarEjemplo,
  onLimpiar,
}: LienzoArbolProblemasProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensiones, setDimensiones] = useState({ ancho: 1200, alto: 760 });
  const [interaccion, setInteraccion] = useState<EstadoInteraccion>(null);

  const mapaNodos = useMemo(
    () => new Map(vista.nodos.map((nodo) => [nodo.id, nodo])),
    [vista.nodos],
  );
  const posicionesActuales = useMemo(
    () => new Map(vista.nodos.map((nodo) => [nodo.id, nodo.posicion])),
    [vista.nodos],
  );

  const convertirClienteAMundo = useCallback(
    (clienteX: number, clienteY: number) => {
      if (!svgRef.current) {
        return { x: 0, y: 0 };
      }

      const rect = svgRef.current.getBoundingClientRect();
      const xLocal = clienteX - rect.left;
      const yLocal = clienteY - rect.top;

      return {
        x: (xLocal - estado.desplazamiento.x) / estado.zoom,
        y: (yLocal - estado.desplazamiento.y) / estado.zoom,
      };
    },
    [estado.desplazamiento.x, estado.desplazamiento.y, estado.zoom],
  );

  const centrarArbol = useCallback(
    (zoomObjetivo?: number) => {
      const zoom = zoomObjetivo ?? estado.zoom;
      const centroX = vista.limites.minX + vista.limites.ancho / 2;
      const centroY = vista.limites.minY + vista.limites.alto / 2;
      onActualizarDesplazamiento({
        x: dimensiones.ancho / 2 - centroX * zoom,
        y: dimensiones.alto / 2 - centroY * zoom,
      });

      if (zoomObjetivo !== undefined) {
        onActualizarZoom(zoomObjetivo);
      }
    },
    [
      dimensiones.alto,
      dimensiones.ancho,
      estado.zoom,
      onActualizarDesplazamiento,
      onActualizarZoom,
      vista.limites.alto,
      vista.limites.ancho,
      vista.limites.minX,
      vista.limites.minY,
    ],
  );

  const ajustarAPantalla = useCallback(() => {
    const margen = 90;
    const escalaX =
      (dimensiones.ancho - margen * 2) / Math.max(vista.limites.ancho, 1);
    const escalaY =
      (dimensiones.alto - margen * 2) / Math.max(vista.limites.alto, 1);
    const zoomObjetivo = limitarZoom(
      Math.min(escalaX, escalaY, ZOOM_INICIAL_ARBOL_PROBLEMAS),
    );
    onActualizarZoom(zoomObjetivo);
    const centroX = vista.limites.minX + vista.limites.ancho / 2;
    const centroY = vista.limites.minY + vista.limites.alto / 2;
    onActualizarDesplazamiento({
      x: dimensiones.ancho / 2 - centroX * zoomObjetivo,
      y: dimensiones.alto / 2 - centroY * zoomObjetivo,
    });
  }, [
    dimensiones.alto,
    dimensiones.ancho,
    onActualizarDesplazamiento,
    onActualizarZoom,
    vista.limites.alto,
    vista.limites.ancho,
    vista.limites.minX,
    vista.limites.minY,
  ]);

  useEffect(() => {
    if (!contenedorRef.current) {
      return;
    }

    const observador = new ResizeObserver(([entrada]) => {
      const ancho = Math.max(320, entrada.contentRect.width);
      const alto = Math.max(480, entrada.contentRect.height);
      setDimensiones((dimensionesActuales) =>
        dimensionesActuales.ancho === ancho && dimensionesActuales.alto === alto
          ? dimensionesActuales
          : { ancho, alto },
      );
    });

    observador.observe(contenedorRef.current);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    ajustarAPantalla();
  }, [ajustarAPantalla, tokenAutoajuste]);

  useEffect(() => {
    ajustarAPantalla();
  }, [ajustarAPantalla, dimensiones.alto, dimensiones.ancho]);

  useEffect(() => {
    if (!interaccion) {
      return;
    }

    const manejarMovimiento = (evento: PointerEvent) => {
      if (interaccion.tipo === "paneo") {
        onActualizarDesplazamiento({
          x:
            interaccion.desplazamientoInicial.x +
            (evento.clientX - interaccion.origenCliente.x),
          y:
            interaccion.desplazamientoInicial.y +
            (evento.clientY - interaccion.origenCliente.y),
        });
        return;
      }

      const puntoMundo = convertirClienteAMundo(evento.clientX, evento.clientY);
      onMoverGrupoNodos(interaccion.ids, interaccion.posicionesBase, {
        x: puntoMundo.x - interaccion.origenMundo.x,
        y: puntoMundo.y - interaccion.origenMundo.y,
      });
    };

    const finalizar = () => setInteraccion(null);

    window.addEventListener("pointermove", manejarMovimiento);
    window.addEventListener("pointerup", finalizar);

    return () => {
      window.removeEventListener("pointermove", manejarMovimiento);
      window.removeEventListener("pointerup", finalizar);
    };
  }, [
    convertirClienteAMundo,
    interaccion,
    onActualizarDesplazamiento,
    onMoverGrupoNodos,
  ]);

  const iniciarPaneo = (evento: ReactPointerEvent<SVGSVGElement>) => {
    if (evento.button !== 0) {
      return;
    }

    onSeleccionarNodo(null);
    setInteraccion({
      tipo: "paneo",
      origenCliente: { x: evento.clientX, y: evento.clientY },
      desplazamientoInicial: estado.desplazamiento,
    });
  };

  const iniciarArrastreNodo = (
    evento: ReactPointerEvent<SVGGElement>,
    nodo: NodoRenderArbolProblema,
  ) => {
    evento.stopPropagation();
    onSeleccionarNodo(nodo.id);

    const ids =
      nodo.tipo === "problema"
        ? vista.nodos.map((item) => item.id)
        : nodo.tipo === "causa"
          ? [nodo.id]
          : [nodo.id, ...obtenerDescendientesNodo(estado.nodos, nodo.id)];

    setInteraccion({
      tipo: "arrastre-nodo",
      ids,
      origenMundo: convertirClienteAMundo(evento.clientX, evento.clientY),
      posicionesBase: posicionesActuales,
    });
  };

  const manejarRueda = (evento: React.WheelEvent<SVGSVGElement>) => {
    evento.preventDefault();

    if (!svgRef.current) {
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const localX = evento.clientX - rect.left;
    const localY = evento.clientY - rect.top;
    const puntoMundo = {
      x: (localX - estado.desplazamiento.x) / estado.zoom,
      y: (localY - estado.desplazamiento.y) / estado.zoom,
    };
    const factor = evento.deltaY > 0 ? 0.92 : 1.08;
    const siguienteZoom = limitarZoom(estado.zoom * factor);

    onActualizarZoom(siguienteZoom);
    onActualizarDesplazamiento({
      x: localX - puntoMundo.x * siguienteZoom,
      y: localY - puntoMundo.y * siguienteZoom,
    });
  };

  const conexiones = vista.conexiones.map((conexion) => {
    const desde = mapaNodos.get(conexion.desdeNodoId);
    const hacia = mapaNodos.get(conexion.haciaNodoId);

    if (!desde || !hacia) {
      return null;
    }

    return (
      <path
        key={conexion.id}
        d={construirTrayectoriaConexion(desde, hacia)}
        fill="none"
        stroke={estado.colores.flechas}
        strokeWidth={conexion.tipo === "relacion-logica" ? 1.9 : 2.35}
        strokeDasharray={conexion.tipo === "relacion-logica" ? "7 7" : undefined}
        markerEnd="url(#punta-flecha-arbol)"
        opacity={conexion.tipo === "relacion-logica" ? 0.72 : 0.94}
      />
    );
  });

  return (
    <section className="flex flex-col gap-5">
      <BarraHerramientasArbol
        controlesVisibles={estado.controlesVisibles}
        zoom={estado.zoom}
        onAlternarControles={onAlternarControles}
        onCentrar={() => centrarArbol()}
        onAjustar={() => ajustarAPantalla()}
        onRestablecerZoom={() => centrarArbol(ZOOM_INICIAL_ARBOL_PROBLEMAS)}
        onReordenar={onReordenar}
        onCargarEjemplo={onCargarEjemplo}
        onLimpiar={onLimpiar}
      />

      <div
        ref={contenedorRef}
        className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-verde-claro bg-white/95 shadow-[inset_0_0_0_1px_rgba(30,57,50,0.04)] sm:min-h-[680px]"
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${dimensiones.ancho} ${dimensiones.alto}`}
          onPointerDown={iniciarPaneo}
          onWheel={manejarRueda}
          className="absolute inset-0 h-full w-full touch-none"
        >
          <defs>
            <pattern
              id="rejilla-arbol-problemas"
              width="26"
              height="26"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 26 0 L 0 0 0 26"
                fill="none"
                stroke="rgba(30,57,50,0.08)"
                strokeWidth="1"
              />
            </pattern>
            <marker
              id="punta-flecha-arbol"
              markerWidth="12"
              markerHeight="12"
              refX="10"
              refY="6"
              orient="auto"
            >
              <path d="M 0 0 L 12 6 L 0 12 z" fill={estado.colores.flechas} />
            </marker>
          </defs>

          <rect
            x="-5000"
            y="-5000"
            width="10000"
            height="10000"
            fill="url(#rejilla-arbol-problemas)"
          />

          <g
            transform={`translate(${estado.desplazamiento.x} ${estado.desplazamiento.y}) scale(${estado.zoom})`}
          >
            {conexiones}

            {vista.nodos.map((nodo) => (
              <NodoArbolProblemas
                key={nodo.id}
                nodo={nodo}
                estaSeleccionado={nodoSeleccionadoId === nodo.id}
                onSeleccionar={onSeleccionarNodo}
                onDobleClick={onEditarRapidoNodo}
                onPointerDown={iniciarArrastreNodo}
              />
            ))}
          </g>
        </svg>

        {vista.nodos.length === 0 ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-xl rounded-[1.8rem] border border-dashed border-verde-claro bg-superficie-principal/96 px-6 py-8 text-center shadow-[0_18px_38px_rgba(30,57,50,0.08)]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-acento-secundario">
                Lienzo listo
              </p>
              <h3 className="mt-3 text-[2rem] font-semibold tracking-tight text-acento-oscuro">
                Crea tu arbol de problemas
              </h3>
              <p className="mt-3 text-base leading-8 text-texto-secundario">
                Las causas se ubican debajo del problema central y los efectos
                encima. Las flechas indican la relacion causal del arbol.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
