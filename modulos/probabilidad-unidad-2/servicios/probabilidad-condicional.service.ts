import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import type {
  ModoValorProbabilidad,
  ResultadoCalculadoProbabilidad,
} from "@/modulos/probabilidad-unidad-2/tipos";
import {
  resolverRegionesDosEventos,
  resolverRegionesTresEventos,
} from "@/modulos/probabilidad-unidad-2/servicios/eventos-compuestos.service";
import {
  formatearDecimalProbabilidad,
  formatearPorcentajeProbabilidad,
  formatearValorMixto,
} from "@/modulos/probabilidad-unidad-2/utilidades/formatear-probabilidad.util";

function construirInterpretacionCondicional(
  descripcionObjetivo: string,
  descripcionCondicion: string,
  contexto: string,
  probabilidad: number,
  precision: PrecisionResultado,
) {
  return `La probabilidad de ${descripcionObjetivo} dado ${descripcionCondicion} en ${contexto} es ${formatearDecimalProbabilidad(
    probabilidad,
    precision,
  )}, equivalente a ${formatearPorcentajeProbabilidad(
    probabilidad,
    precision,
  )}.`;
}

interface EntradaCondicionalEventos {
  modo: ModoValorProbabilidad;
  precision: PrecisionResultado;
  contexto: string;
  universo: number;
  nombres: string[];
  individuales: number[];
  interseccionesDobles: {
    ab: number;
    ac?: number;
    bc?: number;
  };
  interseccionTriple?: number;
  objetivo: "A" | "B" | "C";
  condicionante: "A" | "B" | "C";
}

function obtenerValorEvento(
  clave: "A" | "B" | "C",
  individuales: number[],
) {
  return individuales[clave === "A" ? 0 : clave === "B" ? 1 : 2];
}

function obtenerNombreEvento(
  clave: "A" | "B" | "C",
  nombres: string[],
) {
  return nombres[clave === "A" ? 0 : clave === "B" ? 1 : 2];
}

function obtenerInterseccionCondicional(
  objetivo: "A" | "B" | "C",
  condicionante: "A" | "B" | "C",
  interseccionesDobles: EntradaCondicionalEventos["interseccionesDobles"],
) {
  if (
    (objetivo === "A" && condicionante === "B") ||
    (objetivo === "B" && condicionante === "A")
  ) {
    return interseccionesDobles.ab;
  }

  if (
    (objetivo === "A" && condicionante === "C") ||
    (objetivo === "C" && condicionante === "A")
  ) {
    return interseccionesDobles.ac ?? 0;
  }

  if (
    (objetivo === "B" && condicionante === "C") ||
    (objetivo === "C" && condicionante === "B")
  ) {
    return interseccionesDobles.bc ?? 0;
  }

  return 0;
}

