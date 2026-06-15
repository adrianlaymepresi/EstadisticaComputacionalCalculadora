"use client";

import type { ModeloVisualEspacioMuestral } from "@/modulos/probabilidad-unidad-2/tipos";

function TarjetaElemento({
  etiqueta,
  valor,
  resaltada,
}: {
  etiqueta: string;
  valor: string;
  resaltada?: boolean;
}) {
  return (
    <div
      className={`rounded-[1rem] border px-4 py-3 text-center ${
        resaltada
          ? "border-acento-principal bg-acento-principal/10"
          : "border-verde-claro bg-white"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {etiqueta}
      </p>
      <p className="mt-2 text-sm font-semibold text-texto-principal">{valor}</p>
    </div>
  );
}

export function DiagramaEspacioMuestral({
  visual,
}: {
  visual: ModeloVisualEspacioMuestral;
}) {
  return (
    <div className="rounded-[1.6rem] border border-verde-claro bg-[#f9fbf7] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {visual.titulo}
      </p>

      <div className="mt-4 rounded-[1.4rem] border border-acento-oscuro/20 bg-white p-5">
        <div className="rounded-[1.25rem] border border-dashed border-acento-secundario/30 bg-crema-suave/50 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro">
            Espacio muestral: {visual.universoEtiqueta}
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.2rem] border border-acento-principal/20 bg-acento-principal/6 p-4">
              <p className="text-sm font-semibold text-acento-principal">
                Evento: {visual.eventoEtiqueta}
              </p>
              <p className="mt-2 text-sm leading-7 text-texto-secundario">
                {visual.regiones.evento.valor}
              </p>
            </div>

            <div className="rounded-[1.2rem] border border-verde-claro bg-[#fbfcfa] p-4">
              <p className="text-sm font-semibold text-texto-principal">
                Complemento
              </p>
              <p className="mt-2 text-sm leading-7 text-texto-secundario">
                {visual.regiones.complemento.valor}
              </p>
            </div>
          </div>
        </div>

        {(visual.elementosEspacio?.length || visual.elementosEvento?.length) && (
          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-texto-principal">
                Elementos del espacio muestral
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(visual.elementosEspacio ?? []).map((elemento) => (
                  <TarjetaElemento
                    key={`espacio-${elemento}`}
                    etiqueta={visual.universoEtiqueta}
                    valor={elemento}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-texto-principal">
                Elementos del evento
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(visual.elementosEvento ?? []).map((elemento) => (
                  <TarjetaElemento
                    key={`evento-${elemento}`}
                    etiqueta={visual.eventoEtiqueta}
                    valor={elemento}
                    resaltada
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
