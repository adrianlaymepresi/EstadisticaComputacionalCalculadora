export interface TarjetaUnidad {
  id: string;
  titulo: string;
  resumen: string;
  etiqueta: string;
  areaTitulo: string;
  areaDescripcion: string;
  nota: string;
}

export interface UnidadTematica {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  palabrasClave: string[];
  tarjeta: TarjetaUnidad;
}

export const unidadesTematicas: ReadonlyArray<UnidadTematica> = [
  {
    id: "unidad-1",
    titulo: "Unidad 1",
    subtitulo: "Base principal",
    descripcion:
      "Plantilla inicial lista para recibir calculos, tablas y resultados de esta unidad.",
    palabrasClave: ["unidad 1", "cards", "calculos", "tablas", "resultados"],
    tarjeta: {
      id: "unidad-1-card",
      titulo: "Explorar funciones base",
      resumen: "Una card inicial para comenzar a construir este apartado.",
      etiqueta: "Card inicial",
      areaTitulo: "Zona de trabajo de Unidad 1",
      areaDescripcion:
        "Aqui apareceran formularios, operaciones y salidas largas para esta unidad.",
      nota: "Lista para conectar la primera funcionalidad real.",
    },
  },
  {
    id: "unidad-1-1",
    titulo: "Unidad 1,1",
    subtitulo: "Subapartado preparado",
    descripcion:
      "Vista compacta y lista para incorporar una herramienta especifica sin saturar la interfaz.",
    palabrasClave: ["unidad 1,1", "subapartado", "herramienta", "flujo"],
    tarjeta: {
      id: "unidad-1-1-card",
      titulo: "Abrir herramienta del tema",
      resumen: "Reservada para la siguiente operacion que definamos juntos.",
      etiqueta: "Plantilla",
      areaTitulo: "Zona de trabajo de Unidad 1,1",
      areaDescripcion:
        "Esta area quedara libre para formulas, entradas y resultados del subapartado.",
      nota: "Perfecta para montar una card con proceso guiado.",
    },
  },
  {
    id: "unidad-1-2",
    titulo: "Unidad 1,2",
    subtitulo: "Subapartado adicional",
    descripcion:
      "Seccion preparada para crecer con una sola experiencia clara y una navegacion sencilla.",
    palabrasClave: ["unidad 1,2", "busqueda", "estructura", "responsive"],
    tarjeta: {
      id: "unidad-1-2-card",
      titulo: "Ver modulo en preparacion",
      resumen: "Aqui podremos conectar una vista funcional enfocada y ordenada.",
      etiqueta: "Preparado",
      areaTitulo: "Zona de trabajo de Unidad 1,2",
      areaDescripcion:
        "La vista futura podra ocupar mas ancho para procesos largos y resultados amplios.",
      nota: "Lista para una funcionalidad con varias entradas y salida grande.",
    },
  },
  {
    id: "unidad-2",
    titulo: "Unidad 2",
    subtitulo: "Siguiente bloque del curso",
    descripcion:
      "Base visual limpia para seguir agregando apartados sin romper la estructura general.",
    palabrasClave: ["unidad 2", "vercel", "modular", "funciones"],
    tarjeta: {
      id: "unidad-2-card",
      titulo: "Preparar vista de trabajo",
      resumen: "Card unica para arrancar la siguiente etapa del dashboard.",
      etiqueta: "Lista",
      areaTitulo: "Zona de trabajo de Unidad 2",
      areaDescripcion:
        "Este espacio esta pensado para herramientas mas extensas y contenido de mayor longitud.",
      nota: "Queda lista para recibir nuevos calculos paso a paso.",
    },
  },
];
