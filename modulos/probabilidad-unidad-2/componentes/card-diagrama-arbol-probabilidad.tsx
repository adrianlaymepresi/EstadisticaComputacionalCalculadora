"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import {
  CampoNumericoProbabilidad,
  CampoSeleccionProbabilidad,
  CampoTextoProbabilidad,
  MensajeProbabilidad,
  type MensajeEstadoProbabilidad,
  SeccionProbabilidad,
  SelectorPrecisionProbabilidad,
} from "@/modulos/probabilidad-unidad-2/componentes/comunes-probabilidad";
import {
  formatearDecimalProbabilidad,
  formatearPorcentajeProbabilidad,
} from "@/modulos/probabilidad-unidad-2/utilidades/formatear-probabilidad.util";
import { normalizarNombreEvento } from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";
import { parsearDecimalTexto } from "@/modulos/formulas-segundo-parcial/utils/validar-enteros.util";

type ModoProbabilidadArbol = "decimal" | "porcentaje";

interface NodoArbolProbabilidad {
  id: string;
  idPadre: string | null;
  texto: string;
  etiquetaRama: string;
  probabilidadRama: string;
  orden: number;
}

interface NodoPosicionado {
  id: string;
  idPadre: string | null;
  texto: string;
  etiquetaRama: string;
  probabilidadRama: string;
  profundidad: number;
  x: number;
  y: number;
  probabilidadRuta: number | null;
  ruta: string[];
}

interface ConexionArbol {
  id: string;
  desdeX: number;
  desdeY: number;
  haciaX: number;
  haciaY: number;
  etiqueta: string;
  probabilidadTexto: string;
}

const PRECISION_INICIAL: PrecisionResultado = {
  modo: "completo",
  decimales: 4,
};

const ANCHO_NODO = 220;
const ALTO_NODO = 112;
const ESPACIADO_X = 280;
const ESPACIADO_Y = 170;
const MARGEN_X = 140;
const MARGEN_Y = 120;

function crearNodoRaiz(): NodoArbolProbabilidad {
  return {
    id: "n-1",
    idPadre: null,
    texto: "Inicio",
    etiquetaRama: "",
    probabilidadRama: "",
    orden: 0,
  };
}

function crearEjemploArbolBayes(): NodoArbolProbabilidad[] {
  return [
    {
      id: "n-1",
      idPadre: null,
      texto: "Inicio",
      etiquetaRama: "",
      probabilidadRama: "",
      orden: 0,
    },
    {
      id: "n-2",
      idPadre: "n-1",
      texto: "Primero",
      etiquetaRama: "Curso",
      probabilidadRama: "0,45",
      orden: 0,
    },
    {
      id: "n-3",
      idPadre: "n-1",
      texto: "Tercero",
      etiquetaRama: "Curso",
      probabilidadRama: "0,35",
      orden: 1,
    },
    {
      id: "n-4",
      idPadre: "n-1",
      texto: "Quinto",
      etiquetaRama: "Curso",
      probabilidadRama: "0,20",
      orden: 2,
    },
    {
      id: "n-5",
      idPadre: "n-2",
      texto: "Aprobo",
      etiquetaRama: "Resultado",
      probabilidadRama: "0,90",
      orden: 0,
    },
    {
      id: "n-6",
      idPadre: "n-2",
      texto: "No aprobo",
      etiquetaRama: "Resultado",
      probabilidadRama: "0,10",
      orden: 1,
    },
    {
      id: "n-7",
      idPadre: "n-3",
      texto: "Aprobo",
      etiquetaRama: "Resultado",
      probabilidadRama: "0,85",
      orden: 0,
    },
    {
      id: "n-8",
      idPadre: "n-3",
      texto: "No aprobo",
      etiquetaRama: "Resultado",
      probabilidadRama: "0,15",
      orden: 1,
    },
    {
      id: "n-9",
      idPadre: "n-4",
      texto: "Aprobo",
      etiquetaRama: "Resultado",
      probabilidadRama: "0,80",
      orden: 0,
    },
    {
      id: "n-10",
      idPadre: "n-4",
      texto: "No aprobo",
      etiquetaRama: "Resultado",
      probabilidadRama: "0,20",
      orden: 1,
    },
  ];
}

