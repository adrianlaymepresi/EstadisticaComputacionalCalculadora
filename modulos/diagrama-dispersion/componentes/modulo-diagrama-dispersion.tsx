"use client";

import { useEffect, useRef, useState } from "react";
import { normalizarNombreArchivo } from "@/modulos/diagrama-burbujas/servicios/exportador";
import { parsearDatosTabla } from "@/modulos/diagrama-burbujas/utilidades/validaciones";
import { exportarExcelDispersion } from "@/modulos/diagrama-dispersion/servicios/exportador-dispersion";
import {
  calcularPuntosDiagramaDispersion,
  dibujarDiagramaDispersion,
  generarColoresDispersionDefault,
} from "@/modulos/diagrama-dispersion/servicios/generador-diagrama-dispersion";
import type {
  ConfiguracionEjeManualDispersion,
  FilaDiagramaDispersion,
} from "@/modulos/diagrama-dispersion/tipos";

const MAXIMO_FILAS = 20;
const COLOR_PUNTO_BASE = "#4F86C6";
const formateadorNumero = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

interface FilaEditable {
  id: string;
  x: string;
  y: string;
  color: string;
}

interface ErroresFila {
  x?: string;
  y?: string;
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

interface EstadoEjesManuales {
  ejeX: EstadoEjeManual;
  ejeY: EstadoEjeManual;
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
    id: `dispersion-${contadorFilas}`,
    x: "",
    y: "",
    color,
  };
}

