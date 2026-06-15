"use client";

import type { ModeloVisualVennDos, RegionVisualSimple } from "@/modulos/probabilidad-unidad-2/tipos";

function BurbujaRegion({
  region,
  className,
}: {
  region: RegionVisualSimple;
  className: string;
}) {
  return (
    <div
      className={`absolute flex min-h-[88px] min-w-[120px] max-w-[160px] -translate-x-1/2 -translate-y-1/2 flex-col justify-center rounded-[1rem] border bg-white/95 px-3 py-2 text-center shadow-sm ${className} ${
        region.resaltada
          ? "border-acento-principal ring-2 ring-acento-principal/20"
          : "border-verde-claro"
      }`}
    >
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {region.etiqueta}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-texto-principal">
        {region.valor}
      </p>
    </div>
  );
}

export function DiagramaVennDosEventos({
  visual,
}: {
  visual: ModeloVisualVennDos;
}) {
  return (
    <div className="rounded-[1.6rem] border border-verde-claro bg-[#f9fbf7] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {visual.titulo}
      </p>

      <div className="mt-4 overflow-x-auto">
        <div className="relative mx-auto h-[360px] min-w-[700px] rounded-[1.5rem] border border-verde-claro bg-white">
          <div className="absolute left-6 top-4 rounded-full bg-panel-resalte px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-acento-oscuro">
            Universo: {visual.universoEtiqueta}
          </div>

          <div className="absolute left-[120px] top-[88px] h-[190px] w-[230px] rounded-full border-2 border-[#7aa7ff] bg-[#dce8ff]/65" />
          <div className="absolute left-[290px] top-[88px] h-[190px] w-[230px] rounded-full border-2 border-[#ff9d9d] bg-[#ffe0e0]/70" />

          <div className="absolute left-[190px] top-[112px] text-sm font-semibold text-acento-oscuro">
            {visual.nombreA}
          </div>
          <div className="absolute left-[430px] top-[112px] text-sm font-semibold text-acento-oscuro">
            {visual.nombreB}
          </div>

          <BurbujaRegion
            region={visual.regiones.soloA}
            className="left-[205px] top-[200px]"
          />
          <BurbujaRegion
            region={visual.regiones.interseccion}
            className="left-[350px] top-[200px]"
          />
          <BurbujaRegion
            region={visual.regiones.soloB}
            className="left-[495px] top-[200px]"
          />

          {visual.regiones.ninguno ? (
            <BurbujaRegion
              region={visual.regiones.ninguno}
              className="left-[350px] top-[310px]"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
