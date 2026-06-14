"use client";

import { type ReactNode, useMemo, useRef, useState } from "react";
import { normalizarNombreArchivo } from "@/modulos/diagrama-burbujas/servicios/exportador";
import { exportarExcelRegresion } from "@/modulos/regresiones/servicios/exportador-regresiones";
import {
  calcularEstimacionesRegresion,
  calcularRegresion,
} from "@/modulos/regresiones/servicios/calculo-regresiones";
import { obtenerConfiguracionRegresion } from "@/modulos/regresiones/servicios/configuraciones-regresiones";
import {
  construirListaDecimales,
  obtenerNombreVariableXVisible,
  obtenerNombreVariableYVisible,
} from "@/modulos/regresiones/utilidades/formateo-regresion";
import { GraficaRegresionCanvas } from "@/modulos/regresiones/componentes/grafica-regresion-canvas";
import {
  construirFilasVaciasRegresion,
  parsearNumeroRegresion,
  parsearTextoPegadoRegresion,
  validarParesRegresion,
} from "@/modulos/regresiones/utilidades/parseo-regresion";
import type {
  ConfiguracionGraficaRegresion,
  EstadoConfiguracionRegresion,
  FilaEntradaRegresion,
  IdentificadorRegresion,
  ModoPrecisionRegresion,
  ResultadoCalculoRegresion,
} from "@/modulos/regresiones/tipos";
import {
  manejarTeclaEntradaNumerica,
  sanitizarTextoEntradaNumerica,
} from "@/modulos/medidas-posicion/servicios/entrada-numerica-medidas-posicion";

const MAXIMO_FILAS = 20;
const FILAS_INICIALES = 5;
const DECIMALES_DISPONIBLES = construirListaDecimales();

interface MensajeEstado {
  tipo: "error" | "exito" | "info";
  texto: string;
}

