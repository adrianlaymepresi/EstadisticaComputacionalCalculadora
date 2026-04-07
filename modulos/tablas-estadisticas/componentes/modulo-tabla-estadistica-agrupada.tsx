"use client";

import { useState } from "react";
import { normalizarNombreArchivo } from "@/modulos/diagrama-burbujas/servicios/exportador";
import { parsearDatosTabla } from "@/modulos/diagrama-burbujas/utilidades/validaciones";
import { calcularDistribucionArbitraria } from "@/modulos/distribucion-arbitraria/servicios/calculos-distribucion-arbitraria";
import type { ResultadoDistribucionArbitraria } from "@/modulos/distribucion-arbitraria/tipos";

const MINIMO_DATOS = 14;
const FILAS_INICIALES = 3;
const COLUMNAS_INICIALES = 5;
const MAX_FILAS_CAPTURA = 20;
const MAX_COLUMNAS_CAPTURA = 20;
const MAXIMO_DATOS_STURGES = 16999;

type MetodoTablaAgrupada = "arbitraria" | "sturges";
type DireccionRedondeoSturges = "arriba" | "abajo";

interface MensajeEstado {
  tipo: "error" | "exito" | "info";
  texto: string;
}

export interface ResumenMetodoTablaAgrupada {
  metodo: MetodoTablaAgrupada;
  kUsado: number;
  kFueManual: boolean;
  kExacto?: number | null;
  direccionRedondeo?: DireccionRedondeoSturges | null;
}

export interface ConfiguracionExportacionTablaAgrupada {
  numeroTabla: string;
  tituloDescriptivo: string;
  datosOriginales: string[][];
  resultado: ResultadoDistribucionArbitraria;
  resumenMetodo: ResumenMetodoTablaAgrupada;
}

interface ModuloTablaEstadisticaAgrupadaProps {
  metodo: MetodoTablaAgrupada;
  exportarExcel: (
    configuracion: ConfiguracionExportacionTablaAgrupada,
    nombreArchivo: string,
  ) => Promise<void>;
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

function normalizarNumero(texto: string): string {
  const limpio = texto.replace(/\s+/g, "").trim();

  if (!limpio) {
    return "";
  }

  const tieneComa = limpio.includes(",");
  const tienePunto = limpio.includes(".");

  if (tieneComa && tienePunto) {
    if (limpio.lastIndexOf(",") > limpio.lastIndexOf(".")) {
      return limpio.replace(/\./g, "").replace(",", ".");
    }

    return limpio.replace(/,/g, "");
  }

  if (tienePunto) {
    const partes = limpio.split(".");

    if (partes.length > 2) {
      return limpio.replace(/\./g, "");
    }

    if (partes.length === 2 && partes[1].length === 3) {
      return limpio.replace(/\./g, "");
    }

    return limpio;
  }

  if (tieneComa) {
    const partes = limpio.split(",");

    if (partes.length > 2) {
      return limpio.replace(/,/g, "");
    }

    if (partes.length === 2 && partes[1].length === 3) {
      return limpio.replace(/,/g, "");
    }

    return limpio.replace(",", ".");
  }

  return limpio;
}

function parsearNumero(texto: string): number | null {
  const normalizado = normalizarNumero(texto);

  if (!normalizado) {
    return null;
  }

  const valor = Number(normalizado);
  return Number.isFinite(valor) ? valor : null;
}

function contarDecimalesDesdeTexto(texto: string): number {
  const normalizado = normalizarNumero(texto);
  const partes = normalizado.split(".");
  return partes[1]?.length ?? 0;
}

function detectarPrecision(textos: string[]): number {
  return textos.reduce(
    (maximo, texto) => Math.max(maximo, contarDecimalesDesdeTexto(texto)),
    0,
  );
}

function formatearNumero(valor: number, decimales = 4): string {
  const texto = valor.toFixed(decimales);
  const textoLimpio = texto.indexOf(".") >= 0 ? texto.replace(/\.?0+$/, "") : texto;
  return textoLimpio.replace(".", ",");
}

function formatearNumeroFijo(valor: number, decimales: number): string {
  return valor.toFixed(decimales).replace(".", ",");
}

function formatearNumeroEntrada(valor: number, precision: number): string {
  const decimales = Math.max(precision, 0);
  const texto = valor.toFixed(decimales);
  return texto.replace(/\.?0+$/, "");
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

function calcularKSturges(
  cantidadDatos: number,
  direccionRedondeo: DireccionRedondeoSturges,
) {
  const kExacto = 1 + 3.3 * Math.log10(cantidadDatos);
  const kRedondeado =
    direccionRedondeo === "arriba" ? Math.ceil(kExacto) : Math.floor(kExacto);

  return {
    kExacto,
    kRedondeado: Math.max(1, kRedondeado),
  };
}

function convertirAUnidadesCorreccion(valor: number, paso: number): number {
  return Math.round(valor / paso);
}

function convertirDesdeUnidadesCorreccion(
  unidades: number,
  paso: number,
  precision: number,
) {
  return Number((unidades * paso).toFixed(Math.max(precision, 4)));
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
  max,
  step,
  placeholder,
  disabled = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  tipo?: "text" | "number";
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.02rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <input
        type={tipo}
        min={min}
        max={max}
        step={step}
        value={valor}
        disabled={disabled}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10 disabled:cursor-not-allowed disabled:bg-[#f3f4f1] disabled:text-texto-secundario"
      />
    </label>
  );
}

function CampoSelector({
  etiqueta,
  valor,
  onChange,
  opciones,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  opciones: Array<{ etiqueta: string; valor: string }>;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.02rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <select
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      >
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.etiqueta}
          </option>
        ))}
      </select>
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

