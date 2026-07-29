import type { Posicion } from "@/data/carrera/types";
import type {
  AtributoRuleta,
  AtributoRuletaField,
  AtributoRuletaGk,
  HabilidadEspecial,
  NivelStat,
  OpcionRuleta,
  Region,
} from "./types";

export const SEGMENT_COLORS = [
  "#c9a227",
  "#2f6fed",
  "#2a9e5c",
  "#d94a3d",
  "#8b5cf6",
  "#0ea5e9",
  "#f97316",
  "#14b8a6",
  "#e11d48",
  "#64748b",
  "#a855f7",
  "#84cc16",
];

export const APELLIDOS_COLOMBIA = [
  "García",
  "Rodríguez",
  "Martínez",
  "López",
  "Hernández",
  "González",
  "Pérez",
  "Sánchez",
  "Ramírez",
  "Torres",
  "Díaz",
  "Vargas",
  "Moreno",
  "Jiménez",
  "Ruiz",
  "Castro",
  "Ortiz",
  "Gutiérrez",
  "Rojas",
  "Muñoz",
];

export const OPCIONES_POSICION: OpcionRuleta<Posicion>[] = [
  { id: "arquero", label: "Arquero", valor: "arquero" },
  { id: "dc", label: "Defensa central", valor: "defensa_central" },
  { id: "lat", label: "Lateral", valor: "lateral" },
  { id: "med", label: "Mediocampista", valor: "mediocampista" },
  { id: "ext", label: "Extremo", valor: "extremo" },
  { id: "del", label: "Delantero", valor: "delantero" },
];

export const OPCIONES_EDAD_DEBUT: OpcionRuleta<number>[] = [16, 17, 18, 19, 20, 21, 22].map(
  (n) => ({ id: `edad-${n}`, label: `${n} años`, valor: n })
);

export const OPCIONES_TEMPORADAS: OpcionRuleta<number>[] = Array.from(
  { length: 26 },
  (_, i) => {
    const n = 5 + i;
    return { id: `temp-${n}`, label: `${n} temp.`, valor: n };
  }
);

export const OPCIONES_CANTIDAD_EQUIPOS: OpcionRuleta<number>[] = [
  { id: "eq-1", label: "1 (one-club man)", valor: 1, peso: 1 },
  { id: "eq-2", label: "2 equipos", valor: 2, peso: 2 },
  { id: "eq-3", label: "3 equipos", valor: 3, peso: 3 },
  { id: "eq-4", label: "4 equipos", valor: 4, peso: 3 },
  { id: "eq-5", label: "5 equipos", valor: 5, peso: 2 },
  { id: "eq-6", label: "6 equipos", valor: 6, peso: 1 },
];

const NOMBRES_1_A_10: Record<string, string[]> = {
  ritmo: [
    "Silla de ruedas",
    "Paso de tortuga",
    "Trote de barrio",
    "Ritmo de cancha 5",
    "Velocidad decente",
    "Pierna rápida",
    "Rayo de banda",
    "Turbo Dimayor",
    "Misil de contra",
    "Velocidad de la luz",
  ],
  tiro: [
    "Patea al arco rival… del otro lado",
    "Tiro de utilero",
    "Disparo de media tarde",
    "Remate aceptable",
    "Definidor de oficio",
    "Killer de área",
    "Cañón de media distancia",
    "Francotirador",
    "Letal de área chica",
    "Dios del remate",
  ],
  pase: [
    "Pase a nadie",
    "Entrega nerviosa",
    "Pase de supervivencia",
    "Buena salida",
    "Conector útil",
    "Visión clara",
    "Cerebro del equipo",
    "Hilo de oro",
    "Arquitecto total",
    "Oráculo del pase",
  ],
  regate: [
    "Pelota pegada al pie… y al piso",
    "Gambeta de ensayo",
    "Amague básico",
    "Desborde tímido",
    "Regate útil",
    "Desequilibrante",
    "Gambeta de Lucho light",
    "Mago de la cal",
    "Imparable 1v1",
    "Ilusionista puro",
  ],
  defensa: [
    "Marca de fantasma",
    "Corte afortunado",
    "Anticipo flojo",
    "Marcador correcto",
    "Aguerrido de área",
    "Muro de barrio",
    "Líbero elegante",
    "Muro defensivo",
    "Candado total",
    "Muralla impenetrable",
  ],
  fisico: [
    "Viento lo tumba",
    "Físico de pretemporada",
    "Aguante corto",
    "Cuerpo de pelea",
    "Duelo pareja",
    "Fuerte en el choque",
    "Tanque de mitad",
    "Pulmón de acero",
    "Bestia de área",
    "Titán del fútbol",
  ],
  atajadas: [
    "Colador certificado",
    "Ataja de milagro",
    "Seguro a ratos",
    "Manos decentes",
    "Seguro bajo los tres palos",
    "Reflejos felinos",
    "Muro con guantes",
    "Imbatible en el 1v1",
    "Leyenda del arco",
    "Dios de las vallas",
  ],
  reflejos: [
    "Reacciones de siesta",
    "Lento al segundo palo",
    "Volada justa",
    "Buen instinto",
    "Gato ágil",
    "Reflejos felinos",
    "Elastico total",
    "Vuela a todo",
    "Imposible de batir cerca",
    "Matrix en el arco",
  ],
};

