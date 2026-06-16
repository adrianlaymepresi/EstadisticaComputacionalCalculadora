"use client";

import { useMemo, useState } from "react";
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
  asegurarSumaCercana,
  normalizarNombreEvento,
  parsearValorProbabilidadSegunModo,
} from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";

type ModoPreviasBayesSimple = "decimal" | "porcentaje" | "cantidades";
type ModoCondicionalBayesSimple = "decimal" | "porcentaje";

interface HipotesisFormularioSimple {
  nombre: string;
  previa: string;
  evidencia: string;
}

interface RamaBayesSimple {
  nombre: string;
  previa: number;
  evidencia: number;
  conjunta: number;
  valorPreviaMostrado: string;
  valorEvidenciaMostrado: string;
}

const PRECISION_INICIAL: PrecisionResultado = {
  modo: "completo",
  decimales: 4,
};

const DEFINICIONES = [
  {
    simbolo: "Hi",
    descripcion: "Hipotesis posibles que compiten dentro del mismo problema.",
  },
  {
    simbolo: "P(Hi)",
    descripcion: "Probabilidad previa de cada hipotesis antes de ver la evidencia.",
  },
  {
    simbolo: "P(E|Hi)",
    descripcion: "Probabilidad de observar la evidencia si la hipotesis Hi fuera cierta.",
  },
  {
    simbolo: "P(Hi|E)",
    descripcion: "Probabilidad posterior de la hipotesis objetivo despues de observar E.",
  },
] as const;

const CONDICIONES = [
  "Debes trabajar con entre 2 y 6 hipotesis.",
  "Si ingresas previas en decimal, la suma debe ser 1.",
  "Si ingresas previas en porcentaje, la suma debe ser 100.",
  "Si ingresas cantidades base, todas deben ser enteras no negativas y al menos una mayor que 0.",
  "Cada P(E|Hi) debe estar entre 0 y 1 o entre 0 y 100 segun el modo elegido.",
  "El denominador total P(E) debe ser mayor a 0 para aplicar Bayes.",
] as const;

function crearHipotesisIniciales(): HipotesisFormularioSimple[] {
  return Array.from({ length: 6 }, (_, indice) => ({
    nombre: `H${indice + 1}`,
    previa: "",
    evidencia: "",
  }));
}

function formatearEntero(valor: number) {
  return formatearNumero(valor, { modo: "decimales", decimales: 0 });
}

function descripcionPrevias(modo: ModoPreviasBayesSimple) {
  if (modo === "cantidades") {
    return "Se convierten a probabilidades previas dividiendo cada cantidad entre el total.";
  }

  if (modo === "porcentaje") {
    return "Deben sumar 100 para representar todas las hipotesis.";
  }

  return "Deben sumar 1 para representar todas las hipotesis.";
}

