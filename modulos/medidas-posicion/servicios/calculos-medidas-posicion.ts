import {
  formatearNumeroCompacto,
  formatearNumeroConPrecisionFija,
  formatearNumeroResultado,
  formatearPorcentajeResultado,
} from "@/modulos/medidas-posicion/servicios/formateadores-medidas-posicion";
import { obtenerConfiguracionMedidaPosicion } from "@/modulos/medidas-posicion/servicios/configuraciones-medidas-posicion";
import {
  crearTablaClasificadaExtendida,
  extraerDatosNoClasificadosDesdeMatriz,
  validarFilasClasificadas,
} from "@/modulos/medidas-posicion/servicios/parseadores-medidas-posicion";
import type {
  FilaTablaClasificadaEntrada,
  IdentificadorMedidaPosicion,
  OpcionesSalidaMedidaPosicion,
  ResultadoCalculoMedidasPosicion,
  ResultadoMedidaPosicion,
  ResultadoResumenTodos,
  TablaClasificadaExtendida,
  TablaDetalleMedida,
  TipoDatosMedidaPosicion,
} from "@/modulos/medidas-posicion/tipos";

function crearTablaDetalle(
  titulo: string,
  columnas: string[],
  filas: Array<Array<string | number>>,
): TablaDetalleMedida {
  return {
    titulo,
    columnas,
    filas: filas.map((fila) => fila.map((valor) => `${valor}`)),
  };
}

function crearResultadoIndividual(
  medidaId: IdentificadorMedidaPosicion,
  tipoDatos: TipoDatosMedidaPosicion,
  valorPrincipal: string,
  observacion: string,
  interpretacion: string,
  pasos: ResultadoMedidaPosicion["pasos"],
  tablas: TablaDetalleMedida[],
): ResultadoMedidaPosicion {
  const configuracion = obtenerConfiguracionMedidaPosicion(medidaId);

  return {
    medidaId,
    titulo: configuracion.titulo,
    tipoDatos,
    valorPrincipal,
    observacion,
    interpretacion,
    pasos,
    tablas,
  };
}

function obtenerValorCuantilValido(
  medidaId: IdentificadorMedidaPosicion,
  valorCuantil?: number,
) {
  const configuracion = obtenerConfiguracionMedidaPosicion(medidaId);

  if (!configuracion.requiereCuantil) {
    return undefined;
  }

  const valor = valorCuantil ?? configuracion.requiereCuantil.valorInicial;

  if (
    !Number.isInteger(valor) ||
    valor < configuracion.requiereCuantil.minimo ||
    valor > configuracion.requiereCuantil.maximo
  ) {
    throw new Error(
      `${configuracion.requiereCuantil.etiqueta} debe estar entre ${configuracion.requiereCuantil.minimo} y ${configuracion.requiereCuantil.maximo}.`,
    );
  }

  return valor;
}

function obtenerValorCuantilSegunMedida(
  medidaId: "cuartiles" | "deciles" | "percentiles",
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  switch (medidaId) {
    case "cuartiles":
      return opcionesSalida.valorCuartil ?? opcionesSalida.valorCuantil;
    case "deciles":
      return opcionesSalida.valorDecil ?? opcionesSalida.valorCuantil;
    case "percentiles":
      return opcionesSalida.valorPercentil ?? opcionesSalida.valorCuantil;
    default:
      return opcionesSalida.valorCuantil;
  }
}

function obtenerEtiquetaResultadoCuantil(
  medidaId: IdentificadorMedidaPosicion,
  valorCuantil?: number,
) {
  const configuracion = obtenerConfiguracionMedidaPosicion(medidaId);

  if (!configuracion.requiereCuantil || !valorCuantil) {
    return configuracion.titulo;
  }

  return `${configuracion.requiereCuantil.simbolo}${valorCuantil}`;
}

function validarDatosNoClasificados(
  matrizDatos: string[][],
  medidaId: IdentificadorMedidaPosicion,
) {
  const { tokens, valoresNumericos, textosInvalidos } =
    extraerDatosNoClasificadosDesdeMatriz(matrizDatos);

  if (tokens.length === 0) {
    throw new Error("Debes ingresar al menos un dato numerico.");
  }

  if (textosInvalidos.length > 0) {
    throw new Error(
      `Existen valores invalidos: ${textosInvalidos.join(", ")}.`,
    );
  }

  if (
    (medidaId === "media-geometrica" || medidaId === "media-armonica") &&
    valoresNumericos.some((valor) => valor <= 0)
  ) {
    throw new Error(
      medidaId === "media-geometrica"
        ? "La media geometrica carece de sentido para datos negativos o nulos. Todos los valores deben ser mayores que cero."
        : "La media armonica requiere valores mayores que cero para evitar divisiones invalidas.",
    );
  }

  return {
    datosIngresados: valoresNumericos,
    datosOrdenados: [...valoresNumericos].sort((a, b) => a - b),
  };
}

function validarDatosClasificados(
  filasEntrada: FilaTablaClasificadaEntrada[],
  medidaId: IdentificadorMedidaPosicion,
) {
  const filasValidadas = validarFilasClasificadas(filasEntrada);
  const tablaExtendida = crearTablaClasificadaExtendida(filasValidadas);

  if (
    (medidaId === "media-geometrica" || medidaId === "media-armonica") &&
    tablaExtendida.filas.some((fila) => fila.fi > 0 && fila.xi <= 0)
  ) {
    throw new Error(
      medidaId === "media-geometrica"
        ? "La media geometrica clasificada requiere marcas de clase mayores que cero."
        : "La media armonica clasificada requiere marcas de clase mayores que cero.",
    );
  }

  return tablaExtendida;
}

