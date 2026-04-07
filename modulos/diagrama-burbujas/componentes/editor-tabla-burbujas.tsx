"use client";

import { Fragment, useState } from "react";
import type {
  ConfiguracionColumnas,
  FilaDatos,
} from "@/modulos/diagrama-burbujas/tipos";
import { parsearDatosTabla } from "@/modulos/diagrama-burbujas/utilidades/validaciones";

interface PropiedadesEditorTabla {
  numeroFilas: number;
  columnas: ConfiguracionColumnas;
  alConfirmar: (datos: FilaDatos[]) => void;
  alVolver: () => void;
}

interface FilaInterna {
  x: string;
  y: string;
  tamanio: string;
  color?: string;
}

interface ErrorFila {
  campo: string;
  mensaje: string;
}

function crearFilaVacia(incluirColor: boolean): FilaInterna {
  return {
    x: "",
    y: "",
    tamanio: "",
    ...(incluirColor ? { color: "" } : {}),
  };
}

function crearFilasInternas(
  numeroFilas: number,
  incluirColor: boolean,
): FilaInterna[] {
  return Array.from({ length: numeroFilas }, () => crearFilaVacia(incluirColor));
}

export function EditorTablaBurbujas({
  numeroFilas,
  columnas,
  alConfirmar,
  alVolver,
}: PropiedadesEditorTabla) {
  const [filasInternas, setFilasInternas] = useState<FilaInterna[]>(() =>
    crearFilasInternas(numeroFilas, Boolean(columnas.nombreColor)),
  );
  const [erroresFilas, setErroresFilas] = useState<Record<number, ErrorFila[]>>(
    {},
  );
  const [filaEditando, setFilaEditando] = useState<number | null>(null);

  const manejarCambio = (
    indice: number,
    campo: keyof FilaInterna,
    valor: string,
  ) => {
    const nuevasFilas = [...filasInternas];
    nuevasFilas[indice] = {
      ...nuevasFilas[indice],
      [campo]: valor,
    };
    setFilasInternas(nuevasFilas);

    setErroresFilas((erroresActuales) => {
      const nuevosErrores = { ...erroresActuales };
      if (nuevosErrores[indice]) {
        nuevosErrores[indice] = nuevosErrores[indice].filter(
          (error) => error.campo !== campo,
        );
        if (nuevosErrores[indice].length === 0) {
          delete nuevosErrores[indice];
        }
      }
      return nuevosErrores;
    });
  };

  const validarFila = (indice: number): boolean => {
    const fila = filasInternas[indice];
    const errores: ErrorFila[] = [];

    const x = parseFloat(fila.x);
    const y = parseFloat(fila.y);
    const tamanio = parseFloat(fila.tamanio);

    if (Number.isNaN(x) || fila.x.trim() === "") {
      errores.push({ campo: "x", mensaje: `${columnas.nombreX} requerido` });
    }

    if (Number.isNaN(y) || fila.y.trim() === "") {
      errores.push({ campo: "y", mensaje: `${columnas.nombreY} requerido` });
    }

    if (Number.isNaN(tamanio) || fila.tamanio.trim() === "") {
      errores.push({
        campo: "tamanio",
        mensaje: `${columnas.nombreTamanio} requerido`,
      });
    } else if (tamanio <= 0) {
      errores.push({ campo: "tamanio", mensaje: "Debe ser mayor a 0" });
    }

    if (errores.length > 0) {
      setErroresFilas((erroresActuales) => ({ ...erroresActuales, [indice]: errores }));
      return false;
    }

    setErroresFilas((erroresActuales) => {
      const nuevosErrores = { ...erroresActuales };
      delete nuevosErrores[indice];
      return nuevosErrores;
    });
    return true;
  };

  const manejarBlur = (indice: number) => {
    setFilaEditando(null);
    validarFila(indice);
  };

  const manejarFocus = (indice: number) => {
    setFilaEditando(indice);
  };

  const manejarPegado = (evento: React.ClipboardEvent) => {
    evento.preventDefault();
    const textoPegado = evento.clipboardData.getData("text");
    const datosParseados = parsearDatosTabla(textoPegado);

    const nuevasFilas = [...filasInternas];
    datosParseados.forEach((fila, indice) => {
      if (indice >= nuevasFilas.length) {
        return;
      }

      if (fila[0]) nuevasFilas[indice].x = fila[0];
      if (fila[1]) nuevasFilas[indice].y = fila[1];
      if (fila[2]) nuevasFilas[indice].tamanio = fila[2];
      if (fila[3] && columnas.nombreColor) nuevasFilas[indice].color = fila[3];
    });

    setFilasInternas(nuevasFilas);
    setErroresFilas({});
  };

  const agregarFila = () => {
    if (filasInternas.length >= 50) {
      return;
    }

    setFilasInternas((filasActuales) => [
      ...filasActuales,
      crearFilaVacia(Boolean(columnas.nombreColor)),
    ]);
  };

  const quitarUltimaFila = () => {
    if (filasInternas.length <= 3) {
      return;
    }

    setFilasInternas((filasActuales) => filasActuales.slice(0, -1));
    setErroresFilas((erroresActuales) => {
      const nuevosErrores = { ...erroresActuales };
      delete nuevosErrores[filasInternas.length - 1];
      return nuevosErrores;
    });
    setFilaEditando((filaActual) =>
      filaActual !== null && filaActual >= filasInternas.length - 1
        ? null
        : filaActual,
    );
  };

  const convertirAFilaDatos = (): FilaDatos[] | null => {
    const filasConvertidas: FilaDatos[] = [];
    let hayErrores = false;

    filasInternas.forEach((fila, indice) => {
      if (!validarFila(indice)) {
        hayErrores = true;
      } else {
        filasConvertidas.push({
          x: parseFloat(fila.x),
          y: parseFloat(fila.y),
          tamanio: parseFloat(fila.tamanio),
          ...(columnas.nombreColor ? { color: fila.color || "" } : {}),
        });
      }
    });

    return hayErrores ? null : filasConvertidas;
  };

  const manejarGenerar = () => {
    const datos = convertirAFilaDatos();
    if (!datos) {
      return;
    }
    alConfirmar(datos);
  };

  const calcularProgreso = (): number => {
    const filasCompletas = filasInternas.filter(
      (fila) =>
        fila.x.trim() !== "" &&
        fila.y.trim() !== "" &&
        fila.tamanio.trim() !== "" &&
        !Number.isNaN(parseFloat(fila.x)) &&
        !Number.isNaN(parseFloat(fila.y)) &&
        !Number.isNaN(parseFloat(fila.tamanio)),
    ).length;
    return Math.round((filasCompletas / filasInternas.length) * 100);
  };

  const tieneErrores = Object.keys(erroresFilas).length > 0;
  const progreso = calcularProgreso();
  const estaCompleto = progreso === 100;

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6">
          <h2 className="mb-2 text-3xl font-bold text-white">
            Ingreso de Datos
          </h2>
          <p className="text-base text-purple-100">
            Complete los valores para cada punto. Los campos permaneceran
            editables hasta que salga de ellos.
          </p>
        </div>

        <div className="border-b border-gray-200 bg-gray-50 px-8 py-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              Progreso de completitud
            </span>
            <span
              className={`text-sm font-bold ${
                estaCompleto ? "text-green-600" : "text-purple-600"
              }`}
            >
              {progreso}% (
              {
                filasInternas.filter(
                  (fila) =>
                    fila.x.trim() && fila.y.trim() && fila.tamanio.trim(),
                ).length
              }
              /{filasInternas.length} burbujas)
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-500 ${
                estaCompleto
                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                  : "bg-gradient-to-r from-purple-500 to-indigo-500"
              }`}
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        <div className="border-b border-blue-200 bg-blue-50 px-8 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="mb-1 text-sm font-semibold text-blue-900">
                  Tips de uso:
                </p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>Puedes copiar y pegar desde Excel directamente aqui.</li>
                  <li>Los campos pueden quedar temporalmente vacios.</li>
                  <li>La validacion se ejecuta al salir del campo o al generar.</li>
                  <li>El tamano debe ser mayor a 0.</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={agregarFila}
                className="rounded-lg border border-purple-300 bg-white px-4 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
              >
                + Agregar fila
              </button>
              <button
                type="button"
                onClick={quitarUltimaFila}
                disabled={filasInternas.length <= 3}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                  filasInternas.length > 3
                    ? "border-purple-300 bg-white text-purple-700 hover:bg-purple-50"
                    : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                }`}
              >
                - Quitar ultima fila
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="overflow-x-auto rounded-xl border-2 border-gray-200 shadow-lg">
            <table
              className="min-w-[800px] w-full border-collapse"
              onPaste={manejarPegado}
            >
              <thead>
                <tr className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-700">
                  <th className="w-16 border-r border-purple-500 px-5 py-4 text-center font-bold text-white">
                    <div className="text-base">#</div>
                  </th>
                  <th className="border-r border-purple-500 px-5 py-4 text-left font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-base">{columnas.nombreX}</div>
                        <div className="text-xs font-normal text-purple-200">
                          Eje horizontal (X)
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="border-r border-purple-500 px-5 py-4 text-left font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-base">{columnas.nombreY}</div>
                        <div className="text-xs font-normal text-purple-200">
                          Eje vertical (Y)
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="border-r border-purple-500 px-5 py-4 text-left font-bold text-white">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-base">{columnas.nombreTamanio}</div>
                        <div className="text-xs font-normal text-purple-200">
                          Tamano de burbuja
                        </div>
                      </div>
                    </div>
                  </th>
                  {columnas.nombreColor ? (
                    <th className="px-5 py-4 text-left font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-base">{columnas.nombreColor}</div>
                          <div className="text-xs font-normal text-purple-200">
                            Color/Categoria
                          </div>
                        </div>
                      </div>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filasInternas.map((fila, indice) => {
                  const tieneError = erroresFilas[indice];
                  const estaEditandoFila = filaEditando === indice;

                  return (
                    <Fragment key={`bloque-fila-${indice}`}>
                      <tr
                        className={`transition-all duration-200 ${
                          tieneError
                            ? "border-l-4 border-red-500 bg-red-50"
                            : indice % 2 === 0
                              ? "bg-white"
                              : "bg-gray-50"
                        } ${estaEditandoFila ? "ring-2 ring-purple-300" : ""} hover:bg-purple-50`}
                      >
                        <td className="border border-gray-200 px-5 py-4 text-center text-lg font-bold text-purple-700">
                          {indice + 1}
                        </td>

                        <td className="border border-gray-200 px-5 py-4">
                          <input
                            type="text"
                            value={fila.x}
                            onChange={(evento) =>
                              manejarCambio(indice, "x", evento.target.value)
                            }
                            onFocus={() => manejarFocus(indice)}
                            onBlur={() => manejarBlur(indice)}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-base outline-none transition-all ${
                              tieneError &&
                              erroresFilas[indice].some(
                                (error) => error.campo === "x",
                              )
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            }`}
                            placeholder="Ej: 10, 25.5, -3"
                          />
                        </td>

                        <td className="border border-gray-200 px-5 py-4">
                          <input
                            type="text"
                            value={fila.y}
                            onChange={(evento) =>
                              manejarCambio(indice, "y", evento.target.value)
                            }
                            onFocus={() => manejarFocus(indice)}
                            onBlur={() => manejarBlur(indice)}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-base outline-none transition-all ${
                              tieneError &&
                              erroresFilas[indice].some(
                                (error) => error.campo === "y",
                              )
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            }`}
                            placeholder="Ej: 100, 52.3, 0.5"
                          />
                        </td>

                        <td className="border border-gray-200 px-5 py-4">
                          <input
                            type="text"
                            value={fila.tamanio}
                            onChange={(evento) =>
                              manejarCambio(indice, "tamanio", evento.target.value)
                            }
                            onFocus={() => manejarFocus(indice)}
                            onBlur={() => manejarBlur(indice)}
                            className={`w-full rounded-lg border-2 px-4 py-3 text-base outline-none transition-all ${
                              tieneError &&
                              erroresFilas[indice].some(
                                (error) => error.campo === "tamanio",
                              )
                                ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                            }`}
                            placeholder="Ej: 1500, 42.8 (>0)"
                          />
                        </td>

                        {columnas.nombreColor ? (
                          <td className="border border-gray-200 px-5 py-4">
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={
                                  fila.color?.startsWith("#")
                                    ? fila.color
                                    : "#8B5CF6"
                                }
                                onChange={(evento) =>
                                  manejarCambio(indice, "color", evento.target.value)
                                }
                                className="h-14 w-14 cursor-pointer rounded-lg border-2 border-gray-300 transition-all hover:border-purple-500"
                                title="Selector de color"
                              />
                              <input
                                type="text"
                                value={fila.color || ""}
                                onChange={(evento) =>
                                  manejarCambio(indice, "color", evento.target.value)
                                }
                                onFocus={() => manejarFocus(indice)}
                                onBlur={() => manejarBlur(indice)}
                                placeholder="Color o categoria"
                                className="flex-1 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                              />
                            </div>
                          </td>
                        ) : null}
                      </tr>

                      {tieneError ? (
                        <tr>
                          <td />
                          <td
                            colSpan={columnas.nombreColor ? 4 : 3}
                            className="border-x border-b border-red-200 bg-red-100 px-5 py-3"
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-1">
                                {erroresFilas[indice].map((error, errorIndice) => (
                                  <p
                                    key={`error-${indice}-${errorIndice}`}
                                    className="text-sm font-semibold text-red-700"
                                  >
                                    - {error.mensaje}
                                  </p>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={alVolver}
              className="rounded-xl border-2 border-purple-600 bg-white px-6 py-4 text-lg font-semibold text-purple-700 transition-all duration-200 shadow-md hover:bg-purple-50 hover:shadow-lg"
            >
              {"<- Volver a Configuracion"}
            </button>
            <button
              type="button"
              onClick={manejarGenerar}
              disabled={!estaCompleto || tieneErrores}
              className={`flex-1 rounded-xl px-8 py-4 text-lg font-bold transition-all duration-300 shadow-xl ${
                estaCompleto && !tieneErrores
                  ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white hover:scale-[1.02] hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 hover:shadow-2xl active:scale-[0.98]"
                  : "cursor-not-allowed bg-gray-200 text-gray-400"
              }`}
            >
              {tieneErrores
                ? "Corrija los errores para continuar"
                : !estaCompleto
                  ? `Complete los datos (${progreso}%)`
                  : "Generar Diagrama de Burbujas ->"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
