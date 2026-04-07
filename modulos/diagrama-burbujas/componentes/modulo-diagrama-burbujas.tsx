"use client";

import { useEffect, useRef, useState } from "react";
import {
  calcularDatosBurbujas,
  dibujarDiagrama,
  type ConfiguracionEjeManual,
  type OpcionesRenderDiagrama,
} from "@/modulos/diagrama-burbujas/servicios/generador-diagrama";
import {
  exportarComoExcel,
  normalizarNombreArchivo,
} from "@/modulos/diagrama-burbujas/servicios/exportador";
import {
  OPCIONES_VISUALIZACION_DEFAULT,
  type ConfiguracionDiagrama,
  type FilaDatos,
  type OpcionesVisualizacion,
} from "@/modulos/diagrama-burbujas/tipos";
import { parsearDatosTabla } from "@/modulos/diagrama-burbujas/utilidades/validaciones";

const MAXIMO_FILAS = 20;
const MARGEN_LIENZO = 90;
const COLOR_BURBUJA_BASE = "#9BC3A4";

const OPCIONES_RENDER_BASE: OpcionesVisualizacion = {
  ...OPCIONES_VISUALIZACION_DEFAULT,
  cuadricula: {
    ...OPCIONES_VISUALIZACION_DEFAULT.cuadricula,
    color: "#D9E6DE",
  },
  lineasConexion: {
    ...OPCIONES_VISUALIZACION_DEFAULT.lineasConexion,
    mostrar: false,
  },
  etiquetas: {
    ...OPCIONES_VISUALIZACION_DEFAULT.etiquetas,
    mostrar: false,
  },
  leyenda: {
    mostrar: false,
    posicion: "derecha",
  },
  burbujas: {
    ...OPCIONES_VISUALIZACION_DEFAULT.burbujas,
    transparencia: 80,
    mostrarBorde: false,
    grosorBorde: 0,
    colorBorde: "#1E3932",
  },
  tooltip: {
    mostrar: false,
    formatoNumeros: "normal",
  },
  ejes: {
    ...OPCIONES_VISUALIZACION_DEFAULT.ejes,
    grosorLinea: 1.5,
    colorLinea: "#60736B",
  },
};

interface FilaEditable {
  id: string;
  x: string;
  y: string;
  tamanio: string;
  color: string;
}

