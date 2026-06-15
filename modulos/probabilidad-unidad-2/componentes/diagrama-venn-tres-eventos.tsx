"use client";

import type { ModeloVisualVennTres, RegionVisualSimple } from "@/modulos/probabilidad-unidad-2/tipos";

function EtiquetaRegion({
  region,
  className,
}: {
  region: RegionVisualSimple;
  className: string;
}) {
  return (
    <div
      className={`absolute flex min-h-[82px] min-w-[118px] max-w-[150px] -translate-x-1/2 -translate-y-1/2 flex-col justify-center rounded-[1rem] border bg-white/95 px-3 py-2 text-center shadow-sm ${className} ${
        region.resaltada
          ? "border-acento-principal ring-2 ring-acento-principal/20"
          : "border-verde-claro"
      }`}
    >
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {region.etiqueta}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-texto-principal">
        {region.valor}
      </p>
    </div>
  );
}

export function DiagramaVennTresEventos({
  visual,
}: {
  visual: ModeloVisualVennTres;
}) {
  return (
    <div className="rounded-[1.6rem] border border-verde-claro bg-[#f9fbf7] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {visual.titulo}
      </p>

      <div className="mt-4 overflow-x-auto">
        <div className="relative mx-auto h-[460px] min-w-[860px] rounded-[1.5rem] border border-verde-claro bg-white">
          <div className="absolute left-6 top-4 rounded-full bg-panel-resalte px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-acento-oscuro">
            Universo: {visual.universoEtiqueta}
          </div>

          <div className="absolute left-[150px] top-[88px] h-[220px] w-[260px] rounded-full border-2 border-[#7aa7ff] bg-[#dce8ff]/65" />
          <div className="absolute left-[445px] top-[88px] h-[220px] w-[260px] rounded-full border-2 border-[#ff9d9d] bg-[#ffe0e0]/70" />
          <div className="absolute left-[300px] top-[200px] h-[220px] w-[260px] rounded-full border-2 border-[#9ed9a5] bg-[#e2f6e5]/75" />

          <div className="absolute left-[215px] top-[112px] text-sm font-semibold text-acento-oscuro">
            {visual.nombres[0]}
          </div>
          <div className="absolute left-[540px] top-[112px] text-sm font-semibold text-acento-oscuro">
            {visual.nombres[1]}
          </div>
          <div className="absolute left-[420px] top-[338px] text-sm font-semibold text-acento-oscuro">
            {visual.nombres[2]}
          </div>

          <EtiquetaRegion
            region={visual.regiones.soloA}
            className="left-[238px] top-[195px]"
          />
          <EtiquetaRegion
            region={visual.regiones.soloB}
            className="left-[622px] top-[195px]"
          />
          <EtiquetaRegion
            region={visual.regiones.soloC}
            className="left-[430px] top-[360px]"
          />
          <EtiquetaRegion
            region={visual.regiones.soloAB}
            className="left-[430px] top-[165px]"
          />
          <EtiquetaRegion
            region={visual.regiones.soloAC}
            className="left-[320px] top-[270px]"
          />
          <EtiquetaRegion
            region={visual.regiones.soloBC}
            className="left-[540px] top-[270px]"
          />
          <EtiquetaRegion
            region={visual.regiones.triple}
            className="left-[430px] top-[235px]"
          />

          {visual.regiones.ninguno ? (
            <EtiquetaRegion
              region={visual.regiones.ninguno}
              className="left-[740px] top-[380px]"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