function obtenerFilasConFrecuenciaPositiva(
  tablaExtendida: TablaClasificadaExtendida,
) {
  return tablaExtendida.filas.filter((fila) => fila.fi > 0);
}

function tablaExtendidaBase(
  tablaExtendida: TablaClasificadaExtendida,
) {
  return crearTablaDetalle(
    "Tabla clasificada extendida",
    ["Li", "Ls", "xi", "fi", "hi", "pi", "Fi", "Hi", "Pi"],
    tablaExtendida.filas.map((fila) => [
      formatearNumeroConPrecisionFija(
        fila.Li,
        tablaExtendida.precisionIntervalos,
      ),
      formatearNumeroConPrecisionFija(
        fila.Ls,
        tablaExtendida.precisionIntervalos,
      ),
      formatearNumeroCompacto(fila.xi),
      fila.fi,
      formatearNumeroConPrecisionFija(fila.hi, 4),
      formatearPorcentajeResultado(fila.pi, 2),
      fila.Fi,
      formatearNumeroConPrecisionFija(fila.Hi, 4),
      formatearPorcentajeResultado(fila.Pi, 2),
    ]),
  );
}

function calcularMediaAritmeticaNoClasificada(
  datos: number[],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const suma = datos.reduce((acumulado, valor) => acumulado + valor, 0);
  const media = suma / datos.length;

  return {
    valor: media,
    detalle: crearResultadoIndividual(
      "media-aritmetica",
      "no-clasificados",
      formatearNumeroResultado(media, opcionesSalida.decimales),
      "Promedio simple calculado con la suma total dividida entre el numero de datos.",
      `En promedio, el conjunto presenta ${formatearNumeroResultado(media, opcionesSalida.decimales)} unidades por observacion.`,
      [
        {
          titulo: "Numero de datos",
          expresion: `n = ${datos.length}`,
        },
        {
          titulo: "Suma de los datos",
          expresion: `sum(xi) = ${formatearNumeroCompacto(suma)}`,
        },
        {
          titulo: "Aplicacion de la formula",
          expresion: `xbarra = ${formatearNumeroCompacto(suma)} / ${datos.length}`,
          resultado: formatearNumeroResultado(media, opcionesSalida.decimales),
        },
      ],
      [
        crearTablaDetalle(
          "Datos ingresados",
          ["Posicion", "xi"],
          datos.map((valor, indice) => [indice + 1, formatearNumeroCompacto(valor)]),
        ),
      ],
    ),
  };
}

function calcularMediaAritmeticaClasificada(
  tablaExtendida: TablaClasificadaExtendida,
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const sumaXiFi = tablaExtendida.filas.reduce(
    (acumulado, fila) => acumulado + fila.xi * fila.fi,
    0,
  );
  const media = sumaXiFi / tablaExtendida.n;

  return {
    valor: media,
    detalle: crearResultadoIndividual(
      "media-aritmetica",
      "clasificados",
      formatearNumeroResultado(media, opcionesSalida.decimales),
      "Se uso la media para datos clasificados con marcas de clase y frecuencias absolutas.",
      `La media agrupada del conjunto es ${formatearNumeroResultado(media, opcionesSalida.decimales)}.`,
      [
        {
          titulo: "Total de frecuencias",
          expresion: `n = ${tablaExtendida.n}`,
        },
        {
          titulo: "Suma ponderada",
          expresion: `sum(xi * fi) = ${formatearNumeroCompacto(sumaXiFi)}`,
        },
        {
          titulo: "Aplicacion de la formula",
          expresion: `xbarra = ${formatearNumeroCompacto(sumaXiFi)} / ${tablaExtendida.n}`,
          resultado: formatearNumeroResultado(media, opcionesSalida.decimales),
        },
      ],
      [
        crearTablaDetalle(
          "Productos xi * fi",
          ["Li", "Ls", "xi", "fi", "xi * fi"],
          tablaExtendida.filas.map((fila) => [
            formatearNumeroConPrecisionFija(
              fila.Li,
              tablaExtendida.precisionIntervalos,
            ),
            formatearNumeroConPrecisionFija(
              fila.Ls,
              tablaExtendida.precisionIntervalos,
            ),
            formatearNumeroCompacto(fila.xi),
            fila.fi,
            formatearNumeroCompacto(fila.xi * fila.fi),
          ]),
        ),
        tablaExtendidaBase(tablaExtendida),
      ],
    ),
  };
}

function calcularMediaGeometricaNoClasificada(
  datos: number[],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  if (datos.some((valor) => valor <= 0)) {
    throw new Error(
      "La media geometrica carece de sentido para datos negativos o nulos. Todos los valores deben ser mayores que cero.",
    );
  }

  const sumaLogaritmos = datos.reduce(
    (acumulado, valor) => acumulado + Math.log(valor),
    0,
  );
  const media = Math.exp(sumaLogaritmos / datos.length);

  return {
    valor: media,
    detalle: crearResultadoIndividual(
      "media-geometrica",
      "no-clasificados",
      formatearNumeroResultado(media, opcionesSalida.decimales),
      "Se uso una implementacion con logaritmos para conservar precision numerica.",
      `La media geometrica del conjunto es ${formatearNumeroResultado(media, opcionesSalida.decimales)}.`,
      [
        { titulo: "Numero de datos", expresion: `n = ${datos.length}` },
        {
          titulo: "Suma de logaritmos naturales",
          expresion: `sum(ln(xi)) = ${formatearNumeroCompacto(sumaLogaritmos)}`,
        },
        {
          titulo: "Aplicacion de la formula",
          expresion: `xg = exp(${formatearNumeroCompacto(sumaLogaritmos)} / ${datos.length})`,
          resultado: formatearNumeroResultado(media, opcionesSalida.decimales),
        },
      ],
      [
        crearTablaDetalle(
          "Detalle de logaritmos",
          ["Posicion", "xi", "ln(xi)"],
          datos.map((valor, indice) => [
            indice + 1,
            formatearNumeroCompacto(valor),
            formatearNumeroCompacto(Math.log(valor)),
          ]),
        ),
      ],
    ),
  };
}

