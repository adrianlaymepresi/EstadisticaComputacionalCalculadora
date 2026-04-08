"use client";

import { useState } from "react";
import { normalizarNombreArchivo } from "@/modulos/diagrama-burbujas/servicios/exportador";
import { parsearDatosTabla } from "@/modulos/diagrama-burbujas/utilidades/validaciones";
import { calcularMetodoSimpleInspeccion } from "@/modulos/metodo-simple-inspeccion/servicios/calculos-simple-inspeccion";
import {
  exportarExcelSimpleInspeccion,
  type ConfiguracionExportacionSimpleInspeccion,
} from "@/modulos/metodo-simple-inspeccion/servicios/exportador-simple-inspeccion";
import type { ResultadoMetodoSimpleInspeccion } from "@/modulos/metodo-simple-inspeccion/tipos";

const FILAS_INICIALES = 3;
const COLUMNAS_INICIALES = 5;
const MAX_FILAS_CAPTURA = 20;
const MAX_COLUMNAS_CAPTURA = 20;
const MAXIMO_VALORES_DISTINTOS = 10;

interface MensajeEstado {
  tipo: "error" | "exito" | "info";
  texto: string;
}

function crearMatriz(filas: number, columnas: number): string[][] {
  return Array.from({ length: filas }, () =>
    Array.from({ length: columnas }, () => ""),
  );
}

function ajustarMatriz(
  matrizActual: string[][],
  filas: number,
  columnas: number,
): string[][] {
  return Array.from({ length: filas }, (_, indiceFila) =>
    Array.from(
      { length: columnas },
      (_, indiceColumna) => matrizActual[indiceFila]?.[indiceColumna] ?? "",
    ),
  );
}

function obtenerClasesMensaje(tipo: MensajeEstado["tipo"]): string {
  switch (tipo) {
    case "error":
      return "border-alerta/20 bg-alerta/8 text-alerta";
    case "exito":
      return "border-exito/20 bg-exito/8 text-exito";
    default:
      return "border-acento-principal/15 bg-acento-principal/8 text-acento-principal";
  }
}

