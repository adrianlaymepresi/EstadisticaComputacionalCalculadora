export interface FilaDiagramaPictogramas {
  categoria: string;
  valor: number;
  imagenIndividual?: string;
}

export interface ConfiguracionEjeYManualPictogramas {
  minimo: number;
  maximo: number;
  paso: number;
}

export interface OpcionesRenderPictogramas {
  nombreEjeX: string;
  nombreEjeY: string;
  ejeYManual?: ConfiguracionEjeYManualPictogramas;
  indiceSeleccionado?: number | null;
}

export interface PictogramaCalculado {
  x: number;
  y: number;
  ancho: number;
  alto: number;
  etiqueta: string;
  valor: number;
}

export interface ImagenPictogramaRender {
  imagen: HTMLImageElement;
  relacionAspecto: number;
}
