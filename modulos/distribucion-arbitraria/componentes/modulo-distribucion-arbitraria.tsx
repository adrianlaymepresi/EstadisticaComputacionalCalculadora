"use client";

import { exportarExcelDistribucionArbitraria } from "@/modulos/distribucion-arbitraria/servicios/exportador-distribucion-arbitraria";
import { ModuloTablaEstadisticaAgrupada } from "@/modulos/tablas-estadisticas/componentes/modulo-tabla-estadistica-agrupada";

export function ModuloDistribucionArbitraria() {
  return (
    <ModuloTablaEstadisticaAgrupada
      metodo="arbitraria"
      exportarExcel={exportarExcelDistribucionArbitraria}
    />
  );
}
