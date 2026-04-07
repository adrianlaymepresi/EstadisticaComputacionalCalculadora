export interface FilaDiagramaLineal {
  categoria: string;
  valor: number;
  color?: string;
}

export interface ConfiguracionEjeManualLineal {
  minimo: number;
  maximo: number;
  paso: number;
}

export interface OpcionesRenderDiagramaLineal {
  nombreEjeX: string;
  nombreEjeY: string;
  colorLinea: string;
  ejeYManual?: ConfiguracionEjeManualLineal;
  indiceSeleccionado?: number | null;
}

export interface PuntoLinealCalculado {
  x: number;
  y: number;
  radio: number;
  categoria: string;
  valor: number;
  color: string;
}
