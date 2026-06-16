"use client";

import { CardEventosCompuestos } from "@/modulos/probabilidad-unidad-2/componentes/card-eventos-compuestos";
import { CardDiagramaArbolProbabilidad } from "@/modulos/probabilidad-unidad-2/componentes/card-diagrama-arbol-probabilidad";
import { CardProbabilidadClasica } from "@/modulos/probabilidad-unidad-2/componentes/card-probabilidad-clasica";
import { CardProbabilidadCondicional } from "@/modulos/probabilidad-unidad-2/componentes/card-probabilidad-condicional";
import { CardProbabilidadCondicionalSimple } from "@/modulos/probabilidad-unidad-2/componentes/card-probabilidad-condicional-simple";
import { CardTeoremaBayes } from "@/modulos/probabilidad-unidad-2/componentes/card-teorema-bayes";
import { CardTeoremaBayesSimple } from "@/modulos/probabilidad-unidad-2/componentes/card-teorema-bayes-simple";
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

  if (probabilidadId === "probabilidad-condicional-simple") {
    return <CardProbabilidadCondicionalSimple />;
  }

  if (probabilidadId === "probabilidad-condicional") {
    return <CardProbabilidadCondicional />;
  }

  if (probabilidadId === "teorema-bayes-simple") {
    return <CardTeoremaBayesSimple />;
  }

  if (probabilidadId === "diagrama-arbol-probabilidad") {
    return <CardDiagramaArbolProbabilidad />;
  }

  return <CardTeoremaBayes />;
}
