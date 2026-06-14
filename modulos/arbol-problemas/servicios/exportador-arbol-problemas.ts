import { MARGEN_EXPORTACION_ARBOL } from "@/modulos/arbol-problemas/constantes";
import type {
  ConexionArbolProblema,
  NodoRenderArbolProblema,
  OpcionesExportacionArbolProblema,
  VistaArbolProblema,
} from "@/modulos/arbol-problemas/tipos";

function escaparXml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function obtenerAnclasConexion(
  desde: NodoRenderArbolProblema,
  hacia: NodoRenderArbolProblema,
  tipo: ConexionArbolProblema["tipo"],
) {
  if (tipo === "causa-problema") {
    return {
      inicio: { x: desde.posicion.x, y: desde.posicion.y - desde.alto / 2 },
      fin: { x: hacia.posicion.x, y: hacia.posicion.y + hacia.alto / 2 },
    };
  }

  return {
    inicio: { x: desde.posicion.x, y: desde.posicion.y - desde.alto / 2 },
    fin: { x: hacia.posicion.x, y: hacia.posicion.y + hacia.alto / 2 },
  };
}

function construirTrayectoria(
  desde: NodoRenderArbolProblema,
  hacia: NodoRenderArbolProblema,
  tipo: ConexionArbolProblema["tipo"],
) {
  const { inicio, fin } = obtenerAnclasConexion(desde, hacia, tipo);
  const amplitud = Math.max(55, Math.abs(fin.y - inicio.y) * 0.45);
  const control1Y = inicio.y - amplitud;
  const control2Y = fin.y + amplitud;

  return `M ${inicio.x} ${inicio.y} C ${inicio.x} ${control1Y}, ${fin.x} ${control2Y}, ${fin.x} ${fin.y}`;
}

function construirNodoSvg(nodo: NodoRenderArbolProblema) {
  const x = nodo.posicion.x - nodo.ancho / 2;
  const y = nodo.posicion.y - nodo.alto / 2;
  const badgeAncho = Math.min(72, Math.max(54, nodo.etiquetaVisible.length * 11));
  const badgeX = x + 14;
  const badgeY = y + 14;
  const lineas = nodo.lineasTexto
    .map((linea, indice) => {
      const yLinea = y + 64 + indice * 20;
      return `<tspan x="${nodo.posicion.x}" y="${yLinea}">${escaparXml(linea)}</tspan>`;
    })
    .join("");

  return `
    <g>
      <rect x="${x}" y="${y}" width="${nodo.ancho}" height="${nodo.alto}" rx="22" ry="22" fill="${nodo.estilo.colorFondo}" stroke="${nodo.estilo.colorBorde}" stroke-width="2.2"/>
      <rect x="${badgeX}" y="${badgeY}" width="${badgeAncho}" height="28" rx="14" ry="14" fill="#111111" fill-opacity="0.08"/>
      <text x="${badgeX + badgeAncho / 2}" y="${badgeY + 19}" text-anchor="middle" font-family="Geist, Segoe UI, sans-serif" font-size="12" font-weight="700" fill="${nodo.estilo.colorTexto}">${escaparXml(nodo.etiquetaVisible || nodo.etiquetaTipo)}</text>
      <text x="${nodo.posicion.x}" y="${y + 42}" text-anchor="middle" font-family="Geist, Segoe UI, sans-serif" font-size="12" font-weight="700" fill="${nodo.estilo.colorTexto}" opacity="0.78">${escaparXml(nodo.etiquetaTipo.toUpperCase())}</text>
      <text text-anchor="middle" font-family="Geist, Segoe UI, sans-serif" font-size="15" font-weight="500" fill="${nodo.estilo.colorTexto}">${lineas}</text>
    </g>
  `;
}

export function generarSvgArbolProblemas(
  vista: VistaArbolProblema,
  colorFlechas: string,
  colorFondo: string | null,
) {
  const margen = MARGEN_EXPORTACION_ARBOL;
  const ancho = Math.max(640, Math.ceil(vista.limites.ancho + margen * 2));
  const alto = Math.max(420, Math.ceil(vista.limites.alto + margen * 2));
  const origenX = vista.limites.minX - margen;
  const origenY = vista.limites.minY - margen;
  const mapaNodos = new Map(vista.nodos.map((nodo) => [nodo.id, nodo]));

  const conexiones = vista.conexiones
    .map((conexion) => {
      const desde = mapaNodos.get(conexion.desdeNodoId);
      const hacia = mapaNodos.get(conexion.haciaNodoId);

      if (!desde || !hacia) {
        return "";
      }

      const trayectoria = construirTrayectoria(desde, hacia, conexion.tipo);
      const esLogica = conexion.tipo === "relacion-logica";

      return `
        <path
          d="${trayectoria}"
          fill="none"
          stroke="${colorFlechas}"
          stroke-width="${esLogica ? 1.9 : 2.35}"
          stroke-dasharray="${esLogica ? "7 7" : "none"}"
          marker-end="url(#flecha-arbol-problemas)"
          opacity="${esLogica ? "0.72" : "0.95"}"
        />
      `;
    })
    .join("");

  const nodos = vista.nodos.map(construirNodoSvg).join("");
  const fondo = colorFondo
    ? `<rect x="${origenX}" y="${origenY}" width="${ancho}" height="${alto}" fill="${colorFondo}" />`
    : "";

  return {
    ancho,
    alto,
    svg: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="${origenX} ${origenY} ${ancho} ${alto}">
        <defs>
          <marker id="flecha-arbol-problemas" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M 0 0 L 12 6 L 0 12 z" fill="${colorFlechas}" />
          </marker>
        </defs>
        ${fondo}
        ${conexiones}
        ${nodos}
      </svg>
    `.trim(),
  };
}

export async function exportarPngArbolProblemas(
  vista: VistaArbolProblema,
  colorFlechas: string,
  opciones: OpcionesExportacionArbolProblema,
) {
  const { svg, ancho, alto } = generarSvgArbolProblemas(
    vista,
    colorFlechas,
    opciones.colorFondo,
  );
  const blob = new Blob([svg], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  try {
    const imagen = await new Promise<HTMLImageElement>((resolve, reject) => {
      const imagenLocal = new Image();
      imagenLocal.onload = () => resolve(imagenLocal);
      imagenLocal.onerror = () =>
        reject(new Error("No se pudo renderizar el SVG del arbol."));
      imagenLocal.src = url;
    });
    const escala = 2.5;
    const lienzo = document.createElement("canvas");
    lienzo.width = Math.round(ancho * escala);
    lienzo.height = Math.round(alto * escala);

    const contexto = lienzo.getContext("2d");

    if (!contexto) {
      throw new Error("No se pudo crear el contexto del lienzo para exportar.");
    }

    contexto.scale(escala, escala);

    if (opciones.colorFondo) {
      contexto.fillStyle = opciones.colorFondo;
      contexto.fillRect(0, 0, ancho, alto);
    }

    contexto.drawImage(imagen, 0, 0, ancho, alto);

    const enlace = document.createElement("a");
    enlace.download = opciones.nombreArchivo ?? "arbol-de-problemas.png";
    enlace.href = lienzo.toDataURL("image/png");
    enlace.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
