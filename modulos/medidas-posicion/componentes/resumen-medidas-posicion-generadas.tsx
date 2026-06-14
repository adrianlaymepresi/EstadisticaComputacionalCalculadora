"use client";

import { useMemo, useState } from "react";
import { calcularModuloMedidasPosicion } from "@/modulos/medidas-posicion/servicios/calculos-medidas-posicion";
import type {
  FilaTablaClasificadaEntrada,
  ResultadoCalculoMedidasPosicion,
  TipoDatosMedidaPosicion,
} from "@/modulos/medidas-posicion/tipos";

interface MensajeEstado {
  tipo: "error" | "exito" | "info";
  texto: string;
}

interface ResumenMedidasPosicionGeneradasProps {
  tipoDatos: TipoDatosMedidaPosicion;
  matrizNoClasificada?: string[][];
  filasClasificadas?: FilaTablaClasificadaEntrada[];
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

const OPCIONES_DECIMALES = Array.from({ length: 10 }, (_, indice) => indice + 1);
const OPCIONES_CUARTILES = [1, 2, 3];
const OPCIONES_DECILES = Array.from({ length: 9 }, (_, indice) => indice + 1);
const OPCIONES_PERCENTILES = Array.from({ length: 99 }, (_, indice) => indice + 1);
const OPCIONES_PREDETERMINADAS = {
  decimales: "todos" as const,
  valorCuartil: 2,
  valorDecil: 5,
  valorPercentil: 50,
};

function ejecutarCalculoInicial({
  tipoDatos,
  matrizNoClasificada,
  filasClasificadas,
  opcionesSalida,
}: {
  tipoDatos: TipoDatosMedidaPosicion;
  matrizNoClasificada: string[][];
  filasClasificadas: FilaTablaClasificadaEntrada[];
  opcionesSalida: {
    decimales: number | "todos";
    valorCuartil: number;
    valorDecil: number;
    valorPercentil: number;
  };
}) {
  try {
    return {
      resultado: calcularModuloMedidasPosicion(
        "medidas-posicion-todas",
        tipoDatos,
        matrizNoClasificada,
        filasClasificadas,
        opcionesSalida,
      ),
      mensaje: null,
    };
  } catch (error) {
    return {
      resultado: null,
      mensaje: {
        tipo: "error" as const,
        texto:
          error instanceof Error
            ? error.message
            : "No se pudieron calcular las medidas de posicion.",
      },
    };
  }
}

export function ResumenMedidasPosicionGeneradas({
  tipoDatos,
  matrizNoClasificada = [],
  filasClasificadas = [],
}: ResumenMedidasPosicionGeneradasProps) {
  const [modoDecimales, setModoDecimales] = useState<"todos" | "fijos">(
    "todos",
  );
  const [cantidadDecimales, setCantidadDecimales] = useState("4");
  const [valorCuartil, setValorCuartil] = useState("2");
  const [valorDecil, setValorDecil] = useState("5");
  const [valorPercentil, setValorPercentil] = useState("50");
  const estadoInicial = useMemo(
    () =>
      ejecutarCalculoInicial({
        tipoDatos,
        matrizNoClasificada,
        filasClasificadas,
        opcionesSalida: OPCIONES_PREDETERMINADAS,
      }),
    [filasClasificadas, matrizNoClasificada, tipoDatos],
  );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(
    estadoInicial.mensaje,
  );
  const [resultado, setResultado] = useState<ResultadoCalculoMedidasPosicion | null>(
    estadoInicial.resultado,
  );

  const opcionesSalida = useMemo(
    () => ({
      decimales:
        modoDecimales === "todos"
          ? ("todos" as const)
          : Math.min(10, Math.max(1, Number(cantidadDecimales || 1))),
      valorCuartil: Math.min(3, Math.max(1, Number(valorCuartil || 2))),
      valorDecil: Math.min(9, Math.max(1, Number(valorDecil || 5))),
      valorPercentil: Math.min(99, Math.max(1, Number(valorPercentil || 50))),
    }),
    [
      cantidadDecimales,
      modoDecimales,
      valorCuartil,
      valorDecil,
      valorPercentil,
    ],
  );

  const recalcularMedidas = () => {
    try {
      const resultadoCalculado = calcularModuloMedidasPosicion(
        "medidas-posicion-todas",
        tipoDatos,
        matrizNoClasificada,
        filasClasificadas,
        opcionesSalida,
      );

      setResultado(resultadoCalculado);
      setMensajeEstado({
        tipo: "exito",
        texto:
          "Las medidas de posicion se recalcularon correctamente para esta tabla.",
      });
    } catch (error) {
      console.error("No se pudieron calcular las medidas de posicion:", error);
      setResultado(null);
      setMensajeEstado({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudieron calcular las medidas de posicion.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <label className="flex flex-col gap-2">
          <span className="text-[1.02rem] font-medium text-texto-secundario">
            Decimales del resumen
          </span>
          <select
            value={modoDecimales}
            onChange={(evento) =>
              setModoDecimales(evento.target.value as "todos" | "fijos")
            }
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
          >
            <option value="todos">Completos</option>
            <option value="fijos">Del 1 al 10</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[1.02rem] font-medium text-texto-secundario">
            Cantidad fija
          </span>
          <select
            value={cantidadDecimales}
            onChange={(evento) => setCantidadDecimales(evento.target.value)}
            disabled={modoDecimales !== "fijos"}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10 disabled:cursor-not-allowed disabled:bg-[#f3f4f1] disabled:text-texto-secundario"
          >
            {OPCIONES_DECIMALES.map((decimal) => (
              <option key={decimal} value={`${decimal}`}>
                {decimal}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[1.02rem] font-medium text-texto-secundario">
            Cuartil del resumen
          </span>
          <select
            value={valorCuartil}
            onChange={(evento) => setValorCuartil(evento.target.value)}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
          >
            {OPCIONES_CUARTILES.map((cuartil) => (
              <option key={cuartil} value={`${cuartil}`}>
                Q{cuartil}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[1.02rem] font-medium text-texto-secundario">
            Decil del resumen
          </span>
          <select
            value={valorDecil}
            onChange={(evento) => setValorDecil(evento.target.value)}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
          >
            {OPCIONES_DECILES.map((decil) => (
              <option key={decil} value={`${decil}`}>
                D{decil}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-[1.02rem] font-medium text-texto-secundario">
            Percentil del resumen
          </span>
          <select
            value={valorPercentil}
            onChange={(evento) => setValorPercentil(evento.target.value)}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
          >
            {OPCIONES_PERCENTILES.map((percentil) => (
              <option key={percentil} value={`${percentil}`}>
                P{percentil}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={recalcularMedidas}
          className="min-h-12 rounded-[1rem] bg-acento-principal px-5 text-[1rem] font-semibold text-white transition hover:bg-acento-oscuro"
        >
          Recalcular medidas
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

      {resultado?.tipo === "todos" ? (
        <div className="flex flex-col gap-4">
          <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
            <table className="min-w-[820px] border-separate border-spacing-0">
              <thead>
                <tr>
                  {["Medida", "Resultado", "Observacion"].map((encabezado) => (
                    <th
                      key={encabezado}
                      className="border-b border-r border-black/8 bg-panel-resalte px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro"
                    >
                      {encabezado}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resultado.detalle.resumen.map((fila) => (
                  <tr key={`${fila.medida}-${fila.resultado}`}>
                    <td className="border-b border-r border-black/8 px-4 py-3 text-sm font-semibold text-texto-principal">
                      {fila.medida}
                    </td>
                    <td className="border-b border-r border-black/8 px-4 py-3 text-sm text-texto-principal">
                      {fila.resultado}
                    </td>
                    <td className="border-b border-r border-black/8 px-4 py-3 text-sm leading-7 text-texto-secundario">
                      {fila.observacion}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4 text-sm leading-7 text-texto-secundario">
            {resultado.detalle.observacionGeneral}
          </div>
        </div>
      ) : null}
    </div>
  );
}
