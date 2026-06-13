import { MENSAJE_DECIMALES } from "@/modulos/formulas-segundo-parcial/constants/mensajes.constants";
import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";

interface SelectorDecimalesProps {
  precision: PrecisionResultado;
  onChange: (precision: PrecisionResultado) => void;
}

export function SelectorDecimales({
  precision,
  onChange,
}: SelectorDecimalesProps) {
  const valorActual =
    precision.modo === "completo" ? "completo" : String(precision.decimales);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[1.02rem] font-medium text-texto-secundario">
        Precision del resultado
      </label>
      <select
        value={valorActual}
        onChange={(evento) => {
          if (evento.target.value === "completo") {
            onChange({
              modo: "completo",
              decimales: precision.decimales,
            });
            return;
          }

          onChange({
            modo: "decimales",
            decimales: Number(evento.target.value),
          });
        }}
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      >
        <option value="completo">Completo</option>
        {Array.from({ length: 10 }, (_, indice) => indice + 1).map((valor) => (
          <option key={valor} value={valor}>
            {valor} decimal{valor === 1 ? "" : "es"}
          </option>
        ))}
      </select>
      <p className="text-sm leading-6 text-texto-secundario">{MENSAJE_DECIMALES}</p>
    </div>
  );
}
