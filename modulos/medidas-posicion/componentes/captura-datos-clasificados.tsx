"use client";

import type { FilaTablaClasificadaEntrada } from "@/modulos/medidas-posicion/tipos";

interface CapturaDatosClasificadosProps {
  filas: FilaTablaClasificadaEntrada[];
  ejemplo: Array<{
    li: string;
    ls: string;
    fi: string;
  }>;
  onActualizarFila: (
    indice: number,
    campo: keyof FilaTablaClasificadaEntrada,
    valor: string,
  ) => void;
  onAgregarFila: () => void;
  onQuitarFila: (indice: number) => void;
  onPegarDesdePortapapeles: () => Promise<void>;
  onPegadoDirecto: (textoPegado: string) => void;
  onLimpiar: () => void;
}

export function CapturaDatosClasificados({
  filas,
  ejemplo,
  onActualizarFila,
  onAgregarFila,
  onQuitarFila,
  onPegarDesdePortapapeles,
  onPegadoDirecto,
  onLimpiar,
}: CapturaDatosClasificadosProps) {
  return (
    <div
      className="flex flex-col gap-6"
      onPaste={(evento) => {
        evento.preventDefault();
        onPegadoDirecto(evento.clipboardData.getData("text"));
      }}
    >
      <div className="rounded-[1.4rem] border border-verde-claro bg-[#f9fbf7] p-4 text-sm leading-7 text-texto-secundario">
        Ingresa Li, Ls y fi por fila o pega una tabla de tres columnas desde
        Excel. Ejemplo de referencia:{" "}
        <span className="font-semibold text-texto-principal">
          {ejemplo.map((fila) => `[${fila.li}, ${fila.ls}, ${fila.fi}]`).join(" | ")}
        </span>
      </div>

      <div className="overflow-auto rounded-[1.55rem] border border-verde-claro">
        <table className="min-w-[720px] border-separate border-spacing-0">
          <thead>
            <tr>
              {["Li", "Ls", "fi", "Accion"].map((encabezado) => (
                <th
                  key={encabezado}
                  className="border-b border-r border-black/8 bg-panel-resalte px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] text-acento-oscuro"
                >
                  {encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, indice) => (
              <tr key={`fila-clasificada-${indice}`}>
                <td className="border-b border-r border-black/8 p-2">
                  <input
                    type="text"
                    value={fila.li}
                    onChange={(evento) =>
                      onActualizarFila(indice, "li", evento.target.value)
                    }
                    className="min-h-12 w-full rounded-[0.95rem] border border-[#d6e2d6] bg-white px-3 text-[1rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
                    placeholder="Li"
                  />
                </td>
                <td className="border-b border-r border-black/8 p-2">
                  <input
                    type="text"
                    value={fila.ls}
                    onChange={(evento) =>
                      onActualizarFila(indice, "ls", evento.target.value)
                    }
                    className="min-h-12 w-full rounded-[0.95rem] border border-[#d6e2d6] bg-white px-3 text-[1rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
                    placeholder="Ls"
                  />
                </td>
                <td className="border-b border-r border-black/8 p-2">
                  <input
                    type="text"
                    value={fila.fi}
                    onChange={(evento) =>
                      onActualizarFila(indice, "fi", evento.target.value)
                    }
                    className="min-h-12 w-full rounded-[0.95rem] border border-[#d6e2d6] bg-white px-3 text-[1rem] text-texto-principal outline-none transition focus:border-acento-principal focus:ring-2 focus:ring-acento-principal/10"
                    placeholder="fi"
                  />
                </td>
                <td className="border-b border-r border-black/8 p-2">
                  <button
                    type="button"
                    onClick={() => onQuitarFila(indice)}
                    className="min-h-12 rounded-[0.95rem] border border-verde-claro bg-white px-4 text-sm font-semibold text-texto-principal transition hover:border-alerta/30 hover:text-alerta"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onAgregarFila}
          className="min-h-14 rounded-[1.15rem] border border-verde-claro bg-[#f5faf4] px-6 text-[1.12rem] font-semibold text-acento-oscuro transition hover:border-acento-principal hover:text-acento-principal"
        >
          Agregar fila
        </button>
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
          Limpiar tabla
        </button>
      </div>
    </div>
  );
}