interface ErrorFila {
  x?: string;
  y?: string;
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

function convertirTextoModoPrecision(texto: string): ModoPrecisionRegresion {
  return texto === "completo" ? "completo" : Number(texto);
}

function crearConfiguracionInicialRegresion(): EstadoConfiguracionRegresion {
  return {
    precisionProceso: "completo",
    precisionResultado: "completo",
    tipoLogaritmo: "ln",
    personalizacion: {
      nombreVariableX: "",
      unidadVariableX: "",
      nombreVariableY: "",
      unidadVariableY: "",
      contexto: "",
    },
  };
}

function crearConfiguracionGraficaInicial(): ConfiguracionGraficaRegresion {
  return {
    mostrarPuntosOriginales: true,
    mostrarCurvaRegresion: true,
    mostrarEtiquetasPuntos: false,
    mostrarCuadricula: true,
  };
}

function BloqueSeccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
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

function CampoTexto({
  etiqueta,
  valor,
  onChange,
  placeholder,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.02rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <input
        type="text"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.08rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
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
    <article className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
        {titulo}
      </p>
      <p className="mt-2 text-[1.3rem] font-semibold text-texto-principal">
        {valor}
      </p>
    </article>
  );
}

export function ModuloRegresion({
  regresionId,
}: {
  regresionId: IdentificadorRegresion;
}) {
  const configuracion = useMemo(
    () => obtenerConfiguracionRegresion(regresionId),
    [regresionId],
  );
  const [filas, setFilas] = useState<FilaEntradaRegresion[]>(() =>
    construirFilasVaciasRegresion(FILAS_INICIALES),
  );
  const [erroresFilas, setErroresFilas] = useState<Record<string, ErrorFila>>(
    {},
  );
  const [configuracionEstado, setConfiguracionEstado] =
    useState<EstadoConfiguracionRegresion>(() =>
      crearConfiguracionInicialRegresion(),
    );
  const [textoEstimarYDesdeX, setTextoEstimarYDesdeX] = useState("");
  const [textoEstimarXDesdeY, setTextoEstimarXDesdeY] = useState("");
  const [configuracionGrafica, setConfiguracionGrafica] =
    useState<ConfiguracionGraficaRegresion>(() =>
      crearConfiguracionGraficaInicial(),
    );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [resultado, setResultado] = useState<ResultadoCalculoRegresion | null>(
    null,
  );
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const lienzoGraficaRef = useRef<HTMLCanvasElement>(null);

  const precisionProcesoTexto = `${configuracionEstado.precisionProceso}`;
  const precisionResultadoTexto = `${configuracionEstado.precisionResultado}`;
  const nombreXVisible = resultado
    ? obtenerNombreVariableXVisible(resultado.configuracion.personalizacion)
    : obtenerNombreVariableXVisible(configuracionEstado.personalizacion);
  const nombreYVisible = resultado
    ? obtenerNombreVariableYVisible(resultado.configuracion.personalizacion)
    : obtenerNombreVariableYVisible(configuracionEstado.personalizacion);

  const permiteNegativoCampo = (campo: "x" | "y") => {
    if (regresionId === "regresion-potencial") {
      return false;
    }

    if (regresionId === "regresion-exponencial" && campo === "y") {
      return false;
    }

    return true;
  };

  const actualizarFila = (
    filaId: string,
    campo: "x" | "y",
    valor: string,
  ) => {
    const textoSanitizado = sanitizarTextoEntradaNumerica(valor, {
      permitirDecimal: true,
      permitirNegativo: permiteNegativoCampo(campo),
    });

    setFilas((estadoActual) =>
      estadoActual.map((fila) =>
        fila.id === filaId ? { ...fila, [campo]: textoSanitizado } : fila,
      ),
    );

    setErroresFilas((estadoActual) => {
      const errores = estadoActual[filaId];

      if (!errores?.[campo]) {
        return estadoActual;
      }

      const siguiente = { ...estadoActual };
      const filaActual = { ...errores };
      delete filaActual[campo];

      if (Object.keys(filaActual).length === 0) {
        delete siguiente[filaId];
      } else {
        siguiente[filaId] = filaActual;
      }

      return siguiente;
    });
  };

  const agregarFila = () => {
    setFilas((estadoActual) =>
      estadoActual.length >= MAXIMO_FILAS
        ? estadoActual
        : [...estadoActual, ...construirFilasVaciasRegresion(1)],
    );
  };

  const eliminarFila = (filaId: string) => {
    setFilas((estadoActual) =>
      estadoActual.length === 1
        ? construirFilasVaciasRegresion(1)
        : estadoActual.filter((fila) => fila.id !== filaId),
    );

    setErroresFilas((estadoActual) => {
      const siguiente = { ...estadoActual };
      delete siguiente[filaId];
      return siguiente;
    });
  };

  const aplicarFilasDesdePares = (
    pares: Array<{
      x: number;
      y: number;
    }>,
  ) => {
    const filasBase = construirFilasVaciasRegresion(Math.max(pares.length, 1));

    pares.forEach((par, indice) => {
      filasBase[indice] = {
        ...filasBase[indice],
        x: `${par.x}`.replace(".", ","),
        y: `${par.y}`.replace(".", ","),
      };
    });

    setFilas(filasBase);
    setErroresFilas({});
    setResultado(null);
    setTextoEstimarYDesdeX("");
    setTextoEstimarXDesdeY("");
  };

  const aplicarPegadoDirecto = (textoPegado: string) => {
    const filasPegadas = parsearTextoPegadoRegresion(textoPegado).slice(
      0,
      MAXIMO_FILAS,
    );

    if (filasPegadas.length === 0) {
      return;
    }

    const filasBase = construirFilasVaciasRegresion(
      Math.max(filasPegadas.length, 1),
    );

    filasPegadas.forEach((filaPegada, indice) => {
      filasBase[indice] = {
        ...filasBase[indice],
        x: sanitizarTextoEntradaNumerica(filaPegada[0] ?? "", {
          permitirDecimal: true,
          permitirNegativo: true,
        }),
        y: sanitizarTextoEntradaNumerica(filaPegada[1] ?? "", {
          permitirDecimal: true,
          permitirNegativo: true,
        }),
      };
    });

    setFilas(filasBase);
    setErroresFilas({});
    setResultado(null);
    setMensajeEstado({
      tipo: "info",
      texto:
        "Datos pegados correctamente. Revisa la tabla y luego presiona Calcular.",
    });
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
      aplicarPegadoDirecto(await navigator.clipboard.readText());
    } catch (error) {
      console.error("No se pudo leer el portapapeles:", error);
      setMensajeEstado({
        tipo: "error",
        texto:
          "No pude acceder al portapapeles. Puedes pegar manualmente con Ctrl+V sobre la tabla.",
      });
    }
  };

