"use client";

import { useMemo, useState } from "react";
import { normalizarNombreArchivo } from "@/modulos/diagrama-burbujas/servicios/exportador";
import { CapturaDatosClasificados } from "@/modulos/medidas-posicion/componentes/captura-datos-clasificados";
import { CapturaDatosNoClasificados } from "@/modulos/medidas-posicion/componentes/captura-datos-no-clasificados";
import { calcularModuloMedidasPosicion } from "@/modulos/medidas-posicion/servicios/calculos-medidas-posicion";
import { exportarExcelMedidasPosicion } from "@/modulos/medidas-posicion/servicios/exportador-medidas-posicion";
import { obtenerConfiguracionMedidaPosicion } from "@/modulos/medidas-posicion/servicios/configuraciones-medidas-posicion";
import {
  ajustarMatriz,
  convertirTextoPegadoAFilasClasificadas,
  convertirTextoPegadoAMatrizNoClasificada,
  crearMatriz,
} from "@/modulos/medidas-posicion/servicios/parseadores-medidas-posicion";
import type {
  FilaTablaClasificadaEntrada,
  IdentificadorMedidaPosicion,
  ResultadoCalculoMedidasPosicion,
  TipoDatosMedidaPosicion,
} from "@/modulos/medidas-posicion/tipos";

const FILAS_INICIALES = 3;
const COLUMNAS_INICIALES = 5;
const MAX_FILAS_CAPTURA = 20;
const MAX_COLUMNAS_CAPTURA = 20;

interface MensajeEstado {
  tipo: "error" | "exito" | "info";
  texto: string;
}

