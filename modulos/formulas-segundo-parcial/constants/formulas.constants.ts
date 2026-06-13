import type { OpcionSegundoParcial } from "@/modulos/formulas-segundo-parcial/tipos";

export const OPCION_MODO_PROBABILIDAD: OpcionSegundoParcial = {
  id: "modo-probabilidad",
  etiqueta: "Formato de p",
  opciones: [
    { valor: "decimal", etiqueta: "Decimal (0 a 1)" },
    { valor: "porcentaje", etiqueta: "Porcentaje (0 a 100)" },
  ],
};

export const OPCION_TIPO_PROBABILIDAD_COMPLETA: OpcionSegundoParcial = {
  id: "tipo-probabilidad",
  etiqueta: "Tipo de probabilidad",
  opciones: [
    { valor: "exactamente", etiqueta: "Exactamente X" },
    { valor: "menor", etiqueta: "Menor que X" },
    { valor: "menor-igual", etiqueta: "Menor o igual que X" },
    { valor: "mayor", etiqueta: "Mayor que X" },
    { valor: "mayor-igual", etiqueta: "Mayor o igual que X" },
    { valor: "ninguna", etiqueta: "Ninguna / X = 0" },
  ],
};

export const OPCION_TIPO_PROBABILIDAD_SIN_NINGUNA: OpcionSegundoParcial = {
  id: "tipo-probabilidad",
  etiqueta: "Tipo de probabilidad",
  opciones: [
    { valor: "exactamente", etiqueta: "Exactamente X" },
    { valor: "menor", etiqueta: "Menor que X" },
    { valor: "menor-igual", etiqueta: "Menor o igual que X" },
    { valor: "mayor", etiqueta: "Mayor que X" },
    { valor: "mayor-igual", etiqueta: "Mayor o igual que X" },
  ],
};

export const OPCION_MODO_POISSON: OpcionSegundoParcial = {
  id: "modo-lambda",
  etiqueta: "Modo de ingreso de lambda",
  opciones: [
    { valor: "directa", etiqueta: "Lambda directa" },
    { valor: "ajustada", etiqueta: "Ajustar lambda por intervalo" },
  ],
};