function crearEstadoInicialArbol() {
  return {
    nodos: [crearNodoRaiz()],
    siguienteId: 2,
    nodoSeleccionadoId: "n-1",
  };
}

function parsearProbabilidadRama(
  texto: string,
  modo: ModoProbabilidadArbol,
  etiqueta: string,
) {
  const textoLimpio = texto.trim();
  if (!textoLimpio) {
    return null;
  }

  const valorBase = parsearDecimalTexto(textoLimpio, etiqueta, {
    minimo: 0,
  });
  const probabilidad = modo === "porcentaje" ? valorBase / 100 : valorBase;

  if (probabilidad < 0 || probabilidad > 1) {
    if (modo === "porcentaje") {
      throw new Error(`La probabilidad de ${etiqueta} debe estar entre 0 y 100.`);
    }

    throw new Error(`La probabilidad de ${etiqueta} debe estar entre 0 y 1.`);
  }

  return probabilidad;
}

function parsearProbabilidadVisual(
  texto: string,
  modo: ModoProbabilidadArbol,
) {
  try {
    return parsearProbabilidadRama(texto, modo, "la rama");
  } catch {
    return null;
  }
}

function obtenerIdsDescendientes(
  idNodo: string,
  mapaHijos: Map<string, NodoArbolProbabilidad[]>,
) {
  const ids = new Set<string>([idNodo]);
  const pendientes = [idNodo];

  while (pendientes.length) {
    const actual = pendientes.shift();
    if (!actual) {
      continue;
    }

    for (const hijo of mapaHijos.get(actual) ?? []) {
      if (!ids.has(hijo.id)) {
        ids.add(hijo.id);
        pendientes.push(hijo.id);
      }
    }
  }

  return ids;
}

function construirLayoutArbol(
  nodos: NodoArbolProbabilidad[],
  modoProbabilidades: ModoProbabilidadArbol,
) {
  const mapaNodos = new Map(nodos.map((nodo) => [nodo.id, nodo]));
  const mapaHijos = new Map<string, NodoArbolProbabilidad[]>();

  for (const nodo of nodos) {
    if (!nodo.idPadre) {
      continue;
    }

    const hijos = mapaHijos.get(nodo.idPadre) ?? [];
    hijos.push(nodo);
    mapaHijos.set(nodo.idPadre, hijos);
  }

  for (const hijos of mapaHijos.values()) {
    hijos.sort((a, b) => a.orden - b.orden);
  }

  const conexiones: ConexionArbol[] = [];
  const posicionados: NodoPosicionado[] = [];
  let indiceHoja = 0;
  let profundidadMaxima = 0;

  const recorrer = (
    idNodo: string,
    profundidad: number,
    rutaPadre: string[],
    probabilidadPadre: number | null,
  ): { x: number; y: number; probabilidadRuta: number | null; ruta: string[] } => {
    const nodo = mapaNodos.get(idNodo);

    if (!nodo) {
      return { x: MARGEN_X, y: MARGEN_Y, probabilidadRuta: null, ruta: [] };
    }

    profundidadMaxima = Math.max(profundidadMaxima, profundidad);

    const textoNodo = normalizarNombreEvento(
      nodo.texto,
      nodo.idPadre ? "Nodo" : "Inicio",
    );
    const probabilidadRama = nodo.idPadre
      ? parsearProbabilidadVisual(nodo.probabilidadRama, modoProbabilidades)
      : null;
    const probabilidadRuta =
      nodo.idPadre === null
        ? 1
        : probabilidadPadre === null || probabilidadRama === null
          ? null
          : probabilidadPadre * probabilidadRama;
    const rutaActual =
      nodo.idPadre === null ? [textoNodo] : [...rutaPadre, textoNodo];
    const hijos = mapaHijos.get(idNodo) ?? [];

    let y = MARGEN_Y;
    const x = MARGEN_X + profundidad * ESPACIADO_X;

    if (!hijos.length) {
      y = MARGEN_Y + indiceHoja * ESPACIADO_Y;
      indiceHoja += 1;
    } else {
      const posicionesHijos = hijos.map((hijo) =>
        recorrer(hijo.id, profundidad + 1, rutaActual, probabilidadRuta),
      );
      y =
        posicionesHijos.reduce((acumulado, hijo) => acumulado + hijo.y, 0) /
        posicionesHijos.length;

      posicionesHijos.forEach((posicionHijo, indice) => {
        const hijo = hijos[indice];
        conexiones.push({
          id: `${nodo.id}-${hijo.id}`,
          desdeX: x + ANCHO_NODO / 2,
          desdeY: y,
          haciaX: posicionHijo.x - ANCHO_NODO / 2,
          haciaY: posicionHijo.y,
          etiqueta: hijo.etiquetaRama.trim(),
          probabilidadTexto: hijo.probabilidadRama.trim(),
        });
      });
    }

    posicionados.push({
      id: nodo.id,
      idPadre: nodo.idPadre,
      texto: textoNodo,
      etiquetaRama: nodo.etiquetaRama.trim(),
      probabilidadRama: nodo.probabilidadRama.trim(),
      profundidad,
      x,
      y,
      probabilidadRuta,
      ruta: rutaActual,
    });

    return {
      x,
      y,
      probabilidadRuta,
      ruta: rutaActual,
    };
  };

  recorrer("n-1", 0, [], 1);

  const cantidadHojas = Math.max(
    1,
    posicionados.filter(
      (nodo) => (mapaHijos.get(nodo.id) ?? []).length === 0,
    ).length,
  );

  const ancho =
    MARGEN_X * 2 + ANCHO_NODO + profundidadMaxima * ESPACIADO_X;
  const alto =
    MARGEN_Y * 2 + ALTO_NODO + Math.max(0, cantidadHojas - 1) * ESPACIADO_Y;

  return {
    conexiones,
    nodos: posicionados,
    ancho,
    alto,
    profundidadMaxima,
    cantidadHojas,
    mapaHijos,
  };
}

