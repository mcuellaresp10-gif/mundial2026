import { MEJORA_ATRIBUTO } from "@/data/nueva-estrella/constantes";
import type { TipoResultadoTiming } from "@/data/nueva-estrella/types";

/**
 * Soft-cap: cuanto más cerca de 99, menor la ganancia por entrenamiento.
 * Determinístico (sin RNG) para tests y balance predecible.
 */
export function gananciaEntrenamiento(
  valorActual: number,
  tipo: TipoResultadoTiming
): number {
  const base = MEJORA_ATRIBUTO[tipo];
  if (base <= 0 || valorActual >= 99) return 0;

  let gain: number;
  if (valorActual < 70) {
    gain = base;
  } else if (valorActual < 88) {
    gain = tipo === "perfecto" ? 2 : 1;
  } else if (valorActual < 94) {
    gain = 1;
  } else {
    // 94–98: solo un toque perfecto suma +1
    gain = tipo === "perfecto" ? 1 : 0;
  }

  return Math.min(gain, 99 - valorActual);
}