export function CardTeoremaBayesSimple() {
  const [precision, setPrecision] = useState<PrecisionResultado>(
    PRECISION_INICIAL,
  );
  const [contexto, setContexto] = useState("el contexto analizado");
  const [modoPrevias, setModoPrevias] =
    useState<ModoPreviasBayesSimple>("cantidades");
  const [modoCondicionales, setModoCondicionales] =
    useState<ModoCondicionalBayesSimple>("decimal");
  const [cantidadHipotesis, setCantidadHipotesis] = useState<2 | 3 | 4 | 5 | 6>(
    3,
  );
  const [nombreEvidencia, setNombreEvidencia] = useState("Aprobo");
  const [indiceHipotesisObjetivo, setIndiceHipotesisObjetivo] =
    useState<0 | 1 | 2 | 3 | 4 | 5>(1);
  const [hipotesis, setHipotesis] = useState<HipotesisFormularioSimple[]>(
    crearHipotesisIniciales,
  );
  const [mensaje, setMensaje] = useState<MensajeEstadoProbabilidad | null>(null);
  const [resultado, setResultado] =
    useState<ResultadoCalculadoProbabilidad | null>(null);

  const hipotesisActivas = useMemo(
    () => hipotesis.slice(0, cantidadHipotesis),
    [cantidadHipotesis, hipotesis],
  );

  const opcionesHipotesis = useMemo(
    () =>
      hipotesisActivas.map((hipotesisActual, indice) => ({
        valor: String(indice),
        etiqueta: normalizarNombreEvento(hipotesisActual.nombre, `H${indice + 1}`),
      })),
    [hipotesisActivas],
  );

  const actualizarHipotesis = (
    indice: number,
    campo: keyof HipotesisFormularioSimple,
    valor: string,
  ) => {
    setHipotesis((estadoActual) =>
      estadoActual.map((hipotesisActual, posicion) =>
        posicion === indice
          ? { ...hipotesisActual, [campo]: valor }
          : hipotesisActual,
      ),
    );
  };

  const cargarEjemplo = () => {
    setPrecision(PRECISION_INICIAL);
    setContexto("la aprobacion por curso");
    setModoPrevias("cantidades");
    setModoCondicionales("decimal");
    setCantidadHipotesis(3);
    setNombreEvidencia("Aprobo");
    setIndiceHipotesisObjetivo(1);
    setHipotesis([
      { nombre: "Primero", previa: "90", evidencia: "0,90" },
      { nombre: "Tercero", previa: "70", evidencia: "0,85" },
      { nombre: "Quinto", previa: "40", evidencia: "0,80" },
      ...crearHipotesisIniciales().slice(3),
    ]);
    setResultado(null);
    setMensaje({
      tipo: "info",
      texto: "Se cargaron los datos de ejemplo para el teorema de Bayes.",
    });
  };

  const limpiar = () => {
    setPrecision(PRECISION_INICIAL);
    setContexto("el contexto analizado");
    setModoPrevias("cantidades");
    setModoCondicionales("decimal");
    setCantidadHipotesis(3);
    setNombreEvidencia("Aprobo");
    setIndiceHipotesisObjetivo(1);
    setHipotesis(crearHipotesisIniciales());
    setResultado(null);
    setMensaje({
      tipo: "info",
      texto: "Se restablecieron los datos del teorema de Bayes.",
    });
  };

  const recalcular = () => {
    try {
      const evidencia = normalizarNombreEvento(nombreEvidencia, "E");
      const contextoNormalizado = normalizarNombreEvento(
        contexto,
        "el contexto analizado",
      );

      const nombresHipotesis = hipotesisActivas.map((hipotesisActual, indice) =>
        normalizarNombreEvento(hipotesisActual.nombre, `H${indice + 1}`),
      );

      let conversionPrevias = "";
      let previas: number[] = [];

      if (modoPrevias === "cantidades") {
        const cantidades = hipotesisActivas.map((hipotesisActual, indice) =>
          parsearEnteroTexto(
            hipotesisActual.previa,
            `Cantidad base de ${nombresHipotesis[indice]}`,
            {
              minimo: 0,
            },
          ),
        );
        const totalCantidades = cantidades.reduce(
          (acumulado, cantidad) => acumulado + cantidad,
          0,
        );

        if (totalCantidades <= 0) {
          throw new Error(
            "La suma de cantidades base debe ser mayor a 0 para construir las previas.",
          );
        }

        previas = cantidades.map((cantidad) => cantidad / totalCantidades);
        conversionPrevias = cantidades
          .map(
            (cantidad, indice) =>
              `P(${nombresHipotesis[indice]}) = ${formatearEntero(cantidad)} / ${formatearEntero(totalCantidades)} = ${formatearDecimalProbabilidad(
                previas[indice],
                precision,
              )}`,
          )
          .join(" | ");
      } else {
        previas = hipotesisActivas.map((hipotesisActual, indice) =>
          parsearValorProbabilidadSegunModo(
            hipotesisActual.previa,
            `P(${nombresHipotesis[indice]})`,
            modoPrevias,
            {
              permitirCero: true,
              permitirUno: true,
            },
          ),
        );
        asegurarSumaCercana(
          previas,
          1,
          modoPrevias === "porcentaje"
            ? "Las probabilidades previas en porcentaje"
            : "Las probabilidades previas en decimal",
        );
        conversionPrevias =
          modoPrevias === "porcentaje"
            ? hipotesisActivas
                .map(
                  (hipotesisActual, indice) =>
                    `P(${nombresHipotesis[indice]}) = ${hipotesisActual.previa.trim()}% = ${formatearDecimalProbabilidad(
                      previas[indice],
                      precision,
                    )}`,
                )
                .join(" | ")
            : "Las probabilidades previas ya estan expresadas en forma decimal.";
      }

      const condicionales = hipotesisActivas.map((hipotesisActual, indice) =>
        parsearValorProbabilidadSegunModo(
          hipotesisActual.evidencia,
          `P(${evidencia}|${nombresHipotesis[indice]})`,
          modoCondicionales,
          {
            permitirCero: true,
            permitirUno: true,
          },
        ),
      );

      const ramas: RamaBayesSimple[] = hipotesisActivas.map(
        (hipotesisActual, indice) => ({
          nombre: nombresHipotesis[indice],
          previa: previas[indice],
          evidencia: condicionales[indice],
          conjunta: previas[indice] * condicionales[indice],
          valorPreviaMostrado:
            modoPrevias === "cantidades"
              ? formatearEntero(
                  parsearEnteroTexto(
                    hipotesisActual.previa,
                    `Cantidad base de ${nombresHipotesis[indice]}`,
                    {
                      minimo: 0,
                    },
                  ),
                )
              : modoPrevias === "porcentaje"
                ? `${hipotesisActual.previa.trim()}%`
                : hipotesisActual.previa.trim(),
          valorEvidenciaMostrado:
            modoCondicionales === "porcentaje"
              ? `${hipotesisActual.evidencia.trim()}%`
              : hipotesisActual.evidencia.trim(),
        }),
      );

      const probabilidadEvidencia = ramas.reduce(
        (acumulado, rama) => acumulado + rama.conjunta,
        0,
      );

      if (probabilidadEvidencia <= 0) {
        throw new Error(
          "La probabilidad total de la evidencia es 0, por lo tanto no se puede aplicar Bayes.",
        );
      }

      const hipotesisObjetivo = ramas[indiceHipotesisObjetivo];
      const posterior = hipotesisObjetivo.conjunta / probabilidadEvidencia;

      const resultadoPosterior = {
        panel: {
          tarjetas: [
            {
              titulo: "Hipotesis objetivo",
              valor: hipotesisObjetivo.nombre,
              detalle: `Consulta: P(${hipotesisObjetivo.nombre}|${evidencia})`,
            },
            {
              titulo: "Probabilidad de la evidencia",
              valor: formatearDecimalProbabilidad(
                probabilidadEvidencia,
                precision,
              ),
              detalle: formatearPorcentajeProbabilidad(
                probabilidadEvidencia,
                precision,
              ),
            },
            {
              titulo: "Resultado decimal",
              valor: formatearDecimalProbabilidad(posterior, precision),
              detalle: `Numerador: ${formatearDecimalProbabilidad(
                hipotesisObjetivo.conjunta,
                precision,
              )}`,
            },
            {
              titulo: "Resultado porcentual",
              valor: formatearPorcentajeProbabilidad(posterior, precision),
              detalle: `Posterior de ${hipotesisObjetivo.nombre}`,
            },
          ],
          pasos: [
            {
              titulo: "Organizar las hipotesis y la formula",
              expresion: `P(Hi|${evidencia}) = [P(${evidencia}|Hi) x P(Hi)] / suma[P(${evidencia}|Hj) x P(Hj)]`,
            },
            {
              titulo: "Calcular o confirmar las probabilidades previas",
              expresion: conversionPrevias,
            },
            {
              titulo: "Calcular cada rama P(E interseccion Hi)",
              expresion: ramas
                .map(
                  (rama) =>
                    `${rama.nombre}: ${formatearDecimalProbabilidad(
                      rama.evidencia,
                      precision,
                    )} x ${formatearDecimalProbabilidad(
                      rama.previa,
                      precision,
                    )} = ${formatearDecimalProbabilidad(
                      rama.conjunta,
                      precision,
                    )}`,
                )
                .join(" | "),
            },
            {
              titulo: "Sumar la probabilidad total de la evidencia",
              expresion: `P(${evidencia}) = ${ramas
                .map((rama) =>
                  formatearDecimalProbabilidad(rama.conjunta, precision),
                )
                .join(" + ")}`,
              resultado: formatearDecimalProbabilidad(
                probabilidadEvidencia,
                precision,
              ),
            },
            {
              titulo: "Aplicar el teorema de Bayes",
              expresion: `P(${hipotesisObjetivo.nombre}|${evidencia}) = ${formatearDecimalProbabilidad(
                hipotesisObjetivo.conjunta,
                precision,
              )} / ${formatearDecimalProbabilidad(
                probabilidadEvidencia,
                precision,
              )}`,
              resultado: formatearDecimalProbabilidad(posterior, precision),
            },
            {
              titulo: "Expresar el resultado en porcentaje",
              expresion: `${formatearDecimalProbabilidad(posterior, precision)} x 100`,
              resultado: formatearPorcentajeProbabilidad(posterior, precision),
            },
          ],
          tablas: [
            {
              titulo: "Tabla de hipotesis y ramas",
              columnas: [
                "Hipotesis",
                "Valor previo ingresado",
                "P(Hi)",
                `Valor de P(${evidencia}|Hi)`,
                `P(${evidencia}|Hi)`,
                `P(${evidencia} interseccion Hi)`,
              ],
              filas: ramas.map((rama) => [
                rama.nombre,
                rama.valorPreviaMostrado,
                formatearDecimalProbabilidad(rama.previa, precision),
                rama.valorEvidenciaMostrado,
                formatearDecimalProbabilidad(rama.evidencia, precision),
                formatearDecimalProbabilidad(rama.conjunta, precision),
              ]),
            },
          ],
          interpretacion: `La probabilidad posterior de que la hipotesis ${hipotesisObjetivo.nombre} sea la correcta despues de observar ${evidencia} en ${contextoNormalizado} es ${formatearDecimalProbabilidad(
            posterior,
            precision,
          )}, equivalente a ${formatearPorcentajeProbabilidad(
            posterior,
            precision,
          )}.`,
          observacion:
            "El denominador de Bayes se obtiene sumando todas las ramas compatibles con la misma evidencia.",
        },
      };

      setResultado(resultadoPosterior);
      setMensaje({
        tipo: "exito",
        texto: "El teorema de Bayes se calculo correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular el teorema de Bayes simple:", error);
      setResultado(null);
      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo calcular el teorema de Bayes.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[2.6rem] font-semibold tracking-tight text-acento-oscuro sm:text-[4rem]">
          Teorema de Bayes
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          Aplica Bayes de forma directa con tabla de hipotesis, evidencia
          observada, procedimiento y resultado posterior sin usar el arbol avanzado.
        </p>
      </header>

      <SeccionProbabilidad
        titulo="1. Formula, donde y validaciones"
        descripcion="Revisa la formula del teorema, las variables involucradas y las restricciones del calculo."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Formula principal
            </p>
            <div className="mt-4 rounded-[1.15rem] border border-verde-claro bg-white px-4 py-4 text-lg font-semibold text-texto-principal">
              P(Hi|E) = [P(E|Hi) x P(Hi)] / suma[P(E|Hj) x P(Hj)]
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
        descripcion="Configura la evidencia, el modo de ingreso y completa la tabla de hipotesis con sus previas y condicionales."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CampoSeleccionProbabilidad
            etiqueta="Cantidad de hipotesis"
            valor={String(cantidadHipotesis)}
            onChange={(valor) => {
              const nuevaCantidad = Number(valor) as 2 | 3 | 4 | 5 | 6;
              setCantidadHipotesis(nuevaCantidad);
              if (indiceHipotesisObjetivo >= nuevaCantidad) {
                setIndiceHipotesisObjetivo(0);
              }
              setResultado(null);
            }}
            opciones={[
              { valor: "2", etiqueta: "2 hipotesis" },
              { valor: "3", etiqueta: "3 hipotesis" },
              { valor: "4", etiqueta: "4 hipotesis" },
              { valor: "5", etiqueta: "5 hipotesis" },
              { valor: "6", etiqueta: "6 hipotesis" },
            ]}
          />
          <SelectorPrecisionProbabilidad
            precision={precision}
            onChange={setPrecision}
          />
          <CampoSeleccionProbabilidad
            etiqueta="Modo de previas"
            valor={modoPrevias}
            onChange={(valor) => {
              setModoPrevias(valor as ModoPreviasBayesSimple);
              setResultado(null);
            }}
            opciones={[
              { valor: "decimal", etiqueta: "Probabilidades decimales" },
              { valor: "porcentaje", etiqueta: "Porcentajes" },
              { valor: "cantidades", etiqueta: "Cantidades base" },
            ]}
            descripcion={descripcionPrevias(modoPrevias)}
          />
          <CampoSeleccionProbabilidad
            etiqueta="Modo de P(E|Hi)"
            valor={modoCondicionales}
            onChange={(valor) => {
              setModoCondicionales(valor as ModoCondicionalBayesSimple);
              setResultado(null);
            }}
            opciones={[
              { valor: "decimal", etiqueta: "Probabilidades decimales" },
              { valor: "porcentaje", etiqueta: "Porcentajes" },
            ]}
          />
          <CampoTextoProbabilidad
            etiqueta="Contexto"
            valor={contexto}
            onChange={setContexto}
            placeholder="Ejemplo: aprobacion por curso"
          />
          <CampoTextoProbabilidad
            etiqueta="Nombre de la evidencia"
            valor={nombreEvidencia}
            onChange={setNombreEvidencia}
            placeholder="Ejemplo: Aprobo"
          />
          <div className="xl:col-span-2">
            <CampoSeleccionProbabilidad
              etiqueta="Hipotesis objetivo"
              valor={String(indiceHipotesisObjetivo)}
              onChange={(valor) =>
                setIndiceHipotesisObjetivo(Number(valor) as 0 | 1 | 2 | 3 | 4 | 5)
              }
              opciones={opcionesHipotesis}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {hipotesisActivas.map((hipotesisActual, indice) => (
            <article
              key={`hipotesis-simple-${indice}`}
              className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5"
            >
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <CampoTextoProbabilidad
                  etiqueta={`Nombre de la hipotesis ${indice + 1}`}
                  valor={hipotesisActual.nombre}
                  onChange={(valor) =>
                    actualizarHipotesis(indice, "nombre", valor)
                  }
                  placeholder={`Ejemplo: H${indice + 1}`}
                />
                <CampoNumericoProbabilidad
                  etiqueta={
                    modoPrevias === "cantidades"
                      ? `Cantidad base de ${normalizarNombreEvento(hipotesisActual.nombre, `H${indice + 1}`)}`
                      : `P(${normalizarNombreEvento(hipotesisActual.nombre, `H${indice + 1}`)})`
                  }
                  valor={hipotesisActual.previa}
                  onChange={(valor) =>
                    actualizarHipotesis(indice, "previa", valor)
                  }
                  placeholder={
                    modoPrevias === "cantidades"
                      ? "Ejemplo: 90"
                      : modoPrevias === "porcentaje"
                        ? "Ejemplo: 45"
                        : "Ejemplo: 0,45"
                  }
                  entero={modoPrevias === "cantidades"}
                  permitirDecimal={modoPrevias !== "cantidades"}
                />
                <CampoNumericoProbabilidad
                  etiqueta={`P(${normalizarNombreEvento(nombreEvidencia, "E")}|${normalizarNombreEvento(hipotesisActual.nombre, `H${indice + 1}`)})`}
                  valor={hipotesisActual.evidencia}
                  onChange={(valor) =>
                    actualizarHipotesis(indice, "evidencia", valor)
                  }
                  placeholder={
                    modoCondicionales === "porcentaje"
                      ? "Ejemplo: 85"
                      : "Ejemplo: 0,85"
                  }
                  permitirDecimal
                />
              </div>
            </article>
          ))}
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
