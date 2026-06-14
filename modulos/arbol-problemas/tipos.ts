export type TipoNodoArbolProblema =
  | "problema"
  | "causa"
  | "efecto"
  | "subefecto";

export type TipoConexionArbolProblema =
  | "causa-problema"
  | "problema-efecto"
  | "efecto-subefecto"
  | "relacion-logica";

export type ModoFondoExportacionArbolProblema =
  | "transparente"
  | "blanco"
  | "personalizado";

export interface PosicionArbolProblema {
  x: number;
  y: number;
}

export interface EstiloNodoArbolProblema {
  colorFondo: string;
  colorBorde: string;
  colorTexto: string;
}

export interface NodoArbolProblema {
  id: string;
  tipo: TipoNodoArbolProblema;
  texto: string;
  causaAsociadaId?: string;
  nodoPadreId?: string;
  posicionManual?: PosicionArbolProblema;
}

export interface ConexionArbolProblema {
  id: string;
  desdeNodoId: string;
  haciaNodoId: string;
  tipo: TipoConexionArbolProblema;
}

export interface ConfiguracionColoresArbolProblema {
  causa: EstiloNodoArbolProblema;
  efecto: EstiloNodoArbolProblema;
  problema: EstiloNodoArbolProblema;
  flechas: string;
}

export interface NodoRenderArbolProblema extends NodoArbolProblema {
  posicion: PosicionArbolProblema;
  ancho: number;
  alto: number;
  lineasTexto: string[];
  etiquetaVisible: string;
  etiquetaTipo: string;
  estilo: EstiloNodoArbolProblema;
}

export interface LimitesArbolProblema {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  ancho: number;
  alto: number;
}

export interface VistaArbolProblema {
  nodos: NodoRenderArbolProblema[];
  conexiones: ConexionArbolProblema[];
  limites: LimitesArbolProblema;
}

export interface EstadoArbolProblema {
  problema: NodoArbolProblema;
  nodos: NodoArbolProblema[];
  controlesVisibles: boolean;
  mostrarRelacionesLogicas: boolean;
  zoom: number;
  desplazamiento: PosicionArbolProblema;
  colores: ConfiguracionColoresArbolProblema;
  fondoExportacion: ModoFondoExportacionArbolProblema;
  colorFondoPersonalizado: string;
}

export interface DimensionesLienzoArbolProblema {
  ancho: number;
  alto: number;
}

export interface NodoSeleccionadoArbolProblema {
  nodo: NodoArbolProblema;
  etiquetaVisible: string;
  etiquetaTipo: string;
}

export interface DatosNodoNuevoArbolProblema {
  texto: string;
  causaAsociadaId?: string;
  nodoPadreId?: string;
}

export interface OpcionesExportacionArbolProblema {
  nombreArchivo?: string;
  colorFondo: string | null;
}
