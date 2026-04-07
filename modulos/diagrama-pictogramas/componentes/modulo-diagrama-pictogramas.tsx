"use client";

import NextImage from "next/image";
import { useEffect, useRef, useState } from "react";
import { normalizarNombreArchivo } from "@/modulos/diagrama-burbujas/servicios/exportador";
import { parsearDatosTabla } from "@/modulos/diagrama-burbujas/utilidades/validaciones";
import { exportarExcelPictogramas } from "@/modulos/diagrama-pictogramas/servicios/exportador-pictogramas";
import { dibujarDiagramaPictogramas } from "@/modulos/diagrama-pictogramas/servicios/generador-diagrama-pictogramas";
import type {
  ConfiguracionEjeYManualPictogramas,
  FilaDiagramaPictogramas,
  ImagenPictogramaRender,
  OpcionesRenderPictogramas,
  PictogramaCalculado,
} from "@/modulos/diagrama-pictogramas/tipos";

const MAXIMO_FILAS = 20;
const formateadorNumero = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

interface FilaEditable {
  id: string;
  categoria: string;
  valor: string;
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
  nombreVariableCualitativa: string;
  nombreVariableCuantitativa: string;
  nombreEjeX: string;
  nombreEjeY: string;
}

let contadorFilas = 0;

function crearFilaVacia(): FilaEditable {
  contadorFilas += 1;

  return {
    id: `diagrama-pictogramas-${contadorFilas}`,
    categoria: "",
    valor: "",
  };
}

