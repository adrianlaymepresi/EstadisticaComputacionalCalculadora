"use client";

import { useMemo, useState } from "react";
import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import {
  calcularEventosCompuestosCuatro,
  calcularEventosCompuestosDos,
  calcularEventosCompuestosTres,
} from "@/modulos/probabilidad-unidad-2/servicios/eventos-compuestos.service";
import type {
  ConsultaCuatroEventos,
  ConsultaDosEventos,
  ConsultaTresEventos,
  ModoValorProbabilidad,
  ResultadoCalculadoProbabilidad,
} from "@/modulos/probabilidad-unidad-2/tipos";
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
  normalizarNombreEvento,
  parsearUniversoSegunModo,
  parsearValorProbabilidadSegunModo,
} from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";

const PRECISION_INICIAL: PrecisionResultado = {
  modo: "completo",
  decimales: 4,
};

const OPCIONES_DOS_EVENTOS: Array<{
  valor: ConsultaDosEventos;
  etiqueta: string;
}> = [
  { valor: "evento-a", etiqueta: "P(A)" },
  { valor: "evento-b", etiqueta: "P(B)" },
  { valor: "interseccion", etiqueta: "P(A∩B)" },
  { valor: "union", etiqueta: "P(A∪B)" },
  { valor: "solo-a", etiqueta: "P(A-B) o solo A" },
  { valor: "solo-b", etiqueta: "P(B-A) o solo B" },
  { valor: "exactamente-uno", etiqueta: "P(exactamente uno)" },
  { valor: "complemento-a", etiqueta: "P(A')" },
  { valor: "complemento-b", etiqueta: "P(B')" },
  { valor: "ninguno", etiqueta: "P((A∪B)')" },
];

const OPCIONES_TRES_EVENTOS: Array<{
  valor: ConsultaTresEventos;
  etiqueta: string;
}> = [
  { valor: "evento-a", etiqueta: "P(A)" },
  { valor: "evento-b", etiqueta: "P(B)" },
  { valor: "evento-c", etiqueta: "P(C)" },
  { valor: "interseccion-ab", etiqueta: "P(A∩B)" },
  { valor: "interseccion-ac", etiqueta: "P(A∩C)" },
  { valor: "interseccion-bc", etiqueta: "P(B∩C)" },
  { valor: "interseccion-abc", etiqueta: "P(A∩B∩C)" },
  { valor: "union-total", etiqueta: "P(A∪B∪C)" },
  { valor: "solo-a", etiqueta: "P(solo A)" },
  { valor: "solo-b", etiqueta: "P(solo B)" },
  { valor: "solo-c", etiqueta: "P(solo C)" },
  { valor: "solo-ab", etiqueta: "P(A∩B pero no C)" },
  { valor: "solo-ac", etiqueta: "P(A∩C pero no B)" },
  { valor: "solo-bc", etiqueta: "P(B∩C pero no A)" },
  { valor: "union-ab", etiqueta: "P(A∪B)" },
  { valor: "union-ac", etiqueta: "P(A∪C)" },
  { valor: "union-bc", etiqueta: "P(B∪C)" },
  { valor: "union-ab-sin-c", etiqueta: "P(A∪B pero no C)" },
  { valor: "union-ac-sin-b", etiqueta: "P(A∪C pero no B)" },
  { valor: "union-bc-sin-a", etiqueta: "P(B∪C pero no A)" },
  { valor: "al-menos-uno", etiqueta: "P(al menos uno)" },
  { valor: "exactamente-uno", etiqueta: "P(exactamente uno)" },
  { valor: "exactamente-dos", etiqueta: "P(exactamente dos)" },
  { valor: "ninguno", etiqueta: "P(ninguno)" },
  { valor: "complemento-a", etiqueta: "P(no A)" },
  { valor: "complemento-b", etiqueta: "P(no B)" },
  { valor: "complemento-c", etiqueta: "P(no C)" },
];

