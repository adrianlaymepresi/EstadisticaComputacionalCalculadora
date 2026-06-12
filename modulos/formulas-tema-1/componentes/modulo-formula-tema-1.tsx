"use client";

import { useState } from "react";
import { obtenerConfiguracionFormulaTema1 } from "@/modulos/formulas-tema-1/servicios/configuraciones-formulas";
import {
  compararRacionales,
  crearRacionalDesdeEntero,
  esEnteroRacional,
  parsearRacional,
  type Racional,
} from "@/modulos/formulas-tema-1/servicios/racionales";
import type {
  EstadoCalculoFormula,
  IdentificadorFormulaTema1,
  ResultadoFormulaTema1,
} from "@/modulos/formulas-tema-1/tipos";

const cero = crearRacionalDesdeEntero(0);

interface MensajeEstado {
  tipo: "error" | "exito" | "info";
  texto: string;
}

function crearEstadoInicial(
  formulaId: IdentificadorFormulaTema1,
): EstadoCalculoFormula {
  const configuracion = obtenerConfiguracionFormulaTema1(formulaId);

  return {
    valoresNumericos: Object.fromEntries(
      configuracion.camposNumericos.map((campo) => [campo.id, ""]),
    ),
    textosInterpretacion: Object.fromEntries(
      configuracion.camposTexto.map((campo) => [campo.id, campo.valorInicial]),
    ),
    opciones: Object.fromEntries(
      (configuracion.opciones ?? []).map((opcion) => [
        opcion.id,
        opcion.opciones[0]?.valor ?? "",
      ]),
    ),
    modoPrecision: "dos-decimales",
    decimalesPersonalizados: 4,
  };
}

function obtenerClasesMensaje(tipo: MensajeEstado["tipo"]) {
  switch (tipo) {
    case "error":
      return "border-alerta/20 bg-alerta/8 text-alerta";
    case "exito":
      return "border-exito/20 bg-exito/8 text-exito";
    default:
      return "border-acento-principal/15 bg-acento-principal/8 text-acento-principal";
  }
}

function describirRestriccionCampo(
  entero?: boolean,
  noNegativo?: boolean,
  positivo?: boolean,
) {
  const restricciones: string[] = [];

  if (entero) {
    restricciones.push("solo enteros");
  } else {
    restricciones.push("admite enteros o decimales");
  }

  if (positivo) {
    restricciones.push("mayor a 0");
  } else if (noNegativo) {
    restricciones.push("mayor o igual a 0");
  }

  return restricciones.join(" | ");
}

function validarEntradas(
  formulaId: IdentificadorFormulaTema1,
  estado: EstadoCalculoFormula,
) {
  const configuracion = obtenerConfiguracionFormulaTema1(formulaId);
  const valoresRacionales: Record<string, Racional> = {};

  configuracion.camposNumericos.forEach((campo) => {
    const textoIngresado = estado.valoresNumericos[campo.id]?.trim() ?? "";

    if (!textoIngresado) {
      throw new Error(`Debes completar el campo ${campo.etiqueta}.`);
    }

    const racional = parsearRacional(textoIngresado);
    if (!racional) {
      throw new Error(
        `El campo ${campo.etiqueta} debe contener un numero valido.`,
      );
    }

    if (campo.entero && !esEnteroRacional(racional)) {
      throw new Error(`El campo ${campo.etiqueta} solo admite enteros.`);
    }

    if (campo.positivo && compararRacionales(racional, cero) <= 0) {
      throw new Error(`El campo ${campo.etiqueta} debe ser mayor a 0.`);
    }

    if (campo.noNegativo && compararRacionales(racional, cero) < 0) {
      throw new Error(
        `El campo ${campo.etiqueta} no puede tomar valores negativos.`,
      );
    }

    valoresRacionales[campo.id] = racional;
  });

  if (
    estado.modoPrecision === "personalizado" &&
    (estado.decimalesPersonalizados < 1 || estado.decimalesPersonalizados > 10)
  ) {
    throw new Error(
      "Cuando eliges precision personalizada debes usar entre 1 y 10 decimales.",
    );
  }

  return valoresRacionales;
}

function BloqueSeccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: React.ReactNode;
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

