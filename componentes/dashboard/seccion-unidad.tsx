"use client";

import { useState } from "react";
import type { TarjetaUnidad, UnidadTematica } from "@/datos/dashboard";
import { ContenidoTarjetaUnidad } from "@/componentes/dashboard/contenido-tarjeta-unidad";

interface SeccionUnidadProps {
  unidad: UnidadTematica;
  tarjetaActiva: TarjetaUnidad | null;
  alAbrirTarjeta: (identificador: string) => void;
  alCerrarTarjeta: () => void;
}

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function coincideTarjeta(tarjeta: TarjetaUnidad, terminoNormalizado: string) {
  const contenidoBuscable = [
    tarjeta.titulo,
    tarjeta.resumen,
    tarjeta.descripcionTrabajo,
    tarjeta.nota,
    tarjeta.etiqueta,
    ...tarjeta.palabrasClave,
  ].join(" ");

  return normalizarTexto(contenidoBuscable).includes(terminoNormalizado);
}

function TarjetaCompacta({
  tarjeta,
  alAbrirTarjeta,
}: {
  tarjeta: TarjetaUnidad;
  alAbrirTarjeta: (identificador: string) => void;
}) {
  const esDisponible = tarjeta.estado === "disponible";

  return (
    <button
      type="button"
      onClick={() => alAbrirTarjeta(tarjeta.id)}
      className="w-full rounded-[1.35rem] border border-verde-claro bg-white/90 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-acento-principal hover:bg-crema-media focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-principal"
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.82rem] font-semibold uppercase tracking-[0.05em] text-texto-principal">
            {tarjeta.titulo}
          </p>
          <span
            className={`inline-flex shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
              esDisponible
                ? "bg-verde-suave text-acento-principal"
                : "bg-crema-media text-acento-secundario"
            }`}
          >
            {esDisponible ? "Abrir" : "Proximamente"}
          </span>
        </div>

        <p className="text-sm leading-6 text-texto-secundario">
          {tarjeta.resumen}
        </p>
      </div>
    </button>
  );
}

export function SeccionUnidad({
  unidad,
  tarjetaActiva,
  alAbrirTarjeta,
  alCerrarTarjeta,
}: SeccionUnidadProps) {
  const [terminoTarjetas, setTerminoTarjetas] = useState("");

  const terminoTarjetasNormalizado = normalizarTexto(terminoTarjetas);
  const tarjetasVisibles =
    terminoTarjetasNormalizado.length > 0
      ? unidad.tarjetas.filter((tarjeta) =>
          coincideTarjeta(tarjeta, terminoTarjetasNormalizado),
        )
      : unidad.tarjetas;

  if (tarjetaActiva) {
    return (
      <ContenidoTarjetaUnidad
        unidadTitulo={unidad.titulo}
        tarjeta={tarjetaActiva}
        alVolver={alCerrarTarjeta}
      />
    );
  }

  return (
    <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-5 shadow-[var(--sombra-panel)] sm:p-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="w-fit rounded-full bg-verde-suave px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-acento-principal">
            {unidad.subtitulo}
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-texto-principal sm:text-4xl">
            {unidad.titulo}
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-texto-secundario sm:text-base">
            {unidad.descripcion}
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-verde-claro bg-panel-resalte/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-texto-principal">
                  Menu de cards
                </p>
                <p className="text-sm leading-6 text-texto-secundario">
                  Selecciona una card y la interfaz cambiara para trabajar solo
                  en esa herramienta.
                </p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-acento-secundario">
                {tarjetasVisibles.length} cards
              </span>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex-1">
                <label
                  htmlFor={`busqueda-tarjetas-${unidad.id}`}
                  className="mb-2 block text-sm font-semibold text-texto-principal"
                >
                  Buscar card dentro de {unidad.titulo}
                </label>
                <input
                  id={`busqueda-tarjetas-${unidad.id}`}
                  type="search"
                  inputMode="search"
                  value={terminoTarjetas}
                  onChange={(evento) => setTerminoTarjetas(evento.target.value)}
                  placeholder="Columnas, burbujas, lineal..."
                  className="min-h-12 w-full rounded-2xl border border-verde-claro bg-white/85 px-4 text-sm text-texto-principal outline-none transition focus-visible:border-acento-principal focus-visible:ring-4 focus-visible:ring-acento-principal/15"
                />
              </div>

              <button
                type="button"
                onClick={() => setTerminoTarjetas("")}
                className="min-h-12 rounded-2xl border border-verde-claro bg-white/85 px-4 text-sm font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-principal lg:self-end"
              >
                Limpiar cards
              </button>
            </div>
          </div>
        </div>

        {tarjetasVisibles.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {tarjetasVisibles.map((tarjeta) => (
              <TarjetaCompacta
                key={tarjeta.id}
                tarjeta={tarjeta}
                alAbrirTarjeta={alAbrirTarjeta}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.8rem] border border-dashed border-acento-secundario/35 bg-crema-media/60 p-6 text-center">
            <p className="text-base font-semibold text-texto-principal">
              No hay cards que coincidan con el filtro interno.
            </p>
            <p className="mt-2 text-sm leading-7 text-texto-secundario">
              Prueba con otro termino o limpia la busqueda para ver todas las
              cards de esta unidad.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
