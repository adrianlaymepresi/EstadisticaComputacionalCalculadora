export interface ConfiguracionColumnas {
  nombreX: string;
  nombreY: string;
  nombreTamanio: string;
  nombreColor?: string;
}

export interface FilaDatos {
  x: number;
  y: number;
  tamanio: number;
  color?: string;
}

export interface ConfiguracionDiagrama {
  numeroFilas: number;
  configuracionColumnas: ConfiguracionColumnas;
  datos: FilaDatos[];
}

export type FormatoExportacion = "excel" | "pdf" | "imagen";

export interface OpcionesCuadricula {
  mostrarHorizontal: boolean;
  mostrarVertical: boolean;
  color: string;
  grosor: number;
}

export interface OpcionesLineasConexion {
  mostrar: boolean;
  color: string;
  grosor: number;
  estilo: "continua" | "punteada";
}

export interface OpcionesEtiquetas {
  mostrar: boolean;
  mostrarX: boolean;
  mostrarY: boolean;
  mostrarTamanio: boolean;
  mostrarColor: boolean;
  tamanioFuente: number;
  color: string;
}

export interface OpcionesEjes {
  mostrarTituloX: boolean;
  mostrarTituloY: boolean;
  tituloXPersonalizado?: string;
  tituloYPersonalizado?: string;
  grosorLinea: number;
  colorLinea: string;
}

export interface OpcionesLeyenda {
  mostrar: boolean;
  posicion: "derecha" | "inferior";
}

export interface OpcionesBurbujas {
  transparencia: number;
  mostrarBorde: boolean;
  grosorBorde: number;
  colorBorde: string;
}

export interface OpcionesTooltip {
  mostrar: boolean;
  formatoNumeros: "normal" | "compacto";
}

export interface OpcionesVisualizacion {
  cuadricula: OpcionesCuadricula;
  lineasConexion: OpcionesLineasConexion;
  etiquetas: OpcionesEtiquetas;
  ejes: OpcionesEjes;
  leyenda: OpcionesLeyenda;
  burbujas: OpcionesBurbujas;
  tooltip: OpcionesTooltip;
}

export const OPCIONES_VISUALIZACION_DEFAULT: OpcionesVisualizacion = {
  cuadricula: {
    mostrarHorizontal: true,
    mostrarVertical: true,
    color: "#F1F5F9",
    grosor: 1,
  },
  lineasConexion: {
    mostrar: false,
    color: "#94A3B8",
    grosor: 2,
    estilo: "continua",
  },
  etiquetas: {
    mostrar: false,
    mostrarX: true,
    mostrarY: true,
    mostrarTamanio: false,
    mostrarColor: false,
    tamanioFuente: 11,
    color: "#1E293B",
  },
  ejes: {
    mostrarTituloX: true,
    mostrarTituloY: true,
    grosorLinea: 2,
    colorLinea: "#475569",
  },
  leyenda: {
    mostrar: true,
    posicion: "derecha",
  },
  burbujas: {
    transparencia: 70,
    mostrarBorde: true,
    grosorBorde: 2,
    colorBorde: "#FFFFFF",
  },
  tooltip: {
    mostrar: true,
    formatoNumeros: "normal",
  },
};
