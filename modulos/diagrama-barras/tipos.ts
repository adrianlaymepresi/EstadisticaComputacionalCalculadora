export interface FilaDiagramaBarras {
  categoria: string;
  valor: number;
  color?: string;
}

export interface ConfiguracionEjeXManual {
  minimo: number;
  maximo: number;
  paso: number;
}

export interface OpcionesRenderDiagramaBarras {
  nombreSerie: string;
  nombreEjeX: string;
  nombreEjeY: string;
  ejeXManual?: ConfiguracionEjeXManual;
  indiceSeleccionado?: number | null;
}

export interface BarraHorizontalCalculada {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  etiqueta: string;
  valor: number;
  color: string;
}
