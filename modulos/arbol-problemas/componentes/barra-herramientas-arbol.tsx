interface BarraHerramientasArbolProps {
  controlesVisibles: boolean;
  zoom: number;
  onAlternarControles: () => void;
  onCentrar: () => void;
  onAjustar: () => void;
  onRestablecerZoom: () => void;
  onReordenar: () => void;
  onCargarEjemplo: () => void;
  onLimpiar: () => void;
}

function BotonHerramienta({
  texto,
  onClick,
  variante = "clara",
}: {
  texto: string;
  onClick: () => void;
  variante?: "clara" | "oscura";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-full px-4 text-sm font-semibold transition ${
        variante === "oscura"
          ? "bg-acento-principal text-white shadow-[0_12px_22px_rgba(0,98,65,0.18)] hover:bg-acento-oscuro"
          : "border border-verde-claro bg-white/95 text-texto-principal hover:border-acento-principal hover:text-acento-principal"
      }`}
    >
      {texto}
    </button>
  );
}

export function BarraHerramientasArbol({
  controlesVisibles,
  zoom,
  onAlternarControles,
  onCentrar,
  onAjustar,
  onRestablecerZoom,
  onReordenar,
  onCargarEjemplo,
  onLimpiar,
}: BarraHerramientasArbolProps) {
  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-verde-claro bg-white/90 p-4 shadow-[0_16px_34px_rgba(30,57,50,0.08)]">
      <div className="flex flex-wrap items-center gap-3">
        <BotonHerramienta
          texto={controlesVisibles ? "Ocultar controles" : "Mostrar controles"}
          onClick={onAlternarControles}
        />
        <BotonHerramienta texto="Centrar arbol" onClick={onCentrar} />
        <BotonHerramienta texto="Ajustar a pantalla" onClick={onAjustar} />
        <BotonHerramienta texto="Restablecer zoom" onClick={onRestablecerZoom} />
        <BotonHerramienta texto="Reordenar automaticamente" onClick={onReordenar} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <BotonHerramienta
          texto="Cargar ejemplo"
          onClick={onCargarEjemplo}
          variante="oscura"
        />
        <BotonHerramienta texto="Limpiar arbol" onClick={onLimpiar} />
        <span className="rounded-full bg-panel-resalte px-4 py-2 text-sm font-semibold text-acento-oscuro">
          Zoom actual: {zoom.toFixed(2)}x
        </span>
      </div>
    </div>
  );
}