export function nivelesStatPara(atributo: AtributoRuleta): NivelStat[] {
  const nombres = NOMBRES_1_A_10[atributo] ?? NOMBRES_1_A_10.fisico!;
  return Array.from({ length: 10 }, (_, i) => ({
    valor: i + 1,
    nombre: nombres[i]!,
  }));
}

export function opcionesStat(atributo: AtributoRuleta): OpcionRuleta<NivelStat>[] {
  return nivelesStatPara(atributo).map((n) => ({
    id: `${atributo}-${n.valor}`,
    label: `${n.valor} · ${n.nombre}`,
    valor: n,
  }));
}

export const STATS_FIELD: { atributo: AtributoRuletaField; label: string }[] = [
  { atributo: "ritmo", label: "Ritmo" },
  { atributo: "tiro", label: "Disparo" },
  { atributo: "regate", label: "Gambeta" },
  { atributo: "pase", label: "Pase" },
  { atributo: "fisico", label: "Fuerza" },
  { atributo: "defensa", label: "Defensa" },
];

export const STATS_GK: { atributo: AtributoRuletaGk; label: string }[] = [
  { atributo: "atajadas", label: "Ubicación" },
  { atributo: "reflejos", label: "Volada" },
  { atributo: "fisico", label: "Salto" },
  { atributo: "defensa", label: "Despeje" },
  { atributo: "ritmo", label: "Velocidad" },
  { atributo: "pase", label: "Inteligencia" },
];

export const OPCIONES_TIENE_HABILIDAD: OpcionRuleta<boolean>[] = [
  { id: "hab-si", label: "Sí", valor: true, peso: 1 },
  { id: "hab-no", label: "No", valor: false, peso: 1 },
];

export const OPCIONES_MEJORA_EN_CLUB: OpcionRuleta<boolean>[] = [
  { id: "mej-si", label: "Sí, mejoró", valor: true, peso: 1 },
  { id: "mej-no", label: "No mejoró", valor: false, peso: 1 },
];

/** Stats de la posición que aún pueden subir (< 10). */
export function atributosMejorables(
  posicion: Posicion,
  statsBase: Partial<Record<AtributoRuleta, number>>
): { atributo: AtributoRuleta; label: string }[] {
  const lista = posicion === "arquero" ? STATS_GK : STATS_FIELD;
  return lista.filter((s) => (statsBase[s.atributo] ?? 1) < 10);
}

/** Solo niveles estrictamente mayores al actual. */
export function opcionesStatMejora(
  atributo: AtributoRuleta,
  actual: number
): OpcionRuleta<NivelStat>[] {
  return opcionesStat(atributo).filter((o) => o.valor.valor > actual);
}

