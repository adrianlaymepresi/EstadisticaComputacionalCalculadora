"use client";

import { useEffect, useRef, useState } from "react";
import { normalizarNombreArchivo } from "@/modulos/diagrama-burbujas/servicios/exportador";
import { parsearDatosTabla } from "@/modulos/diagrama-burbujas/utilidades/validaciones";
import { exportarExcelLineal } from "@/modulos/diagrama-lineal/servicios/exportador-lineal";
import {
  calcularPuntosDiagramaLineal,
  dibujarDiagramaLineal,
  generarColoresLinealDefault,
} from "@/modulos/diagrama-lineal/servicios/generador-diagrama-lineal";
import type {
  ConfiguracionEjeManualLineal,
  FilaDiagramaLineal,
} from "@/modulos/diagrama-lineal/tipos";

const MAXIMO_FILAS = 20;
const COLOR_PUNTO_BASE = "#C55252";
const COLOR_LINEA_BASE = "#C55252";
const formateadorNumero = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

interface FilaEditable {
  id: string;
  categoria: string;
  valor: string;
  color: string;
}

interface ErroresFila {
  categoria?: string;
  valor?: string;
}

interface MensajeEstado {
  tipo: "error" | "exito" | "info";
  texto: string;
}

interface EstadoEjeManual {
  minimo: string;
  maximo: string;
  paso: string;
}

interface EstadoNombresModulo {
  tituloTabla: string;
  tituloGrafico: string;
  nombreVariableX: string;
  nombreVariableY: string;
  nombreEjeX: string;
  nombreEjeY: string;
}

let contadorFilas = 0;

function crearFilaVacia(color = COLOR_PUNTO_BASE): FilaEditable {
  contadorFilas += 1;

  return {
    id: `lineal-${contadorFilas}`,
    categoria: "",
    valor: "",
    color,
  };
}

function crearFilasIniciales(): FilaEditable[] {
  const colores = generarColoresLinealDefault(2);
  return colores.map((color) => crearFilaVacia(color));
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
  const textoNormalizado = normalizarNumero(texto);

  if (!textoNormalizado) {
    return null;
  }

  const valor = Number(textoNormalizado);
  return Number.isFinite(valor) ? valor : null;
}

function formatearNumeroEntrada(valor: number): string {
  const texto = Number.isInteger(valor)
    ? `${valor}`
    : parseFloat(valor.toFixed(4)).toString();

  return texto.replace(".", ",");
}

function formatearNumeroVisible(valor: number): string {
  return formateadorNumero.format(valor);
}

function normalizarCategoriaParaComparar(texto: string): string {
  return texto.trim().replace(/\s+/g, " ").toLowerCase();
}

function calcularConfiguracionInicialEje(valores: number[]): EstadoEjeManual {
  if (valores.length === 0) {
    return {
      minimo: "0",
      maximo: "10",
      paso: "2",
    };
  }

  const minimoReal = Math.min(...valores);
  const maximoReal = Math.max(...valores);

  if (minimoReal === maximoReal) {
    const base = minimoReal === 0 ? 1 : Math.abs(minimoReal) * 0.15;
    const minimoExpandido =
      minimoReal >= 0 ? Math.max(0, minimoReal - base) : minimoReal - base;
    const maximoExpandido = maximoReal + base;
    const pasoBase = maximoExpandido - minimoExpandido || 1;
    const magnitud = 10 ** Math.floor(Math.log10(Math.abs(pasoBase) || 1));
    const normalizado = pasoBase / magnitud;
    const paso =
      normalizado <= 1
        ? magnitud
        : normalizado <= 2
          ? 2 * magnitud
          : normalizado <= 5
            ? 5 * magnitud
            : 10 * magnitud;

    return {
      minimo: formatearNumeroEntrada(Math.floor(minimoExpandido / paso) * paso),
      maximo: formatearNumeroEntrada(Math.ceil(maximoExpandido / paso) * paso),
      paso: formatearNumeroEntrada(paso),
    };
  }

  const rango = maximoReal - minimoReal;
  const minimoExpandido = minimoReal >= 0 ? 0 : minimoReal - rango * 0.15;
  const maximoExpandido = maximoReal + rango * 0.15;
  const pasoBase = (maximoExpandido - minimoExpandido) / 5 || 1;
  const magnitud = 10 ** Math.floor(Math.log10(Math.abs(pasoBase) || 1));
  const normalizado = pasoBase / magnitud;
  const paso =
    normalizado <= 1
      ? magnitud
      : normalizado <= 2
        ? 2 * magnitud
        : normalizado <= 5
          ? 5 * magnitud
          : 10 * magnitud;
  const minimoVisual = Math.floor(minimoExpandido / paso) * paso;
  const maximoVisual = Math.ceil(maximoExpandido / paso) * paso;

  return {
    minimo: formatearNumeroEntrada(minimoVisual),
    maximo: formatearNumeroEntrada(Math.max(maximoVisual, minimoVisual + paso)),
    paso: formatearNumeroEntrada(paso),
  };
}

