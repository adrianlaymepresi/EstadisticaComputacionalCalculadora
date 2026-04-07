export interface FilaDiagramaDispersion {
  x: number;
  y: number;
  color?: string;
}

export interface ConfiguracionEjeManualDispersion {
  minimo: number;
  maximo: number;
  paso: number;
}

export interface OpcionesRenderDiagramaDispersion {
  nombreEjeX: string;
  nombreEjeY: string;
  ejeXManual?: ConfiguracionEjeManualDispersion;
  ejeYManual?: ConfiguracionEjeManualDispersion;
  indiceSeleccionado?: number | null;
}

export interface PuntoDispersionCalculado {
  x: number;
  y: number;
  radio: number;
  valorX: number;
  valorY: number;
  color: string;
}
