"use client";

import { type ReactNode, useMemo, useState } from "react";
import type {
  EstadoArbolProblema,
  NodoArbolProblema,
} from "@/modulos/arbol-problemas/tipos";

interface PanelControlesArbolProps {
  controlesVisibles: boolean;
  estado: EstadoArbolProblema;
  conteos: {
    causas: number;
    efectos: number;
    derivados: number;
  };
  problemaBorrador: string;
  textoCausaNueva: string;
  textoEfectoNuevo: string;
  textoSubefectoNuevo: string;
  causaAsociadaNueva: string;
  efectoPadreNuevo: string;
  causas: NodoArbolProblema[];
  efectos: NodoArbolProblema[];
  nodoSeleccionado: {
    nodo: NodoArbolProblema;
    etiquetaVisible: string;
    etiquetaTipo: string;
  } | null;
  onProblemaBorrador: (valor: string) => void;
  onTextoCausaNueva: (valor: string) => void;
  onTextoEfectoNuevo: (valor: string) => void;
  onTextoSubefectoNuevo: (valor: string) => void;
  onCausaAsociadaNueva: (valor: string) => void;
  onEfectoPadreNuevo: (valor: string) => void;
  onActualizarProblema: () => void;
  onAgregarCausa: () => void;
  onAgregarEfecto: () => void;
  onAgregarSubefecto: () => void;
  onActualizarNodoSeleccionado: (
    cambios: Partial<NodoArbolProblema>,
    mensajeExito?: string,
  ) => void;
  onEliminarNodo: (nodoId: string) => void;
  onDeseleccionarNodo: () => void;
  onCambiarColor: (
    bloque: "causa" | "efecto" | "problema" | "flechas",
    campo: string,
    valor: string,
  ) => void;
  onAlternarRelacionesLogicas: () => void;
  onRestaurarColores: () => void;
  onCambiarFondoExportacion: (
    valor: EstadoArbolProblema["fondoExportacion"],
  ) => void;
  onCambiarColorFondoPersonalizado: (valor: string) => void;
  onExportarPng: () => void;
}