  const limpiarDatos = () => {
    setFilas(construirFilasVaciasRegresion(FILAS_INICIALES));
    setErroresFilas({});
    setResultado(null);
    setTextoEstimarYDesdeX("");
    setTextoEstimarXDesdeY("");
    setMensajeEstado({
      tipo: "info",
      texto: "Se limpiaron los datos de la regresion.",
    });
  };

  const validarFilasBase = () => {
    const nuevosErrores: Record<string, ErrorFila> = {};

    filas.forEach((fila) => {
      const textoX = fila.x.trim();
      const textoY = fila.y.trim();
      const filaVacia = textoX === "" && textoY === "";

      if (filaVacia) {
        return;
      }

      if (textoX === "") {
        nuevosErrores[fila.id] = {
          ...nuevosErrores[fila.id],
          x: "Completa el valor de X.",
        };
      }

      if (textoY === "") {
        nuevosErrores[fila.id] = {
          ...nuevosErrores[fila.id],
          y: "Completa el valor de Y.",
        };
      }

      if (textoX && parsearNumeroRegresion(textoX) === null) {
        nuevosErrores[fila.id] = {
          ...nuevosErrores[fila.id],
          x: "Ingresa solo numeros validos.",
        };
      }

      if (textoY && parsearNumeroRegresion(textoY) === null) {
        nuevosErrores[fila.id] = {
          ...nuevosErrores[fila.id],
          y: "Ingresa solo numeros validos.",
        };
      }
    });

    setErroresFilas(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const construirRestricciones = () => ({
    xMayorQueCero: regresionId === "regresion-potencial",
    yMayorQueCero:
      regresionId === "regresion-potencial" ||
      regresionId === "regresion-exponencial",
    xNoTodosIguales: true,
  });

  const calcular = () => {
    if (!validarFilasBase()) {
      setResultado(null);
      setMensajeEstado({
        tipo: "error",
        texto:
          "Hay filas con errores. Corrigelas antes de calcular la regresion.",
      });
      return;
    }

    try {
      const validacion = validarParesRegresion(
        filas,
        configuracion.minimoPares,
        construirRestricciones(),
      );
      const configuracionActual: EstadoConfiguracionRegresion = {
        ...configuracionEstado,
        precisionProceso: convertirTextoModoPrecision(precisionProcesoTexto),
        precisionResultado: convertirTextoModoPrecision(precisionResultadoTexto),
      };
      const calculo = calcularRegresion(
        regresionId,
        validacion.pares,
        configuracionActual,
      );

      setResultado(calculo.resultado);
      setTextoEstimarYDesdeX("");
      setTextoEstimarXDesdeY("");
      setMensajeEstado({
        tipo: "exito",
        texto: "Regresion calculada correctamente.",
      });
    } catch (error) {
      console.error("No se pudo calcular la regresion:", error);
      setResultado(null);
      setMensajeEstado({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo calcular la regresion seleccionada.",
      });
    }
  };

  const calcularEstimaciones = () => {
    if (!resultado) {
      setMensajeEstado({
        tipo: "error",
        texto: "Primero calcula la regresion antes de estimar nuevos valores.",
      });
      return;
    }

    if (!textoEstimarYDesdeX.trim() && !textoEstimarXDesdeY.trim()) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Ingresa al menos un valor para estimar Y dado X o X dado Y.",
      });
      return;
    }

