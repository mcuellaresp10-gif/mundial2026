import type { Atributos, EfectosDecision } from "./types";

const ATTR_ES: Record<keyof Atributos, string> = {
  ritmo: "ritmo",
  tiro: "tiro",
  pase: "pase",
  regate: "regate",
  defensa: "defensa",
  fisico: "físico",
  atajadas: "atajadas",
  reflejos: "reflejos",
};

/** Chips cortos de impacto (+Moral · −Ritmo). */
export function formatImpactos(efectos: EfectosDecision): string[] {
  const bits: string[] = [];
  if (efectos.atributos) {
    for (const [k, v] of Object.entries(efectos.atributos)) {
      if (typeof v !== "number" || v === 0) continue;
      const label = ATTR_ES[k as keyof Atributos] ?? k;
      bits.push(`${v > 0 ? "+" : ""}${v} ${label}`);
    }
  }
  if (efectos.reputacion) {
    bits.push(
      `${efectos.reputacion > 0 ? "+" : ""}${efectos.reputacion} reputación`
    );
  }
  if (efectos.moral) {
    bits.push(`${efectos.moral > 0 ? "+" : ""}${efectos.moral} moral`);
  }
  if (efectos.transferencia) {
    bits.push("cambio de club");
  }
  if (efectos.buscarSalida) {
    bits.push("busca salida");
  }
  if (efectos.rendimientoSeleccion === "figura") {
    bits.push("figura Selección");
  } else if (efectos.rendimientoSeleccion === "gris") {
    bits.push("bajo impacto Selección");
  } else if (efectos.rendimientoSeleccion === "correcto") {
    bits.push("aporte Selección");
  }
  if (efectos.convocatoria) {
    bits.push(
      efectos.convocatoria === "mayor"
        ? "convocado mayor"
        : efectos.convocatoria === "sub23"
          ? "convocado Sub-23"
          : "convocado Sub-20"
    );
  }
  if (efectos.forzarLesion === "grave") {
    bits.push("lesión grave");
  } else if (efectos.forzarLesion === "leve") {
    bits.push("lesión");
  } else if ((efectos.riesgoLesion ?? 0) >= 0.1) {
    bits.push("+riesgo lesión");
  }
  if ((efectos.riesgoFinCarrera ?? 0) >= 0.08) {
    bits.push("alerta carrera");
  }
  return bits;
}

/**
 * Afectación corta estilo vestuario (chips), no prosa.
 * Si hay consecuencia explícita, se acorta a una línea + chips.
 */
export function construirAfectacion(
  _situacion: string,
  _decision: string,
  efectos: EfectosDecision,
  consecuenciaExplicit?: string
): string {
  const impactos = formatImpactos(efectos);
  const chip = impactos.length > 0 ? impactos.join(" · ") : "sin cambio";

  if (consecuenciaExplicit?.trim()) {
    const corta = consecuenciaExplicit.trim().slice(0, 70);
    return impactos.length > 0 ? `${corta} · ${chip}` : corta;
  }

  return chip;
}
