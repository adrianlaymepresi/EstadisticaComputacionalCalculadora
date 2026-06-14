import {
  ALTO_MINIMO_NODO_ARBOL,
  ANCHO_BASE_NODO_ARBOL,
  ANCHO_MAXIMO_NODO_ARBOL,
  ANCHO_MINIMO_NODO_ARBOL,
  LINEA_ALTURA_ARBOL,
  PADDING_NODO_ARBOL,
  SEPARACION_HORIZONTAL_ARBOL,
  SEPARACION_VERTICAL_CAUSAS,
  SEPARACION_VERTICAL_EFECTOS,
  SEPARACION_VERTICAL_SUBEFECTOS,
} from "@/modulos/arbol-problemas/constantes";
import type {
  ConexionArbolProblema,
  EstadoArbolProblema,
  LimitesArbolProblema,
  NodoArbolProblema,
  NodoRenderArbolProblema,
  PosicionArbolProblema,
  VistaArbolProblema,
} from "@/modulos/arbol-problemas/tipos";

let contadorNodosArbolProblemas = 0;

function formatearIndiceJerarquico(indices: number[]): string {
  return indices.join(".");
}

function obtenerEtiquetaPorTipo(tipo: NodoArbolProblema["tipo"]) {
  switch (tipo) {
    case "causa":
      return "Causa";
    case "efecto":
      return "Efecto";
    case "subefecto":
      return "Subefecto";
    default:
      return "Problema";
  }
}

export function crearIdNodoArbolProblemas(prefijo: string) {
  contadorNodosArbolProblemas += 1;
  return `${prefijo}-${contadorNodosArbolProblemas}`;
}

export function limpiarTextoNodoArbolProblemas(texto: string) {
  return texto.replace(/\s+/g, " ").trim();
}

export function esColorHexValido(valor: string) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(valor.trim());
}

export function dividirTextoEnLineas(
  texto: string,
  anchoObjetivo: number,
): string[] {
  const textoLimpio = limpiarTextoNodoArbolProblemas(texto);

  if (!textoLimpio) {
    return [""];
  }

  const maximoCaracteres = Math.max(
    14,
    Math.floor((anchoObjetivo - PADDING_NODO_ARBOL * 2) / 7.1),
  );
  const palabras = textoLimpio.split(" ");
  const lineas: string[] = [];
  let lineaActual = "";

  palabras.forEach((palabra) => {
    if (!lineaActual) {
      lineaActual = palabra;
      return;
    }

    if (`${lineaActual} ${palabra}`.length <= maximoCaracteres) {
      lineaActual = `${lineaActual} ${palabra}`;
      return;
    }

    lineas.push(lineaActual);
    lineaActual = palabra;
  });

  if (lineaActual) {
    lineas.push(lineaActual);
  }

  return lineas;
}

export function medirNodoArbolProblemas(texto: string) {
  const textoLimpio = limpiarTextoNodoArbolProblemas(texto);
  const palabraMasLarga = textoLimpio
    .split(" ")
    .reduce((maximo, palabra) => Math.max(maximo, palabra.length), 0);
  const anchoEstimado = Math.min(
    ANCHO_MAXIMO_NODO_ARBOL,
    Math.max(
      ANCHO_MINIMO_NODO_ARBOL,
      ANCHO_BASE_NODO_ARBOL + Math.max(0, palabraMasLarga - 18) * 4,
    ),
  );
  const lineasTexto = dividirTextoEnLineas(textoLimpio, anchoEstimado);
  const alto = Math.max(
    ALTO_MINIMO_NODO_ARBOL,
    PADDING_NODO_ARBOL * 2 + lineasTexto.length * LINEA_ALTURA_ARBOL + 30,
  );

  return {
    ancho: anchoEstimado,
    alto,
    lineasTexto,
  };
}

function construirMapaRelaciones(
  nodos: NodoArbolProblema[],
): Map<string, NodoArbolProblema[]> {
  const mapa = new Map<string, NodoArbolProblema[]>();

  nodos
    .filter((nodo) => nodo.tipo === "subefecto")
    .forEach((nodo) => {
      if (!nodo.nodoPadreId) {
        return;
      }

      const hijos = mapa.get(nodo.nodoPadreId) ?? [];
      hijos.push(nodo);
      mapa.set(nodo.nodoPadreId, hijos);
    });

  return mapa;
}

function construirMapaEtiquetas(
  nodos: NodoArbolProblema[],
): Map<string, string> {
  const mapa = new Map<string, string>();

  const causas = nodos.filter((nodo) => nodo.tipo === "causa");
  causas.forEach((nodo, indice) => {
    mapa.set(nodo.id, `C${indice + 1}`);
  });

  const mapaHijos = construirMapaRelaciones(nodos);
  const efectosRaiz = nodos.filter((nodo) => nodo.tipo === "efecto");

  const recorrer = (nodo: NodoArbolProblema, indices: number[]) => {
    const prefijo = `E${formatearIndiceJerarquico(indices)}`;
    mapa.set(nodo.id, prefijo);
    (mapaHijos.get(nodo.id) ?? []).forEach((hijo, indice) => {
      recorrer(hijo, [...indices, indice + 1]);
    });
  };

  efectosRaiz.forEach((nodo, indice) => recorrer(nodo, [indice + 1]));
  return mapa;
}

