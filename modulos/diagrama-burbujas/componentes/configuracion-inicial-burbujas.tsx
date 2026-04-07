"use client";

import { useState } from "react";
import type { ConfiguracionColumnas } from "@/modulos/diagrama-burbujas/tipos";
import {
  validarNombreColumna,
  validarNumeroFilas,
} from "@/modulos/diagrama-burbujas/utilidades/validaciones";

interface PropiedadesConfiguracionInicial {
  alConfirmar: (
    numeroFilas: number,
    columnas: ConfiguracionColumnas,
  ) => void;
}

export function ConfiguracionInicialBurbujas({
  alConfirmar,
}: PropiedadesConfiguracionInicial) {
  const [numeroFilas, setNumeroFilas] = useState<string>("5");
  const [nombreX, setNombreX] = useState<string>("");
  const [nombreY, setNombreY] = useState<string>("");
  const [nombreTamanio, setNombreTamanio] = useState<string>("");
  const [nombreColor, setNombreColor] = useState<string>("");
  const [incluirColor, setIncluirColor] = useState<boolean>(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    const numeroFilasNumerico = parseInt(numeroFilas, 10);
    if (!validarNumeroFilas(numeroFilasNumerico)) {
      nuevosErrores.numeroFilas = "Debe ingresar entre 3 y 20 burbujas";
    }

    if (!validarNombreColumna(nombreX)) {
      nuevosErrores.nombreX = "Ingrese un nombre para el eje horizontal";
    }

    if (!validarNombreColumna(nombreY)) {
      nuevosErrores.nombreY = "Ingrese un nombre para el eje vertical";
    }

    if (!validarNombreColumna(nombreTamanio)) {
      nuevosErrores.nombreTamanio =
        "Ingrese que representa el tamano de las burbujas";
    }

    if (incluirColor && !validarNombreColumna(nombreColor)) {
      nuevosErrores.nombreColor = "Ingrese un nombre para la columna de color";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = () => {
    if (!validarFormulario()) {
      return;
    }

    const configuracionColumnas: ConfiguracionColumnas = {
      nombreX,
      nombreY,
      nombreTamanio,
      ...(incluirColor ? { nombreColor } : {}),
    };

    alConfirmar(parseInt(numeroFilas, 10), configuracionColumnas);
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
          <h2 className="mb-2 text-3xl font-bold text-white">
            Configuracion del Diagrama
          </h2>
          <p className="text-base text-purple-100">
            Defina las dimensiones de su analisis. Los diagramas de burbujas
            permiten visualizar hasta 4 variables simultaneamente.
          </p>
        </div>

        <div className="space-y-8 p-8">
          <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6">
            <label className="mb-3 block text-base font-bold text-gray-800">
              Cuantos puntos de datos desea visualizar
            </label>
            <p className="mb-4 text-sm text-gray-600">
              Cada punto sera representado como una burbuja en el diagrama.
              Elija entre 3 y 20 burbujas.
            </p>
            <input
              type="number"
              value={numeroFilas}
              onChange={(evento) => setNumeroFilas(evento.target.value)}
              min={3}
              max={20}
              className="w-full rounded-xl border-2 border-purple-300 bg-white px-5 py-4 text-lg font-semibold outline-none transition-all focus:border-purple-600 focus:ring-4 focus:ring-purple-100"
              placeholder="Entre 3 y 20"
            />
            {errores.numeroFilas ? (
              <p className="mt-3 text-sm font-semibold text-red-600">
                {errores.numeroFilas}
              </p>
            ) : null}
          </div>

          <div className="space-y-6">
            <h3 className="border-b-2 border-gray-200 pb-3 text-xl font-bold text-gray-800">
              Dimensiones de su Diagrama
            </h3>

            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-6">
              <label className="mb-2 block text-base font-bold text-gray-800">
                Eje Horizontal (X) - 1ra Dimension
              </label>
              <p className="mb-4 text-sm text-gray-600">
                Variable que se representara en el eje horizontal. Puede ser
                tiempo, categorias, rangos, etc.
              </p>
              <input
                type="text"
                value={nombreX}
                onChange={(evento) => setNombreX(evento.target.value)}
                className="w-full rounded-xl border-2 border-blue-300 bg-white px-5 py-4 text-lg outline-none transition-all focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="Ejemplo: Meses, Edad, Temperatura, Ingresos..."
              />
              {errores.nombreX ? (
                <p className="mt-3 text-sm font-semibold text-red-600">
                  {errores.nombreX}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border-2 border-green-200 bg-green-50 p-6">
              <label className="mb-2 block text-base font-bold text-gray-800">
                Eje Vertical (Y) - 2da Dimension
              </label>
              <p className="mb-4 text-sm text-gray-600">
                Variable que se representara en el eje vertical. Permite
                comparar contra el eje X.
              </p>
              <input
                type="text"
                value={nombreY}
                onChange={(evento) => setNombreY(evento.target.value)}
                className="w-full rounded-xl border-2 border-green-300 bg-white px-5 py-4 text-lg outline-none transition-all focus:border-green-600 focus:ring-4 focus:ring-green-100"
                placeholder="Ejemplo: Ventas, Poblacion, Casos, Gastos..."
              />
              {errores.nombreY ? (
                <p className="mt-3 text-sm font-semibold text-red-600">
                  {errores.nombreY}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-6">
              <label className="mb-2 block text-base font-bold text-gray-800">
                Tamano de la Burbuja - 3ra Dimension
              </label>
              <p className="mb-4 text-sm text-gray-600">
                Variable que determinara que tan grande o pequena sera cada
                burbuja.
              </p>
              <input
                type="text"
                value={nombreTamanio}
                onChange={(evento) => setNombreTamanio(evento.target.value)}
                className="w-full rounded-xl border-2 border-orange-300 bg-white px-5 py-4 text-lg outline-none transition-all focus:border-orange-600 focus:ring-4 focus:ring-orange-100"
                placeholder="Ejemplo: Inversion, Poblacion Total, Impacto..."
              />
              {errores.nombreTamanio ? (
                <p className="mt-3 text-sm font-semibold text-red-600">
                  {errores.nombreTamanio}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border-2 border-pink-200 bg-pink-50 p-6">
              <label className="mb-4 flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirColor}
                  onChange={(evento) => setIncluirColor(evento.target.checked)}
                  className="h-6 w-6 cursor-pointer rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="ml-4 text-base font-bold text-gray-800">
                  Color de la Burbuja - 4ta Dimension (Opcional)
                </span>
              </label>
              <p className="mb-4 text-sm text-gray-600">
                Active esta opcion para anadir una cuarta variable categorica.
              </p>

              {incluirColor ? (
                <div className="animate-fadeIn space-y-3">
                  <input
                    type="text"
                    value={nombreColor}
                    onChange={(evento) => setNombreColor(evento.target.value)}
                    className="w-full rounded-xl border-2 border-pink-300 bg-white px-5 py-4 text-lg outline-none transition-all focus:border-pink-600 focus:ring-4 focus:ring-pink-100"
                    placeholder="Ejemplo: Categoria, Estado, Region, Tipo..."
                  />
                  {errores.nombreColor ? (
                    <p className="text-sm font-semibold text-red-600">
                      {errores.nombreColor}
                    </p>
                  ) : null}
                  <div className="rounded-lg border border-pink-200 bg-white p-4">
                    <p className="text-xs leading-relaxed text-gray-600">
                      Tip: Puede usar colores CSS directos (red, blue, #FF5733)
                      o categorias textuales (Alto, Medio, Bajo / Activo,
                      Inactivo).
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={manejarEnvio}
              className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 px-8 py-5 text-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 hover:shadow-2xl active:scale-[0.98]"
            >
              {"Continuar al Ingreso de Datos ->"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
