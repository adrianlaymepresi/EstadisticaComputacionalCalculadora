import type {
  ConfiguracionProbabilidadUnidad2,
  IdentificadorProbabilidadUnidad2,
  TarjetaProbabilidadUnidad2,
} from "@/modulos/probabilidad-unidad-2/tipos";

export const configuracionesProbabilidadUnidad2: Record<
  IdentificadorProbabilidadUnidad2,
  ConfiguracionProbabilidadUnidad2
> = {
  "probabilidad-clasica": {
    id: "probabilidad-clasica",
    titulo: "PROBABILIDAD CLASICA",
    resumen:
      "Calcula la razon entre casos favorables y casos posibles, ya sea por cantidades o por listado del espacio muestral.",
    palabrasClave: [
      "probabilidad clasica",
      "casos favorables",
      "espacio muestral",
      "evento",
    ],
  },
  "probabilidad-eventos-compuestos": {
    id: "probabilidad-eventos-compuestos",
    titulo: "PROBABILIDAD DE EVENTOS COMPUESTOS",
    resumen:
      "Resuelve consultas con 2, 3 o 4 eventos usando uniones, intersecciones, complementos y regiones del diagrama.",
    palabrasClave: [
      "eventos compuestos",
      "venn",
      "union",
      "interseccion",
      "complemento",
      "probabilidad",
    ],
  },
  "probabilidad-condicional-simple": {
    id: "probabilidad-condicional-simple",
    titulo: "PROBABILIDAD CONDICIONAL",
    resumen:
      "Aplica la formula directa P(A|B) o P(B|A) usando probabilidades, porcentajes o cantidades.",
    palabrasClave: [
      "probabilidad condicional",
      "p(a|b)",
      "p(b|a)",
      "formula directa",
      "cantidades",
    ],
  },
  "probabilidad-condicional": {
    id: "probabilidad-condicional",
    titulo: "PROBABILIDAD CONDICIONAL + CONJUNTOS",
    resumen:
      "Calcula condicionales desde eventos, diagramas de Venn, conjuntos y tablas de contingencia 2 x 2.",
    palabrasClave: [
      "probabilidad condicional",
      "conjuntos",
      "p(a|b)",
      "tabla contingencia",
      "condicionante",
    ],
  },
  "teorema-bayes-simple": {
    id: "teorema-bayes-simple",
    titulo: "TEOREMA DE BAYES",
    resumen:
      "Aplica Bayes con 2 a 6 hipotesis mediante tabla, procedimiento y resultado posterior.",
    palabrasClave: [
      "teorema de bayes",
      "bayes simple",
      "hipotesis",
      "evidencia",
      "posterior",
    ],
  },
  "diagrama-arbol-probabilidad": {
    id: "diagrama-arbol-probabilidad",
    titulo: "DIAGRAMA DE ARBOL",
    resumen:
      "Construye y ordena un arbol de probabilidad visual con ramas, etiquetas y probabilidades acumuladas.",
    palabrasClave: [
      "diagrama de arbol",
      "arbol de probabilidad",
      "ramas",
      "probabilidad acumulada",
      "visual",
    ],
  },
  "teorema-bayes": {
    id: "teorema-bayes",
    titulo: "DIAGRAMA DE ARBOL + BAYES",
    resumen:
      "Calcula probabilidades posteriores con hipotesis, evidencia, complemento y apoyo visual tipo arbol.",
    palabrasClave: [
      "bayes",
      "probabilidad posterior",
      "hipotesis",
      "evidencia",
      "arbol",
    ],
  },
};

export const tarjetasProbabilidadUnidad2: TarjetaProbabilidadUnidad2[] = [
  configuracionesProbabilidadUnidad2["probabilidad-clasica"],
  configuracionesProbabilidadUnidad2["probabilidad-eventos-compuestos"],
  configuracionesProbabilidadUnidad2["probabilidad-condicional-simple"],
  configuracionesProbabilidadUnidad2["probabilidad-condicional"],
  configuracionesProbabilidadUnidad2["teorema-bayes-simple"],
  configuracionesProbabilidadUnidad2["diagrama-arbol-probabilidad"],
  configuracionesProbabilidadUnidad2["teorema-bayes"],
];

export function obtenerConfiguracionProbabilidadUnidad2(
  id: IdentificadorProbabilidadUnidad2,
) {
  return configuracionesProbabilidadUnidad2[id];
}
