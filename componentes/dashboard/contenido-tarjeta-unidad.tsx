import type { TarjetaUnidad } from "@/datos/dashboard";
import { ModuloArbolProblemas } from "@/modulos/arbol-problemas/componentes/modulo-arbol-problemas";
import { ModuloDistribucionArbitraria } from "@/modulos/distribucion-arbitraria/componentes/modulo-distribucion-arbitraria";
import { ModuloDiagramaBastones } from "@/modulos/diagrama-bastones/componentes/modulo-diagrama-bastones";
import { ModuloDiagramaBarras } from "@/modulos/diagrama-barras/componentes/modulo-diagrama-barras";
import { ModuloDiagramaColumnasCompuestas } from "@/modulos/diagrama-columnas-compuestas/componentes/modulo-diagrama-columnas-compuestas";
import { ModuloDiagramaColumnasSimples } from "@/modulos/diagrama-columnas-simples/componentes/modulo-diagrama-columnas-simples";
import { ModuloDiagramaDispersion } from "@/modulos/diagrama-dispersion/componentes/modulo-diagrama-dispersion";
import { ModuloDiagramaLineal } from "@/modulos/diagrama-lineal/componentes/modulo-diagrama-lineal";
import { ModuloDiagramaPictogramas } from "@/modulos/diagrama-pictogramas/componentes/modulo-diagrama-pictogramas";
import { ModuloDiagramaBurbujas } from "@/modulos/diagrama-burbujas/componentes/modulo-diagrama-burbujas";
import { ModuloFormulaTema1 } from "@/modulos/formulas-tema-1/componentes/modulo-formula-tema-1";
import { ModuloFormulaSegundoParcial } from "@/modulos/formulas-segundo-parcial/componentes/modulo-formula-segundo-parcial";
import { ModuloMedidaPosicion } from "@/modulos/medidas-posicion/componentes/modulo-medida-posicion";
import { ModuloMetodoMaximoEntero } from "@/modulos/metodo-maximo-entero/componentes/modulo-metodo-maximo-entero";
import { ModuloMetodoSimpleInspeccion } from "@/modulos/metodo-simple-inspeccion/componentes/modulo-metodo-simple-inspeccion";
import { ModuloMetodoSturges } from "@/modulos/metodo-sturges/componentes/modulo-metodo-sturges";
import type { IdentificadorFormulaTema1 } from "@/modulos/formulas-tema-1/tipos";
import type { IdentificadorFormulaSegundoParcial } from "@/modulos/formulas-segundo-parcial/tipos";
import type { IdentificadorMedidaPosicion } from "@/modulos/medidas-posicion/tipos";

interface ContenidoTarjetaUnidadProps {
  unidadTitulo: string;
  tarjeta: TarjetaUnidad;
  alVolver: () => void;
}

function VistaPlaceholderTarjeta({
  unidadTitulo,
  tarjeta,
}: {
  unidadTitulo: string;
  tarjeta: TarjetaUnidad;
}) {
  return (
    <section className="rounded-[1.8rem] border border-verde-claro bg-superficie-principal/95 p-6 shadow-[var(--sombra-panel)] sm:p-7">
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-acento-secundario">
            Herramienta en preparacion
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-texto-principal">
            {tarjeta.titulo}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-texto-secundario sm:text-base">
            {tarjeta.descripcionTrabajo}
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-verde-claro bg-panel-resalte/60 p-5">
          <p className="text-sm font-semibold text-acento-oscuro">
            {tarjeta.nota}
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-dashed border-acento-secundario/30 bg-crema-media/60 p-5">
          <p className="text-sm leading-7 text-texto-secundario sm:text-base">
            {unidadTitulo} ya queda listo para que luego integremos esta
            herramienta con el mismo patron de apertura total y regreso simple.
          </p>
        </div>
      </div>
    </section>
  );
}

function esFormulaTema1(
  herramientaId: TarjetaUnidad["herramientaId"],
): herramientaId is IdentificadorFormulaTema1 {
  return (
    herramientaId === "formula-razon" ||
    herramientaId === "formula-indice" ||
    herramientaId === "formula-proporcion" ||
    herramientaId === "formula-porcentaje" ||
    herramientaId === "formula-porcentaje-cambio" ||
    herramientaId === "formula-porcentaje-error" ||
    herramientaId === "formula-tasa"
  );
}

