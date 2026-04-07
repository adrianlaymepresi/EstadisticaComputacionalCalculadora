export interface FilaDiagramaBastones {
  valor: number;
  frecuencia: number;
  color?: string;
}

export interface ConfiguracionEjeManual {
  minimo: number;
  maximo: number;
  paso: number;
}

export interface OpcionesRenderDiagramaBastones {
  nombreEjeX: string;
  nombreEjeY: string;
  ejeXManual?: ConfiguracionEjeManual;
  ejeYManual?: ConfiguracionEjeManual;
  indiceSeleccionado?: number | null;
}

export interface BastonCalculado {
  xCentro: number;
  yTop: number;
  yBase: number;
  radio: number;
  valor: number;
  frecuencia: number;
  color: string;
}
