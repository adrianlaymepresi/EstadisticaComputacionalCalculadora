export type IdentificadorFormulaTema1 =
  | "formula-razon"
  | "formula-indice"
  | "formula-proporcion"
  | "formula-porcentaje"
  | "formula-porcentaje-cambio"
  | "formula-porcentaje-error"
  | "formula-tasa";

export type ModoPrecisionResultado =
  | "dos-decimales"
  | "completo"
  | "personalizado";

export interface CampoNumericoFormula {
  id: string;
  simbolo: string;
  etiqueta: string;
  descripcion: string;
  placeholder: string;
  entero?: boolean;
  noNegativo?: boolean;
  positivo?: boolean;
}

export interface CampoTextoFormula {
  id: string;
  etiqueta: string;
  descripcion: string;
  placeholder: string;
  valorInicial: string;
}

export interface OpcionFormula {
  id: string;
  etiqueta: string;
  opciones: Array<{
    valor: string;
    etiqueta: string;
  }>;
}

export interface PasoCalculoFormula {
  titulo: string;
  expresion: string;
  resultado?: string;
}

export interface TarjetaResultadoFormula {
  titulo: string;
  valor: string;
}

export interface ResultadoFormulaTema1 {
  tarjetas: TarjetaResultadoFormula[];
  pasos: PasoCalculoFormula[];
  interpretacion: string;
  observacion?: string;
}

export interface EstadoCalculoFormula {
  valoresNumericos: Record<string, string>;
  textosInterpretacion: Record<string, string>;
  opciones: Record<string, string>;
  modoPrecision: ModoPrecisionResultado;
  decimalesPersonalizados: number;
}
