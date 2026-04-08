"use client";

import { exportarExcelMaximoEntero } from "@/modulos/metodo-maximo-entero/servicios/exportador-maximo-entero";
import { ModuloTablaEstadisticaAgrupada } from "@/modulos/tablas-estadisticas/componentes/modulo-tabla-estadistica-agrupada";

export function ModuloMetodoMaximoEntero() {
  return (
    <ModuloTablaEstadisticaAgrupada
      metodo="maximo-entero"
      exportarExcel={exportarExcelMaximoEntero}
    />
  );
}