const OPCIONES_CUATRO_EVENTOS: Array<{
  valor: ConsultaCuatroEventos;
  etiqueta: string;
}> = [
  { valor: "union-total", etiqueta: "P(al menos uno)" },
  { valor: "ninguno", etiqueta: "P(ninguno)" },
  { valor: "solo-a", etiqueta: "P(solo A)" },
  { valor: "solo-b", etiqueta: "P(solo B)" },
  { valor: "solo-c", etiqueta: "P(solo C)" },
  { valor: "solo-d", etiqueta: "P(solo D)" },
  { valor: "interseccion-ab", etiqueta: "P(A∩B)" },
  { valor: "interseccion-ac", etiqueta: "P(A∩C)" },
  { valor: "interseccion-ad", etiqueta: "P(A∩D)" },
  { valor: "interseccion-bc", etiqueta: "P(B∩C)" },
  { valor: "interseccion-bd", etiqueta: "P(B∩D)" },
  { valor: "interseccion-cd", etiqueta: "P(C∩D)" },
  { valor: "interseccion-abc", etiqueta: "P(A∩B∩C)" },
  { valor: "interseccion-abd", etiqueta: "P(A∩B∩D)" },
  { valor: "interseccion-acd", etiqueta: "P(A∩C∩D)" },
  { valor: "interseccion-bcd", etiqueta: "P(B∩C∩D)" },
  { valor: "interseccion-abcd", etiqueta: "P(A∩B∩C∩D)" },
  { valor: "exactamente-uno", etiqueta: "P(exactamente uno)" },
  { valor: "exactamente-dos", etiqueta: "P(exactamente dos)" },
  { valor: "exactamente-tres", etiqueta: "P(exactamente tres)" },
  { valor: "complemento-a", etiqueta: "P(no A)" },
  { valor: "complemento-b", etiqueta: "P(no B)" },
  { valor: "complemento-c", etiqueta: "P(no C)" },
  { valor: "complemento-d", etiqueta: "P(no D)" },
];

const DEFINICIONES = [
  {
    simbolo: "A, B, C, D",
    descripcion: "Eventos o conjuntos analizados.",
  },
  {
    simbolo: "U",
    descripcion: "Universo o total de elementos cuando se trabaja con cantidades.",
  },
  {
    simbolo: "∩",
    descripcion: "Interseccion de eventos, es decir, ocurren al mismo tiempo.",
  },
  {
    simbolo: "∪",
    descripcion: "Union de eventos, es decir, ocurre al menos uno.",
  },
  {
    simbolo: "'",
    descripcion: "Complemento de un evento.",
  },
] as const;

const CONDICIONES = [
  "Si trabajas con cantidades, todos los valores deben ser enteros no negativos.",
  "Una interseccion no puede ser mayor que ninguno de los eventos que la contienen.",
  "La union nunca puede superar al universo.",
  "Si alguna region calculada queda negativa, los datos son inconsistentes.",
  "En modo decimal o porcentaje, los valores se convierten internamente a probabilidades entre 0 y 1.",
] as const;

function crearValoresIniciales() {
  return {
    a: "",
    b: "",
    c: "",
    d: "",
    ab: "",
    ac: "",
    ad: "",
    bc: "",
    bd: "",
    cd: "",
    abc: "",
    abd: "",
    acd: "",
    bcd: "",
    abcd: "",
  };
}

