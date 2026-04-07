import type {
  ConfiguracionDistribucionArbitraria,
  IntervaloDistribucionArbitraria,
  ResultadoDistribucionArbitraria,
} from "@/modulos/distribucion-arbitraria/tipos";

function potenciaPrecision(precision: number): number {
  return precision <= 0 ? 1 : 10 ** precision;
}

function redondearNumero(valor: number, precision: number): number {
  return Number(valor.toFixed(Math.max(precision, 4)));
}

function convertirAUnidades(valor: number, escala: number): number {
  return Math.round(valor * escala);
}

function convertirDesdeUnidades(valor: number, escala: number, precision: number) {
  return redondearNumero(valor / escala, precision);
}

function redondearHaciaArribaAUnidades(valor: number, escala: number): number {
  return Math.ceil(valor * escala - 1e-9);
}

function aRomano(valor: number): string {
  if (!Number.isInteger(valor) || valor <= 0 || valor >= 4000) {
    return `${valor}`;
  }

  const simbolos: Array<[number, string]> = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];

  let restante = valor;
  let resultado = "";

  simbolos.forEach(([magnitud, simbolo]) => {
    while (restante >= magnitud) {
      resultado += simbolo;
      restante -= magnitud;
    }
  });

  return resultado;
}

export function calcularDistribucionArbitraria(
  configuracion: ConfiguracionDistribucionArbitraria,
): ResultadoDistribucionArbitraria {
  const { datos, precision, noPermitirNegativos } = configuracion;
  const k = Math.floor(configuracion.k);

  if (datos.length < 14) {
    throw new Error("Se necesitan al menos 14 datos para esta tecnica.");
  }

  if (!Number.isInteger(k) || k <= 0) {
    throw new Error("k debe ser un numero entero positivo.");
  }

  const escala = potenciaPrecision(precision);
  const datosOrdenados = [...datos].sort((a, b) => a - b);
  const datosUnidades = datosOrdenados.map((dato) => convertirAUnidades(dato, escala));
  const dUnidades = Math.min(...datosUnidades);
  const DUnidades = Math.max(...datosUnidades);
  const cUnidades = 1;
  const longitudAlcanceUnidades = DUnidades - dUnidades + cUnidades;
  const tBruto = redondearNumero(
    longitudAlcanceUnidades / escala / k,
    Math.max(precision + 4, 6),
  );
  const tAjustadoUnidades =
    configuracion.tManual !== null && configuracion.tManual !== undefined
      ? redondearHaciaArribaAUnidades(configuracion.tManual, escala)
      : Math.ceil(longitudAlcanceUnidades / k);

  if (tAjustadoUnidades <= 0) {
    throw new Error("El tamaño de clase calculado no es valido.");
  }

  const coberturaUnidades = tAjustadoUnidades * k;
  if (coberturaUnidades < longitudAlcanceUnidades) {
    throw new Error(
      "El tamaño de clase elegido no cubre todo el alcance. Ajusta k o aumenta t.",
    );
  }

  const correccionUnidades = coberturaUnidades - longitudAlcanceUnidades;
  const mitadInferior = Math.floor(correccionUnidades / 2);
  const ajusteInferiorMaximoUnidades = noPermitirNegativos
    ? Math.min(correccionUnidades, Math.max(0, dUnidades))
    : correccionUnidades;
  const ajusteInferiorMinimoUnidades = 0;
  const ajusteInferiorPredeterminadoUnidades = Math.min(
    ajusteInferiorMaximoUnidades,
    mitadInferior,
  );
  const ajusteSuperiorPredeterminadoUnidades =
    correccionUnidades - ajusteInferiorPredeterminadoUnidades;

  let ajusteInferiorUnidades = ajusteInferiorPredeterminadoUnidades;
  if (
    configuracion.ajusteInferiorPreferido !== null &&
    configuracion.ajusteInferiorPreferido !== undefined
  ) {
    const ajustePreferidoUnidades = convertirAUnidades(
      configuracion.ajusteInferiorPreferido,
      escala,
    );
    ajusteInferiorUnidades = Math.min(
      ajusteInferiorMaximoUnidades,
      Math.max(ajusteInferiorMinimoUnidades, ajustePreferidoUnidades),
    );
  }

  const ajusteSuperiorUnidades = correccionUnidades - ajusteInferiorUnidades;

  const minimoCorregidoUnidades = dUnidades - ajusteInferiorUnidades;
  const maximoCorregidoUnidades = DUnidades + ajusteSuperiorUnidades;
  const ultimoLimiteSuperiorUnidades = minimoCorregidoUnidades + coberturaUnidades;
  const intervalos: IntervaloDistribucionArbitraria[] = [];
  let acumuladoFi = 0;

  for (let indice = 0; indice < k; indice += 1) {
    const limiteInferiorUnidades =
      minimoCorregidoUnidades + indice * tAjustadoUnidades;
    const limiteSuperiorUnidades =
      limiteInferiorUnidades + tAjustadoUnidades;
    const fi = datosUnidades.filter(
      (dato) =>
        dato >= limiteInferiorUnidades && dato < limiteSuperiorUnidades,
    ).length;
    acumuladoFi += fi;
    const hi = fi / datos.length;
    const Hi = acumuladoFi / datos.length;

    intervalos.push({
      indice: indice + 1,
      limiteInferior: convertirDesdeUnidades(
        limiteInferiorUnidades,
        escala,
        precision,
      ),
      limiteSuperior: convertirDesdeUnidades(
        limiteSuperiorUnidades,
        escala,
        precision,
      ),
      fi,
      conteo: aRomano(fi),
      hi,
      pi: hi * 100,
      Fi: acumuladoFi,
      Hi,
      Pi: Hi * 100,
    });
  }

  return {
    datosOrdenados,
    n: datos.length,
    d: convertirDesdeUnidades(dUnidades, escala, precision),
    D: convertirDesdeUnidades(DUnidades, escala, precision),
    precision,
    c: convertirDesdeUnidades(cUnidades, escala, precision),
    alcance: [
      convertirDesdeUnidades(dUnidades, escala, precision),
      convertirDesdeUnidades(DUnidades, escala, precision),
    ],
    longitudAlcance: convertirDesdeUnidades(
      longitudAlcanceUnidades,
      escala,
      precision,
    ),
    k,
    tBruto,
    tAjustado: convertirDesdeUnidades(tAjustadoUnidades, escala, precision),
    tManualAplicado:
      configuracion.tManual !== null && configuracion.tManual !== undefined,
    cobertura: convertirDesdeUnidades(coberturaUnidades, escala, precision),
    correccion: convertirDesdeUnidades(correccionUnidades, escala, precision),
    unidadesCorreccion: correccionUnidades,
    ajusteInferior: convertirDesdeUnidades(
      ajusteInferiorUnidades,
      escala,
      precision,
    ),
    ajusteSuperior: convertirDesdeUnidades(
      ajusteSuperiorUnidades,
      escala,
      precision,
    ),
    ajusteInferiorPredeterminado: convertirDesdeUnidades(
      ajusteInferiorPredeterminadoUnidades,
      escala,
      precision,
    ),
    ajusteSuperiorPredeterminado: convertirDesdeUnidades(
      ajusteSuperiorPredeterminadoUnidades,
      escala,
      precision,
    ),
    ajusteInferiorMinimo: convertirDesdeUnidades(
      ajusteInferiorMinimoUnidades,
      escala,
      precision,
    ),
    ajusteInferiorMaximo: convertirDesdeUnidades(
      ajusteInferiorMaximoUnidades,
      escala,
      precision,
    ),
    minimoCorregido: convertirDesdeUnidades(
      minimoCorregidoUnidades,
      escala,
      precision,
    ),
    maximoCorregido: convertirDesdeUnidades(
      maximoCorregidoUnidades,
      escala,
      precision,
    ),
    ultimoLimiteSuperior: convertirDesdeUnidades(
      ultimoLimiteSuperiorUnidades,
      escala,
      precision,
    ),
    noPermitirNegativos,
    intervalos,
  };
}
