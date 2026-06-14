"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import type {
  ConfiguracionGraficaRegresion,
  ResultadoCalculoRegresion,
  ResultadoEstimacionRegresion,
} from "@/modulos/regresiones/tipos";
import {
  dibujarGraficaRegresionEnCanvas,
} from "@/modulos/regresiones/utilidades/grafica-regresion";
import {
  obtenerNombreVariableXVisible,
  obtenerNombreVariableYVisible,
} from "@/modulos/regresiones/utilidades/formateo-regresion";

interface GraficaRegresionCanvasProps {
  resultado: ResultadoCalculoRegresion;
  configuracionGrafica: ConfiguracionGraficaRegresion;
  estimaciones: ResultadoEstimacionRegresion[];
  lienzoRefExterno: RefObject<HTMLCanvasElement | null>;
}

export function GraficaRegresionCanvas({
  resultado,
  configuracionGrafica,
  estimaciones,
  lienzoRefExterno,
}: GraficaRegresionCanvasProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [dimensiones, setDimensiones] = useState({
    ancho: 980,
    alto: 580,
  });

  useEffect(() => {
    const actualizarDimensiones = () => {
      const contenedor = contenedorRef.current;

      if (!contenedor) {
        return;
      }

      const anchoDisponible = contenedor.offsetWidth - 18;
      const ancho = Math.max(760, anchoDisponible);
      const alto = Math.max(460, Math.round(ancho * 0.58));

      setDimensiones((estadoActual) =>
        estadoActual.ancho === ancho && estadoActual.alto === alto
          ? estadoActual
          : { ancho, alto },
      );
    };

    actualizarDimensiones();
    window.addEventListener("resize", actualizarDimensiones);

    return () => window.removeEventListener("resize", actualizarDimensiones);
  }, []);

  useEffect(() => {
    const lienzo = lienzoRefExterno.current;

    if (!lienzo) {
      return;
    }

    dibujarGraficaRegresionEnCanvas(lienzo, resultado, {
      ancho: dimensiones.ancho,
      alto: dimensiones.alto,
      nombreEjeX: obtenerNombreVariableXVisible(
        resultado.configuracion.personalizacion,
      ),
      nombreEjeY: obtenerNombreVariableYVisible(
        resultado.configuracion.personalizacion,
      ),
      titulo: `Grafica de ${resultado.titulo.toLowerCase()}`,
      ecuacion: resultado.ecuacionFinal,
      configuracion: configuracionGrafica,
      estimaciones,
    });
  }, [
    configuracionGrafica,
    dimensiones.alto,
    dimensiones.ancho,
    estimaciones,
    lienzoRefExterno,
    resultado,
  ]);

  return (
    <div
      ref={contenedorRef}
      className="overflow-auto rounded-[1.7rem] border border-verde-claro bg-[#f8fbf8] p-4"
    >
      <canvas
        ref={lienzoRefExterno}
        className="mx-auto h-auto min-w-[760px]"
        style={{ width: `${dimensiones.ancho}px`, maxWidth: "none" }}
      />
    </div>
  );
}