function BloqueModulo({
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

function CampoFormulario({
  etiqueta,
  valor,
  onChange,
  tipo = "text",
  min,
  placeholder,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  tipo?: "text" | "number";
  min?: number;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.02rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <input
        type={tipo}
        min={min}
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      />
    </label>
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
    <div className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {titulo}
      </p>
      <p className="mt-2 text-[1.35rem] font-semibold text-texto-principal">
        {valor}
      </p>
    </div>
  );
}

function formatearNumeroFijo(valor: number, decimales: number): string {
  return valor.toFixed(decimales).replace(".", ",");
}

export function ModuloMetodoSimpleInspeccion() {
  const [numeroTabla, setNumeroTabla] = useState("1");
  const [tituloDescriptivo, setTituloDescriptivo] = useState(
    "Descripcion de la muestra o de los datos analizados",
  );
  const [filasCaptura, setFilasCaptura] = useState(FILAS_INICIALES);
  const [columnasCaptura, setColumnasCaptura] = useState(COLUMNAS_INICIALES);
  const [matrizDatos, setMatrizDatos] = useState<string[][]>(() =>
    crearMatriz(FILAS_INICIALES, COLUMNAS_INICIALES),
  );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [resultado, setResultado] =
    useState<ResultadoMetodoSimpleInspeccion | null>(null);
  const [exportandoExcel, setExportandoExcel] = useState(false);

  const datosCapturados = matrizDatos.flat().filter((valor) => valor.trim() !== "");

  const actualizarDimensiones = (
    nuevasFilas: number,
    nuevasColumnas: number,
  ) => {
    const filasLimitadas = Math.max(1, Math.min(MAX_FILAS_CAPTURA, nuevasFilas));
    const columnasLimitadas = Math.max(
      1,
      Math.min(MAX_COLUMNAS_CAPTURA, nuevasColumnas),
    );

    setFilasCaptura(filasLimitadas);
    setColumnasCaptura(columnasLimitadas);
    setMatrizDatos((matrizActual) =>
      ajustarMatriz(matrizActual, filasLimitadas, columnasLimitadas),
    );
  };

  const actualizarCelda = (
    indiceFila: number,
    indiceColumna: number,
    valor: string,
  ) => {
    setMatrizDatos((matrizActual) =>
      matrizActual.map((fila, filaActual) =>
        fila.map((celda, columnaActual) =>
          filaActual === indiceFila && columnaActual === indiceColumna
            ? valor
            : celda,
        ),
      ),
    );
  };

  const aplicarContenidoPegado = (textoPegado: string) => {
    if (!textoPegado.trim()) {
      return;
    }

    const filasPegadas = parsearDatosTabla(textoPegado).filter((fila) =>
      fila.some((celda) => celda.trim() !== ""),
    );

    if (filasPegadas.length === 0) {
      return;
    }

    const filasNecesarias = Math.min(MAX_FILAS_CAPTURA, filasPegadas.length);
    const columnasNecesarias = Math.min(
      MAX_COLUMNAS_CAPTURA,
      Math.max(...filasPegadas.map((fila) => fila.length), 1),
    );

    setFilasCaptura(filasNecesarias);
    setColumnasCaptura(columnasNecesarias);
    setMatrizDatos((matrizActual) => {
      const matrizBase = ajustarMatriz(
        matrizActual,
        filasNecesarias,
        columnasNecesarias,
      );

      filasPegadas.slice(0, filasNecesarias).forEach((fila, indiceFila) => {
        fila.slice(0, columnasNecesarias).forEach((valor, indiceColumna) => {
          matrizBase[indiceFila][indiceColumna] = valor;
        });
      });

      return matrizBase;
    });

    setMensajeEstado({
      tipo: "info",
      texto:
        "Datos pegados correctamente. Revisa el contenido y luego presiona Construir tabla.",
    });
  };

  const manejarPegadoDirecto = (evento: React.ClipboardEvent<HTMLDivElement>) => {
    evento.preventDefault();
    aplicarContenidoPegado(evento.clipboardData.getData("text"));
  };

  const pegarDesdePortapapeles = async () => {
    if (!navigator.clipboard?.readText) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Tu navegador no permite leer el portapapeles desde el boton. Usa Ctrl+V dentro de la tabla.",
      });
      return;
    }

    try {
      aplicarContenidoPegado(await navigator.clipboard.readText());
    } catch (error) {
      console.error("No se pudo leer el portapapeles:", error);
      setMensajeEstado({
        tipo: "error",
        texto:
          "No pude acceder al portapapeles. Puedes pegar manualmente con Ctrl+V sobre la tabla.",
      });
    }
  };

  const limpiarTabla = () => {
    setMatrizDatos(crearMatriz(filasCaptura, columnasCaptura));
    setResultado(null);
    setMensajeEstado({
      tipo: "info",
      texto: "La tabla de captura fue limpiada.",
    });
  };

  const construirTabla = () => {
    const datos = matrizDatos.flat().filter((celda) => celda.trim() !== "");

    try {
      const resultadoCalculado = calcularMetodoSimpleInspeccion(datos);
      setResultado(resultadoCalculado);
      setMensajeEstado({
        tipo: "exito",
        texto: "Tabla de simple inspeccion construida correctamente.",
      });
    } catch (error) {
      console.error("No se pudo construir la tabla de simple inspeccion:", error);
      setResultado(null);
      setMensajeEstado({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo construir la tabla de simple inspeccion.",
      });
    }
  };

  const exportar = async () => {
    if (!resultado) {
      setMensajeEstado({
        tipo: "error",
        texto: "Primero construye la tabla antes de exportar.",
      });
      return;
    }

    setExportandoExcel(true);

    try {
      const configuracion: ConfiguracionExportacionSimpleInspeccion = {
        numeroTabla: numeroTabla.trim() || "1",
        tituloDescriptivo,
        datosOriginales: matrizDatos,
        resultado,
      };

      await exportarExcelSimpleInspeccion(
        configuracion,
        normalizarNombreArchivo(
          `simple-inspeccion-tabla-${numeroTabla.trim() || "1"}`,
        ),
      );

      setMensajeEstado({
        tipo: "exito",
        texto: "Archivo Excel exportado correctamente.",
      });
    } catch (error) {
      console.error("No se pudo exportar el Excel:", error);
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
          Tecnica de Simple Inspeccion
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          Captura tus datos en una tabla, identifica hasta 10 valores distintos y
          construye directamente la tabla estadistica con frecuencias simples,
          relativas y acumuladas.
        </p>
      </header>

      <BloqueModulo
        titulo="1. Ingreso de datos"
        descripcion="Define la tabla, pega tus datos desde Excel y genera la tabla estadistica directa por simple inspeccion."
      >
        <div className="flex flex-col gap-6" onPaste={manejarPegadoDirecto}>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <CampoFormulario
              etiqueta="Numero de la tabla"
              valor={numeroTabla}
              onChange={setNumeroTabla}
              tipo="number"
              min={1}
            />
            <CampoFormulario
              etiqueta="Titulo descriptivo"
              valor={tituloDescriptivo}
              onChange={setTituloDescriptivo}
              placeholder="Describe brevemente el contenido de los datos"
            />
            <CampoFormulario
              etiqueta="Filas de captura"
              valor={`${filasCaptura}`}
              onChange={(valor) =>
                actualizarDimensiones(Number(valor || 1), columnasCaptura)
              }
              tipo="number"
              min={1}
            />
            <CampoFormulario
              etiqueta="Columnas de captura"
              valor={`${columnasCaptura}`}
              onChange={(valor) =>
                actualizarDimensiones(filasCaptura, Number(valor || 1))
              }
              tipo="number"
              min={1}
            />
          </div>

          <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
            <table className="min-w-[720px] border-separate border-spacing-0">
              <tbody>
                {matrizDatos.map((fila, indiceFila) => (
                  <tr key={`fila-${indiceFila}`}>
                    {fila.map((celda, indiceColumna) => (
                      <td
                        key={`celda-${indiceFila}-${indiceColumna}`}
                        className="border-b border-r border-black/8 p-2"
                      >
                        <input
                          type="text"
                          value={celda}
                          onChange={(evento) =>
                            actualizarCelda(
                              indiceFila,
                              indiceColumna,
                              evento.target.value,
                            )
                          }
                          className="min-h-12 w-full rounded-[0.95rem] border border-[#d6e2d6] bg-white px-3 text-[1rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
                          placeholder="Dato"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={pegarDesdePortapapeles}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-[#f5faf4] px-6 text-[1.12rem] font-semibold text-acento-oscuro transition hover:border-acento-principal hover:text-acento-principal"
            >
              Pegar desde portapapeles
            </button>
            <button
              type="button"
              onClick={construirTabla}
              className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.12rem] font-semibold text-white shadow-[0_12px_28px_rgba(0,98,65,0.22)] transition hover:bg-acento-oscuro"
            >
              Construir tabla
            </button>
            <button
              type="button"
              onClick={limpiarTabla}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.12rem] font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
            >
              Limpiar captura
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <TarjetaDato titulo="Datos no vacios" valor={`${datosCapturados.length}`} />
            <TarjetaDato
              titulo="Maximo valores distintos"
              valor={`${MAXIMO_VALORES_DISTINTOS}`}
            />
            <TarjetaDato titulo="Formato" valor={`${filasCaptura} x ${columnasCaptura}`} />
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
        </div>
      </BloqueModulo>

      {resultado ? (
        <BloqueModulo
          titulo="2. Tabla estadistica"
          descripcion="Se agrupan directamente los valores observados y se calculan las frecuencias simples, relativas y acumuladas sin construir intervalos."
        >
          <div className="text-center">
            <h3 className="text-4xl font-semibold text-acento-oscuro">
              Tabla N° {numeroTabla.trim() || "1"}
            </h3>
            <p className="mt-3 text-[1.08rem] leading-8 text-texto-secundario">
              {tituloDescriptivo.trim()}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <TarjetaDato titulo="n" valor={`${resultado.n}`} />
            <TarjetaDato
              titulo="Valores distintos"
              valor={`${resultado.cantidadValoresDistintos}`}
            />
            <TarjetaDato
              titulo="Tipo detectado"
              valor={resultado.todosSonNumericos ? "Numerico" : "Texto/mixto"}
            />
          </div>

          <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
            <table className="min-w-[1180px] border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#A25508] text-white">
                  {["Valor", "Conteo", "fi", "hi", "pi", "Fi", "Hi", "Pi"].map(
                    (encabezado) => (
                      <th
                        key={encabezado}
                        className="border-b border-l border-white/15 px-4 py-4 text-left text-[1.15rem] font-semibold first:border-l-0"
                      >
                        {encabezado}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {resultado.filas.map((fila, indice) => (
                  <tr
                    key={`fila-${fila.valor}-${indice}`}
                    className={indice % 2 === 0 ? "bg-white" : "bg-[#f9f3eb]"}
                  >
                    <td className="border-b border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                      {fila.valor}
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                      {fila.conteo}
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                      {fila.fi}
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                      {formatearNumeroFijo(fila.hi, 4)}
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                      {formatearNumeroFijo(fila.pi, 2)}%
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                      {fila.Fi}
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                      {formatearNumeroFijo(fila.Hi, 4)}
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                      {formatearNumeroFijo(fila.Pi, 2)}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-[#f5d2ab] font-semibold text-texto-principal">
                  <td className="border-b border-black/8 px-4 py-4 text-[1.1rem]">
                    TOTAL
                  </td>
                  <td className="border-b border-l border-black/8 px-4 py-4 text-[1.1rem]">
                    -
                  </td>
                  <td className="border-b border-l border-black/8 px-4 py-4 text-[1.1rem]">
                    {resultado.n}
                  </td>
                  <td className="border-b border-l border-black/8 px-4 py-4 text-[1.1rem]">
                    1,0000
                  </td>
                  <td className="border-b border-l border-black/8 px-4 py-4 text-[1.1rem]">
                    100,00%
                  </td>
                  <td className="border-b border-l border-black/8 px-4 py-4 text-[1.1rem]">
                    {resultado.n}
                  </td>
                  <td className="border-b border-l border-black/8 px-4 py-4 text-[1.1rem]">
                    1,0000
                  </td>
                  <td className="border-b border-l border-black/8 px-4 py-4 text-[1.1rem]">
                    100,00%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </BloqueModulo>
      ) : null}

      <BloqueModulo
        titulo="3. Exportacion"
        descripcion="Exporta los datos originales y la tabla estadistica de simple inspeccion en un archivo Excel."
      >
        <div>
          <button
            type="button"
            onClick={exportar}
            disabled={!resultado || exportandoExcel}
            className={`min-h-14 rounded-[1.15rem] px-7 text-[1.25rem] font-semibold transition ${
              resultado && !exportandoExcel
                ? "bg-acento-principal text-white shadow-[0_12px_28px_rgba(0,98,65,0.22)] hover:bg-acento-oscuro"
                : "cursor-not-allowed bg-[#aec0b2] text-white/80"
            }`}
          >
            {exportandoExcel ? "Exportando..." : "Exportar a Excel"}
          </button>
        </div>
      </BloqueModulo>
    </div>
  );
}
