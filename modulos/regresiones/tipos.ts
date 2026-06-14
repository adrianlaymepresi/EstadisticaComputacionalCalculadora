export type IdentificadorRegresion =
  | "regresion-lineal-simple"
  | "regresion-cuadratica"
  | "regresion-exponencial"
  | "regresion-potencial";

export type ModoPrecisionRegresion = "completo" | number;
export type TipoLogaritmoRegresion = "ln" | "log10";

export interface DefinicionRegresion {
  simbolo: string;
  descripcion: string;
}

export interface CampoPersonalizacionRegresion {
  nombreVariableX: string;
  unidadVariableX: string;
  nombreVariableY: string;
  unidadVariableY: string;
  contexto: string;
}

export interface FilaEntradaRegresion {
  id: string;
  x: string;
  y: string;
}

export interface ParRegresion {
  x: number;
  y: number;
}

export interface FilaTablaCalculoRegresion {
  etiquetaFila: string;
  valores: Array<string | number>;
}

export interface TablaCalculoRegresion {
  columnas: string[];
  filas: FilaTablaCalculoRegresion[];
}

export interface SumatoriaRegresion {
  etiqueta: string;
  expresion?: string;
  valor: number;
  valorVisible: string;
}

export interface PasoProcedimientoRegresion {
  titulo: string;
  descripcion?: string;
  expresion?: string;
  resultado?: string;
}

export interface CoeficienteRegresionVisible {
  simbolo: string;
  valorInterno: number;
  valorVisible: string;
}

export interface ResultadoEstimacionRegresion {
  titulo: string;
  entrada: string;
  resultadoVisible: string;
  detalle: string;
  puntosGrafica?: Array<{
    x: number;
    y: number;
    etiqueta: string;
    color?: string;
  }>;
}

export interface ConfiguracionGraficaRegresion {
  mostrarPuntosOriginales: boolean;
  mostrarCurvaRegresion: boolean;
  mostrarEtiquetasPuntos: boolean;
  mostrarCuadricula: boolean;
}

export interface ConfiguracionRegresion {
  id: IdentificadorRegresion;
  titulo: string;
  resumen: string;
  descripcionBreve: string;
  expresiones: string[];
  definiciones: DefinicionRegresion[];
  condiciones: string[];
  minimoPares: number;
  permiteEstimacionX: boolean;
  usaLogaritmos: boolean;
  ejemplos: Array<{
    etiqueta: string;
    pares: ParRegresion[];
  }>;
  columnasTabla: string[];
  palabrasClave: string[];
}

export interface EstadoConfiguracionRegresion {
  precisionProceso: ModoPrecisionRegresion;
  precisionResultado: ModoPrecisionRegresion;
  tipoLogaritmo: TipoLogaritmoRegresion;
  personalizacion: CampoPersonalizacionRegresion;
}

export interface ResultadoCalculoRegresion {
  id: IdentificadorRegresion;
  titulo: string;
  resumen: string;
  paresOriginales: ParRegresion[];
  tablaCalculo: TablaCalculoRegresion;
  sumatorias: SumatoriaRegresion[];
  pasos: PasoProcedimientoRegresion[];
  coeficientes: CoeficienteRegresionVisible[];
  ecuacionFinal: string;
  ecuacionAlterna?: string;
  interpretacion: string;
  observaciones: string[];
  configuracion: EstadoConfiguracionRegresion;
  estimaciones: ResultadoEstimacionRegresion[];
  puntosCurva: ParRegresion[];
  advertenciasGrafica: string[];
  dominioGrafica: {
    minimoX: number;
    maximoX: number;
  };
  metadatosModelo:
    | {
        tipo: "lineal";
        a: number;
        b: number;
      }
    | {
        tipo: "cuadratica";
        a: number;
        b: number;
        c: number;
      }
    | {
        tipo: "exponencial";
        a: number;
        b: number;
        tipoLogaritmo: TipoLogaritmoRegresion;
      }
    | {
        tipo: "potencial";
        a: number;
        b: number;
        tipoLogaritmo: TipoLogaritmoRegresion;
      };
}

export interface ResultadoValidacionRegresion {
  pares: ParRegresion[];
  observaciones: string[];
}

export interface ResultadoCalculoCompletoRegresion {
  resultado: ResultadoCalculoRegresion;
  advertencias: string[];
}
