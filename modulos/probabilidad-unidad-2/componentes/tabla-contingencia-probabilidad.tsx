"use client";

import type { ModeloVisualContingencia } from "@/modulos/probabilidad-unidad-2/tipos";

function estaResaltada(
  resaltadas: ModeloVisualContingencia["resaltadas"],
  identificador: NonNullable<ModeloVisualContingencia["resaltadas"]>[number],
) {
  return resaltadas?.includes(identificador);
}

export function TablaContingenciaProbabilidad({
  visual,
}: {
  visual: ModeloVisualContingencia;
}) {
  return (
    <div className="rounded-[1.6rem] border border-verde-claro bg-[#f9fbf7] p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {visual.titulo}
      </p>

      <div className="mt-4 overflow-auto rounded-[1.25rem] border border-verde-claro bg-white">
        <table className="min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="border-b border-r border-black/8 bg-panel-resalte px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro">
                {visual.nombreFilas} \ {visual.nombreColumnas}
              </th>
              {visual.columnas.map((columna, indice) => (
                <th
                  key={columna}
                  className={`border-b border-r border-black/8 px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] ${
                    estaResaltada(visual.resaltadas, indice === 0 ? "col1" : "col2")
                      ? "bg-acento-principal/12 text-acento-principal"
                      : "bg-panel-resalte text-acento-oscuro"
                  }`}
                >
                  {columna}
                </th>
              ))}
              <th className="border-b border-r border-black/8 bg-panel-resalte px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro">
                Total fila
              </th>
            </tr>
          </thead>
          <tbody>
            {visual.filas.map((fila, indiceFila) => (
              <tr key={fila}>
                <td
                  className={`border-b border-r border-black/8 px-4 py-3 text-sm font-semibold ${
                    estaResaltada(visual.resaltadas, indiceFila === 0 ? "fila1" : "fila2")
                      ? "bg-acento-principal/12 text-acento-principal"
                      : "text-texto-principal"
                  }`}
                >
                  {fila}
                </td>
                {visual.celdas[indiceFila].map((celda, indiceColumna) => {
                  const idCelda =
                    indiceFila === 0
                      ? indiceColumna === 0
                        ? "f1c1"
                        : "f1c2"
                      : indiceColumna === 0
                        ? "f2c1"
                        : "f2c2";
                  const resaltada = estaResaltada(visual.resaltadas, idCelda);

                  return (
                    <td
                      key={`${fila}-${idCelda}`}
                      className={`border-b border-r border-black/8 px-4 py-3 text-sm ${
                        resaltada
                          ? "bg-acento-principal/10 font-semibold text-acento-principal"
                          : "text-texto-principal"
                      }`}
                    >
                      {celda}
                    </td>
                  );
                })}
                <td className="border-b border-r border-black/8 px-4 py-3 text-sm font-semibold text-texto-principal">
                  {visual.totalesFila[indiceFila]}
                </td>
              </tr>
            ))}
            <tr>
              <td className="border-b border-r border-black/8 bg-panel-resalte px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro">
                Total columna
              </td>
              {visual.totalesColumna.map((total, indice) => (
                <td
                  key={`total-col-${indice}`}
                  className="border-b border-r border-black/8 px-4 py-3 text-sm font-semibold text-texto-principal"
                >
                  {total}
                </td>
              ))}
              <td className="border-b border-r border-black/8 px-4 py-3 text-sm font-semibold text-acento-principal">
                {visual.totalGeneral}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
