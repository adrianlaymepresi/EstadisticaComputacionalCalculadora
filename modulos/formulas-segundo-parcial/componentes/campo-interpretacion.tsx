interface CampoInterpretacionProps {
  etiqueta: string;
  descripcion: string;
  placeholder: string;
  valor: string;
  onChange: (valor: string) => void;
}

export function CampoInterpretacion({
  etiqueta,
  descripcion,
  placeholder,
  valor,
  onChange,
}: CampoInterpretacionProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.02rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <input
        type="text"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      />
      <span className="text-sm leading-6 text-texto-secundario">{descripcion}</span>
    </label>
  );
}
