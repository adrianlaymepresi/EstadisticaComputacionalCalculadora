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
import {
  calcularProbabilidadCondicionalDesdeContingencia,
  calcularProbabilidadCondicionalDesdeEventos,
} from "@/modulos/probabilidad-unidad-2/servicios/probabilidad-condicional.service";
import type {
  ModoValorProbabilidad,
  ResultadoCalculadoProbabilidad,
} from "@/modulos/probabilidad-unidad-2/tipos";
import {
  normalizarNombreEvento,
  parsearUniversoSegunModo,
  parsearValorProbabilidadSegunModo,
} from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";

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
    simbolo: "P(A interseccion B)",
    descripcion: "Probabilidad conjunta de que ocurran ambos eventos.",
  },
  {
    simbolo: "P(B)",
    descripcion: "Probabilidad del evento condicionante o nuevo universo de analisis.",
  },
  {
    simbolo: "Tabla 2x2",
    descripcion: "Permite calcular condicionales desde frecuencias observadas por fila y columna.",
  },
] as const;

const CONDICIONES = [
  "El evento condicionante debe tener valor mayor a 0.",
  "Si trabajas con cantidades, todos los datos deben ser enteros no negativos.",
  "Si trabajas con probabilidades, los valores deben estar entre 0 y 1.",
  "Si trabajas con porcentajes, los valores deben estar entre 0 y 100.",
  "La interseccion no puede ser mayor que los eventos que la contienen.",
  "En tabla de contingencia, la celda favorable se divide entre el total de la fila o columna condicionante.",
] as const;

type FuenteCondicional = "eventos" | "contingencia";
type ClaveEvento = "A" | "B" | "C";
type TipoVariableContingencia = "fila" | "columna";

function crearValoresEventosIniciales() {
  return {
    a: "",
    b: "",
    c: "",
    ab: "",
    ac: "",
    bc: "",
    abc: "",
  };
}

function obtenerOpcionesEventos(cantidadEventos: 2 | 3, nombres: string[]) {
  return (cantidadEventos === 2 ? ["A", "B"] : ["A", "B", "C"]).map((clave) => {
    const indice = clave === "A" ? 0 : clave === "B" ? 1 : 2;
    return {
      valor: clave,
      etiqueta: normalizarNombreEvento(nombres[indice], clave),
    };
  });
}

function obtenerOpcionesCategoriasContingencia(
  tipo: TipoVariableContingencia,
  filas: [string, string],
  columnas: [string, string],
) {
  const origen = tipo === "fila" ? filas : columnas;
  return origen.map((valor, indice) => ({
    valor: `${indice}`,
    etiqueta: normalizarNombreEvento(
      valor,
      `${tipo === "fila" ? "Fila" : "Columna"} ${indice + 1}`,
    ),
  }));
}