export function ModuloTablaEstadisticaAgrupada({
  metodo,
  exportarExcel,
}: ModuloTablaEstadisticaAgrupadaProps) {
  const esMetodoArbitrario = metodo === "arbitraria";
  const [numeroTabla, setNumeroTabla] = useState("1");
  const [tituloDescriptivo, setTituloDescriptivo] = useState(
    "Descripcion de la muestra o de los datos analizados",
  );
  const [filasCaptura, setFilasCaptura] = useState(FILAS_INICIALES);
  const [columnasCaptura, setColumnasCaptura] = useState(COLUMNAS_INICIALES);
  const [matrizDatos, setMatrizDatos] = useState<string[][]>(() =>
    crearMatriz(FILAS_INICIALES, COLUMNAS_INICIALES),
  );
  const [kInicial, setKInicial] = useState("6");
  const [direccionRedondeoSturges, setDireccionRedondeoSturges] =
    useState<DireccionRedondeoSturges>("arriba");
  const [kManualRecalculo, setKManualRecalculo] = useState("");
  const [tManual, setTManual] = useState("");
  const [noPermitirNegativos, setNoPermitirNegativos] = useState(true);
  const [ajusteInferiorPersonalizado, setAjusteInferiorPersonalizado] =
    useState("");
  const [ajusteSuperiorPersonalizado, setAjusteSuperiorPersonalizado] =
    useState("");
  const [usarRedistribucionPersonalizada, setUsarRedistribucionPersonalizada] =
    useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [resultado, setResultado] = useState<ResultadoDistribucionArbitraria | null>(
    null,
  );
  const [resumenMetodo, setResumenMetodo] =
    useState<ResumenMetodoTablaAgrupada | null>(null);
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
    setResumenMetodo(null);
    setKManualRecalculo("");
    setUsarRedistribucionPersonalizada(false);
    setAjusteInferiorPersonalizado("");
    setAjusteSuperiorPersonalizado("");
    setMensajeEstado({
      tipo: "info",
      texto: "La tabla de captura fue limpiada.",
    });
  };

  const resolverK = (
    cantidadDatos: number,
    usarKManual: boolean,
  ): ResumenMetodoTablaAgrupada => {
    if (usarKManual && kManualRecalculo.trim()) {
      const kManual = Number(kManualRecalculo);

      if (!Number.isInteger(kManual) || kManual <= 0) {
        throw new Error("El k manual debe ser un numero entero positivo.");
      }

      return {
        metodo,
        kUsado: kManual,
        kFueManual: true,
        kExacto: esMetodoArbitrario
          ? null
          : calcularKSturges(cantidadDatos, direccionRedondeoSturges).kExacto,
        direccionRedondeo: esMetodoArbitrario ? null : direccionRedondeoSturges,
      };
    }

    if (esMetodoArbitrario) {
      const k = Number(kInicial);

      if (!Number.isInteger(k) || k <= 0) {
        throw new Error("k debe ser un numero entero positivo.");
      }

      return {
        metodo,
        kUsado: k,
        kFueManual: false,
        kExacto: null,
        direccionRedondeo: null,
      };
    }

    const { kExacto, kRedondeado } = calcularKSturges(
      cantidadDatos,
      direccionRedondeoSturges,
    );

    return {
      metodo,
      kUsado: kRedondeado,
      kFueManual: false,
      kExacto,
      direccionRedondeo: direccionRedondeoSturges,
    };
  };

  const construirTabla = (usarKManual = false) => {
    const celdasNoVacias = matrizDatos.flat().filter((celda) => celda.trim() !== "");
    const datosParseados = celdasNoVacias.map((celda) => ({
      texto: celda,
      valor: parsearNumero(celda),
    }));
    const celdasInvalidas = datosParseados.filter((dato) => dato.valor === null);
    const valorTManual = tManual.trim() ? parsearNumero(tManual) : null;

    if (celdasInvalidas.length > 0) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Hay celdas con valores no numericos. Corrigelas antes de construir la tabla estadistica.",
      });
      return;
    }

    if (datosParseados.length < MINIMO_DATOS) {
      setMensajeEstado({
        tipo: "error",
        texto: `Debes ingresar como minimo ${MINIMO_DATOS} datos validos.`,
      });
      return;
    }

    if (!esMetodoArbitrario && datosParseados.length > MAXIMO_DATOS_STURGES) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Para la tecnica de Sturges necesitas una cantidad de datos mayor a 14 e inferior a 17.000.",
      });
      return;
    }

    if (valorTManual !== null && (valorTManual <= 0 || !Number.isFinite(valorTManual))) {
      setMensajeEstado({
        tipo: "error",
        texto: "El valor manual de t debe ser un numero positivo.",
      });
      return;
    }

    try {
      const precision = detectarPrecision(celdasNoVacias);
      const resumenK = resolverK(datosParseados.length, usarKManual);
      const ajusteInferiorPreferido =
        usarRedistribucionPersonalizada && ajusteInferiorPersonalizado.trim()
          ? parsearNumero(ajusteInferiorPersonalizado)
          : null;

      if (
        usarRedistribucionPersonalizada &&
        ajusteInferiorPersonalizado.trim() &&
        ajusteInferiorPreferido === null
      ) {
        throw new Error(
          "El ajuste inferior personalizado debe ser un numero valido.",
        );
      }

      const resultadoCalculado = calcularDistribucionArbitraria({
        datos: datosParseados.map((dato) => dato.valor as number),
        precision,
        k: resumenK.kUsado,
        tManual: valorTManual,
        noPermitirNegativos,
        ajusteInferiorPreferido:
          usarRedistribucionPersonalizada && ajusteInferiorPreferido !== null
            ? ajusteInferiorPreferido
            : null,
      });

      setResultado(resultadoCalculado);
      setResumenMetodo(resumenK);
      setAjusteInferiorPersonalizado(
        formatearNumeroEntrada(
          usarRedistribucionPersonalizada
            ? resultadoCalculado.ajusteInferior
            : resultadoCalculado.ajusteInferiorPredeterminado,
          resultadoCalculado.precision,
        ),
      );
      setAjusteSuperiorPersonalizado(
        formatearNumeroEntrada(
          usarRedistribucionPersonalizada
            ? resultadoCalculado.ajusteSuperior
            : resultadoCalculado.ajusteSuperiorPredeterminado,
          resultadoCalculado.precision,
        ),
      );
      setMensajeEstado({
        tipo: "exito",
        texto: "Tabla estadistica construida correctamente.",
      });
    } catch (error) {
      console.error("No se pudo construir la tabla estadistica:", error);
      setResultado(null);
      setResumenMetodo(null);
      setMensajeEstado({
        tipo: "error",
        texto:
          error instanceof Error
            ? error.message
            : "No se pudo construir la tabla estadistica.",
      });
    }
  };

  const actualizarRedistribucionDesdeInferior = (valor: string) => {
    if (!resultado) {
      setAjusteInferiorPersonalizado(valor);
      return;
    }

    const valorNumerico = parsearNumero(valor);

    if (valorNumerico === null) {
      setAjusteInferiorPersonalizado(valor);
      return;
    }

    const paso = resultado.c;
    const minimoUnidades = convertirAUnidadesCorreccion(
      resultado.ajusteInferiorMinimo,
      paso,
    );
    const maximoUnidades = convertirAUnidadesCorreccion(
      resultado.ajusteInferiorMaximo,
      paso,
    );
    const valorUnidades = convertirAUnidadesCorreccion(valorNumerico, paso);
    const ajusteInferiorUnidades = Math.min(
      maximoUnidades,
      Math.max(minimoUnidades, valorUnidades),
    );
    const ajusteSuperiorUnidades =
      resultado.unidadesCorreccion - ajusteInferiorUnidades;

    setUsarRedistribucionPersonalizada(true);
    setAjusteInferiorPersonalizado(
      formatearNumeroEntrada(
        convertirDesdeUnidadesCorreccion(
          ajusteInferiorUnidades,
          paso,
          resultado.precision,
        ),
        resultado.precision,
      ),
    );
    setAjusteSuperiorPersonalizado(
      formatearNumeroEntrada(
        convertirDesdeUnidadesCorreccion(
          ajusteSuperiorUnidades,
          paso,
          resultado.precision,
        ),
        resultado.precision,
      ),
    );
  };

  const actualizarRedistribucionDesdeSuperior = (valor: string) => {
    if (!resultado) {
      setAjusteSuperiorPersonalizado(valor);
      return;
    }

    const valorNumerico = parsearNumero(valor);

    if (valorNumerico === null) {
      setAjusteSuperiorPersonalizado(valor);
      return;
    }

    const paso = resultado.c;
    const minimoSuperiorUnidades =
      resultado.unidadesCorreccion -
      convertirAUnidadesCorreccion(resultado.ajusteInferiorMaximo, paso);
    const maximoSuperiorUnidades =
      resultado.unidadesCorreccion -
      convertirAUnidadesCorreccion(resultado.ajusteInferiorMinimo, paso);
    const valorUnidades = convertirAUnidadesCorreccion(valorNumerico, paso);
    const ajusteSuperiorUnidades = Math.min(
      maximoSuperiorUnidades,
      Math.max(minimoSuperiorUnidades, valorUnidades),
    );
    const ajusteInferiorUnidades =
      resultado.unidadesCorreccion - ajusteSuperiorUnidades;

    setUsarRedistribucionPersonalizada(true);
    setAjusteSuperiorPersonalizado(
      formatearNumeroEntrada(
        convertirDesdeUnidadesCorreccion(
          ajusteSuperiorUnidades,
          paso,
          resultado.precision,
        ),
        resultado.precision,
      ),
    );
    setAjusteInferiorPersonalizado(
      formatearNumeroEntrada(
        convertirDesdeUnidadesCorreccion(
          ajusteInferiorUnidades,
          paso,
          resultado.precision,
        ),
        resultado.precision,
      ),
    );
  };

  const restablecerRedistribucion = () => {
    if (!resultado) {
      return;
    }

    setUsarRedistribucionPersonalizada(false);
    setAjusteInferiorPersonalizado(
      formatearNumeroEntrada(
        resultado.ajusteInferiorPredeterminado,
        resultado.precision,
      ),
    );
    setAjusteSuperiorPersonalizado(
      formatearNumeroEntrada(
        resultado.ajusteSuperiorPredeterminado,
        resultado.precision,
      ),
    );
    setMensajeEstado({
      tipo: "info",
      texto:
        "Se restablecio la redistribucion predeterminada del excedente. Presiona Volver a calcular para aplicarla.",
    });
  };

  const exportar = async () => {
    if (!resultado || !resumenMetodo) {
      return;
    }

    setExportandoExcel(true);

    try {
      await exportarExcel(
        {
          numeroTabla: `Tabla N° ${numeroTabla.trim() || "1"}`,
          tituloDescriptivo: tituloDescriptivo.trim(),
          datosOriginales: matrizDatos,
          resultado,
          resumenMetodo,
        },
        normalizarNombreArchivo(
          `${metodo}-tabla-${numeroTabla.trim() || "1"}`,
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

  const tituloPrincipal = esMetodoArbitrario
    ? "Tecnica de Distribucion Arbitraria"
    : "Tecnica de Sturges";
  const descripcionPrincipal = esMetodoArbitrario
    ? "Captura tus datos en una tabla, elige el numero de intervalos y construye la tabla estadistica agrupada paso a paso con recalculo manual de parametros."
    : "Captura tus datos en una tabla y calcula la agrupacion por la regla de Sturges, con redondeo inicial del valor de k, redistribucion del excedente y recalculo manual.";

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[2.6rem] font-semibold tracking-tight text-acento-oscuro sm:text-[4rem]">
          {tituloPrincipal}
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          {descripcionPrincipal}
        </p>
      </header>

      <BloqueModulo
        titulo="1. Ingreso de datos"
        descripcion={
          esMetodoArbitrario
            ? "Define la tabla, pega tus datos desde Excel y configura los parametros iniciales para la distribucion arbitraria."
            : "Define la tabla, pega tus datos desde Excel y configura el redondeo inicial de k para la tecnica de Sturges."
        }
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
            {esMetodoArbitrario ? (
              <CampoFormulario
                etiqueta="Numero de intervalos (k)"
                valor={kInicial}
                onChange={setKInicial}
                tipo="number"
                min={1}
              />
            ) : (
              <CampoSelector
                etiqueta="Redondeo inicial de k"
                valor={direccionRedondeoSturges}
                onChange={(valor) =>
                  setDireccionRedondeoSturges(
                    valor as DireccionRedondeoSturges,
                  )
                }
                opciones={[
                  { etiqueta: "Hacia arriba", valor: "arriba" },
                  { etiqueta: "Hacia abajo", valor: "abajo" },
                ]}
              />
            )}
            <CampoFormulario
              etiqueta="Tamaño de clase manual (opcional)"
              valor={tManual}
              onChange={setTManual}
              placeholder="Dejalo vacio para calcularlo automaticamente"
            />
          </div>

          {!esMetodoArbitrario ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <TarjetaDato titulo="Formula de k" valor="1 + 3,3 * log10(n)" />
              <TarjetaDato titulo="Minimo de datos" valor={`${MINIMO_DATOS + 1} o mas`} />
              <TarjetaDato titulo="Maximo permitido" valor="16.999" />
            </div>
          ) : null}

          <label className="flex items-center gap-3 rounded-[1.15rem] border border-verde-claro bg-[#f9fbf7] px-4 py-4 text-[1.05rem] text-texto-principal">
            <input
              type="checkbox"
              checked={noPermitirNegativos}
              onChange={(evento) => setNoPermitirNegativos(evento.target.checked)}
              className="h-5 w-5 rounded border-verde-claro text-acento-principal focus:ring-acento-principal"
            />
            <span>No permitir que el minimo corregido baje de 0</span>
          </label>

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
                          inputMode="decimal"
                          value={celda}
                          onChange={(evento) =>
                            actualizarCelda(
                              indiceFila,
                              indiceColumna,
                              evento.target.value,
                            )
                          }
                          className="min-h-12 w-full rounded-[0.95rem] border border-verde-claro bg-white px-3 text-[1rem] text-texto-principal outline-none transition focus:border-acento-principal"
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
              onClick={() => construirTabla(false)}
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
            <TarjetaDato titulo="Minimo requerido" valor={`${MINIMO_DATOS}`} />
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

      {resultado && resumenMetodo ? (
        <>
          <BloqueModulo
            titulo="2. Pasos 1 y 2"
            descripcion="Se determina el numero de datos y el alcance inicial a partir de los extremos del conjunto."
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              <TarjetaDato titulo="n" valor={`${resultado.n}`} />
              <TarjetaDato titulo="d" valor={formatearNumero(resultado.d)} />
              <TarjetaDato titulo="D" valor={formatearNumero(resultado.D)} />
              <TarjetaDato
                titulo="a = [d; D]"
                valor={`[${formatearNumero(resultado.alcance[0])}; ${formatearNumero(
                  resultado.alcance[1],
                )}]`}
              />
            </div>

            <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
              <p className="text-[1.06rem] leading-8 text-texto-principal">
                Datos ordenados:{" "}
                {resultado.datosOrdenados
                  .map((dato) => formatearNumero(dato))
                  .join(", ")}
              </p>
            </div>
          </BloqueModulo>

          <BloqueModulo
            titulo="3. Paso 3"
            descripcion="Se calcula la longitud de alcance respetando la precision detectada en los datos."
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              <TarjetaDato titulo="Precision" valor={`${resultado.precision} decimales`} />
              <TarjetaDato
                titulo="c"
                valor={formatearNumero(resultado.c, resultado.precision || 0)}
              />
              <TarjetaDato titulo="la" valor={formatearNumero(resultado.longitudAlcance)} />
              <TarjetaDato
                titulo="Formula"
                valor={`${formatearNumero(resultado.D)} - ${formatearNumero(
                  resultado.d,
                )} + ${formatearNumero(resultado.c, resultado.precision || 0)}`}
              />
            </div>
          </BloqueModulo>

          <BloqueModulo
            titulo="4. Paso 4"
            descripcion={
              esMetodoArbitrario
                ? "El investigador fija libremente el numero de intervalos o clases."
                : "El numero de intervalos se obtiene con la regla de Sturges y luego se redondea segun el criterio elegido."
            }
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              {esMetodoArbitrario ? (
                <TarjetaDato titulo="k" valor={`${resultado.k}`} />
              ) : (
                <>
                  <TarjetaDato
                    titulo="k exacto"
                    valor={formatearNumero(resumenMetodo.kExacto ?? 0, 4)}
                  />
                  <TarjetaDato
                    titulo="Redondeo"
                    valor={
                      resumenMetodo.direccionRedondeo === "arriba"
                        ? "Hacia arriba"
                        : "Hacia abajo"
                    }
                  />
                  <TarjetaDato titulo="k aplicado" valor={`${resultado.k}`} />
                  <TarjetaDato titulo="Formula" valor="1 + 3,3 * log10(n)" />
                </>
              )}

              <TarjetaDato
                titulo="Primer intervalo"
                valor={`I1 = [${formatearNumero(resultado.minimoCorregido)}; ${formatearNumero(
                  resultado.minimoCorregido + resultado.tAjustado,
                )})`}
              />
              <TarjetaDato
                titulo="Ultimo intervalo"
                valor={`Ik = [${formatearNumero(
                  resultado.intervalos[resultado.intervalos.length - 1]?.limiteInferior ?? 0,
                )}; ${formatearNumero(
                  resultado.intervalos[resultado.intervalos.length - 1]?.limiteSuperior ?? 0,
                )})`}
              />
            </div>
          </BloqueModulo>

          <BloqueModulo
            titulo="5. Paso 5"
            descripcion="Se calcula el tamaño de clase, se verifica la cobertura y se redistribuye la correccion para construir el alcance corregido."
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              <TarjetaDato
                titulo="t = la / k"
                valor={formatearNumero(
                  resultado.tBruto,
                  Math.max(4, resultado.precision + 2),
                )}
              />
              <TarjetaDato
                titulo={resultado.tManualAplicado ? "t manual usado" : "t ajustado"}
                valor={formatearNumero(resultado.tAjustado)}
              />
              <TarjetaDato titulo="t * k" valor={formatearNumero(resultado.cobertura)} />
              <TarjetaDato titulo="Correccion" valor={formatearNumero(resultado.correccion)} />
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <TarjetaDato
                titulo="Ajuste inferior"
                valor={`d - ${formatearNumero(resultado.ajusteInferior)}`}
              />
              <TarjetaDato
                titulo="Ajuste superior"
                valor={`D + ${formatearNumero(resultado.ajusteSuperior)}`}
              />
              <TarjetaDato
                titulo="Alcance corregido"
                valor={`[${formatearNumero(resultado.minimoCorregido)}; ${formatearNumero(
                  resultado.maximoCorregido,
                )}]`}
              />
            </div>

            <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
              <p className="text-[1.06rem] leading-8 text-texto-principal">
                Verificacion: {formatearNumero(resultado.tAjustado)} x {resultado.k} ={" "}
                {formatearNumero(resultado.cobertura)} {">= "}
                {formatearNumero(resultado.longitudAlcance)}.
              </p>
              <p className="mt-2 text-[1.06rem] leading-8 text-texto-principal">
                La redistribucion {usarRedistribucionPersonalizada ? "esta siendo personalizada" : "usa el criterio predeterminado"} y el ultimo intervalo semiabierto queda cubierto hasta{" "}
                {formatearNumero(resultado.ultimoLimiteSuperior)}.
              </p>
            </div>
          </BloqueModulo>

          <BloqueModulo
            titulo="6. Paso 6"
            descripcion="Se construye la tabla estadistica final con intervalos, conteo, frecuencias simples, relativas y acumuladas."
          >
            <div className="text-center">
              <h3 className="text-4xl font-semibold text-acento-oscuro">
                Tabla N° {numeroTabla.trim() || "1"}
              </h3>
              <p className="mt-3 text-[1.08rem] leading-8 text-texto-secundario">
                {tituloDescriptivo.trim()}
              </p>
            </div>

            <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
              <table className="min-w-[1180px] border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#A25508] text-white">
                    {["li", "Conteo", "fi", "hi", "pi", "Fi", "Hi", "Pi"].map((encabezado) => (
                      <th
                        key={encabezado}
                        className="border-b border-l border-white/15 px-4 py-4 text-left text-[1.15rem] font-semibold first:border-l-0"
                      >
                        {encabezado}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultado.intervalos.map((intervalo, indice) => (
                    <tr
                      key={`intervalo-${intervalo.indice}`}
                      className={indice % 2 === 0 ? "bg-white" : "bg-[#f9f3eb]"}
                    >
                      <td className="border-b border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                        [{formatearNumero(intervalo.limiteInferior)}; {formatearNumero(intervalo.limiteSuperior)})
                      </td>
                      <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                        {intervalo.conteo}
                      </td>
                      <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                        {intervalo.fi}
                      </td>
                      <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                        {formatearNumeroFijo(intervalo.hi, 4)}
                      </td>
                      <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                        {formatearNumeroFijo(intervalo.pi, 2)}%
                      </td>
                      <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                        {intervalo.Fi}
                      </td>
                      <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                        {formatearNumeroFijo(intervalo.Hi, 4)}
                      </td>
                      <td className="border-b border-l border-black/8 px-4 py-4 text-[1.08rem] text-texto-principal">
                        {formatearNumeroFijo(intervalo.Pi, 2)}%
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

          <BloqueModulo
            titulo="7. Recalculo manual"
            descripcion="Modifica k, fuerza un valor de t si lo necesitas y redistribuye el excedente dentro del rango permitido antes de recalcular."
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
              <CampoFormulario
                etiqueta="k manual para recalculo (opcional)"
                valor={kManualRecalculo}
                onChange={setKManualRecalculo}
                tipo="number"
                min={1}
                placeholder={
                  esMetodoArbitrario
                    ? "Si lo dejas vacio se usa el k inicial"
                    : "Si lo dejas vacio se usa el k de Sturges"
                }
              />
              <CampoFormulario
                etiqueta="Tamaño de clase manual (opcional)"
                valor={tManual}
                onChange={setTManual}
                placeholder="Puedes dejarlo vacio"
              />

              <label className="flex items-center gap-3 rounded-[1.15rem] border border-verde-claro bg-[#f9fbf7] px-4 py-4 text-[1.05rem] text-texto-principal xl:self-end">
                <input
                  type="checkbox"
                  checked={noPermitirNegativos}
                  onChange={(evento) => setNoPermitirNegativos(evento.target.checked)}
                  className="h-5 w-5 rounded border-verde-claro text-acento-principal focus:ring-acento-principal"
                />
                <span>No permitir valores negativos</span>
              </label>
            </div>

            <div className="rounded-[1.5rem] border border-verde-claro bg-[#f9fbf7] p-5">
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <CampoFormulario
                  etiqueta="Ajuste hacia d"
                  valor={ajusteInferiorPersonalizado}
                  onChange={actualizarRedistribucionDesdeInferior}
                  tipo="number"
                  min={resultado.ajusteInferiorMinimo}
                  max={resultado.ajusteInferiorMaximo}
                  step={resultado.c}
                  disabled={resultado.unidadesCorreccion === 0}
                />
                <CampoFormulario
                  etiqueta="Ajuste hacia D"
                  valor={ajusteSuperiorPersonalizado}
                  onChange={actualizarRedistribucionDesdeSuperior}
                  tipo="number"
                  min={Math.max(
                    0,
                    Number(
                      (
                        resultado.correccion - resultado.ajusteInferiorMaximo
                      ).toFixed(Math.max(resultado.precision, 4)),
                    ),
                  )}
                  max={resultado.correccion - resultado.ajusteInferiorMinimo}
                  step={resultado.c}
                  disabled={resultado.unidadesCorreccion === 0}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={restablecerRedistribucion}
                  disabled={resultado.unidadesCorreccion === 0}
                  className={`min-h-12 rounded-[1rem] px-5 text-[1rem] font-semibold transition ${
                    resultado.unidadesCorreccion > 0
                      ? "border border-verde-claro bg-white text-texto-principal hover:border-acento-principal hover:text-acento-principal"
                      : "cursor-not-allowed bg-[#e2e6e1] text-texto-secundario"
                  }`}
                >
                  Usar distribucion predeterminada
                </button>
              </div>

              <p className="mt-4 text-[1.02rem] leading-7 text-texto-secundario">
                El excedente total siempre se mantiene en{" "}
                {formatearNumero(resultado.correccion)} y puedes moverlo con las
                flechas del control numerico para favorecer mas a D o a d dentro
                del rango permitido.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => construirTabla(true)}
                className="min-h-14 rounded-[1.15rem] bg-acento-principal px-7 text-[1.2rem] font-semibold text-white shadow-[0_12px_28px_rgba(0,98,65,0.22)] transition hover:bg-acento-oscuro"
              >
                Volver a calcular
              </button>
            </div>
          </BloqueModulo>
        </>
      ) : null}

      <BloqueModulo
        titulo="8. Exportacion"
        descripcion="Exporta los datos originales, el resumen de calculos y la tabla estadistica en un archivo Excel."
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
