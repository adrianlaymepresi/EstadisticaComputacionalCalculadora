import type { PrecisionResultado } from "@/modulos/formulas-segundo-parcial/tipos";
import type {
  ConsultaCuatroEventos,
  ConsultaDosEventos,
  ConsultaTresEventos,
  ModoValorProbabilidad,
  ResultadoCalculadoProbabilidad,
} from "@/modulos/probabilidad-unidad-2/tipos";
import {
  formatearDecimalProbabilidad,
  formatearPorcentajeProbabilidad,
  formatearValorMixto,
} from "@/modulos/probabilidad-unidad-2/utilidades/formatear-probabilidad.util";
import {
  limpiarNegativoCercano,
  validarNoNegativo,
} from "@/modulos/probabilidad-unidad-2/utilidades/normalizar-probabilidad.util";

const TOLERANCIA = 1e-10;

function formatearValor(
  valorBruto: number,
  universo: number,
  modo: ModoValorProbabilidad,
  precision: PrecisionResultado,
) {
  const probabilidad = modo === "cantidades" ? valorBruto / universo : valorBruto;
  return formatearValorMixto(valorBruto, probabilidad, modo, precision);
}

function convertirResultadoAProbabilidad(
  valorBruto: number,
  universo: number,
  modo: ModoValorProbabilidad,
) {
  return modo === "cantidades" ? valorBruto / universo : valorBruto;
}

function validarValorNoMayor(
  valor: number,
  maximo: number,
  etiqueta: string,
) {
  if (valor > maximo + TOLERANCIA) {
    throw new Error(`${etiqueta} no puede ser mayor que ${maximo}.`);
  }
}

function validarUnionNoMayorQueUniverso(union: number, universo: number) {
  if (union > universo + TOLERANCIA) {
    throw new Error(
      "Los datos ingresados no son consistentes porque la union supera al universo.",
    );
  }
}

function construirInterpretacionCompuesta(
  descripcionConsulta: string,
  contexto: string,
  probabilidad: number,
  precision: PrecisionResultado,
) {
  return `La probabilidad de ${descripcionConsulta} en ${contexto} es ${formatearDecimalProbabilidad(
    probabilidad,
    precision,
  )}, equivalente a ${formatearPorcentajeProbabilidad(
    probabilidad,
    precision,
  )}.`;
}

export interface RegionesDosEventos {
  soloA: number;
  interseccion: number;
  soloB: number;
  union: number;
  ninguno: number;
}

export function resolverRegionesDosEventos(
  universo: number,
  valorA: number,
  valorB: number,
  valorAB: number,
) {
  validarValorNoMayor(valorAB, valorA, "La interseccion A∩B");
  validarValorNoMayor(valorAB, valorB, "La interseccion A∩B");

  const soloA = validarNoNegativo(valorA - valorAB, "Solo A");
  const soloB = validarNoNegativo(valorB - valorAB, "Solo B");
  const interseccion = validarNoNegativo(valorAB, "A∩B");
  const union = validarNoNegativo(valorA + valorB - valorAB, "A∪B");
  validarUnionNoMayorQueUniverso(union, universo);
  const ninguno = validarNoNegativo(universo - union, "Ninguno");

  return {
    soloA,
    interseccion,
    soloB,
    union,
    ninguno,
  } satisfies RegionesDosEventos;
}

export interface RegionesTresEventos {
  soloA: number;
  soloB: number;
  soloC: number;
  soloAB: number;
  soloAC: number;
  soloBC: number;
  triple: number;
  union: number;
  ninguno: number;
}

export function resolverRegionesTresEventos(
  universo: number,
  valorA: number,
  valorB: number,
  valorC: number,
  valorAB: number,
  valorAC: number,
  valorBC: number,
  valorABC: number,
) {
  validarValorNoMayor(valorABC, valorAB, "La triple interseccion A∩B∩C");
  validarValorNoMayor(valorABC, valorAC, "La triple interseccion A∩B∩C");
  validarValorNoMayor(valorABC, valorBC, "La triple interseccion A∩B∩C");
  validarValorNoMayor(valorAB, valorA, "La interseccion A∩B");
  validarValorNoMayor(valorAB, valorB, "La interseccion A∩B");
  validarValorNoMayor(valorAC, valorA, "La interseccion A∩C");
  validarValorNoMayor(valorAC, valorC, "La interseccion A∩C");
  validarValorNoMayor(valorBC, valorB, "La interseccion B∩C");
  validarValorNoMayor(valorBC, valorC, "La interseccion B∩C");

  const triple = validarNoNegativo(valorABC, "A∩B∩C");
  const soloAB = validarNoNegativo(valorAB - triple, "A∩B sin C");
  const soloAC = validarNoNegativo(valorAC - triple, "A∩C sin B");
  const soloBC = validarNoNegativo(valorBC - triple, "B∩C sin A");
  const soloA = validarNoNegativo(
    valorA - valorAB - valorAC + valorABC,
    "Solo A",
  );
  const soloB = validarNoNegativo(
    valorB - valorAB - valorBC + valorABC,
    "Solo B",
  );
  const soloC = validarNoNegativo(
    valorC - valorAC - valorBC + valorABC,
    "Solo C",
  );
  const union = validarNoNegativo(
    valorA + valorB + valorC - valorAB - valorAC - valorBC + valorABC,
    "A∪B∪C",
  );
  validarUnionNoMayorQueUniverso(union, universo);
  const ninguno = validarNoNegativo(universo - union, "Ninguno");

  return {
    soloA,
    soloB,
    soloC,
    soloAB,
    soloAC,
    soloBC,
    triple,
    union,
    ninguno,
  } satisfies RegionesTresEventos;
}

export interface RegionesCuatroEventos {
  soloA: number;
  soloB: number;
  soloC: number;
  soloD: number;
  soloAB: number;
  soloAC: number;
  soloAD: number;
  soloBC: number;
  soloBD: number;
  soloCD: number;
  soloABC: number;
  soloABD: number;
  soloACD: number;
  soloBCD: number;
  quadruple: number;
  union: number;
  ninguno: number;
}

