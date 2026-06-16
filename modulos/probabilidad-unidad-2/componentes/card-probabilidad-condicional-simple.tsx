"use client";

import { useState } from "react";
import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import { formatearNumero } from "@/modulos/formulas-segundo-parcial/utils/formatear-numero.util";
import { parsearEnteroTexto } from "@/modulos/formulas-segundo-parcial/utils/validar-enteros.util";
import {
  CampoNumericoProbabilidad,
  CampoSeleccionProbabilidad,
  CampoTextoProbabilidad,
  MensajeProbabilidad,
  type MensajeEstadoProbabilidad,
  SeccionProbabilidad,
  SelectorPrecisionProbabilidad,
  VistaResultadoProbabilidad,
} from "@/modulos/probabilidad-unidad-2/componentes/comunes-probabilidad";
import type { ResultadoCalculadoProbabilidad } from "@/modulos/probabilidad-unidad-2/tipos";
import {
  formatearDecimalProbabilidad,
  formatearPorcentajeProbabilidad,
} from "@/modulos/probabilidad-unidad-2/utilidades/formatear-probabilidad.util";
import {
  normalizarNombreEvento,
  parsearValorProbabilidadSegunModo,
} from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";

type ModoCondicionalSimple = "decimal" | "porcentaje" | "cantidades";
type TipoConsultaCondicional = "a-dado-b" | "b-dado-a";

const PRECISION_INICIAL: PrecisionResultado = {
  modo: "completo",
  decimales: 4,
};

const DEFINICIONES = [
  {
    simbolo: "P(A|B)",
    descripcion: "Probabilidad de que ocurra A sabiendo que ya ocurrio B.",
  },
  {
    simbolo: "P(B|A)",
    descripcion: "Probabilidad de que ocurra B sabiendo que ya ocurrio A.",
  },
  {
    simbolo: "P(A interseccion B)",
    descripcion: "Probabilidad de que ambos eventos ocurran al mismo tiempo.",
  },
  {
    simbolo: "P(A) y P(B)",
    descripcion: "Probabilidades individuales de los eventos A y B.",
  },
] as const;

const CONDICIONES = [
  "No se permiten campos vacios en la formula.",
  "En modo decimal, todos los valores deben estar entre 0 y 1.",
  "En modo porcentaje, todos los valores deben estar entre 0 y 100.",
  "En modo cantidades, se aceptan solo enteros no negativos y el universo debe ser entero positivo.",
  "La interseccion no puede ser mayor que A ni mayor que B.",
  "El evento condicionante debe ser mayor a 0 para evitar division entre 0.",
] as const;

function formatearEntero(valor: number) {
  return formatearNumero(valor, { modo: "decimales", decimales: 0 });
}

function obtenerEtiquetaConsulta(
  tipoConsulta: TipoConsultaCondicional,
  nombreA: string,
  nombreB: string,
) {
  return tipoConsulta === "a-dado-b"
    ? `P(${nombreA}|${nombreB})`
    : `P(${nombreB}|${nombreA})`;
}

function obtenerDenominadorEtiqueta(
  tipoConsulta: TipoConsultaCondicional,
  nombreA: string,
  nombreB: string,
) {
  return tipoConsulta === "a-dado-b" ? `P(${nombreB})` : `P(${nombreA})`;
}

function obtenerFraccionCantidades(
  tipoConsulta: TipoConsultaCondicional,
  cantidadA: number,
  cantidadB: number,
  cantidadInterseccion: number,
) {
  return tipoConsulta === "a-dado-b"
    ? `${formatearEntero(cantidadInterseccion)} / ${formatearEntero(cantidadB)}`
    : `${formatearEntero(cantidadInterseccion)} / ${formatearEntero(cantidadA)}`;
}

