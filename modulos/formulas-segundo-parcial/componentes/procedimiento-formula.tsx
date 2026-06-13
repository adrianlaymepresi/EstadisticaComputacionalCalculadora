import type {
  PasoProcedimientoSegundoParcial,
  TablaProcedimientoSegundoParcial,
} from "@/modulos/formulas-segundo-parcial/tipos";

interface ProcedimientoFormulaProps {
  pasos: PasoProcedimientoSegundoParcial[];
  tablas?: TablaProcedimientoSegundoParcial[];
}

export function ProcedimientoFormula({
  pasos,
  tablas,
}: ProcedimientoFormulaProps) {
  return (
    <div className="flex flex-col gap-4">
      {pasos.map((paso) => (
        <article
          key={`${paso.titulo}-${paso.expresion}`}
          className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-5"
        >
          <p className="text-base font-semibold text-texto-principal">
            {paso.titulo}
          </p>
          <p className="mt-3 rounded-[1rem] border border-verde-claro bg-white px-4 py-3 text-[1.02rem] text-texto-principal">
            {paso.expresion}
          </p>
          {paso.resultado ? (
            <p className="mt-3 text-base font-semibold text-acento-principal">
              Resultado: {paso.resultado}
            </p>
          ) : null}
        </article>
      ))}

      {tablas?.map((tabla) => (
        <article
          key={tabla.titulo}
          className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-5"
        >
          <p className="text-base font-semibold text-texto-principal">
            {tabla.titulo}
          </p>
          <div className="mt-4 overflow-auto rounded-[1.1rem] border border-verde-claro">
            <table className="min-w-full border-separate border-spacing-0">
              <thead>
                <tr>
                  {tabla.columnas.map((columna) => (
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
                {tabla.filas.map((fila, indiceFila) => (
                  <tr key={`${tabla.titulo}-${indiceFila}`}>
                    {fila.map((celda, indiceCelda) => (
                      <td
                        key={`${tabla.titulo}-${indiceFila}-${indiceCelda}`}
                        className="border-b border-r border-black/8 bg-white px-4 py-3 text-sm leading-7 text-texto-principal"
                      >
                        {celda}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      ))}
    </div>
  );
}
