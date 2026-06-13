import { EJEMPLOS_SEGUNDO_PARCIAL } from "@/modulos/formulas-segundo-parcial/constants/ejemplos.constants";
import {
  OPCION_MODO_POISSON,
  OPCION_MODO_PROBABILIDAD,
  OPCION_TIPO_PROBABILIDAD_COMPLETA,
  OPCION_TIPO_PROBABILIDAD_SIN_NINGUNA,
} from "@/modulos/formulas-segundo-parcial/constants/formulas.constants";
import {
  MENSAJE_PROBABILIDAD_EXTREMA_CERO,
  MENSAJE_PROBABILIDAD_EXTREMA_UNO,
} from "@/modulos/formulas-segundo-parcial/constants/mensajes.constants";
import {
  calcularCombinacion,
  calcularPermutacionCircular,
  calcularPermutacionConRepeticion,
  calcularPermutacionLineal,
  calcularVariacionConRepeticion,
  calcularVariacionSinRepeticion,
} from "@/modulos/formulas-segundo-parcial/services/combinatoria.service";
import {
  calcularBinomial,
  calcularGeometrica,
  calcularHipergeometrica,
  calcularPascal,
  calcularPoisson,
} from "@/modulos/formulas-segundo-parcial/services/distribuciones.service";
import type {
  BloqueInformativoSegundoParcial,
  CampoListaEnterosSegundoParcial,
  CampoNumericoSegundoParcial,
  CampoTextoSegundoParcial,
  DefinicionVariableSegundoParcial,
  EntradaNormalizadaSegundoParcial,
  IdentificadorFormulaSegundoParcial,
  OpcionSegundoParcial,
  ResultadoFormulaSegundoParcial,
} from "@/modulos/formulas-segundo-parcial/tipos";
import { validarProbabilidadExito } from "@/modulos/formulas-segundo-parcial/utils/validar-probabilidades.util";

export interface ConfiguracionFormulaSegundoParcial {
  id: IdentificadorFormulaSegundoParcial;
  titulo: string;
  resumen: string;
  expresiones: string[];
  definiciones: DefinicionVariableSegundoParcial[];
  condiciones: string[];
  camposNumericos: CampoNumericoSegundoParcial[];
  camposListas: CampoListaEnterosSegundoParcial[];
  camposTexto: CampoTextoSegundoParcial[];
  opciones: OpcionSegundoParcial[];
  palabrasClave: string[];
  tipo: "calculo" | "informativa";
  bloquesInformativos?: BloqueInformativoSegundoParcial[];
  calcular?: (
    entrada: EntradaNormalizadaSegundoParcial,
  ) => ResultadoFormulaSegundoParcial;
}

function textosComunesProbabilidad() {
  return [
    {
      id: "nombre-variable",
      etiqueta: "Nombre de la variable aleatoria",
      descripcion: "Sirve para personalizar la explicacion del proceso.",
      placeholder: "Ejemplo: X = numero de exitos",
      valorInicial: "X",
    },
    {
      id: "descripcion-exito",
      etiqueta: "Descripcion del exito",
      descripcion: "Texto opcional para la interpretacion.",
      placeholder: "Ejemplo: paquetes con error",
      valorInicial: "exitos",
    },
    {
      id: "descripcion-fracaso",
      etiqueta: "Descripcion del fracaso",
      descripcion: "Texto opcional para la interpretacion.",
      placeholder: "Ejemplo: paquetes sin error",
      valorInicial: "fracasos",
    },
    {
      id: "descripcion-ensayo",
      etiqueta: "Descripcion del ensayo",
      descripcion: "Texto opcional para la interpretacion.",
      placeholder: "Ejemplo: envios",
      valorInicial: "ensayos",
    },
    {
      id: "descripcion-contexto",
      etiqueta: "Descripcion del contexto",
      descripcion: "Texto opcional para la interpretacion.",
      placeholder: "Ejemplo: una jornada de produccion",
      valorInicial: "el contexto indicado",
    },
  ] satisfies CampoTextoSegundoParcial[];
}

function camposComunesPoisson() {
  return [
    ...textosComunesProbabilidad(),
    {
      id: "unidad-tiempo",
      etiqueta: "Intervalo o unidad de observacion",
      descripcion: "Sirve para personalizar la interpretacion de Poisson.",
      placeholder: "Ejemplo: 1 minuto",
      valorInicial: "el intervalo indicado",
    },
  ] satisfies CampoTextoSegundoParcial[];
}