function calcularMediaGeometricaClasificada(
  tablaExtendida: TablaClasificadaExtendida,
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const filasConFrecuencia = obtenerFilasConFrecuenciaPositiva(tablaExtendida);

  if (filasConFrecuencia.some((fila) => fila.xi <= 0)) {
    throw new Error(
      "La media geometrica clasificada requiere marcas de clase mayores que cero cuando la frecuencia es positiva.",
    );
  }

  const sumaFiLogXi = filasConFrecuencia.reduce(
    (acumulado, fila) => acumulado + fila.fi * Math.log(fila.xi),
    0,
  );
  const media = Math.exp(sumaFiLogXi / tablaExtendida.n);

  return {
    valor: media,
    detalle: crearResultadoIndividual(
      "media-geometrica",
      "clasificados",
      formatearNumeroResultado(media, opcionesSalida.decimales),
      "Se aplico la formula agrupada de la media geometrica usando marcas de clase.",
      `La media geometrica agrupada es ${formatearNumeroResultado(media, opcionesSalida.decimales)}.`,
      [
        { titulo: "Total de frecuencias", expresion: `n = ${tablaExtendida.n}` },
        {
          titulo: "Suma ponderada de logaritmos",
          expresion: `sum(fi * ln(xi)) = ${formatearNumeroCompacto(sumaFiLogXi)}`,
        },
        {
          titulo: "Aplicacion de la formula",
          expresion: `xg = exp(${formatearNumeroCompacto(sumaFiLogXi)} / ${tablaExtendida.n})`,
          resultado: formatearNumeroResultado(media, opcionesSalida.decimales),
        },
      ],
      [
        crearTablaDetalle(
          "Detalle de fi * ln(xi)",
          ["Li", "Ls", "xi", "fi", "ln(xi)", "fi * ln(xi)"],
          tablaExtendida.filas.map((fila) => [
            formatearNumeroConPrecisionFija(
              fila.Li,
              tablaExtendida.precisionIntervalos,
            ),
            formatearNumeroConPrecisionFija(
              fila.Ls,
              tablaExtendida.precisionIntervalos,
            ),
            formatearNumeroCompacto(fila.xi),
            fila.fi,
            fila.fi > 0
              ? formatearNumeroCompacto(Math.log(fila.xi))
              : "No aporta",
            fila.fi > 0
              ? formatearNumeroCompacto(fila.fi * Math.log(fila.xi))
              : "0",
          ]),
        ),
        tablaExtendidaBase(tablaExtendida),
      ],
    ),
  };
}

function calcularMediaArmonicaNoClasificada(
  datos: number[],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  if (datos.some((valor) => valor <= 0)) {
    throw new Error(
      "La media armonica requiere valores mayores que cero para evitar divisiones invalidas.",
    );
  }

  const sumaInversos = datos.reduce((acumulado, valor) => acumulado + 1 / valor, 0);
  const media = datos.length / sumaInversos;

  return {
    valor: media,
    detalle: crearResultadoIndividual(
      "media-armonica",
      "no-clasificados",
      formatearNumeroResultado(media, opcionesSalida.decimales),
      "Se uso la suma de inversos para obtener la media armonica.",
      `La media armonica del conjunto es ${formatearNumeroResultado(media, opcionesSalida.decimales)}.`,
      [
        { titulo: "Numero de datos", expresion: `n = ${datos.length}` },
        {
          titulo: "Suma de inversos",
          expresion: `sum(1/xi) = ${formatearNumeroCompacto(sumaInversos)}`,
        },
        {
          titulo: "Aplicacion de la formula",
          expresion: `xh = ${datos.length} / ${formatearNumeroCompacto(sumaInversos)}`,
          resultado: formatearNumeroResultado(media, opcionesSalida.decimales),
        },
      ],
      [
        crearTablaDetalle(
          "Detalle de inversos",
          ["Posicion", "xi", "1 / xi"],
          datos.map((valor, indice) => [
            indice + 1,
            formatearNumeroCompacto(valor),
            formatearNumeroCompacto(1 / valor),
          ]),
        ),
      ],
    ),
  };
}

