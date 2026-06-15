"use client";

import { useState } from "react";
import { calcularProbabilidadClasica } from "@/modulos/probabilidad-unidad-2/servicios/probabilidad-clasica.service";
import {
  CampoAreaTextoProbabilidad,
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
import { parsearListaElementos } from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";
import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import { normalizarNombreEvento } from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";
import { parsearEnteroTexto } from "@/modulos/formulas-segundo-parcial/utils/validar-enteros.util";

const PRECISION_INICIAL: PrecisionResultado = {
  modo: "completo",
  decimales: 4,
};

const DEFINICIONES = [
  {
    simbolo: "P(E)",
    descripcion: "Probabilidad del evento E.",
  },
  {
    simbolo: "E",
    descripcion: "Evento o subconjunto del espacio muestral.",
  },
  {
    simbolo: "S",
    descripcion: "Espacio muestral completo del experimento.",
  },
  {
    simbolo: "n(E)",
    descripcion: "Numero de casos favorables.",
  },
  {
    simbolo: "n(S)",
    descripcion: "Numero total de casos posibles.",
  },
] as const;

const CONDICIONES = [
  "n(S) debe ser entero positivo y no puede valer 0.",
  "n(E) debe ser entero no negativo.",
  "n(E) no puede ser mayor que n(S).",
  "En modo listado, todos los elementos del evento deben pertenecer al espacio muestral.",
  "No se permiten letras en entradas numericas ni cantidades decimales para conteos.",
] as const;

export function CardProbabilidadClasica() {
  const [modoEntrada, setModoEntrada] = useState<"cantidades" | "listado">(
    "cantidades",
  );
  const [nombreExperimento, setNombreExperimento] = useState(
    "el experimento analizado",
  );
  const [nombreEvento, setNombreEvento] = useState("evento E");
  const [nombreUniverso, setNombreUniverso] = useState("espacio muestral");
  const [totalCasos, setTotalCasos] = useState("");
  const [casosFavorables, setCasosFavorables] = useState("");
  const [textoEspacioMuestral, setTextoEspacioMuestral] = useState("");
  const [textoEvento, setTextoEvento] = useState("");
  const [precision, setPrecision] = useState<PrecisionResultado>(
    PRECISION_INICIAL,
  );
  const [mensaje, setMensaje] = useState<MensajeEstadoProbabilidad | null>(null);
  const [resultado, setResultado] =
    useState<ResultadoCalculadoProbabilidad | null>(null);

  const recalcular = () => {
    try {
      const nombreExperimentoFinal = normalizarNombreEvento(
        nombreExperimento,
        "el experimento analizado",
      );
      const nombreEventoFinal = normalizarNombreEvento(
        nombreEvento,
        "evento E",
      );
      const nombreUniversoFinal = normalizarNombreEvento(
        nombreUniverso,
        "espacio muestral",
      );

      const nuevoResultado =
        modoEntrada === "cantidades"
          ? calcularProbabilidadClasica({
              tipoEntrada: "cantidades",
              nombreExperimento: nombreExperimentoFinal,
              nombreEvento: nombreEventoFinal,
              nombreUniverso: nombreUniversoFinal,
              totalCasos: parsearEnteroTexto(
                totalCasos,
                "n(S) - Casos posibles",
                {
                  minimo: 1,
                },
              ),
              casosFavorables: parsearEnteroTexto(
                casosFavorables,
                "n(E) - Casos favorables",
                {
                  minimo: 0,
                },
              ),
              precision,
            })
          : calcularProbabilidadClasica({
              tipoEntrada: "listado",
              nombreExperimento: nombreExperimentoFinal,
              nombreEvento: nombreEventoFinal,
              nombreUniverso: nombreUniversoFinal,
              espacioMuestral: parsearListaElementos(
                textoEspacioMuestral,
                "Espacio muestral S",
              ),
              elementosEvento: parsearListaElementos(
                textoEvento,
                "Evento E",
              ),
              precision,
            });

      setResultado(nuevoResultado);
      setMensaje({
        tipo: "exito",
        texto: "Probabilidad clasica calculada correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular la probabilidad clasica:", error);
      setResultado(null);
      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo calcular la probabilidad clasica.",
      });
    }
  };

  const limpiar = () => {
    setModoEntrada("cantidades");
    setPrecision(PRECISION_INICIAL);
    setNombreExperimento("el experimento analizado");
    setNombreEvento("evento E");
    setNombreUniverso("espacio muestral");
    setTotalCasos("");
    setCasosFavorables("");
    setTextoEspacioMuestral("");
    setTextoEvento("");
    setResultado(null);
    setMensaje({
      tipo: "info",
      texto: "Se restablecieron los datos de probabilidad clasica.",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[2.6rem] font-semibold tracking-tight text-acento-oscuro sm:text-[4rem]">
          Probabilidad clasica
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          Calcula la razon entre casos favorables y casos posibles cuando todos
          los resultados tienen la misma posibilidad de ocurrir.
        </p>
      </header>

      <SeccionProbabilidad
        titulo="1. Formula, donde y validaciones"
        descripcion="Revisa la expresion principal, el significado de las variables y las condiciones que deben cumplirse antes del calculo."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Formula principal
            </p>
            <div className="mt-4 rounded-[1.15rem] border border-verde-claro bg-white px-4 py-4 text-lg font-semibold text-texto-principal">
              P(E) = n(E) / n(S)
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
        descripcion="Puedes trabajar por cantidades o ingresando directamente el listado del espacio muestral y del evento."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CampoSeleccionProbabilidad
            etiqueta="Modo de trabajo"
            valor={modoEntrada}
            onChange={(valor) => {
              setModoEntrada(valor as "cantidades" | "listado");
              setResultado(null);
            }}
            opciones={[
              { valor: "cantidades", etiqueta: "Por cantidades" },
              { valor: "listado", etiqueta: "Por listado de espacio muestral" },
            ]}
          />
          <SelectorPrecisionProbabilidad
            precision={precision}
            onChange={setPrecision}
          />
          <CampoTextoProbabilidad
            etiqueta="Nombre del experimento"
            valor={nombreExperimento}
            onChange={setNombreExperimento}
            placeholder="Ejemplo: lanzar un dado"
          />
          <CampoTextoProbabilidad
            etiqueta="Nombre del evento"
            valor={nombreEvento}
            onChange={setNombreEvento}
            placeholder="Ejemplo: obtener numero par"
          />
          <div className="xl:col-span-2">
            <CampoTextoProbabilidad
              etiqueta="Nombre del universo"
              valor={nombreUniverso}
              onChange={setNombreUniverso}
              placeholder="Ejemplo: resultados posibles"
            />
          </div>
        </div>

        {modoEntrada === "cantidades" ? (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <CampoNumericoProbabilidad
              etiqueta="n(S) - Casos posibles"
              valor={totalCasos}
              onChange={setTotalCasos}
              placeholder="Ejemplo: 52"
              descripcion="Solo se aceptan enteros positivos."
              entero
            />
            <CampoNumericoProbabilidad
              etiqueta="n(E) - Casos favorables"
              valor={casosFavorables}
              onChange={setCasosFavorables}
              placeholder="Ejemplo: 4"
              descripcion="Solo se aceptan enteros no negativos."
              entero
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <CampoAreaTextoProbabilidad
              etiqueta="Espacio muestral S"
              valor={textoEspacioMuestral}
              onChange={setTextoEspacioMuestral}
              placeholder="1, 2, 3, 4, 5, 6"
              descripcion="Separa por comas, punto y coma, barras o saltos de linea."
            />
            <CampoAreaTextoProbabilidad
              etiqueta="Evento E"
              valor={textoEvento}
              onChange={setTextoEvento}
              placeholder="2, 4, 6"
              descripcion="Todos los elementos del evento deben estar dentro de S."
            />
          </div>
        )}

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
