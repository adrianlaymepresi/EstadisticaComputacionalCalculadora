"use client";

import { useMemo, useState } from "react";
import { CardFormula } from "@/modulos/formulas-segundo-parcial/componentes/card-formula";
import { CampoInterpretacion } from "@/modulos/formulas-segundo-parcial/componentes/campo-interpretacion";
import { ProcedimientoFormula } from "@/modulos/formulas-segundo-parcial/componentes/procedimiento-formula";
import { ResultadoFormula } from "@/modulos/formulas-segundo-parcial/componentes/resultado-formula";
import { SelectorDecimales } from "@/modulos/formulas-segundo-parcial/componentes/selector-decimales";
import { SelectorTipoProbabilidad } from "@/modulos/formulas-segundo-parcial/componentes/selector-tipo-probabilidad";
import { MENSAJE_INTERPRETACION_GENERICA } from "@/modulos/formulas-segundo-parcial/constants/mensajes.constants";
import {
  obtenerConfiguracionFormulaSegundoParcial,
  type ConfiguracionFormulaSegundoParcial,
} from "@/modulos/formulas-segundo-parcial/services/configuraciones-formulas-segundo-parcial";
import type {
  EntradaNormalizadaSegundoParcial,
  EstadoFormulaSegundoParcial,
  IdentificadorFormulaSegundoParcial,
  ResultadoFormulaSegundoParcial,
} from "@/modulos/formulas-segundo-parcial/tipos";
import {
  manejarTeclaEntradaNumerica,
  manejarTeclaListaEnteros,
  sanitizarTextoEntradaNumerica,
  sanitizarTextoListaEnteros,
} from "@/modulos/formulas-segundo-parcial/utils/entrada-numerica.util";
import {
  parsearDecimalTexto,
  parsearEnteroTexto,
  parsearListaEnterosTexto,
} from "@/modulos/formulas-segundo-parcial/utils/validar-enteros.util";

interface MensajeEstado {
  tipo: "error" | "exito" | "info";
  texto: string;
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

function crearEstadoInicial(
  configuracion: ConfiguracionFormulaSegundoParcial,
): EstadoFormulaSegundoParcial {
  return {
    valoresNumericos: Object.fromEntries(
      configuracion.camposNumericos.map((campo) => [campo.id, ""]),
    ),
    valoresListas: Object.fromEntries(
      configuracion.camposListas.map((campo) => [campo.id, ""]),
    ),
    textosInterpretacion: Object.fromEntries(
      configuracion.camposTexto.map((campo) => [campo.id, campo.valorInicial]),
    ),
    opciones: Object.fromEntries(
      configuracion.opciones.map((opcion) => [
        opcion.id,
        opcion.opciones[0]?.valor ?? "",
      ]),
    ),
    precision: {
      modo: "completo",
      decimales: 4,
    },
  };
}

function esVisible(
  opcionActual: Record<string, string>,
  visibleSi?: ConfiguracionFormulaSegundoParcial["camposNumericos"][number]["visibleSi"],
) {
  if (!visibleSi) {
    return true;
  }

  return visibleSi.valores.includes(opcionActual[visibleSi.opcionId] ?? "");
}

function describirRestriccionCampo(
  entero?: boolean,
  noNegativo?: boolean,
  positivo?: boolean,
) {
  const restricciones: string[] = [];

  restricciones.push(entero ? "solo enteros" : "admite decimales");

  if (positivo) {
    restricciones.push("debe ser mayor a 0");
  } else if (noNegativo) {
    restricciones.push("debe ser mayor o igual a 0");
  }

  return restricciones.join(" | ");
}

function normalizarEntrada(
  configuracion: ConfiguracionFormulaSegundoParcial,
  estado: EstadoFormulaSegundoParcial,
) {
  const entrada: EntradaNormalizadaSegundoParcial = {
    numericos: {},
    listas: {},
    textosInterpretacion: { ...estado.textosInterpretacion },
    opciones: { ...estado.opciones },
    precision: { ...estado.precision },
  };

  for (const campo of configuracion.camposNumericos) {
    if (!esVisible(estado.opciones, campo.visibleSi)) {
      continue;
    }

    let texto = estado.valoresNumericos[campo.id]?.trim() ?? "";
    if (
      campo.id === "x" &&
      estado.opciones["tipo-probabilidad"] === "ninguna" &&
      !texto
    ) {
      texto = "0";
    }

    if (!texto) {
      throw new Error(`Debes completar el campo ${campo.etiqueta}.`);
    }

    entrada.numericos[campo.id] = campo.entero
      ? parsearEnteroTexto(texto, campo.etiqueta, {
          minimo: campo.positivo ? 1 : campo.noNegativo ? 0 : undefined,
        })
      : parsearDecimalTexto(texto, campo.etiqueta, {
          minimo: campo.noNegativo || campo.positivo ? 0 : undefined,
          estrictoMinimo: campo.positivo,
        });
  }

  for (const campo of configuracion.camposListas) {
    entrada.listas[campo.id] = parsearListaEnterosTexto(
      estado.valoresListas[campo.id] ?? "",
      campo.etiqueta,
      campo.minimoValor ?? 2,
      campo.opcional,
    );
  }

  return entrada;
}

export function ModuloFormulaSegundoParcial({
  formulaId,
}: {
  formulaId: IdentificadorFormulaSegundoParcial;
}) {
  const configuracion = useMemo(
    () => obtenerConfiguracionFormulaSegundoParcial(formulaId),
    [formulaId],
  );
  const [estado, setEstado] = useState<EstadoFormulaSegundoParcial>(() =>
    crearEstadoInicial(configuracion),
  );
  const [resultado, setResultado] =
    useState<ResultadoFormulaSegundoParcial | null>(null);
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);