function calcularMediaArmonicaClasificada(
  tablaExtendida: TablaClasificadaExtendida,
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const filasConFrecuencia = obtenerFilasConFrecuenciaPositiva(tablaExtendida);

  if (filasConFrecuencia.some((fila) => fila.xi <= 0)) {
    throw new Error(
      "La media armonica clasificada requiere marcas de clase mayores que cero cuando la frecuencia es positiva.",
    );
  }

  const sumaFiEntreXi = filasConFrecuencia.reduce(
    (acumulado, fila) => acumulado + fila.fi / fila.xi,
    0,
  );
  const media = tablaExtendida.n / sumaFiEntreXi;

  return {
    valor: media,
    detalle: crearResultadoIndividual(
      "media-armonica",
      "clasificados",
      formatearNumeroResultado(media, opcionesSalida.decimales),
      "Se aplico la media armonica agrupada usando fi / xi.",
      `La media armonica agrupada es ${formatearNumeroResultado(media, opcionesSalida.decimales)}.`,
      [
        { titulo: "Total de frecuencias", expresion: `n = ${tablaExtendida.n}` },
        {
          titulo: "Suma de fi / xi",
          expresion: `sum(fi / xi) = ${formatearNumeroCompacto(sumaFiEntreXi)}`,
        },
        {
          titulo: "Aplicacion de la formula",
          expresion: `xh = ${tablaExtendida.n} / ${formatearNumeroCompacto(sumaFiEntreXi)}`,
          resultado: formatearNumeroResultado(media, opcionesSalida.decimales),
        },
      ],
      [
        crearTablaDetalle(
          "Detalle de fi / xi",
          ["Li", "Ls", "xi", "fi", "fi / xi"],
          tablaExtendida.filas.map((fila) => [
            formatearNumeroConPrecisionFija(
              fila.Li,
              tablaExtendida.precisionIntervalos,
            ),
            formatearNumeroConPrecisionFija(
              fila.Ls,
              tablaExtendida.precisionIntervalos,
            ),
            formatearNumeroCompacto(fila.xi),
            fila.fi,
            fila.fi > 0
              ? formatearNumeroCompacto(fila.fi / fila.xi)
              : "0",
          ]),
        ),
        tablaExtendidaBase(tablaExtendida),
      ],
    ),
  };
}

function calcularMedianaNoClasificada(
  datosOrdenados: number[],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const n = datosOrdenados.length;
  const esPar = n % 2 === 0;
  const posicionBase = esPar ? n / 2 : (n + 1) / 2;
  const mediana = esPar
    ? (datosOrdenados[n / 2 - 1] + datosOrdenados[n / 2]) / 2
    : datosOrdenados[(n - 1) / 2];

  return {
    valor: mediana,
    detalle: crearResultadoIndividual(
      "mediana",
      "no-clasificados",
      formatearNumeroResultado(mediana, opcionesSalida.decimales),
      esPar
        ? "Como n es par, la mediana es el promedio de los dos valores centrales."
        : "Como n es impar, la mediana coincide con el valor central ordenado.",
      `El valor central de la distribucion es ${formatearNumeroResultado(mediana, opcionesSalida.decimales)}.`,
      [
        { titulo: "Numero de datos", expresion: `n = ${n}` },
        {
          titulo: "Tipo de cantidad de datos",
          expresion: esPar ? "n es par" : "n es impar",
        },
        esPar
          ? {
              titulo: "Posiciones centrales",
              expresion: `n/2 = ${n / 2} y (n/2) + 1 = ${n / 2 + 1}`,
              resultado: formatearNumeroResultado(mediana, opcionesSalida.decimales),
            }
          : {
              titulo: "Posicion central",
              expresion: `(n + 1) / 2 = ${posicionBase}`,
              resultado: formatearNumeroResultado(mediana, opcionesSalida.decimales),
            },
      ],
      [
        crearTablaDetalle(
          "Datos ordenados",
          ["Posicion", "xi"],
          datosOrdenados.map((valor, indice) => [
            indice + 1,
            formatearNumeroCompacto(valor),
          ]),
        ),
      ],
    ),
  };
}

function obtenerFilaPorClave(
  tablaExtendida: TablaClasificadaExtendida,
  clave: number,
) {
  const indice = tablaExtendida.filas.findIndex((fila) => fila.Fi >= clave);

  if (indice < 0) {
    throw new Error("No se pudo ubicar la clase correspondiente en la tabla.");
  }

  const fila = tablaExtendida.filas[indice];
  const FiAnterior = indice > 0 ? tablaExtendida.filas[indice - 1].Fi : 0;

  return {
    fila,
    FiAnterior,
    indice,
  };
}

function calcularMedianaClasificada(
  tablaExtendida: TablaClasificadaExtendida,
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const clave = tablaExtendida.n / 2;
  const { fila, FiAnterior } = obtenerFilaPorClave(tablaExtendida, clave);
  const mediana =
    fila.Li + (((clave - FiAnterior) * fila.amplitud) / fila.fi);

  return {
    valor: mediana,
    detalle: crearResultadoIndividual(
      "mediana",
      "clasificados",
      formatearNumeroResultado(mediana, opcionesSalida.decimales),
      "Se ubico la clase mediana mediante la clave n/2 y luego se aplico la formula del docente.",
      `La mediana agrupada es ${formatearNumeroResultado(mediana, opcionesSalida.decimales)}.`,
      [
        { titulo: "Total de frecuencias", expresion: `n = ${tablaExtendida.n}` },
        { titulo: "Clave mediana", expresion: `n/2 = ${formatearNumeroCompacto(clave)}` },
        {
          titulo: "Clase mediana",
          expresion: `Li = ${formatearNumeroCompacto(fila.Li)}, Fi-1 = ${FiAnterior}, t = ${formatearNumeroCompacto(fila.amplitud)}, fi = ${fila.fi}`,
        },
        {
          titulo: "Aplicacion de la formula",
          expresion: `m = ${formatearNumeroCompacto(fila.Li)} + ((${formatearNumeroCompacto(clave)} - ${FiAnterior}) * ${formatearNumeroCompacto(fila.amplitud)}) / ${fila.fi}`,
          resultado: formatearNumeroResultado(mediana, opcionesSalida.decimales),
        },
      ],
      [
        crearTablaDetalle(
          "Ubicacion de la clase mediana",
          ["Li", "Ls", "fi", "Fi", "Referencia"],
          tablaExtendida.filas.map((filaActual) => [
            formatearNumeroConPrecisionFija(
              filaActual.Li,
              tablaExtendida.precisionIntervalos,
            ),
            formatearNumeroConPrecisionFija(
              filaActual.Ls,
              tablaExtendida.precisionIntervalos,
            ),
            filaActual.fi,
            filaActual.Fi,
            filaActual === fila ? "Clase mediana" : "",
          ]),
        ),
        tablaExtendidaBase(tablaExtendida),
      ],
    ),
  };
}