function convertirProbabilidad(
  valor: number,
  modo: string,
  etiqueta = "p",
) {
  const probabilidad = modo === "porcentaje" ? valor / 100 : valor;
  if (probabilidad < 0 || probabilidad > 1) {
    throw new Error(`La probabilidad ${etiqueta} debe estar entre 0 y 1.`);
  }
  return probabilidad;
}

function crearTarjetaFormula(configuracion: ConfiguracionFormulaSegundoParcial) {
  return {
    id: configuracion.id,
    titulo: configuracion.titulo,
    resumen: configuracion.resumen,
    palabrasClave: configuracion.palabrasClave,
  };
}

export const configuracionesFormulasSegundoParcial: Record<
  IdentificadorFormulaSegundoParcial,
  ConfiguracionFormulaSegundoParcial
> = {
  "permutacion-lineal": {
    id: "permutacion-lineal",
    titulo: "PERMUTACION LINEAL",
    resumen: "Ordena todos los elementos disponibles en una secuencia donde si importa el orden.",
    expresiones: ["Pn = n!"],
    definiciones: [
      { simbolo: "Pn", descripcion: "Numero de permutaciones posibles." },
      { simbolo: "n", descripcion: "Cantidad total de elementos distintos." },
      { simbolo: "!", descripcion: "Factorial del numero indicado." },
    ],
    condiciones: [
      "Los elementos deben ser distintos.",
      "Se ordenan todos los elementos disponibles.",
      "Importa el orden.",
      "n debe ser entero y n >= 0.",
    ],
    camposNumericos: [
      {
        id: "n",
        simbolo: "n",
        etiqueta: "Cantidad total de elementos (n)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 5",
        entero: true,
        noNegativo: true,
      },
    ],
    camposListas: [],
    camposTexto: [
      {
        id: "descripcion-elementos",
        etiqueta: "Descripcion de los elementos",
        descripcion: "Texto opcional para la interpretacion final.",
        placeholder: "Ejemplo: estudiantes",
        valorInicial: "elementos",
      },
    ],
    opciones: [],
    palabrasClave: ["permutacion", "lineal", "n!"],
    tipo: "calculo",
    calcular: (entrada) =>
      calcularPermutacionLineal({
        n: entrada.numericos.n,
        precision: entrada.precision,
        descripcionElementos: entrada.textosInterpretacion["descripcion-elementos"],
      }),
  },
  "permutacion-con-repeticion": {
    id: "permutacion-con-repeticion",
    titulo: "PERMUTACION CON REPETICION",
    resumen: "Ordena todos los elementos cuando existen repeticiones y se corrige dividiendo entre los factoriales repetidos.",
    expresiones: ["PRn = n! / (n1! x n2! x ... x nk!)"],
    definiciones: [
      { simbolo: "PRn", descripcion: "Permutaciones posibles con repeticiones." },
      { simbolo: "n", descripcion: "Cantidad total de elementos." },
      { simbolo: "n1, n2, ...", descripcion: "Cantidades repetidas de cada grupo." },
    ],
    condiciones: [
      "Importa el orden.",
      "Se ordenan todos los elementos.",
      "Cada repeticion debe ser un entero mayor o igual a 2.",
      "La suma de repeticiones no debe ser mayor que n.",
    ],
    camposNumericos: [
      {
        id: "n",
        simbolo: "n",
        etiqueta: "Cantidad total de elementos (n)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 7",
        entero: true,
        noNegativo: true,
      },
    ],
    camposListas: [
      {
        id: "repeticiones",
        etiqueta: "Lista de repeticiones",
        descripcion: "Ingresa valores separados por coma, espacio o punto y coma. Cada valor debe ser >= 2.",
        placeholder: "Ejemplo: 3, 2",
        minimoValor: 2,
        opcional: true,
      },
    ],
    camposTexto: [
      {
        id: "descripcion-elementos",
        etiqueta: "Descripcion de los elementos",
        descripcion: "Texto opcional para la interpretacion final.",
        placeholder: "Ejemplo: letras de una palabra",
        valorInicial: "elementos",
      },
    ],
    opciones: [],
    palabrasClave: ["permutacion", "repeticion", "factorial"],
    tipo: "calculo",
    calcular: (entrada) => {
      const sumaRepeticiones = entrada.listas.repeticiones.reduce(
        (acumulado, valor) => acumulado + valor,
        0,
      );

      if (sumaRepeticiones > entrada.numericos.n) {
        throw new Error("La suma de las repeticiones no debe ser mayor que n.");
      }

      return calcularPermutacionConRepeticion({
        n: entrada.numericos.n,
        repeticiones: entrada.listas.repeticiones,
        precision: entrada.precision,
        descripcionElementos: entrada.textosInterpretacion["descripcion-elementos"],
      });
    },
  },
  "permutacion-circular": {
    id: "permutacion-circular",
    titulo: "PERMUTACION CIRCULAR",
    resumen: "Ordena elementos alrededor de un circulo fijando una posicion pivote.",
    expresiones: ["Pcn = (n - 1)!"],
    definiciones: [
      { simbolo: "Pcn", descripcion: "Permutaciones circulares posibles." },
      { simbolo: "n", descripcion: "Cantidad total de elementos distintos." },
    ],
    condiciones: [
      "Los elementos deben ser distintos.",
      "Se trabaja con orden circular.",
      "Una posicion se considera fija o pivote.",
      "n debe ser entero y n >= 1.",
    ],
    camposNumericos: [
      {
        id: "n",
        simbolo: "n",
        etiqueta: "Cantidad total de elementos (n)",
        descripcion: "Solo admite enteros positivos.",
        placeholder: "Ejemplo: 6",
        entero: true,
        positivo: true,
      },
    ],
    camposListas: [],
    camposTexto: [
      {
        id: "descripcion-elementos",
        etiqueta: "Descripcion de los elementos",
        descripcion: "Texto opcional para la interpretacion final.",
        placeholder: "Ejemplo: personas",
        valorInicial: "elementos",
      },
    ],
    opciones: [],
    palabrasClave: ["permutacion", "circular", "pivote"],
    tipo: "calculo",
    calcular: (entrada) =>
      calcularPermutacionCircular({
        n: entrada.numericos.n,
        precision: entrada.precision,
        descripcionElementos: entrada.textosInterpretacion["descripcion-elementos"],
      }),
  },
  "variacion-sin-repeticion": {
    id: "variacion-sin-repeticion",
    titulo: "VARIACION SIN REPETICION",
    resumen: "Ordena una parte de los elementos disponibles sin permitir repeticiones.",
    expresiones: ["V(n,r) = n! / (n - r)!"],
    definiciones: [
      { simbolo: "V(n,r)", descripcion: "Variaciones sin repeticion." },
      { simbolo: "n", descripcion: "Numero total de elementos disponibles." },
      { simbolo: "r", descripcion: "Cantidad de elementos tomados." },
    ],
    condiciones: [
      "Importa el orden.",
      "No se permite repeticion.",
      "n y r deben ser enteros.",
      "0 <= r <= n.",
    ],
    camposNumericos: [
      {
        id: "n",
        simbolo: "n",
        etiqueta: "Cantidad total de elementos (n)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 10",
        entero: true,
        noNegativo: true,
      },
      {
        id: "r",
        simbolo: "r",
        etiqueta: "Cantidad a ordenar (r)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 4",
        entero: true,
        noNegativo: true,
      },
    ],
    camposListas: [],
    camposTexto: [
      {
        id: "descripcion-elementos",
        etiqueta: "Descripcion de los elementos",
        descripcion: "Texto opcional para la interpretacion final.",
        placeholder: "Ejemplo: candidatos",
        valorInicial: "elementos",
      },
    ],
    opciones: [],
    palabrasClave: ["variacion", "sin repeticion", "orden"],
    tipo: "calculo",
    calcular: (entrada) => {
      if (entrada.numericos.r > entrada.numericos.n) {
        throw new Error("En variacion sin repeticion se requiere r <= n.");
      }

      return calcularVariacionSinRepeticion({
        n: entrada.numericos.n,
        r: entrada.numericos.r,
        precision: entrada.precision,
        descripcionElementos: entrada.textosInterpretacion["descripcion-elementos"],
      });
    },
  },
  "variacion-con-repeticion": {
    id: "variacion-con-repeticion",
    titulo: "VARIACION CON REPETICION",
    resumen: "Forma agrupaciones donde si importa el orden y los elementos pueden repetirse.",
    expresiones: ["V'(n,r) = n^r"],
    definiciones: [
      { simbolo: "V'(n,r)", descripcion: "Variaciones con repeticion." },
      { simbolo: "n", descripcion: "Numero total de elementos disponibles." },
      { simbolo: "r", descripcion: "Cantidad de posiciones o lugares." },
    ],
    condiciones: [
      "Importa el orden.",
      "Se permite repeticion.",
      "n debe ser entero positivo.",
      "r debe ser entero no negativo.",
    ],
    camposNumericos: [
      {
        id: "n",
        simbolo: "n",
        etiqueta: "Cantidad disponible (n)",
        descripcion: "Solo admite enteros positivos.",
        placeholder: "Ejemplo: 5",
        entero: true,
        positivo: true,
      },
      {
        id: "r",
        simbolo: "r",
        etiqueta: "Cantidad de posiciones (r)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 3",
        entero: true,
        noNegativo: true,
      },
    ],
    camposListas: [],
    camposTexto: [
      {
        id: "descripcion-elementos",
        etiqueta: "Descripcion de los elementos",
        descripcion: "Texto opcional para la interpretacion final.",
        placeholder: "Ejemplo: letras",
        valorInicial: "elementos",
      },
    ],
    opciones: [],
    palabrasClave: ["variacion", "con repeticion", "potencia"],
    tipo: "calculo",
    calcular: (entrada) =>
      calcularVariacionConRepeticion({
        n: entrada.numericos.n,
        r: entrada.numericos.r,
        precision: entrada.precision,
        descripcionElementos: entrada.textosInterpretacion["descripcion-elementos"],
      }),
  },
  combinacion: {
    id: "combinacion",
    titulo: "COMBINACION",
    resumen: "Selecciona elementos de un conjunto cuando no importa el orden.",
    expresiones: ["C(n,r) = n! / (r! x (n - r)!)"],
    definiciones: [
      { simbolo: "C(n,r)", descripcion: "Numero de combinaciones posibles." },
      { simbolo: "n", descripcion: "Numero total de elementos distintos." },
      { simbolo: "r", descripcion: "Numero de elementos seleccionados." },
    ],
    condiciones: [
      "No importa el orden.",
      "n y r deben ser enteros.",
      "0 <= r <= n.",
    ],
    camposNumericos: [
      {
        id: "n",
        simbolo: "n",
        etiqueta: "Cantidad total de elementos (n)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 12",
        entero: true,
        noNegativo: true,
      },
      {
        id: "r",
        simbolo: "r",
        etiqueta: "Cantidad a seleccionar (r)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 4",
        entero: true,
        noNegativo: true,
      },
    ],
    camposListas: [],
    camposTexto: [
      {
        id: "descripcion-elementos",
        etiqueta: "Descripcion de los elementos",
        descripcion: "Texto opcional para la interpretacion final.",
        placeholder: "Ejemplo: estudiantes",
        valorInicial: "elementos",
      },
    ],
    opciones: [],
    palabrasClave: ["combinacion", "seleccion", "n", "r"],
    tipo: "calculo",
    calcular: (entrada) => {
      if (entrada.numericos.r > entrada.numericos.n) {
        throw new Error("En combinacion se requiere r <= n.");
      }

      return calcularCombinacion({
        n: entrada.numericos.n,
        r: entrada.numericos.r,
        precision: entrada.precision,
        descripcionElementos: entrada.textosInterpretacion["descripcion-elementos"],
      });
    },
  },
  "distribucion-binomial": {
    id: "distribucion-binomial",
    titulo: "DISTRIBUCION BINOMIAL",
    resumen: `Probabilidad discreta para exitos en n ensayos independientes. ${EJEMPLOS_SEGUNDO_PARCIAL.binomial}`,
    expresiones: ["P(X = x) = C(n,x) x p^x x q^(n-x)"],
    definiciones: [
      { simbolo: "X", descripcion: "Numero de exitos en el experimento." },
      { simbolo: "n", descripcion: "Numero total de ensayos." },
      { simbolo: "x", descripcion: "Cantidad de exitos a calcular." },
      { simbolo: "p", descripcion: "Probabilidad de exito." },
      { simbolo: "q", descripcion: "Probabilidad de fracaso; q = 1 - p." },
    ],
    condiciones: [
      "La variable es discreta y el experimento es de Bernoulli repetido.",
      "Los ensayos son independientes y p se mantiene constante.",
      "En calculo exacto, x debe estar entre 0 y n.",
      "Para acumulaciones se usa la suma directa o el complemento segun corresponda.",
    ],
    camposNumericos: [
      {
        id: "n",
        simbolo: "n",
        etiqueta: "Numero de ensayos (n)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 20",
        entero: true,
        noNegativo: true,
      },
      {
        id: "p",
        simbolo: "p",
        etiqueta: "Probabilidad de exito (p)",
        descripcion: "Ingresa p como decimal o porcentaje segun la opcion elegida.",
        placeholder: "Ejemplo: 0,08 o 8",
      },
      {
        id: "x",
        simbolo: "x",
        etiqueta: "Valor de X",
        descripcion: "Cantidad de exitos a evaluar.",
        placeholder: "Ejemplo: 3",
        entero: true,
        noNegativo: true,
      },
    ],
    camposListas: [],
    camposTexto: textosComunesProbabilidad(),
    opciones: [OPCION_MODO_PROBABILIDAD, OPCION_TIPO_PROBABILIDAD_COMPLETA],
    palabrasClave: ["binomial", "probabilidad", "exitos", "acumulada"],
    tipo: "calculo",
    calcular: (entrada) => {
      const p = convertirProbabilidad(
        entrada.numericos.p,
        entrada.opciones["modo-probabilidad"] ?? "decimal",
      );
      validarProbabilidadExito(p, "p", {
        permitirCero: true,
        permitirUno: true,
      });

      const resultado = calcularBinomial({
        n: entrada.numericos.n,
        p,
        x: entrada.numericos.x,
        tipoProbabilidad:
          (entrada.opciones["tipo-probabilidad"] as
            | "exactamente"
            | "menor"
            | "menor-igual"
            | "mayor"
            | "mayor-igual"
            | "ninguna") ?? "exactamente",
        precision: entrada.precision,
        textos: entrada.textosInterpretacion,
      });

      if (p === 0) {
        resultado.alertas = [...(resultado.alertas ?? []), MENSAJE_PROBABILIDAD_EXTREMA_CERO];
      }

      if (p === 1) {
        resultado.alertas = [...(resultado.alertas ?? []), MENSAJE_PROBABILIDAD_EXTREMA_UNO];
      }

      return resultado;
    },
  },
  "distribucion-geometrica": {
    id: "distribucion-geometrica",
    titulo: "DISTRIBUCION GEOMETRICA",
    resumen: `Probabilidad discreta hasta obtener el primer exito. ${EJEMPLOS_SEGUNDO_PARCIAL.geometrica}`,
    expresiones: ["P(X = x) = p x q^(x-1)"],
    definiciones: [
      { simbolo: "X", descripcion: "Numero de intentos hasta el primer exito." },
      { simbolo: "x", descripcion: "Intento donde ocurre el primer exito." },
      { simbolo: "p", descripcion: "Probabilidad de exito." },
      { simbolo: "q", descripcion: "Probabilidad de fracaso; q = 1 - p." },
    ],
    condiciones: [
      "Se busca el primer exito.",
      "X empieza en 1 y no permite X = 0.",
      "La probabilidad p debe cumplir 0 < p <= 1.",
      "Las acumulaciones parten desde X = 1.",
    ],
    camposNumericos: [
      {
        id: "p",
        simbolo: "p",
        etiqueta: "Probabilidad de exito (p)",
        descripcion: "Ingresa p como decimal o porcentaje segun la opcion elegida.",
        placeholder: "Ejemplo: 0,25 o 25",
      },
      {
        id: "x",
        simbolo: "x",
        etiqueta: "Intento objetivo (x)",
        descripcion: "Solo admite enteros positivos.",
        placeholder: "Ejemplo: 4",
        entero: true,
        positivo: true,
      },
    ],
    camposListas: [],
    camposTexto: textosComunesProbabilidad(),
    opciones: [OPCION_MODO_PROBABILIDAD, OPCION_TIPO_PROBABILIDAD_SIN_NINGUNA],
    palabrasClave: ["geometrica", "primer exito", "probabilidad"],
    tipo: "calculo",
    calcular: (entrada) => {
      const p = convertirProbabilidad(
        entrada.numericos.p,
        entrada.opciones["modo-probabilidad"] ?? "decimal",
      );
      validarProbabilidadExito(p, "p", {
        permitirCero: false,
        permitirUno: true,
      });

      return calcularGeometrica({
        p,
        x: entrada.numericos.x,
        tipoProbabilidad:
          (entrada.opciones["tipo-probabilidad"] as
            | "exactamente"
            | "menor"
            | "menor-igual"
            | "mayor"
            | "mayor-igual") ?? "exactamente",
        precision: entrada.precision,
        textos: entrada.textosInterpretacion,
      });
    },
  },
  "distribucion-pascal": {
    id: "distribucion-pascal",
    titulo: "DISTRIBUCION DE PASCAL",
    resumen: `Probabilidad discreta hasta alcanzar el exito numero r. ${EJEMPLOS_SEGUNDO_PARCIAL.pascal}`,
    expresiones: ["P(X = x) = C(x-1, r-1) x p^r x q^(x-r)"],
    definiciones: [
      { simbolo: "X", descripcion: "Numero total de intentos hasta el exito numero r." },
      { simbolo: "x", descripcion: "Intento donde ocurre el exito numero r." },
      { simbolo: "r", descripcion: "Cantidad de exitos deseados." },
      { simbolo: "p", descripcion: "Probabilidad de exito." },
      { simbolo: "q", descripcion: "Probabilidad de fracaso; q = 1 - p." },
    ],
    condiciones: [
      "Se busca el exito numero r.",
      "r debe ser entero y r >= 1.",
      "En calculo exacto se requiere x >= r.",
      "La probabilidad p debe cumplir 0 < p <= 1.",
    ],
    camposNumericos: [
      {
        id: "r",
        simbolo: "r",
        etiqueta: "Cantidad de exitos (r)",
        descripcion: "Solo admite enteros positivos.",
        placeholder: "Ejemplo: 5",
        entero: true,
        positivo: true,
      },
      {
        id: "p",
        simbolo: "p",
        etiqueta: "Probabilidad de exito (p)",
        descripcion: "Ingresa p como decimal o porcentaje segun la opcion elegida.",
        placeholder: "Ejemplo: 0,30 o 30",
      },
      {
        id: "x",
        simbolo: "x",
        etiqueta: "Numero total de intentos (x)",
        descripcion: "Solo admite enteros positivos.",
        placeholder: "Ejemplo: 10",
        entero: true,
        positivo: true,
      },
    ],
    camposListas: [],
    camposTexto: textosComunesProbabilidad(),
    opciones: [OPCION_MODO_PROBABILIDAD, OPCION_TIPO_PROBABILIDAD_SIN_NINGUNA],
    palabrasClave: ["pascal", "negativa", "r exitos", "probabilidad"],
    tipo: "calculo",
    calcular: (entrada) => {
      const p = convertirProbabilidad(
        entrada.numericos.p,
        entrada.opciones["modo-probabilidad"] ?? "decimal",
      );
      validarProbabilidadExito(p, "p", {
        permitirCero: false,
        permitirUno: true,
      });

      return calcularPascal({
        r: entrada.numericos.r,
        p,
        x: entrada.numericos.x,
        tipoProbabilidad:
          (entrada.opciones["tipo-probabilidad"] as
            | "exactamente"
            | "menor"
            | "menor-igual"
            | "mayor"
            | "mayor-igual") ?? "exactamente",
        precision: entrada.precision,
        textos: entrada.textosInterpretacion,
      });
    },
  },
  "distribucion-hipergeometrica": {
    id: "distribucion-hipergeometrica",
    titulo: "DISTRIBUCION HIPERGEOMETRICA",
    resumen: `Probabilidad discreta sin reemplazo dentro de una poblacion finita. ${EJEMPLOS_SEGUNDO_PARCIAL.hipergeometrica}`,
    expresiones: ["P(X = x) = [C(K,x) x C(N-K, n-x)] / C(N,n)"],
    definiciones: [
      { simbolo: "N", descripcion: "Cantidad total de elementos de la poblacion." },
      { simbolo: "K", descripcion: "Cantidad de exitos en la poblacion." },
      { simbolo: "n", descripcion: "Tamano de la muestra." },
      { simbolo: "x", descripcion: "Cantidad de exitos en la muestra." },
    ],
    condiciones: [
      "La muestra se toma sin reemplazo.",
      "La poblacion es finita.",
      "0 <= K <= N y 0 <= n <= N.",
      "El rango valido de x es max(0, n-(N-K)) <= x <= min(n, K).",
    ],
    camposNumericos: [
      {
        id: "N",
        simbolo: "N",
        etiqueta: "Poblacion total (N)",
        descripcion: "Solo admite enteros positivos.",
        placeholder: "Ejemplo: 50",
        entero: true,
        positivo: true,
      },
      {
        id: "K",
        simbolo: "K",
        etiqueta: "Exitos en la poblacion (K)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 8",
        entero: true,
        noNegativo: true,
      },
      {
        id: "n",
        simbolo: "n",
        etiqueta: "Tamano de muestra (n)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 10",
        entero: true,
        noNegativo: true,
      },
      {
        id: "x",
        simbolo: "x",
        etiqueta: "Exitos en la muestra (x)",
        descripcion: "Solo admite enteros no negativos.",
        placeholder: "Ejemplo: 2",
        entero: true,
        noNegativo: true,
      },
    ],
    camposListas: [],
    camposTexto: [
      ...textosComunesProbabilidad(),
      {
        id: "descripcion-poblacion",
        etiqueta: "Descripcion de la poblacion",
        descripcion: "Texto opcional para la interpretacion.",
        placeholder: "Ejemplo: cajas del lote",
        valorInicial: "poblacion",
      },
      {
        id: "descripcion-muestra",
        etiqueta: "Descripcion de la muestra",
        descripcion: "Texto opcional para la interpretacion.",
        placeholder: "Ejemplo: cajas inspeccionadas",
        valorInicial: "muestra",
      },
    ],
    opciones: [OPCION_TIPO_PROBABILIDAD_COMPLETA],
    palabrasClave: ["hipergeometrica", "sin reemplazo", "muestra", "poblacion"],
    tipo: "calculo",
    calcular: (entrada) =>
      calcularHipergeometrica({
        N: entrada.numericos.N,
        K: entrada.numericos.K,
        n: entrada.numericos.n,
        x: entrada.numericos.x,
        tipoProbabilidad:
          (entrada.opciones["tipo-probabilidad"] as
            | "exactamente"
            | "menor"
            | "menor-igual"
            | "mayor"
            | "mayor-igual"
            | "ninguna") ?? "exactamente",
        precision: entrada.precision,
        textos: entrada.textosInterpretacion,
      }),
  },
  "distribucion-poisson": {
    id: "distribucion-poisson",
    titulo: "DISTRIBUCION DE POISSON",
    resumen: `Probabilidad discreta para numero de eventos en un intervalo. ${EJEMPLOS_SEGUNDO_PARCIAL.poisson}`,
    expresiones: ["P(X = x) = (e^(-lambda) x lambda^x) / x!"],
    definiciones: [
      { simbolo: "lambda", descripcion: "Promedio de ocurrencias en el intervalo." },
      { simbolo: "X", descripcion: "Numero de eventos en el intervalo." },
      { simbolo: "x", descripcion: "Cantidad exacta de eventos a calcular." },
      { simbolo: "e", descripcion: "Constante de Euler." },
    ],
    condiciones: [
      "La variable es discreta y X puede tomar valores desde 0.",
      "Se requiere lambda > 0.",
      "Si se ajusta por intervalo, tasaPromedio, intervaloBase e intervaloObjetivo deben ser mayores que 0.",
      "La opcion Ninguna equivale a P(X = 0).",
    ],
    camposNumericos: [
      {
        id: "lambda",
        simbolo: "lambda",
        etiqueta: "Lambda directa",
        descripcion: "Promedio de ocurrencias en el intervalo.",
        placeholder: "Ejemplo: 6",
        positivo: true,
        visibleSi: {
          opcionId: "modo-lambda",
          valores: ["directa"],
        },
      },
      {
        id: "tasa-promedio",
        simbolo: "tasa",
        etiqueta: "Tasa promedio",
        descripcion: "Promedio base de ocurrencias.",
        placeholder: "Ejemplo: 5",
        positivo: true,
        visibleSi: {
          opcionId: "modo-lambda",
          valores: ["ajustada"],
        },
      },
      {
        id: "intervalo-base",
        simbolo: "base",
        etiqueta: "Intervalo base",
        descripcion: "Intervalo al que corresponde la tasa promedio.",
        placeholder: "Ejemplo: 1",
        positivo: true,
        visibleSi: {
          opcionId: "modo-lambda",
          valores: ["ajustada"],
        },
      },
      {
        id: "intervalo-objetivo",
        simbolo: "objetivo",
        etiqueta: "Intervalo objetivo",
        descripcion: "Intervalo para el que quieres calcular.",
        placeholder: "Ejemplo: 0,5",
        positivo: true,
        visibleSi: {
          opcionId: "modo-lambda",
          valores: ["ajustada"],
        },
      },
      {
        id: "x",
        simbolo: "x",
        etiqueta: "Valor de X",
        descripcion: "Cantidad de eventos a evaluar.",
        placeholder: "Ejemplo: 4",
        entero: true,
        noNegativo: true,
      },
    ],
    camposListas: [],
    camposTexto: camposComunesPoisson(),
    opciones: [OPCION_MODO_POISSON, OPCION_TIPO_PROBABILIDAD_COMPLETA],
    palabrasClave: ["poisson", "lambda", "eventos", "intervalo"],
    tipo: "calculo",
    calcular: (entrada) => {
      const modo = entrada.opciones["modo-lambda"] ?? "directa";
      const lambda =
        modo === "ajustada"
          ? (entrada.numericos["tasa-promedio"] *
              entrada.numericos["intervalo-objetivo"]) /
            entrada.numericos["intervalo-base"]
          : entrada.numericos.lambda;

      return calcularPoisson({
        lambda,
        x: entrada.numericos.x,
        tipoProbabilidad:
          (entrada.opciones["tipo-probabilidad"] as
            | "exactamente"
            | "menor"
            | "menor-igual"
            | "mayor"
            | "mayor-igual"
            | "ninguna") ?? "exactamente",
        precision: entrada.precision,
        textos: entrada.textosInterpretacion,
        detalleLambda:
          modo === "ajustada"
            ? `lambda = (${entrada.numericos["tasa-promedio"]} x ${entrada.numericos["intervalo-objetivo"]}) / ${entrada.numericos["intervalo-base"]} = ${lambda}`
            : undefined,
      });
    },
  },
  "complementos-acumulaciones": {
    id: "complementos-acumulaciones",
    titulo: "COMPLEMENTOS Y ACUMULACIONES",
    resumen: "Card de apoyo para recordar como se arma cada probabilidad acumulada y desde donde empieza el soporte real.",
    expresiones: [
      "P(X < x) = suma desde el inicio real del soporte hasta x-1",
      "P(X <= x) = suma desde el inicio real del soporte hasta x",
      "P(X > x) = 1 - P(X <= x)",
      "P(X >= x) = 1 - P(X < x)",
    ],
    definiciones: [
      { simbolo: "inicio real", descripcion: "Primer valor valido de la distribucion." },
      { simbolo: "soporte", descripcion: "Conjunto de valores que puede tomar X." },
    ],
    condiciones: [
      "No todas las distribuciones comienzan en 0.",
      "Binomial y Poisson arrancan en 0.",
      "Geometrica arranca en 1.",
      "Pascal arranca en r.",
      "Hipergeometrica arranca en max(0, n-(N-K)).",
    ],
    camposNumericos: [],
    camposListas: [],
    camposTexto: [],
    opciones: [],
    palabrasClave: ["complementos", "acumulaciones", "soporte", "ayuda"],
    tipo: "informativa",
    bloquesInformativos: [
      {
        titulo: "Como leer cada tipo",
        parrafos: [
          "Exactamente X significa que solo evaluas P(X = x).",
          "Menor que X significa sumar desde el inicio real del soporte hasta x - 1.",
          "Menor o igual que X significa sumar desde el inicio real del soporte hasta x.",
          "Mayor que X se resuelve mejor con complemento: 1 - P(X <= x).",
          "Mayor o igual que X se resuelve mejor con complemento: 1 - P(X < x).",
        ],
      },
      {
        titulo: "Inicios reales del soporte",
        parrafos: [
          "Binomial: inicia en 0 y termina en n.",
          "Geometrica: inicia en 1 y continua indefinidamente.",
          "Pascal: inicia en r y continua indefinidamente.",
          "Hipergeometrica: inicia en max(0, n-(N-K)) y termina en min(n, K).",
          "Poisson: inicia en 0 y continua indefinidamente.",
        ],
      },
      {
        titulo: "Uso del complemento",
        parrafos: [
          "P(X > x) + P(X <= x) = 1",
          "P(X >= x) + P(X < x) = 1",
          "Cuando el rango superior es infinito, el complemento evita sumar una cola demasiado larga.",
        ],
      },
    ],
  },
};

export const tarjetasFormulaSegundoParcial = Object.values(
  configuracionesFormulasSegundoParcial,
).map(crearTarjetaFormula);

export function obtenerConfiguracionFormulaSegundoParcial(
  id: IdentificadorFormulaSegundoParcial,
) {
  return configuracionesFormulasSegundoParcial[id];
}