  const recalcular = () => {
    if (configuracion.tipo !== "calculo" || !configuracion.calcular) {
      return;
    }

    try {
      const entrada = normalizarEntrada(configuracion, estado);
      const nuevoResultado = configuracion.calcular(entrada);
      setResultado(nuevoResultado);
      setMensajeEstado({
        tipo: "exito",
        texto: "Calculo realizado correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular la formula del segundo parcial:", error);
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

  const restablecer = () => {
    setEstado(crearEstadoInicial(configuracion));
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

      <CardFormula
        titulo="1. Formula y contexto"
        descripcion="Revisa la expresion, las variables y las condiciones antes de ingresar los datos."
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
      </CardFormula>

      {configuracion.tipo === "informativa" ? (
        <CardFormula
          titulo="2. Recordatorio visual"
          descripcion="Esta card no calcula. Sirve para reforzar como se construyen las probabilidades acumuladas y sus complementos."
        >
          {configuracion.bloquesInformativos?.map((bloque) => (
            <div
              key={bloque.titulo}
              className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-5"
            >
              <p className="text-base font-semibold text-texto-principal">
                {bloque.titulo}
              </p>
              <div className="mt-3 flex flex-col gap-3">
                {bloque.parrafos.map((parrafo) => (
                  <p
                    key={parrafo}
                    className="rounded-[1rem] border border-verde-claro bg-white px-4 py-3 text-sm leading-7 text-texto-secundario"
                  >
                    {parrafo}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </CardFormula>
      ) : (
        <CardFormula
          titulo="2. Datos de entrada"
          descripcion="Completa los valores numericos, ajusta la precision y personaliza los textos de interpretacion si lo deseas."
        >
          <div className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4 text-sm leading-7 text-texto-secundario">
            {MENSAJE_INTERPRETACION_GENERICA}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {configuracion.camposNumericos
              .filter((campo) => esVisible(estado.opciones, campo.visibleSi))
              .map((campo) => (
                <label key={campo.id} className="flex flex-col gap-2">
                  <span className="text-[1.02rem] font-medium text-texto-secundario">
                    {campo.etiqueta}
                  </span>
                  <input
                    type="text"
                    inputMode={campo.entero ? "numeric" : "decimal"}
                    value={estado.valoresNumericos[campo.id] ?? ""}
                    onKeyDown={(evento) =>
                      manejarTeclaEntradaNumerica(evento, {
                        permitirNegativo: false,
                        permitirDecimal: !campo.entero,
                      })
                    }
                    onChange={(evento) =>
                      setEstado((estadoActual) => ({
                        ...estadoActual,
                        valoresNumericos: {
                          ...estadoActual.valoresNumericos,
                          [campo.id]: sanitizarTextoEntradaNumerica(
                            evento.target.value,
                            {
                              permitirNegativo: false,
                              permitirDecimal: !campo.entero,
                            },
                          ),
                        },
                      }))
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

          {configuracion.camposListas.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {configuracion.camposListas.map((campo) => (
                <label key={campo.id} className="flex flex-col gap-2">
                  <span className="text-[1.02rem] font-medium text-texto-secundario">
                    {campo.etiqueta}
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={estado.valoresListas[campo.id] ?? ""}
                    onKeyDown={manejarTeclaListaEnteros}
                    onChange={(evento) =>
                      setEstado((estadoActual) => ({
                        ...estadoActual,
                        valoresListas: {
                          ...estadoActual.valoresListas,
                          [campo.id]: sanitizarTextoListaEnteros(
                            evento.target.value,
                          ),
                        },
                      }))
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

          {configuracion.opciones.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {configuracion.opciones.map((opcion) => (
                <SelectorTipoProbabilidad
                  key={opcion.id}
                  etiqueta={opcion.etiqueta}
                  valor={estado.opciones[opcion.id] ?? opcion.opciones[0]?.valor ?? ""}
                  opciones={opcion.opciones}
                  onChange={(valor) =>
                    setEstado((estadoActual) => ({
                      ...estadoActual,
                      opciones: {
                        ...estadoActual.opciones,
                        [opcion.id]: valor,
                      },
                    }))
                  }
                />
              ))}
            </div>
          ) : null}

          <SelectorDecimales
            precision={estado.precision}
            onChange={(precision) =>
              setEstado((estadoActual) => ({
                ...estadoActual,
                precision,
              }))
            }
          />

          {configuracion.camposTexto.length ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {configuracion.camposTexto.map((campo) => (
                <CampoInterpretacion
                  key={campo.id}
                  etiqueta={campo.etiqueta}
                  descripcion={campo.descripcion}
                  placeholder={campo.placeholder}
                  valor={estado.textosInterpretacion[campo.id] ?? ""}
                  onChange={(valor) =>
                    setEstado((estadoActual) => ({
                      ...estadoActual,
                      textosInterpretacion: {
                        ...estadoActual.textosInterpretacion,
                        [campo.id]: valor,
                      },
                    }))
                  }
                />
              ))}
            </div>
          ) : null}

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
              onClick={restablecer}
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
        </CardFormula>
      )}

      {resultado ? (
        <CardFormula
          titulo="3. Desarrollo del calculo"
          descripcion="Aqui queda el procedimiento visible para estudiar el reemplazo numerico, las sumas parciales y la interpretacion final."
        >
          <ResultadoFormula resultado={resultado} />
          <ProcedimientoFormula
            pasos={resultado.pasos}
            tablas={resultado.tablas}
          />
        </CardFormula>
      ) : null}
    </div>
  );
}
