import type { ConfigTiming, ResultadoMinijuego, TipoResultadoTiming } from "@/data/nueva-estrella/types";

/** Posición del indicador 0–1 con ping-pong. */
export function posicionIndicador(elapsedMs: number, velocidad: number): number {
  const cycleMs = 1000 / Math.max(0.15, velocidad);
  const t = (elapsedMs % (cycleMs * 2)) / cycleMs;
  return t <= 1 ? t : 2 - t;
}

export function evaluarToque(
  posicion: number,
  config: ConfigTiming,
  timestampToqueMs: number
): ResultadoMinijuego {
  const halfVerde = config.zonaVerdeAncho / 2;
  const halfAmarilla = config.zonaAmarillaAncho / 2;
  const dist = Math.abs(posicion - config.zonaCentro);

  let tipo: TipoResultadoTiming = "fallo";
  if (dist <= halfVerde) tipo = "perfecto";
  else if (dist <= halfAmarilla) tipo = "bien";

  return {
    tipo,
    timestampToqueMs,
    zonaObjetivoCentro: config.zonaCentro,
    zonaObjetivoAncho: config.zonaVerdeAncho,
    posicionIndicador: posicion,
  };
}

/**
 * Mejor atributo → zona verde más ancha y velocidad más baja.
 * dificultad 0–1 endurece (rival/momento/energía baja).
 */
export function configTimingDesdeAtributo(
  atributo: number,
  dificultad = 0.4
): ConfigTiming {
  const skill = Math.max(1, Math.min(99, atributo)) / 99;
  const d = Math.max(0, Math.min(1, dificultad));

  const zonaVerdeAncho = 0.1 + skill * 0.14 - d * 0.1;
  const zonaAmarillaAncho = zonaVerdeAncho + 0.1 + skill * 0.08 - d * 0.04;
  const velocidad = 0.55 + d * 0.9 - skill * 0.35;

  return {
    velocidad: Math.max(0.35, Math.min(1.6, velocidad)),
    zonaCentro: 0.5,
    zonaVerdeAncho: Math.max(0.04, Math.min(0.28, zonaVerdeAncho)),
    zonaAmarillaAncho: Math.max(0.12, Math.min(0.45, zonaAmarillaAncho)),
  };
}
