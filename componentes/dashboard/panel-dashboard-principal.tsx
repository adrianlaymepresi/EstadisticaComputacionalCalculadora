"use client";

import { startTransition, useDeferredValue, useState } from "react";
import { unidadesTematicas, type UnidadTematica } from "@/datos/dashboard";
import { BarraLateralDashboard } from "@/componentes/dashboard/barra-lateral-dashboard";
import { CabeceraDashboard } from "@/componentes/dashboard/cabecera-dashboard";
import { SeccionUnidad } from "@/componentes/dashboard/seccion-unidad";

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function coincideConBusqueda(unidad: UnidadTematica, terminoNormalizado: string) {
  const contenidoBuscable = [
    unidad.titulo,
    unidad.subtitulo,
    unidad.descripcion,
    ...unidad.palabrasClave,
    unidad.tarjeta.titulo,
    unidad.tarjeta.resumen,
    unidad.tarjeta.areaTitulo,
  ].join(" ");

  return normalizarTexto(contenidoBuscable).includes(terminoNormalizado);
}

interface EstadoSinResultadosProps {
  terminoBusqueda: string;
}

function EstadoSinResultados({ terminoBusqueda }: EstadoSinResultadosProps) {
  return (
    <section className="rounded-[2rem] border border-dashed border-acento-secundario/35 bg-superficie-principal/90 p-8 shadow-[var(--sombra-panel)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-acento-secundario">
        Sin coincidencias
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-texto-principal">
        No encontramos apartados para &quot;{terminoBusqueda}&quot;
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-texto-secundario">
        Prueba con terminos como unidad, card o limpia la busqueda para volver
        a ver la plantilla completa.
      </p>
    </section>
  );
}

export function PanelDashboardPrincipal() {
  const [barraAbierta, setBarraAbierta] = useState(true);
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string | null>(
    unidadesTematicas[0]?.id ?? null,
  );
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<string | null>(
    null,
  );

  const terminoBusquedaDiferido = useDeferredValue(terminoBusqueda);
  const terminoNormalizado = normalizarTexto(terminoBusquedaDiferido);

  const unidadesFiltradas =
    terminoNormalizado.length > 0
      ? unidadesTematicas.filter((unidad) =>
          coincideConBusqueda(unidad, terminoNormalizado),
        )
      : unidadesTematicas;

  const unidadActiva =
    unidadesFiltradas.find((unidad) => unidad.id === unidadSeleccionada) ??
    unidadesFiltradas[0] ??
    null;

  const identificadorActivo = unidadActiva?.id;
  const tarjetaActiva = unidadActiva
    ? tarjetaSeleccionada === unidadActiva.tarjeta.id
    : false;

  function alternarBarra() {
    startTransition(() => {
      setBarraAbierta((valorActual) => !valorActual);
    });
  }

  function seleccionarUnidad(identificador: string) {
    startTransition(() => {
      setUnidadSeleccionada(identificador);
      setTerminoBusqueda("");
      setTarjetaSeleccionada(null);
    });
  }

  function abrirTarjeta(identificador: string) {
    startTransition(() => {
      setTarjetaSeleccionada(identificador);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-start lg:px-8">
      {barraAbierta ? (
        <BarraLateralDashboard
          unidades={unidadesTematicas}
          identificadorActivo={identificadorActivo}
          alSeleccionar={seleccionarUnidad}
        />
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col gap-4">
        <CabeceraDashboard
          terminoBusqueda={terminoBusqueda}
          cantidadResultados={unidadesFiltradas.length}
          barraAbierta={barraAbierta}
          unidadActiva={unidadActiva}
          alAlternarBarra={alternarBarra}
          alCambiarBusqueda={setTerminoBusqueda}
          alLimpiarBusqueda={() => setTerminoBusqueda("")}
        />

        {unidadActiva ? (
          <SeccionUnidad
            unidad={unidadActiva}
            tarjetaActiva={tarjetaActiva}
            alAbrirTarjeta={abrirTarjeta}
          />
        ) : (
          <EstadoSinResultados terminoBusqueda={terminoBusqueda} />
        )}
      </main>
    </div>
  );
}