function construirConfiguracionManualEje(
  estado: EstadoEjeManual,
): ConfiguracionEjeManualLineal | undefined {
  const minimo = parsearNumero(estado.minimo);
  const maximo = parsearNumero(estado.maximo);
  const paso = parsearNumero(estado.paso);

  if (
    minimo === null ||
    maximo === null ||
    paso === null ||
    maximo <= minimo ||
    paso <= 0
  ) {
    return undefined;
  }

  return { minimo, maximo, paso };
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
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.05rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <input
        type="text"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.15rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      />
    </label>
  );
}

function CampoConfiguracionEjeY({
  estado,
  onChange,
}: {
  estado: EstadoEjeManual;
  onChange: (campo: keyof EstadoEjeManual, valor: string) => void;
}) {
  return (
    <div className="rounded-[1.7rem] border border-verde-claro bg-[#f9fbf7] p-6">
      <div className="flex flex-col gap-4">
        <h4 className="text-[1.65rem] font-semibold text-acento-oscuro">
          Eje Y
        </h4>
        <CampoFormulario
          etiqueta="Valor inicial"
          valor={estado.minimo}
          onChange={(valor) => onChange("minimo", valor)}
        />
        <CampoFormulario
          etiqueta="Valor maximo"
          valor={estado.maximo}
          onChange={(valor) => onChange("maximo", valor)}
        />
        <CampoFormulario
          etiqueta="Unidad principal"
          valor={estado.paso}
          onChange={(valor) => onChange("paso", valor)}
        />
      </div>
    </div>
  );
}