function crearFilaClasificadaVacia(): FilaTablaClasificadaEntrada {
  return {
    li: "",
    ls: "",
    fi: "",
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

export function ModuloMedidaPosicion({
  medidaId,
}: {
  medidaId: IdentificadorMedidaPosicion;
}) {
  const configuracion = useMemo(
    () => obtenerConfiguracionMedidaPosicion(medidaId),
    [medidaId],
  );

  const [tipoDatos, setTipoDatos] =
    useState<TipoDatosMedidaPosicion>("no-clasificados");
  const [numeroTabla, setNumeroTabla] = useState("1");
  const [tituloDescriptivo, setTituloDescriptivo] = useState(
    `Analisis de ${configuracion.titulo.toLowerCase()}`,
  );
  const [filasCaptura, setFilasCaptura] = useState(FILAS_INICIALES);
  const [columnasCaptura, setColumnasCaptura] = useState(COLUMNAS_INICIALES);
  const [matrizNoClasificada, setMatrizNoClasificada] = useState<string[][]>(() =>
    crearMatriz(FILAS_INICIALES, COLUMNAS_INICIALES),
  );
  const [filasClasificadas, setFilasClasificadas] = useState<
    FilaTablaClasificadaEntrada[]
  >([crearFilaClasificadaVacia(), crearFilaClasificadaVacia(), crearFilaClasificadaVacia()]);
  const [modoDecimales, setModoDecimales] = useState<"todos" | "fijos">(
    "todos",
  );
  const [cantidadDecimales, setCantidadDecimales] = useState("4");
  const [valorCuantil, setValorCuantil] = useState(
    `${configuracion.requiereCuantil?.valorInicial ?? 1}`,
  );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [resultado, setResultado] =
    useState<ResultadoCalculoMedidasPosicion | null>(null);
  const [exportandoExcel, setExportandoExcel] = useState(false);

  const definicionesActivas =
    tipoDatos === "no-clasificados"
      ? configuracion.definicionesNoClasificados
      : configuracion.definicionesClasificados;
  const formulasActivas =
    tipoDatos === "no-clasificados"
      ? configuracion.formulasNoClasificados
      : configuracion.formulasClasificados;
  const condicionesActivas =
    tipoDatos === "no-clasificados"
      ? configuracion.condicionesNoClasificados
      : configuracion.condicionesClasificados;

  const opcionesSalida = {
    decimales:
      modoDecimales === "todos"
        ? ("todos" as const)
        : Math.min(10, Math.max(1, Number(cantidadDecimales || 1))),
    valorCuantil: configuracion.requiereCuantil
      ? Number(valorCuantil || configuracion.requiereCuantil.valorInicial)
      : undefined,
  };

  const actualizarDimensiones = (nuevasFilas: number, nuevasColumnas: number) => {
    const filasLimitadas = Math.max(1, Math.min(MAX_FILAS_CAPTURA, nuevasFilas));
    const columnasLimitadas = Math.max(
      1,
      Math.min(MAX_COLUMNAS_CAPTURA, nuevasColumnas),
    );

    setFilasCaptura(filasLimitadas);
    setColumnasCaptura(columnasLimitadas);
    setMatrizNoClasificada((matrizActual) =>
      ajustarMatriz(matrizActual, filasLimitadas, columnasLimitadas),
    );
  };

  const actualizarCeldaNoClasificada = (
    indiceFila: number,
    indiceColumna: number,
    valor: string,
  ) => {
    setMatrizNoClasificada((matrizActual) =>
      matrizActual.map((fila, filaActual) =>
        fila.map((celda, columnaActual) =>
          filaActual === indiceFila && columnaActual === indiceColumna
            ? valor
            : celda,
        ),
      ),
    );
  };

  const aplicarPegadoNoClasificado = (textoPegado: string) => {
    if (!textoPegado.trim()) {
      return;
    }

    const matrizPegada = convertirTextoPegadoAMatrizNoClasificada(textoPegado);

    if (matrizPegada.length === 0) {
      return;
    }

    const filasNecesarias = Math.min(MAX_FILAS_CAPTURA, matrizPegada.length);
    const columnasNecesarias = Math.min(
      MAX_COLUMNAS_CAPTURA,
      Math.max(...matrizPegada.map((fila) => fila.length), 1),
    );

    setFilasCaptura(filasNecesarias);
    setColumnasCaptura(columnasNecesarias);
    setMatrizNoClasificada((matrizActual) => {
      const matrizBase = ajustarMatriz(
        matrizActual,
        filasNecesarias,
        columnasNecesarias,
      );

      matrizPegada.slice(0, filasNecesarias).forEach((fila, indiceFila) => {
        fila.slice(0, columnasNecesarias).forEach((valor, indiceColumna) => {
          matrizBase[indiceFila][indiceColumna] = valor;
        });
      });

      return matrizBase;
    });

    setMensajeEstado({
      tipo: "info",
      texto:
        "Datos pegados correctamente. Revisa el contenido y luego presiona Calcular.",
    });
  };

  const pegarNoClasificadosDesdePortapapeles = async () => {
    if (!navigator.clipboard?.readText) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Tu navegador no permite leer el portapapeles desde el boton. Usa Ctrl+V dentro de la tabla.",
      });
      return;
    }

    try {
      aplicarPegadoNoClasificado(await navigator.clipboard.readText());
    } catch (error) {
      console.error("No se pudo leer el portapapeles:", error);
      setMensajeEstado({
        tipo: "error",
        texto:
          "No pude acceder al portapapeles. Puedes pegar manualmente con Ctrl+V sobre la tabla.",
      });
    }
  };

  const limpiarNoClasificados = () => {
    setMatrizNoClasificada(crearMatriz(filasCaptura, columnasCaptura));
    setResultado(null);
    setMensajeEstado({
      tipo: "info",
      texto: "Se limpiaron los datos no clasificados.",
    });
  };

  const actualizarFilaClasificada = (
    indice: number,
    campo: keyof FilaTablaClasificadaEntrada,
    valor: string,
  ) => {
    setFilasClasificadas((filasActuales) =>
      filasActuales.map((fila, indiceActual) =>
        indiceActual === indice ? { ...fila, [campo]: valor } : fila,
      ),
    );
  };

  const agregarFilaClasificada = () => {
    setFilasClasificadas((filasActuales) =>
      filasActuales.length >= MAX_FILAS_CAPTURA
        ? filasActuales
        : [...filasActuales, crearFilaClasificadaVacia()],
    );
  };

  const quitarFilaClasificada = (indice: number) => {
    setFilasClasificadas((filasActuales) =>
      filasActuales.length === 1
        ? [crearFilaClasificadaVacia()]
        : filasActuales.filter((_, indiceActual) => indiceActual !== indice),
    );
  };

  const aplicarPegadoClasificado = (textoPegado: string) => {
    if (!textoPegado.trim()) {
      return;
    }

    const filasPegadas = convertirTextoPegadoAFilasClasificadas(textoPegado).slice(
      0,
      MAX_FILAS_CAPTURA,
    );

    if (filasPegadas.length === 0) {
      return;
    }

    setFilasClasificadas(filasPegadas);
    setMensajeEstado({
      tipo: "info",
      texto:
        "Tabla clasificada pegada correctamente. Revisa Li, Ls y fi antes de calcular.",
    });
  };

  const pegarClasificadosDesdePortapapeles = async () => {
    if (!navigator.clipboard?.readText) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Tu navegador no permite leer el portapapeles desde el boton. Usa Ctrl+V dentro de la tabla.",
      });
      return;
    }

    try {
      aplicarPegadoClasificado(await navigator.clipboard.readText());
    } catch (error) {
      console.error("No se pudo leer el portapapeles:", error);
      setMensajeEstado({
        tipo: "error",
        texto:
          "No pude acceder al portapapeles. Puedes pegar manualmente con Ctrl+V sobre la tabla.",
      });
    }
  };

  const limpiarClasificados = () => {
    setFilasClasificadas([
      crearFilaClasificadaVacia(),
      crearFilaClasificadaVacia(),
      crearFilaClasificadaVacia(),
    ]);
    setResultado(null);
    setMensajeEstado({
      tipo: "info",
      texto: "Se limpio la tabla clasificada.",
    });
  };

  const calcular = () => {
    try {
      const resultadoCalculado = calcularModuloMedidasPosicion(
        medidaId,
        tipoDatos,
        matrizNoClasificada,
        filasClasificadas,
        opcionesSalida,
      );

      setResultado(resultadoCalculado);
      setMensajeEstado({
        tipo: "exito",
        texto: "Calculo realizado correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular la medida:", error);
      setResultado(null);
      setMensajeEstado({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo calcular la medida seleccionada.",
      });
    }
  };

  const exportar = async () => {
    if (!resultado) {
      setMensajeEstado({
        tipo: "error",
        texto: "Primero calcula el resultado antes de exportar.",
      });
      return;
    }

    setExportandoExcel(true);

    try {
      await exportarExcelMedidasPosicion(
        {
          numeroTabla: numeroTabla.trim() || "1",
          tituloDescriptivo,
          medidaTitulo: configuracion.titulo,
          tipoDatos:
            tipoDatos === "no-clasificados"
              ? "No clasificados"
              : "Clasificados",
          resultado,
          matrizNoClasificada,
          filasClasificadas,
        },
        normalizarNombreArchivo(
          `${configuracion.id}-${numeroTabla.trim() || "1"}`,
        ),
      );

      setMensajeEstado({
        tipo: "exito",
        texto: "Archivo Excel exportado correctamente.",
      });
    } catch (error) {
      console.error("No se pudo exportar el archivo Excel:", error);
      setMensajeEstado({
        tipo: "error",
        texto: "No pude exportar el archivo Excel. Intenta nuevamente.",
      });
    } finally {
      setExportandoExcel(false);
    }
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
        titulo="1. Datos a considerar"
        descripcion="Selecciona el tipo de datos, revisa la formula correspondiente y confirma las condiciones antes de calcular."
      >
        <div className="flex flex-wrap gap-3">
          {[
            {
              valor: "no-clasificados" as const,
              etiqueta: "Datos no clasificados",
            },
            {
              valor: "clasificados" as const,
              etiqueta: "Datos clasificados",
            },
          ].map((opcion) => {
            const estaActiva = tipoDatos === opcion.valor;

            return (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => {
                  setTipoDatos(opcion.valor);
                  setResultado(null);
                }}
                className={`min-h-14 rounded-[1.15rem] border px-5 text-[1.02rem] font-semibold transition ${
                  estaActiva
                    ? "border-acento-principal bg-acento-principal text-white"
                    : "border-verde-claro bg-white text-texto-principal hover:border-acento-principal hover:text-acento-principal"
                }`}
              >
                {opcion.etiqueta}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Formula
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
              DONDE:
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {definicionesActivas.map((definicion) => (
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
            Condiciones de validacion
          </p>
          <ul className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
            {condicionesActivas.map((condicion) => (
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
        titulo="2. Configuracion de salida"
        descripcion="Define los datos descriptivos de la tabla y como quieres mostrar los decimales del resultado."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="text-[1.02rem] font-medium text-texto-secundario">
              Numero de tabla
            </span>
            <input
              type="number"
              min={1}
              value={numeroTabla}
              onChange={(evento) => setNumeroTabla(evento.target.value)}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[1.02rem] font-medium text-texto-secundario">
              Titulo descriptivo
            </span>
            <input
              type="text"
              value={tituloDescriptivo}
              onChange={(evento) => setTituloDescriptivo(evento.target.value)}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
              placeholder="Describe el conjunto de datos analizado"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[1.02rem] font-medium text-texto-secundario">
              Cantidad de decimales en el resultado
            </span>
            <select
              value={modoDecimales}
              onChange={(evento) =>
                setModoDecimales(evento.target.value as "todos" | "fijos")
              }
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
            >
              <option value="todos">Todos los decimales disponibles</option>
              <option value="fijos">Elegir cantidad fija</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[1.02rem] font-medium text-texto-secundario">
              Decimales fijos
            </span>
            <input
              type="number"
              min={1}
              max={10}
              disabled={modoDecimales !== "fijos"}
              value={cantidadDecimales}
              onChange={(evento) => setCantidadDecimales(evento.target.value)}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10 disabled:cursor-not-allowed disabled:bg-[#f3f4f1]"
            />
          </label>

          {configuracion.requiereCuantil ? (
            <label className="flex flex-col gap-2 xl:col-span-2">
              <span className="text-[1.02rem] font-medium text-texto-secundario">
                {configuracion.requiereCuantil.etiqueta}
              </span>
              <input
                type="number"
                min={configuracion.requiereCuantil.minimo}
                max={configuracion.requiereCuantil.maximo}
                value={valorCuantil}
                onChange={(evento) => setValorCuantil(evento.target.value)}
                className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
              />
            </label>
          ) : null}
        </div>
      </BloqueSeccion>

      <BloqueSeccion
        titulo="3. Ingreso de datos"
        descripcion={
          tipoDatos === "no-clasificados"
            ? "Captura los datos en una tabla editable o pegala directamente desde Excel, Word o una lista lineal."
            : "Ingresa la tabla de Li, Ls y fi para trabajar con datos agrupados y permitir el calculo del procedimiento."
        }
      >
        {tipoDatos === "no-clasificados" ? (
          <CapturaDatosNoClasificados
            filasCaptura={filasCaptura}
            columnasCaptura={columnasCaptura}
            matrizDatos={matrizNoClasificada}
            ejemplo={configuracion.ejemploNoClasificados}
            onActualizarDimensiones={actualizarDimensiones}
            onActualizarCelda={actualizarCeldaNoClasificada}
            onPegarDesdePortapapeles={pegarNoClasificadosDesdePortapapeles}
            onPegadoDirecto={aplicarPegadoNoClasificado}
            onLimpiar={limpiarNoClasificados}
          />
        ) : (
          <CapturaDatosClasificados
            filas={filasClasificadas}
            ejemplo={configuracion.ejemploClasificados}
            onActualizarFila={actualizarFilaClasificada}
            onAgregarFila={agregarFilaClasificada}
            onQuitarFila={quitarFilaClasificada}
            onPegarDesdePortapapeles={pegarClasificadosDesdePortapapeles}
            onPegadoDirecto={aplicarPegadoClasificado}
            onLimpiar={limpiarClasificados}
          />
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={calcular}
            className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.12rem] font-semibold text-white transition hover:brightness-95"
          >
            Calcular
          </button>
          <button
            type="button"
            onClick={exportar}
            disabled={!resultado || exportandoExcel}
            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.12rem] font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exportandoExcel ? "Exportando..." : "Exportar a Excel"}
          </button>
        </div>

        {mensajeEstado ? (
          <div
            className={`rounded-[1.2rem] border px-4 py-3 text-sm leading-7 ${obtenerClasesMensaje(mensajeEstado.tipo)}`}
          >
            {mensajeEstado.texto}
          </div>
        ) : null}
      </BloqueSeccion>

      {resultado ? (
        <BloqueSeccion
          titulo="4. Resultado"
          descripcion="Revisa el valor final, la interpretacion y el procedimiento desarrollado a partir de los datos ingresados."
        >
          {resultado.tipo === "todos" ? (
            <div className="flex flex-col gap-5">
              <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
                <table className="min-w-[720px] border-separate border-spacing-0">
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
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <TarjetaDato
                  titulo="Resultado principal"
                  valor={resultado.detalle.valorPrincipal}
                />
                <TarjetaDato
                  titulo="Tipo de datos"
                  valor={
                    resultado.detalle.tipoDatos === "no-clasificados"
                      ? "No clasificados"
                      : "Clasificados"
                  }
                />
                <TarjetaDato titulo="Modulo" valor={resultado.detalle.titulo} />
              </div>

              <div className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4 text-sm leading-7 text-texto-secundario">
                <p className="font-semibold text-texto-principal">Observacion</p>
                <p className="mt-2">{resultado.detalle.observacion}</p>
                {resultado.detalle.interpretacion ? (
                  <>
                    <p className="mt-4 font-semibold text-texto-principal">
                      Interpretacion
                    </p>
                    <p className="mt-2">{resultado.detalle.interpretacion}</p>
                  </>
                ) : null}
              </div>

              {resultado.detalle.pasos.length > 0 ? (
                <div className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
                    Procedimiento
                  </p>
                  <div className="mt-4 flex flex-col gap-3">
                    {resultado.detalle.pasos.map((paso) => (
                      <div
                        key={`${paso.titulo}-${paso.expresion}-${paso.resultado}`}
                        className="rounded-[1.1rem] border border-verde-claro bg-white px-4 py-3"
                      >
                        <p className="text-base font-semibold text-texto-principal">
                          {paso.titulo}
                        </p>
                        {paso.descripcion ? (
                          <p className="mt-2 text-sm leading-7 text-texto-secundario">
                            {paso.descripcion}
                          </p>
                        ) : null}
                        {paso.expresion ? (
                          <p className="mt-2 text-sm leading-7 text-texto-secundario">
                            {paso.expresion}
                          </p>
                        ) : null}
                        {paso.resultado ? (
                          <p className="mt-2 text-sm font-semibold leading-7 text-acento-oscuro">
                            {paso.resultado}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {resultado.detalle.tablas.map((tabla) => (
                <div
                  key={tabla.titulo}
                  className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-5"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
                    {tabla.titulo}
                  </p>
                  <div className="mt-4 overflow-auto rounded-[1.25rem] border border-verde-claro bg-white">
                    <table className="min-w-[720px] border-separate border-spacing-0">
                      <thead>
                        <tr>
                          {tabla.columnas.map((columna) => (
                            <th
                              key={columna}
                              className="border-b border-r border-black/8 bg-panel-resalte px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro"
                            >
                              {columna}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tabla.filas.map((fila, indiceFila) => (
                          <tr key={`${tabla.titulo}-${indiceFila}`}>
                            {fila.map((valor, indiceColumna) => (
                              <td
                                key={`${tabla.titulo}-${indiceFila}-${indiceColumna}`}
                                className="border-b border-r border-black/8 px-4 py-3 text-sm leading-7 text-texto-secundario"
                              >
                                {valor}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </BloqueSeccion>
      ) : null}
    </div>
  );
}
