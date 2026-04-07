import type { UnidadTematica } from "@/datos/dashboard";

interface CabeceraDashboardProps {
  terminoBusqueda: string;
  cantidadUnidadesVisibles: number;
  cantidadTarjetasVisibles: number;
  barraAbierta: boolean;
  unidadActiva: UnidadTematica | null;
  alAlternarBarra: () => void;
  alCambiarBusqueda: (nuevoValor: string) => void;
  alLimpiarBusqueda: () => void;
}

export function CabeceraDashboard({
  terminoBusqueda,
  cantidadUnidadesVisibles,
  cantidadTarjetasVisibles,
  barraAbierta,
  unidadActiva,
  alAlternarBarra,
  alCambiarBusqueda,
  alLimpiarBusqueda,
}: CabeceraDashboardProps) {
  return (
    <header className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-5 shadow-[var(--sombra-panel)] sm:p-7">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={alAlternarBarra}
              aria-label={barraAbierta ? "Ocultar navegacion" : "Mostrar navegacion"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-verde-claro bg-crema-media text-acento-oscuro transition hover:border-acento-principal hover:bg-verde-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-principal"
            >
              <span className="sr-only">
                {barraAbierta ? "Ocultar navegacion" : "Mostrar navegacion"}
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>

            <div className="flex flex-col gap-2">
              <span className="w-fit rounded-full bg-verde-suave px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-acento-principal">
                Dashboard listo
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-texto-principal sm:text-4xl">
                Estadistica Computacional
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-texto-secundario sm:text-base">
                Dashboard modular preparado para diagramas, calculos y nuevas
                funcionalidades sin perder una estructura clara.
              </p>
            </div>
          </div>

          <div className="w-fit rounded-full border border-verde-claro bg-crema-media px-4 py-2 text-sm font-semibold text-acento-secundario">
            {unidadActiva ? unidadActiva.titulo : "Sin resultados"}
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-verde-claro bg-panel-resalte/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="flex-1">
              <label
                htmlFor="busqueda-unidades"
                className="mb-2 block text-sm font-semibold text-texto-principal"
              >
                Buscar en unidades y cards
              </label>
              <input
                id="busqueda-unidades"
                type="search"
                inputMode="search"
                value={terminoBusqueda}
                onChange={(evento) => alCambiarBusqueda(evento.target.value)}
                placeholder="Unidad 1, burbujas, barras, pictogramas..."
                className="min-h-12 w-full rounded-2xl border border-verde-claro bg-white/85 px-4 text-sm text-texto-principal outline-none transition focus-visible:border-acento-principal focus-visible:ring-4 focus-visible:ring-acento-principal/15"
              />
            </div>

            <div className="flex gap-3 lg:self-end">
              <button
                type="button"
                onClick={alLimpiarBusqueda}
                className="min-h-12 rounded-2xl border border-verde-claro bg-white/85 px-4 text-sm font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-principal"
              >
                Limpiar
              </button>
              <div className="flex min-h-12 items-center rounded-2xl bg-acento-oscuro px-4 text-sm font-semibold text-white">
                {cantidadUnidadesVisibles} unidades / {cantidadTarjetasVisibles}{" "}
                cards
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