export function resolverRegionesCuatroEventos(
  universo: number,
  valorA: number,
  valorB: number,
  valorC: number,
  valorD: number,
  valorAB: number,
  valorAC: number,
  valorAD: number,
  valorBC: number,
  valorBD: number,
  valorCD: number,
  valorABC: number,
  valorABD: number,
  valorACD: number,
  valorBCD: number,
  valorABCD: number,
) {
  const interseccionesDobles = [
    ["A∩B", valorAB, valorA, valorB],
    ["A∩C", valorAC, valorA, valorC],
    ["A∩D", valorAD, valorA, valorD],
    ["B∩C", valorBC, valorB, valorC],
    ["B∩D", valorBD, valorB, valorD],
    ["C∩D", valorCD, valorC, valorD],
  ] as const;

  for (const [etiqueta, valor, evento1, evento2] of interseccionesDobles) {
    validarValorNoMayor(valor, evento1, `La interseccion ${etiqueta}`);
    validarValorNoMayor(valor, evento2, `La interseccion ${etiqueta}`);
  }

  const interseccionesTriples = [
    ["A∩B∩C", valorABC, valorAB, valorAC, valorBC],
    ["A∩B∩D", valorABD, valorAB, valorAD, valorBD],
    ["A∩C∩D", valorACD, valorAC, valorAD, valorCD],
    ["B∩C∩D", valorBCD, valorBC, valorBD, valorCD],
  ] as const;

  for (const [etiqueta, valor, doble1, doble2, doble3] of interseccionesTriples) {
    validarValorNoMayor(valor, doble1, `La interseccion ${etiqueta}`);
    validarValorNoMayor(valor, doble2, `La interseccion ${etiqueta}`);
    validarValorNoMayor(valor, doble3, `La interseccion ${etiqueta}`);
  }

  validarValorNoMayor(valorABCD, valorABC, "La interseccion A∩B∩C∩D");
  validarValorNoMayor(valorABCD, valorABD, "La interseccion A∩B∩C∩D");
  validarValorNoMayor(valorABCD, valorACD, "La interseccion A∩B∩C∩D");
  validarValorNoMayor(valorABCD, valorBCD, "La interseccion A∩B∩C∩D");

  const quadruple = validarNoNegativo(valorABCD, "A∩B∩C∩D");
  const soloABC = validarNoNegativo(valorABC - quadruple, "A∩B∩C solo");
  const soloABD = validarNoNegativo(valorABD - quadruple, "A∩B∩D solo");
  const soloACD = validarNoNegativo(valorACD - quadruple, "A∩C∩D solo");
  const soloBCD = validarNoNegativo(valorBCD - quadruple, "B∩C∩D solo");
  const soloAB = validarNoNegativo(
    valorAB - valorABC - valorABD + valorABCD,
    "A∩B solo",
  );
  const soloAC = validarNoNegativo(
    valorAC - valorABC - valorACD + valorABCD,
    "A∩C solo",
  );
  const soloAD = validarNoNegativo(
    valorAD - valorABD - valorACD + valorABCD,
    "A∩D solo",
  );
  const soloBC = validarNoNegativo(
    valorBC - valorABC - valorBCD + valorABCD,
    "B∩C solo",
  );
  const soloBD = validarNoNegativo(
    valorBD - valorABD - valorBCD + valorABCD,
    "B∩D solo",
  );
  const soloCD = validarNoNegativo(
    valorCD - valorACD - valorBCD + valorABCD,
    "C∩D solo",
  );
  const soloA = validarNoNegativo(
    valorA -
      valorAB -
      valorAC -
      valorAD +
      valorABC +
      valorABD +
      valorACD -
      valorABCD,
    "Solo A",
  );
  const soloB = validarNoNegativo(
    valorB -
      valorAB -
      valorBC -
      valorBD +
      valorABC +
      valorABD +
      valorBCD -
      valorABCD,
    "Solo B",
  );
  const soloC = validarNoNegativo(
    valorC -
      valorAC -
      valorBC -
      valorCD +
      valorABC +
      valorACD +
      valorBCD -
      valorABCD,
    "Solo C",
  );
  const soloD = validarNoNegativo(
    valorD -
      valorAD -
      valorBD -
      valorCD +
      valorABD +
      valorACD +
      valorBCD -
      valorABCD,
    "Solo D",
  );
  const union = validarNoNegativo(
    valorA +
      valorB +
      valorC +
      valorD -
      valorAB -
      valorAC -
      valorAD -
      valorBC -
      valorBD -
      valorCD +
      valorABC +
      valorABD +
      valorACD +
      valorBCD -
      valorABCD,
    "A∪B∪C∪D",
  );
  validarUnionNoMayorQueUniverso(union, universo);
  const ninguno = validarNoNegativo(universo - union, "Ninguno");

  return {
    soloA,
    soloB,
    soloC,
    soloD,
    soloAB,
    soloAC,
    soloAD,
    soloBC,
    soloBD,
    soloCD,
    soloABC,
    soloABD,
    soloACD,
    soloBCD,
    quadruple,
    union,
    ninguno,
  } satisfies RegionesCuatroEventos;
}

interface EntradaDosEventos {
  universo: number;
  modo: ModoValorProbabilidad;
  precision: PrecisionResultado;
  nombres: [string, string];
  contexto: string;
  valorA: number;
  valorB: number;
  valorAB: number;
  consulta: ConsultaDosEventos;
}

interface EntradaTresEventos {
  universo: number;
  modo: ModoValorProbabilidad;
  precision: PrecisionResultado;
  nombres: [string, string, string];
  contexto: string;
  valorA: number;
  valorB: number;
  valorC: number;
  valorAB: number;
  valorAC: number;
  valorBC: number;
  valorABC: number;
  consulta: ConsultaTresEventos;
}

interface EntradaCuatroEventos {
  universo: number;
  modo: ModoValorProbabilidad;
  precision: PrecisionResultado;
  nombres: [string, string, string, string];
  contexto: string;
  valorA: number;
  valorB: number;
  valorC: number;
  valorD: number;
  valorAB: number;
  valorAC: number;
  valorAD: number;
  valorBC: number;
  valorBD: number;
  valorCD: number;
  valorABC: number;
  valorABD: number;
  valorACD: number;
  valorBCD: number;
  valorABCD: number;
  consulta: ConsultaCuatroEventos;
}

