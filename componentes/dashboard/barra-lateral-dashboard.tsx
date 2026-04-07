import type { UnidadTematica } from "@/datos/dashboard";

interface BarraLateralDashboardProps {
  unidades: ReadonlyArray<UnidadTematica>;
  identificadorActivo?: string;
  alSeleccionar: (identificador: string) => void;
}

export function BarraLateralDashboard({
  unidades,
  identificadorActivo,
  alSeleccionar,
}: BarraLateralDashboardProps) {
  return (
    <aside className="w-full lg:w-56 lg:shrink-0">
      <section className="rounded-[2rem] border border-borde-sutil bg-panel-navegacion/95 p-4 shadow-[var(--sombra-panel)] sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-acento-principal">
          Navegacion
        </p>

        <nav aria-label="Navegacion de unidades" className="mt-4">
          <div className="flex flex-col gap-2.5">
            {unidades.map((unidad) => {
              const esActiva = unidad.id === identificadorActivo;

              return (
                <button
                  key={unidad.id}
                  type="button"
                  onClick={() => alSeleccionar(unidad.id)}
                  aria-pressed={esActiva}
                  className={`rounded-[1.4rem] border px-4 py-3 text-left text-sm font-semibold transition ${
                    esActiva
                      ? "border-acento-principal bg-acento-principal text-white shadow-[0_16px_30px_rgba(0,98,65,0.18)]"
                      : "border-verde-claro bg-white/80 text-texto-principal hover:border-acento-principal hover:bg-crema-media"
                  }`}
                >
                  {unidad.titulo}
                </button>
              );
            })}
          </div>
        </nav>
      </section>
    </aside>
  );
}
