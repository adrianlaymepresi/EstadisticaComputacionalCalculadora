"use client";

import { useCallback, useMemo, useState } from "react";
import { COLORES_ARBOL_PROBLEMAS_POR_DEFECTO } from "@/modulos/arbol-problemas/constantes";
import {
  crearEstadoEjemploArbolProblemas,
  crearEstadoVacioArbolProblemas,
} from "@/modulos/arbol-problemas/servicios/ejemplo-arbol-problemas";
import {
  construirVistaArbolProblemas,
  crearIdNodoArbolProblemas,
  esColorHexValido,
  limpiarTextoNodoArbolProblemas,
  obtenerDescendientesNodo,
  obtenerNodoPorId,
} from "@/modulos/arbol-problemas/servicios/layout-arbol-problemas";
import type {
  ConfiguracionColoresArbolProblema,
  EstadoArbolProblema,
  NodoArbolProblema,
  PosicionArbolProblema,
} from "@/modulos/arbol-problemas/tipos";

interface MensajeArbolProblema {
  tipo: "error" | "exito" | "info";
  texto: string;
}

function posicionesSonIguales(
  izquierda: PosicionArbolProblema,
  derecha: PosicionArbolProblema,
) {
  return izquierda.x === derecha.x && izquierda.y === derecha.y;
}

function actualizarNodoPorId(
  nodos: NodoArbolProblema[],
  nodoId: string,
  actualizador: (nodo: NodoArbolProblema) => NodoArbolProblema,
) {
  return nodos.map((nodo) => (nodo.id === nodoId ? actualizador(nodo) : nodo));
}

