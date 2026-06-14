import type {
  ConfiguracionRegresion,
  IdentificadorRegresion,
} from "@/modulos/regresiones/tipos";

export const configuracionesRegresiones: ReadonlyArray<ConfiguracionRegresion> = [
  {
    id: "regresion-lineal-simple",
    titulo: "REGRESION LINEAL SIMPLE",
    resumen:
      "Ajusta una recta Y = A + BX para estudiar la relacion entre una variable independiente y una dependiente.",
    descripcionBreve:
      "La regresion lineal simple usa el metodo de minimos cuadrados para obtener una recta de ajuste.",
    expresiones: ["Y = A + BX", "B = [nΣXY - ΣXΣY] / [nΣX^2 - (ΣX)^2]", "A = [ΣY - BΣX] / n"],
    definiciones: [
      { simbolo: "X", descripcion: "Variable independiente." },
      { simbolo: "Y", descripcion: "Variable dependiente." },
      { simbolo: "A", descripcion: "Intercepto u ordenada al origen." },
      { simbolo: "B", descripcion: "Pendiente o cambio esperado de Y por cada unidad de X." },
    ],
    condiciones: [
      "Minimo 2 pares completos X, Y.",
      "X y Y pueden ser enteros, decimales, positivos, negativos o cero.",
      "No todos los valores de X pueden ser iguales.",
      "No se permiten letras ni pares incompletos.",
    ],
    minimoPares: 2,
    permiteEstimacionX: true,
    usaLogaritmos: false,
    ejemplos: [
      {
        etiqueta: "Ejemplo 1",
        pares: [
          { x: 10, y: 15 },
          { x: 15, y: 18 },
          { x: 20, y: 22 },
          { x: 25, y: 27 },
          { x: 30, y: 30 },
        ],
      },
      {
        etiqueta: "Ejemplo 2 inverso",
        pares: [
          { x: 10, y: 95 },
          { x: 20, y: 80 },
          { x: 30, y: 68 },
          { x: 40, y: 55 },
          { x: 50, y: 45 },
        ],
      },
    ],
    columnasTabla: ["X", "Y", "XY", "X^2"],
    palabrasClave: [
      "regresion",
      "lineal",
      "minimos cuadrados",
      "recta",
      "prediccion",
    ],
  },
  {
    id: "regresion-cuadratica",
    titulo: "REGRESION CUADRATICA",
    resumen:
      "Ajusta una parabola Y = A + BX + CX^2 para relaciones con curvatura.",
    descripcionBreve:
      "La regresion cuadratica resuelve un sistema normal de tres ecuaciones para calcular A, B y C.",
    expresiones: [
      "Y = A + BX + CX^2",
      "ΣY = nA + BΣX + CΣX^2",
      "ΣXY = AΣX + BΣX^2 + CΣX^3",
      "ΣX^2Y = AΣX^2 + BΣX^3 + CΣX^4",
    ],
    definiciones: [
      { simbolo: "X", descripcion: "Variable independiente." },
      { simbolo: "Y", descripcion: "Variable dependiente." },
      { simbolo: "A", descripcion: "Intercepto del modelo." },
      { simbolo: "B", descripcion: "Coeficiente lineal." },
      { simbolo: "C", descripcion: "Coeficiente cuadratico que define la curvatura." },
    ],
    condiciones: [
      "Minimo 3 pares completos X, Y.",
      "X y Y pueden ser enteros, decimales, positivos, negativos o cero.",
      "No todos los valores de X pueden ser iguales.",
      "Debe existir suficiente variacion para resolver el sistema.",
    ],
    minimoPares: 3,
    permiteEstimacionX: true,
    usaLogaritmos: false,
    ejemplos: [
      {
        etiqueta: "Ejemplo 1",
        pares: [
          { x: 10, y: 120 },
          { x: 20, y: 180 },
          { x: 30, y: 280 },
          { x: 40, y: 420 },
          { x: 50, y: 600 },
        ],
      },
      {
        etiqueta: "Ejemplo 2",
        pares: [
          { x: 3, y: 8 },
          { x: 4, y: 6 },
          { x: 5, y: 5 },
          { x: 6, y: 7 },
          { x: 7, y: 9 },
          { x: 8, y: 13 },
          { x: 9, y: 21 },
        ],
      },
    ],
    columnasTabla: ["X", "Y", "XY", "X^2", "X^3", "X^4", "X^2Y"],
    palabrasClave: [
      "regresion",
      "cuadratica",
      "parabola",
      "curvatura",
      "prediccion",
    ],
  },
  {
    id: "regresion-exponencial",
    titulo: "REGRESION EXPONENCIAL",
    resumen:
      "Ajusta un modelo Y = a * e^(bX) o Y = a * 10^(BX) segun el tipo de logaritmo elegido.",
    descripcionBreve:
      "Transforma Y con logaritmos y luego ajusta una regresion lineal sobre la variable transformada.",
    expresiones: [
      "Y = a * e^(bX)",
      "V = ln(Y) o V = log10(Y)",
      "V = A + BX",
      "a = e^A o a = 10^A",
    ],
    definiciones: [
      { simbolo: "X", descripcion: "Variable independiente." },
      { simbolo: "Y", descripcion: "Variable dependiente, siempre mayor que 0." },
      { simbolo: "V", descripcion: "Logaritmo de Y segun la base elegida." },
      { simbolo: "A", descripcion: "Logaritmo del factor a." },
      { simbolo: "B", descripcion: "Pendiente de la recta transformada." },
      { simbolo: "a", descripcion: "Factor de escala del modelo exponencial." },
      { simbolo: "b", descripcion: "Tasa de crecimiento o decrecimiento." },
    ],
    condiciones: [
      "Minimo 2 pares completos X, Y.",
      "X puede ser entero, decimal, positivo, negativo o cero.",
      "Todos los valores de Y deben ser mayores que 0.",
      "No todos los valores de X pueden ser iguales.",
    ],
    minimoPares: 2,
    permiteEstimacionX: true,
    usaLogaritmos: true,
    ejemplos: [
      {
        etiqueta: "Ejemplo base",
        pares: [
          { x: 1, y: 10.5 },
          { x: 2, y: 12.3 },
          { x: 3, y: 17.4 },
          { x: 4, y: 23.2 },
          { x: 5, y: 36.9 },
        ],
      },
    ],
    columnasTabla: ["X", "Y", "V", "X^2", "XV"],
    palabrasClave: [
      "regresion",
      "exponencial",
      "logaritmos",
      "crecimiento",
      "decrecimiento",
    ],
  },
  {
    id: "regresion-potencial",
    titulo: "REGRESION POTENCIAL",
    resumen:
      "Ajusta un modelo Y = a * X^b mediante transformacion logaritmica en X y Y.",
    descripcionBreve:
      "La regresion potencial usa log(X) y log(Y) para convertir el problema en una recta.",
    expresiones: [
      "Y = a * X^b",
      "U = log(Y)",
      "V = log(X)",
      "U = A + BV",
      "a = e^A o a = 10^A",
    ],
    definiciones: [
      { simbolo: "X", descripcion: "Variable independiente, siempre mayor que 0." },
      { simbolo: "Y", descripcion: "Variable dependiente, siempre mayor que 0." },
      { simbolo: "U", descripcion: "Logaritmo de Y." },
      { simbolo: "V", descripcion: "Logaritmo de X." },
      { simbolo: "A", descripcion: "Logaritmo del factor a." },
      { simbolo: "B", descripcion: "Exponente b del modelo potencial." },
      { simbolo: "a", descripcion: "Factor de escala del modelo." },
      { simbolo: "b", descripcion: "Exponente de la potencia." },
    ],
    condiciones: [
      "Minimo 2 pares completos X, Y.",
      "Todos los valores de X deben ser mayores que 0.",
      "Todos los valores de Y deben ser mayores que 0.",
      "No todos los valores de X pueden ser iguales.",
    ],
    minimoPares: 2,
    permiteEstimacionX: true,
    usaLogaritmos: true,
    ejemplos: [
      {
        etiqueta: "Ejemplo base",
        pares: [
          { x: 1, y: 14 },
          { x: 2, y: 87 },
          { x: 3, y: 640 },
          { x: 4, y: 770 },
          { x: 5, y: 1860 },
        ],
      },
    ],
    columnasTabla: ["X", "Y", "V", "U", "UV", "V^2"],
    palabrasClave: [
      "regresion",
      "potencial",
      "potencia",
      "logaritmos",
      "modelo",
    ],
  },
];

export function obtenerConfiguracionRegresion(
  regresionId: IdentificadorRegresion,
) {
  const configuracion = configuracionesRegresiones.find(
    (item) => item.id === regresionId,
  );

  if (!configuracion) {
    throw new Error(`No existe configuracion para ${regresionId}.`);
  }

  return configuracion;
}
