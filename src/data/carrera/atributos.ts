import type { Atributos, Posicion } from "./types";

/**
 * Atributos iniciales a los 15 años (cantera).
 * Escala 0–99. Ajustables; no vino tabla oficial en el brief.
 */
export const ATRIBUTOS_INICIALES: Record<Posicion, Atributos> = {
  arquero: {
    ritmo: 38,
    tiro: 18,
    pase: 36,
    regate: 22,
    defensa: 28,
    fisico: 48,
    atajadas: 56,
    reflejos: 58,
  },
  defensa_central: {
    ritmo: 44,
    tiro: 24,
    pase: 42,
    regate: 32,
    defensa: 58,
    fisico: 56,
  },
  lateral: {
    ritmo: 58,
    tiro: 30,
    pase: 46,
    regate: 48,
    defensa: 50,
    fisico: 48,
  },
  mediocampista: {
    ritmo: 50,
    tiro: 42,
    pase: 58,
    regate: 52,
    defensa: 46,
    fisico: 48,
  },
  extremo: {
    ritmo: 62,
    tiro: 46,
    pase: 48,
    regate: 60,
    defensa: 26,
    fisico: 42,
  },
  delantero: {
    ritmo: 55,
    tiro: 58,
    pase: 40,
    regate: 52,
    defensa: 22,
    fisico: 50,
  },
};

/** Pesos de atributos por posición para rendimiento de temporada (suman ~1). */
export const PESOS_RENDIMIENTO: Record<Posicion, Partial<Record<keyof Atributos, number>>> = {
  arquero: { atajadas: 0.35, reflejos: 0.3, fisico: 0.2, pase: 0.15 },
  defensa_central: { defensa: 0.35, fisico: 0.25, ritmo: 0.2, pase: 0.2 },
  lateral: { ritmo: 0.3, defensa: 0.25, pase: 0.25, regate: 0.2 },
  mediocampista: { pase: 0.3, regate: 0.25, fisico: 0.25, defensa: 0.2 },
  extremo: { ritmo: 0.3, regate: 0.3, pase: 0.2, tiro: 0.2 },
  delantero: { tiro: 0.35, ritmo: 0.25, fisico: 0.2, regate: 0.2 },
};

export const POSICION_LABELS: Record<Posicion, string> = {
  arquero: "Arquero",
  defensa_central: "Defensa central",
  lateral: "Lateral",
  mediocampista: "Mediocampista",
  extremo: "Extremo",
  delantero: "Delantero",
};

export const NACIONALIDADES_V1 = [
  "Colombia",
  "Venezuela",
  "Ecuador",
  "Perú",
  "Panamá",
] as const;

export function clipAtributo(n: number): number {
  return Math.max(1, Math.min(99, Math.round(n)));
}

export function clipScore(n: number, min = -100, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

/**
 * Media (overall) del jugador: promedio ponderado de atributos clave por posición.
 * Escala 1–99, estilo carta FIFA.
 */
export function calcularMedia(atributos: Atributos, posicion: Posicion): number {
  const pesos = PESOS_RENDIMIENTO[posicion];
  let sum = 0;
  let wSum = 0;
  for (const [key, w] of Object.entries(pesos)) {
    if (w == null) continue;
    const raw = atributos[key as keyof Atributos];
    const val = typeof raw === "number" ? raw : 40;
    sum += val * w;
    wSum += w;
  }
  if (wSum <= 0) {
    const core = [
      atributos.ritmo,
      atributos.tiro,
      atributos.pase,
      atributos.regate,
      atributos.defensa,
      atributos.fisico,
    ];
    return clipAtributo(core.reduce((a, b) => a + b, 0) / core.length);
  }
  return clipAtributo(sum / wSum);
}
