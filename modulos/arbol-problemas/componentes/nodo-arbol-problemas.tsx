import type { PointerEvent as ReactPointerEvent } from "react";
import type { NodoRenderArbolProblema } from "@/modulos/arbol-problemas/tipos";

interface NodoArbolProblemasProps {
  nodo: NodoRenderArbolProblema;
  estaSeleccionado: boolean;
  onSeleccionar: (nodoId: string) => void;
  onDobleClick: (nodoId: string) => void;
  onPointerDown: (
    evento: ReactPointerEvent<SVGGElement>,
    nodo: NodoRenderArbolProblema,
  ) => void;
}

export function NodoArbolProblemas({
  nodo,
  estaSeleccionado,
  onSeleccionar,
  onDobleClick,
  onPointerDown,
}: NodoArbolProblemasProps) {
  const x = nodo.posicion.x - nodo.ancho / 2;
  const y = nodo.posicion.y - nodo.alto / 2;
  const anchoCapsula = Math.min(
    78,
    Math.max(56, nodo.etiquetaVisible.length * 11.5),
  );

  return (
    <g
      role="button"
      tabIndex={0}
      onClick={(evento) => {
        evento.stopPropagation();
        onSeleccionar(nodo.id);
      }}
      onDoubleClick={(evento) => {
        evento.stopPropagation();
        onDobleClick(nodo.id);
      }}
      onPointerDown={(evento) => onPointerDown(evento, nodo)}
      onKeyDown={(evento) => {
        if (evento.key === "Enter" || evento.key === " ") {
          evento.preventDefault();
          onSeleccionar(nodo.id);
        }
      }}
      className="cursor-grab outline-none"
      aria-label={`${nodo.etiquetaTipo} ${nodo.etiquetaVisible}`}
    >
      {estaSeleccionado ? (
        <rect
          x={x - 6}
          y={y - 6}
          width={nodo.ancho + 12}
          height={nodo.alto + 12}
          rx={28}
          ry={28}
          fill="none"
          stroke="#1e3932"
          strokeWidth={2.6}
          strokeDasharray="7 6"
          opacity={0.85}
        />
      ) : null}

      <rect
        x={x}
        y={y}
        width={nodo.ancho}
        height={nodo.alto}
        rx={22}
        ry={22}
        fill={nodo.estilo.colorFondo}
        stroke={nodo.estilo.colorBorde}
        strokeWidth={2.2}
      />

      <rect
        x={x + 14}
        y={y + 14}
        width={anchoCapsula}
        height={28}
        rx={14}
        ry={14}
        fill="#111111"
        fillOpacity={0.08}
      />

      <text
        x={x + 14 + anchoCapsula / 2}
        y={y + 33}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={nodo.estilo.colorTexto}
        style={{ userSelect: "none" }}
      >
        {nodo.etiquetaVisible || nodo.etiquetaTipo}
      </text>

      <text
        x={nodo.posicion.x}
        y={y + 43}
        textAnchor="middle"
        fontSize="12"
        fontWeight="700"
        fill={nodo.estilo.colorTexto}
        opacity={0.8}
        style={{ userSelect: "none" }}
      >
        {nodo.etiquetaTipo.toUpperCase()}
      </text>

      <text
        textAnchor="middle"
        fontSize="15"
        fontWeight="500"
        fill={nodo.estilo.colorTexto}
        style={{ userSelect: "none" }}
      >
        {nodo.lineasTexto.map((linea, indice) => (
          <tspan
            key={`${nodo.id}-${indice}-${linea}`}
            x={nodo.posicion.x}
            y={y + 64 + indice * 20}
          >
            {linea}
          </tspan>
        ))}
      </text>
    </g>
  );
}
