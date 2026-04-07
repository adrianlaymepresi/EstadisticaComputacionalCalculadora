export type EstadoTarjeta = "disponible" | "proximamente";
export type IdentificadorHerramienta =
  | "diagrama-burbujas"
  | "diagrama-columnas-simples";

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

export const unidadesTematicas: ReadonlyArray<UnidadTematica> = [
  {
    id: "unidad-1",
    titulo: "Unidad 1",
    subtitulo: "Base principal",
    descripcion:
      "Bloque inicial del dashboard preparado para recibir calculos, tablas y futuras operaciones sin perder orden.",
    palabrasClave: ["unidad 1", "base", "calculos", "tablas", "resultados"],
    tarjetas: [
      {
        id: "unidad-1-base",
        titulo: "BASES Y CONCEPTOS",
        resumen:
          "Espacio reservado para los primeros procesos y herramientas de esta unidad.",
        etiqueta: "Preparado",
        descripcionTrabajo:
          "Aqui podremos montar formularios, tablas de apoyo y resultados extensos para los primeros temas.",
        nota: "La estructura ya queda lista para ir creciendo paso a paso.",
        estado: "proximamente",
        palabrasClave: ["bases", "conceptos", "unidad 1", "inicio"],
      },
    ],
  },
  {
    id: "unidad-1-1",
    titulo: "Unidad 1,1",
    subtitulo: "Diagramadores estadisticos",
    descripcion:
      "Catalogo inicial de diagramas estadisticos. La primera integracion funcional queda lista en el modulo de burbujas.",
    palabrasClave: [
      "unidad 1,1",
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
          "Herramienta funcional para cargar categorias y valores, generar la tabla estadistica y construir el diagrama de columnas simple.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Esta card abre el modulo completo del diagrama de columnas simples con ingreso de datos, tabla resumen, grafico, personalizacion y exportacion.",
        nota: "Lista para trabajar con nombres y valores, igual que el flujo de burbujas adaptado a este diagrama.",
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
        resumen: "Card reservada para la futura implementacion de columnas compuestas.",
        etiqueta: "Proximamente",
        descripcionTrabajo:
          "Aqui integraremos despues la experiencia completa para columnas compuestas.",
        nota: "La base modular ya queda preparada para ese siguiente paso.",
        estado: "proximamente",
        palabrasClave: ["columnas compuestas", "diagramas", "unidad 1,1"],
      },
      {
        id: "diagrama-barras",
        titulo: "DIAGRAMA DE BARRAS",
        resumen: "Card reservada para la futura implementacion del diagrama de barras.",
        etiqueta: "Proximamente",
        descripcionTrabajo:
          "El apartado esta listo para incorporar la logica y visualizacion del diagrama de barras.",
        nota: "Mantendremos esta misma estructura para sumar las siguientes herramientas.",
        estado: "proximamente",
        palabrasClave: ["barras", "diagramas", "unidad 1,1"],
      },
      {
        id: "diagrama-bastones",
        titulo: "DIAGRAMA DE BASTONES",
        resumen: "Card reservada para la futura implementacion del diagrama de bastones.",
        etiqueta: "Proximamente",
        descripcionTrabajo:
          "Este lugar queda separado para montar luego la herramienta de bastones sin afectar otras cards.",
        nota: "La idea es seguir integrando cada herramienta de forma aislada y controlada.",
        estado: "proximamente",
        palabrasClave: ["bastones", "diagramas", "unidad 1,1"],
      },
      {
        id: "diagrama-pictogramas",
        titulo: "DIAGRAMA DE PICTOGRAMAS",
        resumen: "Card reservada para la futura implementacion del diagrama de pictogramas.",
        etiqueta: "Proximamente",
        descripcionTrabajo:
          "Aqui quedara el flujo de trabajo del diagrama de pictogramas cuando avancemos a esa formula.",
        nota: "La navegacion ya soporta multiples cards en la misma unidad.",
        estado: "proximamente",
        palabrasClave: ["pictogramas", "diagramas", "unidad 1,1"],
      },
      {
        id: "diagrama-burbujas",
        titulo: "DIAGRAMA DE BURBUJAS",
        resumen:
          "Herramienta funcional integrada desde DiagramadoresEstadisticos con configuracion, tabla, visualizacion y exportacion.",
        etiqueta: "Disponible ahora",
        descripcionTrabajo:
          "Esta card abre el modulo completo del diagrama de burbujas y replica el flujo del proyecto fuente adaptado al dashboard.",
        nota: "Lista para trabajar tal como en el proyecto original, ahora dentro de este sistema.",
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
        resumen: "Card reservada para la futura implementacion del diagrama de dispersion.",
        etiqueta: "Proximamente",
        descripcionTrabajo:
          "El contenedor ya esta preparado para recibir la siguiente herramienta cuando la definamos.",
        nota: "Seguiremos la misma estrategia modular para mantener el proyecto estable.",
        estado: "proximamente",
        palabrasClave: ["dispersion", "diagramas", "unidad 1,1"],
      },
      {
        id: "diagrama-lineal",
        titulo: "DIAGRAMA LINEAL",
        resumen: "Card reservada para la futura implementacion del diagrama lineal.",
        etiqueta: "Proximamente",
        descripcionTrabajo:
          "Aqui podremos montar mas adelante la herramienta del diagrama lineal con la misma base reutilizable.",
        nota: "La estructura quedo pensada para sumar muchas funcionalidades sin desorden.",
        estado: "proximamente",
        palabrasClave: ["lineal", "diagramas", "unidad 1,1"],
      },
    ],
  },
  {
    id: "unidad-1-2",
    titulo: "Unidad 1,2",
    subtitulo: "Subapartado adicional",
    descripcion:
      "Seccion preparada para seguir creciendo con modulos independientes y un flujo de trabajo claro.",
    palabrasClave: ["unidad 1,2", "estructura", "responsive", "modulos"],
    tarjetas: [
      {
        id: "unidad-1-2-base",
        titulo: "MODULO EN PREPARACION",
        resumen:
          "Base reservada para la siguiente herramienta que conectemos en este subapartado.",
        etiqueta: "Preparado",
        descripcionTrabajo:
          "Esta zona queda disponible para formularios largos, calculos y salidas amplias.",
        nota: "Lista para una funcionalidad con varias entradas y resultados.",
        estado: "proximamente",
        palabrasClave: ["unidad 1,2", "preparacion", "modulo"],
      },
    ],
  },
  {
    id: "unidad-2",
    titulo: "Unidad 2",
    subtitulo: "Siguiente bloque del curso",
    descripcion:
      "Base visual limpia para continuar agregando apartados del curso sin romper la estructura general.",
    palabrasClave: ["unidad 2", "vercel", "modular", "funciones"],
    tarjetas: [
      {
        id: "unidad-2-base",
        titulo: "PREPARAR VISTA DE TRABAJO",
        resumen:
          "Card inicial para arrancar la siguiente etapa del dashboard cuando nos indiques.",
        etiqueta: "Lista",
        descripcionTrabajo:
          "Este espacio esta pensado para herramientas mas extensas y contenido de mayor longitud.",
        nota: "Queda listo para recibir nuevos calculos paso a paso.",
        estado: "proximamente",
        palabrasClave: ["unidad 2", "vista de trabajo", "preparacion"],
      },
    ],
  },
];