function TarjetaControl({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.6rem] border border-verde-claro bg-white/90 p-5">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-[1.15rem] font-semibold tracking-tight text-acento-oscuro">
            {titulo}
          </h3>
          {descripcion ? (
            <p className="mt-2 text-sm leading-7 text-texto-secundario">
              {descripcion}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

function CampoArea({
  etiqueta,
  valor,
  onChange,
  placeholder,
  filas = 4,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder: string;
  filas?: number;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {etiqueta}
      </span>
      <textarea
        rows={filas}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        className="rounded-[1.2rem] border border-verde-claro bg-white px-4 py-3 text-[1rem] leading-7 text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
      />
    </label>
  );
}

function BotonAccion({
  texto,
  onClick,
  variante = "primaria",
  deshabilitado = false,
}: {
  texto: string;
  onClick: () => void;
  variante?: "primaria" | "secundaria" | "alerta";
  deshabilitado?: boolean;
}) {
  const clases =
    variante === "primaria"
      ? "bg-acento-principal text-white hover:bg-acento-oscuro"
      : variante === "alerta"
        ? "border border-alerta/30 bg-alerta/10 text-alerta hover:bg-alerta/14"
        : "border border-verde-claro bg-white text-texto-principal hover:border-acento-principal hover:text-acento-principal";

  return (
    <button
      type="button"
      disabled={deshabilitado}
      onClick={onClick}
      className={`min-h-12 rounded-[1.05rem] px-4 text-sm font-semibold transition ${clases} ${deshabilitado ? "cursor-not-allowed opacity-55" : ""}`}
    >
      {texto}
    </button>
  );
}

function ControlColor({
  etiqueta,
  valor,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-[1rem] border border-verde-claro bg-[#f9fbf7] px-3 py-2">
      <span className="text-sm font-medium text-texto-principal">{etiqueta}</span>
      <input
        type="color"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        className="h-10 w-16 cursor-pointer rounded-md border border-verde-claro bg-white"
      />
    </label>
  );
}

function EditorNodoSeleccionado({
  nodoSeleccionado,
  causas,
  onActualizarNodoSeleccionado,
  onEliminarNodo,
  onDeseleccionarNodo,
}: {
  nodoSeleccionado: {
    nodo: NodoArbolProblema;
    etiquetaVisible: string;
    etiquetaTipo: string;
  };
  causas: NodoArbolProblema[];
  onActualizarNodoSeleccionado: (
    cambios: Partial<NodoArbolProblema>,
    mensajeExito?: string,
  ) => void;
  onEliminarNodo: (nodoId: string) => void;
  onDeseleccionarNodo: () => void;
}) {
  const [textoNodoEdicion, setTextoNodoEdicion] = useState(
    nodoSeleccionado.nodo.texto,
  );
  const [causaAsociadaEdicion, setCausaAsociadaEdicion] = useState(
    nodoSeleccionado.nodo.causaAsociadaId ?? "",
  );
  const esNodoAsociable =
    nodoSeleccionado.nodo.tipo === "efecto" ||
    nodoSeleccionado.nodo.tipo === "subefecto";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[1.05rem] border border-verde-claro bg-[#f9fbf7] px-4 py-3">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
          Nodo activo
        </p>
        <p className="mt-2 text-[1.05rem] font-semibold text-texto-principal">
          {nodoSeleccionado.etiquetaVisible} | {nodoSeleccionado.etiquetaTipo}
        </p>
      </div>

      <CampoArea
        etiqueta="Texto del nodo"
        valor={textoNodoEdicion}
        onChange={setTextoNodoEdicion}
        placeholder="Edita el contenido del nodo"
        filas={4}
      />

      {esNodoAsociable ? (
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
            Efecto asociado a causa
          </span>
          <select
            value={causaAsociadaEdicion}
            onChange={(evento) => setCausaAsociadaEdicion(evento.target.value)}
            className="min-h-12 rounded-[1.05rem] border border-verde-claro bg-white px-4 text-sm text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
          >
            <option value="">Sin causa asociada</option>
            {causas.map((causa, indice) => (
              <option key={causa.id} value={causa.id}>
                {`C${indice + 1} - ${causa.texto}`}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <BotonAccion
          texto="Guardar cambios del nodo"
          onClick={() =>
            onActualizarNodoSeleccionado(
              {
                texto: textoNodoEdicion,
                causaAsociadaId: esNodoAsociable
                  ? causaAsociadaEdicion || undefined
                  : undefined,
              },
              "Nodo actualizado correctamente.",
            )
          }
        />
        <BotonAccion
          texto="Quitar seleccion"
          onClick={onDeseleccionarNodo}
          variante="secundaria"
        />
        {nodoSeleccionado.nodo.tipo !== "problema" ? (
          <BotonAccion
            texto="Eliminar nodo"
            onClick={() => onEliminarNodo(nodoSeleccionado.nodo.id)}
            variante="alerta"
          />
        ) : null}
      </div>
    </div>
  );
}

export function PanelControlesArbol({
  controlesVisibles,
  estado,
  conteos,
  problemaBorrador,
  textoCausaNueva,
  textoEfectoNuevo,
  textoSubefectoNuevo,
  causaAsociadaNueva,
  efectoPadreNuevo,
  causas,
  efectos,
  nodoSeleccionado,
  onProblemaBorrador,
  onTextoCausaNueva,
  onTextoEfectoNuevo,
  onTextoSubefectoNuevo,
  onCausaAsociadaNueva,
  onEfectoPadreNuevo,
  onActualizarProblema,
  onAgregarCausa,
  onAgregarEfecto,
  onAgregarSubefecto,
  onActualizarNodoSeleccionado,
  onEliminarNodo,
  onDeseleccionarNodo,
  onCambiarColor,
  onAlternarRelacionesLogicas,
  onRestaurarColores,
  onCambiarFondoExportacion,
  onCambiarColorFondoPersonalizado,
  onExportarPng,
}: PanelControlesArbolProps) {
  const resumenAyuda = useMemo(
    () =>
      `Causas: ${conteos.causas} | Efectos: ${conteos.efectos} | Derivados: ${conteos.derivados}`,
    [conteos.causas, conteos.derivados, conteos.efectos],
  );

  if (!controlesVisibles) {
    return null;
  }

  return (
    <aside className="flex flex-col gap-5 rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-5 shadow-[var(--sombra-panel)]">
      <div className="rounded-[1.6rem] border border-verde-claro bg-panel-resalte/75 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acento-secundario">
          Arbol de problemas
        </p>
        <h2 className="mt-3 text-[2rem] font-semibold tracking-tight text-acento-oscuro">
          Panel de controles
        </h2>
        <p className="mt-3 text-sm leading-7 text-texto-secundario">
          Las causas se ubican debajo del problema central y los efectos encima.
          Puedes editar nodos, moverlos, recolorear el arbol y exportarlo a PNG.
        </p>
        <p className="mt-3 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-acento-oscuro">
          {resumenAyuda}
        </p>
      </div>

      <TarjetaControl
        titulo="Problema central"
        descripcion="Escribe el problema principal y confirmalo para usarlo como centro del arbol."
      >
        <CampoArea
          etiqueta="Problema"
          valor={problemaBorrador}
          onChange={onProblemaBorrador}
          placeholder="Describe el problema central del arbol"
        />
        <BotonAccion texto="Actualizar problema" onClick={onActualizarProblema} />
      </TarjetaControl>

      <TarjetaControl
        titulo="Agregar causa"
        descripcion="Las causas se enumeran automaticamente y se colocan debajo del problema central."
      >
        <CampoArea
          etiqueta="Nueva causa"
          valor={textoCausaNueva}
          onChange={onTextoCausaNueva}
          placeholder="Escribe la causa del problema"
          filas={3}
        />
        <BotonAccion texto="Agregar causa" onClick={onAgregarCausa} />
      </TarjetaControl>

      <TarjetaControl
        titulo="Agregar efecto"
        descripcion="Relaciona cada efecto con una causa para guardar la logica interna del arbol."
      >
        <CampoArea
          etiqueta="Nuevo efecto"
          valor={textoEfectoNuevo}
          onChange={onTextoEfectoNuevo}
          placeholder="Escribe el efecto del problema"
          filas={3}
        />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
            Causa asociada
          </span>
          <select
            value={causaAsociadaNueva}
            onChange={(evento) => onCausaAsociadaNueva(evento.target.value)}
            className="min-h-12 rounded-[1.05rem] border border-verde-claro bg-white px-4 text-sm text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
          >
            <option value="">Selecciona una causa</option>
            {causas.map((causa, indice) => (
              <option key={causa.id} value={causa.id}>
                {`C${indice + 1} - ${causa.texto}`}
              </option>
            ))}
          </select>
        </label>
        <BotonAccion
          texto="Agregar efecto"
          onClick={onAgregarEfecto}
          deshabilitado={causas.length === 0}
        />
      </TarjetaControl>

      <TarjetaControl
        titulo="Agregar efecto derivado"
        descripcion="Los efectos derivados se colocan sobre su efecto padre y mantienen la jerarquia visual."
      >
        <CampoArea
          etiqueta="Nuevo efecto derivado"
          valor={textoSubefectoNuevo}
          onChange={onTextoSubefectoNuevo}
          placeholder="Escribe el efecto derivado"
          filas={3}
        />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
            Efecto padre
          </span>
          <select
            value={efectoPadreNuevo}
            onChange={(evento) => onEfectoPadreNuevo(evento.target.value)}
            className="min-h-12 rounded-[1.05rem] border border-verde-claro bg-white px-4 text-sm text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
          >
            <option value="">Selecciona un efecto padre</option>
            {efectos.map((efecto) => (
              <option key={efecto.id} value={efecto.id}>
                {efecto.texto}
              </option>
            ))}
          </select>
        </label>
        <BotonAccion
          texto="Agregar efecto derivado"
          onClick={onAgregarSubefecto}
          deshabilitado={efectos.length === 0}
        />
      </TarjetaControl>

      <TarjetaControl
        titulo="Editar nodo seleccionado"
        descripcion="Puedes hacer clic o doble clic sobre un nodo para editarlo y eliminarlo desde aqui."
      >
        {nodoSeleccionado ? (
          <EditorNodoSeleccionado
            key={`${nodoSeleccionado.nodo.id}-${nodoSeleccionado.nodo.texto}-${nodoSeleccionado.nodo.causaAsociadaId ?? ""}`}
            nodoSeleccionado={nodoSeleccionado}
            causas={causas}
            onActualizarNodoSeleccionado={onActualizarNodoSeleccionado}
            onEliminarNodo={onEliminarNodo}
            onDeseleccionarNodo={onDeseleccionarNodo}
          />
        ) : (
          <div className="rounded-[1.2rem] border border-dashed border-verde-claro bg-[#f9fbf7] px-4 py-5 text-sm leading-7 text-texto-secundario">
            Todavia no hay un nodo seleccionado. Haz clic en una causa, efecto o
            problema dentro del diagrama para editarlo aqui.
          </div>
        )}
      </TarjetaControl>

      <TarjetaControl
        titulo="Colores del arbol"
        descripcion="Personaliza el estilo global de causas, efectos, problema central y flechas."
      >
        <div className="grid grid-cols-1 gap-3">
          <ControlColor
            etiqueta="Fondo de causas"
            valor={estado.colores.causa.colorFondo}
            onChange={(valor) => onCambiarColor("causa", "colorFondo", valor)}
          />
          <ControlColor
            etiqueta="Borde de causas"
            valor={estado.colores.causa.colorBorde}
            onChange={(valor) => onCambiarColor("causa", "colorBorde", valor)}
          />
          <ControlColor
            etiqueta="Texto de causas"
            valor={estado.colores.causa.colorTexto}
            onChange={(valor) => onCambiarColor("causa", "colorTexto", valor)}
          />
          <ControlColor
            etiqueta="Fondo de efectos"
            valor={estado.colores.efecto.colorFondo}
            onChange={(valor) => onCambiarColor("efecto", "colorFondo", valor)}
          />
          <ControlColor
            etiqueta="Borde de efectos"
            valor={estado.colores.efecto.colorBorde}
            onChange={(valor) => onCambiarColor("efecto", "colorBorde", valor)}
          />
          <ControlColor
            etiqueta="Texto de efectos"
            valor={estado.colores.efecto.colorTexto}
            onChange={(valor) => onCambiarColor("efecto", "colorTexto", valor)}
          />
          <ControlColor
            etiqueta="Fondo del problema central"
            valor={estado.colores.problema.colorFondo}
            onChange={(valor) =>
              onCambiarColor("problema", "colorFondo", valor)
            }
          />
          <ControlColor
            etiqueta="Borde del problema central"
            valor={estado.colores.problema.colorBorde}
            onChange={(valor) =>
              onCambiarColor("problema", "colorBorde", valor)
            }
          />
          <ControlColor
            etiqueta="Texto del problema central"
            valor={estado.colores.problema.colorTexto}
            onChange={(valor) =>
              onCambiarColor("problema", "colorTexto", valor)
            }
          />
          <ControlColor
            etiqueta="Color de flechas"
            valor={estado.colores.flechas}
            onChange={(valor) => onCambiarColor("flechas", "flechas", valor)}
          />
        </div>
        <BotonAccion
          texto="Restaurar colores por defecto"
          onClick={onRestaurarColores}
          variante="secundaria"
        />
      </TarjetaControl>

      <TarjetaControl
        titulo="Opciones de vista y exportacion"
        descripcion="Activa la guia logica y prepara la exportacion del diagrama a PNG."
      >
        <label className="flex items-center gap-3 rounded-[1rem] border border-verde-claro bg-[#f9fbf7] px-4 py-3">
          <input
            type="checkbox"
            checked={estado.mostrarRelacionesLogicas}
            onChange={onAlternarRelacionesLogicas}
            className="h-5 w-5 rounded border-verde-claro text-acento-principal focus:ring-acento-principal/20"
          />
          <span className="text-sm leading-7 text-texto-principal">
            Mostrar guia de relacion logica entre causa y efecto asociado
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
            Fondo del PNG
          </span>
          <select
            value={estado.fondoExportacion}
            onChange={(evento) =>
              onCambiarFondoExportacion(
                evento.target.value as EstadoArbolProblema["fondoExportacion"],
              )
            }
            className="min-h-12 rounded-[1.05rem] border border-verde-claro bg-white px-4 text-sm text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
          >
            <option value="transparente">Transparente</option>
            <option value="blanco">Blanco</option>
            <option value="personalizado">Color personalizado</option>
          </select>
        </label>

        {estado.fondoExportacion === "personalizado" ? (
          <ControlColor
            etiqueta="Color de fondo personalizado"
            valor={estado.colorFondoPersonalizado}
            onChange={onCambiarColorFondoPersonalizado}
          />
        ) : null}

        <BotonAccion texto="Exportar PNG" onClick={onExportarPng} />
      </TarjetaControl>
    </aside>
  );
}