function crearFilasIniciales(): FilaEditable[] {
  return [crearFilaVacia(), crearFilaVacia()];
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

function formatearPorcentaje(valor: number): string {
  return `${valor.toFixed(2).replace(".", ",")}%`;
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
): ConfiguracionEjeYManualPictogramas | undefined {
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

function construirEstadoEjeY(
  datos: FilaDiagramaPictogramas[],
): EstadoEjeManual {
  if (datos.length === 0) {
    return crearEstadoEjeManual(0, 10, 2);
  }

  const maximo = Math.max(...datos.map((dato) => dato.valor), 0);
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

function leerArchivoComoDataUrl(archivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => {
      if (typeof lector.result === "string") {
        resolve(lector.result);
        return;
      }

      reject(new Error("No se pudo leer la imagen seleccionada."));
    };

    lector.onerror = () =>
      reject(new Error("No se pudo leer el archivo de imagen."));
    lector.readAsDataURL(archivo);
  });
}

function cargarImagenDesdeFuente(
  fuente: string,
): Promise<ImagenPictogramaRender> {
  return new Promise((resolve, reject) => {
    const imagen = new Image();

    imagen.onload = () => {
      const ancho = imagen.naturalWidth || imagen.width || 1;
      const alto = imagen.naturalHeight || imagen.height || 1;

      resolve({
        imagen,
        relacionAspecto: ancho / alto,
      });
    };

    imagen.onerror = () =>
      reject(new Error("No se pudo cargar la imagen seleccionada."));
    imagen.src = fuente;
  });
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

function TarjetaImagenPrevia({
  titulo,
  subtitulo,
  fuente,
  seleccionada = false,
}: {
  titulo: string;
  subtitulo: string;
  fuente?: string | null;
  seleccionada?: boolean;
}) {
  return (
    <div
      className={`rounded-[1.6rem] border bg-white/90 p-5 ${
        seleccionada ? "border-black" : "border-verde-claro"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h4 className="text-[1.2rem] font-semibold text-acento-oscuro">
            {titulo}
          </h4>
          <p className="text-sm leading-6 text-texto-secundario">
            {subtitulo}
          </p>
        </div>

        <div className="flex min-h-[180px] items-center justify-center rounded-[1.35rem] border border-dashed border-verde-claro bg-[#f8fbf8] p-4">
          {fuente ? (
            <NextImage
              src={fuente}
              alt={titulo}
              width={160}
              height={160}
              unoptimized
              className="max-h-[150px] max-w-full object-contain"
            />
          ) : (
            <span className="text-sm text-texto-secundario">
              Aun no hay imagen cargada
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ModuloDiagramaPictogramas() {
  const [filas, setFilas] = useState<FilaEditable[]>(() => crearFilasIniciales());
  const [erroresFilas, setErroresFilas] = useState<Record<string, ErroresFila>>(
    {},
  );
  const [mensajeEstado, setMensajeEstado] = useState<MensajeEstado | null>(null);
  const [datosGenerados, setDatosGenerados] = useState<FilaDiagramaPictogramas[]>(
    [],
  );
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number | null>(
    null,
  );
  const [imagenGeneral, setImagenGeneral] = useState<string | null>(null);
  const [nombreImagenGeneral, setNombreImagenGeneral] = useState("");
  const [nombresModulo, setNombresModulo] = useState<EstadoNombresModulo>({
    tituloTabla: "Tabla No. 5",
    tituloGrafico: "Grafico No. 5",
    nombreVariableCualitativa: "Variable cualitativa",
    nombreVariableCuantitativa: "fi",
    nombreEjeX: "Variable cualitativa",
    nombreEjeY: "Frecuencia",
  });
  const [ejeYManual, setEjeYManual] = useState<EstadoEjeManual>(
    crearEstadoEjeManual(0, 10, 2),
  );
  const [dimensionesCanvas, setDimensionesCanvas] = useState({
    ancho: 1200,
    alto: 640,
  });
  const [exportandoExcel, setExportandoExcel] = useState(false);
  const [cargandoImagenGeneral, setCargandoImagenGeneral] = useState(false);
  const [cargandoImagenIndividual, setCargandoImagenIndividual] = useState(false);

  const contenedorGraficoRef = useRef<HTMLDivElement>(null);
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  const pictogramasRef = useRef<PictogramaCalculado[]>([]);

  const diagramaGenerado = datosGenerados.length > 0;
  const total = datosGenerados.reduce(
    (acumulado, fila) => acumulado + fila.valor,
    0,
  );
  const nombreVariableCualitativaActual =
    nombresModulo.nombreVariableCualitativa.trim() || "Variable cualitativa";
  const nombreVariableCuantitativaActual =
    nombresModulo.nombreVariableCuantitativa.trim() || "fi";
  const nombreEjeXActual =
    nombresModulo.nombreEjeX.trim() || "Variable cualitativa";
  const nombreEjeYActual = nombresModulo.nombreEjeY.trim() || "Frecuencia";
  const pictogramaSeleccionado =
    indiceSeleccionado !== null ? datosGenerados[indiceSeleccionado] ?? null : null;
  const imagenPictogramaSeleccionado =
    pictogramaSeleccionado?.imagenIndividual || imagenGeneral;
  const resumenTabla = datosGenerados.map((fila) => ({
    ...fila,
    porcentaje: total > 0 ? (fila.valor / total) * 100 : 0,
    fuenteImagen: fila.imagenIndividual || imagenGeneral,
    usaImagenIndividual: Boolean(fila.imagenIndividual),
  }));

  useEffect(() => {
    const actualizarDimensiones = () => {
      if (!contenedorGraficoRef.current) {
        return;
      }

      const anchoDisponible = contenedorGraficoRef.current.offsetWidth - 24;
      const anchoMinimo = Math.max(980, datosGenerados.length * 140 + 180);
      const ancho = Math.max(320, Math.max(anchoDisponible, anchoMinimo));
      const alto = Math.max(520, Math.min(760, Math.round(ancho * 0.56)));
      setDimensionesCanvas({ ancho, alto });
    };

    actualizarDimensiones();
    window.addEventListener("resize", actualizarDimensiones);

    return () => window.removeEventListener("resize", actualizarDimensiones);
  }, [diagramaGenerado, datosGenerados.length]);

  useEffect(() => {
    if (!lienzoRef.current || !diagramaGenerado) {
      pictogramasRef.current = [];
      return;
    }

    const fuentesImagen = datosGenerados
      .map((fila) => fila.imagenIndividual || imagenGeneral)
      .filter((fuente): fuente is string => Boolean(fuente));

    if (fuentesImagen.length !== datosGenerados.length) {
      return;
    }

    let cancelado = false;

    const dibujar = async () => {
      try {
        const configuracionRender: OpcionesRenderPictogramas = {
          nombreEjeX: nombreEjeXActual,
          nombreEjeY: nombreEjeYActual,
          ejeYManual: construirConfiguracionManual(ejeYManual),
          indiceSeleccionado,
        };
        const imagenes = await Promise.all(
          fuentesImagen.map((fuente) => cargarImagenDesdeFuente(fuente)),
        );

        if (cancelado || !lienzoRef.current) {
          return;
        }

        const lienzo = lienzoRef.current;
        lienzo.width = dimensionesCanvas.ancho;
        lienzo.height = dimensionesCanvas.alto;
        pictogramasRef.current = dibujarDiagramaPictogramas(
          lienzo,
          datosGenerados,
          imagenes,
          configuracionRender,
        );
      } catch (error) {
        console.error("No se pudo renderizar el pictograma:", error);
      }
    };

    dibujar();

    return () => {
      cancelado = true;
    };
  }, [
    datosGenerados,
    diagramaGenerado,
    dimensionesCanvas.alto,
    dimensionesCanvas.ancho,
    ejeYManual,
    imagenGeneral,
    indiceSeleccionado,
    nombreEjeXActual,
    nombreEjeYActual,
  ]);

  const actualizarNombreModulo = (
    campo: keyof EstadoNombresModulo,
    valor: string,
  ) => {
    setNombresModulo((estadoActual) => ({
      ...estadoActual,
      [campo]: valor,
    }));
  };

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

  const cargarImagenGeneralDesdeDispositivo = async (
    evento: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const archivo = evento.target.files?.[0];

    if (!archivo) {
      return;
    }

    setCargandoImagenGeneral(true);

    try {
      const dataUrl = await leerArchivoComoDataUrl(archivo);
      await cargarImagenDesdeFuente(dataUrl);
      setImagenGeneral(dataUrl);
      setNombreImagenGeneral(archivo.name);
      setMensajeEstado({
        tipo: "info",
        texto: "Imagen base cargada correctamente.",
      });
    } catch (error) {
      console.error("No se pudo cargar la imagen base:", error);
      setMensajeEstado({
        tipo: "error",
        texto:
          "No se pudo cargar la imagen base. Verifica el archivo e intenta nuevamente.",
      });
    } finally {
      setCargandoImagenGeneral(false);
      evento.target.value = "";
    }
  };

  const cargarImagenIndividualSeleccionada = async (
    evento: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const archivo = evento.target.files?.[0];

    if (!archivo || indiceSeleccionado === null) {
      return;
    }

    setCargandoImagenIndividual(true);

    try {
      const dataUrl = await leerArchivoComoDataUrl(archivo);
      await cargarImagenDesdeFuente(dataUrl);

      setDatosGenerados((datosActuales) =>
        datosActuales.map((dato, indice) =>
          indice === indiceSeleccionado
            ? { ...dato, imagenIndividual: dataUrl }
            : dato,
        ),
      );
      setMensajeEstado({
        tipo: "info",
        texto: "Imagen individual actualizada correctamente.",
      });
    } catch (error) {
      console.error("No se pudo cargar la imagen individual:", error);
      setMensajeEstado({
        tipo: "error",
        texto:
          "No se pudo cargar la imagen individual. Verifica el archivo e intenta nuevamente.",
      });
    } finally {
      setCargandoImagenIndividual(false);
      evento.target.value = "";
    }
  };

  const usarImagenGeneralEnSeleccion = () => {
    if (indiceSeleccionado === null) {
      return;
    }

    setDatosGenerados((datosActuales) =>
      datosActuales.map((dato, indice) =>
        indice === indiceSeleccionado
          ? { ...dato, imagenIndividual: undefined }
          : dato,
      ),
    );
    setMensajeEstado({
      tipo: "info",
      texto: "El pictograma seleccionado vuelve a usar la imagen general.",
    });
  };

  const validarFilas = (): FilaDiagramaPictogramas[] | null => {
    const nuevosErrores: Record<string, ErroresFila> = {};
    const datosLimpios: FilaDiagramaPictogramas[] = [];
    const categoriasUsadas = new Set<string>();

    filas.forEach((fila) => {
      const categoria = fila.categoria.trim();
      const valor = parsearNumero(fila.valor);
      const filaVacia = categoria === "" && fila.valor.trim() === "";

      if (filaVacia) {
        return;
      }

      const errores: ErroresFila = {};
      const categoriaNormalizada = categoria.toLowerCase();

      if (!categoria) {
        errores.categoria = "Ingresa una variable cualitativa.";
      } else if (categoriasUsadas.has(categoriaNormalizada)) {
        errores.categoria = "La variable cualitativa debe ser distinta.";
      }

      if (valor === null) {
        errores.valor = "Ingresa un valor numerico valido.";
      } else if (valor < 0) {
        errores.valor = "El valor cuantitativo no puede ser negativo.";
      }

      if (Object.keys(errores).length > 0) {
        nuevosErrores[fila.id] = errores;
        return;
      }

      categoriasUsadas.add(categoriaNormalizada);
      datosLimpios.push({
        categoria,
        valor: valor!,
      });
    });

    setErroresFilas(nuevosErrores);

    if (datosLimpios.length === 0) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Maximo 20 filas. Minimo 1 fila completa y una imagen base para generar.",
      });
      return null;
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Hay filas con errores o variables repetidas. Corrigelas antes de generar el pictograma.",
      });
      return null;
    }

    return datosLimpios;
  };

  const generarDiagrama = () => {
    if (!imagenGeneral) {
      setMensajeEstado({
        tipo: "error",
        texto:
          "Primero debes cargar una imagen base desde tu dispositivo para usarla en el pictograma.",
      });
      return;
    }

    const datosValidados = validarFilas();

    if (!datosValidados) {
      return;
    }

    const imagenesPrevias = new Map(
      datosGenerados.map((dato) => [dato.categoria.toLowerCase(), dato.imagenIndividual]),
    );
    const datosConImagenes = datosValidados.map((dato) => ({
      ...dato,
      imagenIndividual: imagenesPrevias.get(dato.categoria.toLowerCase()) || undefined,
    }));

    setDatosGenerados(datosConImagenes);
    setIndiceSeleccionado(0);
    setEjeYManual(construirEstadoEjeY(datosConImagenes));
    setMensajeEstado({
      tipo: "exito",
      texto: "Pictograma generado correctamente.",
    });
  };

  const manejarClickPictograma = (
    evento: React.MouseEvent<HTMLCanvasElement>,
  ) => {
    if (!lienzoRef.current || pictogramasRef.current.length === 0) {
      return;
    }

    const rect = lienzoRef.current.getBoundingClientRect();
    const escalaX = lienzoRef.current.width / rect.width;
    const escalaY = lienzoRef.current.height / rect.height;
    const posicionX = (evento.clientX - rect.left) * escalaX;
    const posicionY = (evento.clientY - rect.top) * escalaY;

    const indice = pictogramasRef.current.findIndex(
      (pictograma) =>
        posicionX >= pictograma.x &&
        posicionX <= pictograma.x + pictograma.ancho &&
        posicionY >= pictograma.y &&
        posicionY <= pictograma.y + pictograma.alto,
    );

    if (indice >= 0) {
      setIndiceSeleccionado(indice);
    }
  };

  const exportarExcel = async () => {
    if (!diagramaGenerado) {
      return;
    }

    setExportandoExcel(true);

    try {
      await exportarExcelPictogramas(
        {
          datos: datosGenerados,
          tituloTabla: nombresModulo.tituloTabla.trim() || "Tabla No. 5",
          nombreVariableCualitativa: nombreVariableCualitativaActual,
          nombreVariableCuantitativa: nombreVariableCuantitativaActual,
          imagenGeneral,
        },
        normalizarNombreArchivo(
          nombresModulo.tituloGrafico.trim() || "pictogramas",
        ),
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
            Pictogramas
          </h1>
          <p className="max-w-5xl text-lg leading-8 text-texto-secundario sm:text-xl">
            Carga una imagen base desde tu dispositivo, ingresa una variable
            cualitativa con su valor cuantitativo y genera el pictograma. Luego
            podras cambiar la imagen de un dato individual al seleccionarlo.
          </p>
        </div>
      </section>

      <BloqueModulo titulo="1. Ingreso de datos">
        <div className="flex flex-col gap-5" onPaste={manejarPegadoDirecto}>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[1.6rem] border border-verde-claro bg-white/90 p-5">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[1.45rem] font-semibold text-acento-oscuro">
                    Imagen base del pictograma
                  </h3>
                  <p className="text-[1rem] leading-7 text-texto-secundario">
                    Esta imagen se usa en todos los datos al generar el
                    pictograma. Despues podras cambiarla por dato individual
                    seleccionando una figura en el grafico.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex min-h-14 cursor-pointer items-center rounded-[1.15rem] border border-verde-claro bg-white px-5 text-[1.05rem] font-semibold text-acento-principal transition hover:border-acento-principal hover:bg-verde-suave">
                    {cargandoImagenGeneral
                      ? "Cargando imagen..."
                      : imagenGeneral
                        ? "Cambiar imagen base"
                        : "Cargar imagen base"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={cargarImagenGeneralDesdeDispositivo}
                      className="sr-only"
                    />
                  </label>

                  <span className="text-sm leading-6 text-texto-secundario">
                    {nombreImagenGeneral || "Sin imagen seleccionada"}
                  </span>
                </div>
              </div>
            </div>

            <TarjetaImagenPrevia
              titulo="Vista previa"
              subtitulo="La imagen general queda lista para todos los datos."
              fuente={imagenGeneral}
            />
          </div>

          <div className="overflow-hidden rounded-[1.6rem] border border-verde-claro bg-white/90">
            <div className="max-h-[900px] overflow-auto">
              <table className="min-w-[840px] w-full border-collapse">
                <thead className="sticky top-0 z-10 bg-[#dce8df] text-left text-[1rem] text-acento-oscuro">
                  <tr>
                    <th className="w-14 border-b border-verde-claro px-4 py-4 font-semibold">
                      #
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {nombreVariableCualitativaActual}
                    </th>
                    <th className="border-b border-l border-verde-claro px-4 py-4 font-semibold">
                      {nombreVariableCuantitativaActual}
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
                              placeholder="Variable cualitativa"
                              className={`min-h-14 rounded-[1.15rem] border px-4 text-[1.05rem] text-texto-principal outline-none transition focus:ring-4 ${
                                errores?.categoria
                                  ? "border-alerta/50 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                                  : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                              }`}
                            />
                            {errores?.categoria ? (
                              <p className="text-sm text-alerta">{errores.categoria}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="border-b border-l border-verde-claro px-3 py-3 align-top">
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={fila.valor}
                              onChange={(evento) =>
                                actualizarFila(
                                  fila.id,
                                  "valor",
                                  evento.target.value,
                                )
                              }
                              placeholder="Valor cuantitativo"
                              className={`min-h-14 rounded-[1.15rem] border px-4 text-[1.05rem] text-texto-principal outline-none transition focus:ring-4 ${
                                errores?.valor
                                  ? "border-alerta/50 bg-alerta/5 focus:border-alerta focus:ring-alerta/10"
                                  : "border-verde-claro bg-white focus:border-acento-principal focus:ring-acento-principal/10"
                              }`}
                            />
                            {errores?.valor ? (
                              <p className="text-sm text-alerta">{errores.valor}</p>
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
              className="min-h-14 rounded-[1.15rem] bg-acento-principal px-6 text-[1.05rem] font-semibold text-white shadow-[0_12px_28px_rgba(0,98,65,0.22)] transition hover:bg-acento-oscuro"
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
            Maximo 20 filas. Minimo 1 fila completa y una imagen base para
            generar.
          </p>

          {mensajeEstado ? (
            <div
              className={`rounded-[1.3rem] border px-4 py-3 text-sm leading-7 ${obtenerClasesMensaje(mensajeEstado.tipo)}`}
            >
              {mensajeEstado.texto}
            </div>
          ) : null}
        </div>
      </BloqueModulo>

      <BloqueModulo
        titulo="2. Tabla de pictogramas"
        descripcion={
          diagramaGenerado
            ? undefined
            : "Genera el pictograma para obtener la tabla estadistica con la variable cualitativa, fi y pi."
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
              <table className="min-w-[860px] w-full border-collapse text-center">
                <thead className="bg-[#586f2a] text-white">
                  <tr>
                    <th className="border-b border-white/20 px-4 py-4 text-left text-xl font-semibold">
                      {nombreVariableCualitativaActual}
                    </th>
                    <th className="border-b border-l border-white/20 px-4 py-4 text-xl font-semibold">
                      {nombreVariableCuantitativaActual}
                    </th>
                    <th className="border-b border-l border-white/20 px-4 py-4 text-xl font-semibold">
                      pi
                    </th>
                    <th className="border-b border-l border-white/20 px-4 py-4 text-xl font-semibold">
                      Imagen
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {resumenTabla.map((fila, indice) => (
                    <tr
                      key={`${fila.categoria}-${indice}`}
                      className={indice % 2 === 0 ? "bg-[#d6e6ad]" : "bg-[#c8dc9c]"}
                    >
                      <td className="border-b border-l border-black/10 px-4 py-4 text-left text-[1.35rem] text-texto-principal">
                        {fila.categoria}
                      </td>
                      <td className="border-b border-l border-black/10 px-4 py-4 text-[1.35rem] font-semibold text-texto-principal">
                        {formatearNumeroVisible(fila.valor)}
                      </td>
                      <td className="border-b border-l border-black/10 px-4 py-4 text-[1.35rem] font-semibold text-texto-principal">
                        {formatearPorcentaje(fila.porcentaje)}
                      </td>
                      <td className="border-b border-l border-black/10 px-4 py-4">
                        <div className="flex items-center justify-center gap-3">
                          {fila.fuenteImagen ? (
                            <NextImage
                              src={fila.fuenteImagen}
                              alt={fila.categoria}
                              width={64}
                              height={64}
                              unoptimized
                              className="h-16 w-16 rounded-xl border border-verde-claro object-contain bg-white p-1"
                            />
                          ) : null}
                          <span className="text-sm font-medium text-texto-secundario">
                            {fila.usaImagenIndividual ? "Personalizada" : "General"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-[#e7f1cf]">
                    <td className="border-b border-l border-black/10 px-4 py-4 text-left text-[1.45rem] font-semibold text-texto-principal">
                      TOTAL
                    </td>
                    <td className="border-b border-l border-black/10 px-4 py-4 text-[1.45rem] font-semibold text-texto-principal">
                      {formatearNumeroVisible(total)}
                    </td>
                    <td className="border-b border-l border-black/10 px-4 py-4 text-[1.45rem] font-semibold text-texto-principal">
                      {formatearPorcentaje(total > 0 ? 100 : 0)}
                    </td>
                    <td className="border-b border-l border-black/10 px-4 py-4 text-sm font-semibold text-texto-secundario">
                      Imagen base
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </BloqueModulo>

      <BloqueModulo
        titulo="3. Pictograma"
        descripcion={
          diagramaGenerado
            ? undefined
            : "Genera el pictograma para habilitar la seleccion de figuras, el cambio de imagen individual y la configuracion del eje."
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
                onClick={manejarClickPictograma}
                className="mx-auto h-auto min-w-[980px] cursor-pointer"
                style={{ width: `${dimensionesCanvas.ancho}px`, maxWidth: "none" }}
              />
            </div>

            <p className="text-[1.05rem] text-texto-secundario">
              Pictograma seleccionado:{" "}
              {pictogramaSeleccionado ? pictogramaSeleccionado.categoria : "ninguno"}
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
                Ajusta nombres, cambia la imagen general, modifica la imagen del
                pictograma seleccionado y configura manualmente el eje Y desde
                esta misma pantalla.
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
                  etiqueta="Nombre variable cualitativa"
                  valor={nombresModulo.nombreVariableCualitativa}
                  onChange={(valor) =>
                    actualizarNombreModulo("nombreVariableCualitativa", valor)
                  }
                />
                <CampoFormulario
                  etiqueta="Nombre variable cuantitativa"
                  valor={nombresModulo.nombreVariableCuantitativa}
                  onChange={(valor) =>
                    actualizarNombreModulo("nombreVariableCuantitativa", valor)
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
                Imagenes del pictograma
              </h3>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <TarjetaImagenPrevia
                  titulo="Imagen general"
                  subtitulo="Se usa automaticamente en todos los datos que no tengan una imagen individual."
                  fuente={imagenGeneral}
                />
                <TarjetaImagenPrevia
                  titulo="Pictograma seleccionado"
                  subtitulo={
                    pictogramaSeleccionado
                      ? `${pictogramaSeleccionado.categoria} | Valor: ${formatearNumeroVisible(pictogramaSeleccionado.valor)}`
                      : "Selecciona un pictograma dentro del grafico."
                  }
                  fuente={imagenPictogramaSeleccionado}
                  seleccionada={Boolean(pictogramaSeleccionado)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <label className="inline-flex min-h-14 cursor-pointer items-center rounded-[1.15rem] border border-verde-claro bg-white px-5 text-[1.05rem] font-semibold text-acento-principal transition hover:border-acento-principal hover:bg-verde-suave">
                  {cargandoImagenGeneral
                    ? "Cargando imagen..."
                    : "Cambiar imagen general"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={cargarImagenGeneralDesdeDispositivo}
                    className="sr-only"
                  />
                </label>

                <label
                  className={`inline-flex min-h-14 items-center rounded-[1.15rem] border px-5 text-[1.05rem] font-semibold transition ${
                    pictogramaSeleccionado
                      ? "cursor-pointer border-verde-claro bg-white text-acento-principal hover:border-acento-principal hover:bg-verde-suave"
                      : "cursor-not-allowed border-verde-claro bg-[#eff3ef] text-texto-secundario"
                  }`}
                >
                  {cargandoImagenIndividual
                    ? "Cargando imagen..."
                    : "Cambiar imagen individual"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={cargarImagenIndividualSeleccionada}
                    disabled={!pictogramaSeleccionado}
                    className="sr-only"
                  />
                </label>

                <button
                  type="button"
                  onClick={usarImagenGeneralEnSeleccion}
                  disabled={!pictogramaSeleccionado?.imagenIndividual}
                  className={`min-h-14 rounded-[1.15rem] px-5 text-[1.05rem] font-semibold transition ${
                    pictogramaSeleccionado?.imagenIndividual
                      ? "border border-verde-claro bg-white text-acento-principal hover:border-acento-principal hover:bg-verde-suave"
                      : "cursor-not-allowed border border-verde-claro bg-[#eff3ef] text-texto-secundario"
                  }`}
                >
                  Usar imagen general
                </button>
              </div>

              {pictogramaSeleccionado ? (
                <p className="text-[1.05rem] text-texto-secundario">
                  Origen actual de la imagen seleccionada:{" "}
                  {pictogramaSeleccionado.imagenIndividual
                    ? "Personalizada"
                    : "Imagen general"}
                </p>
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