function calcularModaNoClasificada(
  datos: number[],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const mapaFrecuencias = new Map<number, number>();

  datos.forEach((valor) => {
    mapaFrecuencias.set(valor, (mapaFrecuencias.get(valor) ?? 0) + 1);
  });

  const frecuenciaMaxima = Math.max(...mapaFrecuencias.values());
  const modas = Array.from(mapaFrecuencias.entries())
    .filter(([, frecuencia]) => frecuencia === frecuenciaMaxima)
    .map(([valor]) => valor)
    .sort((a, b) => a - b);

  const esAmodal = frecuenciaMaxima === 1;
  const valorPrincipal = esAmodal
    ? "No existe moda unica"
    : modas.map((valor) => formatearNumeroResultado(valor, opcionesSalida.decimales)).join(", ");

  const observacion = esAmodal
    ? "Todos los valores aparecen una sola vez, por eso la distribucion es amodal."
    : modas.length === 1
      ? "La distribucion es unimodal."
      : `La distribucion es multimodal y presenta ${modas.length} modas.`;

  return {
    valor: modas[0] ?? null,
    detalle: crearResultadoIndividual(
      "moda",
      "no-clasificados",
      valorPrincipal,
      observacion,
      esAmodal
        ? "No se identifica una moda dominante en la muestra."
        : `El o los valores mas frecuentes son ${valorPrincipal}.`,
      [
        {
          titulo: "Frecuencia maxima detectada",
          expresion: `fi maxima = ${frecuenciaMaxima}`,
        },
        {
          titulo: "Conclusion",
          resultado: valorPrincipal,
          descripcion: observacion,
        },
      ],
      [
        crearTablaDetalle(
          "Frecuencia por valor",
          ["Valor", "fi"],
          Array.from(mapaFrecuencias.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([valor, frecuencia]) => [
              formatearNumeroCompacto(valor),
              frecuencia,
            ]),
        ),
      ],
    ),
  };
}

function calcularModaClasificada(
  tablaExtendida: TablaClasificadaExtendida,
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const frecuenciaMaxima = Math.max(...tablaExtendida.filas.map((fila) => fila.fi));
  const clasesModales = tablaExtendida.filas.filter(
    (fila) => fila.fi === frecuenciaMaxima,
  );

  if (clasesModales.length !== 1) {
    throw new Error(
      "La moda clasificada requiere una sola clase modal con frecuencia maxima.",
    );
  }

  const filaModal = clasesModales[0];
  const indiceModal = tablaExtendida.filas.findIndex((fila) => fila === filaModal);
  const frecuenciaAnterior =
    indiceModal > 0 ? tablaExtendida.filas[indiceModal - 1].fi : 0;
  const frecuenciaPosterior =
    indiceModal < tablaExtendida.filas.length - 1
      ? tablaExtendida.filas[indiceModal + 1].fi
      : 0;
  const d1 = filaModal.fi - frecuenciaAnterior;
  const d2 = filaModal.fi - frecuenciaPosterior;

  if (d1 + d2 <= 0) {
    throw new Error(
      "No se puede aplicar la formula modal porque d1 + d2 debe ser mayor que cero.",
    );
  }

  const moda = filaModal.Li + (filaModal.amplitud * d1) / (d1 + d2);

  return {
    valor: moda,
    detalle: crearResultadoIndividual(
      "moda",
      "clasificados",
      formatearNumeroResultado(moda, opcionesSalida.decimales),
      "Se identifico la clase modal y luego se aplico la formula del docente con d1 y d2.",
      `La moda agrupada es ${formatearNumeroResultado(moda, opcionesSalida.decimales)}.`,
      [
        {
          titulo: "Clase modal",
          expresion: `Li = ${formatearNumeroCompacto(filaModal.Li)}, fi = ${filaModal.fi}, t = ${formatearNumeroCompacto(filaModal.amplitud)}`,
        },
        {
          titulo: "Diferencias modales",
          expresion: `d1 = ${d1}, d2 = ${d2}`,
        },
        {
          titulo: "Aplicacion de la formula",
          expresion: `mo = ${formatearNumeroCompacto(filaModal.Li)} + (${formatearNumeroCompacto(filaModal.amplitud)} * ${d1}) / (${d1} + ${d2})`,
          resultado: formatearNumeroResultado(moda, opcionesSalida.decimales),
        },
      ],
      [
        crearTablaDetalle(
          "Ubicacion de la clase modal",
          ["Li", "Ls", "fi", "d1", "d2", "Referencia"],
          tablaExtendida.filas.map((filaActual) => [
            formatearNumeroConPrecisionFija(
              filaActual.Li,
              tablaExtendida.precisionIntervalos,
            ),
            formatearNumeroConPrecisionFija(
              filaActual.Ls,
              tablaExtendida.precisionIntervalos,
            ),
            filaActual.fi,
            filaActual === filaModal ? d1 : "",
            filaActual === filaModal ? d2 : "",
            filaActual === filaModal ? "Clase modal" : "",
          ]),
        ),
        tablaExtendidaBase(tablaExtendida),
      ],
    ),
  };
}