function construirTablaRegionesDos(
  entrada: EntradaDosEventos,
  regiones: RegionesDosEventos,
  idsResaltados: string[],
) {
  return [
    {
      titulo: "Regiones del diagrama de 2 eventos",
      columnas: ["Region", "Valor"],
      filas: [
        ["Solo " + entrada.nombres[0], formatearValor(regiones.soloA, entrada.universo, entrada.modo, entrada.precision)],
        ["Interseccion", formatearValor(regiones.interseccion, entrada.universo, entrada.modo, entrada.precision)],
        ["Solo " + entrada.nombres[1], formatearValor(regiones.soloB, entrada.universo, entrada.modo, entrada.precision)],
        ["Ninguno", formatearValor(regiones.ninguno, entrada.universo, entrada.modo, entrada.precision)],
      ],
    },
  ];
}

function resolverConsultaDosEventos(
  entrada: EntradaDosEventos,
  regiones: RegionesDosEventos,
) {
  const [nombreA, nombreB] = entrada.nombres;
  switch (entrada.consulta) {
    case "evento-a":
      return {
        descripcion: nombreA,
        valorBruto: regiones.soloA + regiones.interseccion,
        idsResaltados: ["solo-a", "interseccion"],
        formula: `${nombreA} = Solo ${nombreA} + ${nombreA}∩${nombreB}`,
      };
    case "evento-b":
      return {
        descripcion: nombreB,
        valorBruto: regiones.soloB + regiones.interseccion,
        idsResaltados: ["solo-b", "interseccion"],
        formula: `${nombreB} = Solo ${nombreB} + ${nombreA}∩${nombreB}`,
      };
    case "interseccion":
      return {
        descripcion: `${nombreA} y ${nombreB}`,
        valorBruto: regiones.interseccion,
        idsResaltados: ["interseccion"],
        formula: `${nombreA}∩${nombreB}`,
      };
    case "union":
      return {
        descripcion: `${nombreA} o ${nombreB}`,
        valorBruto: regiones.union,
        idsResaltados: ["solo-a", "interseccion", "solo-b"],
        formula: `${nombreA}∪${nombreB} = ${nombreA} + ${nombreB} - ${nombreA}∩${nombreB}`,
      };
    case "solo-a":
      return {
        descripcion: `solo ${nombreA}`,
        valorBruto: regiones.soloA,
        idsResaltados: ["solo-a"],
        formula: `Solo ${nombreA} = ${nombreA} - ${nombreA}∩${nombreB}`,
      };
    case "solo-b":
      return {
        descripcion: `solo ${nombreB}`,
        valorBruto: regiones.soloB,
        idsResaltados: ["solo-b"],
        formula: `Solo ${nombreB} = ${nombreB} - ${nombreA}∩${nombreB}`,
      };
    case "complemento-a":
      return {
        descripcion: `no ${nombreA}`,
        valorBruto: regiones.soloB + regiones.ninguno,
        idsResaltados: ["solo-b", "ninguno"],
        formula: `${nombreA}' = U - ${nombreA}`,
      };
    case "complemento-b":
      return {
        descripcion: `no ${nombreB}`,
        valorBruto: regiones.soloA + regiones.ninguno,
        idsResaltados: ["solo-a", "ninguno"],
        formula: `${nombreB}' = U - ${nombreB}`,
      };
    case "ninguno":
      return {
        descripcion: `ninguno de ${nombreA} ni ${nombreB}`,
        valorBruto: regiones.ninguno,
        idsResaltados: ["ninguno"],
        formula: `( ${nombreA}∪${nombreB} )' = U - (${nombreA}∪${nombreB})`,
      };
    case "exactamente-uno":
      return {
        descripcion: `exactamente uno entre ${nombreA} y ${nombreB}`,
        valorBruto: regiones.soloA + regiones.soloB,
        idsResaltados: ["solo-a", "solo-b"],
        formula: `Solo ${nombreA} + Solo ${nombreB}`,
      };
  }
}

