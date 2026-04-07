"use client";

import { useState } from "react";
import {
  OPCIONES_VISUALIZACION_DEFAULT,
  type OpcionesVisualizacion,
} from "@/modulos/diagrama-burbujas/tipos";

interface PropiedadesPanelPersonalizacion {
  opciones: OpcionesVisualizacion;
  alCambiar: (opciones: OpcionesVisualizacion) => void;
  mostrarOpcionColor: boolean;
}

interface SeccionAcordeonProps {
  titulo: string;
  icono: string;
  colapsado: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  small?: boolean;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unidad: string;
  onChange: (value: number) => void;
}

interface InputColorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SeccionAcordeon({
  titulo,
  icono,
  colapsado,
  onToggle,
  children,
}: SeccionAcordeonProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{icono}</span>
          <span className="text-sm font-semibold text-gray-800">{titulo}</span>
        </div>
        <span className="text-xs text-gray-500">{colapsado ? "v" : "^"}</span>
      </button>
      {!colapsado ? <div className="bg-white p-4">{children}</div> : null}
    </div>
  );
}

function Checkbox({ label, checked, onChange, small }: CheckboxProps) {
  return (
    <label className="group flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(evento) => onChange(evento.target.checked)}
        className="h-4 w-4 cursor-pointer rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
      />
      <span
        className={`${small ? "text-xs" : "text-sm"} text-gray-700 group-hover:text-gray-900`}
      >
        {label}
      </span>
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unidad,
  onChange,
}: SliderProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">{label}</label>
        <span className="text-xs font-semibold text-purple-600">
          {value}
          {unidad}
        </span>
      </div>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(evento) => onChange(parseFloat(evento.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-purple-600"
      />
    </div>
  );
}

function InputColor({ label, value, onChange }: InputColorProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(evento) => onChange(evento.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-gray-300"
        />
        <input
          type="text"
          value={value}
          onChange={(evento) => onChange(evento.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-xs font-mono outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
        />
      </div>
    </div>
  );
}

function Select({ label, value, options, onChange }: SelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(evento) => onChange(evento.target.value)}
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
      >
        {options.map((opcion) => (
          <option key={opcion.value} value={opcion.value}>
            {opcion.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PanelPersonalizacionBurbujas({
  opciones,
  alCambiar,
  mostrarOpcionColor,
}: PropiedadesPanelPersonalizacion) {
  const [colapsados, setColapsados] = useState<Record<string, boolean>>({
    cuadricula: false,
    lineas: true,
    etiquetas: true,
    ejes: true,
    leyenda: true,
    burbujas: true,
    tooltip: true,
  });

  const toggleSeccion = (seccion: string) => {
    setColapsados((estadoActual) => ({
      ...estadoActual,
      [seccion]: !estadoActual[seccion],
    }));
  };

  const actualizarOpciones = <K extends keyof OpcionesVisualizacion>(
    seccion: K,
    cambios: Partial<OpcionesVisualizacion[K]>,
  ) => {
    alCambiar({
      ...opciones,
      [seccion]: { ...opciones[seccion], ...cambios },
    });
  };

  return (
    <div className="overflow-y-auto border-l border-gray-200 bg-white">
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-4">
        <h3 className="mb-1 text-lg font-bold text-white">Personalizacion</h3>
        <p className="text-xs text-purple-100">Opciones de visualizacion</p>
      </div>

      <div className="space-y-4 p-5">
        <button
          type="button"
          onClick={() => alCambiar(OPCIONES_VISUALIZACION_DEFAULT)}
          className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          Restablecer valores predeterminados
        </button>

        <SeccionAcordeon
          titulo="Cuadricula y Fondo"
          icono="[]"
          colapsado={colapsados.cuadricula}
          onToggle={() => toggleSeccion("cuadricula")}
        >
          <div className="space-y-3">
            <Checkbox
              label="Mostrar lineas horizontales"
              checked={opciones.cuadricula.mostrarHorizontal}
              onChange={(checked) =>
                actualizarOpciones("cuadricula", { mostrarHorizontal: checked })
              }
            />
            <Checkbox
              label="Mostrar lineas verticales"
              checked={opciones.cuadricula.mostrarVertical}
              onChange={(checked) =>
                actualizarOpciones("cuadricula", { mostrarVertical: checked })
              }
            />
            <InputColor
              label="Color de lineas"
              value={opciones.cuadricula.color}
              onChange={(color) => actualizarOpciones("cuadricula", { color })}
            />
            <Slider
              label="Grosor de lineas"
              value={opciones.cuadricula.grosor}
              min={0.5}
              max={3}
              step={0.5}
              unidad="px"
              onChange={(grosor) =>
                actualizarOpciones("cuadricula", { grosor })
              }
            />
          </div>
        </SeccionAcordeon>

        <SeccionAcordeon
          titulo="Lineas de Conexion"
          icono="--"
          colapsado={colapsados.lineas}
          onToggle={() => toggleSeccion("lineas")}
        >
          <div className="space-y-3">
            <Checkbox
              label="Conectar burbujas en orden"
              checked={opciones.lineasConexion.mostrar}
              onChange={(checked) =>
                actualizarOpciones("lineasConexion", { mostrar: checked })
              }
            />
            {opciones.lineasConexion.mostrar ? (
              <>
                <InputColor
                  label="Color de linea"
                  value={opciones.lineasConexion.color}
                  onChange={(color) =>
                    actualizarOpciones("lineasConexion", { color })
                  }
                />
                <Slider
                  label="Grosor"
                  value={opciones.lineasConexion.grosor}
                  min={1}
                  max={5}
                  step={1}
                  unidad="px"
                  onChange={(grosor) =>
                    actualizarOpciones("lineasConexion", { grosor })
                  }
                />
                <Select
                  label="Estilo"
                  value={opciones.lineasConexion.estilo}
                  options={[
                    { value: "continua", label: "Continua" },
                    { value: "punteada", label: "Punteada" },
                  ]}
                  onChange={(estilo) =>
                    actualizarOpciones("lineasConexion", {
                      estilo: estilo as "continua" | "punteada",
                    })
                  }
                />
              </>
            ) : null}
          </div>
        </SeccionAcordeon>

        <SeccionAcordeon
          titulo="Etiquetas de Datos"
          icono="TT"
          colapsado={colapsados.etiquetas}
          onToggle={() => toggleSeccion("etiquetas")}
        >
          <div className="space-y-3">
            <Checkbox
              label="Mostrar etiquetas sobre burbujas"
              checked={opciones.etiquetas.mostrar}
              onChange={(checked) =>
                actualizarOpciones("etiquetas", { mostrar: checked })
              }
            />
            {opciones.etiquetas.mostrar ? (
              <>
                <div className="space-y-2 border-l-2 border-gray-200 pl-4">
                  <Checkbox
                    label="Valor X"
                    checked={opciones.etiquetas.mostrarX}
                    onChange={(checked) =>
                      actualizarOpciones("etiquetas", { mostrarX: checked })
                    }
                    small
                  />
                  <Checkbox
                    label="Valor Y"
                    checked={opciones.etiquetas.mostrarY}
                    onChange={(checked) =>
                      actualizarOpciones("etiquetas", { mostrarY: checked })
                    }
                    small
                  />
                  <Checkbox
                    label="Tamano"
                    checked={opciones.etiquetas.mostrarTamanio}
                    onChange={(checked) =>
                      actualizarOpciones("etiquetas", { mostrarTamanio: checked })
                    }
                    small
                  />
                  {mostrarOpcionColor ? (
                    <Checkbox
                      label="Categoria/Color"
                      checked={opciones.etiquetas.mostrarColor}
                      onChange={(checked) =>
                        actualizarOpciones("etiquetas", { mostrarColor: checked })
                      }
                      small
                    />
                  ) : null}
                </div>
                <Slider
                  label="Tamano de fuente"
                  value={opciones.etiquetas.tamanioFuente}
                  min={8}
                  max={16}
                  step={1}
                  unidad="px"
                  onChange={(tamanioFuente) =>
                    actualizarOpciones("etiquetas", { tamanioFuente })
                  }
                />
                <InputColor
                  label="Color de texto"
                  value={opciones.etiquetas.color}
                  onChange={(color) =>
                    actualizarOpciones("etiquetas", { color })
                  }
                />
              </>
            ) : null}
          </div>
        </SeccionAcordeon>

        <SeccionAcordeon
          titulo="Ejes"
          icono="XY"
          colapsado={colapsados.ejes}
          onToggle={() => toggleSeccion("ejes")}
        >
          <div className="space-y-3">
            <Checkbox
              label="Mostrar titulo del eje X"
              checked={opciones.ejes.mostrarTituloX}
              onChange={(checked) =>
                actualizarOpciones("ejes", { mostrarTituloX: checked })
              }
            />
            <Checkbox
              label="Mostrar titulo del eje Y"
              checked={opciones.ejes.mostrarTituloY}
              onChange={(checked) =>
                actualizarOpciones("ejes", { mostrarTituloY: checked })
              }
            />
            <Slider
              label="Grosor de linea"
              value={opciones.ejes.grosorLinea}
              min={1}
              max={4}
              step={1}
              unidad="px"
              onChange={(grosorLinea) =>
                actualizarOpciones("ejes", { grosorLinea })
              }
            />
            <InputColor
              label="Color de ejes"
              value={opciones.ejes.colorLinea}
              onChange={(colorLinea) =>
                actualizarOpciones("ejes", { colorLinea })
              }
            />
          </div>
        </SeccionAcordeon>

        {mostrarOpcionColor ? (
          <SeccionAcordeon
            titulo="Leyenda"
            icono="LG"
            colapsado={colapsados.leyenda}
            onToggle={() => toggleSeccion("leyenda")}
          >
            <div className="space-y-3">
              <Checkbox
                label="Mostrar leyenda de colores"
                checked={opciones.leyenda.mostrar}
                onChange={(checked) =>
                  actualizarOpciones("leyenda", { mostrar: checked })
                }
              />
              {opciones.leyenda.mostrar ? (
                <Select
                  label="Posicion"
                  value={opciones.leyenda.posicion}
                  options={[
                    { value: "derecha", label: "Derecha" },
                    { value: "inferior", label: "Inferior" },
                  ]}
                  onChange={(posicion) =>
                    actualizarOpciones("leyenda", {
                      posicion: posicion as "derecha" | "inferior",
                    })
                  }
                />
              ) : null}
            </div>
          </SeccionAcordeon>
        ) : null}

        <SeccionAcordeon
          titulo="Burbujas"
          icono="OO"
          colapsado={colapsados.burbujas}
          onToggle={() => toggleSeccion("burbujas")}
        >
          <div className="space-y-3">
            <Slider
              label="Transparencia"
              value={opciones.burbujas.transparencia}
              min={0}
              max={100}
              step={5}
              unidad="%"
              onChange={(transparencia) =>
                actualizarOpciones("burbujas", { transparencia })
              }
            />
            <Checkbox
              label="Mostrar borde"
              checked={opciones.burbujas.mostrarBorde}
              onChange={(checked) =>
                actualizarOpciones("burbujas", { mostrarBorde: checked })
              }
            />
            {opciones.burbujas.mostrarBorde ? (
              <>
                <Slider
                  label="Grosor de borde"
                  value={opciones.burbujas.grosorBorde}
                  min={0}
                  max={5}
                  step={1}
                  unidad="px"
                  onChange={(grosorBorde) =>
                    actualizarOpciones("burbujas", { grosorBorde })
                  }
                />
                <InputColor
                  label="Color de borde"
                  value={opciones.burbujas.colorBorde}
                  onChange={(colorBorde) =>
                    actualizarOpciones("burbujas", { colorBorde })
                  }
                />
              </>
            ) : null}
          </div>
        </SeccionAcordeon>

        <SeccionAcordeon
          titulo="Tooltip"
          icono="??"
          colapsado={colapsados.tooltip}
          onToggle={() => toggleSeccion("tooltip")}
        >
          <div className="space-y-3">
            <Checkbox
              label="Mostrar tooltip al pasar el cursor"
              checked={opciones.tooltip.mostrar}
              onChange={(checked) =>
                actualizarOpciones("tooltip", { mostrar: checked })
              }
            />
            {opciones.tooltip.mostrar ? (
              <Select
                label="Formato de numeros"
                value={opciones.tooltip.formatoNumeros}
                options={[
                  { value: "normal", label: "Normal (12.34)" },
                  { value: "compacto", label: "Compacto (12.3K)" },
                ]}
                onChange={(formatoNumeros) =>
                  actualizarOpciones("tooltip", {
                    formatoNumeros: formatoNumeros as "normal" | "compacto",
                  })
                }
              />
            ) : null}
          </div>
        </SeccionAcordeon>
      </div>
    </div>
  );
}
