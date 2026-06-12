"use client";

import { startTransition, useState } from "react";
import {
  unidadesTematicas,
  type TarjetaUnidad,
} from "@/datos/dashboard";
import { BarraLateralDashboard } from "@/componentes/dashboard/barra-lateral-dashboard";
import { CabeceraDashboard } from "@/componentes/dashboard/cabecera-dashboard";
import { SeccionUnidad } from "@/componentes/dashboard/seccion-unidad";

function EstadoSinUnidades() {
  return (
    <section className="rounded-[2rem] border border-dashed border-acento-secundario/35 bg-superficie-principal/90 p-8 shadow-[var(--sombra-panel)]">
      <h2 className="text-2xl font-semibold text-texto-principal">
        No hay unidades configuradas en este momento.
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-texto-secundario">
        Cuando agreguemos nuevas herramientas apareceran aqui sin alterar la
        estructura general del dashboard.
      </p>
    </section>
  );
}

export function PanelDashboardPrincipal() {
  const [barraAbierta, setBarraAbierta] = useState(true);
  const [unidadSeleccionada, setUnidadSeleccionada] = useState<string | null>(
    unidadesTematicas[0]?.id ?? null,
  );
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<string | null>(
    null,
  );

  const unidadActiva =
    unidadesTematicas.find((unidad) => unidad.id === unidadSeleccionada) ??
    unidadesTematicas[0] ??
    null;

  const identificadorActivo = unidadActiva?.id;
  const tarjetaActiva: TarjetaUnidad | null =
    unidadActiva?.tarjetas.find((tarjeta) => tarjeta.id === tarjetaSeleccionada) ??
    null;

  function alternarBarra() {
    startTransition(() => {
      setBarraAbierta((valorActual) => !valorActual);
    });
  }

  function seleccionarUnidad(identificador: string) {
    startTransition(() => {
      setUnidadSeleccionada(identificador);
      setTarjetaSeleccionada(null);
    });
  }

  function abrirTarjeta(identificador: string) {
    startTransition(() => {
      setTarjetaSeleccionada(identificador);
    });
  }

  function cerrarTarjeta() {
    startTransition(() => {
      setTarjetaSeleccionada(null);
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
          barraAbierta={barraAbierta}
          unidadActiva={unidadActiva}
          alAlternarBarra={alternarBarra}
        />

        {unidadActiva ? (
          <SeccionUnidad
            key={unidadActiva.id}
            unidad={unidadActiva}
            tarjetaActiva={tarjetaActiva}
            alAbrirTarjeta={abrirTarjeta}
            alCerrarTarjeta={cerrarTarjeta}
          />
        ) : (
          <EstadoSinUnidades />
        )}
      </main>
    </div>
  );
}
