import type { AtributoEntrenable } from "./types";

export const SCHEMA_VERSION = 1 as const;

export const ENERGIA_BASE = 3;
export const ENERGIA_BONO_DESCANSO = 1;
export const SEMANAS_POR_TEMPORADA = 20;
export const EDAD_INICIO = 17;
export const EDAD_RETIRO = 34;
export const TEMPORADAS_MAX = 12;

/** Decay semanal de relaciones si no se socializa esa categoría. */
export const DECAY_RELACION = 3;
export const RELACION_MIN = 0;
export const RELACION_MAX = 100;

export const COSTO_ENTRENAR = 1;
export const COSTO_SOCIALIZAR = 1;
export const COSTO_MEDIOS = 1;
export const COSTO_DESCANSAR = 1;

export const MEJORA_ATRIBUTO: Record<"perfecto" | "bien" | "fallo", number> = {
  perfecto: 3,
  bien: 2,
  fallo: 0,
};

/**
 * Semanas seguidas sin entrenar un atributo antes de que empiece a bajar.
 * En el cierre de la 5.ª semana sin drill, ese atributo pierde puntos.
 */
export const SEMANAS_SIN_ENTRENAR_PARA_DECAY = 5;
/** Puntos que baja un atributo por semana una vez alcanzado el umbral. */
export const DECAY_ATRIBUTO = 1;

export const SOCIAL_DELTA = 12;

/** Ventana de mercado cada N semanas. */
export const VENTANA_TRANSFERENCIA_SEMANAS = 10;

/** Umbrales de fama para ofertas. */
export const FAMA_OFERTA_INTERMEDIA = 35;
export const FAMA_OFERTA_EUROPA = 65;

export const ATRIBUTOS_ENTRENABLES: AtributoEntrenable[] = [
  "ritmo",
  "tiro",
  "pase",
  "regate",
  "defensa",
  "fisico",
];

export const LABEL_ATRIBUTO: Record<AtributoEntrenable, string> = {
  ritmo: "Ritmo",
  tiro: "Tiro",
  pase: "Pase",
  regate: "Regate",
  defensa: "Defensa",
  fisico: "Físico",
};

export const SALARIO_BASE_POR_NIVEL: Record<
  "colombia_primera" | "intermedia" | "grande_europa",
  number
> = {
  colombia_primera: 800,
  intermedia: 3500,
  grande_europa: 18000,
};

export const SAVE_KEY = "nueva-estrella:partida";
