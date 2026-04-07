import type { TarjetaUnidad } from "@/datos/dashboard";
import { ModuloDiagramaBastones } from "@/modulos/diagrama-bastones/componentes/modulo-diagrama-bastones";
import { ModuloDiagramaBarras } from "@/modulos/diagrama-barras/componentes/modulo-diagrama-barras";
import { ModuloDiagramaColumnasCompuestas } from "@/modulos/diagrama-columnas-compuestas/componentes/modulo-diagrama-columnas-compuestas";
import { ModuloDiagramaColumnasSimples } from "@/modulos/diagrama-columnas-simples/componentes/modulo-diagrama-columnas-simples";
import { ModuloDiagramaBurbujas } from "@/modulos/diagrama-burbujas/componentes/modulo-diagrama-burbujas";

interface ContenidoTarjetaUnidadProps {
  unidadTitulo: string;
  tarjeta: TarjetaUnidad;
  alVolver: () => void;
}

function VistaPlaceholderTarjeta({
  unidadTitulo,
  tarjeta,
}: {
  unidadTitulo: string;
  tarjeta: TarjetaUnidad;
}) {
  return (
    <section className="rounded-[1.8rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acento-secundario">
            Herramienta en preparacion
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-texto-principal">
            {tarjeta.titulo}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-texto-secundario sm:text-base">
            {tarjeta.descripcionTrabajo}
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-verde-claro bg-panel-resalte/60 p-5">
          <p className="text-sm font-semibold text-acento-oscuro">
            {tarjeta.nota}
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-dashed border-acento-secundario/30 bg-crema-media/60 p-5">
          <p className="text-sm leading-7 text-texto-secundario sm:text-base">
            {unidadTitulo} ya queda listo para que luego integremos esta
            herramienta con el mismo patron de apertura total y regreso simple.
          </p>
        </div>
      </div>
    </section>
  );
}

export function ContenidoTarjetaUnidad({
  unidadTitulo,
  tarjeta,
  alVolver,
}: ContenidoTarjetaUnidadProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={alVolver}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-verde-claro bg-white/90 px-4 py-2 text-sm font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-principal"
      >
        {"<- Volver a cards de "}
        {unidadTitulo}
      </button>

      {tarjeta.herramientaId === "diagrama-columnas-simples" ? (
        <ModuloDiagramaColumnasSimples key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-columnas-compuestas" ? (
        <ModuloDiagramaColumnasCompuestas key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-barras" ? (
        <ModuloDiagramaBarras key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-bastones" ? (
        <ModuloDiagramaBastones key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-burbujas" ? (
        <ModuloDiagramaBurbujas key={tarjeta.id} />
      ) : (
        <VistaPlaceholderTarjeta unidadTitulo={unidadTitulo} tarjeta={tarjeta} />
      )}
    </div>
  );
}
