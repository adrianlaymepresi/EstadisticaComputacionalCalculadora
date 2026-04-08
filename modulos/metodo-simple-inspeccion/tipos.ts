export interface FilaMetodoSimpleInspeccion {
  valor: string;
  conteo: string;
  fi: number;
  hi: number;
  pi: number;
  Fi: number;
  Hi: number;
  Pi: number;
}

export interface ResultadoMetodoSimpleInspeccion {
  n: number;
  cantidadValoresDistintos: number;
  todosSonNumericos: boolean;
  precisionNumerica: number;
  filas: FilaMetodoSimpleInspeccion[];
}
