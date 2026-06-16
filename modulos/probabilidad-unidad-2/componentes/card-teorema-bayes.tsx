"use client";

import { useMemo, useState } from "react";
import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
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
import { calcularTeoremaBayes } from "@/modulos/probabilidad-unidad-2/servicios/bayes.service";
import type { ResultadoCalculadoProbabilidad } from "@/modulos/probabilidad-unidad-2/tipos";
import {
  normalizarNombreEvento,
  parsearValorProbabilidadSegunModo,
} from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";

const PRECISION_INICIAL: PrecisionResultado = {
  modo: "completo",
  decimales: 4,
};

const DEFINICIONES = [
  {
    simbolo: "Hi",
    descripcion:
      "Hipotesis posibles del problema. Deben cubrir los casos del analisis.",
  },
  {
    simbolo: "P(Hi)",
    descripcion:
      "Probabilidad previa de cada hipotesis antes de observar la evidencia.",
  },
  {
    simbolo: "P(E|Hi)",
    descripcion:
      "Probabilidad de la evidencia E suponiendo verdadera la hipotesis Hi.",
  },
  {
    simbolo: "P(Hi|E)",
    descripcion:
      "Probabilidad posterior de la hipotesis Hi despues de observar E.",
  },
  {
    simbolo: "P(E)",
    descripcion:
      "Probabilidad total de la evidencia, obtenida sumando las ramas compatibles.",
  },
] as const;

const CONDICIONES = [
  "Debes trabajar con entre 2 y 6 hipotesis.",
  "Las probabilidades previas deben sumar 1 o 100%, segun el modo de ingreso.",
  "Si usas cantidades base, el sistema las convierte automaticamente a probabilidades previas.",
  "Cada valor de P(E|Hi) debe estar entre 0 y 1 o entre 0% y 100%.",
  "La probabilidad total de la evidencia debe ser mayor a 0 para aplicar Bayes.",
  "El redondeo solo se aplica al resultado mostrado, no al calculo interno.",
] as const;

type ModoPreviasBayes = "cantidades" | "decimal" | "porcentaje";
type ModoCondicionalBayes = "decimal" | "porcentaje";

interface HipotesisFormularioBayes {
  nombre: string;
  previa: string;
  evidencia: string;
}

function crearHipotesisIniciales(): HipotesisFormularioBayes[] {
  return Array.from({ length: 6 }, (_, indice) => ({
    nombre: `H${indice + 1}`,
    previa: "",
    evidencia: "",
  }));
}

function obtenerEtiquetaHipotesis(indice: number) {
  return `H${indice + 1}`;
}

function obtenerDescripcionPrevias(modo: ModoPreviasBayes) {
  if (modo === "cantidades") {
    return "Ingresa cantidades enteras no negativas. El sistema las divide entre el total.";
  }

  if (modo === "porcentaje") {
    return "Ingresa porcentajes entre 0 y 100. La suma total debe ser 100%.";
  }

  return "Ingresa probabilidades decimales entre 0 y 1. La suma total debe ser 1.";
}

function obtenerDescripcionCondicionales(modo: ModoCondicionalBayes) {
  return modo === "porcentaje"
    ? "Ingresa porcentajes entre 0 y 100 para la evidencia dada cada hipotesis."
    : "Ingresa probabilidades decimales entre 0 y 1 para la evidencia dada cada hipotesis.";
}

