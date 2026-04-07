export type DireccionRedondeo = "arriba" | "abajo";

export interface ConfiguracionDistribucionArbitraria {
  datos: number[];
  precision: number;
  k: number;
  direccionRedondeoT?: DireccionRedondeo;
  noPermitirNegativos: boolean;
  ajusteInferiorPreferido?: number | null;
}

export interface IntervaloDistribucionArbitraria {
  indice: number;
  limiteInferior: number;
  limiteSuperior: number;
  fi: number;
  conteo: string;
  hi: number;
  pi: number;
  Fi: number;
  Hi: number;
  Pi: number;
}

export interface ResultadoDistribucionArbitraria {
  datosOrdenados: number[];
  n: number;
  d: number;
  D: number;
  precision: number;
  c: number;
  alcance: [number, number];
  longitudAlcance: number;
  k: number;
  tBruto: number;
  tAjustado: number;
  direccionRedondeoT: DireccionRedondeo;
  cobertura: number;
  correccion: number;
  unidadesCorreccion: number;
  ajusteInferior: number;
  ajusteSuperior: number;
  ajusteInferiorPredeterminado: number;
  ajusteSuperiorPredeterminado: number;
  ajusteInferiorMinimo: number;
  ajusteInferiorMaximo: number;
  minimoCorregido: number;
  maximoCorregido: number;
  ultimoLimiteSuperior: number;
  noPermitirNegativos: boolean;
  intervalos: IntervaloDistribucionArbitraria[];
}