export function CardDiagramaArbolProbabilidad() {
  const estadoInicial = useMemo(() => crearEstadoInicialArbol(), []);
  const [nodos, setNodos] = useState<NodoArbolProbabilidad[]>(estadoInicial.nodos);
  const [siguienteId, setSiguienteId] = useState(estadoInicial.siguienteId);
  const [nodoSeleccionadoId, setNodoSeleccionadoId] = useState(
    estadoInicial.nodoSeleccionadoId,
  );
  const [modoProbabilidades, setModoProbabilidades] =
    useState<ModoProbabilidadArbol>("decimal");
  const [precision, setPrecision] = useState<PrecisionResultado>(
    PRECISION_INICIAL,
  );
  const [textoEdicion, setTextoEdicion] = useState("Inicio");
  const [etiquetaRamaEdicion, setEtiquetaRamaEdicion] = useState("");
  const [probabilidadRamaEdicion, setProbabilidadRamaEdicion] = useState("");
  const [textoNuevaRama, setTextoNuevaRama] = useState("");
  const [etiquetaNuevaRama, setEtiquetaNuevaRama] = useState("");
  const [probabilidadNuevaRama, setProbabilidadNuevaRama] = useState("");
  const [mensaje, setMensaje] = useState<MensajeEstadoProbabilidad | null>(null);

  const layout = useMemo(
    () => construirLayoutArbol(nodos, modoProbabilidades),
    [modoProbabilidades, nodos],
  );

  const nodoSeleccionado = useMemo(
    () => nodos.find((nodo) => nodo.id === nodoSeleccionadoId) ?? nodos[0],
    [nodoSeleccionadoId, nodos],
  );

  const nodoSeleccionadoVisual = useMemo(
    () => layout.nodos.find((nodo) => nodo.id === nodoSeleccionadoId) ?? null,
    [layout.nodos, nodoSeleccionadoId],
  );

  const cantidadRamas = Math.max(0, nodos.length - 1);

  const resumenRuta = useMemo(() => {
    if (!nodoSeleccionadoVisual) {
      return {
        texto: "Selecciona un nodo para ver su ruta.",
        detalle: "",
      };
    }

    const textoRuta = nodoSeleccionadoVisual.ruta.join(" -> ");
    if (nodoSeleccionadoVisual.probabilidadRuta === null) {
      return {
        texto: textoRuta,
        detalle:
          "No se puede calcular la probabilidad acumulada porque falta una probabilidad en la ruta.",
      };
    }

    return {
      texto: textoRuta,
      detalle: `${formatearDecimalProbabilidad(
        nodoSeleccionadoVisual.probabilidadRuta,
        precision,
      )} | ${formatearPorcentajeProbabilidad(
        nodoSeleccionadoVisual.probabilidadRuta,
        precision,
      )}`,
    };
  }, [nodoSeleccionadoVisual, precision]);

  const seleccionarNodo = (idNodo: string, listaNodos = nodos) => {
    const nodo = listaNodos.find((item) => item.id === idNodo);
    if (!nodo) {
      return;
    }

    setNodoSeleccionadoId(idNodo);
    setTextoEdicion(nodo.texto);
    setEtiquetaRamaEdicion(nodo.etiquetaRama);
    setProbabilidadRamaEdicion(nodo.probabilidadRama);
  };

  const limpiarArbol = () => {
    const nuevoEstado = crearEstadoInicialArbol();
    setNodos(nuevoEstado.nodos);
    setSiguienteId(nuevoEstado.siguienteId);
    seleccionarNodo(nuevoEstado.nodoSeleccionadoId, nuevoEstado.nodos);
    setTextoNuevaRama("");
    setEtiquetaNuevaRama("");
    setProbabilidadNuevaRama("");
    setMensaje({
      tipo: "info",
      texto: "Se restablecio el diagrama de arbol a su estado inicial.",
    });
  };

  const cargarEjemplo = () => {
    const ejemplo = crearEjemploArbolBayes();
    setModoProbabilidades("decimal");
    setPrecision(PRECISION_INICIAL);
    setNodos(ejemplo);
    setSiguienteId(11);
    seleccionarNodo("n-1", ejemplo);
    setTextoNuevaRama("");
    setEtiquetaNuevaRama("");
    setProbabilidadNuevaRama("");
    setMensaje({
      tipo: "info",
      texto: "Se cargo el ejemplo de arbol de Bayes para seguir editando.",
    });
  };

  const agregarRama = () => {
    try {
      const nodoPadre = nodos.find((nodo) => nodo.id === nodoSeleccionadoId);
      if (!nodoPadre) {
        throw new Error("Debes seleccionar un nodo valido para agregar una rama.");
      }

      const textoNodo = normalizarNombreEvento(textoNuevaRama, "");
      if (!textoNodo) {
        throw new Error("La nueva rama debe tener un texto o nombre visible.");
      }

      if (probabilidadNuevaRama.trim()) {
        parsearProbabilidadRama(
          probabilidadNuevaRama,
          modoProbabilidades,
          `la rama hacia ${textoNodo}`,
        );
      }

      const hijosPadre = nodos.filter((nodo) => nodo.idPadre === nodoPadre.id);
      const nuevoNodo: NodoArbolProbabilidad = {
        id: `n-${siguienteId}`,
        idPadre: nodoPadre.id,
        texto: textoNodo,
        etiquetaRama: etiquetaNuevaRama.trim(),
        probabilidadRama: probabilidadNuevaRama.trim(),
        orden: hijosPadre.length,
      };
      const nuevosNodos = [...nodos, nuevoNodo];

      setNodos(nuevosNodos);
      setSiguienteId((valorActual) => valorActual + 1);
      setTextoNuevaRama("");
      setEtiquetaNuevaRama("");
      setProbabilidadNuevaRama("");
      seleccionarNodo(nuevoNodo.id, nuevosNodos);
      setMensaje({
        tipo: "exito",
        texto: `Se agrego la rama ${textoNodo} correctamente.`,
      });
    } catch (error) {
      console.error("No se pudo agregar la rama del arbol:", error);
      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo agregar la rama del arbol.",
      });
    }
  };

  const guardarEdicionNodo = () => {
    try {
      if (!nodoSeleccionado) {
        throw new Error("Debes seleccionar un nodo para editar.");
      }

      const textoNodo = normalizarNombreEvento(
        textoEdicion,
        nodoSeleccionado.idPadre ? "" : "Inicio",
      );

      if (!textoNodo) {
        throw new Error("El nodo seleccionado debe tener un texto visible.");
      }

      if (nodoSeleccionado.idPadre !== null) {
        if (probabilidadRamaEdicion.trim()) {
          parsearProbabilidadRama(
            probabilidadRamaEdicion,
            modoProbabilidades,
            `la rama hacia ${textoNodo}`,
          );
        }
      }

      const nuevosNodos = nodos.map((nodo) =>
        nodo.id === nodoSeleccionado.id
          ? {
              ...nodo,
              texto: textoNodo,
              etiquetaRama:
                nodo.idPadre === null ? "" : etiquetaRamaEdicion.trim(),
              probabilidadRama:
                nodo.idPadre === null ? "" : probabilidadRamaEdicion.trim(),
            }
          : nodo,
      );

      setNodos(nuevosNodos);
      seleccionarNodo(nodoSeleccionado.id, nuevosNodos);
      setMensaje({
        tipo: "exito",
        texto: `Se actualizaron los datos del nodo ${textoNodo}.`,
      });
    } catch (error) {
      console.error("No se pudo editar el nodo del arbol:", error);
      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo editar el nodo seleccionado.",
      });
    }
  };

  const eliminarNodoSeleccionado = () => {
    if (!nodoSeleccionado || nodoSeleccionado.idPadre === null) {
      setMensaje({
        tipo: "error",
        texto: "No se puede eliminar el nodo inicial del arbol.",
      });
      return;
    }

    const idsDescendientes = obtenerIdsDescendientes(
      nodoSeleccionado.id,
      layout.mapaHijos,
    );
    const nuevosNodos = nodos.filter((nodo) => !idsDescendientes.has(nodo.id));
    const padre = nodos.find((nodo) => nodo.id === nodoSeleccionado.idPadre);

    setNodos(nuevosNodos);
    if (padre) {
      seleccionarNodo(padre.id, nuevosNodos);
    }
    setMensaje({
      tipo: "exito",
      texto: `Se elimino el nodo ${nodoSeleccionado.texto} y sus ramas derivadas.`,
    });
  };

  const reordenarArbol = () => {
    const nuevosNodos = nodos.map((nodo) => ({ ...nodo }));
    const mapaPorPadre = new Map<string | null, NodoArbolProbabilidad[]>();

    for (const nodo of nuevosNodos) {
      const hijos = mapaPorPadre.get(nodo.idPadre) ?? [];
      hijos.push(nodo);
      mapaPorPadre.set(nodo.idPadre, hijos);
    }

    for (const hijos of mapaPorPadre.values()) {
      hijos
        .sort((a, b) =>
          normalizarNombreEvento(a.texto, "Nodo").localeCompare(
            normalizarNombreEvento(b.texto, "Nodo"),
            "es",
            { sensitivity: "base" },
          ),
        )
        .forEach((hijo, indice) => {
          hijo.orden = indice;
        });
    }

    setNodos([...nuevosNodos]);
    if (nodoSeleccionado) {
      seleccionarNodo(nodoSeleccionado.id, nuevosNodos);
    }
    setMensaje({
      tipo: "exito",
      texto: "Se reordeno el arbol automaticamente para mejorar la visualizacion.",
    });
  };

  const estiloLienzo = {
    width: `${layout.ancho}px`,
    height: `${layout.alto}px`,
  } satisfies CSSProperties;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[2.6rem] font-semibold tracking-tight text-acento-oscuro sm:text-[4rem]">
          Diagrama de arbol
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          Construye un arbol de probabilidad visual, agrega ramas desde cualquier
          nodo y revisa la probabilidad acumulada de la ruta seleccionada.
        </p>
      </header>

      <SeccionProbabilidad
        titulo="1. Datos a considerar"
        descripcion="Esta card prioriza la visualizacion. Puedes dibujar el arbol, etiquetar ramas, colocar probabilidades y seguir la ruta acumulada."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <div className="rounded-[1.3rem] border border-verde-claro bg-[#f9fbf7] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Nodos
            </p>
            <p className="mt-2 text-[1.8rem] font-semibold text-texto-principal">
              {nodos.length}
            </p>
          </div>
          <div className="rounded-[1.3rem] border border-verde-claro bg-[#f9fbf7] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Ramas
            </p>
            <p className="mt-2 text-[1.8rem] font-semibold text-texto-principal">
              {cantidadRamas}
            </p>
          </div>
          <div className="rounded-[1.3rem] border border-verde-claro bg-[#f9fbf7] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Niveles
            </p>
            <p className="mt-2 text-[1.8rem] font-semibold text-texto-principal">
              {layout.profundidadMaxima + 1}
            </p>
          </div>
          <div className="rounded-[1.3rem] border border-verde-claro bg-[#f9fbf7] p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Modo de probabilidades
            </p>
            <p className="mt-2 text-base font-semibold text-texto-principal">
              {modoProbabilidades === "decimal" ? "Decimales" : "Porcentajes"}
            </p>
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-verde-claro bg-panel-resalte/45 p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
            Ruta seleccionada
          </p>
          <p className="mt-3 text-base font-semibold text-texto-principal">
            {resumenRuta.texto}
          </p>
          <p className="mt-2 text-sm leading-7 text-texto-secundario">
            {resumenRuta.detalle}
          </p>
        </div>
      </SeccionProbabilidad>

      <SeccionProbabilidad
        titulo="2. Controles"
        descripcion="Selecciona un nodo del lienzo para editarlo, agrega nuevas ramas y reorganiza el arbol cuando lo necesites."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CampoSeleccionProbabilidad
            etiqueta="Modo de ingreso de probabilidades"
            valor={modoProbabilidades}
            onChange={(valor) =>
              setModoProbabilidades(valor as ModoProbabilidadArbol)
            }
            opciones={[
              { valor: "decimal", etiqueta: "Probabilidades decimales" },
              { valor: "porcentaje", etiqueta: "Porcentajes" },
            ]}
          />
          <SelectorPrecisionProbabilidad
            precision={precision}
            onChange={setPrecision}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1fr]">
          <article className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Nodo seleccionado
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <CampoTextoProbabilidad
                etiqueta="Texto del nodo"
                valor={textoEdicion}
                onChange={setTextoEdicion}
                placeholder="Ejemplo: Tercero"
              />
              {nodoSeleccionado?.idPadre !== null ? (
                <>
                  <CampoTextoProbabilidad
                    etiqueta="Etiqueta de la rama"
                    valor={etiquetaRamaEdicion}
                    onChange={setEtiquetaRamaEdicion}
                    placeholder="Ejemplo: Curso"
                  />
                  <CampoNumericoProbabilidad
                    etiqueta="Probabilidad de la rama"
                    valor={probabilidadRamaEdicion}
                    onChange={setProbabilidadRamaEdicion}
                    placeholder={
                      modoProbabilidades === "decimal"
                        ? "Ejemplo: 0,35"
                        : "Ejemplo: 35"
                    }
                    descripcion="Puedes dejarla vacia si solo quieres dibujar la estructura."
                    permitirDecimal
                  />
                </>
              ) : (
                <div className="rounded-[1.1rem] border border-verde-claro bg-white px-4 py-3 text-sm leading-7 text-texto-secundario">
                  El nodo inicial no necesita etiqueta ni probabilidad de rama.
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={guardarEdicionNodo}
                  className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.05rem] font-semibold text-white transition hover:bg-acento-oscuro"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={eliminarNodoSeleccionado}
                  className="min-h-14 rounded-[1.15rem] border border-alerta/25 bg-white px-6 text-[1.05rem] font-semibold text-alerta transition hover:border-alerta hover:bg-alerta/8"
                >
                  Eliminar nodo
                </button>
              </div>
            </div>
          </article>

          <article className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Agregar rama desde el nodo seleccionado
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <CampoTextoProbabilidad
                etiqueta="Texto del nuevo nodo"
                valor={textoNuevaRama}
                onChange={setTextoNuevaRama}
                placeholder="Ejemplo: Aprobo"
              />
              <CampoTextoProbabilidad
                etiqueta="Etiqueta de la rama"
                valor={etiquetaNuevaRama}
                onChange={setEtiquetaNuevaRama}
                placeholder="Ejemplo: Resultado"
              />
              <CampoNumericoProbabilidad
                etiqueta="Probabilidad de la nueva rama"
                valor={probabilidadNuevaRama}
                onChange={setProbabilidadNuevaRama}
                placeholder={
                  modoProbabilidades === "decimal"
                    ? "Ejemplo: 0,85"
                    : "Ejemplo: 85"
                }
                descripcion="Puedes dejarla vacia si solo deseas construir el arbol visual."
                permitirDecimal
              />
              <button
                type="button"
                onClick={agregarRama}
                className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.05rem] font-semibold text-white transition hover:bg-acento-oscuro"
              >
                Agregar rama
              </button>
            </div>
          </article>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={cargarEjemplo}
            className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.05rem] font-semibold text-white transition hover:bg-acento-oscuro"
          >
            Cargar ejemplo Bayes
          </button>
          <button
            type="button"
            onClick={reordenarArbol}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.05rem] font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
          >
            Reordenar
          </button>
          <button
            type="button"
            onClick={limpiarArbol}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.05rem] font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
          >
            Limpiar arbol
          </button>
        </div>

        <MensajeProbabilidad mensaje={mensaje} />
      </SeccionProbabilidad>

      <SeccionProbabilidad
        titulo="3. Lienzo del arbol"
        descripcion="Haz clic en cualquier nodo para editarlo. Si el arbol crece, puedes desplazarte horizontalmente para ver todas las ramas."
      >
        <div className="overflow-x-auto pb-2">
          <div
            className="relative rounded-[1.8rem] border border-verde-claro bg-[linear-gradient(to_right,rgba(39,111,79,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(39,111,79,0.07)_1px,transparent_1px)] bg-[size:32px_32px]"
            style={estiloLienzo}
          >
            <svg
              width={layout.ancho}
              height={layout.alto}
              className="absolute inset-0"
            >
              {layout.conexiones.map((conexion) => {
                const puntoMedioX = (conexion.desdeX + conexion.haciaX) / 2;
                const puntoMedioY = (conexion.desdeY + conexion.haciaY) / 2;

                return (
                  <g key={conexion.id}>
                    <path
                      d={`M ${conexion.desdeX} ${conexion.desdeY} C ${conexion.desdeX + 70} ${conexion.desdeY}, ${conexion.haciaX - 70} ${conexion.haciaY}, ${conexion.haciaX} ${conexion.haciaY}`}
                      fill="none"
                      stroke="rgba(39, 52, 47, 0.82)"
                      strokeWidth="2.2"
                    />
                    {(conexion.etiqueta || conexion.probabilidadTexto) ? (
                      <text
                        x={puntoMedioX}
                        y={puntoMedioY - 12}
                        textAnchor="middle"
                        className="fill-[var(--color-acento-oscuro)] text-[11px] font-semibold"
                      >
                        {conexion.etiqueta ? (
                          <tspan x={puntoMedioX} dy="0">
                            {conexion.etiqueta}
                          </tspan>
                        ) : null}
                        {conexion.probabilidadTexto ? (
                          <tspan x={puntoMedioX} dy={conexion.etiqueta ? "14" : "0"}>
                            {conexion.probabilidadTexto}
                            {modoProbabilidades === "porcentaje" ? "%" : ""}
                          </tspan>
                        ) : null}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </svg>

            {layout.nodos.map((nodo) => {
              const estaSeleccionado = nodo.id === nodoSeleccionadoId;

              return (
                <button
                  key={nodo.id}
                  type="button"
                  onClick={() => seleccionarNodo(nodo.id)}
                  className={`absolute flex flex-col items-start justify-center rounded-[1.35rem] border bg-white px-4 py-4 text-left shadow-sm transition ${
                    estaSeleccionado
                      ? "border-acento-principal ring-2 ring-acento-principal/15"
                      : "border-verde-claro hover:border-acento-principal/50"
                  }`}
                  style={{
                    left: `${nodo.x - ANCHO_NODO / 2}px`,
                    top: `${nodo.y - ALTO_NODO / 2}px`,
                    width: `${ANCHO_NODO}px`,
                    minHeight: `${ALTO_NODO}px`,
                  }}
                >
                  <span className="rounded-full bg-panel-resalte px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-acento-secundario">
                    {nodo.idPadre === null ? "Inicio" : `Nivel ${nodo.profundidad + 1}`}
                  </span>
                  <span className="mt-3 text-[1.02rem] font-semibold leading-6 text-texto-principal">
                    {nodo.texto}
                  </span>
                  {nodo.probabilidadRuta !== null ? (
                    <span className="mt-2 text-xs leading-5 text-texto-secundario">
                      Ruta: {formatearDecimalProbabilidad(nodo.probabilidadRuta, precision)}
                    </span>
                  ) : (
                    <span className="mt-2 text-xs leading-5 text-texto-secundario">
                      Ruta sin acumulado
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </SeccionProbabilidad>
    </div>
  );
}
