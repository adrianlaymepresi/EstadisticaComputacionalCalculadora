"use client";

import { useEffect, useRef, useState } from "react";
import {
  calcularBarrasColumnasCompuestas,
  dibujarDiagramaColumnasCompuestas,
} from "@/modulos/diagrama-columnas-compuestas/servicios/generador-diagrama-columnas-compuestas";
import { exportarExcelColumnasCompuestas } from "@/modulos/diagrama-columnas-compuestas/servicios/exportador-columnas-compuestas";
import type {
  ConfiguracionEjeYManualCompuesta,
  FilaColumnaCompuesta,
  OpcionesRenderColumnasCompuestas,
  SeleccionBarraCompuesta,
} from "@/modulos/diagrama-columnas-compuestas/tipos";
import { normalizarNombreArchivo } from "@/modulos/diagrama-burbujas/servicios/exportador";
import { parsearDatosTabla } from "@/modulos/diagrama-burbujas/utilidades/validaciones";

const MAXIMO_FILAS = 20;
const COLOR_SERIE_A = "#C4514D";
const COLOR_SERIE_B = "#5B87C2";

interface FilaEditable {
  id: string;
  categoria: string;
  valorSerieA: string;
  valorSerieB: string;
  colorSerieA: string;
  colorSerieB: string;
}

interface ErroresFila {
  categoria?: string;
  valorSerieA?: string;
  valorSerieB?: string;
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
  nombreVariablePrincipal: string;
  nombreVariableSecundaria: string;
  nombreSerieA: string;
  nombreSerieB: string;
  nombreEjeX: string;
  nombreEjeY: string;
}

let contadorFilas = 0;

function crearFilaVacia(): FilaEditable {
  contadorFilas += 1;

  return {
    id: `columna-compuesta-${contadorFilas}`,
    categoria: "",
    valorSerieA: "",
    valorSerieB: "",
    colorSerieA: COLOR_SERIE_A,
    colorSerieB: COLOR_SERIE_B,
  };
}

function crearFilasIniciales(): FilaEditable[] {
  return [crearFilaVacia(), crearFilaVacia()];
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
  const texto = Number.isInteger(valor)
    ? `${valor}`
    : parseFloat(valor.toFixed(4)).toString();

  return texto.replace(".", ",");
}