export function CardProbabilidadCondicional() {
  const [fuente, setFuente] = useState<FuenteCondicional>("eventos");
  const [modo, setModo] = useState<ModoValorProbabilidad>("cantidades");
  const [cantidadEventos, setCantidadEventos] = useState<2 | 3>(2);
  const [precision, setPrecision] = useState<PrecisionResultado>(
    PRECISION_INICIAL,
  );
  const [contexto, setContexto] = useState("el contexto analizado");
  const [universo, setUniverso] = useState("");
  const [nombresEventos, setNombresEventos] = useState(["A", "B", "C"]);
  const [valoresEventos, setValoresEventos] = useState(
    crearValoresEventosIniciales,
  );
  const [objetivoEvento, setObjetivoEvento] = useState<ClaveEvento>("A");
  const [condicionanteEvento, setCondicionanteEvento] =
    useState<ClaveEvento>("B");

  const [nombreFilas, setNombreFilas] = useState("Variable de filas");
  const [nombreColumnas, setNombreColumnas] = useState("Variable de columnas");
  const [filasContingencia, setFilasContingencia] = useState<[string, string]>([
    "Fila 1",
    "Fila 2",
  ]);
  const [columnasContingencia, setColumnasContingencia] = useState<
    [string, string]
  >(["Columna 1", "Columna 2"]);
  const [celdasContingencia, setCeldasContingencia] = useState({
    f1c1: "",
    f1c2: "",
    f2c1: "",
    f2c2: "",
  });
  const [tipoObjetivoContingencia, setTipoObjetivoContingencia] =
    useState<TipoVariableContingencia>("fila");
  const [indiceObjetivoContingencia, setIndiceObjetivoContingencia] =
    useState<0 | 1>(0);
  const [tipoCondicionanteContingencia, setTipoCondicionanteContingencia] =
    useState<TipoVariableContingencia>("columna");
  const [indiceCondicionanteContingencia, setIndiceCondicionanteContingencia] =
    useState<0 | 1>(0);
  const [mensaje, setMensaje] = useState<MensajeEstadoProbabilidad | null>(null);
  const [resultado, setResultado] =
    useState<ResultadoCalculadoProbabilidad | null>(null);

  const opcionesEventos = useMemo(
    () => obtenerOpcionesEventos(cantidadEventos, nombresEventos),
    [cantidadEventos, nombresEventos],
  );

  const opcionesCategoriasObjetivo = useMemo(
    () =>
      obtenerOpcionesCategoriasContingencia(
        tipoObjetivoContingencia,
        filasContingencia,
        columnasContingencia,
      ),
    [columnasContingencia, filasContingencia, tipoObjetivoContingencia],
  );

  const opcionesCategoriasCondicionante = useMemo(
    () =>
      obtenerOpcionesCategoriasContingencia(
        tipoCondicionanteContingencia,
        filasContingencia,
        columnasContingencia,
      ),
    [columnasContingencia, filasContingencia, tipoCondicionanteContingencia],
  );

  const actualizarNombreEvento = (indice: number, valor: string) => {
    setNombresEventos((estadoActual) =>
      estadoActual.map((nombre, posicion) =>
        posicion === indice ? valor : nombre,
      ),
    );
  };

  const actualizarValorEvento = (
    campo: keyof ReturnType<typeof crearValoresEventosIniciales>,
    valor: string,
  ) => {
    setValoresEventos((estadoActual) => ({
      ...estadoActual,
      [campo]: valor,
    }));
  };

  const actualizarFilaContingencia = (indice: 0 | 1, valor: string) => {
    setFilasContingencia((estadoActual) =>
      estadoActual.map((fila, posicion) =>
        posicion === indice ? valor : fila,
      ) as [string, string],
    );
  };

  const actualizarColumnaContingencia = (indice: 0 | 1, valor: string) => {
    setColumnasContingencia((estadoActual) =>
      estadoActual.map((columna, posicion) =>
        posicion === indice ? valor : columna,
      ) as [string, string],
    );
  };

  const actualizarCeldaContingencia = (
    campo: keyof typeof celdasContingencia,
    valor: string,
  ) => {
    setCeldasContingencia((estadoActual) => ({
      ...estadoActual,
      [campo]: valor,
    }));
  };

  const restablecer = () => {
    setFuente("eventos");
    setModo("cantidades");
    setCantidadEventos(2);
    setPrecision(PRECISION_INICIAL);
    setContexto("el contexto analizado");
    setUniverso("");
    setNombresEventos(["A", "B", "C"]);
    setValoresEventos(crearValoresEventosIniciales());
    setObjetivoEvento("A");
    setCondicionanteEvento("B");
    setNombreFilas("Variable de filas");
    setNombreColumnas("Variable de columnas");
    setFilasContingencia(["Fila 1", "Fila 2"]);
    setColumnasContingencia(["Columna 1", "Columna 2"]);
    setCeldasContingencia({
      f1c1: "",
      f1c2: "",
      f2c1: "",
      f2c2: "",
    });
    setTipoObjetivoContingencia("fila");
    setIndiceObjetivoContingencia(0);
    setTipoCondicionanteContingencia("columna");
    setIndiceCondicionanteContingencia(0);
    setResultado(null);
    setMensaje({
      tipo: "info",
      texto: "Se restablecieron los datos de probabilidad condicional.",
    });
  };

  const recalcular = () => {
    try {
      const contextoNormalizado = normalizarNombreEvento(
        contexto,
        "el contexto analizado",
      );

      const nuevoResultado =
        fuente === "eventos"
          ? (() => {
              const universoNormalizado = parsearUniversoSegunModo(
                universo,
                modo,
              );
              const nombreA = normalizarNombreEvento(nombresEventos[0], "A");
              const nombreB = normalizarNombreEvento(nombresEventos[1], "B");
              const nombreC = normalizarNombreEvento(nombresEventos[2], "C");
              const leer = (
                campo: keyof ReturnType<typeof crearValoresEventosIniciales>,
                etiqueta: string,
              ) =>
                parsearValorProbabilidadSegunModo(valoresEventos[campo], etiqueta, modo, {
                  permitirCero: true,
                  permitirUno: true,
                });

              return calcularProbabilidadCondicionalDesdeEventos({
                modo,
                precision,
                contexto: contextoNormalizado,
                universo: universoNormalizado,
                nombres:
                  cantidadEventos === 2
                    ? [nombreA, nombreB]
                    : [nombreA, nombreB, nombreC],
                individuales:
                  cantidadEventos === 2
                    ? [leer("a", `Valor de ${nombreA}`), leer("b", `Valor de ${nombreB}`)]
                    : [
                        leer("a", `Valor de ${nombreA}`),
                        leer("b", `Valor de ${nombreB}`),
                        leer("c", `Valor de ${nombreC}`),
                      ],
                interseccionesDobles:
                  cantidadEventos === 2
                    ? {
                        ab: leer(
                          "ab",
                          `Interseccion ${nombreA} y ${nombreB}`,
                        ),
                      }
                    : {
                        ab: leer(
                          "ab",
                          `Interseccion ${nombreA} y ${nombreB}`,
                        ),
                        ac: leer(
                          "ac",
                          `Interseccion ${nombreA} y ${nombreC}`,
                        ),
                        bc: leer(
                          "bc",
                          `Interseccion ${nombreB} y ${nombreC}`,
                        ),
                      },
                interseccionTriple:
                  cantidadEventos === 3
                    ? leer(
                        "abc",
                        `Interseccion ${nombreA}, ${nombreB} y ${nombreC}`,
                      )
                    : undefined,
                objetivo: objetivoEvento,
                condicionante: condicionanteEvento,
              });
            })()
          : calcularProbabilidadCondicionalDesdeContingencia({
              precision,
              contexto: contextoNormalizado,
              nombreFilas: normalizarNombreEvento(
                nombreFilas,
                "Variable de filas",
              ),
              nombreColumnas: normalizarNombreEvento(
                nombreColumnas,
                "Variable de columnas",
              ),
              filas: [
                normalizarNombreEvento(filasContingencia[0], "Fila 1"),
                normalizarNombreEvento(filasContingencia[1], "Fila 2"),
              ],
              columnas: [
                normalizarNombreEvento(columnasContingencia[0], "Columna 1"),
                normalizarNombreEvento(columnasContingencia[1], "Columna 2"),
              ],
              valores: [
                [
                  parsearEnteroTexto(
                    celdasContingencia.f1c1,
                    "Celda fila 1 columna 1",
                    {
                      minimo: 0,
                    },
                  ),
                  parsearEnteroTexto(
                    celdasContingencia.f1c2,
                    "Celda fila 1 columna 2",
                    {
                      minimo: 0,
                    },
                  ),
                ],
                [
                  parsearEnteroTexto(
                    celdasContingencia.f2c1,
                    "Celda fila 2 columna 1",
                    {
                      minimo: 0,
                    },
                  ),
                  parsearEnteroTexto(
                    celdasContingencia.f2c2,
                    "Celda fila 2 columna 2",
                    {
                      minimo: 0,
                    },
                  ),
                ],
              ],
              tipoObjetivo: tipoObjetivoContingencia,
              indiceObjetivo: indiceObjetivoContingencia,
              tipoCondicionante: tipoCondicionanteContingencia,
              indiceCondicionante: indiceCondicionanteContingencia,
            });

      setResultado(nuevoResultado);
      setMensaje({
        tipo: "exito",
        texto: "La probabilidad condicional se calculo correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular la probabilidad condicional:", error);
      setResultado(null);
      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo calcular la probabilidad condicional.",
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
          Calcula la probabilidad de un evento sabiendo que otro ya ocurrio,
          ya sea desde eventos con diagrama o desde una tabla de contingencia 2x2.
        </p>
      </header>

      <SeccionProbabilidad
        titulo="1. Formula, donde y validaciones"
        descripcion="Revisa la expresion principal y confirma las condiciones antes de trabajar con eventos o con tabla de contingencia."
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
                "En tabla 2x2: probabilidad condicional = celda favorable / total condicionante",
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
        descripcion="Elige si trabajaras desde eventos o desde tabla 2x2, luego completa los datos y define la condicional a resolver."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CampoSeleccionProbabilidad
            etiqueta="Fuente de datos"
            valor={fuente}
            onChange={(valor) => {
              setFuente(valor as FuenteCondicional);
              setResultado(null);
            }}
            opciones={[
              { valor: "eventos", etiqueta: "Eventos y diagrama" },
              { valor: "contingencia", etiqueta: "Tabla de contingencia 2x2" },
            ]}
          />
          <SelectorPrecisionProbabilidad
            precision={precision}
            onChange={setPrecision}
          />
          <div className="xl:col-span-2">
            <CampoTextoProbabilidad
              etiqueta="Contexto"
              valor={contexto}
              onChange={setContexto}
              placeholder="Ejemplo: estudiantes evaluados"
            />
          </div>
        </div>

        {fuente === "eventos" ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <CampoSeleccionProbabilidad
                etiqueta="Cantidad de eventos"
                valor={String(cantidadEventos)}
                onChange={(valor) => {
                  const nuevaCantidad = Number(valor) as 2 | 3;
                  setCantidadEventos(nuevaCantidad);
                  setObjetivoEvento("A");
                  setCondicionanteEvento("B");
                  setResultado(null);
                }}
                opciones={[
                  { valor: "2", etiqueta: "2 eventos" },
                  { valor: "3", etiqueta: "3 eventos" },
                ]}
              />
              <CampoSeleccionProbabilidad
                etiqueta="Modo de trabajo"
                valor={modo}
                onChange={(valor) => {
                  setModo(valor as ModoValorProbabilidad);
                  setResultado(null);
                }}
                opciones={[
                  { valor: "cantidades", etiqueta: "Cantidades" },
                  { valor: "decimal", etiqueta: "Probabilidades decimales" },
                  { valor: "porcentaje", etiqueta: "Porcentajes" },
                ]}
              />
              {modo === "cantidades" ? (
                <CampoNumericoProbabilidad
                  etiqueta="Universo U"
                  valor={universo}
                  onChange={setUniverso}
                  placeholder="Ejemplo: 300"
                  descripcion="Solo enteros positivos."
                  entero
                />
              ) : (
                <div className="rounded-[1.2rem] border border-verde-claro bg-panel-resalte/45 px-4 py-3 text-sm leading-7 text-texto-secundario">
                  En modo decimal o porcentaje, el universo se toma internamente como 1.
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              {Array.from({ length: cantidadEventos }).map((_, indice) => (
                <CampoTextoProbabilidad
                  key={`evento-${indice}`}
                  etiqueta={`Nombre del evento ${String.fromCharCode(65 + indice)}`}
                  valor={nombresEventos[indice]}
                  onChange={(valor) => actualizarNombreEvento(indice, valor)}
                  placeholder={`Ejemplo: ${String.fromCharCode(65 + indice)}`}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <CampoNumericoProbabilidad
                etiqueta={`Valor de ${normalizarNombreEvento(nombresEventos[0], "A")}`}
                valor={valoresEventos.a}
                onChange={(valor) => actualizarValorEvento("a", valor)}
                placeholder="Ejemplo: 90 o 0,90 o 90"
                entero={modo === "cantidades"}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Valor de ${normalizarNombreEvento(nombresEventos[1], "B")}`}
                valor={valoresEventos.b}
                onChange={(valor) => actualizarValorEvento("b", valor)}
                placeholder="Ejemplo: 120 o 0,60 o 60"
                entero={modo === "cantidades"}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Interseccion ${normalizarNombreEvento(nombresEventos[0], "A")} y ${normalizarNombreEvento(nombresEventos[1], "B")}`}
                valor={valoresEventos.ab}
                onChange={(valor) => actualizarValorEvento("ab", valor)}
                placeholder="Ejemplo: 30 o 0,15 o 15"
                entero={modo === "cantidades"}
                permitirDecimal
              />

              {cantidadEventos === 3 ? (
                <>
                  <CampoNumericoProbabilidad
                    etiqueta={`Valor de ${normalizarNombreEvento(nombresEventos[2], "C")}`}
                    valor={valoresEventos.c}
                    onChange={(valor) => actualizarValorEvento("c", valor)}
                    placeholder="Ejemplo: 110 o 0,55 o 55"
                    entero={modo === "cantidades"}
                    permitirDecimal
                  />
                  <CampoNumericoProbabilidad
                    etiqueta={`Interseccion ${normalizarNombreEvento(nombresEventos[0], "A")} y ${normalizarNombreEvento(nombresEventos[2], "C")}`}
                    valor={valoresEventos.ac}
                    onChange={(valor) => actualizarValorEvento("ac", valor)}
                    placeholder="Ejemplo: 25 o 0,12 o 12"
                    entero={modo === "cantidades"}
                    permitirDecimal
                  />
                  <CampoNumericoProbabilidad
                    etiqueta={`Interseccion ${normalizarNombreEvento(nombresEventos[1], "B")} y ${normalizarNombreEvento(nombresEventos[2], "C")}`}
                    valor={valoresEventos.bc}
                    onChange={(valor) => actualizarValorEvento("bc", valor)}
                    placeholder="Ejemplo: 18 o 0,09 o 9"
                    entero={modo === "cantidades"}
                    permitirDecimal
                  />
                  <div className="xl:col-span-3">
                    <CampoNumericoProbabilidad
                      etiqueta={`Interseccion ${normalizarNombreEvento(nombresEventos[0], "A")}, ${normalizarNombreEvento(nombresEventos[1], "B")} y ${normalizarNombreEvento(nombresEventos[2], "C")}`}
                      valor={valoresEventos.abc}
                      onChange={(valor) => actualizarValorEvento("abc", valor)}
                      placeholder="Ejemplo: 10 o 0,05 o 5"
                      entero={modo === "cantidades"}
                      permitirDecimal
                    />
                  </div>
                </>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <CampoSeleccionProbabilidad
                etiqueta="Evento objetivo"
                valor={objetivoEvento}
                onChange={(valor) => {
                  const nuevoObjetivo = valor as ClaveEvento;
                  setObjetivoEvento(nuevoObjetivo);

                  if (nuevoObjetivo === condicionanteEvento) {
                    const siguiente = opcionesEventos.find(
                      (opcion) => opcion.valor !== nuevoObjetivo,
                    );
                    if (siguiente) {
                      setCondicionanteEvento(siguiente.valor as ClaveEvento);
                    }
                  }
                }}
                opciones={opcionesEventos}
              />
              <CampoSeleccionProbabilidad
                etiqueta="Evento condicionante"
                valor={condicionanteEvento}
                onChange={(valor) => setCondicionanteEvento(valor as ClaveEvento)}
                opciones={opcionesEventos.filter(
                  (opcion) => opcion.valor !== objetivoEvento,
                )}
                descripcion="Este evento actua como nuevo universo de analisis."
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <CampoTextoProbabilidad
                etiqueta="Nombre de la variable de filas"
                valor={nombreFilas}
                onChange={setNombreFilas}
                placeholder="Ejemplo: Sexo"
              />
              <CampoTextoProbabilidad
                etiqueta="Nombre de la variable de columnas"
                valor={nombreColumnas}
                onChange={setNombreColumnas}
                placeholder="Ejemplo: Carrera"
              />
              <CampoTextoProbabilidad
                etiqueta="Fila 1"
                valor={filasContingencia[0]}
                onChange={(valor) => actualizarFilaContingencia(0, valor)}
                placeholder="Ejemplo: Femenino"
              />
              <CampoTextoProbabilidad
                etiqueta="Fila 2"
                valor={filasContingencia[1]}
                onChange={(valor) => actualizarFilaContingencia(1, valor)}
                placeholder="Ejemplo: Masculino"
              />
              <CampoTextoProbabilidad
                etiqueta="Columna 1"
                valor={columnasContingencia[0]}
                onChange={(valor) => actualizarColumnaContingencia(0, valor)}
                placeholder="Ejemplo: ISI"
              />
              <CampoTextoProbabilidad
                etiqueta="Columna 2"
                valor={columnasContingencia[1]}
                onChange={(valor) => actualizarColumnaContingencia(1, valor)}
                placeholder="Ejemplo: ICI"
              />
            </div>

            <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
                Frecuencias de la tabla 2x2
              </p>
              <div className="mt-4 overflow-auto rounded-[1.25rem] border border-verde-claro bg-white">
                <table className="min-w-[640px] border-separate border-spacing-0">
                  <thead>
                    <tr>
                      <th className="border-b border-r border-black/8 bg-panel-resalte px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro">
                        {normalizarNombreEvento(nombreFilas, "Filas")} \ {normalizarNombreEvento(nombreColumnas, "Columnas")}
                      </th>
                      {columnasContingencia.map((columna, indice) => (
                        <th
                          key={`columna-${indice}`}
                          className="border-b border-r border-black/8 bg-panel-resalte px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro"
                        >
                          {normalizarNombreEvento(columna, `Columna ${indice + 1}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filasContingencia.map((fila, indiceFila) => (
                      <tr key={`fila-${indiceFila}`}>
                        <td className="border-b border-r border-black/8 px-4 py-3 text-sm font-semibold text-texto-principal">
                          {normalizarNombreEvento(fila, `Fila ${indiceFila + 1}`)}
                        </td>
                        {(["f1c1", "f1c2"] as const)
                          .map((campo, indiceColumna) =>
                            indiceFila === 0
                              ? campo
                              : (indiceColumna === 0 ? "f2c1" : "f2c2"),
                          )
                          .map((campo) => (
                            <td
                              key={campo}
                              className="border-b border-r border-black/8 px-4 py-3"
                            >
                              <input
                                type="text"
                                inputMode="numeric"
                                value={celdasContingencia[campo]}
                                onChange={(evento) =>
                                  actualizarCeldaContingencia(campo, evento.target.value)
                                }
                                className="min-h-14 w-full rounded-[1rem] border border-verde-claro bg-white px-4 text-[1.02rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
                              />
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <CampoSeleccionProbabilidad
                etiqueta="Variable objetivo"
                valor={tipoObjetivoContingencia}
                onChange={(valor) => {
                  const nuevoTipo = valor as TipoVariableContingencia;
                  setTipoObjetivoContingencia(nuevoTipo);
                  if (nuevoTipo === tipoCondicionanteContingencia) {
                    setTipoCondicionanteContingencia(
                      nuevoTipo === "fila" ? "columna" : "fila",
                    );
                  }
                }}
                opciones={[
                  { valor: "fila", etiqueta: "Fila" },
                  { valor: "columna", etiqueta: "Columna" },
                ]}
              />
              <CampoSeleccionProbabilidad
                etiqueta="Categoria objetivo"
                valor={String(indiceObjetivoContingencia)}
                onChange={(valor) =>
                  setIndiceObjetivoContingencia(Number(valor) as 0 | 1)
                }
                opciones={opcionesCategoriasObjetivo}
              />
              <CampoSeleccionProbabilidad
                etiqueta="Variable condicionante"
                valor={tipoCondicionanteContingencia}
                onChange={(valor) => {
                  const nuevoTipo = valor as TipoVariableContingencia;
                  setTipoCondicionanteContingencia(nuevoTipo);
                  if (nuevoTipo === tipoObjetivoContingencia) {
                    setTipoObjetivoContingencia(
                      nuevoTipo === "fila" ? "columna" : "fila",
                    );
                  }
                }}
                opciones={[
                  { valor: "fila", etiqueta: "Fila" },
                  { valor: "columna", etiqueta: "Columna" },
                ]}
              />
              <CampoSeleccionProbabilidad
                etiqueta="Categoria condicionante"
                valor={String(indiceCondicionanteContingencia)}
                onChange={(valor) =>
                  setIndiceCondicionanteContingencia(Number(valor) as 0 | 1)
                }
                opciones={opcionesCategoriasCondicionante}
              />
            </div>
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