export const HABILIDADES: HabilidadEspecial[] = [
  {
    id: "gambeta-lucho",
    nombre: "Gambeta de Lucho",
    descripcion: "+2 regate",
    efecto: { atributo: "regate", bono: 2 },
  },
  {
    id: "tiro-libre",
    nombre: "Tiro libre letal",
    descripcion: "+2 tiro",
    efecto: { atributo: "tiro", bono: 2 },
  },
  {
    id: "pulmon",
    nombre: "Pulmón inagotable",
    descripcion: "+2 físico",
    efecto: { atributo: "fisico", bono: 2 },
  },
  {
    id: "capitan",
    nombre: "Capitán nato",
    descripcion: "+2 liderazgo",
    efecto: { atributo: "liderazgo", bono: 2 },
  },
  {
    id: "cabeza-gol",
    nombre: "Cabeza de gol",
    descripcion: "+2 tiro",
    efecto: { atributo: "tiro", bono: 2 },
  },
  {
    id: "vision-20",
    nombre: "Visión de últimos 20 m",
    descripcion: "+2 pase",
    efecto: { atributo: "pase", bono: 2 },
  },
  {
    id: "muro",
    nombre: "Muro imbatible",
    descripcion: "+2 defensa",
    efecto: { atributo: "defensa", bono: 2 },
    soloDefensivo: true,
  },
];

export function habilidadesPara(posicion: Posicion): HabilidadEspecial[] {
  return HABILIDADES.filter((h) => {
    if (!h.soloDefensivo) return true;
    return (
      posicion === "arquero" ||
      posicion === "defensa_central" ||
      posicion === "lateral"
    );
  });
}

export const MOTIVOS_SALIDA: OpcionRuleta<string>[] = [
  {
    id: "tacticas",
    label: "Diferencias tácticas con el técnico",
    valor: "diferencias tácticas con el técnico",
    peso: 3,
  },
  {
    id: "oferta",
    label: "Mejor oferta económica",
    valor: "una mejor oferta económica",
    peso: 3,
  },
  {
    id: "minutos",
    label: "Buscaba más minutos",
    valor: "buscaba más minutos",
    peso: 3,
  },
  {
    id: "finanzas",
    label: "El club necesitaba vender",
    valor: "el club necesitaba vender por finanzas",
    peso: 2,
  },
  {
    id: "reto",
    label: "Quería un nuevo reto",
    valor: "quería un nuevo reto en su carrera",
    peso: 3,
  },
  {
    id: "utilero",
    label: "Pelea con el utilero por el número",
    valor: "se peleó con el utilero por el número de camiseta",
    peso: 1,
  },
  {
    id: "arepa",
    label: "Extrañaba la arepa de huevo",
    valor: "extrañaba demasiado la arepa de huevo y pidió la salida",
    peso: 1,
  },
];

export const MOTIVOS_RETIRO: OpcionRuleta<string>[] = [
  {
    id: "edad",
    label: "Edad y desgaste físico",
    valor: "la edad y el desgaste físico",
    peso: 3,
  },
  {
    id: "rodilla",
    label: "Lesión crónica de rodilla",
    valor: "una lesión crónica de rodilla",
    peso: 2,
  },
  {
    id: "familia",
    label: "Dedicarse a la familia",
    valor: "quiso dedicarse a su familia",
    peso: 3,
  },
  {
    id: "fisicos",
    label: "Problemas físicos",
    valor: "problemas físicos que ya no le permitían competir al nivel exigido",
    peso: 2,
  },
  {
    id: "streamer",
    label: "Se hizo streamer de EA FC",
    valor: "se hizo streamer de FIFA/EA FC y nunca volvió a los entrenamientos",
    peso: 1,
  },
  {
    id: "areperia",
    label: "Abrió una arepería",
    valor: "abrió una arepería con el nombre de su gambeta especial y se olvidó de retirarse formalmente",
    peso: 1,
  },
];

export const LOGROS_SELECCION: OpcionRuleta<string>[] = [
  {
    id: "nada",
    label: "No ganó nada con la selección",
    valor: "no ganó nada con la Selección Colombia",
    peso: 3,
  },
  {
    id: "subca",
    label: "Subcampeón Copa América",
    valor: "fue subcampeón de Copa América",
    peso: 2,
  },
  {
    id: "ca",
    label: "Campeón Copa América",
    valor: "fue campeón de Copa América",
    peso: 1,
  },
  {
    id: "clasifico",
    label: "Clasificó a un Mundial",
    valor: "clasificó a un Mundial",
    peso: 2,
  },
  {
    id: "grupos",
    label: "Mundial — fase de grupos",
    valor: "jugó un Mundial y quedó eliminado en fase de grupos",
    peso: 2,
  },
  {
    id: "octavos",
    label: "Mundial — octavos o más",
    valor: "jugó un Mundial y llegó a octavos o más",
    peso: 1,
  },
];

