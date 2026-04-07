export interface FilaColumnaCompuesta {
  categoria: string;
  valorSerieA: number;
  valorSerieB: number;
  colorSerieA?: string;
  colorSerieB?: string;
}

export interface ConfiguracionEjeYManualCompuesta {
  minimo: number;
  maximo: number;
  paso: number;
}

export interface SeleccionBarraCompuesta {
  categoriaIndice: number;
  serie: "serieA" | "serieB";
}

export interface OpcionesRenderColumnasCompuestas {
  nombreSerieA: string;
  nombreSerieB: string;
  nombreEjeX: string;
  nombreEjeY: string;
  ejeYManual?: ConfiguracionEjeYManualCompuesta;
  seleccion?: SeleccionBarraCompuesta | null;
}

export interface BarraCompuestaCalculada {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  valor: number;
  categoria: string;
  serie: "serieA" | "serieB";
  color: string;
}
