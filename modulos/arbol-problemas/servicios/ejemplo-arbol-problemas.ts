import {
  COLORES_ARBOL_PROBLEMAS_POR_DEFECTO,
  ID_PROBLEMA_CENTRAL,
  ZOOM_INICIAL_ARBOL_PROBLEMAS,
} from "@/modulos/arbol-problemas/constantes";
import type { EstadoArbolProblema, NodoArbolProblema } from "@/modulos/arbol-problemas/tipos";

function crearNodo(
  id: string,
  tipo: NodoArbolProblema["tipo"],
  texto: string,
  extras?: Partial<NodoArbolProblema>,
): NodoArbolProblema {
  return {
    id,
    tipo,
    texto,
    ...extras,
  };
}

export function crearEstadoVacioArbolProblemas(): EstadoArbolProblema {
  return {
    problema: crearNodo(ID_PROBLEMA_CENTRAL, "problema", ""),
    nodos: [],
    controlesVisibles: true,
    mostrarRelacionesLogicas: false,
    zoom: ZOOM_INICIAL_ARBOL_PROBLEMAS,
    desplazamiento: { x: 0, y: 0 },
    colores: COLORES_ARBOL_PROBLEMAS_POR_DEFECTO,
    fondoExportacion: "blanco",
    colorFondoPersonalizado: "#ffffff",
  };
}

export function crearEstadoEjemploArbolProblemas(): EstadoArbolProblema {
  return {
    ...crearEstadoVacioArbolProblemas(),
    problema: crearNodo(
      ID_PROBLEMA_CENTRAL,
      "problema",
      "Deficiente gestion de la informacion operativa y comercial en la Agencia Inmobiliaria LEGACY PRIME de la ciudad de Sucre",
    ),
    nodos: [
      crearNodo(
        "causa-1",
        "causa",
        "Informacion de propiedades, propietarios, clientes e imagenes registrada de forma dispersa",
      ),
      crearNodo(
        "causa-2",
        "causa",
        "Registro en cuaderno desordenado de clientes interesados y visitas a propiedades",
      ),
      crearNodo(
        "causa-3",
        "causa",
        "Falta de organizacion en la informacion de contratos, pagos y estado de las propiedades",
      ),
      crearNodo(
        "causa-4",
        "causa",
        "Falta de un catalogo actualizado de propiedades disponibles para consulta del publico",
      ),
      crearNodo(
        "causa-5",
        "causa",
        "Inconsistencias en la coordinacion de citas con clientes mediante mensajes de WhatsApp",
      ),
      crearNodo(
        "causa-6",
        "causa",
        "Falta de acceso practico a la ubicacion de propiedades y registro de visitas desde campo",
      ),
      crearNodo(
        "efecto-1",
        "efecto",
        "Dificultad para conocer y ofrecer correctamente la informacion de cada propiedad",
        { causaAsociadaId: "causa-1" },
      ),
      crearNodo(
        "efecto-2",
        "efecto",
        "Desorganizacion en el seguimiento de clientes interesados en una propiedades",
        { causaAsociadaId: "causa-2" },
      ),
      crearNodo(
        "efecto-3",
        "efecto",
        "Falta de control sobre operaciones realizadas, pagos registrados y estado comercial de las propiedades",
        { causaAsociadaId: "causa-3" },
      ),
      crearNodo(
        "efecto-4",
        "efecto",
        "Dificultad para que los clientes potenciales encuentren propiedades disponibles segun sus necesidades",
        { causaAsociadaId: "causa-4" },
      ),
      crearNodo(
        "efecto-5",
        "efecto",
        "Dificultad para cumplir con las citas programadas con clientes",
        { causaAsociadaId: "causa-5" },
      ),
      crearNodo(
        "efecto-6",
        "efecto",
        "Dificultad del asesor para ubicarse, llegar a la propiedad y registrar la atencion realizada",
        { causaAsociadaId: "causa-6" },
      ),
    ],
  };
}
