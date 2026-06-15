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
  "probabilidad-condicional": {
    id: "probabilidad-condicional",
    titulo: "PROBABILIDAD CONDICIONAL",
    resumen:
      "Calcula P(A|B) o P(B|A) desde eventos, diagramas de Venn o tablas de contingencia 2 x 2.",
    palabrasClave: [
      "probabilidad condicional",
      "p(a|b)",
      "tabla contingencia",
      "condicionante",
    ],
  },
  "teorema-bayes": {
    id: "teorema-bayes",
    titulo: "TEOREMA DE BAYES",
    resumen:
      "Calcula probabilidades posteriores con 2 a 6 hipotesis, mostrando ramas, conjuntas y evidencia total.",
    palabrasClave: [
      "bayes",
      "probabilidad posterior",
      "hipotesis",
      "evidencia",
      "arbol",
    ],
  },
};

export const tarjetasProbabilidadUnidad2: TarjetaProbabilidadUnidad2[] =
  Object.values(configuracionesProbabilidadUnidad2);

export function obtenerConfiguracionProbabilidadUnidad2(
  id: IdentificadorProbabilidadUnidad2,
) {
  return configuracionesProbabilidadUnidad2[id];
}
