import type {
  ConfiguracionColoresArbolProblema,
  DimensionesLienzoArbolProblema,
} from "@/modulos/arbol-problemas/tipos";

export const ID_PROBLEMA_CENTRAL = "problema-central";
export const ZOOM_MINIMO_ARBOL_PROBLEMAS = 0.4;
export const ZOOM_MAXIMO_ARBOL_PROBLEMAS = 2;
export const ZOOM_INICIAL_ARBOL_PROBLEMAS = 1;
export const ANCHO_MINIMO_NODO_ARBOL = 180;
export const ANCHO_MAXIMO_NODO_ARBOL = 280;
export const ANCHO_BASE_NODO_ARBOL = 228;
export const ALTO_MINIMO_NODO_ARBOL = 104;
export const PADDING_NODO_ARBOL = 18;
export const LINEA_ALTURA_ARBOL = 20;
export const SEPARACION_HORIZONTAL_ARBOL = 40;
export const SEPARACION_VERTICAL_CAUSAS = 240;
export const SEPARACION_VERTICAL_EFECTOS = 240;
export const SEPARACION_VERTICAL_SUBEFECTOS = 190;
export const MARGEN_EXPORTACION_ARBOL = 48;

export const COLORES_ARBOL_PROBLEMAS_POR_DEFECTO: ConfiguracionColoresArbolProblema =
  {
    causa: {
      colorFondo: "#fde7e7",
      colorBorde: "#d86161",
      colorTexto: "#111111",
    },
    efecto: {
      colorFondo: "#e8f0ff",
      colorBorde: "#5b8def",
      colorTexto: "#111111",
    },
    problema: {
      colorFondo: "#f8f8f8",
      colorBorde: "#666666",
      colorTexto: "#111111",
    },
    flechas: "#3f3f3f",
  };

export const DIMENSIONES_INICIALES_LIENZO_ARBOL: DimensionesLienzoArbolProblema =
  {
    ancho: 1200,
    alto: 760,
  };
