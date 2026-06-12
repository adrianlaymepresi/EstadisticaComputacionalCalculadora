import type { UnidadTematica } from "@/datos/dashboard";

interface CabeceraDashboardProps {
  barraAbierta: boolean;
  unidadActiva: UnidadTematica | null;
  alAlternarBarra: () => void;
}

export function CabeceraDashboard({
  barraAbierta,
  unidadActiva,
  alAlternarBarra,
}: CabeceraDashboardProps) {
  return (
    <header className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-5 shadow-[var(--sombra-panel)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
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

          <h1 className="text-3xl font-semibold tracking-tight text-texto-principal sm:text-4xl">
            Estadistica Computacional
          </h1>
        </div>

        {unidadActiva ? (
          <div className="w-fit rounded-full border border-verde-claro bg-crema-media px-4 py-2 text-sm font-semibold text-acento-secundario">
            {unidadActiva.titulo}
          </div>
        ) : null}
      </div>
    </header>
  );
}
