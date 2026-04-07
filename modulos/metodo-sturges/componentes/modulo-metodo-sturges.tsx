"use client";

import { exportarExcelSturges } from "@/modulos/metodo-sturges/servicios/exportador-sturges";
import { ModuloTablaEstadisticaAgrupada } from "@/modulos/tablas-estadisticas/componentes/modulo-tabla-estadistica-agrupada";

export function ModuloMetodoSturges() {
  return (
    <ModuloTablaEstadisticaAgrupada
      metodo="sturges"
      exportarExcel={exportarExcelSturges}
    />
  );
}
