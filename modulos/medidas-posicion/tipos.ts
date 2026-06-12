export type IdentificadorMedidaPosicion =
  | "medidas-posicion-todas"
  | "media-aritmetica"
  | "media-geometrica"
  | "media-armonica"
  | "mediana"
  | "moda"
  | "cuartiles"
  | "deciles"
  | "percentiles";

export type TipoDatosMedidaPosicion = "no-clasificados" | "clasificados";

export interface DefinicionMedidaPosicion {
  simbolo: string;
  descripcion: string;
}

export interface ConfiguracionCuantil {
  simbolo: "Q" | "D" | "P";
  etiqueta: string;
  minimo: number;
  maximo: number;
  valorInicial: number;
}

export interface ConfiguracionMedidaPosicion {
  id: IdentificadorMedidaPosicion;
  titulo: string;
  resumen: string;
  formulasNoClasificados: string[];
  formulasClasificados: string[];
  definicionesNoClasificados: DefinicionMedidaPosicion[];
  definicionesClasificados: DefinicionMedidaPosicion[];
  condicionesNoClasificados: string[];
  condicionesClasificados: string[];
  ejemploNoClasificados: string;
  ejemploClasificados: Array<{
    li: string;
    ls: string;
    fi: string;
  }>;
  requiereCuantil?: ConfiguracionCuantil;
}

export interface FilaTablaClasificadaEntrada {
  li: string;
  ls: string;
  fi: string;
}

export interface FilaTablaClasificadaValidada {
  li: number;
  ls: number;
  fi: number;
  textoLi: string;
  textoLs: string;
}

export interface FilaTablaClasificadaCalculada {
  indice: number;
  Li: number;
  Ls: number;
  xi: number;
  fi: number;
  hi: number;
  pi: number;
  Fi: number;
  Hi: number;
  Pi: number;
  amplitud: number;
}

export interface TablaClasificadaExtendida {
  n: number;
  precisionIntervalos: number;
  filas: FilaTablaClasificadaCalculada[];
}

export interface PasoCalculoMedida {
  titulo: string;
  descripcion?: string;
  expresion?: string;
  resultado?: string;
}

export interface TablaDetalleMedida {
  titulo: string;
  columnas: string[];
  filas: string[][];
}

export interface ResultadoMedidaPosicion {
  medidaId: IdentificadorMedidaPosicion;
  titulo: string;
  tipoDatos: TipoDatosMedidaPosicion;
  valorPrincipal: string;
  observacion: string;
  interpretacion?: string;
  pasos: PasoCalculoMedida[];
  tablas: TablaDetalleMedida[];
}

export interface ResultadoResumenTodos {
  medida: string;
  resultado: string;
  observacion: string;
}

export interface ResultadoTodasMedidasPosicion {
  medidaId: "medidas-posicion-todas";
  titulo: string;
  tipoDatos: TipoDatosMedidaPosicion;
  resumen: ResultadoResumenTodos[];
  observacionGeneral: string;
}

export type ResultadoCalculoMedidasPosicion =
  | {
      tipo: "individual";
      detalle: ResultadoMedidaPosicion;
    }
  | {
      tipo: "todos";
      detalle: ResultadoTodasMedidasPosicion;
    };

export interface OpcionesSalidaMedidaPosicion {
  decimales: number | "todos";
  valorCuantil?: number;
}
