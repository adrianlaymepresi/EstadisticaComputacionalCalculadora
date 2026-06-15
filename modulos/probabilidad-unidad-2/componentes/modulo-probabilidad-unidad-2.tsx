"use client";

import { CardEventosCompuestos } from "@/modulos/probabilidad-unidad-2/componentes/card-eventos-compuestos";
import { CardProbabilidadClasica } from "@/modulos/probabilidad-unidad-2/componentes/card-probabilidad-clasica";
import { CardProbabilidadCondicional } from "@/modulos/probabilidad-unidad-2/componentes/card-probabilidad-condicional";
import { CardTeoremaBayes } from "@/modulos/probabilidad-unidad-2/componentes/card-teorema-bayes";
import type { IdentificadorProbabilidadUnidad2 } from "@/modulos/probabilidad-unidad-2/tipos";

export function ModuloProbabilidadUnidad2({
  probabilidadId,
}: {
  probabilidadId: IdentificadorProbabilidadUnidad2;
}) {
  if (probabilidadId === "probabilidad-clasica") {
    return <CardProbabilidadClasica />;
  }

  if (probabilidadId === "probabilidad-eventos-compuestos") {
    return <CardEventosCompuestos />;
  }

  if (probabilidadId === "probabilidad-condicional") {
    return <CardProbabilidadCondicional />;
  }

  return <CardTeoremaBayes />;
}