export const REGION_LABELS: Record<Region, string> = {
  colombia: "Colombia",
  sudamerica: "Sudamérica",
  europa: "Europa",
  norteamerica: "Norteamérica (MLS/MX)",
  asia: "Asia",
};

/** Pesos de región según índice del cambio (0 = primer fichaje fuera del debut). */
export function opcionesRegion(cambioIndex: number): OpcionRuleta<Region>[] {
  const late = cambioIndex >= 2;
  const mid = cambioIndex === 1;
  return [
    {
      id: "col",
      label: "Colombia",
      valor: "colombia",
      peso: late ? 1 : mid ? 2 : 4,
    },
    {
      id: "sud",
      label: "Sudamérica",
      valor: "sudamerica",
      peso: late ? 2 : mid ? 3 : 3,
    },
    {
      id: "eur",
      label: "Europa",
      valor: "europa",
      peso: late ? 4 : mid ? 2 : 1,
    },
    {
      id: "nor",
      label: "Norteamérica",
      valor: "norteamerica",
      peso: late ? 2 : mid ? 2 : 1,
    },
    {
      id: "asia",
      label: "Asia",
      valor: "asia",
      peso: late ? 3 : mid ? 1 : 1,
    },
  ];
}

export function rangoGoles(posicion: Posicion): { min: number; max: number } {
  switch (posicion) {
    case "delantero":
      return { min: 100, max: 1000 };
    case "extremo":
      return { min: 50, max: 800 };
    case "mediocampista":
      return { min: 40, max: 600 };
    case "defensa_central":
    case "lateral":
      return { min: 10, max: 150 };
    case "arquero":
      return { min: 0, max: 40 };
  }
}

export function rangoAsistencias(posicion: Posicion): { min: number; max: number } {
  switch (posicion) {
    case "delantero":
      return { min: 40, max: 600 };
    case "extremo":
      return { min: 50, max: 800 };
    case "mediocampista":
      return { min: 40, max: 800 };
    case "defensa_central":
    case "lateral":
      return { min: 10, max: 150 };
    case "arquero":
      return { min: 0, max: 20 };
  }
}

export function rangoVallas(posicion: Posicion): { min: number; max: number } | null {
  if (posicion === "arquero") return { min: 20, max: 250 };
  if (posicion === "defensa_central" || posicion === "lateral") {
    return { min: 10, max: 180 };
  }
  return null;
}

/** Genera opciones numéricas en pasos para no saturar la rueda. */
export function opcionesRango(
  min: number,
  max: number,
  pasos = 10
): OpcionRuleta<number>[] {
  const out: OpcionRuleta<number>[] = [];
  for (let i = 0; i < pasos; i++) {
    const t = pasos === 1 ? 0 : i / (pasos - 1);
    const valor = Math.round(min + (max - min) * t);
    out.push({
      id: `r-${valor}-${i}`,
      label: String(valor),
      valor,
    });
  }
  return out;
}

/** Rangos redondos para la ruleta (ej. 200–300); el exacto se revela después. */
export function opcionesRangosRedondos(
  min: number,
  max: number
): OpcionRuleta<{ min: number; max: number }>[] {
  const span = Math.max(0, max - min);
  let step = 100;
  if (span <= 40) step = 10;
  else if (span <= 120) step = 25;
  else if (span <= 350) step = 50;
  else step = 100;

  const start = Math.floor(min / step) * step;
  const out: OpcionRuleta<{ min: number; max: number }>[] = [];

  for (let lo = start; lo <= max; lo += step) {
    const from = Math.max(lo, min);
    const hi = Math.min(lo + step - 1, max);
    if (from > hi) continue;
    out.push({
      id: `rg-${from}-${hi}`,
      label: from === hi ? `${from}` : `${from}–${hi}`,
      valor: { min: from, max: hi },
    });
    if (hi >= max) break;
  }

  if (out.length === 0) {
    out.push({
      id: `rg-${min}-${max}`,
      label: min === max ? `${min}` : `${min}–${max}`,
      valor: { min, max },
    });
  }
  return out;
}

export function randomEnRango(
  min: number,
  max: number,
  rng: () => number = Math.random
): number {
  const a = Math.min(min, max);
  const b = Math.max(min, max);
  return a + Math.floor(rng() * (b - a + 1));
}
