"use client";

import type { ReactNode } from "react";
import { ProcedimientoFormula } from "@/modulos/formulas-segundo-parcial/componentes/procedimiento-formula";
import { ResultadoFormula } from "@/modulos/formulas-segundo-parcial/componentes/resultado-formula";
import { SelectorDecimales } from "@/modulos/formulas-segundo-parcial/componentes/selector-decimales";
import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import type { ResultadoCalculadoProbabilidad } from "@/modulos/probabilidad-unidad-2/tipos";
import { VisualProbabilidad } from "@/modulos/probabilidad-unidad-2/componentes/visual-probabilidad";
import {
  manejarTeclaEntradaNumerica,
  sanitizarTextoEntradaNumerica,
} from "@/modulos/medidas-posicion/servicios/entrada-numerica-medidas-posicion";

export interface MensajeEstadoProbabilidad {
  tipo: "error" | "exito" | "info";
  texto: string;
}

export function obtenerClasesMensajeProbabilidad(
  tipo: MensajeEstadoProbabilidad["tipo"],
) {
  switch (tipo) {
    case "error":
      return "border-alerta/20 bg-alerta/8 text-alerta";
    case "exito":
      return "border-exito/20 bg-exito/8 text-exito";
    default:
      return "border-acento-principal/15 bg-acento-principal/8 text-acento-principal";
  }
}

export function SeccionProbabilidad({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-[2rem] font-semibold leading-none tracking-tight text-acento-oscuro sm:text-[2.4rem]">
            {titulo}
          </h2>
          {descripcion ? (
            <p className="max-w-4xl text-base leading-8 text-texto-secundario">
              {descripcion}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function CampoTextoProbabilidad({
  etiqueta,
  valor,
  onChange,
  placeholder,
  descripcion,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  descripcion?: string;
}) {
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
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.08rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      />
      {descripcion ? (
        <span className="text-sm leading-6 text-texto-secundario">
          {descripcion}
        </span>
      ) : null}
    </label>
  );
}

export function CampoAreaTextoProbabilidad({
  etiqueta,
  valor,
  onChange,
  placeholder,
  descripcion,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  descripcion?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.02rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <textarea
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        rows={5}
        className="rounded-[1.15rem] border border-verde-claro bg-white px-4 py-3 text-[1.02rem] leading-7 text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      />
      {descripcion ? (
        <span className="text-sm leading-6 text-texto-secundario">
          {descripcion}
        </span>
      ) : null}
    </label>
  );
}

export function CampoNumericoProbabilidad({
  etiqueta,
  valor,
  onChange,
  placeholder,
  descripcion,
  entero,
  permitirDecimal,
  permitirNegativo,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
  descripcion?: string;
  entero?: boolean;
  permitirDecimal?: boolean;
  permitirNegativo?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.02rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <input
        type="text"
        inputMode={entero ? "numeric" : "decimal"}
        value={valor}
        onKeyDown={(evento) =>
          manejarTeclaEntradaNumerica(evento, {
            permitirDecimal: !entero && permitirDecimal,
            permitirNegativo,
          })
        }
        onChange={(evento) =>
          onChange(
            sanitizarTextoEntradaNumerica(evento.target.value, {
              permitirDecimal: !entero && permitirDecimal,
              permitirNegativo,
            }),
          )
        }
        placeholder={placeholder}
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.08rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      />
      {descripcion ? (
        <span className="text-sm leading-6 text-texto-secundario">
          {descripcion}
        </span>
      ) : null}
    </label>
  );
}

export function CampoSeleccionProbabilidad({
  etiqueta,
  valor,
  onChange,
  opciones,
  descripcion,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  opciones: Array<{ valor: string; etiqueta: string }>;
  descripcion?: string;
}) {
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
      {descripcion ? (
        <span className="text-sm leading-6 text-texto-secundario">
          {descripcion}
        </span>
      ) : null}
    </label>
  );
}

export function MensajeProbabilidad({
  mensaje,
}: {
  mensaje: MensajeEstadoProbabilidad | null;
}) {
  if (!mensaje) {
    return null;
  }

  return (
    <div
      className={`rounded-[1.2rem] border px-4 py-3 text-sm leading-7 ${obtenerClasesMensajeProbabilidad(
        mensaje.tipo,
      )}`}
    >
      {mensaje.texto}
    </div>
  );
}

export function SelectorPrecisionProbabilidad({
  precision,
  onChange,
}: {
  precision: PrecisionResultado;
  onChange: (precision: PrecisionResultado) => void;
}) {
  return <SelectorDecimales precision={precision} onChange={onChange} />;
}

export function VistaResultadoProbabilidad({
  resultado,
}: {
  resultado: ResultadoCalculadoProbabilidad;
}) {
  return (
    <SeccionProbabilidad
      titulo="3. Resultado y procedimiento"
      descripcion="Aqui se muestra el resultado decimal, el porcentaje, el desarrollo del calculo y la interpretacion automatica."
    >
      <ResultadoFormula resultado={resultado.panel} />
      <ProcedimientoFormula
        pasos={resultado.panel.pasos}
        tablas={resultado.panel.tablas}
      />
      {resultado.visual ? <VisualProbabilidad visual={resultado.visual} /> : null}
    </SeccionProbabilidad>
  );
}