export function CardEventosCompuestos() {
  const [modo, setModo] = useState<ModoValorProbabilidad>("cantidades");
  const [cantidadEventos, setCantidadEventos] = useState<2 | 3 | 4>(2);
  const [precision, setPrecision] = useState<PrecisionResultado>(
    PRECISION_INICIAL,
  );
  const [contexto, setContexto] = useState("el contexto analizado");
  const [universo, setUniverso] = useState("");
  const [nombres, setNombres] = useState(["A", "B", "C", "D"]);
  const [valores, setValores] = useState(crearValoresIniciales);
  const [consultaDos, setConsultaDos] = useState<ConsultaDosEventos>("union");
  const [consultaTres, setConsultaTres] =
    useState<ConsultaTresEventos>("union-total");
  const [consultaCuatro, setConsultaCuatro] =
    useState<ConsultaCuatroEventos>("union-total");
  const [mensaje, setMensaje] = useState<MensajeEstadoProbabilidad | null>(null);
  const [resultado, setResultado] =
    useState<ResultadoCalculadoProbabilidad | null>(null);

  const opcionesConsultaActuales = useMemo(() => {
    if (cantidadEventos === 2) {
      return OPCIONES_DOS_EVENTOS;
    }

    if (cantidadEventos === 3) {
      return OPCIONES_TRES_EVENTOS;
    }

    return OPCIONES_CUATRO_EVENTOS;
  }, [cantidadEventos]);

  const formulasActivas = useMemo(() => {
    if (cantidadEventos === 2) {
      return [
        "P(A∪B) = P(A) + P(B) - P(A∩B)",
        "P(A-B) = P(A) - P(A∩B)",
        "P((A∪B)') = 1 - P(A∪B)",
      ];
    }

    if (cantidadEventos === 3) {
      return [
        "P(A∪B∪C) = P(A) + P(B) + P(C) - P(A∩B) - P(A∩C) - P(B∩C) + P(A∩B∩C)",
        "Solo AB = A∩B - A∩B∩C",
        "Ninguno = U - (A∪B∪C)",
      ];
    }

    return [
      "P(A∪B∪C∪D) = suma de individuales - suma de dobles + suma de triples - cuadruple",
      "Exactamente dos = suma de intersecciones dobles exclusivas",
      "Ninguno = U - (A∪B∪C∪D)",
    ];
  }, [cantidadEventos]);

  const actualizarNombre = (indice: number, valor: string) => {
    setNombres((estadoActual) =>
      estadoActual.map((nombre, posicion) =>
        posicion === indice ? valor : nombre,
      ),
    );
  };

  const actualizarValor = (campo: keyof ReturnType<typeof crearValoresIniciales>, valor: string) => {
    setValores((estadoActual) => ({
      ...estadoActual,
      [campo]: valor,
    }));
  };

  const limpiar = () => {
    setModo("cantidades");
    setCantidadEventos(2);
    setPrecision(PRECISION_INICIAL);
    setContexto("el contexto analizado");
    setUniverso("");
    setNombres(["A", "B", "C", "D"]);
    setValores(crearValoresIniciales());
    setConsultaDos("union");
    setConsultaTres("union-total");
    setConsultaCuatro("union-total");
    setResultado(null);
    setMensaje({
      tipo: "info",
      texto: "Se restablecieron los datos de eventos compuestos.",
    });
  };

  const recalcular = () => {
    try {
      const universoNormalizado = parsearUniversoSegunModo(universo, modo);
      const nombreA = normalizarNombreEvento(nombres[0], "A");
      const nombreB = normalizarNombreEvento(nombres[1], "B");
      const nombreC = normalizarNombreEvento(nombres[2], "C");
      const nombreD = normalizarNombreEvento(nombres[3], "D");
      const contextoNormalizado = normalizarNombreEvento(
        contexto,
        "el contexto analizado",
      );

      const leer = (
        campo: keyof ReturnType<typeof crearValoresIniciales>,
        etiqueta: string,
      ) =>
        parsearValorProbabilidadSegunModo(valores[campo], etiqueta, modo, {
          permitirCero: true,
          permitirUno: true,
        });

      const nuevoResultado =
        cantidadEventos === 2
          ? calcularEventosCompuestosDos({
              universo: universoNormalizado,
              modo,
              precision,
              nombres: [nombreA, nombreB],
              contexto: contextoNormalizado,
              valorA: leer("a", `Valor de ${nombreA}`),
              valorB: leer("b", `Valor de ${nombreB}`),
              valorAB: leer("ab", `Interseccion ${nombreA}∩${nombreB}`),
              consulta: consultaDos,
            })
          : cantidadEventos === 3
            ? calcularEventosCompuestosTres({
                universo: universoNormalizado,
                modo,
                precision,
                nombres: [nombreA, nombreB, nombreC],
                contexto: contextoNormalizado,
                valorA: leer("a", `Valor de ${nombreA}`),
                valorB: leer("b", `Valor de ${nombreB}`),
                valorC: leer("c", `Valor de ${nombreC}`),
                valorAB: leer("ab", `Interseccion ${nombreA}∩${nombreB}`),
                valorAC: leer("ac", `Interseccion ${nombreA}∩${nombreC}`),
                valorBC: leer("bc", `Interseccion ${nombreB}∩${nombreC}`),
                valorABC: leer(
                  "abc",
                  `Interseccion ${nombreA}∩${nombreB}∩${nombreC}`,
                ),
                consulta: consultaTres,
              })
            : calcularEventosCompuestosCuatro({
                universo: universoNormalizado,
                modo,
                precision,
                nombres: [nombreA, nombreB, nombreC, nombreD],
                contexto: contextoNormalizado,
                valorA: leer("a", `Valor de ${nombreA}`),
                valorB: leer("b", `Valor de ${nombreB}`),
                valorC: leer("c", `Valor de ${nombreC}`),
                valorD: leer("d", `Valor de ${nombreD}`),
                valorAB: leer("ab", `Interseccion ${nombreA}∩${nombreB}`),
                valorAC: leer("ac", `Interseccion ${nombreA}∩${nombreC}`),
                valorAD: leer("ad", `Interseccion ${nombreA}∩${nombreD}`),
                valorBC: leer("bc", `Interseccion ${nombreB}∩${nombreC}`),
                valorBD: leer("bd", `Interseccion ${nombreB}∩${nombreD}`),
                valorCD: leer("cd", `Interseccion ${nombreC}∩${nombreD}`),
                valorABC: leer(
                  "abc",
                  `Interseccion ${nombreA}∩${nombreB}∩${nombreC}`,
                ),
                valorABD: leer(
                  "abd",
                  `Interseccion ${nombreA}∩${nombreB}∩${nombreD}`,
                ),
                valorACD: leer(
                  "acd",
                  `Interseccion ${nombreA}∩${nombreC}∩${nombreD}`,
                ),
                valorBCD: leer(
                  "bcd",
                  `Interseccion ${nombreB}∩${nombreC}∩${nombreD}`,
                ),
                valorABCD: leer(
                  "abcd",
                  `Interseccion ${nombreA}∩${nombreB}∩${nombreC}∩${nombreD}`,
                ),
                consulta: consultaCuatro,
              });

      setResultado(nuevoResultado);
      setMensaje({
        tipo: "exito",
        texto: "La consulta de eventos compuestos se resolvio correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular eventos compuestos:", error);
      setResultado(null);
      setMensaje({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo calcular la probabilidad de eventos compuestos.",
      });
    }
  };

  const mostrarCampoEntero = modo === "cantidades";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[2.6rem] font-semibold tracking-tight text-acento-oscuro sm:text-[4rem]">
          Probabilidad de eventos compuestos
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          Resuelve uniones, intersecciones, complementos, regiones exclusivas y
          consultas con 2, 3 o 4 eventos.
        </p>
      </header>

      <SeccionProbabilidad
        titulo="1. Formulas y consideraciones"
        descripcion="Este apartado se adapta a 2, 3 o 4 eventos y permite trabajar por cantidades, probabilidades o porcentajes."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Formulas activas
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {formulasActivas.map((formula) => (
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
        titulo="2. Entradas y consulta"
        descripcion="Elige el numero de eventos, el modo de trabajo y luego llena los valores individuales e intersecciones necesarias."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CampoSeleccionProbabilidad
            etiqueta="Cantidad de eventos"
            valor={String(cantidadEventos)}
            onChange={(valor) => {
              setCantidadEventos(Number(valor) as 2 | 3 | 4);
              setResultado(null);
            }}
            opciones={[
              { valor: "2", etiqueta: "2 eventos" },
              { valor: "3", etiqueta: "3 eventos" },
              { valor: "4", etiqueta: "4 eventos" },
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
            descripcion={
              modo === "cantidades"
                ? "Los campos aceptan enteros no negativos."
                : modo === "decimal"
                  ? "Los campos aceptan valores entre 0 y 1."
                  : "Los campos aceptan valores entre 0 y 100."
            }
          />
          <div className="xl:col-span-2">
            <SelectorPrecisionProbabilidad
              precision={precision}
              onChange={setPrecision}
            />
          </div>
          <div className="xl:col-span-2">
            <CampoTextoProbabilidad
              etiqueta="Contexto"
              valor={contexto}
              onChange={setContexto}
              placeholder="Ejemplo: estudiantes que visitan lugares turisticos"
            />
          </div>

          {modo === "cantidades" ? (
            <div className="xl:col-span-2">
              <CampoNumericoProbabilidad
                etiqueta="Universo U"
                valor={universo}
                onChange={setUniverso}
                placeholder="Ejemplo: 350"
                descripcion="Solo enteros positivos."
                entero
              />
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-verde-claro bg-panel-resalte/45 px-4 py-3 text-sm leading-7 text-texto-secundario xl:col-span-2">
              En modo decimal y porcentaje el universo se considera 1 de forma
              interna para trabajar directamente con probabilidades.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {nombres.slice(0, cantidadEventos).map((nombre, indice) => (
            <CampoTextoProbabilidad
              key={`nombre-${indice}`}
              etiqueta={`Nombre del evento ${String.fromCharCode(65 + indice)}`}
              valor={nombre}
              onChange={(valor) => actualizarNombre(indice, valor)}
              placeholder={`Ejemplo: ${String.fromCharCode(65 + indice)}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <CampoNumericoProbabilidad
            etiqueta={`Valor de ${normalizarNombreEvento(nombres[0], "A")}`}
            valor={valores.a}
            onChange={(valor) => actualizarValor("a", valor)}
            placeholder="Ejemplo: 0,70 o 70"
            entero={mostrarCampoEntero}
            permitirDecimal
          />
          <CampoNumericoProbabilidad
            etiqueta={`Valor de ${normalizarNombreEvento(nombres[1], "B")}`}
            valor={valores.b}
            onChange={(valor) => actualizarValor("b", valor)}
            placeholder="Ejemplo: 0,12 o 12"
            entero={mostrarCampoEntero}
            permitirDecimal
          />
          <CampoNumericoProbabilidad
            etiqueta={`Interseccion ${normalizarNombreEvento(nombres[0], "A")}∩${normalizarNombreEvento(nombres[1], "B")}`}
            valor={valores.ab}
            onChange={(valor) => actualizarValor("ab", valor)}
            placeholder="Ejemplo: 0,08 o 8"
            entero={mostrarCampoEntero}
            permitirDecimal
          />

          {cantidadEventos >= 3 ? (
            <>
              <CampoNumericoProbabilidad
                etiqueta={`Valor de ${normalizarNombreEvento(nombres[2], "C")}`}
                valor={valores.c}
                onChange={(valor) => actualizarValor("c", valor)}
                placeholder="Ejemplo: 0,55 o 55"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Interseccion ${normalizarNombreEvento(nombres[0], "A")}∩${normalizarNombreEvento(nombres[2], "C")}`}
                valor={valores.ac}
                onChange={(valor) => actualizarValor("ac", valor)}
                placeholder="Ejemplo: 0,15 o 15"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Interseccion ${normalizarNombreEvento(nombres[1], "B")}∩${normalizarNombreEvento(nombres[2], "C")}`}
                valor={valores.bc}
                onChange={(valor) => actualizarValor("bc", valor)}
                placeholder="Ejemplo: 0,25 o 25"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <div className="xl:col-span-3">
                <CampoNumericoProbabilidad
                  etiqueta={`Interseccion ${normalizarNombreEvento(nombres[0], "A")}∩${normalizarNombreEvento(nombres[1], "B")}∩${normalizarNombreEvento(nombres[2], "C")}`}
                  valor={valores.abc}
                  onChange={(valor) => actualizarValor("abc", valor)}
                  placeholder="Ejemplo: 0,05 o 5"
                  entero={mostrarCampoEntero}
                  permitirDecimal
                />
              </div>
            </>
          ) : null}

          {cantidadEventos === 4 ? (
            <>
              <CampoNumericoProbabilidad
                etiqueta={`Valor de ${normalizarNombreEvento(nombres[3], "D")}`}
                valor={valores.d}
                onChange={(valor) => actualizarValor("d", valor)}
                placeholder="Ejemplo: 0,45 o 45"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Interseccion ${normalizarNombreEvento(nombres[0], "A")}∩${normalizarNombreEvento(nombres[3], "D")}`}
                valor={valores.ad}
                onChange={(valor) => actualizarValor("ad", valor)}
                placeholder="Ejemplo: 0,10 o 10"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Interseccion ${normalizarNombreEvento(nombres[1], "B")}∩${normalizarNombreEvento(nombres[3], "D")}`}
                valor={valores.bd}
                onChange={(valor) => actualizarValor("bd", valor)}
                placeholder="Ejemplo: 0,10 o 10"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Interseccion ${normalizarNombreEvento(nombres[2], "C")}∩${normalizarNombreEvento(nombres[3], "D")}`}
                valor={valores.cd}
                onChange={(valor) => actualizarValor("cd", valor)}
                placeholder="Ejemplo: 0,10 o 10"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Interseccion ${normalizarNombreEvento(nombres[0], "A")}∩${normalizarNombreEvento(nombres[1], "B")}∩${normalizarNombreEvento(nombres[3], "D")}`}
                valor={valores.abd}
                onChange={(valor) => actualizarValor("abd", valor)}
                placeholder="Ejemplo: 0,03 o 3"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Interseccion ${normalizarNombreEvento(nombres[0], "A")}∩${normalizarNombreEvento(nombres[2], "C")}∩${normalizarNombreEvento(nombres[3], "D")}`}
                valor={valores.acd}
                onChange={(valor) => actualizarValor("acd", valor)}
                placeholder="Ejemplo: 0,03 o 3"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <CampoNumericoProbabilidad
                etiqueta={`Interseccion ${normalizarNombreEvento(nombres[1], "B")}∩${normalizarNombreEvento(nombres[2], "C")}∩${normalizarNombreEvento(nombres[3], "D")}`}
                valor={valores.bcd}
                onChange={(valor) => actualizarValor("bcd", valor)}
                placeholder="Ejemplo: 0,03 o 3"
                entero={mostrarCampoEntero}
                permitirDecimal
              />
              <div className="xl:col-span-3">
                <CampoNumericoProbabilidad
                  etiqueta={`Interseccion ${normalizarNombreEvento(nombres[0], "A")}∩${normalizarNombreEvento(nombres[1], "B")}∩${normalizarNombreEvento(nombres[2], "C")}∩${normalizarNombreEvento(nombres[3], "D")}`}
                  valor={valores.abcd}
                  onChange={(valor) => actualizarValor("abcd", valor)}
                  placeholder="Ejemplo: 0,01 o 1"
                  entero={mostrarCampoEntero}
                  permitirDecimal
                />
              </div>
            </>
          ) : null}
        </div>

        <CampoSeleccionProbabilidad
          etiqueta="Consulta a resolver"
          valor={
            cantidadEventos === 2
              ? consultaDos
              : cantidadEventos === 3
                ? consultaTres
                : consultaCuatro
          }
          onChange={(valor) => {
            if (cantidadEventos === 2) {
              setConsultaDos(valor as ConsultaDosEventos);
              return;
            }
            if (cantidadEventos === 3) {
              setConsultaTres(valor as ConsultaTresEventos);
              return;
            }
            setConsultaCuatro(valor as ConsultaCuatroEventos);
          }}
          opciones={opcionesConsultaActuales}
        />

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