export function calcularEventosCompuestosDos(
  entrada: EntradaDosEventos,
): ResultadoCalculadoProbabilidad {
  const regiones = resolverRegionesDosEventos(
    entrada.universo,
    entrada.valorA,
    entrada.valorB,
    entrada.valorAB,
  );
  const consulta = resolverConsultaDosEventos(entrada, regiones);
  const probabilidad = convertirResultadoAProbabilidad(
    consulta.valorBruto,
    entrada.universo,
    entrada.modo,
  );

  return {
    panel: {
      tarjetas: [
        {
          titulo: "Consulta",
          valor: consulta.descripcion,
          detalle: consulta.formula,
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
          titulo: "Calcular las regiones basicas",
          expresion: `Solo ${entrada.nombres[0]} = ${entrada.valorA} - ${entrada.valorAB} = ${limpiarNegativoCercano(
            regiones.soloA,
          )}; Solo ${entrada.nombres[1]} = ${entrada.valorB} - ${entrada.valorAB} = ${limpiarNegativoCercano(
            regiones.soloB,
          )}`,
        },
        {
          titulo: "Calcular la union y la region exterior",
          expresion: `${entrada.nombres[0]}∪${entrada.nombres[1]} = ${entrada.valorA} + ${entrada.valorB} - ${entrada.valorAB} = ${regiones.union}`,
          resultado: `Ninguno = ${regiones.ninguno}`,
        },
        {
          titulo: "Resolver la consulta solicitada",
          expresion: `${consulta.formula} = ${consulta.valorBruto}`,
          resultado:
            entrada.modo === "cantidades"
              ? `${consulta.valorBruto}/${entrada.universo} = ${formatearDecimalProbabilidad(
                  probabilidad,
                  entrada.precision,
                )}`
              : `${formatearDecimalProbabilidad(probabilidad, entrada.precision)} = ${formatearPorcentajeProbabilidad(
                  probabilidad,
                  entrada.precision,
                )}`,
        },
      ],
      tablas: construirTablaRegionesDos(entrada, regiones, consulta.idsResaltados),
      interpretacion: construirInterpretacionCompuesta(
        consulta.descripcion,
        entrada.contexto,
        probabilidad,
        entrada.precision,
      ),
      observacion:
        entrada.modo === "cantidades"
          ? "Las cantidades se transforman internamente en probabilidad dividiendo entre el universo."
          : "Los valores ingresados ya representan probabilidades del universo completo.",
    },
    visual: {
      tipo: "venn-2",
      titulo: "Diagrama de Venn de 2 eventos",
      nombreA: entrada.nombres[0],
      nombreB: entrada.nombres[1],
      universoEtiqueta: "U",
      regiones: {
        soloA: {
          id: "solo-a",
          etiqueta: `Solo ${entrada.nombres[0]}`,
          valor: formatearValor(
            regiones.soloA,
            entrada.universo,
            entrada.modo,
            entrada.precision,
          ),
          resaltada: consulta.idsResaltados.includes("solo-a"),
        },
        interseccion: {
          id: "interseccion",
          etiqueta: `${entrada.nombres[0]}∩${entrada.nombres[1]}`,
          valor: formatearValor(
            regiones.interseccion,
            entrada.universo,
            entrada.modo,
            entrada.precision,
          ),
          resaltada: consulta.idsResaltados.includes("interseccion"),
        },
        soloB: {
          id: "solo-b",
          etiqueta: `Solo ${entrada.nombres[1]}`,
          valor: formatearValor(
            regiones.soloB,
            entrada.universo,
            entrada.modo,
            entrada.precision,
          ),
          resaltada: consulta.idsResaltados.includes("solo-b"),
        },
        ninguno: {
          id: "ninguno",
          etiqueta: "Ninguno",
          valor: formatearValor(
            regiones.ninguno,
            entrada.universo,
            entrada.modo,
            entrada.precision,
          ),
          resaltada: consulta.idsResaltados.includes("ninguno"),
        },
      },
    },
  };
}

function resolverConsultaTresEventos(
  entrada: EntradaTresEventos,
  regiones: RegionesTresEventos,
) {
  const [a, b, c] = entrada.nombres;
  switch (entrada.consulta) {
    case "evento-a":
      return {
        descripcion: a,
        valorBruto: entrada.valorA,
        idsResaltados: ["solo-a", "solo-ab", "solo-ac", "triple"],
        formula: `${a}`,
      };
    case "evento-b":
      return {
        descripcion: b,
        valorBruto: entrada.valorB,
        idsResaltados: ["solo-b", "solo-ab", "solo-bc", "triple"],
        formula: `${b}`,
      };
    case "evento-c":
      return {
        descripcion: c,
        valorBruto: entrada.valorC,
        idsResaltados: ["solo-c", "solo-ac", "solo-bc", "triple"],
        formula: `${c}`,
      };
    case "interseccion-ab":
      return {
        descripcion: `${a} y ${b}`,
        valorBruto: entrada.valorAB,
        idsResaltados: ["solo-ab", "triple"],
        formula: `${a}∩${b}`,
      };
    case "interseccion-ac":
      return {
        descripcion: `${a} y ${c}`,
        valorBruto: entrada.valorAC,
        idsResaltados: ["solo-ac", "triple"],
        formula: `${a}∩${c}`,
      };
    case "interseccion-bc":
      return {
        descripcion: `${b} y ${c}`,
        valorBruto: entrada.valorBC,
        idsResaltados: ["solo-bc", "triple"],
        formula: `${b}∩${c}`,
      };
    case "interseccion-abc":
      return {
        descripcion: `${a}, ${b} y ${c}`,
        valorBruto: regiones.triple,
        idsResaltados: ["triple"],
        formula: `${a}∩${b}∩${c}`,
      };
    case "union-total":
    case "al-menos-uno":
      return {
        descripcion: `al menos uno entre ${a}, ${b} y ${c}`,
        valorBruto: regiones.union,
        idsResaltados: [
          "solo-a",
          "solo-b",
          "solo-c",
          "solo-ab",
          "solo-ac",
          "solo-bc",
          "triple",
        ],
        formula: `${a}∪${b}∪${c}`,
      };
    case "solo-a":
      return {
        descripcion: `solo ${a}`,
        valorBruto: regiones.soloA,
        idsResaltados: ["solo-a"],
        formula: `${a} - ${a}∩${b} - ${a}∩${c} + ${a}∩${b}∩${c}`,
      };
    case "solo-b":
      return {
        descripcion: `solo ${b}`,
        valorBruto: regiones.soloB,
        idsResaltados: ["solo-b"],
        formula: `${b} - ${a}∩${b} - ${b}∩${c} + ${a}∩${b}∩${c}`,
      };
    case "solo-c":
      return {
        descripcion: `solo ${c}`,
        valorBruto: regiones.soloC,
        idsResaltados: ["solo-c"],
        formula: `${c} - ${a}∩${c} - ${b}∩${c} + ${a}∩${b}∩${c}`,
      };
    case "solo-ab":
      return {
        descripcion: `${a} y ${b} pero no ${c}`,
        valorBruto: regiones.soloAB,
        idsResaltados: ["solo-ab"],
        formula: `${a}∩${b} - ${a}∩${b}∩${c}`,
      };
    case "solo-ac":
      return {
        descripcion: `${a} y ${c} pero no ${b}`,
        valorBruto: regiones.soloAC,
        idsResaltados: ["solo-ac"],
        formula: `${a}∩${c} - ${a}∩${b}∩${c}`,
      };
    case "solo-bc":
      return {
        descripcion: `${b} y ${c} pero no ${a}`,
        valorBruto: regiones.soloBC,
        idsResaltados: ["solo-bc"],
        formula: `${b}∩${c} - ${a}∩${b}∩${c}`,
      };
    case "ninguno":
      return {
        descripcion: `ninguno de ${a}, ${b} ni ${c}`,
        valorBruto: regiones.ninguno,
        idsResaltados: ["ninguno"],
        formula: `( ${a}∪${b}∪${c} )'`,
      };
    case "exactamente-uno":
      return {
        descripcion: `exactamente uno entre ${a}, ${b} y ${c}`,
        valorBruto: regiones.soloA + regiones.soloB + regiones.soloC,
        idsResaltados: ["solo-a", "solo-b", "solo-c"],
        formula: `Solo ${a} + Solo ${b} + Solo ${c}`,
      };
    case "exactamente-dos":
      return {
        descripcion: `exactamente dos entre ${a}, ${b} y ${c}`,
        valorBruto: regiones.soloAB + regiones.soloAC + regiones.soloBC,
        idsResaltados: ["solo-ab", "solo-ac", "solo-bc"],
        formula: `${a}∩${b} solo + ${a}∩${c} solo + ${b}∩${c} solo`,
      };
    case "union-ab":
      return {
        descripcion: `${a} o ${b}`,
        valorBruto: entrada.valorA + entrada.valorB - entrada.valorAB,
        idsResaltados: ["solo-a", "solo-b", "solo-ab", "solo-ac", "solo-bc", "triple"],
        formula: `${a}∪${b} = ${a} + ${b} - ${a}∩${b}`,
      };
    case "union-ac":
      return {
        descripcion: `${a} o ${c}`,
        valorBruto: entrada.valorA + entrada.valorC - entrada.valorAC,
        idsResaltados: ["solo-a", "solo-c", "solo-ab", "solo-ac", "solo-bc", "triple"],
        formula: `${a}∪${c} = ${a} + ${c} - ${a}∩${c}`,
      };
    case "union-bc":
      return {
        descripcion: `${b} o ${c}`,
        valorBruto: entrada.valorB + entrada.valorC - entrada.valorBC,
        idsResaltados: ["solo-b", "solo-c", "solo-ab", "solo-ac", "solo-bc", "triple"],
        formula: `${b}∪${c} = ${b} + ${c} - ${b}∩${c}`,
      };
    case "union-ab-sin-c":
      return {
        descripcion: `${a} o ${b}, pero no ${c}`,
        valorBruto: regiones.soloA + regiones.soloB + regiones.soloAB,
        idsResaltados: ["solo-a", "solo-b", "solo-ab"],
        formula: `Solo ${a} + Solo ${b} + (${a}∩${b} sin ${c})`,
      };
    case "union-ac-sin-b":
      return {
        descripcion: `${a} o ${c}, pero no ${b}`,
        valorBruto: regiones.soloA + regiones.soloC + regiones.soloAC,
        idsResaltados: ["solo-a", "solo-c", "solo-ac"],
        formula: `Solo ${a} + Solo ${c} + (${a}∩${c} sin ${b})`,
      };
    case "union-bc-sin-a":
      return {
        descripcion: `${b} o ${c}, pero no ${a}`,
        valorBruto: regiones.soloB + regiones.soloC + regiones.soloBC,
        idsResaltados: ["solo-b", "solo-c", "solo-bc"],
        formula: `Solo ${b} + Solo ${c} + (${b}∩${c} sin ${a})`,
      };
    case "complemento-a":
      return {
        descripcion: `no ${a}`,
        valorBruto: regiones.soloB + regiones.soloC + regiones.soloBC + regiones.ninguno,
        idsResaltados: ["solo-b", "solo-c", "solo-bc", "ninguno"],
        formula: `${a}' = U - ${a}`,
      };
    case "complemento-b":
      return {
        descripcion: `no ${b}`,
        valorBruto: regiones.soloA + regiones.soloC + regiones.soloAC + regiones.ninguno,
        idsResaltados: ["solo-a", "solo-c", "solo-ac", "ninguno"],
        formula: `${b}' = U - ${b}`,
      };
    case "complemento-c":
      return {
        descripcion: `no ${c}`,
        valorBruto: regiones.soloA + regiones.soloB + regiones.soloAB + regiones.ninguno,
        idsResaltados: ["solo-a", "solo-b", "solo-ab", "ninguno"],
        formula: `${c}' = U - ${c}`,
      };
  }
}

