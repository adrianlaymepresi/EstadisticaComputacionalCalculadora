interface OpcionesEntero {
  minimo?: number;
  maximo?: number;
}

interface OpcionesDecimal {
  minimo?: number;
  maximo?: number;
  estrictoMinimo?: boolean;
}

export function normalizarTextoNumerico(texto: string) {
  return texto.trim().replace(",", ".");
}

export function parsearEnteroTexto(
  texto: string,
  etiqueta: string,
  opciones: OpcionesEntero = {},
) {
  const normalizado = normalizarTextoNumerico(texto);

  if (!/^-?\d+$/.test(normalizado)) {
    throw new Error(
      `El campo ${etiqueta} representa una cantidad, por lo tanto debe ser un numero entero.`,
    );
  }

  const valor = Number(normalizado);
  if (!Number.isSafeInteger(valor)) {
    throw new Error(`El campo ${etiqueta} excede el rango entero soportado.`);
  }

  if (opciones.minimo !== undefined && valor < opciones.minimo) {
    throw new Error(`El campo ${etiqueta} debe ser mayor o igual a ${opciones.minimo}.`);
  }

  if (opciones.maximo !== undefined && valor > opciones.maximo) {
    throw new Error(`El campo ${etiqueta} debe ser menor o igual a ${opciones.maximo}.`);
  }

  return valor;
}

export function parsearDecimalTexto(
  texto: string,
  etiqueta: string,
  opciones: OpcionesDecimal = {},
) {
  const normalizado = normalizarTextoNumerico(texto);

  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) {
    throw new Error(`El campo ${etiqueta} debe contener un numero valido.`);
  }

  const valor = Number(normalizado);
  if (!Number.isFinite(valor)) {
    throw new Error(`El campo ${etiqueta} debe contener un numero valido.`);
  }

  if (opciones.estrictoMinimo && opciones.minimo !== undefined && valor <= opciones.minimo) {
    throw new Error(`El campo ${etiqueta} debe ser mayor a ${opciones.minimo}.`);
  }

  if (!opciones.estrictoMinimo && opciones.minimo !== undefined && valor < opciones.minimo) {
    throw new Error(`El campo ${etiqueta} debe ser mayor o igual a ${opciones.minimo}.`);
  }

  if (opciones.maximo !== undefined && valor > opciones.maximo) {
    throw new Error(`El campo ${etiqueta} debe ser menor o igual a ${opciones.maximo}.`);
  }

  return valor;
}

export function parsearListaEnterosTexto(
  texto: string,
  etiqueta: string,
  minimoValor = 2,
  opcional = false,
) {
  const textoLimpio = texto.trim();
  if (!textoLimpio) {
    if (opcional) {
      return [];
    }

    throw new Error(`Debes completar el campo ${etiqueta}.`);
  }

  const partes = textoLimpio
    .split(/[\s,;|]+/)
    .map((parte) => parte.trim())
    .filter(Boolean);

  if (!partes.length) {
    if (opcional) {
      return [];
    }

    throw new Error(`Debes completar el campo ${etiqueta}.`);
  }

  return partes.map((parte, indice) =>
    parsearEnteroTexto(parte, `${etiqueta} en posicion ${indice + 1}`, {
      minimo: minimoValor,
    }),
  );
}