    try {
      const estimaciones = calcularEstimacionesRegresion(
        resultado,
        textoEstimarYDesdeX,
        textoEstimarXDesdeY,
      );

      setResultado({
        ...resultado,
        estimaciones,
      });
      setMensajeEstado({
        tipo: "exito",
        texto: "Estimaciones actualizadas correctamente.",
      });
    } catch (error) {
      console.error("No se pudieron calcular las estimaciones:", error);
      setMensajeEstado({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudieron calcular las estimaciones.",
      });
    }
  };

  const exportar = async () => {
    if (!resultado || !lienzoGraficaRef.current) {
      setMensajeEstado({
        tipo: "error",
        texto: "Primero calcula la regresion y genera la grafica antes de exportar.",
      });
      return;
    }

    setExportandoExcel(true);

    try {
      await exportarExcelRegresion(
        {
          numeroTabla: "1",
          tituloDescriptivo:
            configuracionEstado.personalizacion.contexto.trim() ||
            configuracion.resumen,
          resultado,
          canvasGrafica: lienzoGraficaRef.current,
        },
        normalizarNombreArchivo(regresionId),
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
        descripcion="Revisa la formula general, identifica que significa cada variable y valida las condiciones antes de calcular."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
              Formula
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {configuracion.expresiones.map((formula) => (
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
            Condiciones de entrada
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
      </BloqueSeccion>

      <BloqueSeccion
        titulo="2. Configuracion y entrada de datos"
        descripcion="Configura la precision del procedimiento, personaliza si usaras logaritmos y carga los pares X, Y desde tabla o pegado directo."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="text-[1.02rem] font-medium text-texto-secundario">
              Decimales de proceso
            </span>
            <select
              value={precisionProcesoTexto}
              onChange={(evento) =>
                setConfiguracionEstado((estadoActual) => ({
                  ...estadoActual,
                  precisionProceso: convertirTextoModoPrecision(
                    evento.target.value,
                  ),
                }))
              }
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.08rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
            >
              <option value="completo">Completo</option>
              {DECIMALES_DISPONIBLES.map((valor) => (
                <option key={valor} value={valor}>
                  {valor}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[1.02rem] font-medium text-texto-secundario">
              Decimales del resultado
            </span>
            <select
              value={precisionResultadoTexto}
              onChange={(evento) =>
                setConfiguracionEstado((estadoActual) => ({
                  ...estadoActual,
                  precisionResultado: convertirTextoModoPrecision(
                    evento.target.value,
                  ),
                }))
              }
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.08rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
            >
              <option value="completo">Completo</option>
              {DECIMALES_DISPONIBLES.map((valor) => (
                <option key={valor} value={valor}>
                  {valor}
                </option>
              ))}
            </select>
          </label>

          {configuracion.usaLogaritmos ? (
            <label className="flex flex-col gap-2">
              <span className="text-[1.02rem] font-medium text-texto-secundario">
                Tipo de logaritmo
              </span>
              <select
                value={configuracionEstado.tipoLogaritmo}
                onChange={(evento) =>
                  setConfiguracionEstado((estadoActual) => ({
                    ...estadoActual,
                    tipoLogaritmo: evento.target.value as "ln" | "log10",
                  }))
                }
                className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.08rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
              >
                <option value="ln">ln</option>
                <option value="log10">log10</option>
              </select>
            </label>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          {configuracion.ejemplos.map((ejemplo) => (
            <button
              key={ejemplo.etiqueta}
              type="button"
              onClick={() => {
                aplicarFilasDesdePares(ejemplo.pares);
                setMensajeEstado({
                  tipo: "info",
                  texto: `${ejemplo.etiqueta} cargado correctamente.`,
                });
              }}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-5 text-[1.02rem] font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
            >
              Cargar {ejemplo.etiqueta}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-5" onPaste={(evento) => {
          evento.preventDefault();
          aplicarPegadoDirecto(evento.clipboardData.getData("text"));
        }}>
          <div className="rounded-[1.5rem] border border-verde-claro bg-white/90 p-4 text-sm leading-7 text-texto-secundario">
            Puedes pegar dos columnas X y Y desde Excel usando tabulaciones,
            saltos de linea, punto y coma o espacios razonables. Se aceptan
            decimales con coma o con punto.
          </div>

          <div className="overflow-hidden rounded-[1.6rem] border border-verde-claro bg-white/90">
            <div className="max-h-[760px] overflow-auto">
              <table className="min-w-[760px] w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-panel-resalte text-left text-[1rem] text-acento-oscuro">
                  <tr>
                    <th className="w-16 border-b border-verde-claro px-4 py-4 font-semibold">
                      #
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {nombreXVisible}
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {nombreYVisible}
                    </th>
                    <th className="w-44 border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      Accion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filas.map((fila, indice) => {
                    const errores = erroresFilas[fila.id];
                    return (
                      <tr
                        key={fila.id}
                        className={indice % 2 === 0 ? "bg-white/90" : "bg-[#f4f8f4]"}
                      >
                        <td className="border-b border-verde-claro px-4 py-3 align-top text-[1.05rem] text-texto-principal">
                          {indice + 1}
                        </td>
                        <td className="border-b border-l border-verde-claro px-3 py-3 align-top">
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={fila.x}
                              onKeyDown={(evento) =>
                                manejarTeclaEntradaNumerica(evento, {
                                  permitirDecimal: true,
                                  permitirNegativo: permiteNegativoCampo("x"),
                                })
                              }
                              onChange={(evento) =>
                                actualizarFila(fila.id, "x", evento.target.value)
                              }
                              placeholder={
                                regresionId === "regresion-potencial"
                                  ? "Solo positivos"
                                  : "Numero"
                              }
                              className={`min-h-14 rounded-[1.15rem] border px-4 text-[1.05rem] text-texto-principal outline-none transition focus:ring-4 ${
                                errores?.x
                                  ? "border-alerta/50 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                                  : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                              }`}
                            />
                            {errores?.x ? (
                              <p className="text-sm text-alerta">{errores.x}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="border-b border-l border-verde-claro px-3 py-3 align-top">
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={fila.y}
                              onKeyDown={(evento) =>
                                manejarTeclaEntradaNumerica(evento, {
                                  permitirDecimal: true,
                                  permitirNegativo: permiteNegativoCampo("y"),
                                })
                              }
                              onChange={(evento) =>
                                actualizarFila(fila.id, "y", evento.target.value)
                              }
                              placeholder={
                                regresionId === "regresion-exponencial" ||
                                regresionId === "regresion-potencial"
                                  ? "Mayor que 0"
                                  : "Numero"
                              }
                              className={`min-h-14 rounded-[1.15rem] border px-4 text-[1.05rem] text-texto-principal outline-none transition focus:ring-4 ${
                                errores?.y
                                  ? "border-alerta/50 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                                  : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                              }`}
                            />
                            {errores?.y ? (
                              <p className="text-sm text-alerta">{errores.y}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="border-b border-l border-verde-claro px-3 py-3 align-top">
                          <button
                            type="button"
                            onClick={() => eliminarFila(fila.id)}
                            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-[#eff6ef] px-5 text-[1.02rem] font-semibold text-acento-principal transition hover:border-acento-principal hover:bg-verde-suave"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={agregarFila}
              disabled={filas.length >= MAXIMO_FILAS}
              className={`min-h-14 rounded-[1.15rem] px-6 text-[1.05rem] font-semibold transition ${
                filas.length < MAXIMO_FILAS
                  ? "border border-verde-claro bg-white text-acento-principal hover:border-acento-principal hover:bg-verde-suave"
                  : "cursor-not-allowed border border-verde-claro bg-[#eff3ef] text-texto-secundario"
              }`}
            >
              Agregar fila
            </button>

            <button
              type="button"
              onClick={pegarDesdePortapapeles}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.05rem] font-semibold text-acento-principal transition hover:border-acento-principal hover:bg-verde-suave"
            >
              Pegar desde portapapeles
            </button>

            <button
              type="button"
              onClick={limpiarDatos}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.05rem] font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal"
            >
              Limpiar datos
            </button>

            <button
              type="button"
              onClick={calcular}
              className="min-h-14 rounded-[1.15rem] bg-acento-principal px-7 text-[1.05rem] font-semibold text-white shadow-[0_12px_28px_rgba(0,98,65,0.22)] transition hover:bg-acento-oscuro"
            >
              Calcular
            </button>
          </div>
        </div>

        {mensajeEstado ? (
          <div
            className={`rounded-[1.2rem] border px-4 py-3 text-sm leading-7 ${obtenerClasesMensaje(
              mensajeEstado.tipo,
            )}`}
          >
            {mensajeEstado.texto}
          </div>
        ) : null}
      </BloqueSeccion>

      <BloqueSeccion
        titulo="3. Personalizar interpretacion"
        descripcion="Estos campos son opcionales y sirven para generar una lectura mas clara del modelo y de la grafica."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <CampoTexto
            etiqueta="Nombre de X"
            valor={configuracionEstado.personalizacion.nombreVariableX}
            onChange={(valor) =>
              setConfiguracionEstado((estadoActual) => ({
                ...estadoActual,
                personalizacion: {
                  ...estadoActual.personalizacion,
                  nombreVariableX: valor,
                },
              }))
            }
            placeholder="Ejemplo: ancho de banda"
          />
          <CampoTexto
            etiqueta="Unidad de X"
            valor={configuracionEstado.personalizacion.unidadVariableX}
            onChange={(valor) =>
              setConfiguracionEstado((estadoActual) => ({
                ...estadoActual,
                personalizacion: {
                  ...estadoActual.personalizacion,
                  unidadVariableX: valor,
                },
              }))
            }
            placeholder="Ejemplo: Mbps"
          />
          <CampoTexto
            etiqueta="Nombre de Y"
            valor={configuracionEstado.personalizacion.nombreVariableY}
            onChange={(valor) =>
              setConfiguracionEstado((estadoActual) => ({
                ...estadoActual,
                personalizacion: {
                  ...estadoActual.personalizacion,
                  nombreVariableY: valor,
                },
              }))
            }
            placeholder="Ejemplo: latencia promedio"
          />
          <CampoTexto
            etiqueta="Unidad de Y"
            valor={configuracionEstado.personalizacion.unidadVariableY}
            onChange={(valor) =>
              setConfiguracionEstado((estadoActual) => ({
                ...estadoActual,
                personalizacion: {
                  ...estadoActual.personalizacion,
                  unidadVariableY: valor,
                },
              }))
            }
            placeholder="Ejemplo: ms"
          />
          <div className="xl:col-span-2">
            <CampoTexto
              etiqueta="Contexto del ejercicio"
              valor={configuracionEstado.personalizacion.contexto}
              onChange={(valor) =>
                setConfiguracionEstado((estadoActual) => ({
                  ...estadoActual,
                  personalizacion: {
                    ...estadoActual.personalizacion,
                    contexto: valor,
                  },
                }))
              }
              placeholder="Ejemplo: empresa proveedora de internet"
            />
          </div>
        </div>
      </BloqueSeccion>

      {resultado ? (
        <>
          <BloqueSeccion
            titulo="4. Tabla de calculo"
            descripcion="La tabla se genera con la precision de proceso seleccionada para que puedas replicar el procedimiento manual o trabajar con maxima precision."
          >
            <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
              <table className="min-w-[780px] border-separate border-spacing-0">
                <thead>
                  <tr>
                    {resultado.tablaCalculo.columnas.map((columna) => (
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
                  {resultado.tablaCalculo.filas.map((fila) => (
                    <tr key={fila.etiquetaFila}>
                      {fila.valores.map((valor, indice) => (
                        <td
                          key={`${fila.etiquetaFila}-${indice}`}
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
          </BloqueSeccion>

          <BloqueSeccion
            titulo="5. Sumatorias"
            descripcion="Estas sumatorias se usan directamente en las formulas del modelo seleccionado."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {resultado.sumatorias.map((sumatoria) => (
                <TarjetaDato
                  key={sumatoria.etiqueta}
                  titulo={sumatoria.etiqueta}
                  valor={sumatoria.valorVisible}
                />
              ))}
            </div>
          </BloqueSeccion>

          <BloqueSeccion
            titulo="6. Procedimiento"
            descripcion="Se muestra el reemplazo en las formulas y el desarrollo principal hasta obtener los coeficientes."
          >
            <div className="flex flex-col gap-4">
              {resultado.pasos.map((paso) => (
                <article
                  key={`${paso.titulo}-${paso.expresion}-${paso.resultado}`}
                  className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4"
                >
                  <p className="text-lg font-semibold text-texto-principal">
                    {paso.titulo}
                  </p>
                  {paso.descripcion ? (
                    <p className="mt-2 text-sm leading-7 text-texto-secundario">
                      {paso.descripcion}
                    </p>
                  ) : null}
                  {paso.expresion ? (
                    <p className="mt-3 rounded-[1rem] border border-verde-claro bg-white px-4 py-3 text-sm leading-7 text-texto-principal">
                      {paso.expresion}
                    </p>
                  ) : null}
                  {paso.resultado ? (
                    <p className="mt-3 text-sm font-semibold leading-7 text-acento-oscuro">
                      {paso.resultado}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </BloqueSeccion>

          <BloqueSeccion
            titulo="7. Coeficientes y ecuacion final"
            descripcion="Aqui se muestran los coeficientes visibles segun los decimales del resultado y la ecuacion final del ajuste."
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {resultado.coeficientes.map((coeficiente) => (
                <TarjetaDato
                  key={coeficiente.simbolo}
                  titulo={coeficiente.simbolo}
                  valor={coeficiente.valorVisible}
                />
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-acento-secundario">
                Ecuacion final
              </p>
              <p className="mt-3 text-[1.45rem] font-semibold text-texto-principal">
                {resultado.ecuacionFinal}
              </p>
              {resultado.ecuacionAlterna ? (
                <p className="mt-3 text-sm leading-7 text-texto-secundario">
                  Forma alterna: {resultado.ecuacionAlterna}
                </p>
              ) : null}
            </div>
          </BloqueSeccion>

          <BloqueSeccion
            titulo="8. Estimaciones"
            descripcion="Puedes estimar Y dado un X o despejar X dado un Y cuando el modelo lo permite."
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <CampoTexto
                etiqueta={`Ingresar ${nombreXVisible} para estimar ${nombreYVisible}`}
                valor={textoEstimarYDesdeX}
                onChange={(valor) =>
                  setTextoEstimarYDesdeX(
                    sanitizarTextoEntradaNumerica(valor, {
                      permitirDecimal: true,
                      permitirNegativo: regresionId !== "regresion-potencial",
                    }),
                  )
                }
                placeholder="Ejemplo: 12,5"
              />
              <CampoTexto
                etiqueta={`Ingresar ${nombreYVisible} para estimar ${nombreXVisible}`}
                valor={textoEstimarXDesdeY}
                onChange={(valor) =>
                  setTextoEstimarXDesdeY(
                    sanitizarTextoEntradaNumerica(valor, {
                      permitirDecimal: true,
                      permitirNegativo:
                        regresionId === "regresion-lineal-simple" ||
                        regresionId === "regresion-cuadratica",
                    }),
                  )
                }
                placeholder="Ejemplo: 20"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={calcularEstimaciones}
                className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.05rem] font-semibold text-white transition hover:bg-acento-oscuro"
              >
                Calcular estimaciones
              </button>
            </div>

            {resultado.estimaciones.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {resultado.estimaciones.map((estimacion) => (
                  <article
                    key={`${estimacion.titulo}-${estimacion.entrada}`}
                    className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4"
                  >
                    <p className="text-lg font-semibold text-texto-principal">
                      {estimacion.titulo}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-texto-secundario">
                      {estimacion.entrada}
                    </p>
                    <p className="mt-3 text-[1.2rem] font-semibold text-acento-oscuro">
                      {estimacion.resultadoVisible}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-texto-secundario">
                      {estimacion.detalle}
                    </p>
                  </article>
                ))}
              </div>
            ) : null}
          </BloqueSeccion>

          <BloqueSeccion
            titulo="9. Interpretacion"
            descripcion="Se genera una lectura generica del modelo usando los nombres personalizados de las variables cuando el usuario los define."
          >
            <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
              <p className="text-base leading-8 text-texto-secundario">
                {resultado.interpretacion}
              </p>
              {resultado.observaciones.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {resultado.observaciones.map((observacion) => (
                    <li
                      key={observacion}
                      className="text-sm leading-7 text-texto-secundario"
                    >
                      {observacion}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </BloqueSeccion>

          <BloqueSeccion
            titulo="10. Grafica final de la regresion"
            descripcion="La grafica usa los puntos originales y la ecuacion final del modelo en escala real X, Y."
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {[
                {
                  clave: "mostrarPuntosOriginales" as const,
                  etiqueta: "Mostrar puntos originales",
                },
                {
                  clave: "mostrarCurvaRegresion" as const,
                  etiqueta: "Mostrar curva de regresion",
                },
                {
                  clave: "mostrarEtiquetasPuntos" as const,
                  etiqueta: "Mostrar etiquetas de puntos",
                },
                {
                  clave: "mostrarCuadricula" as const,
                  etiqueta: "Mostrar cuadricula",
                },
              ].map((opcion) => (
                <label
                  key={opcion.clave}
                  className="flex min-h-14 items-center gap-3 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.02rem] text-texto-principal"
                >
                  <input
                    type="checkbox"
                    checked={configuracionGrafica[opcion.clave]}
                    onChange={(evento) =>
                      setConfiguracionGrafica((estadoActual) => ({
                        ...estadoActual,
                        [opcion.clave]: evento.target.checked,
                      }))
                    }
                    className="h-5 w-5 accent-[var(--color-acento-principal)]"
                  />
                  {opcion.etiqueta}
                </label>
              ))}
            </div>

            <GraficaRegresionCanvas
              key={`${resultado.id}-${resultado.ecuacionFinal}-${resultado.estimaciones
                .map(
                  (estimacion) =>
                    `${estimacion.titulo}-${estimacion.entrada}-${estimacion.resultadoVisible}`,
                )
                .join("|")}`}
              resultado={resultado}
              configuracionGrafica={configuracionGrafica}
              estimaciones={resultado.estimaciones}
              lienzoRefExterno={lienzoGraficaRef}
            />

            {resultado.advertenciasGrafica.length > 0 ? (
              <div className="rounded-[1.2rem] border border-alerta/20 bg-alerta/8 px-4 py-3 text-sm leading-7 text-alerta">
                {resultado.advertenciasGrafica.join(" ")}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportar}
                disabled={exportandoExcel}
                className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.05rem] font-semibold text-white transition hover:bg-acento-oscuro disabled:cursor-not-allowed disabled:opacity-70"
              >
                {exportandoExcel ? "Exportando..." : "Exportar a Excel"}
              </button>
            </div>
          </BloqueSeccion>
        </>
      ) : null}
    </div>
  );
}
