import type { UnidadTematica } from "@/datos/dashboard";

interface SeccionUnidadProps {
  unidad: UnidadTematica;
  tarjetaActiva: boolean;
  alAbrirTarjeta: (identificador: string) => void;
}

export function SeccionUnidad({
  unidad,
  tarjetaActiva,
  alAbrirTarjeta,
}: SeccionUnidadProps) {
  return (
    <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-5 shadow-[var(--sombra-panel)] sm:p-7">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
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

        <button
          type="button"
          onClick={() => alAbrirTarjeta(unidad.tarjeta.id)}
          className="w-full rounded-[1.8rem] border border-acento-principal bg-acento-principal p-5 text-left text-white shadow-[0_18px_40px_rgba(0,98,65,0.18)] transition hover:bg-acento-oscuro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-principal sm:p-6"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                {unidad.tarjeta.etiqueta}
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                {unidad.tarjeta.titulo}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {unidad.tarjeta.resumen}
              </p>
            </div>
            <span className="inline-flex w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white">
              Abrir
            </span>
          </div>
        </button>

        <article className="rounded-[1.8rem] border border-verde-claro bg-crema-media/70 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acento-principal">
            Area de trabajo
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-texto-principal sm:text-3xl">
            {tarjetaActiva
              ? unidad.tarjeta.areaTitulo
              : "Panel listo para funciones largas"}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-texto-secundario sm:text-base">
            {tarjetaActiva
              ? unidad.tarjeta.areaDescripcion
              : "Activa la card para preparar la vista donde luego montaremos formulas, controles y resultados."}
          </p>

          <div
            className={`mt-5 min-h-[320px] rounded-[1.6rem] border p-5 sm:p-6 ${
              tarjetaActiva
                ? "border-verde-claro bg-white/85"
                : "border-dashed border-acento-secundario/35 bg-superficie-principal/70"
            }`}
          >
            {tarjetaActiva ? (
              <div className="flex h-full flex-col justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acento-secundario">
                    Vista activa
                  </p>
                  <h4 className="mt-3 text-xl font-semibold text-texto-principal sm:text-2xl">
                    {unidad.tarjeta.titulo}
                  </h4>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-texto-secundario sm:text-base">
                    La pantalla ya esta lista para cambiar segun la funcionalidad
                    que construyamos dentro de {unidad.titulo}.
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-verde-claro bg-verde-suave/70 p-4">
                  <p className="text-sm font-semibold text-acento-oscuro">
                    {unidad.tarjeta.nota}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <div className="max-w-xl">
                  <p className="text-base font-semibold text-texto-principal">
                    La zona queda libre para trabajar con mas ancho.
                  </p>
                  <p className="mt-3 text-sm leading-7 text-texto-secundario">
                    Aqui podremos insertar tablas, formularios, salidas y
                    operaciones extensas sin depender de una barra lateral
                    grande.
                  </p>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
