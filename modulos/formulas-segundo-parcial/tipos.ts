export type IdentificadorFormulaSegundoParcial =
  | "permutacion-lineal"
  | "permutacion-con-repeticion"
  | "permutacion-circular"
  | "variacion-sin-repeticion"
  | "variacion-con-repeticion"
  | "combinacion"
  | "distribucion-binomial"
  | "distribucion-geometrica"
  | "distribucion-pascal"
  | "distribucion-hipergeometrica"
  | "distribucion-poisson"
  | "complementos-acumulaciones";

export type TipoProbabilidad =
  | "exactamente"
  | "menor"
  | "menor-igual"
  | "mayor"
  | "mayor-igual"
  | "ninguna";

export interface PrecisionResultado {
  modo: "completo" | "decimales";
  decimales: number;
}

export interface CondicionVisibleCampo {
  opcionId: string;
  valores: string[];
}

export interface CampoNumericoSegundoParcial {
  id: string;
  simbolo: string;
  etiqueta: string;
  descripcion: string;
  placeholder: string;
  entero?: boolean;
  noNegativo?: boolean;
  positivo?: boolean;
  visibleSi?: CondicionVisibleCampo;
}

export interface CampoListaEnterosSegundoParcial {
  id: string;
  etiqueta: string;
  descripcion: string;
  placeholder: string;
  minimoValor?: number;
  opcional?: boolean;
}

export interface CampoTextoSegundoParcial {
  id: string;
  etiqueta: string;
  descripcion: string;
  placeholder: string;
  valorInicial: string;
}

export interface OpcionSegundoParcial {
  id: string;
  etiqueta: string;
  opciones: Array<{
    valor: string;
    etiqueta: string;
  }>;
}

export interface DefinicionVariableSegundoParcial {
  simbolo: string;
  descripcion: string;
}

export interface PasoProcedimientoSegundoParcial {
  titulo: string;
  expresion: string;
  resultado?: string;
}

export interface TarjetaResultadoSegundoParcial {
  titulo: string;
  valor: string;
  detalle?: string;
}

export interface TablaProcedimientoSegundoParcial {
  titulo: string;
  columnas: string[];
  filas: string[][];
}

export interface BloqueInformativoSegundoParcial {
  titulo: string;
  parrafos: string[];
}

export interface ResultadoFormulaSegundoParcial {
  tarjetas: TarjetaResultadoSegundoParcial[];
  pasos: PasoProcedimientoSegundoParcial[];
  tablas?: TablaProcedimientoSegundoParcial[];
  interpretacion: string;
  observacion?: string;
  alertas?: string[];
}

export interface EstadoFormulaSegundoParcial {
  valoresNumericos: Record<string, string>;
  valoresListas: Record<string, string>;
  textosInterpretacion: Record<string, string>;
  opciones: Record<string, string>;
  precision: PrecisionResultado;
}

export interface EntradaNormalizadaSegundoParcial {
  numericos: Record<string, number>;
  listas: Record<string, number[]>;
  textosInterpretacion: Record<string, string>;
  opciones: Record<string, string>;
  precision: PrecisionResultado;
}