function interpolarEnDatosOrdenados(
  datosOrdenados: number[],
  posicion: number,
) {
  const cantidadDatos = datosOrdenados.length;

  if (cantidadDatos === 0) {
    throw new Error("No existen datos ordenados para interpolar.");
  }

  if (posicion <= 1) {
    return {
      valor: datosOrdenados[0],
      esInterpolado: false,
      indiceInferior: 1,
      indiceSuperior: 1,
      valorInferior: datosOrdenados[0],
      valorSuperior: datosOrdenados[0],
      fraccion: 0,
      tipoAjuste: "limite-inferior" as const,
    };
  }

  if (posicion >= cantidadDatos) {
    return {
      valor: datosOrdenados[cantidadDatos - 1],
      esInterpolado: false,
      indiceInferior: cantidadDatos,
      indiceSuperior: cantidadDatos,
      valorInferior: datosOrdenados[cantidadDatos - 1],
      valorSuperior: datosOrdenados[cantidadDatos - 1],
      fraccion: 0,
      tipoAjuste: "limite-superior" as const,
    };
  }

  if (Number.isInteger(posicion)) {
    return {
      valor: datosOrdenados[posicion - 1],
      esInterpolado: false,
      indiceInferior: posicion,
      indiceSuperior: posicion,
      valorInferior: datosOrdenados[posicion - 1],
      valorSuperior: datosOrdenados[posicion - 1],
      fraccion: 0,
      tipoAjuste: "exacto" as const,
    };
  }

  const indiceInferior = Math.floor(posicion);
  const indiceSuperior = Math.ceil(posicion);
  const valorInferior = datosOrdenados[indiceInferior - 1];
  const valorSuperior = datosOrdenados[indiceSuperior - 1];
  const fraccion = posicion - indiceInferior;
  const valor =
    valorInferior + fraccion * (valorSuperior - valorInferior);

  return {
    valor,
    esInterpolado: true,
    indiceInferior,
    indiceSuperior,
    valorInferior,
    valorSuperior,
    fraccion,
    tipoAjuste: "interpolado" as const,
  };
}

function calcularCuantilNoClasificado(
  medidaId: "cuartiles" | "deciles" | "percentiles",
  datosOrdenados: number[],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const valorCuantil = obtenerValorCuantilValido(
    medidaId,
    obtenerValorCuantilSegunMedida(medidaId, opcionesSalida),
  ) as number;
  const divisor = medidaId === "cuartiles" ? 4 : medidaId === "deciles" ? 10 : 100;
  const posicion = (valorCuantil * (datosOrdenados.length + 1)) / divisor;
  const interpolacion = interpolarEnDatosOrdenados(datosOrdenados, posicion);
  const etiqueta = obtenerEtiquetaResultadoCuantil(measureIdMap(medidaId), valorCuantil);
  const textoResultado = formatearNumeroResultado(
    interpolacion.valor,
    opcionesSalida.decimales,
  );
  const textoPosicion = formatearNumeroCompacto(posicion);
  const textoValorInferior = formatearNumeroCompacto(interpolacion.valorInferior);
  const textoValorSuperior = formatearNumeroCompacto(interpolacion.valorSuperior);

  return {
    valor: interpolacion.valor,
    detalle: crearResultadoIndividual(
      medidaId,
      "no-clasificados",
      textoResultado,
      interpolacion.tipoAjuste === "interpolado"
        ? "La posicion no fue entera, por eso se aplico interpolacion lineal dentro del rango de los datos ordenados."
        : interpolacion.tipoAjuste === "limite-inferior"
          ? "La posicion calculada quedo antes del primer dato, por eso se tomo el limite inferior observado."
          : interpolacion.tipoAjuste === "limite-superior"
            ? "La posicion calculada supero el ultimo dato, por eso se tomo el limite superior observado."
            : "La posicion fue entera y se tomo directamente el dato ordenado.",
      `${etiqueta} vale ${textoResultado}.`,
      [
        { titulo: "Numero de datos", expresion: `n = ${datosOrdenados.length}` },
        {
          titulo: "Posicion del cuantil",
          expresion: `${etiqueta} posicion = ${valorCuantil} * (${datosOrdenados.length} + 1) / ${divisor} = ${textoPosicion}`,
        },
        interpolacion.tipoAjuste === "interpolado"
          ? {
              titulo: "Interpolacion lineal",
              expresion: `${etiqueta} = ${textoValorInferior} + ${formatearNumeroCompacto(interpolacion.fraccion)} * (${textoValorSuperior} - ${textoValorInferior})`,
              descripcion: `Se interpola entre las posiciones ${interpolacion.indiceInferior} y ${interpolacion.indiceSuperior}, por lo que el resultado queda dentro del rango [${textoValorInferior}, ${textoValorSuperior}].`,
              resultado: textoResultado,
            }
          : interpolacion.tipoAjuste === "limite-inferior"
            ? {
                titulo: "Ajuste al limite inferior",
                expresion: `La posicion ${textoPosicion} es menor o igual que 1, entonces se toma el primer dato ordenado.`,
                resultado: textoResultado,
              }
            : interpolacion.tipoAjuste === "limite-superior"
              ? {
                  titulo: "Ajuste al limite superior",
                  expresion: `La posicion ${textoPosicion} es mayor o igual que ${datosOrdenados.length}, entonces se toma el ultimo dato ordenado.`,
                  resultado: textoResultado,
                }
          : {
              titulo: "Dato exacto",
              expresion: `Posicion ${interpolacion.indiceInferior}`,
              resultado: textoResultado,
            },
      ],
      [
        crearTablaDetalle(
          "Datos ordenados",
          ["Posicion", "xi"],
          datosOrdenados.map((valor, indice) => [
            indice + 1,
            formatearNumeroCompacto(valor),
          ]),
        ),
      ],
    ),
  };
}

function measureIdMap(
  medidaId: "cuartiles" | "deciles" | "percentiles",
): "cuartiles" | "deciles" | "percentiles" {
  return medidaId;
}

