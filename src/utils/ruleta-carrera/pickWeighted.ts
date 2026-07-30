import type { OpcionRuleta } from "@/data/ruleta-carrera/types";

/** Selección aleatoria ponderada. */
export function pickWeighted<T>(
  opciones: OpcionRuleta<T>[],
  rng: () => number = Math.random
): OpcionRuleta<T> {
  if (opciones.length === 0) {
    throw new Error("pickWeighted: sin opciones");
  }
  const weights = opciones.map((o) => Math.max(0.0001, o.peso ?? 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < opciones.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return opciones[i]!;
  }
  return opciones[opciones.length - 1]!;
}

/** Ángulos acumulados (grados) proporcionales al peso. */
export function segmentAngles(
  opciones: Pick<OpcionRuleta, "peso">[],
): { start: number; sweep: number; mid: number }[] {
  if (!opciones || opciones.length === 0) return [];
  const weights = opciones.map((o) => Math.max(0.0001, o.peso ?? 1));
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return [];
  let acc = 0;
  return weights.map((w) => {
    const sweep = (w / total) * 360;
    const start = acc;
    acc += sweep;
    return { start, sweep, mid: start + sweep / 2 };
  });
}