interface ErroresFila {
  x?: string;
  y?: string;
  tamanio?: string;
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

interface EstadoNombresDiagrama {
  tituloGrafico: string;
  nombreEjeX: string;
  nombreEjeY: string;
  nombreVariableTamanio: string;
}

let contadorFilas = 0;

function crearFilaVacia(): FilaEditable {
  contadorFilas += 1;

  return {
    id: `fila-${contadorFilas}`,
    x: "",
    y: "",
    tamanio: "",
    color: COLOR_BURBUJA_BASE,
  };
}

function crearFilasIniciales(cantidad = 2): FilaEditable[] {
  return Array.from({ length: cantidad }, () => crearFilaVacia());
}

function normalizarNumero(texto: string): string {
  return texto.replace(",", ".").trim();
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
  const valorAjustado = Number.isInteger(valor)
    ? `${valor}`
    : parseFloat(valor.toFixed(4)).toString();

  return valorAjustado.replace(".", ",");
}

function crearEstadoEjeManual(
  minimo: number,
  maximo: number,
  paso: number,
): EstadoEjeManual {
  return {
    minimo: formatearNumeroEntrada(minimo),
    maximo: formatearNumeroEntrada(maximo),
    paso: formatearNumeroEntrada(paso),
  };
}

function calcularConfiguracionInicialEje(valores: number[]): EstadoEjeManual {
  if (valores.length === 0) {
    return crearEstadoEjeManual(0, 10, 2);
  }

  let minimo = Math.min(...valores) - 1;
  let maximo = Math.max(...valores) + 1;

  if (minimo === maximo) {
    maximo = minimo + 1;
  }

  if (minimo > 0 && minimo < 1) {
    minimo = 0;
  }

  const paso = (maximo - minimo) / 5 || 1;
  return crearEstadoEjeManual(minimo, maximo, paso);
}

function construirConfiguracionEjes(
  datos: FilaDatos[],
): EstadoEjesManuales {
  return {
    ejeX: calcularConfiguracionInicialEje(datos.map((dato) => dato.x)),
    ejeY: calcularConfiguracionInicialEje(datos.map((dato) => dato.y)),
  };
}

function construirConfiguracionManualEje(
  estado: EstadoEjeManual,
): ConfiguracionEjeManual | undefined {
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

function BloqueDiagrama({
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
  placeholder,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder?: string;
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
        placeholder={placeholder}
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
        <h4 className="text-[2rem] font-semibold tracking-tight text-acento-oscuro">
          {titulo}
        </h4>
        <CampoFormulario
          etiqueta="Valor inicial"
          valor={estado.minimo}
          onChange={(valor) => onChange("minimo", valor)}
        />
        <CampoFormulario
          etiqueta="Valor máximo"
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

export function ModuloDiagramaBurbujas() {
  const [filas, setFilas] = useState<FilaEditable[]>(() => crearFilasIniciales());
  const [erroresFilas, setErroresFilas] = useState<Record<string, ErroresFila>>(
    {},
  );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [datosGenerados, setDatosGenerados] = useState<FilaDatos[]>([]);
  const [indiceBurbujaSeleccionada, setIndiceBurbujaSeleccionada] = useState<
    number | null
  >(null);
  const [nombresDiagrama, setNombresDiagrama] =
    useState<EstadoNombresDiagrama>({
      tituloGrafico: "Tamaño de la burbuja",
      nombreEjeX: "Eje X",
      nombreEjeY: "Eje Y",
      nombreVariableTamanio: "Tamaño de la burbuja",
    });
  const [ejesManuales, setEjesManuales] = useState<EstadoEjesManuales>({
    ejeX: crearEstadoEjeManual(0, 10, 2),
    ejeY: crearEstadoEjeManual(0, 10, 2),
  });
  const [dimensionesCanvas, setDimensionesCanvas] = useState({
    ancho: 1280,
    alto: 620,
  });
  const [exportandoExcel, setExportandoExcel] = useState(false);

  const contenedorGraficoRef = useRef<HTMLDivElement>(null);
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  const seccionGraficoRef = useRef<HTMLElement>(null);

  const diagramaGenerado = datosGenerados.length > 0;
  const tituloGrafico = nombresDiagrama.tituloGrafico.trim();
  const nombreEjeX = nombresDiagrama.nombreEjeX.trim() || "Eje X";
  const nombreEjeY = nombresDiagrama.nombreEjeY.trim() || "Eje Y";
  const nombreVariableTamanio =
    nombresDiagrama.nombreVariableTamanio.trim() || "Tamaño de la burbuja";
  const { minimo: minimoEjeX, maximo: maximoEjeX, paso: pasoEjeX } =
    ejesManuales.ejeX;
  const { minimo: minimoEjeY, maximo: maximoEjeY, paso: pasoEjeY } =
    ejesManuales.ejeY;
  const columnasActuales = {
    nombreX: nombreEjeX,
    nombreY: nombreEjeY,
    nombreTamanio: nombreVariableTamanio,
  };
  const configuracionRender: OpcionesRenderDiagrama = {
    mostrarTituloDiagrama: false,
    tituloDiagrama: tituloGrafico,
    ejeXManual: construirConfiguracionManualEje(ejesManuales.ejeX),
    ejeYManual: construirConfiguracionManualEje(ejesManuales.ejeY),
    indiceBurbujaSeleccionada,
  };
  const burbujaSeleccionada =
    indiceBurbujaSeleccionada !== null
      ? datosGenerados[indiceBurbujaSeleccionada] ?? null
      : null;

  useEffect(() => {
    const actualizarDimensiones = () => {
      if (!contenedorGraficoRef.current) {
        return;
      }

      const anchoDisponible = contenedorGraficoRef.current.offsetWidth - 24;
      const ancho = Math.max(320, anchoDisponible);
      const alto = Math.max(420, Math.round(ancho * 0.46));

      setDimensionesCanvas({
        ancho,
        alto,
      });
    };

    actualizarDimensiones();
    window.addEventListener("resize", actualizarDimensiones);

    return () => {
      window.removeEventListener("resize", actualizarDimensiones);
    };
  }, [diagramaGenerado]);

  useEffect(() => {
    if (!lienzoRef.current) {
      return;
    }

    const columnasDibujoActuales = {
      nombreX: nombreEjeX,
      nombreY: nombreEjeY,
      nombreTamanio: nombreVariableTamanio,
    };
    const configuracionDibujoActual: OpcionesRenderDiagrama = {
      mostrarTituloDiagrama: false,
      tituloDiagrama: tituloGrafico,
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
      indiceBurbujaSeleccionada,
    };
    const lienzo = lienzoRef.current;
    lienzo.width = dimensionesCanvas.ancho;
    lienzo.height = dimensionesCanvas.alto;

    dibujarDiagrama(
      lienzo,
      datosGenerados,
      columnasDibujoActuales,
      OPCIONES_RENDER_BASE,
      configuracionDibujoActual,
    );
  }, [
    datosGenerados,
    dimensionesCanvas.alto,
    dimensionesCanvas.ancho,
    indiceBurbujaSeleccionada,
    maximoEjeX,
    maximoEjeY,
    minimoEjeX,
    minimoEjeY,
    nombreEjeX,
    nombreEjeY,
    nombreVariableTamanio,
    pasoEjeX,
    pasoEjeY,
    tituloGrafico,
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
      const erroresActualizados = { ...erroresFila };
      delete erroresActualizados[campo];

      if (Object.keys(erroresActualizados).length === 0) {
        delete siguientesErrores[filaId];
      } else {
        siguientesErrores[filaId] = erroresActualizados;
      }

      return siguientesErrores;
    });
  };

  const actualizarFila = (
    filaId: string,
    campo: keyof Pick<FilaEditable, "x" | "y" | "tamanio">,
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

    setFilas((filasActuales) => [...filasActuales, crearFilaVacia()]);
    setMensajeEstado(null);
  };

  const eliminarFila = (filaId: string) => {
    setFilas((filasActuales) => {
      if (filasActuales.length === 1) {
        return [crearFilaVacia()];
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
      const cantidadFilas = Math.min(
        MAXIMO_FILAS,
        Math.max(filasActuales.length, filasPegadas.length),
      );

      const filasBase = Array.from({ length: cantidadFilas }, (_, indice) =>
        filasActuales[indice]
          ? { ...filasActuales[indice] }
          : crearFilaVacia(),
      );

      filasPegadas.slice(0, MAXIMO_FILAS).forEach((filaPegada, indice) => {
        filasBase[indice] = {
          ...filasBase[indice],
          x: filaPegada[0] ?? filasBase[indice].x,
          y: filaPegada[1] ?? filasBase[indice].y,
          tamanio: filaPegada[2] ?? filasBase[indice].tamanio,
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
          "Tu navegador no permite leer el portapapeles desde el botón. Usa Ctrl+V dentro de la tabla.",
      });
      return;
    }

    try {
      const texto = await navigator.clipboard.readText();
      aplicarContenidoPegado(texto);
    } catch (error) {
      console.error("No se pudo leer el portapapeles:", error);
      setMensajeEstado({
        tipo: "error",
        texto:
          "No pude acceder al portapapeles. Puedes pegar los datos manualmente con Ctrl+V sobre la tabla.",
      });
    }
  };

  const validarFilas = (): FilaDatos[] | null => {
    const nuevosErrores: Record<string, ErroresFila> = {};
    const datosLimpios: FilaDatos[] = [];

    filas.forEach((fila) => {
      const filaVacia =
        fila.x.trim() === "" && fila.y.trim() === "" && fila.tamanio.trim() === "";

      if (filaVacia) {
        return;
      }

      const erroresFila: ErroresFila = {};
      const valorX = parsearNumero(fila.x);
      const valorY = parsearNumero(fila.y);
      const valorTamanio = parsearNumero(fila.tamanio);

      if (valorX === null) {
        erroresFila.x = "Ingresa un número válido.";
      }

      if (valorY === null) {
        erroresFila.y = "Ingresa un número válido.";
      }

      if (valorTamanio === null) {
        erroresFila.tamanio = "Ingresa un número válido.";
      } else if (valorTamanio <= 0) {
        erroresFila.tamanio = "Debe ser mayor a 0.";
      }

      if (Object.keys(erroresFila).length > 0) {
        nuevosErrores[fila.id] = erroresFila;
        return;
      }

      datosLimpios.push({
        x: valorX!,
        y: valorY!,
        tamanio: valorTamanio!,
        color: fila.color || COLOR_BURBUJA_BASE,
      });
    });

    setErroresFilas(nuevosErrores);

    if (datosLimpios.length === 0) {
      setMensajeEstado({
        tipo: "error",
        texto: "Máximo 20 filas. Mínimo 1 fila completa para generar.",
      });
      return null;
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Hay filas con datos incompletos o inválidos. Corrígelas antes de generar el diagrama.",
      });
      return null;
    }

    return datosLimpios;
  };

  const generarDiagramaActual = () => {
    const datosValidados = validarFilas();

    if (!datosValidados) {
      return;
    }

    setDatosGenerados(datosValidados);
    setIndiceBurbujaSeleccionada(0);
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

  const manejarClickBurbuja = (
    evento: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    if (!lienzoRef.current || datosGenerados.length === 0) {
      return;
    }

    const rect = lienzoRef.current.getBoundingClientRect();
    const escalaX = lienzoRef.current.width / rect.width;
    const escalaY = lienzoRef.current.height / rect.height;
    const posicionX = (evento.clientX - rect.left) * escalaX;
    const posicionY = (evento.clientY - rect.top) * escalaY;

    const burbujas = calcularDatosBurbujas(
      datosGenerados,
      dimensionesCanvas.ancho,
      dimensionesCanvas.alto,
      MARGEN_LIENZO,
      configuracionRender,
    );

    const indiceDetectado = burbujas.findIndex((burbuja) => {
      const distancia = Math.hypot(posicionX - burbuja.x, posicionY - burbuja.y);
      return distancia <= burbuja.radio;
    });

    if (indiceDetectado >= 0) {
      setIndiceBurbujaSeleccionada(indiceDetectado);
    }
  };

  const actualizarNombreDiagrama = (
    campo: keyof EstadoNombresDiagrama,
    valor: string,
  ) => {
    setNombresDiagrama((estadoActual) => ({
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

  const actualizarColorBurbuja = (nuevoColor: string) => {
    if (indiceBurbujaSeleccionada === null) {
      return;
    }

    setDatosGenerados((datosActuales) =>
      datosActuales.map((dato, indice) =>
        indice === indiceBurbujaSeleccionada
          ? { ...dato, color: nuevoColor }
          : dato,
      ),
    );
  };

  const exportarExcel = async () => {
    if (!diagramaGenerado || !lienzoRef.current) {
      return;
    }

    const configuracionExportacion: ConfiguracionDiagrama = {
      numeroFilas: datosGenerados.length,
      configuracionColumnas: columnasActuales,
      datos: datosGenerados,
    };

    setExportandoExcel(true);

    try {
      await exportarComoExcel(
        configuracionExportacion,
        normalizarNombreArchivo(
          nombresDiagrama.tituloGrafico.trim() || "diagrama-burbujas",
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
            Diagramador de Burbujas
          </h1>
          <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-xl">
            Ingresa o pega tus datos desde Excel, genera el gráfico y personaliza
            colores, ejes y nombres.
          </p>
        </div>
      </section>

      <BloqueDiagrama titulo="1. Ingreso de datos">
        <div className="flex flex-col gap-5" onPaste={manejarPegadoDirecto}>
          <div className="overflow-hidden rounded-[1.6rem] border border-verde-claro bg-white/90">
            <div className="max-h-[950px] overflow-auto">
              <table className="min-w-[980px] w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-[#dce8df] text-left text-[1rem] text-acento-oscuro">
                  <tr>
                    <th className="w-14 border-b border-verde-claro px-4 py-4 font-semibold">
                      #
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {columnasActuales.nombreX}
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {columnasActuales.nombreY}
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {columnasActuales.nombreTamanio}
                    </th>
                    <th className="w-44 border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      Acción
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
                              placeholder="Número"
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
                              placeholder="Número"
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
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={fila.tamanio}
                              onChange={(evento) =>
                                actualizarFila(
                                  fila.id,
                                  "tamanio",
                                  evento.target.value,
                                )
                              }
                              placeholder="Número"
                              className={`min-h-14 rounded-[1.15rem] border px-4 text-[1.05rem] text-texto-principal outline-none transition focus:ring-4 ${
                                errores?.tamanio
                                  ? "border-alerta/50 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                                  : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                              }`}
                            />
                            {errores?.tamanio ? (
                              <p className="text-sm text-alerta">
                                {errores.tamanio}
                              </p>
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

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={agregarFila}
                disabled={filas.length >= MAXIMO_FILAS}
                className={`min-h-14 rounded-[1.15rem] border px-6 text-[1.05rem] font-semibold transition ${
                  filas.length >= MAXIMO_FILAS
                    ? "cursor-not-allowed border-verde-claro bg-[#edf3ef] text-texto-secundario/60"
                    : "border-verde-claro bg-[#eff6ef] text-acento-principal hover:border-acento-principal hover:bg-verde-suave"
                }`}
              >
                Agregar fila
              </button>

              <button
                type="button"
                onClick={generarDiagramaActual}
                className="min-h-14 rounded-[1.15rem] bg-acento-principal px-7 text-[1.05rem] font-semibold text-white shadow-[0_12px_28px_rgba(0,98,65,0.22)] transition hover:bg-acento-oscuro"
              >
                Generar diagrama
              </button>

              <button
                type="button"
                onClick={pegarDesdePortapapeles}
                className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-[#eff6ef] px-6 text-[1.05rem] font-semibold text-acento-principal transition hover:border-acento-principal hover:bg-verde-suave"
              >
                Pegar desde portapapeles
              </button>
            </div>

            <p className="text-[1.05rem] text-texto-principal">
              Máximo 20 filas. Mínimo 1 fila completa para generar.
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
        </div>
      </BloqueDiagrama>

      <section ref={seccionGraficoRef}>
        <BloqueDiagrama
          titulo="2. Diagrama de burbujas"
          descripcion={
            diagramaGenerado
              ? undefined
              : "Genera el diagrama para habilitar la personalización de ejes, nombres y colores por burbuja."
          }
        >
          {diagramaGenerado ? (
            <div className="flex flex-col gap-4">
              <div
                ref={contenedorGraficoRef}
                className="overflow-x-auto rounded-[1.7rem] border border-verde-claro bg-[#f8fbf8] p-5"
              >
                <canvas
                  ref={lienzoRef}
                  onClick={manejarClickBurbuja}
                  className="mx-auto h-auto min-w-[780px] cursor-pointer"
                  style={{
                    width: `${dimensionesCanvas.ancho}px`,
                    maxWidth: "none",
                  }}
                />
              </div>

              <p className="text-[1.05rem] text-texto-secundario">
                Burbuja seleccionada:{" "}
                {indiceBurbujaSeleccionada !== null
                  ? indiceBurbujaSeleccionada + 1
                  : "ninguna"}
              </p>
            </div>
          ) : null}
        </BloqueDiagrama>
      </section>

      {diagramaGenerado ? (
        <>
          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-3">
              <h2 className="text-[2rem] font-semibold tracking-tight text-acento-oscuro sm:text-[2.4rem]">
                3. Personalización del diagrama
              </h2>
              <p className="max-w-4xl text-base leading-8 text-texto-secundario">
                Ajusta nombres, color individual y la escala manual de los ejes
                sin salir de esta misma pantalla.
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
                  etiqueta="Título del gráfico"
                  valor={nombresDiagrama.tituloGrafico}
                  onChange={(valor) =>
                    actualizarNombreDiagrama("tituloGrafico", valor)
                  }
                />

                <CampoFormulario
                  etiqueta="Nombre eje X"
                  valor={nombresDiagrama.nombreEjeX}
                  onChange={(valor) =>
                    actualizarNombreDiagrama("nombreEjeX", valor)
                  }
                />

                <CampoFormulario
                  etiqueta="Nombre eje Y"
                  valor={nombresDiagrama.nombreEjeY}
                  onChange={(valor) =>
                    actualizarNombreDiagrama("nombreEjeY", valor)
                  }
                />

                <CampoFormulario
                  etiqueta="Variable de tamaño"
                  valor={nombresDiagrama.nombreVariableTamanio}
                  onChange={(valor) =>
                    actualizarNombreDiagrama("nombreVariableTamanio", valor)
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-6">
              <h3 className="text-[1.8rem] font-semibold tracking-tight text-acento-oscuro">
                Personalización de burbuja
              </h3>
              {burbujaSeleccionada ? (
                <>
                  <p className="text-[1.15rem] text-texto-principal">
                    Burbuja {indiceBurbujaSeleccionada! + 1} · X:{" "}
                    {formatearNumeroEntrada(burbujaSeleccionada.x)} · Y:{" "}
                    {formatearNumeroEntrada(burbujaSeleccionada.y)} · Tamaño:{" "}
                    {formatearNumeroEntrada(burbujaSeleccionada.tamanio)}
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-[1.05rem] text-texto-secundario">
                      <span>Color individual</span>
                      <span
                        className="h-7 w-7 rounded-full border border-acento-principal/25"
                        style={{
                          backgroundColor:
                            burbujaSeleccionada.color || COLOR_BURBUJA_BASE,
                        }}
                      />
                    </div>

                    <label className="cursor-pointer rounded-[1.15rem] border border-verde-claro bg-white px-4 py-5">
                      <span className="block h-[2px] w-full rounded-full bg-acento-oscuro/55" />
                      <input
                        type="color"
                        value={burbujaSeleccionada.color || COLOR_BURBUJA_BASE}
                        onChange={(evento) =>
                          actualizarColorBurbuja(evento.target.value)
                        }
                        className="sr-only"
                      />
                    </label>
                  </div>
                </>
              ) : (
                <p className="text-[1.05rem] text-texto-secundario">
                  Selecciona una burbuja en el gráfico para cambiar su color.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-6">
              <h3 className="text-[1.8rem] font-semibold tracking-tight text-acento-oscuro">
                Configuración manual de ejes
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

      <BloqueDiagrama
        titulo="4. Exportación"
        descripcion="Exporta la tabla y el gráfico en un archivo Excel presentable."
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
      </BloqueDiagrama>
    </div>
  );
}