function esMedidaCuantil(
  medidaId: Exclude<IdentificadorMedidaPosicion, "medidas-posicion-todas">,
): medidaId is "cuartiles" | "deciles" | "percentiles" {
  return (
    medidaId === "cuartiles" ||
    medidaId === "deciles" ||
    medidaId === "percentiles"
  );
}

function calcularCuantilClasificado(
  medidaId: "cuartiles" | "deciles" | "percentiles",
  tablaExtendida: TablaClasificadaExtendida,
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const valorCuantil = obtenerValorCuantilValido(
    medidaId,
    obtenerValorCuantilSegunMedida(medidaId, opcionesSalida),
  ) as number;
  const divisor = medidaId === "cuartiles" ? 4 : medidaId === "deciles" ? 10 : 100;
  const clave = (valorCuantil * tablaExtendida.n) / divisor;
  const { fila, FiAnterior } = obtenerFilaPorClave(tablaExtendida, clave);
  const resultadoSinAjuste =
    fila.Li + (((clave - FiAnterior) * fila.amplitud) / fila.fi);
  const resultado = Math.min(fila.Ls, Math.max(fila.Li, resultadoSinAjuste));
  const etiqueta = obtenerEtiquetaResultadoCuantil(measureIdMap(medidaId), valorCuantil);

  return {
    valor: resultado,
    detalle: crearResultadoIndividual(
      medidaId,
      "clasificados",
      formatearNumeroResultado(resultado, opcionesSalida.decimales),
      "Se ubico la clase correspondiente con la clave del cuantil y luego se aplico la formula del docente.",
      `${etiqueta} vale ${formatearNumeroResultado(resultado, opcionesSalida.decimales)}.`,
      [
        { titulo: "Total de frecuencias", expresion: `n = ${tablaExtendida.n}` },
        {
          titulo: "Clave del cuantil",
          expresion: `${etiqueta} clave = (${valorCuantil} * ${tablaExtendida.n}) / ${divisor} = ${formatearNumeroCompacto(clave)}`,
        },
        {
          titulo: "Clase correspondiente",
          expresion: `Li = ${formatearNumeroCompacto(fila.Li)}, Fi-1 = ${FiAnterior}, t = ${formatearNumeroCompacto(fila.amplitud)}, fi = ${fila.fi}`,
        },
        {
          titulo: "Aplicacion de la formula",
          expresion: `${etiqueta} = ${formatearNumeroCompacto(fila.Li)} + ((${formatearNumeroCompacto(clave)} - ${FiAnterior}) * ${formatearNumeroCompacto(fila.amplitud)}) / ${fila.fi}`,
          resultado: formatearNumeroResultado(resultado, opcionesSalida.decimales),
        },
      ],
      [
        crearTablaDetalle(
          "Ubicacion de la clase del cuantil",
          ["Li", "Ls", "fi", "Fi", "Referencia"],
          tablaExtendida.filas.map((filaActual) => [
            formatearNumeroConPrecisionFija(
              filaActual.Li,
              tablaExtendida.precisionIntervalos,
            ),
            formatearNumeroConPrecisionFija(
              filaActual.Ls,
              tablaExtendida.precisionIntervalos,
            ),
            filaActual.fi,
            filaActual.Fi,
            filaActual === fila ? `Clase de ${etiqueta}` : "",
          ]),
        ),
        tablaExtendidaBase(tablaExtendida),
      ],
    ),
  };
}

function obtenerCalculadoresNoClasificados(
  datos: number[],
  datosOrdenados: number[],
  medidaId: IdentificadorMedidaPosicion,
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  switch (medidaId) {
    case "media-aritmetica":
      return calcularMediaAritmeticaNoClasificada(datos, opcionesSalida);
    case "media-geometrica":
      return calcularMediaGeometricaNoClasificada(datos, opcionesSalida);
    case "media-armonica":
      return calcularMediaArmonicaNoClasificada(datos, opcionesSalida);
    case "mediana":
      return calcularMedianaNoClasificada(datosOrdenados, opcionesSalida);
    case "moda":
      return calcularModaNoClasificada(datos, opcionesSalida);
    case "cuartiles":
    case "deciles":
    case "percentiles":
      return calcularCuantilNoClasificado(
        medidaId,
        datosOrdenados,
        opcionesSalida,
      );
    default:
      throw new Error("La medida solicitada no esta disponible.");
  }
}

function obtenerCalculadoresClasificados(
  tablaExtendida: TablaClasificadaExtendida,
  medidaId: IdentificadorMedidaPosicion,
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  switch (medidaId) {
    case "media-aritmetica":
      return calcularMediaAritmeticaClasificada(tablaExtendida, opcionesSalida);
    case "media-geometrica":
      return calcularMediaGeometricaClasificada(tablaExtendida, opcionesSalida);
    case "media-armonica":
      return calcularMediaArmonicaClasificada(tablaExtendida, opcionesSalida);
    case "mediana":
      return calcularMedianaClasificada(tablaExtendida, opcionesSalida);
    case "moda":
      return calcularModaClasificada(tablaExtendida, opcionesSalida);
    case "cuartiles":
    case "deciles":
    case "percentiles":
      return calcularCuantilClasificado(
        medidaId,
        tablaExtendida,
        opcionesSalida,
      );
    default:
      throw new Error("La medida solicitada no esta disponible.");
  }
}

export function calcularMedidaNoClasificada(
  medidaId: Exclude<IdentificadorMedidaPosicion, "medidas-posicion-todas">,
  matrizDatos: string[][],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
): ResultadoMedidaPosicion {
  const { datosIngresados, datosOrdenados } = validarDatosNoClasificados(
    matrizDatos,
    medidaId,
  );

  return obtenerCalculadoresNoClasificados(
    datosIngresados,
    datosOrdenados,
    medidaId,
    opcionesSalida,
  ).detalle;
}