export function ModuloDiagramaLineal() {
  const [filas, setFilas] = useState<FilaEditable[]>(() => crearFilasIniciales());
  const [erroresFilas, setErroresFilas] = useState<Record<string, ErroresFila>>(
    {},
  );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [datosGenerados, setDatosGenerados] = useState<FilaDiagramaLineal[]>([]);
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number | null>(
    null,
  );
  const [nombresModulo, setNombresModulo] = useState<EstadoNombresModulo>({
    tituloTabla: "Tabla No. 8",
    tituloGrafico: "Grafico No. 8",
    nombreVariableX: "Periodo",
    nombreVariableY: "Conocimientos",
    nombreEjeX: "Periodo",
    nombreEjeY: "Numero de conocimientos",
  });
  const [ejeYManual, setEjeYManual] = useState<EstadoEjeManual>({
    minimo: "0",
    maximo: "10",
    paso: "2",
  });
  const [colorLinea, setColorLinea] = useState(COLOR_LINEA_BASE);
  const [dimensionesCanvas, setDimensionesCanvas] = useState({
    ancho: 1180,
    alto: 660,
  });
  const [exportandoExcel, setExportandoExcel] = useState(false);

  const seccionGraficoRef = useRef<HTMLElement>(null);
  const contenedorGraficoRef = useRef<HTMLDivElement>(null);
  const lienzoRef = useRef<HTMLCanvasElement>(null);

  const diagramaGenerado = datosGenerados.length > 0;
  const puntoSeleccionado =
    indiceSeleccionado !== null ? datosGenerados[indiceSeleccionado] ?? null : null;
  const nombreVariableXActual =
    nombresModulo.nombreVariableX.trim() || "Periodo";
  const nombreVariableYActual =
    nombresModulo.nombreVariableY.trim() || "Variable cuantitativa";
  const nombreEjeXActual = nombresModulo.nombreEjeX.trim() || nombreVariableXActual;
  const nombreEjeYActual = nombresModulo.nombreEjeY.trim() || nombreVariableYActual;
  const { minimo: minimoEjeY, maximo: maximoEjeY, paso: pasoEjeY } = ejeYManual;

  useEffect(() => {
    const actualizarDimensiones = () => {
      if (!contenedorGraficoRef.current) {
        return;
      }

      const anchoDisponible = contenedorGraficoRef.current.offsetWidth - 24;
      const anchoMinimoSegunDatos = Math.max(920, datosGenerados.length * 110);
      const ancho = Math.max(anchoMinimoSegunDatos, anchoDisponible);
      const alto = Math.max(500, Math.round(ancho * 0.56));
      setDimensionesCanvas({ ancho, alto });
    };

    actualizarDimensiones();
    window.addEventListener("resize", actualizarDimensiones);

    return () => window.removeEventListener("resize", actualizarDimensiones);
  }, [datosGenerados.length, diagramaGenerado]);

  useEffect(() => {
    if (!lienzoRef.current || !diagramaGenerado) {
      return;
    }

    const lienzo = lienzoRef.current;
    lienzo.width = dimensionesCanvas.ancho;
    lienzo.height = dimensionesCanvas.alto;

    dibujarDiagramaLineal(lienzo, datosGenerados, {
      nombreEjeX: nombreEjeXActual,
      nombreEjeY: nombreEjeYActual,
      colorLinea,
      ejeYManual: construirConfiguracionManualEje({
        minimo: minimoEjeY,
        maximo: maximoEjeY,
        paso: pasoEjeY,
      }),
      indiceSeleccionado,
    });
  }, [
    colorLinea,
    datosGenerados,
    diagramaGenerado,
    dimensionesCanvas.alto,
    dimensionesCanvas.ancho,
    indiceSeleccionado,
    maximoEjeY,
    minimoEjeY,
    nombreEjeXActual,
    nombreEjeYActual,
    pasoEjeY,
  ]);

  const limpiarErrorCampo = (
    filaId: string,
    campo: keyof ErroresFila,
  ) => {
    setErroresFilas((erroresActuales) => {
      const erroresFila = erroresActuales[filaId];

      if (!erroresFila || !erroresFila[campo]) {
        return erroresActuales;
      }

      const siguientesErrores = { ...erroresActuales };
      const filaActualizada = { ...erroresFila };
      delete filaActualizada[campo];

      if (Object.keys(filaActualizada).length === 0) {
        delete siguientesErrores[filaId];
      } else {
        siguientesErrores[filaId] = filaActualizada;
      }

      return siguientesErrores;
    });
  };

  const actualizarFila = (
    filaId: string,
    campo: keyof Pick<FilaEditable, "categoria" | "valor">,
    valor: string,
  ) => {
    setFilas((filasActuales) =>
      filasActuales.map((fila) =>
        fila.id === filaId ? { ...fila, [campo]: valor } : fila,
      ),
    );
    limpiarErrorCampo(filaId, campo);
  };

  const agregarFila = () => {
    if (filas.length >= MAXIMO_FILAS) {
      return;
    }

    const color = generarColoresLinealDefault(filas.length + 1)[filas.length];
    setFilas((filasActuales) => [...filasActuales, crearFilaVacia(color)]);
  };

  const eliminarFila = (filaId: string) => {
    setFilas((filasActuales) => {
      if (filasActuales.length === 1) {
        return [crearFilaVacia(generarColoresLinealDefault(1)[0])];
      }

      return filasActuales.filter((fila) => fila.id !== filaId);
    });

    setErroresFilas((erroresActuales) => {
      const siguientesErrores = { ...erroresActuales };
      delete siguientesErrores[filaId];
      return siguientesErrores;
    });
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

    setFilas((filasActuales) => {
      const cantidad = Math.min(
        MAXIMO_FILAS,
        Math.max(filasActuales.length, filasPegadas.length),
      );
      const colores = generarColoresLinealDefault(cantidad);

      const filasBase = Array.from({ length: cantidad }, (_, indice) =>
        filasActuales[indice]
          ? { ...filasActuales[indice] }
          : crearFilaVacia(colores[indice]),
      );

      filasPegadas.slice(0, MAXIMO_FILAS).forEach((filaPegada, indice) => {
        filasBase[indice] = {
          ...filasBase[indice],
          categoria: filaPegada[0] ?? filasBase[indice].categoria,
          valor: filaPegada[1] ?? filasBase[indice].valor,
        };
      });

      return filasBase;
    });

    setErroresFilas({});
    setMensajeEstado({
      tipo: "info",
      texto:
        "Datos pegados correctamente. Revisa la tabla y luego presiona Generar diagrama.",
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

  const validarFilas = (): FilaDiagramaLineal[] | null => {
    const nuevosErrores: Record<string, ErroresFila> = {};
    const datosLimpios: FilaDiagramaLineal[] = [];
    const categoriasVistas = new Set<string>();

    filas.forEach((fila) => {
      const categoria = fila.categoria.trim();
      const valor = parsearNumero(fila.valor);
      const filaVacia = fila.categoria.trim() === "" && fila.valor.trim() === "";

      if (filaVacia) {
        return;
      }

      const errores: ErroresFila = {};

      if (!categoria) {
        errores.categoria = "Ingresa un periodo o categoria ordinal.";
      }

      if (valor === null) {
        errores.valor = "Ingresa un numero valido.";
      }

      const categoriaNormalizada = normalizarCategoriaParaComparar(categoria);
      if (categoria && categoriasVistas.has(categoriaNormalizada)) {
        errores.categoria = "No repitas periodos o categorias en el eje X.";
      }

      if (Object.keys(errores).length > 0) {
        nuevosErrores[fila.id] = errores;
        return;
      }

      categoriasVistas.add(categoriaNormalizada);
      datosLimpios.push({
        categoria,
        valor: valor!,
        color: fila.color,
      });
    });

    setErroresFilas(nuevosErrores);

    if (datosLimpios.length === 0) {
      setMensajeEstado({
        tipo: "error",
        texto: "Maximo 20 filas. Minimo 1 fila completa para generar.",
      });
      return null;
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Hay filas con errores. Corrigelas antes de generar el diagrama lineal.",
      });
      return null;
    }

    return datosLimpios;
  };

  const generarDiagrama = () => {
    const datosValidados = validarFilas();

    if (!datosValidados) {
      return;
    }

    setDatosGenerados(datosValidados);
    setIndiceSeleccionado(0);
    setEjeYManual(
      calcularConfiguracionInicialEje(
        datosValidados.map((dato) => dato.valor),
      ),
    );
    setMensajeEstado({
      tipo: "exito",
      texto: "Diagrama generado correctamente.",
    });

    requestAnimationFrame(() => {
      seccionGraficoRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const manejarClickPunto = (evento: React.MouseEvent<HTMLCanvasElement>) => {
    if (!lienzoRef.current || datosGenerados.length === 0) {
      return;
    }

    const rect = lienzoRef.current.getBoundingClientRect();
    const escalaX = lienzoRef.current.width / rect.width;
    const escalaY = lienzoRef.current.height / rect.height;
    const posicionX = (evento.clientX - rect.left) * escalaX;
    const posicionY = (evento.clientY - rect.top) * escalaY;

    const puntos = calcularPuntosDiagramaLineal(
      datosGenerados,
      dimensionesCanvas.ancho,
      dimensionesCanvas.alto,
      {
        nombreEjeX: nombreEjeXActual,
        nombreEjeY: nombreEjeYActual,
        colorLinea,
        ejeYManual: construirConfiguracionManualEje({
          minimo: minimoEjeY,
          maximo: maximoEjeY,
          paso: pasoEjeY,
        }),
        indiceSeleccionado,
      },
    );

    const indiceDetectado = puntos.findIndex((punto) => {
      const distancia = Math.hypot(posicionX - punto.x, posicionY - punto.y);
      return distancia <= punto.radio + 5;
    });

    if (indiceDetectado >= 0) {
      setIndiceSeleccionado(indiceDetectado);
    }
  };

  const actualizarNombreModulo = (
    campo: keyof EstadoNombresModulo,
    valor: string,
  ) => {
    setNombresModulo((estadoActual) => ({
      ...estadoActual,
      [campo]: valor,
    }));
  };

  const actualizarEjeYManual = (
    campo: keyof EstadoEjeManual,
    valor: string,
  ) => {
    setEjeYManual((estadoActual) => ({
      ...estadoActual,
      [campo]: valor,
    }));
  };

  const actualizarColorPunto = (nuevoColor: string) => {
    if (indiceSeleccionado === null) {
      return;
    }

    setDatosGenerados((datosActuales) =>
      datosActuales.map((dato, indice) =>
        indice === indiceSeleccionado ? { ...dato, color: nuevoColor } : dato,
      ),
    );
  };

  const exportarExcel = async () => {
    if (!lienzoRef.current || !diagramaGenerado) {
      return;
    }

    setExportandoExcel(true);

    try {
      await exportarExcelLineal(
        {
          datos: datosGenerados,
          tituloTabla: nombresModulo.tituloTabla.trim() || "Tabla lineal",
          nombreVariableX: nombreVariableXActual,
          nombreVariableY: nombreVariableYActual,
          colorLinea,
        },
        normalizarNombreArchivo(
          nombresModulo.tituloGrafico.trim() || "diagrama-lineal",
        ),
        lienzoRef.current,
      );
      setMensajeEstado({
        tipo: "exito",
        texto: "Archivo Excel exportado correctamente.",
      });
    } catch (error) {
      console.error("No se pudo exportar el Excel:", error);
      setMensajeEstado({
        tipo: "error",
        texto:
          "No pude exportar el archivo Excel. Intenta nuevamente con el diagrama ya generado.",
      });
    } finally {
      setExportandoExcel(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <h1 className="text-[2.6rem] font-semibold tracking-tight text-acento-oscuro sm:text-[4rem]">
          Diagramador Lineal
        </h1>
        <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-[1.15rem]">
          Ingresa o pega tus datos desde Excel, ordena una variable ordinal en el
          eje X y representa su comportamiento cuantitativo en una linea de
          tendencia simple.
        </p>
      </header>

      <BloqueModulo
        titulo="1. Ingreso de datos"
        descripcion="Trabaja con una variable ordinal para el eje X y una variable cuantitativa para el eje Y."
      >
        <div className="flex flex-col gap-5" onPaste={manejarPegadoDirecto}>
          <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
            <table className="min-w-[900px] border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#d6e1d8] text-left text-texto-principal">
                  <th className="min-w-[70px] border-b border-white/20 px-4 py-4 text-xl font-semibold">
                    #
                  </th>
                  <th className="min-w-[360px] border-b border-l border-white/20 px-4 py-4 text-xl font-semibold">
                    {nombreVariableXActual}
                  </th>
                  <th className="min-w-[360px] border-b border-l border-white/20 px-4 py-4 text-xl font-semibold">
                    {nombreVariableYActual}
                  </th>
                  <th className="min-w-[170px] border-b border-l border-white/20 px-4 py-4 text-xl font-semibold">
                    Accion
                  </th>
                </tr>
              </thead>

              <tbody>
                {filas.map((fila, indice) => (
                  <tr
                    key={fila.id}
                    className={indice % 2 === 0 ? "bg-white" : "bg-[#f6faf7]"}
                  >
                    <td className="border-b border-black/8 px-4 py-4 text-[1.35rem] text-texto-principal">
                      {indice + 1}
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={fila.categoria}
                          onChange={(evento) =>
                            actualizarFila(fila.id, "categoria", evento.target.value)
                          }
                          placeholder="Texto o numero ordinal"
                          className={`min-h-14 rounded-[1.05rem] border px-4 text-[1.2rem] text-texto-principal outline-none transition ${
                            erroresFilas[fila.id]?.categoria
                              ? "border-alerta bg-alerta/5 focus:border-alerta"
                              : "border-verde-claro bg-white focus:border-acento-principal"
                          }`}
                        />
                        {erroresFilas[fila.id]?.categoria ? (
                          <p className="text-sm text-alerta">
                            {erroresFilas[fila.id]?.categoria}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={fila.valor}
                          onChange={(evento) =>
                            actualizarFila(fila.id, "valor", evento.target.value)
                          }
                          placeholder="Numero"
                          className={`min-h-14 rounded-[1.05rem] border px-4 text-[1.2rem] text-texto-principal outline-none transition ${
                            erroresFilas[fila.id]?.valor
                              ? "border-alerta bg-alerta/5 focus:border-alerta"
                              : "border-verde-claro bg-white focus:border-acento-principal"
                          }`}
                        />
                        {erroresFilas[fila.id]?.valor ? (
                          <p className="text-sm text-alerta">
                            {erroresFilas[fila.id]?.valor}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td className="border-b border-l border-black/8 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => eliminarFila(fila.id)}
                        className="min-h-14 rounded-[1.05rem] border border-verde-claro bg-[#f5faf4] px-5 text-[1.15rem] font-semibold text-acento-oscuro transition hover:border-acento-principal hover:text-acento-principal"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={agregarFila}
              disabled={filas.length >= MAXIMO_FILAS}
              className={`min-h-14 rounded-[1.15rem] px-6 text-[1.2rem] font-semibold transition ${
                filas.length >= MAXIMO_FILAS
                  ? "cursor-not-allowed bg-[#d5dfd8] text-texto-secundario"
                  : "border border-verde-claro bg-[#f5faf4] text-acento-oscuro hover:border-acento-principal hover:text-acento-principal"
              }`}
            >
              Agregar fila
            </button>

            <button
              type="button"
              onClick={generarDiagrama}
              className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.2rem] font-semibold text-white shadow-[0_12px_28px_rgba(0,98,65,0.22)] transition hover:bg-acento-oscuro"
            >
              Generar diagrama
            </button>

            <button
              type="button"
              onClick={pegarDesdePortapapeles}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-[#f5faf4] px-6 text-[1.2rem] font-semibold text-acento-oscuro transition hover:border-acento-principal hover:text-acento-principal"
            >
              Pegar desde portapapeles
            </button>
          </div>

          <p className="text-[1.05rem] text-texto-secundario">
            Maximo 20 filas. Minimo 1 fila completa para generar.
          </p>

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

      <BloqueModulo
        titulo="2. Tabla lineal"
        descripcion="La tabla se organiza horizontalmente para respetar el orden ordinal del periodo o categoria en el eje X."
      >
        {diagramaGenerado ? (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h3 className="text-4xl font-semibold text-acento-oscuro">
                {nombresModulo.tituloTabla}
              </h3>
            </div>

            <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
              <table className="min-w-[900px] border-separate border-spacing-0">
                <tbody>
                  <tr className="bg-[#4b3b68] text-white">
                    <td className="border-b border-white/15 px-4 py-4 text-left text-[1.45rem] font-semibold">
                      {nombreVariableXActual}
                    </td>
                    {datosGenerados.map((fila, indice) => (
                      <td
                        key={`categoria-${indice}`}
                        className="border-b border-l border-white/15 px-4 py-4 text-[1.35rem] font-semibold"
                      >
                        {fila.categoria}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-[#ddd4ec]">
                    <td className="border-b border-black/10 px-4 py-4 text-left text-[1.45rem] font-semibold text-texto-principal">
                      {nombreVariableYActual}
                    </td>
                    {datosGenerados.map((fila, indice) => (
                      <td
                        key={`valor-${indice}`}
                        className="border-b border-l border-black/10 px-4 py-4 text-[1.35rem] text-texto-principal"
                      >
                        {formatearNumeroVisible(fila.valor)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-[1.05rem] text-texto-secundario">
            Genera el diagrama para ver la tabla horizontal final con el orden del
            eje X y sus valores cuantitativos.
          </p>
        )}
      </BloqueModulo>

      <section ref={seccionGraficoRef}>
        <BloqueModulo
          titulo="3. Diagrama lineal"
          descripcion={
            diagramaGenerado
              ? undefined
              : "Genera el diagrama para activar la visualizacion de la linea, la seleccion de puntos y la personalizacion."
          }
        >
          {diagramaGenerado ? (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <h3 className="text-4xl font-semibold text-acento-oscuro">
                  {nombresModulo.tituloGrafico}
                </h3>
              </div>

              <div
                ref={contenedorGraficoRef}
                className="overflow-auto rounded-[1.7rem] border border-verde-claro bg-[#f8fbf8] p-5"
              >
                <canvas
                  ref={lienzoRef}
                  onClick={manejarClickPunto}
                  className="mx-auto h-auto min-w-[920px] cursor-pointer"
                  style={{ width: `${dimensionesCanvas.ancho}px`, maxWidth: "none" }}
                />
              </div>

              <p className="text-[1.05rem] text-texto-secundario">
                Punto seleccionado:{" "}
                {puntoSeleccionado
                  ? `${(indiceSeleccionado ?? 0) + 1} | ${nombreVariableXActual}: ${
                      puntoSeleccionado.categoria
                    } | ${nombreVariableYActual}: ${formatearNumeroVisible(
                      puntoSeleccionado.valor,
                    )}`
                  : "ninguno"}
              </p>
            </div>
          ) : null}
        </BloqueModulo>
      </section>

      {diagramaGenerado ? (
        <>
          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-3">
              <h2 className="text-[2rem] font-semibold tracking-tight text-acento-oscuro sm:text-[2.4rem]">
                4. Personalizacion del diagrama
              </h2>
              <p className="max-w-4xl text-base leading-8 text-texto-secundario">
                Ajusta nombres, color de la linea, color de puntos seleccionados y
                la escala manual del eje Y sin salir de esta misma pantalla.
              </p>
            </div>
          </section>

          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-6">
              <h3 className="text-[1.8rem] font-semibold tracking-tight text-acento-oscuro">
                Editar nombres del diagrama
              </h3>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <CampoFormulario
                  etiqueta="Titulo de la tabla"
                  valor={nombresModulo.tituloTabla}
                  onChange={(valor) => actualizarNombreModulo("tituloTabla", valor)}
                />
                <CampoFormulario
                  etiqueta="Titulo del grafico"
                  valor={nombresModulo.tituloGrafico}
                  onChange={(valor) => actualizarNombreModulo("tituloGrafico", valor)}
                />
                <CampoFormulario
                  etiqueta="Nombre variable X"
                  valor={nombresModulo.nombreVariableX}
                  onChange={(valor) =>
                    actualizarNombreModulo("nombreVariableX", valor)
                  }
                />
                <CampoFormulario
                  etiqueta="Nombre variable Y"
                  valor={nombresModulo.nombreVariableY}
                  onChange={(valor) =>
                    actualizarNombreModulo("nombreVariableY", valor)
                  }
                />
                <CampoFormulario
                  etiqueta="Nombre eje X"
                  valor={nombresModulo.nombreEjeX}
                  onChange={(valor) => actualizarNombreModulo("nombreEjeX", valor)}
                />
                <CampoFormulario
                  etiqueta="Nombre eje Y"
                  valor={nombresModulo.nombreEjeY}
                  onChange={(valor) => actualizarNombreModulo("nombreEjeY", valor)}
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-6">
              <h3 className="text-[1.8rem] font-semibold tracking-tight text-acento-oscuro">
                Personalizacion de linea y puntos
              </h3>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-[1.7rem] border border-verde-claro bg-[#f9fbf7] p-6">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[1.55rem] font-semibold text-acento-oscuro">
                      Color de la linea
                    </h4>
                    <div className="flex items-center gap-3 text-[1.05rem] text-texto-secundario">
                      <span>Linea principal</span>
                      <span
                        className="h-7 w-7 rounded-full border border-acento-principal/25"
                        style={{ backgroundColor: colorLinea }}
                      />
                    </div>

                    <label className="cursor-pointer rounded-[1.15rem] border border-verde-claro bg-white px-4 py-5">
                      <span
                        className="block h-[4px] w-full rounded-full"
                        style={{ backgroundColor: colorLinea }}
                      />
                      <input
                        type="color"
                        value={colorLinea}
                        onChange={(evento) => setColorLinea(evento.target.value)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-[1.7rem] border border-verde-claro bg-[#f9fbf7] p-6">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[1.55rem] font-semibold text-acento-oscuro">
                      Punto individual
                    </h4>

                    {puntoSeleccionado ? (
                      <>
                        <p className="text-[1.1rem] text-texto-principal">
                          Punto {(indiceSeleccionado ?? 0) + 1} | {nombreVariableXActual}:{" "}
                          {puntoSeleccionado.categoria} | {nombreVariableYActual}:{" "}
                          {formatearNumeroEntrada(puntoSeleccionado.valor)}
                        </p>

                        <div className="flex items-center gap-3 text-[1.05rem] text-texto-secundario">
                          <span>Color individual</span>
                          <span
                            className="h-7 w-7 rounded-full border border-acento-principal/25"
                            style={{
                              backgroundColor:
                                puntoSeleccionado.color || COLOR_PUNTO_BASE,
                            }}
                          />
                        </div>

                        <label className="cursor-pointer rounded-[1.15rem] border border-verde-claro bg-white px-4 py-5">
                          <span
                            className="block h-8 w-8 rounded-full border border-black/10"
                            style={{
                              backgroundColor:
                                puntoSeleccionado.color || COLOR_PUNTO_BASE,
                            }}
                          />
                          <input
                            type="color"
                            value={puntoSeleccionado.color || COLOR_PUNTO_BASE}
                            onChange={(evento) =>
                              actualizarColorPunto(evento.target.value)
                            }
                            className="sr-only"
                          />
                        </label>
                      </>
                    ) : (
                      <p className="text-[1.05rem] text-texto-secundario">
                        Selecciona un punto en el grafico para cambiar su color.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-6">
              <h3 className="text-[1.8rem] font-semibold tracking-tight text-acento-oscuro">
                Configuracion manual del eje Y
              </h3>
              <p className="max-w-4xl text-base leading-8 text-texto-secundario">
                El eje X conserva el orden ordinal en el que ingresaste los
                periodos o categorias. La escala manual solo se aplica al eje Y.
              </p>

              <CampoConfiguracionEjeY
                estado={ejeYManual}
                onChange={actualizarEjeYManual}
              />
            </div>
          </section>
        </>
      ) : null}

      <BloqueModulo
        titulo="5. Exportacion"
        descripcion="Exporta la tabla y el grafico en un archivo Excel presentable."
      >
        <div>
          <button
            type="button"
            onClick={exportarExcel}
            disabled={!diagramaGenerado || exportandoExcel}
            className={`min-h-14 rounded-[1.15rem] px-7 text-[1.25rem] font-semibold transition ${
              diagramaGenerado && !exportandoExcel
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