export function calcularEventosCompuestosTres(
  entrada: EntradaTresEventos,
): ResultadoCalculadoProbabilidad {
  const regiones = resolverRegionesTresEventos(
    entrada.universo,
    entrada.valorA,
    entrada.valorB,
    entrada.valorC,
    entrada.valorAB,
    entrada.valorAC,
    entrada.valorBC,
    entrada.valorABC,
  );
  const consulta = resolverConsultaTresEventos(entrada, regiones);
  const probabilidad = convertirResultadoAProbabilidad(
    consulta.valorBruto,
    entrada.universo,
    entrada.modo,
  );

  return {
    panel: {
      tarjetas: [
        {
          titulo: "Consulta",
          valor: consulta.descripcion,
          detalle: consulta.formula,
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
          titulo: "Separar las intersecciones exclusivas",
          expresion: `${entrada.nombres[0]}∩${entrada.nombres[1]} solo = ${entrada.valorAB} - ${entrada.valorABC} = ${regiones.soloAB}; ${entrada.nombres[0]}∩${entrada.nombres[2]} solo = ${entrada.valorAC} - ${entrada.valorABC} = ${regiones.soloAC}; ${entrada.nombres[1]}∩${entrada.nombres[2]} solo = ${entrada.valorBC} - ${entrada.valorABC} = ${regiones.soloBC}`,
        },
        {
          titulo: "Calcular las regiones de solo un evento",
          expresion: `Solo ${entrada.nombres[0]} = ${regiones.soloA}; Solo ${entrada.nombres[1]} = ${regiones.soloB}; Solo ${entrada.nombres[2]} = ${regiones.soloC}`,
        },
        {
          titulo: "Aplicar inclusion-exclusion para la union total",
          expresion: `${entrada.nombres[0]}∪${entrada.nombres[1]}∪${entrada.nombres[2]} = ${entrada.valorA} + ${entrada.valorB} + ${entrada.valorC} - ${entrada.valorAB} - ${entrada.valorAC} - ${entrada.valorBC} + ${entrada.valorABC} = ${regiones.union}`,
          resultado: `Ninguno = ${regiones.ninguno}`,
        },
        {
          titulo: "Resolver la consulta solicitada",
          expresion: `${consulta.formula} = ${consulta.valorBruto}`,
          resultado:
            entrada.modo === "cantidades"
              ? `${consulta.valorBruto}/${entrada.universo} = ${formatearDecimalProbabilidad(
                  probabilidad,
                  entrada.precision,
                )}`
              : `${formatearDecimalProbabilidad(probabilidad, entrada.precision)} = ${formatearPorcentajeProbabilidad(
                  probabilidad,
                  entrada.precision,
                )}`,
        },
      ],
      tablas: [
        {
          titulo: "Regiones del diagrama de 3 eventos",
          columnas: ["Region", "Valor"],
          filas: [
            [`Solo ${entrada.nombres[0]}`, formatearValor(regiones.soloA, entrada.universo, entrada.modo, entrada.precision)],
            [`Solo ${entrada.nombres[1]}`, formatearValor(regiones.soloB, entrada.universo, entrada.modo, entrada.precision)],
            [`Solo ${entrada.nombres[2]}`, formatearValor(regiones.soloC, entrada.universo, entrada.modo, entrada.precision)],
            [`${entrada.nombres[0]} y ${entrada.nombres[1]} sin ${entrada.nombres[2]}`, formatearValor(regiones.soloAB, entrada.universo, entrada.modo, entrada.precision)],
            [`${entrada.nombres[0]} y ${entrada.nombres[2]} sin ${entrada.nombres[1]}`, formatearValor(regiones.soloAC, entrada.universo, entrada.modo, entrada.precision)],
            [`${entrada.nombres[1]} y ${entrada.nombres[2]} sin ${entrada.nombres[0]}`, formatearValor(regiones.soloBC, entrada.universo, entrada.modo, entrada.precision)],
            [`${entrada.nombres[0]}, ${entrada.nombres[1]} y ${entrada.nombres[2]}`, formatearValor(regiones.triple, entrada.universo, entrada.modo, entrada.precision)],
            ["Ninguno", formatearValor(regiones.ninguno, entrada.universo, entrada.modo, entrada.precision)],
          ],
        },
      ],
      interpretacion: construirInterpretacionCompuesta(
        consulta.descripcion,
        entrada.contexto,
        probabilidad,
        entrada.precision,
      ),
      observacion:
        "Las consultas sobre uniones parciales e intersecciones se obtienen a partir de las 8 regiones del diagrama de Venn.",
    },
    visual: {
      tipo: "venn-3",
      titulo: "Diagrama de Venn de 3 eventos",
      nombres: entrada.nombres,
      universoEtiqueta: "U",
      regiones: {
        soloA: {
          id: "solo-a",
          etiqueta: `Solo ${entrada.nombres[0]}`,
          valor: formatearValor(regiones.soloA, entrada.universo, entrada.modo, entrada.precision),
          resaltada: consulta.idsResaltados.includes("solo-a"),
        },
        soloB: {
          id: "solo-b",
          etiqueta: `Solo ${entrada.nombres[1]}`,
          valor: formatearValor(regiones.soloB, entrada.universo, entrada.modo, entrada.precision),
          resaltada: consulta.idsResaltados.includes("solo-b"),
        },
        soloC: {
          id: "solo-c",
          etiqueta: `Solo ${entrada.nombres[2]}`,
          valor: formatearValor(regiones.soloC, entrada.universo, entrada.modo, entrada.precision),
          resaltada: consulta.idsResaltados.includes("solo-c"),
        },
        soloAB: {
          id: "solo-ab",
          etiqueta: `${entrada.nombres[0]}∩${entrada.nombres[1]} sin ${entrada.nombres[2]}`,
          valor: formatearValor(regiones.soloAB, entrada.universo, entrada.modo, entrada.precision),
          resaltada: consulta.idsResaltados.includes("solo-ab"),
        },
        soloAC: {
          id: "solo-ac",
          etiqueta: `${entrada.nombres[0]}∩${entrada.nombres[2]} sin ${entrada.nombres[1]}`,
          valor: formatearValor(regiones.soloAC, entrada.universo, entrada.modo, entrada.precision),
          resaltada: consulta.idsResaltados.includes("solo-ac"),
        },
        soloBC: {
          id: "solo-bc",
          etiqueta: `${entrada.nombres[1]}∩${entrada.nombres[2]} sin ${entrada.nombres[0]}`,
          valor: formatearValor(regiones.soloBC, entrada.universo, entrada.modo, entrada.precision),
          resaltada: consulta.idsResaltados.includes("solo-bc"),
        },
        triple: {
          id: "triple",
          etiqueta: `${entrada.nombres[0]}∩${entrada.nombres[1]}∩${entrada.nombres[2]}`,
          valor: formatearValor(regiones.triple, entrada.universo, entrada.modo, entrada.precision),
          resaltada: consulta.idsResaltados.includes("triple"),
        },
        ninguno: {
          id: "ninguno",
          etiqueta: "Ninguno",
          valor: formatearValor(regiones.ninguno, entrada.universo, entrada.modo, entrada.precision),
          resaltada: consulta.idsResaltados.includes("ninguno"),
        },
      },
    },
  };
}