function crearFilasIniciales(): FilaEditable[] {
  const colores = generarColoresDispersionDefault(2);
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

function calcularConfiguracionInicialEje(valores: number[]): EstadoEjeManual {
  if (valores.length === 0) {
    return {
      minimo: "0",
      maximo: "10",
      paso: "2",
    };
  }

  let minimo = Math.min(...valores);
  let maximo = Math.max(...valores);

  if (maximo === minimo) {
    const base = minimo === 0 ? 1 : Math.abs(minimo) * 0.1;
    minimo -= base;
    maximo += base;
  }

  const rango = maximo - minimo || 1;
  const margen = rango < 10 ? 0.2 : 0.15;
  const minimoExpandido = minimo - rango * margen;
  const maximoExpandido = maximo + rango * margen;
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

function construirConfiguracionEjes(
  datos: FilaDiagramaDispersion[],
): EstadoEjesManuales {
  return {
    ejeX: calcularConfiguracionInicialEje(datos.map((dato) => dato.x)),
    ejeY: calcularConfiguracionInicialEje(datos.map((dato) => dato.y)),
  };
}

function construirConfiguracionManualEje(
  estado: EstadoEjeManual,
): ConfiguracionEjeManualDispersion | undefined {
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
    <label className="flex flex-col gap-3">
      <span className="text-base font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <input
        type="text"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        className="min-h-14 rounded-3xl border border-verde-claro bg-white px-4 text-[1.05rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-4 focus:ring-acento-principal/10"
      />
    </label>
  );
}

function CampoConfiguracionEje({
  titulo,
  estado,
  onChange,
}: {
  titulo: string;
  estado: EstadoEjeManual;
  onChange: (campo: keyof EstadoEjeManual, valor: string) => void;
}) {
  return (
    <div className="rounded-[1.8rem] border border-verde-claro bg-white/85 p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-[1.8rem] font-semibold tracking-tight text-acento-oscuro">
          {titulo}
        </h3>
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

export function ModuloDiagramaDispersion() {
  const [filas, setFilas] = useState<FilaEditable[]>(() => crearFilasIniciales());
  const [erroresFilas, setErroresFilas] = useState<Record<string, ErroresFila>>(
    {},
  );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [datosGenerados, setDatosGenerados] = useState<FilaDiagramaDispersion[]>(
    [],
  );
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number | null>(
    null,
  );
  const [nombresModulo, setNombresModulo] = useState<EstadoNombresModulo>({
    tituloTabla: "Tabla No. 7",
    tituloGrafico: "Grafico No. 7",
    nombreVariableX: "Capacidad de memoria",
    nombreVariableY: "Capacidad de imaginacion",
    nombreEjeX: "Capacidad de memoria",
    nombreEjeY: "Capacidad de imaginacion",
  });
  const [ejesManuales, setEjesManuales] = useState<EstadoEjesManuales>({
    ejeX: { minimo: "0", maximo: "10", paso: "2" },
    ejeY: { minimo: "0", maximo: "10", paso: "2" },
  });
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
    nombresModulo.nombreVariableX.trim() || "Variable X";
  const nombreVariableYActual =
    nombresModulo.nombreVariableY.trim() || "Variable Y";
  const nombreEjeXActual = nombresModulo.nombreEjeX.trim() || nombreVariableXActual;
  const nombreEjeYActual = nombresModulo.nombreEjeY.trim() || nombreVariableYActual;
  const { minimo: minimoEjeX, maximo: maximoEjeX, paso: pasoEjeX } =
    ejesManuales.ejeX;
  const { minimo: minimoEjeY, maximo: maximoEjeY, paso: pasoEjeY } =
    ejesManuales.ejeY;

  useEffect(() => {
    const actualizarDimensiones = () => {
      if (!contenedorGraficoRef.current) {
        return;
      }

      const anchoDisponible = contenedorGraficoRef.current.offsetWidth - 24;
      const ancho = Math.max(900, anchoDisponible);
      const alto = Math.max(480, Math.round(ancho * 0.58));
      setDimensionesCanvas({ ancho, alto });
    };

    actualizarDimensiones();
    window.addEventListener("resize", actualizarDimensiones);

    return () => window.removeEventListener("resize", actualizarDimensiones);
  }, [diagramaGenerado]);

  useEffect(() => {
    if (!lienzoRef.current || !diagramaGenerado) {
      return;
    }

    const lienzo = lienzoRef.current;
    lienzo.width = dimensionesCanvas.ancho;
    lienzo.height = dimensionesCanvas.alto;

    dibujarDiagramaDispersion(
      lienzo,
      datosGenerados,
      {
        nombreEjeX: nombreEjeXActual,
        nombreEjeY: nombreEjeYActual,
        ejeXManual: construirConfiguracionManualEje({
          minimo: minimoEjeX,
          maximo: maximoEjeX,
          paso: pasoEjeX,
        }),
        ejeYManual: construirConfiguracionManualEje({
          minimo: minimoEjeY,
          maximo: maximoEjeY,
          paso: pasoEjeY,
        }),
        indiceSeleccionado,
      },
    );
  }, [
    datosGenerados,
    diagramaGenerado,
    dimensionesCanvas.alto,
    dimensionesCanvas.ancho,
    indiceSeleccionado,
    maximoEjeX,
    maximoEjeY,
    minimoEjeX,
    minimoEjeY,
    nombreEjeXActual,
    nombreEjeYActual,
    pasoEjeX,
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
    campo: keyof Pick<FilaEditable, "x" | "y">,
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

    const color = generarColoresDispersionDefault(filas.length + 1)[filas.length];
    setFilas((filasActuales) => [...filasActuales, crearFilaVacia(color)]);
  };

  const eliminarFila = (filaId: string) => {
    setFilas((filasActuales) => {
      if (filasActuales.length === 1) {
        return [crearFilaVacia(generarColoresDispersionDefault(1)[0])];
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
      const colores = generarColoresDispersionDefault(cantidad);

      const filasBase = Array.from({ length: cantidad }, (_, indice) =>
        filasActuales[indice]
          ? { ...filasActuales[indice] }
          : crearFilaVacia(colores[indice]),
      );

      filasPegadas.slice(0, MAXIMO_FILAS).forEach((filaPegada, indice) => {
        filasBase[indice] = {
          ...filasBase[indice],
          x: filaPegada[0] ?? filasBase[indice].x,
          y: filaPegada[1] ?? filasBase[indice].y,
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

  const validarFilas = (): FilaDiagramaDispersion[] | null => {
    const nuevosErrores: Record<string, ErroresFila> = {};
    const datosLimpios: FilaDiagramaDispersion[] = [];

    filas.forEach((fila) => {
      const valorX = parsearNumero(fila.x);
      const valorY = parsearNumero(fila.y);
      const filaVacia = fila.x.trim() === "" && fila.y.trim() === "";

      if (filaVacia) {
        return;
      }

      const errores: ErroresFila = {};

      if (valorX === null) {
        errores.x = "Ingresa un numero valido.";
      }

      if (valorY === null) {
        errores.y = "Ingresa un numero valido.";
      }

      if (Object.keys(errores).length > 0) {
        nuevosErrores[fila.id] = errores;
        return;
      }

      datosLimpios.push({
        x: valorX!,
        y: valorY!,
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
          "Hay filas con errores. Corrigelas antes de generar el diagrama de dispersion.",
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
    setEjesManuales(construirConfiguracionEjes(datosValidados));
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

    const puntos = calcularPuntosDiagramaDispersion(
      datosGenerados,
      dimensionesCanvas.ancho,
      dimensionesCanvas.alto,
      {
        nombreEjeX: nombreEjeXActual,
        nombreEjeY: nombreEjeYActual,
        ejeXManual: construirConfiguracionManualEje({
          minimo: minimoEjeX,
          maximo: maximoEjeX,
          paso: pasoEjeX,
        }),
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
      return distancia <= punto.radio + 4;
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

  const actualizarEjeManual = (
    eje: keyof EstadoEjesManuales,
    campo: keyof EstadoEjeManual,
    valor: string,
  ) => {
    setEjesManuales((estadoActual) => ({
      ...estadoActual,
      [eje]: {
        ...estadoActual[eje],
        [campo]: valor,
      },
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
    if (!diagramaGenerado || !lienzoRef.current) {
      return;
    }

    setExportandoExcel(true);

    try {
      await exportarExcelDispersion(
        {
          datos: datosGenerados,
          tituloTabla: nombresModulo.tituloTabla.trim() || "Tabla No. 7",
          nombreVariableX: nombreVariableXActual,
          nombreVariableY: nombreVariableYActual,
        },
        normalizarNombreArchivo(
          nombresModulo.tituloGrafico.trim() || "diagrama-dispersion",
        ),
        lienzoRef.current,
      );

      setMensajeEstado({
        tipo: "exito",
        texto: "Archivo Excel exportado correctamente.",
      });
    } catch (error) {
      console.error("No se pudo exportar el archivo Excel:", error);
      setMensajeEstado({
        tipo: "error",
        texto: "No se pudo exportar el archivo Excel. Intenta nuevamente.",
      });
    } finally {
      setExportandoExcel(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[2rem] border border-transparent bg-transparent p-1">
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-semibold tracking-tight text-acento-oscuro sm:text-6xl">
            Diagrama de Dispersion
          </h1>
          <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-xl">
            Ingresa dos variables cuantitativas, genera la tabla de pares
            numericos y construye el diagrama de dispersion para analizar su
            relacion.
          </p>
        </div>
      </section>

      <BloqueModulo titulo="1. Ingreso de datos">
        <div className="flex flex-col gap-5" onPaste={manejarPegadoDirecto}>
          <div className="overflow-hidden rounded-[1.6rem] border border-verde-claro bg-white/90">
            <div className="max-h-[900px] overflow-auto">
              <table className="min-w-[820px] w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-[#dce8df] text-left text-[1rem] text-acento-oscuro">
                  <tr>
                    <th className="w-14 border-b border-verde-claro px-4 py-4 font-semibold">
                      #
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {nombreVariableXActual}
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {nombreVariableYActual}
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
                        <td className="border-b border-verde-claro px-4 py-3 align-top text-[1.1rem] text-texto-principal">
                          {indice + 1}
                        </td>
                        <td className="border-b border-l border-verde-claro px-3 py-3 align-top">
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={fila.x}
                              onChange={(evento) =>
                                actualizarFila(fila.id, "x", evento.target.value)
                              }
                              placeholder="Numero"
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
                              value={fila.y}
                              onChange={(evento) =>
                                actualizarFila(fila.id, "y", evento.target.value)
                              }
                              placeholder="Numero"
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
                            className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-[#eff6ef] px-5 text-[1.05rem] font-semibold text-acento-principal transition hover:border-acento-principal hover:bg-verde-suave"
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
              onClick={generarDiagrama}
              className="min-h-14 rounded-[1.15rem] bg-acento-principal px-7 text-[1.05rem] font-semibold text-white shadow-[0_12px_28px_rgba(0,98,65,0.22)] transition hover:bg-acento-oscuro"
            >
              Generar diagrama
            </button>

            <button
              type="button"
              onClick={pegarDesdePortapapeles}
              className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.05rem] font-semibold text-acento-principal transition hover:border-acento-principal hover:bg-verde-suave"
            >
              Pegar desde portapapeles
            </button>
          </div>

          <p className="text-[1.05rem] text-texto-secundario">
            Maximo 20 filas. Minimo 1 fila completa para generar.
          </p>

          {mensajeEstado ? (
            <div
              className={`rounded-[1.15rem] border px-4 py-3 text-[1rem] font-medium ${obtenerClasesMensaje(
                mensajeEstado.tipo,
              )}`}
            >
              {mensajeEstado.texto}
            </div>
          ) : null}
        </div>
      </BloqueModulo>

      <BloqueModulo
        titulo="2. Tabla de dispersion"
        descripcion={
          diagramaGenerado
            ? undefined
            : "Genera el diagrama para visualizar la tabla de pares cuantitativos."
        }
      >
        {diagramaGenerado ? (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h3 className="text-4xl font-semibold text-acento-oscuro">
                {nombresModulo.tituloTabla}
              </h3>
            </div>

            <div className="overflow-auto rounded-[1.6rem] border border-verde-claro bg-white/90">
              <table
                className="w-full border-collapse text-center"
                style={{
                  minWidth: `${Math.max(760, 220 + datosGenerados.length * 94)}px`,
                }}
              >
                <thead className="bg-[#58562b] text-white">
                  <tr>
                    <th className="border-b border-white/20 px-4 py-4 text-left text-xl font-semibold">
                      Dato
                    </th>
                    {datosGenerados.map((_, indice) => (
                      <th
                        key={`dato-${indice}`}
                        className="border-b border-l border-white/20 px-4 py-4 text-xl font-semibold"
                      >
                        {indice + 1}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  <tr className="bg-[#d6cf9f]">
                    <td className="border-b border-l border-black/10 px-4 py-4 text-left text-[1.45rem] font-semibold text-texto-principal">
                      {nombreVariableXActual}
                    </td>
                    {datosGenerados.map((fila, indice) => (
                      <td
                        key={`x-${indice}`}
                        className="border-b border-l border-black/10 px-4 py-4 text-[1.35rem] text-texto-principal"
                      >
                        {formatearNumeroVisible(fila.x)}
                      </td>
                    ))}
                  </tr>

                  <tr className="bg-[#cec79c]">
                    <td className="border-b border-l border-black/10 px-4 py-4 text-left text-[1.45rem] font-semibold text-texto-principal">
                      {nombreVariableYActual}
                    </td>
                    {datosGenerados.map((fila, indice) => (
                      <td
                        key={`y-${indice}`}
                        className="border-b border-l border-black/10 px-4 py-4 text-[1.35rem] text-texto-principal"
                      >
                        {formatearNumeroVisible(fila.y)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </BloqueModulo>

      <section ref={seccionGraficoRef}>
        <BloqueModulo
          titulo="3. Diagrama de dispersion"
          descripcion={
            diagramaGenerado
              ? undefined
              : "Genera el diagrama para seleccionar puntos, personalizarlos y ajustar los ejes manualmente."
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
                  ? `${(indiceSeleccionado ?? 0) + 1} | X: ${formatearNumeroVisible(
                      puntoSeleccionado.x,
                    )} | Y: ${formatearNumeroVisible(puntoSeleccionado.y)}`
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
                Ajusta nombres, color individual del punto y la escala manual
                de los ejes sin salir de esta misma pantalla.
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
                Personalizacion de punto
              </h3>
              {puntoSeleccionado ? (
                <>
                  <p className="text-[1.15rem] text-texto-principal">
                    Punto {(indiceSeleccionado ?? 0) + 1} | X:{" "}
                    {formatearNumeroEntrada(puntoSeleccionado.x)} | Y:{" "}
                    {formatearNumeroEntrada(puntoSeleccionado.y)}
                  </p>

                  <div className="flex flex-col gap-4">
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
                      <span className="block h-[2px] w-full rounded-full bg-acento-oscuro/55" />
                      <input
                        type="color"
                        value={puntoSeleccionado.color || COLOR_PUNTO_BASE}
                        onChange={(evento) =>
                          actualizarColorPunto(evento.target.value)
                        }
                        className="sr-only"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <p className="text-[1.05rem] text-texto-secundario">
                  Selecciona un punto en el grafico para cambiar su color.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-6">
              <h3 className="text-[1.8rem] font-semibold tracking-tight text-acento-oscuro">
                Configuracion manual de ejes
              </h3>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <CampoConfiguracionEje
                  titulo="Eje X"
                  estado={ejesManuales.ejeX}
                  onChange={(campo, valor) =>
                    actualizarEjeManual("ejeX", campo, valor)
                  }
                />

                <CampoConfiguracionEje
                  titulo="Eje Y"
                  estado={ejesManuales.ejeY}
                  onChange={(campo, valor) =>
                    actualizarEjeManual("ejeY", campo, valor)
                  }
                />
              </div>
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
