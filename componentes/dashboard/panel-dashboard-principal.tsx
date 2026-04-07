"use client";

import { startTransition, useDeferredValue, useState } from "react";
import {
  unidadesTematicas,
  type TarjetaUnidad,
  type UnidadTematica,
} from "@/datos/dashboard";
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

function crearContenidoTarjeta(tarjeta: TarjetaUnidad) {
  return [
    tarjeta.titulo,
    tarjeta.resumen,
    tarjeta.descripcionTrabajo,
    tarjeta.nota,
    tarjeta.etiqueta,
    ...tarjeta.palabrasClave,
  ].join(" ");
}

function crearContenidoUnidad(unidad: UnidadTematica) {
  return [
    unidad.titulo,
    unidad.subtitulo,
    unidad.descripcion,
    ...unidad.palabrasClave,
  ].join(" ");
}

function coincideConBusqueda(unidad: UnidadTematica, terminoNormalizado: string) {
  const unidadCoincide = normalizarTexto(crearContenidoUnidad(unidad)).includes(
    terminoNormalizado,
  );
  if (unidadCoincide) {
    return true;
  }

  return unidad.tarjetas.some((tarjeta) =>
    normalizarTexto(crearContenidoTarjeta(tarjeta)).includes(
      terminoNormalizado,
    ),
  );
}

function contarTarjetasCoincidentes(
  unidad: UnidadTematica,
  terminoNormalizado: string,
) {
  if (terminoNormalizado.length === 0) {
    return unidad.tarjetas.length;
  }

  const unidadCoincide = normalizarTexto(crearContenidoUnidad(unidad)).includes(
    terminoNormalizado,
  );
  if (unidadCoincide) {
    return unidad.tarjetas.length;
  }

  return unidad.tarjetas.filter((tarjeta) =>
    normalizarTexto(crearContenidoTarjeta(tarjeta)).includes(
      terminoNormalizado,
    ),
  ).length;
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
        No encontramos unidades ni cards para &quot;{terminoBusqueda}&quot;
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-texto-secundario">
        Prueba con terminos como unidad, burbujas, barras o limpia la busqueda
        para volver a ver el dashboard completo.
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

  const cantidadTarjetasCoincidentes = unidadesFiltradas.reduce(
    (acumulado, unidad) =>
      acumulado + contarTarjetasCoincidentes(unidad, terminoNormalizado),
    0,
  );

  const unidadActiva =
    unidadesFiltradas.find((unidad) => unidad.id === unidadSeleccionada) ??
    unidadesFiltradas[0] ??
    null;

  const identificadorActivo = unidadActiva?.id;
  const tarjetaActiva =
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
      setTerminoBusqueda("");
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
          terminoBusqueda={terminoBusqueda}
          cantidadUnidadesVisibles={unidadesFiltradas.length}
          cantidadTarjetasVisibles={cantidadTarjetasCoincidentes}
          barraAbierta={barraAbierta}
          unidadActiva={unidadActiva}
          alAlternarBarra={alternarBarra}
          alCambiarBusqueda={setTerminoBusqueda}
          alLimpiarBusqueda={() => setTerminoBusqueda("")}
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
          <EstadoSinResultados terminoBusqueda={terminoBusqueda} />
        )}
      </main>
    </div>
  );
}