function TarjetaDato({
  titulo,
  valor,
}: {
  titulo: string;
  valor: string;
}) {
  return (
    <article className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {titulo}
      </p>
      <p className="mt-2 text-[1.35rem] font-semibold text-texto-principal">
        {valor}
      </p>
    </article>
  );
}

export function ModuloFormulaTema1({
  formulaId,
}: {
  formulaId: IdentificadorFormulaTema1;
}) {
  const configuracion = obtenerConfiguracionFormulaTema1(formulaId);
  const [estado, setEstado] = useState<EstadoCalculoFormula>(() =>
    crearEstadoInicial(formulaId),
  );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [resultado, setResultado] = useState<ResultadoFormulaTema1 | null>(null);

  const actualizarValorNumerico = (campoId: string, valor: string) => {
    setEstado((estadoActual) => ({
      ...estadoActual,
      valoresNumericos: {
        ...estadoActual.valoresNumericos,
        [campoId]: valor,
      },
    }));
  };

  const actualizarTextoInterpretacion = (campoId: string, valor: string) => {
    setEstado((estadoActual) => ({
      ...estadoActual,
      textosInterpretacion: {
        ...estadoActual.textosInterpretacion,
        [campoId]: valor,
      },
    }));
  };

  const actualizarOpcion = (opcionId: string, valor: string) => {
    setEstado((estadoActual) => ({
      ...estadoActual,
      opciones: {
        ...estadoActual.opciones,
        [opcionId]: valor,
      },
    }));
  };

  const recalcular = () => {
    try {
      const racionales = validarEntradas(formulaId, estado);
      const nuevoResultado = configuracion.calcular(estado, racionales);

      setResultado(nuevoResultado);
      setMensajeEstado({
        tipo: "exito",
        texto: "Calculo realizado correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular la formula:", error);
      setResultado(null);
      setMensajeEstado({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo calcular la formula.",
      });
    }
  };

  const restablecerCampos = () => {
    setEstado(crearEstadoInicial(formulaId));
    setResultado(null);
    setMensajeEstado({
      tipo: "info",
      texto: "Se restablecieron los campos de esta formula.",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[2.6rem] font-semibold tracking-tight text-acento-oscuro sm:text-[4rem]">
          {configuracion.titulo}
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          {configuracion.resumen}
        </p>
      </header>

      <BloqueSeccion
        titulo="1. Formula y contexto"
        descripcion="Revisa la expresion, el significado de cada variable y las condiciones que deben cumplirse antes de calcular."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Formula
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {configuracion.expresiones.map((expresion) => (
                <div
                  key={expresion}
                  className="rounded-[1.15rem] border border-verde-claro bg-white px-4 py-3 text-lg font-semibold text-texto-principal"
                >
                  {expresion}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              DONDE:
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {configuracion.definiciones.map((definicion) => (
                <div
                  key={`${definicion.simbolo}-${definicion.descripcion}`}
                  className="rounded-[1.1rem] border border-verde-claro bg-white px-4 py-3"
                >
                  <p className="text-base font-semibold text-texto-principal">
                    {definicion.simbolo}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-texto-secundario">
                    {definicion.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
            Condiciones y validaciones
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {configuracion.condiciones.map((condicion) => (
              <li
                key={condicion}
                className="rounded-[1.1rem] border border-verde-claro bg-white px-4 py-3 text-sm leading-7 text-texto-secundario"
              >
                {condicion}
              </li>
            ))}
          </ul>
        </div>
      </BloqueSeccion>

      <BloqueSeccion
        titulo="2. Datos de entrada"
        descripcion="Completa los valores, agrega etiquetas para la interpretacion si lo necesitas y define como quieres mostrar el resultado final."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {configuracion.camposNumericos.map((campo) => (
            <label key={campo.id} className="flex flex-col gap-2">
              <span className="text-[1.02rem] font-medium text-texto-secundario">
                {campo.etiqueta}
              </span>
              <input
                type="text"
                inputMode={campo.entero ? "numeric" : "decimal"}
                value={estado.valoresNumericos[campo.id] ?? ""}
                onChange={(evento) =>
                  actualizarValorNumerico(campo.id, evento.target.value)
                }
                placeholder={campo.placeholder}
                className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
              />
              <span className="text-sm leading-6 text-texto-secundario">
                {campo.descripcion}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.08em] text-acento-secundario">
                {describirRestriccionCampo(
                  campo.entero,
                  campo.noNegativo,
                  campo.positivo,
                )}
              </span>
            </label>
          ))}
        </div>

        {configuracion.camposTexto.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {configuracion.camposTexto.map((campo) => (
              <label key={campo.id} className="flex flex-col gap-2">
                <span className="text-[1.02rem] font-medium text-texto-secundario">
                  {campo.etiqueta}
                </span>
                <input
                  type="text"
                  value={estado.textosInterpretacion[campo.id] ?? ""}
                  onChange={(evento) =>
                    actualizarTextoInterpretacion(campo.id, evento.target.value)
                  }
                  placeholder={campo.placeholder}
                  className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
                />
                <span className="text-sm leading-6 text-texto-secundario">
                  {campo.descripcion}
                </span>
              </label>
            ))}
          </div>
        ) : null}

        {configuracion.opciones?.length ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {configuracion.opciones.map((opcion) => (
              <label key={opcion.id} className="flex flex-col gap-2">
                <span className="text-[1.02rem] font-medium text-texto-secundario">
                  {opcion.etiqueta}
                </span>
                <select
                  value={estado.opciones[opcion.id] ?? ""}
                  onChange={(evento) =>
                    actualizarOpcion(opcion.id, evento.target.value)
                  }
                  className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
                >
                  {opcion.opciones.map((item) => (
                    <option key={item.valor} value={item.valor}>
                      {item.etiqueta}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_220px]">
          <label className="flex flex-col gap-2">
            <span className="text-[1.02rem] font-medium text-texto-secundario">
              Precision del resultado
            </span>
            <select
              value={estado.modoPrecision}
              onChange={(evento) =>
                setEstado((estadoActual) => ({
                  ...estadoActual,
                  modoPrecision: evento.target.value as EstadoCalculoFormula["modoPrecision"],
                }))
              }
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
            >
              <option value="dos-decimales">2 decimales</option>
              <option value="completo">Decimal completo</option>
              <option value="personalizado">Personalizado</option>
            </select>
          </label>

          {estado.modoPrecision === "personalizado" ? (
            <label className="flex flex-col gap-2">
              <span className="text-[1.02rem] font-medium text-texto-secundario">
                Cantidad de decimales
              </span>
              <input
                type="number"
                min={1}
                max={10}
                value={estado.decimalesPersonalizados}
                onChange={(evento) =>
                  setEstado((estadoActual) => ({
                    ...estadoActual,
                    decimalesPersonalizados: Math.max(
                      1,
                      Math.min(10, Number(evento.target.value || 1)),
                    ),
                  }))
                }
                className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
              />
            </label>
          ) : (
            <div className="rounded-[1.15rem] border border-verde-claro bg-[#f9fbf7] px-4 py-3 text-sm leading-7 text-texto-secundario xl:self-end">
              {estado.modoPrecision === "completo"
                ? "Se mostraran todos los decimales detectables."
                : "Se aplicara el redondeo estandar a 2 decimales."}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={recalcular}
            className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.12rem] font-semibold text-white shadow-[0_12px_28px_rgba(0,98,65,0.22)] transition hover:bg-acento-oscuro"
          >
            Calcular
          </button>
          <button
            type="button"
            onClick={restablecerCampos}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.12rem] font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
          >
            Restablecer
          </button>
        </div>

        {mensajeEstado ? (
          <div
            className={`rounded-[1.15rem] border px-4 py-3 text-[1.02rem] ${obtenerClasesMensaje(
              mensajeEstado.tipo,
            )}`}
          >
            {mensajeEstado.texto}
          </div>
        ) : null}
      </BloqueSeccion>

      {resultado ? (
        <BloqueSeccion
          titulo="3. Desarrollo del calculo"
          descripcion="Aqui se conserva el proceso paso a paso y la interpretacion final para que puedas revisar exactamente como se obtuvo el resultado."
        >
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {resultado.tarjetas.map((tarjeta) => (
              <TarjetaDato
                key={`${tarjeta.titulo}-${tarjeta.valor}`}
                titulo={tarjeta.titulo}
                valor={tarjeta.valor}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {resultado.pasos.map((paso) => (
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
          </div>
        </BloqueSeccion>
      ) : null}
    </div>
  );
}
