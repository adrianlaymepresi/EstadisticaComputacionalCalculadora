"use client";

import type { ModeloVisualArbolBayes } from "@/modulos/probabilidad-unidad-2/tipos";

export function DiagramaArbolBayes({
  visual,
}: {
  visual: ModeloVisualArbolBayes;
}) {
  return (
    <div className="rounded-[1.6rem] border border-verde-claro bg-[#f9fbf7] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {visual.titulo}
      </p>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[820px] rounded-[1.4rem] border border-verde-claro bg-white p-5">
          <div className="grid grid-cols-[180px_1fr] gap-4">
            <div className="flex items-center justify-center">
              <div className="rounded-[1.2rem] border border-acento-oscuro/20 bg-panel-resalte/70 px-5 py-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-acento-secundario">
                  Evidencia observada
                </p>
                <p className="mt-2 text-sm font-semibold text-texto-principal">
                  {visual.evidencia}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {visual.ramas.map((rama) => (
                <div
                  key={rama.id}
                  className={`rounded-[1.25rem] border p-4 ${
                    rama.resaltada
                      ? "border-acento-principal bg-acento-principal/8"
                      : "border-verde-claro bg-[#fbfcfa]"
                  }`}
                >
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-[180px_1fr_1fr]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-acento-secundario">
                        Hipotesis
                      </p>
                      <p className="mt-2 text-sm font-semibold text-texto-principal">
                        {rama.hipotesis}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-texto-secundario">
                        P(Hi) = {rama.previa}
                      </p>
                    </div>

                    <div className="rounded-[1rem] border border-verde-claro bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-acento-secundario">
                        Rama de evidencia
                      </p>
                      <p className="mt-2 text-sm text-texto-principal">
                        P({visual.evidencia}|Hi) = {rama.evidencia}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-acento-principal">
                        P(Hi∩{visual.evidencia}) = {rama.conjuntaEvidencia}
                      </p>
                    </div>

                    <div className="rounded-[1rem] border border-verde-claro bg-white px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-acento-secundario">
                        Rama complementaria
                      </p>
                      <p className="mt-2 text-sm text-texto-principal">
                        P({visual.complemento}|Hi) = {rama.complemento}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-texto-secundario">
                        P(Hi∩{visual.complemento}) = {rama.conjuntaComplemento}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