export function CardProbabilidadCondicionalSimple() {
  const [modo, setModo] = useState<ModoCondicionalSimple>("decimal");
  const [precision, setPrecision] = useState<PrecisionResultado>(
    PRECISION_INICIAL,
  );
  const [contexto, setContexto] = useState("el contexto analizado");
  const [nombreA, setNombreA] = useState("A");
  const [nombreB, setNombreB] = useState("B");
  const [tipoConsulta, setTipoConsulta] =
    useState<TipoConsultaCondicional>("a-dado-b");
  const [universo, setUniverso] = useState("");
  const [valorA, setValorA] = useState("");
  const [valorB, setValorB] = useState("");
  const [valorInterseccion, setValorInterseccion] = useState("");
  const [mensaje, setMensaje] = useState<MensajeEstadoProbabilidad | null>(null);
  const [resultado, setResultado] =
    useState<ResultadoCalculadoProbabilidad | null>(null);

  const cargarEjemplo = () => {
    setModo("decimal");
    setPrecision(PRECISION_INICIAL);
    setContexto("los estudiantes evaluados");
    setNombreA("Estadistica");
    setNombreB("Metodologia");
    setTipoConsulta("a-dado-b");
    setUniverso("");
    setValorA("0,55");
    setValorB("0,50");
    setValorInterseccion("0,15");
    setResultado(null);
    setMensaje({
      tipo: "info",
      texto:
        "Se cargaron los datos de ejemplo para calcular la probabilidad condicional.",
    });
  };

  const limpiar = () => {
    setModo("decimal");
    setPrecision(PRECISION_INICIAL);
    setContexto("el contexto analizado");
    setNombreA("A");
    setNombreB("B");
    setTipoConsulta("a-dado-b");
    setUniverso("");
    setValorA("");
    setValorB("");
    setValorInterseccion("");
    setResultado(null);
    setMensaje({
      tipo: "info",
      texto: "Se restablecieron los datos de probabilidad condicional.",
    });
  };

  const recalcular = () => {
    try {
      const eventoA = normalizarNombreEvento(nombreA, "A");
      const eventoB = normalizarNombreEvento(nombreB, "B");
      const contextoNormalizado = normalizarNombreEvento(
        contexto,
        "el contexto analizado",
      );

      const etiquetaConsulta = obtenerEtiquetaConsulta(
        tipoConsulta,
        eventoA,
        eventoB,
      );
      const etiquetaDenominador = obtenerDenominadorEtiqueta(
        tipoConsulta,
        eventoA,
        eventoB,
      );

      let probabilidadA = 0;
      let probabilidadB = 0;
      let probabilidadInterseccion = 0;
      let totalUniverso = 0;
      let conversiones = "";
      let detalleCantidad = "";
      let observacion = "";

      if (modo === "cantidades") {
        totalUniverso = parsearEnteroTexto(universo, "Universo U", {
          minimo: 1,
        });
        const cantidadA = parsearEnteroTexto(valorA, `n(${eventoA})`, {
          minimo: 0,
          maximo: totalUniverso,
        });
        const cantidadB = parsearEnteroTexto(valorB, `n(${eventoB})`, {
          minimo: 0,
          maximo: totalUniverso,
        });
        const cantidadInterseccion = parsearEnteroTexto(
          valorInterseccion,
          `n(${eventoA} interseccion ${eventoB})`,
          {
            minimo: 0,
            maximo: totalUniverso,
          },
        );

        if (cantidadInterseccion > cantidadA || cantidadInterseccion > cantidadB) {
          throw new Error(
            `La interseccion entre ${eventoA} y ${eventoB} no puede ser mayor que cada evento individual.`,
          );
        }

        probabilidadA = cantidadA / totalUniverso;
        probabilidadB = cantidadB / totalUniverso;
        probabilidadInterseccion = cantidadInterseccion / totalUniverso;
        detalleCantidad = obtenerFraccionCantidades(
          tipoConsulta,
          cantidadA,
          cantidadB,
          cantidadInterseccion,
        );
        conversiones = [
          `P(${eventoA}) = ${formatearEntero(cantidadA)} / ${formatearEntero(totalUniverso)} = ${formatearDecimalProbabilidad(probabilidadA, precision)}`,
          `P(${eventoB}) = ${formatearEntero(cantidadB)} / ${formatearEntero(totalUniverso)} = ${formatearDecimalProbabilidad(probabilidadB, precision)}`,
          `P(${eventoA} interseccion ${eventoB}) = ${formatearEntero(cantidadInterseccion)} / ${formatearEntero(totalUniverso)} = ${formatearDecimalProbabilidad(probabilidadInterseccion, precision)}`,
        ].join(" | ");
        observacion =
          "En modo cantidades, la division entre probabilidades del mismo universo produce la misma razon que usar directamente las cantidades.";
      } else {
        probabilidadA = parsearValorProbabilidadSegunModo(
          valorA,
          `P(${eventoA})`,
          modo,
          {
            permitirCero: true,
            permitirUno: true,
          },
        );
        probabilidadB = parsearValorProbabilidadSegunModo(
          valorB,
          `P(${eventoB})`,
          modo,
          {
            permitirCero: true,
            permitirUno: true,
          },
        );
        probabilidadInterseccion = parsearValorProbabilidadSegunModo(
          valorInterseccion,
          `P(${eventoA} interseccion ${eventoB})`,
          modo,
          {
            permitirCero: true,
            permitirUno: true,
          },
        );

        if (
          probabilidadInterseccion > probabilidadA + 1e-10 ||
          probabilidadInterseccion > probabilidadB + 1e-10
        ) {
          throw new Error(
            `La interseccion entre ${eventoA} y ${eventoB} no puede ser mayor que P(${eventoA}) ni que P(${eventoB}).`,
          );
        }

        conversiones =
          modo === "porcentaje"
            ? [
                `P(${eventoA}) = ${valorA.trim()}% = ${formatearDecimalProbabilidad(probabilidadA, precision)}`,
                `P(${eventoB}) = ${valorB.trim()}% = ${formatearDecimalProbabilidad(probabilidadB, precision)}`,
                `P(${eventoA} interseccion ${eventoB}) = ${valorInterseccion.trim()}% = ${formatearDecimalProbabilidad(probabilidadInterseccion, precision)}`,
              ].join(" | ")
            : "Los datos ya se encuentran en forma decimal, por lo tanto no requieren conversion adicional.";
      }

      const denominador =
        tipoConsulta === "a-dado-b" ? probabilidadB : probabilidadA;

      if (denominador <= 0) {
        throw new Error(
          `El denominador ${etiquetaDenominador} debe ser mayor a 0 para calcular ${etiquetaConsulta}.`,
        );
      }

      const resultadoDecimal = probabilidadInterseccion / denominador;
      const sustitucion = `${etiquetaConsulta} = ${formatearDecimalProbabilidad(probabilidadInterseccion, precision)} / ${formatearDecimalProbabilidad(denominador, precision)}`;
      const interpretacion =
        tipoConsulta === "a-dado-b"
          ? `La probabilidad de que ocurra ${eventoA} sabiendo que ya ocurrio ${eventoB} en ${contextoNormalizado} es ${formatearDecimalProbabilidad(
              resultadoDecimal,
              precision,
            )}, equivalente a ${formatearPorcentajeProbabilidad(
              resultadoDecimal,
              precision,
            )}.`
          : `La probabilidad de que ocurra ${eventoB} sabiendo que ya ocurrio ${eventoA} en ${contextoNormalizado} es ${formatearDecimalProbabilidad(
              resultadoDecimal,
              precision,
            )}, equivalente a ${formatearPorcentajeProbabilidad(
              resultadoDecimal,
              precision,
            )}.`;

      setResultado({
        panel: {
          tarjetas: [
            {
              titulo: "Consulta",
              valor: etiquetaConsulta,
              detalle: `Contexto: ${contextoNormalizado}`,
            },
            {
              titulo: "Resultado decimal",
              valor: formatearDecimalProbabilidad(resultadoDecimal, precision),
              detalle:
                modo === "cantidades"
                  ? `Fraccion equivalente: ${detalleCantidad}`
                  : `Denominador usado: ${etiquetaDenominador}`,
            },
            {
              titulo: "Resultado porcentual",
              valor: formatearPorcentajeProbabilidad(resultadoDecimal, precision),
              detalle: `Interseccion usada: ${formatearDecimalProbabilidad(
                probabilidadInterseccion,
                precision,
              )}`,
            },
          ],
          pasos: [
            {
              titulo: "Mostrar la formula principal",
              expresion:
                tipoConsulta === "a-dado-b"
                  ? `P(${eventoA}|${eventoB}) = P(${eventoA} interseccion ${eventoB}) / P(${eventoB})`
                  : `P(${eventoB}|${eventoA}) = P(${eventoA} interseccion ${eventoB}) / P(${eventoA})`,
            },
            {
              titulo: "Convertir los datos cuando corresponde",
              expresion: conversiones,
            },
            {
              titulo: "Reemplazar los valores en la formula",
              expresion: sustitucion,
            },
            {
              titulo: "Calcular el resultado decimal",
              expresion: sustitucion,
              resultado: formatearDecimalProbabilidad(resultadoDecimal, precision),
            },
            {
              titulo: "Expresar el resultado en porcentaje",
              expresion: `${formatearDecimalProbabilidad(resultadoDecimal, precision)} x 100`,
              resultado: formatearPorcentajeProbabilidad(
                resultadoDecimal,
                precision,
              ),
            },
          ],
          interpretacion,
          observacion,
        },
      });
      setMensaje({
        tipo: "exito",
        texto: "La probabilidad condicional simple se calculo correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular la probabilidad condicional simple:", error);
      setResultado(null);
      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo calcular la probabilidad condicional simple.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[2.6rem] font-semibold tracking-tight text-acento-oscuro sm:text-[4rem]">
          Probabilidad condicional
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          Aplica la formula directa de probabilidad condicional para resolver
          P(A|B) o P(B|A) con probabilidades decimales, porcentajes o cantidades.
        </p>
      </header>

      <SeccionProbabilidad
        titulo="1. Formula, donde y validaciones"
        descripcion="Revisa la expresion principal, el significado de sus variables y las restricciones antes de calcular."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Formulas principales
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {[
                "P(A|B) = P(A interseccion B) / P(B)",
                "P(B|A) = P(A interseccion B) / P(A)",
              ].map((formula) => (
                <div
                  key={formula}
                  className="rounded-[1.1rem] border border-verde-claro bg-white px-4 py-3 text-base font-semibold text-texto-principal"
                >
                  {formula}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Donde
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {DEFINICIONES.map((definicion) => (
                <div
                  key={definicion.simbolo}
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
            Validaciones
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {CONDICIONES.map((condicion) => (
              <li
                key={condicion}
                className="rounded-[1.1rem] border border-verde-claro bg-white px-4 py-3 text-sm leading-7 text-texto-secundario"
              >
                {condicion}
              </li>
            ))}
          </ul>
        </div>
      </SeccionProbabilidad>

      <SeccionProbabilidad
        titulo="2. Entradas"
        descripcion="Define los nombres de los eventos, el tipo de consulta, el modo de ingreso y luego completa los valores necesarios."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CampoSeleccionProbabilidad
            etiqueta="Tipo de consulta"
            valor={tipoConsulta}
            onChange={(valor) => {
              setTipoConsulta(valor as TipoConsultaCondicional);
              setResultado(null);
            }}
            opciones={[
              { valor: "a-dado-b", etiqueta: "Calcular P(A|B)" },
              { valor: "b-dado-a", etiqueta: "Calcular P(B|A)" },
            ]}
          />
          <SelectorPrecisionProbabilidad
            precision={precision}
            onChange={setPrecision}
          />
          <CampoSeleccionProbabilidad
            etiqueta="Modo de ingreso"
            valor={modo}
            onChange={(valor) => {
              setModo(valor as ModoCondicionalSimple);
              setResultado(null);
            }}
            opciones={[
              { valor: "decimal", etiqueta: "Probabilidades decimales" },
              { valor: "porcentaje", etiqueta: "Porcentajes" },
              { valor: "cantidades", etiqueta: "Cantidades" },
            ]}
          />
          <CampoTextoProbabilidad
            etiqueta="Contexto"
            valor={contexto}
            onChange={setContexto}
            placeholder="Ejemplo: estudiantes evaluados"
          />
          <CampoTextoProbabilidad
            etiqueta="Nombre del evento A"
            valor={nombreA}
            onChange={setNombreA}
            placeholder="Ejemplo: Estadistica"
          />
          <CampoTextoProbabilidad
            etiqueta="Nombre del evento B"
            valor={nombreB}
            onChange={setNombreB}
            placeholder="Ejemplo: Metodologia"
          />

          {modo === "cantidades" ? (
            <div className="xl:col-span-2">
              <CampoNumericoProbabilidad
                etiqueta="Total del universo U"
                valor={universo}
                onChange={setUniverso}
                placeholder="Ejemplo: 100"
                descripcion="Solo enteros positivos."
                entero
              />
            </div>
          ) : null}

          <CampoNumericoProbabilidad
            etiqueta={
              modo === "cantidades"
                ? `n(${normalizarNombreEvento(nombreA, "A")})`
                : `P(${normalizarNombreEvento(nombreA, "A")})`
            }
            valor={valorA}
            onChange={setValorA}
            placeholder={
              modo === "cantidades"
                ? "Ejemplo: 55"
                : modo === "porcentaje"
                  ? "Ejemplo: 55"
                  : "Ejemplo: 0,55"
            }
            descripcion={
              modo === "cantidades"
                ? "Cantidad entera no negativa."
                : modo === "porcentaje"
                  ? "Valor entre 0 y 100."
                  : "Valor entre 0 y 1."
            }
            entero={modo === "cantidades"}
            permitirDecimal={modo !== "cantidades"}
          />
          <CampoNumericoProbabilidad
            etiqueta={
              modo === "cantidades"
                ? `n(${normalizarNombreEvento(nombreB, "B")})`
                : `P(${normalizarNombreEvento(nombreB, "B")})`
            }
            valor={valorB}
            onChange={setValorB}
            placeholder={
              modo === "cantidades"
                ? "Ejemplo: 50"
                : modo === "porcentaje"
                  ? "Ejemplo: 50"
                  : "Ejemplo: 0,50"
            }
            descripcion={
              modo === "cantidades"
                ? "Cantidad entera no negativa."
                : modo === "porcentaje"
                  ? "Valor entre 0 y 100."
                  : "Valor entre 0 y 1."
            }
            entero={modo === "cantidades"}
            permitirDecimal={modo !== "cantidades"}
          />
          <div className="xl:col-span-2">
            <CampoNumericoProbabilidad
              etiqueta={
                modo === "cantidades"
                  ? `n(${normalizarNombreEvento(nombreA, "A")} interseccion ${normalizarNombreEvento(nombreB, "B")})`
                  : `P(${normalizarNombreEvento(nombreA, "A")} interseccion ${normalizarNombreEvento(nombreB, "B")})`
              }
              valor={valorInterseccion}
              onChange={setValorInterseccion}
              placeholder={
                modo === "cantidades"
                  ? "Ejemplo: 15"
                  : modo === "porcentaje"
                    ? "Ejemplo: 15"
                    : "Ejemplo: 0,15"
              }
              descripcion={
                modo === "cantidades"
                  ? "Cantidad entera no negativa."
                  : modo === "porcentaje"
                    ? "Valor entre 0 y 100."
                    : "Valor entre 0 y 1."
              }
              entero={modo === "cantidades"}
              permitirDecimal={modo !== "cantidades"}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={recalcular}
            className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.05rem] font-semibold text-white transition hover:bg-acento-oscuro"
          >
            Calcular
          </button>
          <button
            type="button"
            onClick={cargarEjemplo}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.05rem] font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
          >
            Cargar ejemplo
          </button>
          <button
            type="button"
            onClick={limpiar}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.05rem] font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
          >
            Limpiar
          </button>
        </div>

        <MensajeProbabilidad mensaje={mensaje} />
      </SeccionProbabilidad>

      {resultado ? <VistaResultadoProbabilidad resultado={resultado} /> : null}
    </div>
  );
}