function construirConsultaCuatroEventos(
  entrada: EntradaCuatroEventos,
  regiones: RegionesCuatroEventos,
) {
  const [a, b, c, d] = entrada.nombres;
  const pares = {
    "interseccion-ab": {
      descripcion: `${a} y ${b}`,
      valorBruto: entrada.valorAB,
      idsResaltados: ["solo-ab", "solo-abc", "solo-abd", "quadruple"],
      formula: `${a}∩${b}`,
    },
    "interseccion-ac": {
      descripcion: `${a} y ${c}`,
      valorBruto: entrada.valorAC,
      idsResaltados: ["solo-ac", "solo-abc", "solo-acd", "quadruple"],
      formula: `${a}∩${c}`,
    },
    "interseccion-ad": {
      descripcion: `${a} y ${d}`,
      valorBruto: entrada.valorAD,
      idsResaltados: ["solo-ad", "solo-abd", "solo-acd", "quadruple"],
      formula: `${a}∩${d}`,
    },
    "interseccion-bc": {
      descripcion: `${b} y ${c}`,
      valorBruto: entrada.valorBC,
      idsResaltados: ["solo-bc", "solo-abc", "solo-bcd", "quadruple"],
      formula: `${b}∩${c}`,
    },
    "interseccion-bd": {
      descripcion: `${b} y ${d}`,
      valorBruto: entrada.valorBD,
      idsResaltados: ["solo-bd", "solo-abd", "solo-bcd", "quadruple"],
      formula: `${b}∩${d}`,
    },
    "interseccion-cd": {
      descripcion: `${c} y ${d}`,
      valorBruto: entrada.valorCD,
      idsResaltados: ["solo-cd", "solo-acd", "solo-bcd", "quadruple"],
      formula: `${c}∩${d}`,
    },
  } as const;

  const triples = {
    "interseccion-abc": {
      descripcion: `${a}, ${b} y ${c}`,
      valorBruto: entrada.valorABC,
      idsResaltados: ["solo-abc", "quadruple"],
      formula: `${a}∩${b}∩${c}`,
    },
    "interseccion-abd": {
      descripcion: `${a}, ${b} y ${d}`,
      valorBruto: entrada.valorABD,
      idsResaltados: ["solo-abd", "quadruple"],
      formula: `${a}∩${b}∩${d}`,
    },
    "interseccion-acd": {
      descripcion: `${a}, ${c} y ${d}`,
      valorBruto: entrada.valorACD,
      idsResaltados: ["solo-acd", "quadruple"],
      formula: `${a}∩${c}∩${d}`,
    },
    "interseccion-bcd": {
      descripcion: `${b}, ${c} y ${d}`,
      valorBruto: entrada.valorBCD,
      idsResaltados: ["solo-bcd", "quadruple"],
      formula: `${b}∩${c}∩${d}`,
    },
  } as const;

  if (entrada.consulta in pares) {
    return pares[entrada.consulta as keyof typeof pares];
  }

  if (entrada.consulta in triples) {
    return triples[entrada.consulta as keyof typeof triples];
  }

  switch (entrada.consulta) {
    case "union-total":
      return {
        descripcion: `al menos uno entre ${a}, ${b}, ${c} y ${d}`,
        valorBruto: regiones.union,
        idsResaltados: [
          "solo-a",
          "solo-b",
          "solo-c",
          "solo-d",
          "solo-ab",
          "solo-ac",
          "solo-ad",
          "solo-bc",
          "solo-bd",
          "solo-cd",
          "solo-abc",
          "solo-abd",
          "solo-acd",
          "solo-bcd",
          "quadruple",
        ],
        formula: `${a}∪${b}∪${c}∪${d}`,
      };
    case "ninguno":
      return {
        descripcion: `ninguno de ${a}, ${b}, ${c} ni ${d}`,
        valorBruto: regiones.ninguno,
        idsResaltados: ["ninguno"],
        formula: `( ${a}∪${b}∪${c}∪${d} )'`,
      };
    case "solo-a":
      return {
        descripcion: `solo ${a}`,
        valorBruto: regiones.soloA,
        idsResaltados: ["solo-a"],
        formula: `Solo ${a}`,
      };
    case "solo-b":
      return {
        descripcion: `solo ${b}`,
        valorBruto: regiones.soloB,
        idsResaltados: ["solo-b"],
        formula: `Solo ${b}`,
      };
    case "solo-c":
      return {
        descripcion: `solo ${c}`,
        valorBruto: regiones.soloC,
        idsResaltados: ["solo-c"],
        formula: `Solo ${c}`,
      };
    case "solo-d":
      return {
        descripcion: `solo ${d}`,
        valorBruto: regiones.soloD,
        idsResaltados: ["solo-d"],
        formula: `Solo ${d}`,
      };
    case "interseccion-abcd":
      return {
        descripcion: `${a}, ${b}, ${c} y ${d}`,
        valorBruto: regiones.quadruple,
        idsResaltados: ["quadruple"],
        formula: `${a}∩${b}∩${c}∩${d}`,
      };
    case "complemento-a":
      return {
        descripcion: `no ${a}`,
        valorBruto: entrada.universo - entrada.valorA,
        idsResaltados: [
          "solo-b",
          "solo-c",
          "solo-d",
          "solo-bc",
          "solo-bd",
          "solo-cd",
          "solo-bcd",
          "ninguno",
        ],
        formula: `${a}' = U - ${a}`,
      };
    case "complemento-b":
      return {
        descripcion: `no ${b}`,
        valorBruto: entrada.universo - entrada.valorB,
        idsResaltados: [
          "solo-a",
          "solo-c",
          "solo-d",
          "solo-ac",
          "solo-ad",
          "solo-cd",
          "solo-acd",
          "ninguno",
        ],
        formula: `${b}' = U - ${b}`,
      };
    case "complemento-c":
      return {
        descripcion: `no ${c}`,
        valorBruto: entrada.universo - entrada.valorC,
        idsResaltados: [
          "solo-a",
          "solo-b",
          "solo-d",
          "solo-ab",
          "solo-ad",
          "solo-bd",
          "solo-abd",
          "ninguno",
        ],
        formula: `${c}' = U - ${c}`,
      };
    case "complemento-d":
      return {
        descripcion: `no ${d}`,
        valorBruto: entrada.universo - entrada.valorD,
        idsResaltados: [
          "solo-a",
          "solo-b",
          "solo-c",
          "solo-ab",
          "solo-ac",
          "solo-bc",
          "solo-abc",
          "ninguno",
        ],
        formula: `${d}' = U - ${d}`,
      };
    case "exactamente-uno":
      return {
        descripcion: `exactamente uno entre ${a}, ${b}, ${c} y ${d}`,
        valorBruto: regiones.soloA + regiones.soloB + regiones.soloC + regiones.soloD,
        idsResaltados: ["solo-a", "solo-b", "solo-c", "solo-d"],
        formula: `Solo ${a} + Solo ${b} + Solo ${c} + Solo ${d}`,
      };
    case "exactamente-dos":
      return {
        descripcion: `exactamente dos entre ${a}, ${b}, ${c} y ${d}`,
        valorBruto:
          regiones.soloAB +
          regiones.soloAC +
          regiones.soloAD +
          regiones.soloBC +
          regiones.soloBD +
          regiones.soloCD,
        idsResaltados: [
          "solo-ab",
          "solo-ac",
          "solo-ad",
          "solo-bc",
          "solo-bd",
          "solo-cd",
        ],
        formula: "Suma de todas las intersecciones dobles exclusivas",
      };
    case "exactamente-tres":
      return {
        descripcion: `exactamente tres entre ${a}, ${b}, ${c} y ${d}`,
        valorBruto:
          regiones.soloABC + regiones.soloABD + regiones.soloACD + regiones.soloBCD,
        idsResaltados: ["solo-abc", "solo-abd", "solo-acd", "solo-bcd"],
        formula: "Suma de todas las intersecciones triples exclusivas",
      };
  }
}

