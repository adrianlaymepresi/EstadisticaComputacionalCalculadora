import type { TarjetaUnidad } from "@/datos/dashboard";
import type {
  ConfiguracionMedidaPosicion,
  IdentificadorMedidaPosicion,
} from "@/modulos/medidas-posicion/tipos";

const ejemploClasificadoGeneral = [
  { li: "21", ls: "29", fi: "4" },
  { li: "29", ls: "37", fi: "8" },
  { li: "37", ls: "45", fi: "10" },
  { li: "45", ls: "53", fi: "6" },
  { li: "53", ls: "61", fi: "2" },
];

export const configuracionesMedidasPosicion: Record<
  IdentificadorMedidaPosicion,
  ConfiguracionMedidaPosicion
> = {
  "medidas-posicion-todas": {
    id: "medidas-posicion-todas",
    titulo: "Todas las medidas de posicion",
    resumen:
      "Resume media aritmetica, media geometrica, media armonica, mediana, moda, cuartiles, deciles y percentiles en una sola tabla.",
    formulasNoClasificados: [
      "Media aritmetica = sum(xi) / n",
      "Media geometrica = n-esima raiz(producto de xi)",
      "Media armonica = n / sum(1/xi)",
      "Mediana, moda y cuantiles segun datos ordenados",
    ],
    formulasClasificados: [
      "Media aritmetica = sum(xi * fi) / n",
      "Media geometrica = exp(sum(fi * ln(xi)) / n)",
      "Media armonica = n / sum(fi / xi)",
      "Mediana, moda y cuantiles segun clase correspondiente",
    ],
    definicionesNoClasificados: [
      { simbolo: "xi", descripcion: "Cada dato individual de la muestra." },
      { simbolo: "n", descripcion: "Cantidad total de datos." },
    ],
    definicionesClasificados: [
      { simbolo: "Li", descripcion: "Limite inferior del intervalo." },
      { simbolo: "Ls", descripcion: "Limite superior del intervalo." },
      { simbolo: "xi", descripcion: "Marca de clase: (Li + Ls) / 2." },
      { simbolo: "fi", descripcion: "Frecuencia absoluta de la clase." },
      { simbolo: "n", descripcion: "Suma total de frecuencias." },
    ],
    condicionesNoClasificados: [
      "Los datos deben ser numericos.",
      "Cuartiles, deciles y percentiles ordenan los datos de menor a mayor.",
      "La media geometrica y armonica exigen valores mayores que cero.",
    ],
    condicionesClasificados: [
      "Ls debe ser mayor que Li en cada fila.",
      "fi debe ser un entero positivo.",
      "Las clases deben ingresarse en orden ascendente y sin traslapes.",
    ],
    ejemploNoClasificados: "5; 7; 2; 9; 3; 7; 4",
    ejemploClasificados: ejemploClasificadoGeneral,
  },
  "media-aritmetica": {
    id: "media-aritmetica",
    titulo: "Media aritmetica",
    resumen:
      "Calcula el promedio simple o agrupado siguiendo las formulas del PDF del docente.",
    formulasNoClasificados: [
      "x̄ = (x1 + x2 + ... + xn) / n",
      "x̄ = (1/n) * sum(xi)",
    ],
    formulasClasificados: [
      "x̄ = (x1*f1 + x2*f2 + ... + xk*fk) / n",
      "x̄ = (1/n) * sum(xi * fi)",
    ],
    definicionesNoClasificados: [
      { simbolo: "xi", descripcion: "Cada dato de la muestra." },
      { simbolo: "n", descripcion: "Cantidad total de datos." },
    ],
    definicionesClasificados: [
      { simbolo: "xi", descripcion: "Marca de clase." },
      { simbolo: "fi", descripcion: "Frecuencia absoluta." },
      { simbolo: "n", descripcion: "Suma de frecuencias." },
    ],
    condicionesNoClasificados: [
      "Los datos deben ser numericos.",
      "Se acepta trabajar con enteros o decimales.",
    ],
    condicionesClasificados: [
      "Li y Ls pueden ser enteros o decimales.",
      "fi debe ser entero positivo.",
    ],
    ejemploNoClasificados: "5; 7; 2; 9; 3; 7; 4",
    ejemploClasificados: [
      { li: "0", ls: "4", fi: "3" },
      { li: "4", ls: "8", fi: "7" },
      { li: "8", ls: "12", fi: "12" },
      { li: "12", ls: "16", fi: "10" },
      { li: "16", ls: "20", fi: "8" },
    ],
  },
  "media-geometrica": {
    id: "media-geometrica",
    titulo: "Media geometrica",
    resumen:
      "Promedia datos en progresion geometrica, razones, indices y tasas usando la definicion del docente.",
    formulasNoClasificados: [
      "xg = n-esima raiz(x1 * x2 * ... * xn)",
      "xg = exp(sum(ln(xi)) / n)",
    ],
    formulasClasificados: [
      "xg = n-esima raiz(x1^f1 * x2^f2 * ... * xk^fk)",
      "xg = exp(sum(fi * ln(xi)) / n)",
    ],
    definicionesNoClasificados: [
      { simbolo: "xi", descripcion: "Cada dato positivo de la muestra." },
      { simbolo: "n", descripcion: "Cantidad total de datos." },
    ],
    definicionesClasificados: [
      { simbolo: "xi", descripcion: "Marca de clase positiva." },
      { simbolo: "fi", descripcion: "Frecuencia absoluta." },
      { simbolo: "n", descripcion: "Suma de frecuencias." },
    ],
    condicionesNoClasificados: [
      "Todos los datos deben ser mayores que cero.",
      "La media geometrica carece de sentido para datos negativos o nulos.",
    ],
    condicionesClasificados: [
      "Todas las marcas de clase xi deben ser mayores que cero.",
      "fi debe ser entero positivo.",
    ],
    ejemploNoClasificados: "1,08; 1,10; 1,15; 1,20",
    ejemploClasificados: [
      { li: "5", ls: "9", fi: "1" },
      { li: "9", ls: "13", fi: "3" },
      { li: "13", ls: "17", fi: "8" },
      { li: "17", ls: "21", fi: "18" },
      { li: "21", ls: "25", fi: "10" },
    ],
  },
  "media-armonica": {
    id: "media-armonica",
    titulo: "Media armonica",
    resumen:
      "Calcula el promedio armonico para razones de cambio y valores positivos siguiendo el material del tema.",
    formulasNoClasificados: [
      "xh = n / (1/x1 + 1/x2 + ... + 1/xn)",
      "xh = n / sum(1/xi)",
    ],
    formulasClasificados: [
      "xh = n / (f1/x1 + f2/x2 + ... + fk/xk)",
      "xh = n / sum(fi/xi)",
    ],
    definicionesNoClasificados: [
      { simbolo: "xi", descripcion: "Cada dato positivo de la muestra." },
      { simbolo: "n", descripcion: "Cantidad total de datos." },
    ],
    definicionesClasificados: [
      { simbolo: "xi", descripcion: "Marca de clase positiva." },
      { simbolo: "fi", descripcion: "Frecuencia absoluta." },
      { simbolo: "n", descripcion: "Suma de frecuencias." },
    ],
    condicionesNoClasificados: [
      "No se aceptan datos iguales a cero.",
      "Para un uso seguro en este modulo se trabajan valores mayores que cero.",
    ],
    condicionesClasificados: [
      "Las marcas de clase xi deben ser mayores que cero.",
      "fi debe ser entero positivo.",
    ],
    ejemploNoClasificados: "2,00; 1,60; 1,30; 1,00",
    ejemploClasificados: [
      { li: "54", ls: "57", fi: "2" },
      { li: "57", ls: "60", fi: "3" },
      { li: "60", ls: "63", fi: "5" },
      { li: "63", ls: "66", fi: "6" },
      { li: "66", ls: "69", fi: "10" },
      { li: "69", ls: "72", fi: "14" },
    ],
  },
  mediana: {
    id: "mediana",
    titulo: "Mediana",
    resumen:
      "Localiza el valor central de la distribucion, tanto en datos no clasificados como agrupados.",
    formulasNoClasificados: [
      "Si n es impar: m = dato en la posicion (n + 1) / 2",
      "Si n es par: m = promedio entre los datos en n/2 y (n/2) + 1",
    ],
    formulasClasificados: [
      "m = Li + (((n/2) - Fi-1) * t) / fi",
    ],
    definicionesNoClasificados: [
      { simbolo: "n", descripcion: "Cantidad total de datos ordenados." },
      { simbolo: "m", descripcion: "Valor central de la muestra." },
    ],
    definicionesClasificados: [
      { simbolo: "Li", descripcion: "Limite inferior de la clase mediana." },
      { simbolo: "n", descripcion: "Numero total de observaciones." },
      {
        simbolo: "Fi-1",
        descripcion: "Frecuencia acumulada anterior a la clase mediana.",
      },
      { simbolo: "t", descripcion: "Amplitud de la clase mediana." },
      { simbolo: "fi", descripcion: "Frecuencia absoluta de la clase mediana." },
      { simbolo: "n/2", descripcion: "Clave para encontrar la clase mediana." },
    ],
    condicionesNoClasificados: [
      "Los datos se ordenan de menor a mayor antes de calcular.",
      "Se acepta trabajar con enteros o decimales.",
    ],
    condicionesClasificados: [
      "La clase mediana es la primera cuya Fi alcanza o supera n/2.",
      "fi debe ser entero positivo.",
    ],
    ejemploNoClasificados: "8; 10; 0; 9; 2; 12; 12",
    ejemploClasificados: [
      { li: "18,3", ls: "23,6", fi: "8" },
      { li: "23,6", ls: "28,9", fi: "10" },
      { li: "28,9", ls: "34,2", fi: "9" },
      { li: "34,2", ls: "39,5", fi: "6" },
      { li: "39,5", ls: "44,8", fi: "3" },
    ],
  },
  moda: {
    id: "moda",
    titulo: "Moda",
    resumen:
      "Detecta el dato o clase de mayor frecuencia y permite distinguir si la distribucion es unimodal o multimodal.",
    formulasNoClasificados: [
      "La moda es el valor que presenta la mayor frecuencia.",
    ],
    formulasClasificados: [
      "mo = Li + (t * d1) / (d1 + d2)",
    ],
    definicionesNoClasificados: [
      { simbolo: "fi", descripcion: "Frecuencia de repeticion de cada dato." },
    ],
    definicionesClasificados: [
      { simbolo: "Li", descripcion: "Limite inferior de la clase modal." },
      { simbolo: "t", descripcion: "Amplitud de la clase modal." },
      {
        simbolo: "d1",
        descripcion: "Diferencia entre la frecuencia modal y la frecuencia anterior.",
      },
      {
        simbolo: "d2",
        descripcion: "Diferencia entre la frecuencia modal y la frecuencia posterior.",
      },
    ],
    condicionesNoClasificados: [
      "Si todas las frecuencias son iguales, la distribucion puede ser amodal.",
      "Si varias frecuencias maximas coinciden, la distribucion es multimodal.",
    ],
    condicionesClasificados: [
      "La formula cerrada requiere una sola clase modal con frecuencia maxima.",
      "d1 + d2 debe ser mayor que cero.",
    ],
    ejemploNoClasificados: "1; 2; 2; 4; 1; 2; 4; 2",
    ejemploClasificados: [
      { li: "5", ls: "12", fi: "2" },
      { li: "12", ls: "19", fi: "7" },
      { li: "19", ls: "26", fi: "10" },
      { li: "26", ls: "33", fi: "5" },
      { li: "33", ls: "40", fi: "1" },
    ],
  },
  cuartiles: {
    id: "cuartiles",
    titulo: "Cuartiles",
    resumen:
      "Calcula cuartiles para datos ordenados o agrupados aplicando interpolacion cuando corresponda.",
    formulasNoClasificados: [
      "Posicion(Qk) = k * (n + 1) / 4",
      "Si la posicion no es entera, se usa interpolacion lineal.",
    ],
    formulasClasificados: [
      "Qk = Li + (((k*n)/4 - Fi-1) * t) / fi",
    ],
    definicionesNoClasificados: [
      { simbolo: "k", descripcion: "Cuartil solicitado: 1, 2 o 3." },
      { simbolo: "n", descripcion: "Cantidad total de datos ordenados." },
    ],
    definicionesClasificados: [
      { simbolo: "Qk", descripcion: "Cuartil k-esimo." },
      { simbolo: "Li", descripcion: "Limite inferior de la clase cuartilica." },
      { simbolo: "Fi-1", descripcion: "Frecuencia acumulada anterior." },
      { simbolo: "t", descripcion: "Amplitud de la clase cuartilica." },
      { simbolo: "fi", descripcion: "Frecuencia absoluta de la clase cuartilica." },
      { simbolo: "k*n/4", descripcion: "Clave para ubicar la clase cuartilica." },
    ],
    condicionesNoClasificados: [
      "Los datos se ordenan ascendentemente antes del calculo.",
      "k debe estar entre 1 y 3.",
    ],
    condicionesClasificados: [
      "k debe estar entre 1 y 3.",
      "La clase cuartilica es la primera cuya Fi alcanza o supera k*n/4.",
    ],
    ejemploNoClasificados: "8; 7; 15; 4; 10; 9; 1",
    ejemploClasificados: ejemploClasificadoGeneral,
    requiereCuantil: {
      simbolo: "Q",
      etiqueta: "Cuartil a calcular",
      minimo: 1,
      maximo: 3,
      valorInicial: 1,
    },
  },
  deciles: {
    id: "deciles",
    titulo: "Deciles",
    resumen:
      "Ubica deciles en datos ordenados o agrupados usando la formula y la interpolacion del docente.",
    formulasNoClasificados: [
      "Posicion(Dk) = k * (n + 1) / 10",
      "Si la posicion no es entera, se usa interpolacion lineal.",
    ],
    formulasClasificados: [
      "Dk = Li + (((k*n)/10 - Fi-1) * t) / fi",
    ],
    definicionesNoClasificados: [
      { simbolo: "k", descripcion: "Decil solicitado: de 1 a 9." },
      { simbolo: "n", descripcion: "Cantidad total de datos ordenados." },
    ],
    definicionesClasificados: [
      { simbolo: "Dk", descripcion: "Decil k-esimo." },
      { simbolo: "Li", descripcion: "Limite inferior de la clase decilica." },
      { simbolo: "Fi-1", descripcion: "Frecuencia acumulada anterior." },
      { simbolo: "t", descripcion: "Amplitud de la clase decilica." },
      { simbolo: "fi", descripcion: "Frecuencia absoluta de la clase decilica." },
      { simbolo: "k*n/10", descripcion: "Clave para ubicar la clase decilica." },
    ],
    condicionesNoClasificados: [
      "Los datos se ordenan ascendentemente antes del calculo.",
      "k debe estar entre 1 y 9.",
    ],
    condicionesClasificados: [
      "k debe estar entre 1 y 9.",
      "La clase decilica es la primera cuya Fi alcanza o supera k*n/10.",
    ],
    ejemploNoClasificados: "0; 1; 3; 3; 4; 5; 5; 6; 6; 8",
    ejemploClasificados: ejemploClasificadoGeneral,
    requiereCuantil: {
      simbolo: "D",
      etiqueta: "Decil a calcular",
      minimo: 1,
      maximo: 9,
      valorInicial: 3,
    },
  },
  percentiles: {
    id: "percentiles",
    titulo: "Percentiles",
    resumen:
      "Calcula percentiles con posicion k*(n+1)/100 para datos no clasificados y con formula de clase percentilica en datos agrupados.",
    formulasNoClasificados: [
      "Posicion(Pk) = k * (n + 1) / 100",
      "Si la posicion no es entera, se usa interpolacion lineal.",
    ],
    formulasClasificados: [
      "Pk = Li + (((k*n)/100 - Fi-1) * t) / fi",
    ],
    definicionesNoClasificados: [
      { simbolo: "k", descripcion: "Percentil solicitado: de 1 a 99." },
      { simbolo: "n", descripcion: "Cantidad total de datos ordenados." },
    ],
    definicionesClasificados: [
      { simbolo: "Pk", descripcion: "Percentil k-esimo." },
      {
        simbolo: "Li",
        descripcion: "Limite inferior de la clase percentilica.",
      },
      { simbolo: "Fi-1", descripcion: "Frecuencia acumulada anterior." },
      { simbolo: "t", descripcion: "Amplitud de la clase percentilica." },
      {
        simbolo: "fi",
        descripcion: "Frecuencia absoluta de la clase percentilica.",
      },
      {
        simbolo: "k*n/100",
        descripcion: "Clave para ubicar la clase percentilica.",
      },
    ],
    condicionesNoClasificados: [
      "Los datos se ordenan ascendentemente antes del calculo.",
      "k debe estar entre 1 y 99.",
    ],
    condicionesClasificados: [
      "k debe estar entre 1 y 99.",
      "La clase percentilica es la primera cuya Fi alcanza o supera k*n/100.",
    ],
    ejemploNoClasificados: "9; 3; 1; 4; 2; 2; 2; 3; 1",
    ejemploClasificados: ejemploClasificadoGeneral,
    requiereCuantil: {
      simbolo: "P",
      etiqueta: "Percentil a calcular",
      minimo: 1,
      maximo: 99,
      valorInicial: 75,
    },
  },
};

