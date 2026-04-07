export interface ConfiguracionDistribucionArbitraria {
  datos: number[];
  precision: number;
  k: number;
  tManual?: number | null;
  noPermitirNegativos: boolean;
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
  tManualAplicado: boolean;
  cobertura: number;
  correccion: number;
  unidadesCorreccion: number;
  ajusteInferior: number;
  ajusteSuperior: number;
  minimoCorregido: number;
  maximoCorregido: number;
  ultimoLimiteSuperior: number;
  noPermitirNegativos: boolean;
  intervalos: IntervaloDistribucionArbitraria[];
}
