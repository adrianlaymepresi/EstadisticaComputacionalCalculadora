"use client";

import type { ModeloVisualTablaRegiones } from "@/modulos/probabilidad-unidad-2/tipos";

export function TablaRegionesProbabilidad({
  visual,
}: {
  visual: ModeloVisualTablaRegiones;
}) {
  return (
    <div className="rounded-[1.6rem] border border-verde-claro bg-[#f9fbf7] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {visual.titulo}
      </p>

      <div className="mt-4 overflow-auto rounded-[1.25rem] border border-verde-claro bg-white">
        <table className="min-w-[620px] border-separate border-spacing-0">
          <thead>
            <tr>
              {visual.columnas.map((columna) => (
                <th
                  key={columna}
                  className="border-b border-r border-black/8 bg-panel-resalte px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro"
                >
                  {columna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visual.filas.map((fila) => (
              <tr
                key={fila.id}
                className={fila.resaltada ? "bg-acento-principal/8" : undefined}
              >
                {fila.celdas.map((celda, indiceCelda) => (
                  <td
                    key={`${fila.id}-${indiceCelda}`}
                    className={`border-b border-r border-black/8 px-4 py-3 text-sm leading-7 text-texto-principal ${
                      fila.resaltada ? "font-semibold" : ""
                    }`}
                  >
                    {celda}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