export function obtenerConfiguracionMedidaPosicion(
  medidaId: IdentificadorMedidaPosicion,
) {
  return configuracionesMedidasPosicion[medidaId];
}

export const tarjetasMedidasPosicion: TarjetaUnidad[] = [
  {
    id: "medidas-posicion-todas",
    titulo: "TODOS",
    resumen:
      "Resume todas las medidas de posicion en una sola tabla final, tanto para datos clasificados como no clasificados.",
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Abre un resumen integral con medias, mediana, moda y cuantiles usando el tipo de datos que elijas.",
    nota: "La salida se concentra en una tabla resumen sin procedimiento largo.",
    estado: "disponible",
    palabrasClave: [
      "todas las medidas",
      "medidas de posicion",
      "resumen",
      "media",
      "mediana",
      "moda",
    ],
    herramientaId: "medidas-posicion-todas",
  },
  {
    id: "media-aritmetica",
    titulo: "MEDIA ARITMETICA",
    resumen: configuracionesMedidasPosicion["media-aritmetica"].resumen,
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Desarrolla el calculo paso a paso para datos no clasificados o clasificados.",
    nota: "Muestra sumas, marcas de clase y resultado final con precision configurable.",
    estado: "disponible",
    palabrasClave: ["media aritmetica", "promedio", "x barra"],
    herramientaId: "media-aritmetica",
  },
  {
    id: "media-geometrica",
    titulo: "MEDIA GEOMETRICA",
    resumen: configuracionesMedidasPosicion["media-geometrica"].resumen,
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Trabaja el promedio geometrico con validaciones para datos positivos.",
    nota: "Usa una implementacion estable con logaritmos para evitar errores numericos.",
    estado: "disponible",
    palabrasClave: ["media geometrica", "promedio geometrico", "xg"],
    herramientaId: "media-geometrica",
  },
  {
    id: "media-armonica",
    titulo: "MEDIA ARMONICA",
    resumen: configuracionesMedidasPosicion["media-armonica"].resumen,
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Calcula la media armonica paso a paso para datos simples o agrupados.",
    nota: "Valida ceros y muestra los cocientes involucrados en el procedimiento.",
    estado: "disponible",
    palabrasClave: ["media armonica", "promedio armonico", "xh"],
    herramientaId: "media-armonica",
  },
  {
    id: "mediana",
    titulo: "MEDIANA",
    resumen: configuracionesMedidasPosicion.mediana.resumen,
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Ordena, localiza la posicion central y detalla el procedimiento para ambos tipos de datos.",
    nota: "Explica si n es par o impar y tambien ubica la clase mediana cuando hay intervalos.",
    estado: "disponible",
    palabrasClave: ["mediana", "valor central", "m"],
    herramientaId: "mediana",
  },
  {
    id: "moda",
    titulo: "MODA",
    resumen: configuracionesMedidasPosicion.moda.resumen,
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Analiza frecuencias para detectar la moda o la clase modal y mostrar su interpretacion.",
    nota: "Distingue entre distribuciones unimodales, multimodales o amodales.",
    estado: "disponible",
    palabrasClave: ["moda", "valor tipico", "frecuencia maxima"],
    herramientaId: "moda",
  },
  {
    id: "cuartiles",
    titulo: "CUARTILES",
    resumen: configuracionesMedidasPosicion.cuartiles.resumen,
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Calcula cuartiles con interpolacion o formula de clase cuartilica segun el tipo de dato.",
    nota: "Incluye selector de k y detalle del proceso completo.",
    estado: "disponible",
    palabrasClave: ["cuartiles", "q1", "q2", "q3"],
    herramientaId: "cuartiles",
  },
  {
    id: "deciles",
    titulo: "DECILES",
    resumen: configuracionesMedidasPosicion.deciles.resumen,
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Calcula deciles con interpolacion o formula de clase decilica segun el tipo de dato.",
    nota: "Incluye selector de k y detalle del proceso completo.",
    estado: "disponible",
    palabrasClave: ["deciles", "d3", "d7", "decil"],
    herramientaId: "deciles",
  },
  {
    id: "percentiles",
    titulo: "PERCENTILES",
    resumen: configuracionesMedidasPosicion.percentiles.resumen,
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Calcula percentiles con posicion o formula de clase percentilica segun corresponda.",
    nota: "Incluye selector de k y detalle del proceso completo.",
    estado: "disponible",
    palabrasClave: ["percentiles", "p75", "percentil"],
    herramientaId: "percentiles",
  },
];
