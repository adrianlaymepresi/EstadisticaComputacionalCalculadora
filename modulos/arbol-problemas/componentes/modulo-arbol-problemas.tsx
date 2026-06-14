"use client";

import { useMemo } from "react";
import { LienzoArbolProblemas } from "@/modulos/arbol-problemas/componentes/lienzo-arbol-problemas";
import { PanelControlesArbol } from "@/modulos/arbol-problemas/componentes/panel-controles-arbol";
import { useArbolProblemas } from "@/modulos/arbol-problemas/hooks/use-arbol-problemas";
import { exportarPngArbolProblemas } from "@/modulos/arbol-problemas/servicios/exportador-arbol-problemas";

function obtenerClasesMensaje(tipo: "error" | "exito" | "info") {
  switch (tipo) {
    case "error":
      return "border-alerta/20 bg-alerta/8 text-alerta";
    case "exito":
      return "border-exito/20 bg-exito/8 text-exito";
    default:
      return "border-acento-principal/15 bg-acento-principal/8 text-acento-principal";
  }
}

function normalizarNombreArchivo(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ModuloArbolProblemas() {
  const arbol = useArbolProblemas();

  const colorFondoExportacion = useMemo(() => {
    if (arbol.estado.fondoExportacion === "transparente") {
      return null;
    }

    if (arbol.estado.fondoExportacion === "personalizado") {
      return arbol.estado.colorFondoPersonalizado;
    }

    return "#ffffff";
  }, [
    arbol.estado.colorFondoPersonalizado,
    arbol.estado.fondoExportacion,
  ]);

  const exportarPng = async () => {
    if (!arbol.hayProblemaCentral) {
      arbol.mostrarMensaje(
        "error",
        "No se puede exportar mientras el problema central este vacio.",
      );
      return;
    }

    try {
      await exportarPngArbolProblemas(arbol.vista, arbol.estado.colores.flechas, {
        colorFondo: colorFondoExportacion,
        nombreArchivo: `${normalizarNombreArchivo("arbol-de-problemas")}.png`,
      });
      arbol.mostrarMensaje("exito", "PNG exportado correctamente.");
    } catch (error) {
      console.error("No se pudo exportar el arbol de problemas:", error);
      arbol.mostrarMensaje(
        "error",
        "No se pudo exportar el PNG. Intenta nuevamente.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-panel-resalte px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-acento-secundario">
            Extras
          </span>
          <span className="rounded-full border border-verde-claro bg-white/90 px-4 py-2 text-sm font-semibold text-acento-oscuro">
            Card interactiva
          </span>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-5xl">
            <h1 className="text-[2.6rem] font-semibold tracking-tight text-acento-oscuro sm:text-[4rem]">
              Arbol de problemas
            </h1>
            <p className="mt-3 text-lg leading-8 text-texto-secundario sm:text-[1.12rem]">
              Construye un arbol visual con problema central, causas, efectos y
              efectos derivados. Puedes editar nodos, arrastrarlos, ajustar la
              vista y exportar el diagrama completo a PNG.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-[1.2rem] border border-verde-claro bg-white/90 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acento-secundario">
                Causas
              </p>
              <p className="mt-2 text-2xl font-semibold text-acento-oscuro">
                {arbol.conteos.causas}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-verde-claro bg-white/90 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acento-secundario">
                Efectos
              </p>
              <p className="mt-2 text-2xl font-semibold text-acento-oscuro">
                {arbol.conteos.efectos}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-verde-claro bg-white/90 px-4 py-3 col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-acento-secundario">
                Derivados
              </p>
              <p className="mt-2 text-2xl font-semibold text-acento-oscuro">
                {arbol.conteos.derivados}
              </p>
            </div>
          </div>
        </div>
      </header>

      {arbol.mensaje ? (
        <div
          className={`rounded-[1.35rem] border px-5 py-4 text-sm leading-7 ${obtenerClasesMensaje(arbol.mensaje.tipo)}`}
        >
          {arbol.mensaje.texto}
        </div>
      ) : null}

      <section
        className={`grid min-w-0 gap-6 ${arbol.estado.controlesVisibles ? "xl:grid-cols-[390px_minmax(0,1fr)]" : "grid-cols-1"}`}
      >
        <PanelControlesArbol
          controlesVisibles={arbol.estado.controlesVisibles}
          estado={arbol.estado}
          conteos={arbol.conteos}
          problemaBorrador={arbol.textoProblema}
          textoCausaNueva={arbol.textoCausaNueva}
          textoEfectoNuevo={arbol.textoEfectoNuevo}
          textoSubefectoNuevo={arbol.textoSubefectoNuevo}
          causaAsociadaNueva={arbol.causaAsociadaNueva}
          efectoPadreNuevo={arbol.efectoPadreNuevo}
          causas={arbol.causas}
          efectos={arbol.efectos}
          nodoSeleccionado={arbol.nodoSeleccionado}
          onProblemaBorrador={arbol.setTextoProblema}
          onTextoCausaNueva={arbol.setTextoCausaNueva}
          onTextoEfectoNuevo={arbol.setTextoEfectoNuevo}
          onTextoSubefectoNuevo={arbol.setTextoSubefectoNuevo}
          onCausaAsociadaNueva={arbol.setCausaAsociadaNueva}
          onEfectoPadreNuevo={arbol.setEfectoPadreNuevo}
          onActualizarProblema={arbol.actualizarProblema}
          onAgregarCausa={arbol.agregarCausa}
          onAgregarEfecto={arbol.agregarEfecto}
          onAgregarSubefecto={arbol.agregarSubefecto}
          onActualizarNodoSeleccionado={arbol.actualizarNodoSeleccionado}
          onEliminarNodo={arbol.eliminarNodo}
          onDeseleccionarNodo={() => arbol.setNodoSeleccionadoId(null)}
          onCambiarColor={(bloque, campo, valor) =>
            arbol.cambiarColor(bloque, campo, valor)
          }
          onAlternarRelacionesLogicas={() =>
            arbol.setEstado((estadoActual) => ({
              ...estadoActual,
              mostrarRelacionesLogicas: !estadoActual.mostrarRelacionesLogicas,
            }))
          }
          onRestaurarColores={arbol.restaurarColores}
          onCambiarFondoExportacion={(valor) =>
            arbol.setEstado((estadoActual) => ({
              ...estadoActual,
              fondoExportacion: valor,
            }))
          }
          onCambiarColorFondoPersonalizado={(valor) =>
            arbol.setEstado((estadoActual) => ({
              ...estadoActual,
              colorFondoPersonalizado: valor,
            }))
          }
          onExportarPng={exportarPng}
        />

        <div className="flex min-w-0 flex-col gap-5">
          <div className="rounded-[1.6rem] border border-verde-claro bg-superficie-principal/95 p-5 shadow-[var(--sombra-panel)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acento-secundario">
                  Area visual
                </p>
                <h2 className="mt-2 text-[2rem] font-semibold tracking-tight text-acento-oscuro">
                  Lienzo del arbol
                </h2>
              </div>
              <div className="rounded-full bg-panel-resalte px-4 py-2 text-sm font-semibold text-acento-oscuro">
                Doble clic en un nodo para edicion rapida
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-5 shadow-[var(--sombra-panel)]">
            <LienzoArbolProblemas
              estado={arbol.estado}
              vista={arbol.vista}
              nodoSeleccionadoId={arbol.nodoSeleccionado?.nodo.id ?? null}
              tokenAutoajuste={arbol.tokenAutoajuste}
              onSeleccionarNodo={arbol.setNodoSeleccionadoId}
              onEditarRapidoNodo={arbol.editarRapidoNodo}
              onMoverGrupoNodos={arbol.moverGrupoNodos}
              onActualizarZoom={arbol.actualizarZoom}
              onActualizarDesplazamiento={arbol.actualizarDesplazamiento}
              onAlternarControles={() =>
                arbol.setEstado((estadoActual) => ({
                  ...estadoActual,
                  controlesVisibles: !estadoActual.controlesVisibles,
                }))
              }
              onReordenar={arbol.reordenarAutomaticamente}
              onCargarEjemplo={arbol.cargarEjemplo}
              onLimpiar={arbol.limpiarArbol}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
