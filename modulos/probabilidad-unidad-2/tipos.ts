import type {
  PrecisionResultado,
  ResultadoFormulaSegundoParcial,
} from "@/modulos/formulas-segundo-parcial/tipos";

export type IdentificadorProbabilidadUnidad2 =
  | "probabilidad-clasica"
  | "probabilidad-eventos-compuestos"
  | "probabilidad-condicional"
  | "teorema-bayes";

export type ModoValorProbabilidad = "cantidades" | "decimal" | "porcentaje";

export type CantidadEventosCompuestos = 2 | 3 | 4;

export type ConsultaDosEventos =
  | "evento-a"
  | "evento-b"
  | "interseccion"
  | "union"
  | "solo-a"
  | "solo-b"
  | "complemento-a"
  | "complemento-b"
  | "ninguno"
  | "exactamente-uno";

export type ConsultaTresEventos =
  | "evento-a"
  | "evento-b"
  | "evento-c"
  | "interseccion-ab"
  | "interseccion-ac"
  | "interseccion-bc"
  | "interseccion-abc"
  | "union-total"
  | "solo-a"
  | "solo-b"
  | "solo-c"
  | "solo-ab"
  | "solo-ac"
  | "solo-bc"
  | "ninguno"
  | "al-menos-uno"
  | "exactamente-uno"
  | "exactamente-dos"
  | "union-ab"
  | "union-ac"
  | "union-bc"
  | "union-ab-sin-c"
  | "union-ac-sin-b"
  | "union-bc-sin-a"
  | "complemento-a"
  | "complemento-b"
  | "complemento-c";

export type ConsultaCuatroEventos =
  | "union-total"
  | "ninguno"
  | "solo-a"
  | "solo-b"
  | "solo-c"
  | "solo-d"
  | "interseccion-ab"
  | "interseccion-ac"
  | "interseccion-ad"
  | "interseccion-bc"
  | "interseccion-bd"
  | "interseccion-cd"
  | "interseccion-abc"
  | "interseccion-abd"
  | "interseccion-acd"
  | "interseccion-bcd"
  | "interseccion-abcd"
  | "complemento-a"
  | "complemento-b"
  | "complemento-c"
  | "complemento-d"
  | "exactamente-uno"
  | "exactamente-dos"
  | "exactamente-tres";

export interface TarjetaProbabilidadUnidad2 {
  id: IdentificadorProbabilidadUnidad2;
  titulo: string;
  resumen: string;
  palabrasClave: string[];
}

export interface RegionVisualSimple {
  id: string;
  etiqueta: string;
  valor: string;
  resaltada?: boolean;
}

export interface ModeloVisualEspacioMuestral {
  tipo: "espacio-muestral";
  titulo: string;
  universoEtiqueta: string;
  eventoEtiqueta: string;
  regiones: {
    evento: RegionVisualSimple;
    complemento: RegionVisualSimple;
  };
  elementosEspacio?: string[];
  elementosEvento?: string[];
}

export interface ModeloVisualVennDos {
  tipo: "venn-2";
  titulo: string;
  nombreA: string;
  nombreB: string;
  universoEtiqueta: string;
  regiones: {
    soloA: RegionVisualSimple;
    interseccion: RegionVisualSimple;
    soloB: RegionVisualSimple;
    ninguno?: RegionVisualSimple;
  };
}

export interface ModeloVisualVennTres {
  tipo: "venn-3";
  titulo: string;
  nombres: [string, string, string];
  universoEtiqueta: string;
  regiones: {
    soloA: RegionVisualSimple;
    soloB: RegionVisualSimple;
    soloC: RegionVisualSimple;
    soloAB: RegionVisualSimple;
    soloAC: RegionVisualSimple;
    soloBC: RegionVisualSimple;
    triple: RegionVisualSimple;
    ninguno?: RegionVisualSimple;
  };
}

export interface ModeloVisualTablaRegiones {
  tipo: "tabla-regiones";
  titulo: string;
  columnas: string[];
  filas: Array<{
    id: string;
    celdas: string[];
    resaltada?: boolean;
  }>;
}

export interface ModeloVisualContingencia {
  tipo: "contingencia";
  titulo: string;
  nombreFilas: string;
  nombreColumnas: string;
  filas: [string, string];
  columnas: [string, string];
  celdas: [[string, string], [string, string]];
  totalesFila: [string, string];
  totalesColumna: [string, string];
  totalGeneral: string;
  resaltadas?: Array<"f1c1" | "f1c2" | "f2c1" | "f2c2" | "fila1" | "fila2" | "col1" | "col2">;
}

export interface RamaVisualBayes {
  id: string;
  hipotesis: string;
  previa: string;
  evidencia: string;
  complemento: string;
  conjuntaEvidencia: string;
  conjuntaComplemento: string;
  resaltada: boolean;
}

export interface ModeloVisualArbolBayes {
  tipo: "arbol-bayes";
  titulo: string;
  evidencia: string;
  complemento: string;
  ramas: RamaVisualBayes[];
}

export type ModeloVisualProbabilidadUnidad2 =
  | ModeloVisualEspacioMuestral
  | ModeloVisualVennDos
  | ModeloVisualVennTres
  | ModeloVisualTablaRegiones
  | ModeloVisualContingencia
  | ModeloVisualArbolBayes;

export interface ResultadoCalculadoProbabilidad {
  panel: ResultadoFormulaSegundoParcial;
  visual?: ModeloVisualProbabilidadUnidad2;
}

export interface ConfiguracionProbabilidadUnidad2 {
  id: IdentificadorProbabilidadUnidad2;
  titulo: string;
  resumen: string;
  palabrasClave: string[];
}

export interface ValorEtiquetaProbabilidad {
  valor: number;
  etiqueta: string;
}

export interface OpcionConsulta {
  valor: string;
  etiqueta: string;
}

export interface EstadoPrecisionBase {
  precision: PrecisionResultado;
}