function distribuirHorizontalmente<T extends { ancho: number }>(
  items: T[],
  separacion: number,
) {
  if (items.length === 0) {
    return [] as number[];
  }

  const anchoTotal =
    items.reduce((acumulado, item) => acumulado + item.ancho, 0) +
    separacion * Math.max(0, items.length - 1);
  let cursor = -anchoTotal / 2;

  return items.map((item) => {
    cursor += item.ancho / 2;
    const centro = cursor;
    cursor += item.ancho / 2 + separacion;
    return centro;
  });
}

function construirLimites(nodos: NodoRenderArbolProblema[]): LimitesArbolProblema {
  if (nodos.length === 0) {
    return {
      minX: -240,
      maxX: 240,
      minY: -180,
      maxY: 180,
      ancho: 480,
      alto: 360,
    };
  }

  const minX = Math.min(...nodos.map((nodo) => nodo.posicion.x - nodo.ancho / 2));
  const maxX = Math.max(...nodos.map((nodo) => nodo.posicion.x + nodo.ancho / 2));
  const minY = Math.min(...nodos.map((nodo) => nodo.posicion.y - nodo.alto / 2));
  const maxY = Math.max(...nodos.map((nodo) => nodo.posicion.y + nodo.alto / 2));

  return {
    minX,
    maxX,
    minY,
    maxY,
    ancho: maxX - minX,
    alto: maxY - minY,
  };
}

function construirConexion(
  desdeNodoId: string,
  haciaNodoId: string,
  tipo: ConexionArbolProblema["tipo"],
): ConexionArbolProblema {
  return {
    id: `${tipo}-${desdeNodoId}-${haciaNodoId}`,
    desdeNodoId,
    haciaNodoId,
    tipo,
  };
}

function construirConexiones(estado: EstadoArbolProblema) {
  const conexiones: ConexionArbolProblema[] = [];
  const problemaId = estado.problema.id;
  const causas = estado.nodos.filter((nodo) => nodo.tipo === "causa");
  const efectos = estado.nodos.filter((nodo) => nodo.tipo === "efecto");
  const subefectos = estado.nodos.filter((nodo) => nodo.tipo === "subefecto");

  causas.forEach((causa) => {
    conexiones.push(construirConexion(causa.id, problemaId, "causa-problema"));
  });

  efectos.forEach((efecto) => {
    conexiones.push(construirConexion(problemaId, efecto.id, "problema-efecto"));

    if (estado.mostrarRelacionesLogicas && efecto.causaAsociadaId) {
      conexiones.push(
        construirConexion(
          efecto.causaAsociadaId,
          efecto.id,
          "relacion-logica",
        ),
      );
    }
  });

  subefectos.forEach((subefecto) => {
    if (!subefecto.nodoPadreId) {
      return;
    }

    conexiones.push(
      construirConexion(
        subefecto.nodoPadreId,
        subefecto.id,
        "efecto-subefecto",
      ),
    );
  });

  return conexiones;
}

function construirLayoutEfectos(
  nodos: NodoArbolProblema[],
  mapaEtiquetas: Map<string, string>,
  problemaX: number,
  problemaY: number,
  estado: EstadoArbolProblema,
): Map<string, PosicionArbolProblema> {
  const posiciones = new Map<string, PosicionArbolProblema>();
  const medidas = new Map(
    nodos.map((nodo) => [nodo.id, medirNodoArbolProblemas(nodo.texto)]),
  );
  const mapaHijos = construirMapaRelaciones(nodos);
  const efectosRaiz = nodos.filter((nodo) => nodo.tipo === "efecto");

  const calcularAnchoSubarbol = (nodo: NodoArbolProblema): number => {
    const medidaActual = medidas.get(nodo.id)!;
    const hijos = mapaHijos.get(nodo.id) ?? [];

    if (hijos.length === 0) {
      return medidaActual.ancho;
    }

    const anchosHijos =
      hijos.map(calcularAnchoSubarbol).reduce((suma, valor) => suma + valor, 0) +
      SEPARACION_HORIZONTAL_ARBOL * Math.max(0, hijos.length - 1);

    return Math.max(medidaActual.ancho, anchosHijos);
  };

  const ubicarSubarbol = (
    nodo: NodoArbolProblema,
    centroX: number,
    centroY: number,
  ) => {
    posiciones.set(nodo.id, nodo.posicionManual ?? { x: centroX, y: centroY });
    const hijos = mapaHijos.get(nodo.id) ?? [];

    if (hijos.length === 0) {
      return;
    }

    const hijosMedidos = hijos.map((hijo) => ({
      nodo: hijo,
      ancho: calcularAnchoSubarbol(hijo),
      etiqueta: mapaEtiquetas.get(hijo.id) ?? "",
    }));
    const centrosHijos = distribuirHorizontalmente(
      hijosMedidos.map((item) => ({ ancho: item.ancho })),
      SEPARACION_HORIZONTAL_ARBOL,
    );

    hijosMedidos.forEach((hijoMedido, indice) => {
      ubicarSubarbol(
        hijoMedido.nodo,
        centroX + centrosHijos[indice],
        centroY - SEPARACION_VERTICAL_SUBEFECTOS,
      );
    });
  };

  const efectosMedidos = efectosRaiz.map((efecto) => ({
    nodo: efecto,
    ancho: calcularAnchoSubarbol(efecto),
  }));
  const centrosRaiz = distribuirHorizontalmente(
    efectosMedidos.map((item) => ({ ancho: item.ancho })),
    SEPARACION_HORIZONTAL_ARBOL * 1.3,
  );

  efectosMedidos.forEach((item, indice) => {
    ubicarSubarbol(
      item.nodo,
      problemaX + centrosRaiz[indice],
      problemaY - SEPARACION_VERTICAL_EFECTOS,
    );
  });

  return posiciones;
}

