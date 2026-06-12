import { tarjetasFormulaTema1 } from "@/modulos/formulas-tema-1/servicios/configuraciones-formulas";

export type EstadoTarjeta = "disponible" | "proximamente";
export type IdentificadorHerramienta =
  | "formula-razon"
  | "formula-indice"
  | "formula-proporcion"
  | "formula-porcentaje"
  | "formula-porcentaje-cambio"
  | "formula-porcentaje-error"
  | "formula-tasa"
  | "distribucion-arbitraria"
  | "metodo-sturges"
  | "metodo-maximo-entero"
  | "metodo-simple-inspeccion"
  | "diagrama-burbujas"
  | "diagrama-columnas-simples"
  | "diagrama-columnas-compuestas"
  | "diagrama-barras"
  | "diagrama-bastones"
  | "diagrama-pictogramas"
  | "diagrama-dispersion"
  | "diagrama-lineal";

export interface TarjetaUnidad {
  id: string;
  titulo: string;
  resumen: string;
  etiqueta: string;
  descripcionTrabajo: string;
  nota: string;
  estado: EstadoTarjeta;
  palabrasClave: string[];
  herramientaId?: IdentificadorHerramienta;
}

export interface UnidadTematica {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  palabrasClave: string[];
  tarjetas: TarjetaUnidad[];
}

const tarjetasUnidadFormulas: TarjetaUnidad[] = tarjetasFormulaTema1.map(
  (tarjeta) => ({
    id: tarjeta.id,
    titulo: tarjeta.titulo,
    resumen: tarjeta.resumen,
    etiqueta: "Disponible ahora",
    descripcionTrabajo:
      "Muestra la formula, explica las variables, valida los datos de entrada y desarrolla el calculo paso a paso con interpretacion final.",
    nota: "Incluye fraccion exacta cuando corresponde y precision decimal configurable.",
    estado: "disponible",
    palabrasClave: tarjeta.palabrasClave,
    herramientaId: tarjeta.id,
  }),
);

