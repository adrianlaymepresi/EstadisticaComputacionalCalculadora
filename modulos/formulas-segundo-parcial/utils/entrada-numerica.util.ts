"use client";

import type { KeyboardEvent } from "react";

interface OpcionesEntradaNumerica {
  permitirNegativo?: boolean;
  permitirDecimal?: boolean;
}

const teclasControl = new Set([
  "Backspace",
  "Delete",
  "Tab",
  "Enter",
  "Escape",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
]);

export function sanitizarTextoEntradaNumerica(
  texto: string,
  opciones: OpcionesEntradaNumerica = {},
) {
  let textoSanitizado = "";
  let tieneSigno = false;
  let tieneSeparadorDecimal = false;

  for (const caracter of texto) {
    if (/\d/.test(caracter)) {
      textoSanitizado += caracter;
      continue;
    }

    if (
      opciones.permitirNegativo &&
      caracter === "-" &&
      !tieneSigno &&
      textoSanitizado.length === 0
    ) {
      textoSanitizado += caracter;
      tieneSigno = true;
      continue;
    }

    if (
      opciones.permitirDecimal &&
      (caracter === "." || caracter === ",") &&
      !tieneSeparadorDecimal
    ) {
      if (textoSanitizado === "" || textoSanitizado === "-") {
        textoSanitizado += "0";
      }

      textoSanitizado += caracter;
      tieneSeparadorDecimal = true;
    }
  }

  return textoSanitizado;
}

export function sanitizarTextoListaEnteros(texto: string) {
  return texto
    .split("")
    .filter((caracter) => /[\d,\s;|]/.test(caracter))
    .join("");
}

export function manejarTeclaEntradaNumerica(
  evento: KeyboardEvent<HTMLInputElement>,
  opciones: OpcionesEntradaNumerica = {},
) {
  if (evento.ctrlKey || evento.metaKey || evento.altKey) {
    return;
  }

  if (teclasControl.has(evento.key)) {
    return;
  }

  if (/^\d$/.test(evento.key)) {
    return;
  }

  const valorActual = evento.currentTarget.value;
  const inicioSeleccion = evento.currentTarget.selectionStart ?? valorActual.length;
  const finSeleccion = evento.currentTarget.selectionEnd ?? valorActual.length;
  const textoSeleccionado = valorActual.slice(inicioSeleccion, finSeleccion);

  if (
    opciones.permitirNegativo &&
    evento.key === "-" &&
    inicioSeleccion === 0 &&
    (!valorActual.includes("-") || textoSeleccionado.includes("-"))
  ) {
    return;
  }

  if (
    opciones.permitirDecimal &&
    (evento.key === "." || evento.key === ",") &&
    (!/[.,]/.test(valorActual) || /[.,]/.test(textoSeleccionado))
  ) {
    return;
  }

  evento.preventDefault();
}

export function manejarTeclaListaEnteros(evento: KeyboardEvent<HTMLInputElement>) {
  if (evento.ctrlKey || evento.metaKey || evento.altKey) {
    return;
  }

  if (teclasControl.has(evento.key)) {
    return;
  }

  if (/^\d$/.test(evento.key) || /[,\s;|]/.test(evento.key)) {
    return;
  }

  evento.preventDefault();
}
