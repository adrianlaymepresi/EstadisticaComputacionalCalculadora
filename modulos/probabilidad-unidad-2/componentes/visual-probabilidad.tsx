"use client";

import type { ModeloVisualProbabilidadUnidad2 } from "@/modulos/probabilidad-unidad-2/tipos";
import { DiagramaArbolBayes } from "@/modulos/probabilidad-unidad-2/componentes/diagrama-arbol-bayes";
import { DiagramaEspacioMuestral } from "@/modulos/probabilidad-unidad-2/componentes/diagrama-espacio-muestral";
import { DiagramaVennDosEventos } from "@/modulos/probabilidad-unidad-2/componentes/diagrama-venn-dos-eventos";
import { DiagramaVennTresEventos } from "@/modulos/probabilidad-unidad-2/componentes/diagrama-venn-tres-eventos";
import { TablaContingenciaProbabilidad } from "@/modulos/probabilidad-unidad-2/componentes/tabla-contingencia-probabilidad";
import { TablaRegionesProbabilidad } from "@/modulos/probabilidad-unidad-2/componentes/tabla-regiones-probabilidad";

export function VisualProbabilidad({
  visual,
}: {
  visual: ModeloVisualProbabilidadUnidad2;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
          Apoyo visual
        </p>
        <p className="mt-2 text-sm leading-7 text-texto-secundario">
          El diagrama resalta la region o ruta usada para el calculo final.
        </p>
      </div>

      {visual.tipo === "espacio-muestral" ? (
        <DiagramaEspacioMuestral visual={visual} />
      ) : visual.tipo === "venn-2" ? (
        <DiagramaVennDosEventos visual={visual} />
      ) : visual.tipo === "venn-3" ? (
        <DiagramaVennTresEventos visual={visual} />
      ) : visual.tipo === "tabla-regiones" ? (
        <TablaRegionesProbabilidad visual={visual} />
      ) : visual.tipo === "contingencia" ? (
        <TablaContingenciaProbabilidad visual={visual} />
      ) : (
        <DiagramaArbolBayes visual={visual} />
      )}
    </div>
  );
}