function esFormulaSegundoParcial(
  herramientaId: TarjetaUnidad["herramientaId"],
): herramientaId is IdentificadorFormulaSegundoParcial {
  return (
    herramientaId === "permutacion-lineal" ||
    herramientaId === "permutacion-con-repeticion" ||
    herramientaId === "permutacion-circular" ||
    herramientaId === "variacion-sin-repeticion" ||
    herramientaId === "variacion-con-repeticion" ||
    herramientaId === "combinacion" ||
    herramientaId === "distribucion-binomial" ||
    herramientaId === "distribucion-geometrica" ||
    herramientaId === "distribucion-pascal" ||
    herramientaId === "distribucion-hipergeometrica" ||
    herramientaId === "distribucion-poisson" ||
    herramientaId === "complementos-acumulaciones"
  );
}

function esMedidaPosicion(
  herramientaId: TarjetaUnidad["herramientaId"],
): herramientaId is IdentificadorMedidaPosicion {
  return (
    herramientaId === "medidas-posicion-todas" ||
    herramientaId === "media-aritmetica" ||
    herramientaId === "media-geometrica" ||
    herramientaId === "media-armonica" ||
    herramientaId === "mediana" ||
    herramientaId === "moda" ||
    herramientaId === "cuartiles" ||
    herramientaId === "deciles" ||
    herramientaId === "percentiles"
  );
}

export function ContenidoTarjetaUnidad({
  unidadTitulo,
  tarjeta,
  alVolver,
}: ContenidoTarjetaUnidadProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={alVolver}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-verde-claro bg-white/90 px-4 py-2 text-sm font-semibold text-texto-principal transition hover:border-acento-principal hover:text-acento-principal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento-principal"
      >
        {"<- Volver a cards de "}
        {unidadTitulo}
      </button>

      {esFormulaTema1(tarjeta.herramientaId) ? (
        <ModuloFormulaTema1
          key={tarjeta.herramientaId}
          formulaId={tarjeta.herramientaId}
        />
      ) : esFormulaSegundoParcial(tarjeta.herramientaId) ? (
        <ModuloFormulaSegundoParcial
          key={tarjeta.herramientaId}
          formulaId={tarjeta.herramientaId}
        />
      ) : esMedidaPosicion(tarjeta.herramientaId) ? (
        <ModuloMedidaPosicion
          key={tarjeta.herramientaId}
          medidaId={tarjeta.herramientaId}
        />
      ) : tarjeta.herramientaId === "arbol-problemas" ? (
        <ModuloArbolProblemas key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-columnas-simples" ? (
        <ModuloDiagramaColumnasSimples key={tarjeta.id} />
      ) : tarjeta.herramientaId === "distribucion-arbitraria" ? (
        <ModuloDistribucionArbitraria key={tarjeta.id} />
      ) : tarjeta.herramientaId === "metodo-sturges" ? (
        <ModuloMetodoSturges key={tarjeta.id} />
      ) : tarjeta.herramientaId === "metodo-maximo-entero" ? (
        <ModuloMetodoMaximoEntero key={tarjeta.id} />
      ) : tarjeta.herramientaId === "metodo-simple-inspeccion" ? (
        <ModuloMetodoSimpleInspeccion key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-columnas-compuestas" ? (
        <ModuloDiagramaColumnasCompuestas key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-barras" ? (
        <ModuloDiagramaBarras key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-bastones" ? (
        <ModuloDiagramaBastones key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-dispersion" ? (
        <ModuloDiagramaDispersion key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-lineal" ? (
        <ModuloDiagramaLineal key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-pictogramas" ? (
        <ModuloDiagramaPictogramas key={tarjeta.id} />
      ) : tarjeta.herramientaId === "diagrama-burbujas" ? (
        <ModuloDiagramaBurbujas key={tarjeta.id} />
      ) : (
        <VistaPlaceholderTarjeta unidadTitulo={unidadTitulo} tarjeta={tarjeta} />
      )}
    </div>
  );
}