export const unidadesTematicas: ReadonlyArray<UnidadTematica> = [
  {
    id: "unidad-1-1",
    titulo: "Unidad 1.1",
    subtitulo: "Tema 1 - formulas",
    descripcion:
      "Formulas operativas del Tema 1 para razon, indice, proporciones, porcentaje, cambio, error y tasas.",
    palabrasClave: [
      "unidad 1.1",
      "tema 1",
      "formulas",
      "razon",
      "indice",
      "porcentaje",
      "tasa",
    ],
    tarjetas: tarjetasUnidadFormulas,
  },
  {
    id: "unidad-1-2-1",
    titulo: "Unidad 1.2.1",
    subtitulo: "Tablas estadisticas",
    descripcion:
      "Metodos para construir tablas estadisticas con distribucion arbitraria, Sturges, maximo entero y simple inspeccion.",
    palabrasClave: [
      "unidad 1.2.1",
      "tablas estadisticas",
      "distribucion arbitraria",
      "sturges",
      "maximo entero",
      "simple inspeccion",
    ],
    tarjetas: [
      {
        id: "distribucion-arbitraria",
        titulo: "DISTRIBUCION ARBITRARIA",
        resumen:
          "Construye tablas agrupadas usando el valor de k definido por el usuario.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con ingreso de datos, pasos detallados, tabla final, recalculo y exportacion.",
        nota: "Sirve como base reutilizable para los otros metodos agrupados.",
        estado: "disponible",
        palabrasClave: [
          "distribucion arbitraria",
          "tabla estadistica",
          "intervalos",
          "fi",
          "hi",
          "pi",
        ],
        herramientaId: "distribucion-arbitraria",
      },
      {
        id: "metodo-sturges",
        titulo: "METODO DE STURGES",
        resumen:
          "Calcula k con la regla de Sturges y arma la tabla estadistica agrupada.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con captura de datos, calculo de k, pasos, recalculo y exportacion.",
        nota: "Permite elegir el redondeo de k y del tamano de clase sin romper el flujo.",
        estado: "disponible",
        palabrasClave: ["sturges", "tabla estadistica", "k", "intervalos"],
        herramientaId: "metodo-sturges",
      },
      {
        id: "metodo-maximo-entero",
        titulo: "METODO DEL MAXIMO ENTERO",
        resumen:
          "Calcula k con la tecnica del maximo entero y construye la tabla agrupada.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con captura de datos, calculo automatico de k, pasos, recalculo y exportacion.",
        nota: "Mantiene la misma estructura de trabajo de las tablas agrupadas.",
        estado: "disponible",
        palabrasClave: [
          "maximo entero",
          "tabla estadistica",
          "agrupacion",
        ],
        herramientaId: "metodo-maximo-entero",
      },
      {
        id: "metodo-simple-inspeccion",
        titulo: "METODO SIMPLE INSPECCION",
        resumen:
          "Construye tablas directas sin intervalos cuando hay hasta 10 datos distintos.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo de captura directa, agrupacion por valores observados y exportacion a Excel.",
        nota: "Calcula frecuencias simples, relativas y acumuladas sin recalculo manual.",
        estado: "disponible",
        palabrasClave: [
          "simple inspeccion",
          "tabla estadistica",
          "inspeccion",
        ],
        herramientaId: "metodo-simple-inspeccion",
      },
    ],
  },
  {
    id: "unidad-1-2-2",
    titulo: "Unidad 1.2.2",
    subtitulo: "Diagramadores estadisticos",
    descripcion:
      "Diagramas estadisticos del bloque actual con captura de datos, personalizacion y exportacion.",
    palabrasClave: [
      "unidad 1.2.2",
      "diagramas",
      "graficos",
      "burbujas",
      "barras",
      "pictogramas",
    ],
    tarjetas: [
      {
        id: "diagrama-columnas-simples",
        titulo: "DIAGRAMA COLUMNAS SIMPLES",
        resumen:
          "Trabaja con categorias y valores para generar tabla y diagrama de columnas simple.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con captura de datos, tabla, grafico, personalizacion y exportacion.",
        nota: "Mantiene el mismo flujo de trabajo usado en los demas diagramadores.",
        estado: "disponible",
        palabrasClave: [
          "columnas simples",
          "diagrama de columnas simples",
          "categorias",
          "fi",
          "pi",
        ],
        herramientaId: "diagrama-columnas-simples",
      },
      {
        id: "diagrama-columnas-compuestas",
        titulo: "DIAGRAMA COLUMNAS COMPUESTAS",
        resumen:
          "Compara dos grupos por categoria y construye el diagrama de columnas compuestas.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con ingreso de datos, tabla, grafico, personalizacion y exportacion.",
        nota: "Permite trabajar dos series dentro de una misma categoria principal.",
        estado: "disponible",
        palabrasClave: [
          "columnas compuestas",
          "diagrama de columnas compuestas",
          "dos variables cualitativas",
          "series comparadas",
        ],
        herramientaId: "diagrama-columnas-compuestas",
      },
      {
        id: "diagrama-barras",
        titulo: "DIAGRAMA DE BARRAS",
        resumen:
          "Representa categorias con valores grandes usando barras horizontales.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con captura de datos, tabla, grafico, personalizacion y exportacion.",
        nota: "Pensado para valores grandes en una lectura horizontal clara.",
        estado: "disponible",
        palabrasClave: [
          "barras",
          "diagrama de barras",
          "barras horizontales",
          "valores grandes",
        ],
        herramientaId: "diagrama-barras",
      },
      {
        id: "diagrama-bastones",
        titulo: "DIAGRAMA DE BASTONES",
        resumen:
          "Trabaja con valores discretos y su fi para generar la tabla y el diagrama de bastones.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con valores, frecuencias, grafico, personalizacion y exportacion.",
        nota: "Ideal para pocos valores cuantitativos discretos.",
        estado: "disponible",
        palabrasClave: [
          "bastones",
          "diagrama de bastones",
          "xi",
          "fi",
          "pi",
        ],
        herramientaId: "diagrama-bastones",
      },
      {
        id: "diagrama-pictogramas",
        titulo: "DIAGRAMA DE PICTOGRAMAS",
        resumen:
          "Usa una imagen base para representar una variable cualitativa con valores cuantitativos.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con carga de imagen, seleccion individual, tabla y exportacion.",
        nota: "Permite usar una figura general y luego personalizar por dato.",
        estado: "disponible",
        palabrasClave: [
          "pictogramas",
          "diagrama de pictogramas",
          "variable cualitativa",
          "figuras representativas",
          "imagen base",
        ],
        herramientaId: "diagrama-pictogramas",
      },
      {
        id: "diagrama-burbujas",
        titulo: "DIAGRAMA DE BURBUJAS",
        resumen:
          "Integra el flujo completo del diagramador de burbujas con tabla, configuracion y exportacion.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo del diagrama de burbujas adaptado al dashboard.",
        nota: "Replica el comportamiento del proyecto original dentro del sistema actual.",
        estado: "disponible",
        palabrasClave: [
          "burbujas",
          "diagrama de burbujas",
          "visualizacion",
          "exportacion",
          "estadistica",
        ],
        herramientaId: "diagrama-burbujas",
      },
      {
        id: "diagrama-dispersion",
        titulo: "DIAGRAMA DE DISPERSION",
        resumen:
          "Relaciona dos variables cuantitativas en una nube de puntos.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con ingreso de pares, tabla, grafico, personalizacion y exportacion.",
        nota: "Sirve para analizar relaciones entre dos variables cuantitativas.",
        estado: "disponible",
        palabrasClave: [
          "dispersion",
          "diagrama de dispersion",
          "nube de puntos",
          "dos variables cuantitativas",
        ],
        herramientaId: "diagrama-dispersion",
      },
      {
        id: "diagrama-lineal",
        titulo: "DIAGRAMA LINEAL",
        resumen:
          "Representa una tendencia simple con eje X ordinal y eje Y cuantitativo.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Abre el modulo completo con captura de datos, tabla, grafico, personalizacion y exportacion.",
        nota: "Permite trabajar periodos ordinales con valores cuantitativos.",
        estado: "disponible",
        palabrasClave: [
          "lineal",
          "diagrama lineal",
          "tendencia simple",
          "periodo",
          "variable ordinal",
        ],
        herramientaId: "diagrama-lineal",
      },
    ],
  },
];