export function calcularProbabilidadCondicionalDesdeEventos(
  entrada: EntradaCondicionalEventos,
): ResultadoCalculadoProbabilidad {
  if (entrada.objetivo === entrada.condicionante) {
    throw new Error("El evento objetivo debe ser distinto del evento condicionante.");
  }

  const valorCondicionante = obtenerValorEvento(
    entrada.condicionante,
    entrada.individuales,
  );
  if (valorCondicionante <= 0) {
    throw new Error(
      "No se puede calcular la probabilidad condicional porque el evento condicionante vale 0.",
    );
  }

  const valorInterseccion = obtenerInterseccionCondicional(
    entrada.objetivo,
    entrada.condicionante,
    entrada.interseccionesDobles,
  );

  if (entrada.nombres.length === 2) {
    resolverRegionesDosEventos(
      entrada.universo,
      entrada.individuales[0],
      entrada.individuales[1],
      entrada.interseccionesDobles.ab,
    );
  } else {
    resolverRegionesTresEventos(
      entrada.universo,
      entrada.individuales[0],
      entrada.individuales[1],
      entrada.individuales[2],
      entrada.interseccionesDobles.ab,
      entrada.interseccionesDobles.ac ?? 0,
      entrada.interseccionesDobles.bc ?? 0,
      entrada.interseccionTriple ?? 0,
    );
  }

  const probabilidad = valorInterseccion / valorCondicionante;

  const nombreObjetivo = obtenerNombreEvento(entrada.objetivo, entrada.nombres);
  const nombreCondicionante = obtenerNombreEvento(
    entrada.condicionante,
    entrada.nombres,
  );

  const idsResaltadosDosEventos =
    entrada.objetivo === "A" && entrada.condicionante === "B"
      ? ["solo-b", "interseccion"]
      : entrada.objetivo === "B" && entrada.condicionante === "A"
        ? ["solo-a", "interseccion"]
        : [];

  const idsResaltadosTresEventos =
    entrada.objetivo === "A" && entrada.condicionante === "B"
      ? ["solo-b", "solo-ab", "solo-bc", "triple"]
      : entrada.objetivo === "B" && entrada.condicionante === "A"
        ? ["solo-a", "solo-ab", "solo-ac", "triple"]
        : entrada.objetivo === "A" && entrada.condicionante === "C"
          ? ["solo-c", "solo-ac", "solo-bc", "triple"]
          : entrada.objetivo === "C" && entrada.condicionante === "A"
            ? ["solo-a", "solo-ab", "solo-ac", "triple"]
            : entrada.objetivo === "B" && entrada.condicionante === "C"
              ? ["solo-c", "solo-ac", "solo-bc", "triple"]
              : ["solo-b", "solo-ab", "solo-bc", "triple"];

  const visual =
    entrada.nombres.length === 2
      ? (() => {
          const regiones = resolverRegionesDosEventos(
            entrada.universo,
            entrada.individuales[0],
            entrada.individuales[1],
            entrada.interseccionesDobles.ab,
          );
          return {
            tipo: "venn-2" as const,
            titulo: "Condicionamiento sobre 2 eventos",
            nombreA: entrada.nombres[0],
            nombreB: entrada.nombres[1],
            universoEtiqueta: "U",
            regiones: {
              soloA: {
                id: "solo-a",
                etiqueta: `Solo ${entrada.nombres[0]}`,
                valor: formatearValorMixto(
                  regiones.soloA,
                  regiones.soloA / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: idsResaltadosDosEventos.includes("solo-a"),
              },
              interseccion: {
                id: "interseccion",
                etiqueta: `${entrada.nombres[0]}∩${entrada.nombres[1]}`,
                valor: formatearValorMixto(
                  regiones.interseccion,
                  regiones.interseccion / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: true,
              },
              soloB: {
                id: "solo-b",
                etiqueta: `Solo ${entrada.nombres[1]}`,
                valor: formatearValorMixto(
                  regiones.soloB,
                  regiones.soloB / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: idsResaltadosDosEventos.includes("solo-b"),
              },
              ninguno: {
                id: "ninguno",
                etiqueta: "Ninguno",
                valor: formatearValorMixto(
                  regiones.ninguno,
                  regiones.ninguno / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
              },
            },
          };
        })()
      : (() => {
          const regiones = resolverRegionesTresEventos(
            entrada.universo,
            entrada.individuales[0],
            entrada.individuales[1],
            entrada.individuales[2],
            entrada.interseccionesDobles.ab,
            entrada.interseccionesDobles.ac ?? 0,
            entrada.interseccionesDobles.bc ?? 0,
            entrada.interseccionTriple ?? 0,
          );
          return {
            tipo: "venn-3" as const,
            titulo: "Condicionamiento sobre 3 eventos",
            nombres: [entrada.nombres[0], entrada.nombres[1], entrada.nombres[2]] as [
              string,
              string,
              string,
            ],
            universoEtiqueta: "U",
            regiones: {
              soloA: {
                id: "solo-a",
                etiqueta: `Solo ${entrada.nombres[0]}`,
                valor: formatearValorMixto(
                  regiones.soloA,
                  regiones.soloA / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: idsResaltadosTresEventos.includes("solo-a"),
              },
              soloB: {
                id: "solo-b",
                etiqueta: `Solo ${entrada.nombres[1]}`,
                valor: formatearValorMixto(
                  regiones.soloB,
                  regiones.soloB / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: idsResaltadosTresEventos.includes("solo-b"),
              },
              soloC: {
                id: "solo-c",
                etiqueta: `Solo ${entrada.nombres[2]}`,
                valor: formatearValorMixto(
                  regiones.soloC,
                  regiones.soloC / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: idsResaltadosTresEventos.includes("solo-c"),
              },
              soloAB: {
                id: "solo-ab",
                etiqueta: `${entrada.nombres[0]}∩${entrada.nombres[1]} sin ${entrada.nombres[2]}`,
                valor: formatearValorMixto(
                  regiones.soloAB,
                  regiones.soloAB / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: idsResaltadosTresEventos.includes("solo-ab"),
              },
              soloAC: {
                id: "solo-ac",
                etiqueta: `${entrada.nombres[0]}∩${entrada.nombres[2]} sin ${entrada.nombres[1]}`,
                valor: formatearValorMixto(
                  regiones.soloAC,
                  regiones.soloAC / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: idsResaltadosTresEventos.includes("solo-ac"),
              },
              soloBC: {
                id: "solo-bc",
                etiqueta: `${entrada.nombres[1]}∩${entrada.nombres[2]} sin ${entrada.nombres[0]}`,
                valor: formatearValorMixto(
                  regiones.soloBC,
                  regiones.soloBC / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: idsResaltadosTresEventos.includes("solo-bc"),
              },
              triple: {
                id: "triple",
                etiqueta: `${entrada.nombres[0]}∩${entrada.nombres[1]}∩${entrada.nombres[2]}`,
                valor: formatearValorMixto(
                  regiones.triple,
                  regiones.triple / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
                resaltada: true,
              },
              ninguno: {
                id: "ninguno",
                etiqueta: "Ninguno",
                valor: formatearValorMixto(
                  regiones.ninguno,
                  regiones.ninguno / entrada.universo,
                  entrada.modo,
                  entrada.precision,
                ),
              },
            },
          };
        })();

  return {
    panel: {
      tarjetas: [
        {
          titulo: "Condicional solicitada",
          valor: `P(${nombreObjetivo} | ${nombreCondicionante})`,
          detalle: `Interseccion usada: ${valorInterseccion} | condicionante: ${valorCondicionante}`,
        },
        {
          titulo: "Resultado decimal",
          valor: formatearDecimalProbabilidad(probabilidad, entrada.precision),
        },
        {
          titulo: "Resultado porcentual",
          valor: formatearPorcentajeProbabilidad(probabilidad, entrada.precision),
        },
      ],
      pasos: [
        {
          titulo: "Identificar el nuevo universo de analisis",
          expresion: `Evento condicionante = ${nombreCondicionante}; valor = ${valorCondicionante}`,
        },
        {
          titulo: "Identificar la interseccion con el evento objetivo",
          expresion: `${nombreObjetivo}∩${nombreCondicionante} = ${valorInterseccion}`,
        },
        {
          titulo: "Aplicar la formula condicional",
          expresion: `P(${nombreObjetivo}|${nombreCondicionante}) = ${valorInterseccion} / ${valorCondicionante}`,
          resultado: `${formatearDecimalProbabilidad(probabilidad, entrada.precision)} = ${formatearPorcentajeProbabilidad(
            probabilidad,
            entrada.precision,
          )}`,
        },
      ],
      interpretacion: construirInterpretacionCondicional(
        nombreObjetivo,
        nombreCondicionante,
        entrada.contexto,
        probabilidad,
        entrada.precision,
      ),
      observacion:
        "En una probabilidad condicional, el evento condicionante se convierte en el nuevo universo de analisis.",
    },
    visual,
  };
}

interface EntradaCondicionalContingencia {
  precision: PrecisionResultado;
  contexto: string;
  nombreFilas: string;
  nombreColumnas: string;
  filas: [string, string];
  columnas: [string, string];
  valores: [[number, number], [number, number]];
  tipoObjetivo: "fila" | "columna";
  indiceObjetivo: 0 | 1;
  tipoCondicionante: "fila" | "columna";
  indiceCondicionante: 0 | 1;
}

export function calcularProbabilidadCondicionalDesdeContingencia(
  entrada: EntradaCondicionalContingencia,
): ResultadoCalculadoProbabilidad {
  if (entrada.tipoObjetivo === entrada.tipoCondicionante) {
    throw new Error(
      "En la tabla 2x2 el objetivo y el condicionante deben pertenecer a variables distintas.",
    );
  }

  const fila1 = entrada.valores[0][0] + entrada.valores[0][1];
  const fila2 = entrada.valores[1][0] + entrada.valores[1][1];
  const col1 = entrada.valores[0][0] + entrada.valores[1][0];
  const col2 = entrada.valores[0][1] + entrada.valores[1][1];
  const total = fila1 + fila2;

  const filaObjetivo =
    entrada.tipoObjetivo === "fila"
      ? entrada.indiceObjetivo
      : entrada.indiceCondicionante;
  const columnaObjetivo =
    entrada.tipoObjetivo === "columna"
      ? entrada.indiceObjetivo
      : entrada.indiceCondicionante;

  const numerador = entrada.valores[filaObjetivo][columnaObjetivo];
  const denominador =
    entrada.tipoCondicionante === "fila"
      ? entrada.indiceCondicionante === 0
        ? fila1
        : fila2
      : entrada.indiceCondicionante === 0
        ? col1
        : col2;

  if (denominador <= 0) {
    throw new Error(
      "No se puede calcular la probabilidad condicional porque el total condicionante vale 0.",
    );
  }

  const probabilidad = numerador / denominador;
  const nombreObjetivo =
    entrada.tipoObjetivo === "fila"
      ? entrada.filas[entrada.indiceObjetivo]
      : entrada.columnas[entrada.indiceObjetivo];
  const nombreCondicionante =
    entrada.tipoCondicionante === "fila"
      ? entrada.filas[entrada.indiceCondicionante]
      : entrada.columnas[entrada.indiceCondicionante];

  const celdaId =
    filaObjetivo === 0
      ? columnaObjetivo === 0
        ? "f1c1"
        : "f1c2"
      : columnaObjetivo === 0
        ? "f2c1"
        : "f2c2";

  return {
    panel: {
      tarjetas: [
        {
          titulo: "Condicional solicitada",
          valor: `P(${nombreObjetivo} | ${nombreCondicionante})`,
          detalle: `Celda favorable: ${numerador} | total condicionante: ${denominador}`,
        },
        {
          titulo: "Resultado decimal",
          valor: formatearDecimalProbabilidad(probabilidad, entrada.precision),
        },
        {
          titulo: "Resultado porcentual",
          valor: formatearPorcentajeProbabilidad(probabilidad, entrada.precision),
        },
      ],
      pasos: [
        {
          titulo: "Calcular los totales de la tabla",
          expresion: `Fila 1 = ${fila1}; Fila 2 = ${fila2}; Columna 1 = ${col1}; Columna 2 = ${col2}; Total = ${total}`,
        },
        {
          titulo: "Ubicar la celda favorable y el total condicionante",
          expresion: `Numerador = ${numerador}; Denominador = ${denominador}`,
        },
        {
          titulo: "Aplicar la probabilidad condicional",
          expresion: `P(${nombreObjetivo}|${nombreCondicionante}) = ${numerador}/${denominador}`,
          resultado: `${formatearDecimalProbabilidad(probabilidad, entrada.precision)} = ${formatearPorcentajeProbabilidad(
            probabilidad,
            entrada.precision,
          )}`,
        },
      ],
      interpretacion: construirInterpretacionCondicional(
        nombreObjetivo,
        nombreCondicionante,
        entrada.contexto,
        probabilidad,
        entrada.precision,
      ),
      observacion:
        "La celda elegida actua como interseccion entre ambas variables y el total condicionante se toma desde la fila o columna seleccionada.",
    },
    visual: {
      tipo: "contingencia",
      titulo: "Tabla de contingencia 2 x 2",
      nombreFilas: entrada.nombreFilas,
      nombreColumnas: entrada.nombreColumnas,
      filas: entrada.filas,
      columnas: entrada.columnas,
      celdas: [
        [
          String(entrada.valores[0][0]),
          String(entrada.valores[0][1]),
        ],
        [
          String(entrada.valores[1][0]),
          String(entrada.valores[1][1]),
        ],
      ],
      totalesFila: [String(fila1), String(fila2)],
      totalesColumna: [String(col1), String(col2)],
      totalGeneral: String(total),
      resaltadas: [
        celdaId,
        entrada.tipoCondicionante === "fila"
          ? entrada.indiceCondicionante === 0
            ? "fila1"
            : "fila2"
          : entrada.indiceCondicionante === 0
            ? "col1"
            : "col2",
      ],
    },
  };
}
