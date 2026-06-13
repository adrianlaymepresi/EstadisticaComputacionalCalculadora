interface SelectorTipoProbabilidadProps {
  etiqueta: string;
  valor: string;
  opciones: Array<{
    valor: string;
    etiqueta: string;
  }>;
  onChange: (valor: string) => void;
}

export function SelectorTipoProbabilidad({
  etiqueta,
  valor,
  opciones,
  onChange,
}: SelectorTipoProbabilidadProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.02rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <select
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
    </label>
  );
}
