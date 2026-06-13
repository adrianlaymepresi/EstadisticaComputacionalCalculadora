"use client";

import {
  manejarTeclaEntradaNumerica,
  sanitizarTextoEntradaNumerica,
} from "@/modulos/medidas-posicion/servicios/entrada-numerica-medidas-posicion";

interface CapturaDatosNoClasificadosProps {
  filasCaptura: number;
  columnasCaptura: number;
  matrizDatos: string[][];
  ejemplo: string;
  onActualizarDimensiones: (filas: number, columnas: number) => void;
  onActualizarCelda: (
    indiceFila: number,
    indiceColumna: number,
    valor: string,
  ) => void;
  onPegarDesdePortapapeles: () => Promise<void>;
  onPegadoDirecto: (textoPegado: string) => void;
  onLimpiar: () => void;
}

function CampoControl({
  etiqueta,
  valor,
  onChange,
}: {
  etiqueta: string;
  valor: number;
  onChange: (valor: number) => void;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[1.02rem] font-medium text-texto-secundario">
        {etiqueta}
      </span>
      <input
        type="number"
        min={1}
        max={20}
        value={valor}
        inputMode="numeric"
        onKeyDown={(evento) =>
          manejarTeclaEntradaNumerica(evento, {
            permitirNegativo: false,
            permitirDecimal: false,
          })
        }
        onChange={(evento) =>
          onChange(
            Number(
              sanitizarTextoEntradaNumerica(evento.target.value, {
                permitirNegativo: false,
                permitirDecimal: false,
              }) || 1,
            ),
          )
        }
        className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-4 text-[1.12rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
      />
    </label>
  );
}

export function CapturaDatosNoClasificados({
  filasCaptura,
  columnasCaptura,
  matrizDatos,
  ejemplo,
  onActualizarDimensiones,
  onActualizarCelda,
  onPegarDesdePortapapeles,
  onPegadoDirecto,
  onLimpiar,
}: CapturaDatosNoClasificadosProps) {
  return (
    <div
      className="flex flex-col gap-6"
      onPaste={(evento) => {
        evento.preventDefault();
        onPegadoDirecto(evento.clipboardData.getData("text"));
      }}
    >
      <div className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4 text-sm leading-7 text-texto-secundario">
        Ingresa datos numericos en la tabla o pega valores desde Excel, Word o
        una lista como:{" "}
        <span className="font-semibold text-texto-principal">{ejemplo}</span>.{" "}
        Solo se aceptan numeros, signo negativo opcional y decimales con punto
        o coma.
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CampoControl
          etiqueta="Filas de captura"
          valor={filasCaptura}
          onChange={(valor) => onActualizarDimensiones(valor, columnasCaptura)}
        />
        <CampoControl
          etiqueta="Columnas de captura"
          valor={columnasCaptura}
          onChange={(valor) => onActualizarDimensiones(filasCaptura, valor)}
        />
      </div>

      <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
        <table className="min-w-[720px] border-separate border-spacing-0">
          <tbody>
            {matrizDatos.map((fila, indiceFila) => (
              <tr key={`fila-${indiceFila}`}>
                {fila.map((celda, indiceColumna) => (
                  <td
                    key={`celda-${indiceFila}-${indiceColumna}`}
                    className="border-b border-r border-black/8 p-2"
                  >
                    <input
                      type="text"
                      value={celda}
                      inputMode="decimal"
                      onKeyDown={(evento) =>
                        manejarTeclaEntradaNumerica(evento, {
                          permitirNegativo: true,
                          permitirDecimal: true,
                        })
                      }
                      onChange={(evento) =>
                        onActualizarCelda(
                          indiceFila,
                          indiceColumna,
                          sanitizarTextoEntradaNumerica(evento.target.value, {
                            permitirNegativo: true,
                            permitirDecimal: true,
                          }),
                        )
                      }
                      className="min-h-12 w-full rounded-[0.95rem] border border-[#d6e2d6] bg-white px-3 text-[1rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
                      placeholder="Dato"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onPegarDesdePortapapeles}
          className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-[#f5faf4] px-6 text-[1.12rem] font-semibold text-acento-oscuro transition hover:border-acento-principal hover:text-acento-principal"
        >
          Pegar desde portapapeles
        </button>
        <button
          type="button"
          onClick={onLimpiar}
          className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-white px-6 text-[1.12rem] font-semibold text-texto-principal transition hover:border-alerta/30 hover:text-alerta"
        >
          Limpiar datos
        </button>
      </div>
    </div>
  );
}