export function calcularMedidaClasificada(
  medidaId: Exclude<IdentificadorMedidaPosicion, "medidas-posicion-todas">,
  filasEntrada: FilaTablaClasificadaEntrada[],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
): ResultadoMedidaPosicion {
  const tablaExtendida = validarDatosClasificados(filasEntrada, medidaId);

  return obtenerCalculadoresClasificados(
    tablaExtendida,
    medidaId,
    opcionesSalida,
  ).detalle;
}

function calcularResumenTodosNoClasificados(
  matrizDatos: string[][],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const { datosIngresados, datosOrdenados } = validarDatosNoClasificados(
    matrizDatos,
    "media-aritmetica",
  );

  const medidas: Array<Exclude<IdentificadorMedidaPosicion, "medidas-posicion-todas">> = [
    "media-aritmetica",
    "media-geometrica",
    "media-armonica",
    "mediana",
    "moda",
    "cuartiles",
    "deciles",
    "percentiles",
  ];

  const resumen: ResultadoResumenTodos[] = medidas.map((medidaId) => {
    const etiquetaMedida = esMedidaCuantil(medidaId)
      ? obtenerEtiquetaResultadoCuantil(
          measureIdMap(medidaId),
          obtenerValorCuantilSegunMedida(medidaId, opcionesSalida),
        )
      : obtenerConfiguracionMedidaPosicion(medidaId).titulo;

    try {
      const opcionesAjustadas: OpcionesSalidaMedidaPosicion = {
        ...opcionesSalida,
      };
      const resultado = obtenerCalculadoresNoClasificados(
        datosIngresados,
        datosOrdenados,
        medidaId,
        opcionesAjustadas,
      ).detalle;

      return {
        medida: esMedidaCuantil(medidaId) ? etiquetaMedida : resultado.titulo,
        resultado: resultado.valorPrincipal,
        observacion: resultado.observacion,
      };
    } catch (error) {
      return {
        medida: etiquetaMedida,
        resultado: "No disponible",
        observacion:
          error instanceof Error
            ? error.message
            : "No se pudo calcular esta medida.",
      };
    }
  });

  return {
    tipo: "todos" as const,
    detalle: {
      medidaId: "medidas-posicion-todas" as const,
      titulo: "Todas las medidas de posicion",
      tipoDatos: "no-clasificados" as const,
      resumen,
      observacionGeneral:
        "Las medidas invalidas por condiciones especiales se reportan sin detener el resumen completo.",
    },
  };
}

function calcularResumenTodosClasificados(
  filasEntrada: FilaTablaClasificadaEntrada[],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
) {
  const tablaExtendida = validarDatosClasificados(
    filasEntrada,
    "media-aritmetica",
  );

  const medidas: Array<Exclude<IdentificadorMedidaPosicion, "medidas-posicion-todas">> = [
    "media-aritmetica",
    "media-geometrica",
    "media-armonica",
    "mediana",
    "moda",
    "cuartiles",
    "deciles",
    "percentiles",
  ];

  const resumen: ResultadoResumenTodos[] = medidas.map((medidaId) => {
    const etiquetaMedida = esMedidaCuantil(medidaId)
      ? obtenerEtiquetaResultadoCuantil(
          measureIdMap(medidaId),
          obtenerValorCuantilSegunMedida(medidaId, opcionesSalida),
        )
      : obtenerConfiguracionMedidaPosicion(medidaId).titulo;

    try {
      const opcionesAjustadas: OpcionesSalidaMedidaPosicion = {
        ...opcionesSalida,
      };
      const resultado = obtenerCalculadoresClasificados(
        tablaExtendida,
        medidaId,
        opcionesAjustadas,
      ).detalle;

      return {
        medida: esMedidaCuantil(medidaId) ? etiquetaMedida : resultado.titulo,
        resultado: resultado.valorPrincipal,
        observacion: resultado.observacion,
      };
    } catch (error) {
      return {
        medida: etiquetaMedida,
        resultado: "No disponible",
        observacion:
          error instanceof Error
            ? error.message
            : "No se pudo calcular esta medida.",
      };
    }
  });

  return {
    tipo: "todos" as const,
    detalle: {
      medidaId: "medidas-posicion-todas" as const,
      titulo: "Todas las medidas de posicion",
      tipoDatos: "clasificados" as const,
      resumen,
      observacionGeneral:
        "El resumen usa la tabla clasificada extendida y muestra observaciones cuando alguna medida no aplica.",
    },
  };
}

export function calcularModuloMedidasPosicion(
  medidaId: IdentificadorMedidaPosicion,
  tipoDatos: TipoDatosMedidaPosicion,
  matrizNoClasificada: string[][],
  filasClasificadas: FilaTablaClasificadaEntrada[],
  opcionesSalida: OpcionesSalidaMedidaPosicion,
): ResultadoCalculoMedidasPosicion {
  if (medidaId === "medidas-posicion-todas") {
    return tipoDatos === "no-clasificados"
      ? calcularResumenTodosNoClasificados(matrizNoClasificada, opcionesSalida)
      : calcularResumenTodosClasificados(filasClasificadas, opcionesSalida);
  }

  const detalle =
    tipoDatos === "no-clasificados"
      ? calcularMedidaNoClasificada(medidaId, matrizNoClasificada, opcionesSalida)
      : calcularMedidaClasificada(medidaId, filasClasificadas, opcionesSalida);

  return {
    tipo: "individual",
    detalle,
  };
}