export function CardTeoremaBayes() {
  const [precision, setPrecision] = useState<PrecisionResultado>(
    PRECISION_INICIAL,
  );
  const [contexto, setContexto] = useState("el contexto analizado");
  const [cantidadHipotesis, setCantidadHipotesis] = useState<2 | 3 | 4 | 5 | 6>(
    3,
  );
  const [modoPrevias, setModoPrevias] =
    useState<ModoPreviasBayes>("cantidades");
  const [modoCondicionales, setModoCondicionales] =
    useState<ModoCondicionalBayes>("decimal");
  const [nombreEvidencia, setNombreEvidencia] = useState("E");
  const [nombreComplemento, setNombreComplemento] = useState("No E");
  const [usarComplemento, setUsarComplemento] = useState(false);
  const [indiceHipotesisObjetivo, setIndiceHipotesisObjetivo] = useState<
    0 | 1 | 2 | 3 | 4 | 5
  >(0);
  const [hipotesis, setHipotesis] = useState<HipotesisFormularioBayes[]>(
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
        etiqueta: normalizarNombreEvento(
          hipotesisActual.nombre,
          obtenerEtiquetaHipotesis(indice),
        ),
      })),
    [hipotesisActivas],
  );

  const actualizarHipotesis = (
    indice: number,
    campo: keyof HipotesisFormularioBayes,
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

  const restablecer = () => {
    setPrecision(PRECISION_INICIAL);
    setContexto("el contexto analizado");
    setCantidadHipotesis(3);
    setModoPrevias("cantidades");
    setModoCondicionales("decimal");
    setNombreEvidencia("E");
    setNombreComplemento("No E");
    setUsarComplemento(false);
    setIndiceHipotesisObjetivo(0);
    setHipotesis(crearHipotesisIniciales());
    setResultado(null);
    setMensaje({
      tipo: "info",
      texto: "Se restablecieron los datos del teorema de Bayes.",
    });
  };

  const recalcular = () => {
    try {
      const contextoNormalizado = normalizarNombreEvento(
        contexto,
        "el contexto analizado",
      );
      const evidenciaNormalizada = normalizarNombreEvento(
        nombreEvidencia,
        "E",
      );
      const complementoNormalizado = normalizarNombreEvento(
        nombreComplemento,
        `No ${evidenciaNormalizada}`,
      );

      const hipotesisNormalizadas = hipotesisActivas.map(
        (hipotesisActual, indice) =>
          normalizarNombreEvento(
            hipotesisActual.nombre,
            obtenerEtiquetaHipotesis(indice),
          ),
      );

      const previas =
        modoPrevias === "cantidades"
          ? (() => {
              const cantidades = hipotesisActivas.map((hipotesisActual, indice) =>
                parsearEnteroTexto(
                  hipotesisActual.previa,
                  `Cantidad base de ${hipotesisNormalizadas[indice]}`,
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
                  "La suma de cantidades base debe ser mayor a 0 para construir las probabilidades previas.",
                );
              }

              return cantidades.map((cantidad) => cantidad / totalCantidades);
            })()
          : hipotesisActivas.map((hipotesisActual, indice) =>
              parsearValorProbabilidadSegunModo(
                hipotesisActual.previa,
                `Probabilidad previa de ${hipotesisNormalizadas[indice]}`,
                modoPrevias,
                {
                  permitirCero: true,
                  permitirUno: true,
                },
              ),
            );

      const condicionales = hipotesisActivas.map((hipotesisActual, indice) =>
        parsearValorProbabilidadSegunModo(
          hipotesisActual.evidencia,
          `P(${evidenciaNormalizada}|${hipotesisNormalizadas[indice]})`,
          modoCondicionales,
          {
            permitirCero: true,
            permitirUno: true,
          },
        ),
      );

      const nuevoResultado = calcularTeoremaBayes({
        precision,
        contexto: contextoNormalizado,
        nombreEvidencia: evidenciaNormalizada,
        nombreComplemento: complementoNormalizado,
        indiceHipotesisObjetivo,
        usarComplemento,
        hipotesis: hipotesisNormalizadas.map((nombre, indice) => ({
          nombre,
          probabilidadPrevia: previas[indice],
          probabilidadEvidenciaDadaHipotesis: condicionales[indice],
        })),
      });

      setResultado(nuevoResultado);
      setMensaje({
        tipo: "exito",
        texto: "El teorema de Bayes se calculo correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular el teorema de Bayes:", error);
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
          Diagrama de arbol + Bayes
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          Calcula Bayes con varias hipotesis, evidencia, complemento y apoyo
          visual tipo arbol para interpretar mejor las ramas del problema.
        </p>
      </header>

      <SeccionProbabilidad
        titulo="1. Formula, donde y validaciones"
        descripcion="Revisa la estructura del teorema, el significado de sus variables y las condiciones antes de calcular."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Formulas principales
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {[
                "P(Hi|E) = P(Hi interseccion E) / P(E)",
                "P(Hi interseccion E) = P(Hi) x P(E|Hi)",
                "P(E) = suma de todas las ramas P(Hi) x P(E|Hi)",
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
        descripcion="Configura la cantidad de hipotesis, define la evidencia y completa las probabilidades previas y condicionales."
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
              setModoPrevias(valor as ModoPreviasBayes);
              setResultado(null);
            }}
            opciones={[
              { valor: "cantidades", etiqueta: "Cantidades base" },
              { valor: "decimal", etiqueta: "Probabilidades decimales" },
              { valor: "porcentaje", etiqueta: "Porcentajes" },
            ]}
            descripcion={obtenerDescripcionPrevias(modoPrevias)}
          />
          <CampoSeleccionProbabilidad
            etiqueta="Modo de P(E|Hi)"
            valor={modoCondicionales}
            onChange={(valor) => {
              setModoCondicionales(valor as ModoCondicionalBayes);
              setResultado(null);
            }}
            opciones={[
              { valor: "decimal", etiqueta: "Probabilidades decimales" },
              { valor: "porcentaje", etiqueta: "Porcentajes" },
            ]}
            descripcion={obtenerDescripcionCondicionales(modoCondicionales)}
          />
          <div className="xl:col-span-2">
            <CampoTextoProbabilidad
              etiqueta="Contexto"
              valor={contexto}
              onChange={setContexto}
              placeholder="Ejemplo: diagnostico medico"
            />
          </div>
          <CampoTextoProbabilidad
            etiqueta="Nombre de la evidencia"
            valor={nombreEvidencia}
            onChange={setNombreEvidencia}
            placeholder="Ejemplo: prueba positiva"
          />
          <CampoTextoProbabilidad
            etiqueta="Nombre del complemento"
            valor={nombreComplemento}
            onChange={setNombreComplemento}
            placeholder="Ejemplo: prueba negativa"
          />
          <CampoSeleccionProbabilidad
            etiqueta="Consulta posterior"
            valor={usarComplemento ? "complemento" : "evidencia"}
            onChange={(valor) => setUsarComplemento(valor === "complemento")}
            opciones={[
              { valor: "evidencia", etiqueta: "P(Hi | evidencia)" },
              { valor: "complemento", etiqueta: "P(Hi | complemento)" },
            ]}
          />
          <CampoSeleccionProbabilidad
            etiqueta="Hipotesis objetivo"
            valor={String(indiceHipotesisObjetivo)}
            onChange={(valor) =>
              setIndiceHipotesisObjetivo(Number(valor) as 0 | 1 | 2 | 3 | 4 | 5)
            }
            opciones={opcionesHipotesis}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {hipotesisActivas.map((hipotesisActual, indice) => {
            const etiquetaHipotesis = obtenerEtiquetaHipotesis(indice);
            const nombreHipotesis = normalizarNombreEvento(
              hipotesisActual.nombre,
              etiquetaHipotesis,
            );

            return (
              <article
                key={`hipotesis-${indice}`}
                className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
                      Hipotesis {indice + 1}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-texto-secundario">
                      Completa el nombre de la hipotesis, su valor previo y la
                      probabilidad de la evidencia dada esa hipotesis.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <CampoTextoProbabilidad
                      etiqueta="Nombre de la hipotesis"
                      valor={hipotesisActual.nombre}
                      onChange={(valor) =>
                        actualizarHipotesis(indice, "nombre", valor)
                      }
                      placeholder={`Ejemplo: ${etiquetaHipotesis}`}
                    />
                    <CampoNumericoProbabilidad
                      etiqueta={
                        modoPrevias === "cantidades"
                          ? `Cantidad base de ${nombreHipotesis}`
                          : `P(${nombreHipotesis})`
                      }
                      valor={hipotesisActual.previa}
                      onChange={(valor) =>
                        actualizarHipotesis(indice, "previa", valor)
                      }
                      placeholder={
                        modoPrevias === "cantidades"
                          ? "Ejemplo: 35"
                          : modoPrevias === "porcentaje"
                            ? "Ejemplo: 25"
                            : "Ejemplo: 0,25"
                      }
                      entero={modoPrevias === "cantidades"}
                      permitirDecimal={modoPrevias !== "cantidades"}
                      descripcion={
                        modoPrevias === "cantidades"
                          ? "Solo enteros no negativos."
                          : modoPrevias === "porcentaje"
                            ? "Porcentaje entre 0 y 100."
                            : "Decimal entre 0 y 1."
                      }
                    />
                    <CampoNumericoProbabilidad
                      etiqueta={`P(${normalizarNombreEvento(nombreEvidencia, "E")}|${nombreHipotesis})`}
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
                      descripcion={
                        modoCondicionales === "porcentaje"
                          ? "Porcentaje entre 0 y 100."
                          : "Decimal entre 0 y 1."
                      }
                    />
                  </div>
                </div>
              </article>
            );
          })}
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
            onClick={restablecer}
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