export function calcularEventosCompuestosCuatro(
  entrada: EntradaCuatroEventos,
): ResultadoCalculadoProbabilidad {
  const regiones = resolverRegionesCuatroEventos(
    entrada.universo,
    entrada.valorA,
    entrada.valorB,
    entrada.valorC,
    entrada.valorD,
    entrada.valorAB,
    entrada.valorAC,
    entrada.valorAD,
    entrada.valorBC,
    entrada.valorBD,
    entrada.valorCD,
    entrada.valorABC,
    entrada.valorABD,
    entrada.valorACD,
    entrada.valorBCD,
    entrada.valorABCD,
  );
  const consulta = construirConsultaCuatroEventos(entrada, regiones);
  const probabilidad = convertirResultadoAProbabilidad(
    consulta.valorBruto,
    entrada.universo,
    entrada.modo,
  );

  const filas = [
    ["solo-a", `Solo ${entrada.nombres[0]}`, regiones.soloA],
    ["solo-b", `Solo ${entrada.nombres[1]}`, regiones.soloB],
    ["solo-c", `Solo ${entrada.nombres[2]}`, regiones.soloC],
    ["solo-d", `Solo ${entrada.nombres[3]}`, regiones.soloD],
    ["solo-ab", `${entrada.nombres[0]} y ${entrada.nombres[1]} solo`, regiones.soloAB],
    ["solo-ac", `${entrada.nombres[0]} y ${entrada.nombres[2]} solo`, regiones.soloAC],
    ["solo-ad", `${entrada.nombres[0]} y ${entrada.nombres[3]} solo`, regiones.soloAD],
    ["solo-bc", `${entrada.nombres[1]} y ${entrada.nombres[2]} solo`, regiones.soloBC],
    ["solo-bd", `${entrada.nombres[1]} y ${entrada.nombres[3]} solo`, regiones.soloBD],
    ["solo-cd", `${entrada.nombres[2]} y ${entrada.nombres[3]} solo`, regiones.soloCD],
    ["solo-abc", `${entrada.nombres[0]}, ${entrada.nombres[1]} y ${entrada.nombres[2]} solo`, regiones.soloABC],
    ["solo-abd", `${entrada.nombres[0]}, ${entrada.nombres[1]} y ${entrada.nombres[3]} solo`, regiones.soloABD],
    ["solo-acd", `${entrada.nombres[0]}, ${entrada.nombres[2]} y ${entrada.nombres[3]} solo`, regiones.soloACD],
    ["solo-bcd", `${entrada.nombres[1]}, ${entrada.nombres[2]} y ${entrada.nombres[3]} solo`, regiones.soloBCD],
    ["quadruple", `${entrada.nombres[0]}, ${entrada.nombres[1]}, ${entrada.nombres[2]} y ${entrada.nombres[3]}`, regiones.quadruple],
    ["ninguno", "Ninguno", regiones.ninguno],
  ] as const;

  return {
    panel: {
      tarjetas: [
        {
          titulo: "Consulta",
          valor: consulta.descripcion,
          detalle: consulta.formula,
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
          titulo: "Calcular las regiones exclusivas",
          expresion: `Se distribuyeron las intersecciones dobles, triples y cuádruple para obtener regiones exclusivas sin valores negativos.`,
          resultado: `Union total = ${regiones.union}; Ninguno = ${regiones.ninguno}`,
        },
        {
          titulo: "Aplicar inclusion-exclusion",
          expresion: `${entrada.nombres[0]}∪${entrada.nombres[1]}∪${entrada.nombres[2]}∪${entrada.nombres[3]} = ${regiones.union}`,
        },
        {
          titulo: "Resolver la consulta solicitada",
          expresion: `${consulta.formula} = ${consulta.valorBruto}`,
          resultado:
            entrada.modo === "cantidades"
              ? `${consulta.valorBruto}/${entrada.universo} = ${formatearDecimalProbabilidad(
                  probabilidad,
                  entrada.precision,
                )}`
              : `${formatearDecimalProbabilidad(probabilidad, entrada.precision)} = ${formatearPorcentajeProbabilidad(
                  probabilidad,
                  entrada.precision,
                )}`,
        },
      ],
      tablas: [
        {
          titulo: "Resumen de regiones calculadas",
          columnas: ["Region", "Valor"],
          filas: filas.map(([, etiqueta, valor]) => [
            etiqueta,
            formatearValor(valor, entrada.universo, entrada.modo, entrada.precision),
          ]),
        },
      ],
      interpretacion: construirInterpretacionCompuesta(
        consulta.descripcion,
        entrada.contexto,
        probabilidad,
        entrada.precision,
      ),
      observacion:
        "En 4 eventos se usa una tabla de regiones exclusivas para evitar forzar un Venn inexacto y mantener el calculo claro.",
    },
    visual: {
      tipo: "tabla-regiones",
      titulo: "Tabla de regiones de 4 eventos",
      columnas: ["Region", "Valor"],
      filas: filas.map(([id, etiqueta, valor]) => ({
        id,
        celdas: [
          etiqueta,
          formatearValor(valor, entrada.universo, entrada.modo, entrada.precision),
        ],
        resaltada: consulta.idsResaltados.includes(id),
      })),
    },
  };
}