export function useArbolProblemas() {
  const [estado, setEstado] = useState<EstadoArbolProblema>(() =>
    crearEstadoVacioArbolProblemas(),
  );
  const [mensaje, setMensaje] = useState<MensajeArbolProblema | null>(null);
  const [textoProblema, setTextoProblema] = useState("");
  const [textoCausaNueva, setTextoCausaNueva] = useState("");
  const [textoEfectoNuevo, setTextoEfectoNuevo] = useState("");
  const [causaAsociadaNueva, setCausaAsociadaNueva] = useState("");
  const [textoSubefectoNuevo, setTextoSubefectoNuevo] = useState("");
  const [efectoPadreNuevo, setEfectoPadreNuevo] = useState("");
  const [nodoSeleccionadoId, setNodoSeleccionadoId] = useState<string | null>(
    null,
  );
  const [tokenAutoajuste, setTokenAutoajuste] = useState(1);

  const vista = useMemo(() => construirVistaArbolProblemas(estado), [estado]);
  const causas = useMemo(
    () => estado.nodos.filter((nodo) => nodo.tipo === "causa"),
    [estado.nodos],
  );
  const efectos = useMemo(
    () =>
      estado.nodos.filter(
        (nodo) => nodo.tipo === "efecto" || nodo.tipo === "subefecto",
      ),
    [estado.nodos],
  );
  const nodoSeleccionado = useMemo(() => {
    if (!nodoSeleccionadoId) {
      return null;
    }

    const render = vista.nodos.find((nodo) => nodo.id === nodoSeleccionadoId);
    const nodo = obtenerNodoPorId(estado, nodoSeleccionadoId);

    if (!render || !nodo) {
      return null;
    }

    return {
      nodo,
      etiquetaVisible: render.etiquetaVisible,
      etiquetaTipo: render.etiquetaTipo,
    };
  }, [estado, nodoSeleccionadoId, vista.nodos]);
  const conteos = useMemo(
    () => ({
      causas: causas.length,
      efectos: estado.nodos.filter((nodo) => nodo.tipo === "efecto").length,
      derivados: estado.nodos.filter((nodo) => nodo.tipo === "subefecto").length,
    }),
    [causas.length, estado.nodos],
  );
  const hayProblemaCentral = Boolean(
    limpiarTextoNodoArbolProblemas(estado.problema.texto),
  );

  const mostrarMensaje = (
    tipo: MensajeArbolProblema["tipo"],
    texto: string,
  ) => {
    setMensaje({ tipo, texto });
  };

  const obtenerProblemaListo = () => {
    const problemaActivo = limpiarTextoNodoArbolProblemas(estado.problema.texto);
    const problemaBorrador = limpiarTextoNodoArbolProblemas(textoProblema);
    return problemaActivo || problemaBorrador;
  };

  const actualizarProblema = () => {
    const textoLimpio = limpiarTextoNodoArbolProblemas(textoProblema);

    if (!textoLimpio) {
      mostrarMensaje("error", "El problema central no puede estar vacio.");
      return;
    }

    setEstado((estadoActual) => ({
      ...estadoActual,
      problema: {
        ...estadoActual.problema,
        texto: textoLimpio,
      },
    }));
    setTokenAutoajuste((valor) => valor + 1);
    mostrarMensaje("exito", "Problema central actualizado correctamente.");
  };

  const agregarCausa = () => {
    const problemaListo = obtenerProblemaListo();

    if (!problemaListo) {
      mostrarMensaje(
        "error",
        "Primero define el problema central antes de agregar causas.",
      );
      return;
    }

    const textoLimpio = limpiarTextoNodoArbolProblemas(textoCausaNueva);

    if (!textoLimpio) {
      mostrarMensaje("error", "La causa no puede estar vacia.");
      return;
    }

    setEstado((estadoActual) => {
      const textoProblemaListo =
        limpiarTextoNodoArbolProblemas(estadoActual.problema.texto) || problemaListo;

      return {
        ...estadoActual,
        problema: {
          ...estadoActual.problema,
          texto: textoProblemaListo,
        },
        nodos: [
          ...estadoActual.nodos,
          {
            id: crearIdNodoArbolProblemas("causa"),
            tipo: "causa",
            texto: textoLimpio,
          },
        ],
      };
    });
    setTextoProblema(problemaListo);
    setTextoCausaNueva("");
    setTokenAutoajuste((valor) => valor + 1);
    mostrarMensaje("exito", "Causa agregada correctamente.");
  };

  const agregarEfecto = () => {
    const problemaListo = obtenerProblemaListo();

    if (!problemaListo) {
      mostrarMensaje(
        "error",
        "Primero define el problema central antes de agregar efectos.",
      );
      return;
    }

    const textoLimpio = limpiarTextoNodoArbolProblemas(textoEfectoNuevo);

    if (!textoLimpio) {
      mostrarMensaje("error", "El efecto no puede estar vacio.");
      return;
    }

    if (!causaAsociadaNueva) {
      mostrarMensaje(
        "error",
        "Selecciona la causa asociada antes de agregar el efecto.",
      );
      return;
    }

    if (!causas.some((causa) => causa.id === causaAsociadaNueva)) {
      mostrarMensaje(
        "error",
        "La causa asociada seleccionada ya no existe. Vuelve a elegirla.",
      );
      return;
    }

    setEstado((estadoActual) => {
      const textoProblemaListo =
        limpiarTextoNodoArbolProblemas(estadoActual.problema.texto) || problemaListo;

      return {
        ...estadoActual,
        problema: {
          ...estadoActual.problema,
          texto: textoProblemaListo,
        },
        nodos: [
          ...estadoActual.nodos,
          {
            id: crearIdNodoArbolProblemas("efecto"),
            tipo: "efecto",
            texto: textoLimpio,
            causaAsociadaId: causaAsociadaNueva,
          },
        ],
      };
    });
    setTextoProblema(problemaListo);
    setTextoEfectoNuevo("");
    setTokenAutoajuste((valor) => valor + 1);
    mostrarMensaje("exito", "Efecto agregado correctamente.");
  };

  const agregarSubefecto = () => {
    const problemaListo = obtenerProblemaListo();

    if (!problemaListo) {
      mostrarMensaje(
        "error",
        "Primero define el problema central antes de agregar efectos derivados.",
      );
      return;
    }

    const textoLimpio = limpiarTextoNodoArbolProblemas(textoSubefectoNuevo);

    if (!textoLimpio) {
      mostrarMensaje("error", "El efecto derivado no puede estar vacio.");
      return;
    }

    if (!efectoPadreNuevo) {
      mostrarMensaje(
        "error",
        "Selecciona un efecto padre antes de agregar el derivado.",
      );
      return;
    }

    const nodoPadre = estado.nodos.find((nodo) => nodo.id === efectoPadreNuevo);

    if (!nodoPadre) {
      mostrarMensaje("error", "El efecto padre seleccionado ya no existe.");
      return;
    }

    setEstado((estadoActual) => {
      const textoProblemaListo =
        limpiarTextoNodoArbolProblemas(estadoActual.problema.texto) || problemaListo;

      return {
        ...estadoActual,
        problema: {
          ...estadoActual.problema,
          texto: textoProblemaListo,
        },
        nodos: [
          ...estadoActual.nodos,
          {
            id: crearIdNodoArbolProblemas("subefecto"),
            tipo: "subefecto",
            texto: textoLimpio,
            nodoPadreId: efectoPadreNuevo,
            causaAsociadaId: nodoPadre.causaAsociadaId,
          },
        ],
      };
    });
    setTextoProblema(problemaListo);
    setTextoSubefectoNuevo("");
    setTokenAutoajuste((valor) => valor + 1);
    mostrarMensaje("exito", "Efecto derivado agregado correctamente.");
  };

  const editarRapidoNodo = (nodoId: string) => {
    const nodo = obtenerNodoPorId(estado, nodoId);

    if (!nodo) {
      return;
    }

    const siguienteTexto = window.prompt("Editar texto del nodo", nodo.texto);

    if (siguienteTexto === null) {
      return;
    }

    const textoLimpio = limpiarTextoNodoArbolProblemas(siguienteTexto);

    if (!textoLimpio) {
      mostrarMensaje("error", "El texto del nodo no puede estar vacio.");
      return;
    }

    if (nodoId === estado.problema.id) {
      setEstado((estadoActual) => ({
        ...estadoActual,
        problema: { ...estadoActual.problema, texto: textoLimpio },
      }));
      setTextoProblema(textoLimpio);
    } else {
      setEstado((estadoActual) => ({
        ...estadoActual,
        nodos: actualizarNodoPorId(estadoActual.nodos, nodoId, (actual) => ({
          ...actual,
          texto: textoLimpio,
        })),
      }));
    }

    mostrarMensaje("exito", "Nodo actualizado correctamente.");
  };

  const actualizarNodoSeleccionado = (
    cambios: Partial<NodoArbolProblema>,
    mensajeExito?: string,
  ) => {
    if (!nodoSeleccionado) {
      return;
    }

    const siguienteTexto =
      cambios.texto === undefined
        ? nodoSeleccionado.nodo.texto
        : limpiarTextoNodoArbolProblemas(cambios.texto);

    if (!siguienteTexto) {
      mostrarMensaje("error", "El texto del nodo no puede estar vacio.");
      return;
    }

    if (nodoSeleccionado.nodo.id === estado.problema.id) {
      setEstado((estadoActual) => ({
        ...estadoActual,
        problema: {
          ...estadoActual.problema,
          ...cambios,
          texto: siguienteTexto,
        },
      }));
      setTextoProblema(siguienteTexto);
    } else {
      setEstado((estadoActual) => ({
        ...estadoActual,
        nodos: actualizarNodoPorId(
          estadoActual.nodos,
          nodoSeleccionado.nodo.id,
          (nodoActual) => ({
            ...nodoActual,
            ...cambios,
            texto: siguienteTexto,
          }),
        ),
      }));
    }

    if (mensajeExito) {
      mostrarMensaje("exito", mensajeExito);
    }
  };

  const cambiarColor = (
    bloque: keyof ConfiguracionColoresArbolProblema,
    campo: string,
    valor: string,
  ) => {
    if (bloque === "flechas") {
      if (!esColorHexValido(valor)) {
        mostrarMensaje("error", "El color de las flechas no es valido.");
        return;
      }

      setEstado((estadoActual) => ({
        ...estadoActual,
        colores: {
          ...estadoActual.colores,
          flechas: valor,
        },
      }));
      return;
    }

    if (!esColorHexValido(valor)) {
      mostrarMensaje("error", "El color seleccionado no es valido.");
      return;
    }

    setEstado((estadoActual) => ({
      ...estadoActual,
      colores: {
        ...estadoActual.colores,
        [bloque]: {
          ...estadoActual.colores[bloque],
          [campo]: valor,
        },
      },
    }));
  };

  const restaurarColores = () => {
    setEstado((estadoActual) => ({
      ...estadoActual,
      colores: COLORES_ARBOL_PROBLEMAS_POR_DEFECTO,
    }));
    mostrarMensaje("info", "Se restauraron los colores por defecto.");
  };

  const cargarEjemplo = () => {
    const ejemplo = crearEstadoEjemploArbolProblemas();
    setEstado((estadoActual) => ({
      ...ejemplo,
      controlesVisibles: estadoActual.controlesVisibles,
      mostrarRelacionesLogicas: estadoActual.mostrarRelacionesLogicas,
      colores: estadoActual.colores,
      fondoExportacion: estadoActual.fondoExportacion,
      colorFondoPersonalizado: estadoActual.colorFondoPersonalizado,
      zoom: estadoActual.zoom,
      desplazamiento: estadoActual.desplazamiento,
    }));
    setTextoProblema(ejemplo.problema.texto);
    setNodoSeleccionadoId(null);
    setTokenAutoajuste((valor) => valor + 1);
    mostrarMensaje("info", "Se cargo el ejemplo del arbol de problemas.");
  };

  const limpiarArbol = () => {
    const confirmado = window.confirm(
      "Se limpiara el arbol completo. Deseas continuar?",
    );

    if (!confirmado) {
      return;
    }

    setEstado((estadoActual) => ({
      ...crearEstadoVacioArbolProblemas(),
      controlesVisibles: estadoActual.controlesVisibles,
      mostrarRelacionesLogicas: estadoActual.mostrarRelacionesLogicas,
      colores: estadoActual.colores,
      fondoExportacion: estadoActual.fondoExportacion,
      colorFondoPersonalizado: estadoActual.colorFondoPersonalizado,
      zoom: estadoActual.zoom,
      desplazamiento: estadoActual.desplazamiento,
    }));
    setTextoProblema("");
    setTextoCausaNueva("");
    setTextoEfectoNuevo("");
    setCausaAsociadaNueva("");
    setTextoSubefectoNuevo("");
    setEfectoPadreNuevo("");
    setNodoSeleccionadoId(null);
    setTokenAutoajuste((valor) => valor + 1);
    mostrarMensaje("info", "El arbol se limpio correctamente.");
  };

  const eliminarNodo = (nodoId: string) => {
    if (nodoId === estado.problema.id) {
      mostrarMensaje("error", "No se permite eliminar el problema central.");
      return;
    }

    const nodo = estado.nodos.find((item) => item.id === nodoId);

    if (!nodo) {
      return;
    }

    const descendientes = obtenerDescendientesNodo(estado.nodos, nodoId);
    const hijosDirectos = estado.nodos.filter((item) => item.nodoPadreId === nodoId);

    if (hijosDirectos.length > 0) {
      const conservar = window.confirm(
        "Este nodo tiene efectos derivados.\nAceptar: conservar derivados y subirlos de nivel.\nCancelar: preparar eliminacion total.",
      );

      if (conservar) {
        const confirmado = window.confirm(
          "Deseas eliminar el nodo y conservar sus derivados?",
        );

        if (!confirmado) {
          return;
        }

        setEstado((estadoActual) => ({
          ...estadoActual,
          nodos: estadoActual.nodos
            .filter((item) => item.id !== nodoId)
            .map((item) => {
              if (item.nodoPadreId !== nodoId) {
                return item;
              }

              const nuevoPadreId = nodo.nodoPadreId;
              return {
                ...item,
                nodoPadreId: nuevoPadreId,
                tipo: nuevoPadreId ? "subefecto" : "efecto",
              };
            }),
        }));
        setNodoSeleccionadoId(null);
        setTokenAutoajuste((valor) => valor + 1);
        mostrarMensaje("info", "Nodo eliminado y derivados conservados.");
        return;
      }

      const eliminarTodo = window.confirm(
        "Deseas eliminar tambien todos los efectos derivados de este nodo?",
      );

      if (!eliminarTodo) {
        return;
      }
    } else {
      const confirmado = window.confirm(
        "Deseas eliminar el nodo seleccionado?",
      );

      if (!confirmado) {
        return;
      }
    }

    const idsEliminados = new Set([nodoId, ...descendientes]);
    setEstado((estadoActual) => ({
      ...estadoActual,
      nodos: estadoActual.nodos
        .filter((item) => !idsEliminados.has(item.id))
        .map((item) =>
          idsEliminados.has(item.causaAsociadaId ?? "")
            ? { ...item, causaAsociadaId: undefined }
            : item,
        ),
    }));
    setNodoSeleccionadoId(null);
    setTokenAutoajuste((valor) => valor + 1);
    mostrarMensaje("info", "Nodo eliminado correctamente.");
  };

  const moverGrupoNodos = useCallback((
    ids: string[],
    posicionesActuales: Map<string, PosicionArbolProblema>,
    delta: PosicionArbolProblema,
  ) => {
    if (ids.length === 0) {
      return;
    }

    setEstado((estadoActual) => {
      const idsSet = new Set(ids);
      const siguienteProblema = idsSet.has(estadoActual.problema.id)
        ? {
            ...estadoActual.problema,
            posicionManual: {
              x: (posicionesActuales.get(estadoActual.problema.id)?.x ?? 0) + delta.x,
              y: (posicionesActuales.get(estadoActual.problema.id)?.y ?? 0) + delta.y,
            },
          }
        : estadoActual.problema;

      return {
        ...estadoActual,
        problema: siguienteProblema,
        nodos: estadoActual.nodos.map((nodo) => {
          if (!idsSet.has(nodo.id)) {
            return nodo;
          }

          const base = posicionesActuales.get(nodo.id);

          if (!base) {
            return nodo;
          }

          return {
            ...nodo,
            posicionManual: {
              x: base.x + delta.x,
              y: base.y + delta.y,
            },
          };
        }),
      };
    });
  }, []);

  const reordenarAutomaticamente = useCallback(() => {
    setEstado((estadoActual) => ({
      ...estadoActual,
      problema: {
        ...estadoActual.problema,
        posicionManual: undefined,
      },
      nodos: estadoActual.nodos.map((nodo) => ({
        ...nodo,
        posicionManual: undefined,
      })),
    }));
    setTokenAutoajuste((valor) => valor + 1);
    mostrarMensaje("info", "Se restauro el layout automatico del arbol.");
  }, []);

  const actualizarZoom = useCallback((zoom: number) => {
    setEstado((estadoActual) =>
      estadoActual.zoom === zoom
        ? estadoActual
        : {
            ...estadoActual,
            zoom,
          },
    );
  }, []);

  const actualizarDesplazamiento = useCallback((desplazamiento: PosicionArbolProblema) => {
    setEstado((estadoActual) =>
      posicionesSonIguales(estadoActual.desplazamiento, desplazamiento)
        ? estadoActual
        : {
            ...estadoActual,
            desplazamiento,
          },
    );
  }, []);

  return {
    estado,
    vista,
    causas,
    efectos,
    conteos,
    hayProblemaCentral,
    mensaje,
    textoProblema,
    textoCausaNueva,
    textoEfectoNuevo,
    textoSubefectoNuevo,
    causaAsociadaNueva,
    efectoPadreNuevo,
    nodoSeleccionado,
    tokenAutoajuste,
    setTextoProblema,
    setTextoCausaNueva,
    setTextoEfectoNuevo,
    setTextoSubefectoNuevo,
    setCausaAsociadaNueva,
    setEfectoPadreNuevo,
    setNodoSeleccionadoId,
    mostrarMensaje,
    actualizarProblema,
    agregarCausa,
    agregarEfecto,
    agregarSubefecto,
    editarRapidoNodo,
    actualizarNodoSeleccionado,
    eliminarNodo,
    cambiarColor,
    restaurarColores,
    cargarEjemplo,
    limpiarArbol,
    moverGrupoNodos,
    reordenarAutomaticamente,
    actualizarZoom,
    actualizarDesplazamiento,
    setMensaje,
    setEstado,
  };
}