export function construirVistaArbolProblemas(
  estado: EstadoArbolProblema,
): VistaArbolProblema {
  const todosLosNodos = [estado.problema, ...estado.nodos].filter((nodo) =>
    nodo.tipo === "problema" ? Boolean(limpiarTextoNodoArbolProblemas(nodo.texto)) : true,
  );
  const mapaEtiquetas = construirMapaEtiquetas(estado.nodos);
  const medidas = new Map(
    todosLosNodos.map((nodo) => [nodo.id, medirNodoArbolProblemas(nodo.texto)]),
  );
  const problemaPosicion = estado.problema.posicionManual ?? { x: 0, y: 0 };
  const causas = estado.nodos.filter((nodo) => nodo.tipo === "causa");
  const causasMedidas = causas.map((causa) => ({
    nodo: causa,
    ancho: medidas.get(causa.id)!.ancho,
  }));
  const centrosCausas = distribuirHorizontalmente(causasMedidas, SEPARACION_HORIZONTAL_ARBOL);
  const posicionesAutomaticas = new Map<string, PosicionArbolProblema>();

  posicionesAutomaticas.set(estado.problema.id, problemaPosicion);

  causasMedidas.forEach((item, indice) => {
    posicionesAutomaticas.set(
      item.nodo.id,
      item.nodo.posicionManual ?? {
        x: problemaPosicion.x + centrosCausas[indice],
        y: problemaPosicion.y + SEPARACION_VERTICAL_CAUSAS,
      },
    );
  });

  const posicionesEfectos = construirLayoutEfectos(
    estado.nodos,
    mapaEtiquetas,
    problemaPosicion.x,
    problemaPosicion.y,
    estado,
  );
  posicionesEfectos.forEach((posicion, id) => {
    posicionesAutomaticas.set(id, posicion);
  });

  const nodosRender: NodoRenderArbolProblema[] = todosLosNodos.map((nodo) => {
    const medida = medidas.get(nodo.id)!;
    const estilo =
      nodo.tipo === "problema"
        ? estado.colores.problema
        : nodo.tipo === "causa"
          ? estado.colores.causa
          : estado.colores.efecto;

    return {
      ...nodo,
      posicion: posicionesAutomaticas.get(nodo.id) ?? { x: 0, y: 0 },
      ancho: medida.ancho,
      alto: medida.alto,
      lineasTexto: medida.lineasTexto,
      etiquetaVisible:
        nodo.tipo === "problema" ? "P" : (mapaEtiquetas.get(nodo.id) ?? ""),
      etiquetaTipo: obtenerEtiquetaPorTipo(nodo.tipo),
      estilo,
    };
  });

  const conexiones = construirConexiones(estado).filter((conexion) => {
    const existeDesde = nodosRender.some((nodo) => nodo.id === conexion.desdeNodoId);
    const existeHacia = nodosRender.some((nodo) => nodo.id === conexion.haciaNodoId);
    return existeDesde && existeHacia;
  });

  return {
    nodos: nodosRender,
    conexiones,
    limites: construirLimites(nodosRender),
  };
}

export function obtenerDescendientesNodo(
  nodos: NodoArbolProblema[],
  nodoId: string,
): string[] {
  const directos = nodos
    .filter((nodo) => nodo.nodoPadreId === nodoId)
    .map((nodo) => nodo.id);

  return directos.flatMap((id) => [id, ...obtenerDescendientesNodo(nodos, id)]);
}

export function obtenerNodoPorId(
  estado: EstadoArbolProblema,
  nodoId: string,
) {
  return estado.problema.id === nodoId
    ? estado.problema
    : estado.nodos.find((nodo) => nodo.id === nodoId);
}
