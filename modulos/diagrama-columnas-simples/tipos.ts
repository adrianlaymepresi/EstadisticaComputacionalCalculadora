export interface FilaColumnaSimple {
  categoria: string;
  valor: number;
  color?: string;
}

export interface ConfiguracionEjeYManual {
  minimo: number;
  maximo: number;
  paso: number;
}

export interface OpcionesRenderColumnasSimples {
  nombreEjeX: string;
  nombreEjeY: string;
  ejeYManual?: ConfiguracionEjeYManual;
  indiceSeleccionado?: number | null;
}

export interface BarraCalculada {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  etiqueta: string;
  valor: number;
  color: string;
}
