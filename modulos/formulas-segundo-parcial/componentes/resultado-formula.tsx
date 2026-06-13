import type { ResultadoFormulaSegundoParcial } from "@/modulos/formulas-segundo-parcial/tipos";

function TarjetaDato({
  titulo,
  valor,
  detalle,
}: {
  titulo: string;
  valor: string;
  detalle?: string;
}) {
  return (
    <article className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {titulo}
      </p>
      <p className="mt-2 text-[1.35rem] font-semibold text-texto-principal">
        {valor}
      </p>
      {detalle ? (
        <p className="mt-2 text-sm leading-6 text-texto-secundario">{detalle}</p>
      ) : null}
    </article>
  );
}

export function ResultadoFormula({
  resultado,
}: {
  resultado: ResultadoFormulaSegundoParcial;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {resultado.tarjetas.map((tarjeta) => (
          <TarjetaDato
            key={`${tarjeta.titulo}-${tarjeta.valor}`}
            titulo={tarjeta.titulo}
            valor={tarjeta.valor}
            detalle={tarjeta.detalle}
          />
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
          Interpretacion
        </p>
        <p className="mt-3 text-base leading-8 text-texto-secundario">
          {resultado.interpretacion}
        </p>
        {resultado.observacion ? (
          <p className="mt-3 text-sm leading-7 text-acento-secundario">
            {resultado.observacion}
          </p>
        ) : null}
        {resultado.alertas?.length ? (
          <div className="mt-4 flex flex-col gap-2">
            {resultado.alertas.map((alerta) => (
              <div
                key={alerta}
                className="rounded-[1rem] border border-alerta/20 bg-alerta/8 px-4 py-3 text-sm leading-7 text-alerta"
              >
                {alerta}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