function calcularPasoVisual(valorMaximo: number): number {
  if (valorMaximo <= 0) {
    return 1;
  }

  const pasoBase = valorMaximo / 5;
  const magnitud = 10 ** Math.floor(Math.log10(pasoBase));
  const normalizado = pasoBase / magnitud;

  if (normalizado <= 1) return magnitud;
  if (normalizado <= 2) return 2 * magnitud;
  if (normalizado <= 5) return 5 * magnitud;
  return 10 * magnitud;
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

function construirConfiguracionManual(
  estado: EstadoEjeManual,
): ConfiguracionEjeYManualCompuesta | undefined {
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

function construirEstadoEjeY(datos: FilaColumnaCompuesta[]): EstadoEjeManual {
  if (datos.length === 0) {
    return crearEstadoEjeManual(0, 10, 2);
  }

  const maximo = Math.max(
    ...datos.map((dato) => Math.max(dato.valorSerieA, dato.valorSerieB)),
    0,
  );
  const paso = calcularPasoVisual(maximo || 1);
  const maximoVisual = Math.max(paso, Math.ceil(maximo / paso) * paso);

  return crearEstadoEjeManual(0, maximoVisual, paso);
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

function CampoConfiguracionEjeY({
  estado,
  onChange,
}: {
  estado: EstadoEjeManual;
  onChange: (campo: keyof EstadoEjeManual, valor: string) => void;
}) {
  return (
    <div className="rounded-[1.8rem] border border-verde-claro bg-white/85 p-6">
      <div className="flex flex-col gap-4">
        <h3 className="text-[1.8rem] font-semibold tracking-tight text-acento-oscuro">
          Eje Y
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

export function ModuloDiagramaColumnasCompuestas() {
  const [filas, setFilas] = useState<FilaEditable[]>(() => crearFilasIniciales());
  const [erroresFilas, setErroresFilas] = useState<Record<string, ErroresFila>>(
    {},
  );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [datosGenerados, setDatosGenerados] = useState<FilaColumnaCompuesta[]>(
    [],
  );
  const [seleccionBarra, setSeleccionBarra] =
    useState<SeleccionBarraCompuesta | null>(null);
  const [nombresModulo, setNombresModulo] = useState<EstadoNombresModulo>({
    tituloTabla: "Tabla No. 2",
    tituloGrafico: "Grafico No. 2",
    nombreVariablePrincipal: "Rendimiento estadistico",
    nombreVariableSecundaria: "Genero",
    nombreSerieA: "Varones",
    nombreSerieB: "Mujeres",
    nombreEjeX: "Rendimiento estadistico",
    nombreEjeY: "Frecuencia",
  });
  const [ejeYManual, setEjeYManual] = useState<EstadoEjeManual>(
    crearEstadoEjeManual(0, 10, 2),
  );
  const [dimensionesCanvas, setDimensionesCanvas] = useState({
    ancho: 980,
    alto: 560,
  });
  const [exportandoExcel, setExportandoExcel] = useState(false);

  const contenedorGraficoRef = useRef<HTMLDivElement>(null);
  const lienzoRef = useRef<HTMLCanvasElement>(null);

  const diagramaGenerado = datosGenerados.length > 0;
  const tituloTablaActual = nombresModulo.tituloTabla.trim() || "Tabla No. 2";
  const tituloGraficoActual =
    nombresModulo.tituloGrafico.trim() || "Grafico No. 2";
  const nombreVariablePrincipalActual =
    nombresModulo.nombreVariablePrincipal.trim() || "Categoria principal";
  const nombreVariableSecundariaActual =
    nombresModulo.nombreVariableSecundaria.trim() || "Segunda variable";
  const nombreSerieAActual = nombresModulo.nombreSerieA.trim() || "Serie A";
  const nombreSerieBActual = nombresModulo.nombreSerieB.trim() || "Serie B";
  const nombreEjeXActual =
    nombresModulo.nombreEjeX.trim() || "Variable cualitativa";
  const nombreEjeYActual = nombresModulo.nombreEjeY.trim() || "Frecuencia";
  const totalSerieA = datosGenerados.reduce(
    (acumulado, fila) => acumulado + fila.valorSerieA,
    0,
  );
  const totalSerieB = datosGenerados.reduce(
    (acumulado, fila) => acumulado + fila.valorSerieB,
    0,
  );
  const barraSeleccionada = (() => {
    if (!seleccionBarra) {
      return null;
    }

    const fila = datosGenerados[seleccionBarra.categoriaIndice];

    if (!fila) {
      return null;
    }

    const esSerieA = seleccionBarra.serie === "serieA";

    return {
      categoria: fila.categoria,
      nombreSerie: esSerieA ? nombreSerieAActual : nombreSerieBActual,
      valor: esSerieA ? fila.valorSerieA : fila.valorSerieB,
      color: esSerieA
        ? fila.colorSerieA || COLOR_SERIE_A
        : fila.colorSerieB || COLOR_SERIE_B,
      serie: seleccionBarra.serie,
    };
  })();

  useEffect(() => {
    const actualizarDimensiones = () => {
      if (!contenedorGraficoRef.current) {
        return;
      }

      const anchoDisponible = contenedorGraficoRef.current.offsetWidth - 24;
      const anchoVisual =
        datosGenerados.length > 0
          ? Math.max(980, datosGenerados.length * 110 + 340)
          : 980;
      const ancho = Math.max(anchoVisual, anchoDisponible);
      const alto = Math.max(540, Math.round(ancho * 0.5));
      setDimensionesCanvas({ ancho, alto });
    };

    actualizarDimensiones();
    window.addEventListener("resize", actualizarDimensiones);

    return () => window.removeEventListener("resize", actualizarDimensiones);
  }, [datosGenerados.length, diagramaGenerado]);

  useEffect(() => {
    if (!lienzoRef.current) {
      return;
    }

    const configuracionRender: OpcionesRenderColumnasCompuestas = {
      nombreSerieA: nombreSerieAActual,
      nombreSerieB: nombreSerieBActual,
      nombreEjeX: nombreEjeXActual,
      nombreEjeY: nombreEjeYActual,
      ejeYManual: construirConfiguracionManual(ejeYManual),
      seleccion: seleccionBarra,
    };
    const lienzo = lienzoRef.current;
    lienzo.width = dimensionesCanvas.ancho;
    lienzo.height = dimensionesCanvas.alto;
    dibujarDiagramaColumnasCompuestas(lienzo, datosGenerados, configuracionRender);
  }, [
    datosGenerados,
    dimensionesCanvas.alto,
    dimensionesCanvas.ancho,
    ejeYManual,
    nombreEjeXActual,
    nombreEjeYActual,
    nombreSerieAActual,
    nombreSerieBActual,
    seleccionBarra,
  ]);

  const limpiarErrorCampo = (filaId: string, campo: keyof ErroresFila) => {
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
    campo: keyof Pick<FilaEditable, "categoria" | "valorSerieA" | "valorSerieB">,
    valor: string,
  ) => {
    setFilas((filasActuales) =>
      filasActuales.map((fila) =>
        fila.id === filaId ? { ...fila, [campo]: valor } : fila,
      ),
    );
    limpiarErrorCampo(filaId, campo);
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

  const agregarFila = () => {
    if (filas.length >= MAXIMO_FILAS) {
      return;
    }

    setFilas((filasActuales) => [...filasActuales, crearFilaVacia()]);
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
      const cantidad = Math.min(
        MAXIMO_FILAS,
        Math.max(filasActuales.length, filasPegadas.length),
      );

      const filasBase = Array.from({ length: cantidad }, (_, indice) =>
        filasActuales[indice]
          ? { ...filasActuales[indice] }
          : crearFilaVacia(),
      );

      filasPegadas.slice(0, MAXIMO_FILAS).forEach((filaPegada, indice) => {
        filasBase[indice] = {
          ...filasBase[indice],
          categoria: filaPegada[0] ?? filasBase[indice].categoria,
          valorSerieA: filaPegada[1] ?? filasBase[indice].valorSerieA,
          valorSerieB: filaPegada[2] ?? filasBase[indice].valorSerieB,
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

  const validarFilas = (): FilaColumnaCompuesta[] | null => {
    const nuevosErrores: Record<string, ErroresFila> = {};
    const datosLimpios: FilaColumnaCompuesta[] = [];
    const categoriasUsadas = new Set<string>();

    filas.forEach((fila) => {
      const categoria = fila.categoria.trim();
      const valorSerieA = parsearNumero(fila.valorSerieA);
      const valorSerieB = parsearNumero(fila.valorSerieB);
      const filaVacia =
        categoria === "" &&
        fila.valorSerieA.trim() === "" &&
        fila.valorSerieB.trim() === "";

      if (filaVacia) {
        return;
      }

      const errores: ErroresFila = {};
      const categoriaNormalizada = categoria.toLowerCase();

      if (!categoria) {
        errores.categoria = "Ingresa una categoria.";
      } else if (categoriasUsadas.has(categoriaNormalizada)) {
        errores.categoria = "La categoria debe ser distinta.";
      }

      if (valorSerieA === null) {
        errores.valorSerieA = "Ingresa un numero valido.";
      } else if (valorSerieA < 0) {
        errores.valorSerieA = "El valor no puede ser negativo.";
      }

      if (valorSerieB === null) {
        errores.valorSerieB = "Ingresa un numero valido.";
      } else if (valorSerieB < 0) {
        errores.valorSerieB = "El valor no puede ser negativo.";
      }

      if (Object.keys(errores).length > 0) {
        nuevosErrores[fila.id] = errores;
        return;
      }

      categoriasUsadas.add(categoriaNormalizada);
      datosLimpios.push({
        categoria,
        valorSerieA: valorSerieA!,
        valorSerieB: valorSerieB!,
        colorSerieA: fila.colorSerieA || COLOR_SERIE_A,
        colorSerieB: fila.colorSerieB || COLOR_SERIE_B,
      });
    });

    setErroresFilas(nuevosErrores);

    if (datosLimpios.length === 0) {
      setMensajeEstado({
        tipo: "error",
        texto: "Maximo 20 categorias. Minimo 1 fila completa para generar.",
      });
      return null;
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Hay filas con errores o categorias repetidas. Corrigelas antes de generar el diagrama.",
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
    setSeleccionBarra({ categoriaIndice: 0, serie: "serieA" });
    setEjeYManual(construirEstadoEjeY(datosValidados));
    setMensajeEstado({
      tipo: "exito",
      texto: "Diagrama generado correctamente.",
    });
  };

  const manejarClickBarra = (evento: React.MouseEvent<HTMLCanvasElement>) => {
    if (!lienzoRef.current || datosGenerados.length === 0) {
      return;
    }

    const rect = lienzoRef.current.getBoundingClientRect();
    const escalaX = lienzoRef.current.width / rect.width;
    const escalaY = lienzoRef.current.height / rect.height;
    const posicionX = (evento.clientX - rect.left) * escalaX;
    const posicionY = (evento.clientY - rect.top) * escalaY;
    const configuracionRender: OpcionesRenderColumnasCompuestas = {
      nombreSerieA: nombreSerieAActual,
      nombreSerieB: nombreSerieBActual,
      nombreEjeX: nombreEjeXActual,
      nombreEjeY: nombreEjeYActual,
      ejeYManual: construirConfiguracionManual(ejeYManual),
      seleccion: seleccionBarra,
    };
    const barras = calcularBarrasColumnasCompuestas(
      datosGenerados,
      dimensionesCanvas.ancho,
      dimensionesCanvas.alto,
      configuracionRender,
    );
    const barra = barras.find(
      (barraActual) =>
        posicionX >= barraActual.x &&
        posicionX <= barraActual.x + barraActual.ancho &&
        posicionY >= barraActual.y &&
        posicionY <= barraActual.y + barraActual.alto,
    );

    if (!barra) {
      return;
    }

    const categoriaIndice = datosGenerados.findIndex(
      (dato) => dato.categoria === barra.categoria,
    );

    if (categoriaIndice >= 0) {
      setSeleccionBarra({ categoriaIndice, serie: barra.serie });
    }
  };

  const actualizarColorBarra = (nuevoColor: string) => {
    if (!seleccionBarra) {
      return;
    }

    setDatosGenerados((datosActuales) =>
      datosActuales.map((dato, indice) => {
        if (indice !== seleccionBarra.categoriaIndice) {
          return dato;
        }

        if (seleccionBarra.serie === "serieA") {
          return { ...dato, colorSerieA: nuevoColor };
        }

        return { ...dato, colorSerieB: nuevoColor };
      }),
    );
  };

  const exportarExcel = async () => {
    if (!diagramaGenerado) {
      return;
    }

    setExportandoExcel(true);

    try {
      await exportarExcelColumnasCompuestas(
        {
          datos: datosGenerados,
          tituloTabla: tituloTablaActual,
          nombreVariablePrincipal: nombreVariablePrincipalActual,
          nombreVariableSecundaria: nombreVariableSecundariaActual,
          nombreSerieA: nombreSerieAActual,
          nombreSerieB: nombreSerieBActual,
        },
        normalizarNombreArchivo(tituloGraficoActual || "columnas-compuestas"),
        lienzoRef.current ?? undefined,
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
            Diagrama de Columnas Compuestas
          </h1>
          <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-xl">
            Ingresa categorias con dos grupos comparables, genera la tabla
            resumen y construye el diagrama de columnas compuestas con
            personalizacion y exportacion.
          </p>
        </div>
      </section>

      <BloqueModulo titulo="1. Ingreso de datos">
        <div className="flex flex-col gap-5" onPaste={manejarPegadoDirecto}>
          <div className="overflow-hidden rounded-[1.6rem] border border-verde-claro bg-white/90">
            <div className="max-h-[900px] overflow-auto">
              <table className="min-w-[980px] w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-[#dce8df] text-left text-[1rem] text-acento-oscuro">
                  <tr>
                    <th className="w-14 border-b border-verde-claro px-4 py-4 font-semibold">
                      #
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {nombreVariablePrincipalActual}
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {nombreSerieAActual}
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {nombreSerieBActual}
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
                              value={fila.categoria}
                              onChange={(evento) =>
                                actualizarFila(
                                  fila.id,
                                  "categoria",
                                  evento.target.value,
                                )
                              }
                              placeholder="Categoria"
                              className={`min-h-14 rounded-[1.15rem] border px-4 text-[1.05rem] text-texto-principal outline-none transition focus:ring-4 ${
                                errores?.categoria
                                  ? "border-alerta/50 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                                  : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                              }`}
                            />
                            {errores?.categoria ? (
                              <p className="text-sm text-alerta">
                                {errores.categoria}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="border-b border-l border-verde-claro px-3 py-3 align-top">
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={fila.valorSerieA}
                              onChange={(evento) =>
                                actualizarFila(
                                  fila.id,
                                  "valorSerieA",
                                  evento.target.value,
                                )
                              }
                              placeholder={nombreSerieAActual}
                              className={`min-h-14 rounded-[1.15rem] border px-4 text-[1.05rem] text-texto-principal outline-none transition focus:ring-4 ${
                                errores?.valorSerieA
                                  ? "border-alerta/50 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                                  : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                              }`}
                            />
                            {errores?.valorSerieA ? (
                              <p className="text-sm text-alerta">
                                {errores.valorSerieA}
                              </p>
                            ) : null}
                          </div>
                        </td>
                        <td className="border-b border-l border-verde-claro px-3 py-3 align-top">
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={fila.valorSerieB}
                              onChange={(evento) =>
                                actualizarFila(
                                  fila.id,
                                  "valorSerieB",
                                  evento.target.value,
                                )
                              }
                              placeholder={nombreSerieBActual}
                              className={`min-h-14 rounded-[1.15rem] border px-4 text-[1.05rem] text-texto-principal outline-none transition focus:ring-4 ${
                                errores?.valorSerieB
                                  ? "border-alerta/50 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                                  : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                              }`}
                            />
                            {errores?.valorSerieB ? (
                              <p className="text-sm text-alerta">
                                {errores.valorSerieB}
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
                onClick={generarDiagrama}
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
              Maximo 20 categorias distintas para graficar con dos series.
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
      </BloqueModulo>

      <BloqueModulo
        titulo="2. Tabla estadistica"
        descripcion={
          diagramaGenerado
            ? "La tabla resume la variable principal en filas y compara las dos series de la variable secundaria."
            : "Genera el diagrama para construir la tabla resumen con los totales de ambas series."
        }
      >
        {diagramaGenerado ? (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h3 className="text-4xl font-semibold text-acento-oscuro">
                {tituloTablaActual}
              </h3>
            </div>

            <div className="overflow-auto rounded-[1.6rem] border border-verde-claro bg-white/90">
              <table className="min-w-[860px] w-full border-collapse text-center">
                <thead className="bg-acento-oscuro text-white">
                  <tr>
                    <th
                      rowSpan={2}
                      className="border-b border-white/20 px-4 py-4 text-left text-xl font-semibold"
                    >
                      {nombreVariablePrincipalActual}
                    </th>
                    <th
                      colSpan={2}
                      className="border-b border-l border-white/20 px-4 py-4 text-xl font-semibold"
                    >
                      {nombreVariableSecundariaActual}
                    </th>
                  </tr>
                  <tr>
                    <th className="border-b border-l border-white/20 px-4 py-4 text-xl font-semibold">
                      {nombreSerieAActual}
                    </th>
                    <th className="border-b border-l border-white/20 px-4 py-4 text-xl font-semibold">
                      {nombreSerieBActual}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {datosGenerados.map((fila, indice) => (
                    <tr
                      key={`${fila.categoria}-${indice}`}
                      className={indice % 2 === 0 ? "bg-[#eee6f4]" : "bg-[#e3d8ef]"}
                    >
                      <td className="border-b border-l border-black/10 px-4 py-4 text-left text-[1.45rem] text-texto-principal">
                        {fila.categoria}
                      </td>
                      <td className="border-b border-l border-black/10 px-4 py-4 text-[1.45rem] font-semibold text-texto-principal">
                        {formatearNumeroEntrada(fila.valorSerieA)}
                      </td>
                      <td className="border-b border-l border-black/10 px-4 py-4 text-[1.45rem] font-semibold text-texto-principal">
                        {formatearNumeroEntrada(fila.valorSerieB)}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-[#d8cfe6]">
                    <td className="border-b border-l border-black/10 px-4 py-4 text-left text-[1.55rem] font-semibold text-texto-principal">
                      TOTAL
                    </td>
                    <td className="border-b border-l border-black/10 px-4 py-4 text-[1.55rem] font-semibold text-texto-principal">
                      {formatearNumeroEntrada(totalSerieA)}
                    </td>
                    <td className="border-b border-l border-black/10 px-4 py-4 text-[1.55rem] font-semibold text-texto-principal">
                      {formatearNumeroEntrada(totalSerieB)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </BloqueModulo>

      <BloqueModulo
        titulo="3. Diagrama de columnas compuestas"
        descripcion={
          diagramaGenerado
            ? undefined
            : "Genera el diagrama para visualizar ambos grupos, seleccionar una barra y personalizarla."
        }
      >
        {diagramaGenerado ? (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h3 className="text-4xl font-semibold text-acento-oscuro">
                {tituloGraficoActual}
              </h3>
            </div>

            <div
              ref={contenedorGraficoRef}
              className="overflow-x-auto rounded-[1.7rem] border border-verde-claro bg-[#f8fbf8] p-5"
            >
              <canvas
                ref={lienzoRef}
                onClick={manejarClickBarra}
                className="mx-auto h-auto min-w-[980px] cursor-pointer"
                style={{ width: `${dimensionesCanvas.ancho}px`, maxWidth: "none" }}
              />
            </div>

            <p className="text-[1.05rem] text-texto-secundario">
              Barra seleccionada:{" "}
              {barraSeleccionada
                ? `${barraSeleccionada.categoria} | ${barraSeleccionada.nombreSerie}`
                : "ninguna"}
            </p>
          </div>
        ) : null}
      </BloqueModulo>

      {diagramaGenerado ? (
        <>
          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-3">
              <h2 className="text-[2rem] font-semibold tracking-tight text-acento-oscuro sm:text-[2.4rem]">
                4. Personalizacion del diagrama
              </h2>
              <p className="max-w-4xl text-base leading-8 text-texto-secundario">
                Ajusta titulos, nombres de variables, nombres de series, color
                individual y la escala del eje Y en esta misma pantalla.
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
                  onChange={(valor) =>
                    actualizarNombreModulo("tituloGrafico", valor)
                  }
                />
                <CampoFormulario
                  etiqueta="Variable principal"
                  valor={nombresModulo.nombreVariablePrincipal}
                  onChange={(valor) =>
                    actualizarNombreModulo("nombreVariablePrincipal", valor)
                  }
                />
                <CampoFormulario
                  etiqueta="Variable secundaria"
                  valor={nombresModulo.nombreVariableSecundaria}
                  onChange={(valor) =>
                    actualizarNombreModulo("nombreVariableSecundaria", valor)
                  }
                />
                <CampoFormulario
                  etiqueta="Nombre serie A"
                  valor={nombresModulo.nombreSerieA}
                  onChange={(valor) => actualizarNombreModulo("nombreSerieA", valor)}
                />
                <CampoFormulario
                  etiqueta="Nombre serie B"
                  valor={nombresModulo.nombreSerieB}
                  onChange={(valor) => actualizarNombreModulo("nombreSerieB", valor)}
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
                Personalizacion de barra
              </h3>

              {barraSeleccionada ? (
                <>
                  <p className="text-[1.15rem] text-texto-principal">
                    {barraSeleccionada.nombreSerie} | {barraSeleccionada.categoria}
                    {" | "}Valor: {formatearNumeroEntrada(barraSeleccionada.valor)}
                  </p>

                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 text-[1.05rem] text-texto-secundario">
                      <span>Color individual</span>
                      <span
                        className="h-7 w-7 rounded-full border border-acento-principal/25"
                        style={{ backgroundColor: barraSeleccionada.color }}
                      />
                    </div>

                    <label className="cursor-pointer rounded-[1.15rem] border border-verde-claro bg-white px-4 py-5">
                      <span className="block h-[2px] w-full rounded-full bg-acento-oscuro/55" />
                      <input
                        type="color"
                        value={barraSeleccionada.color}
                        onChange={(evento) =>
                          actualizarColorBarra(evento.target.value)
                        }
                        className="sr-only"
                      />
                    </label>
                  </div>
                </>
              ) : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
            <div className="flex flex-col gap-6">
              <h3 className="text-[1.8rem] font-semibold tracking-tight text-acento-oscuro">
                Configuracion manual del eje Y
              </h3>
              <CampoConfiguracionEjeY
                estado={ejeYManual}
                onChange={(campo, valor) =>
                  setEjeYManual((estadoActual) => ({
                    ...estadoActual,
                    [campo]: valor,
                  }))
                }
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
