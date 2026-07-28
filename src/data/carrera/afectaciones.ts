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

function scoreEfectos(efectos: EfectosDecision): number {
  let s = (efectos.reputacion ?? 0) + (efectos.moral ?? 0);
  if (efectos.atributos) {
    for (const v of Object.values(efectos.atributos)) {
      if (typeof v === "number") s += v;
    }
  }
  s -= Math.round((efectos.riesgoLesion ?? 0) * 12);
  s -= Math.round((efectos.riesgoFinCarrera ?? 0) * 20);
  return s;
}

function formatImpactos(efectos: EfectosDecision): string[] {
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
  if ((efectos.riesgoLesion ?? 0) >= 0.1) {
    bits.push("más riesgo de lesión");
  }
  if ((efectos.riesgoFinCarrera ?? 0) >= 0.08) {
    bits.push("alerta de carrera");
  }
  return bits;
}

function includesAny(text: string, words: string[]): boolean {
  const t = text.toLowerCase();
  return words.some((w) => t.includes(w));
}

/**
 * Relato de afectación (positivo/negativo) tras una decisión.
 * Usa consecuencia explícita si viene en la opción; si no, inventa una coherente.
 */
export function construirAfectacion(
  situacion: string,
  decision: string,
  efectos: EfectosDecision,
  consecuenciaExplicit?: string
): string {
  if (consecuenciaExplicit?.trim()) {
    const impactos = formatImpactos(efectos);
    if (impactos.length === 0) return consecuenciaExplicit.trim();
    return `${consecuenciaExplicit.trim()} (${impactos.join(", ")}).`;
  }

  const score = scoreEfectos(efectos);
  const blob = `${situacion} ${decision}`;
  let relato = "";

  if (efectos.transferencia) {
    relato =
      "El pase se concreta: dejás el club y firmás en tu nuevo destino";
  } else if (includesAny(blob, ["olímpico", "esquina", "córner", "corner"])) {
    relato =
      score >= 0
        ? "En el partido siguiente conectaste mejor los córners y hasta generaste peligro real"
        : "En el partido, ninguno de los tiros de esquina salió fino: la tribuna lo notó y se enfrió el experimento";
  } else if (includesAny(blob, ["apuest", "plata en un amistoso"])) {
    relato =
      score >= 0
        ? "Te saliste a tiempo del quilombo y el cuerpo técnico lo valoró"
        : "La movida se filtró: quedaste marcado como poco profesional y el ambiente se tensó";
  } else if (includesAny(blob, ["prensa", "periodista", "entrevista", "redes", "emisora"])) {
    relato =
      score >= 0
        ? "El mensaje cayó bien: bajó el ruido y ganaste crédito afuera y adentro del vestuario"
        : "La declaración/gesto se dio vuelta en tu contra; costó más de lo que esperabas";
  } else if (includesAny(blob, ["lesion", "médico", "dolor", "isquio", "rodilla", "tobillo"])) {
    relato =
      score >= 0
        ? "Cuidaste el cuerpo: volviste más entero y sin recaídas tontas"
        : "Forzar el proceso te pasó factura: el dolor volvió y te restó confianza";
  } else if (includesAny(blob, ["selección", "sub-20", "sub-23", "eliminatoria", "federación"])) {
    relato =
      score >= 0
        ? "La Selección y tu entorno leyeron compromiso; el llamado te empujó para arriba"
        : "La decisión dejó ruido entre club y Selección; se te complicó el calendario mental";
  } else if (includesAny(blob, ["clásico", "hinchada", "barra", "derby", "derbi"])) {
    relato =
      score >= 0
        ? "En el clásico respondió la cabeza: saliste parado y con la hinchada de tu lado"
        : "El clásico te pasó por arriba: el gesto se leyó mal y te cobraron caro";
  } else if (includesAny(blob, ["entren", "gym", "doble turno", "carga", "físico"])) {
    relato =
      score >= 0
        ? "La carga bien tomada te dejó más vivo en los finales de partido"
        : "Te pasaste de rosca: llegaste pasado de vueltas y rindió menos de lo soñado";
  } else if (includesAny(blob, ["contrato", "renov", "sueldo", "bono", "agente", "cláusula"])) {
    relato =
      score >= 0
        ? "Negociaste con pulso: el club y tu bolsillo quedaron en mejor lugar"
        : "La pelea por plata dejó heridos: confianza rota y menos margen para pedir";
  } else if (includesAny(blob, ["familia", "padre", "mamá", "abuela", "casa"])) {
    relato =
      score >= 0
        ? "Ordenaste la cabeza en casa y eso se notó en la concentración semanal"
        : "La presión familiar te comió por dentro: entrenabas tenso y se te notó";
  } else if (includesAny(blob, ["técnico", "dt", "entrenador", "vestuario", "capitán"])) {
    relato =
      score >= 0
        ? "El gesto te reconcilió con el mando: volviste a entrar en los planes"
        : "El roce con el mando te restó minutos y confianza en la interna";
  } else if (includesAny(blob, ["humildad", "respeto", "perfil", "foto", "posar"])) {
    relato =
      score >= 0
        ? "La imagen limpia te sumó puntos con dirigentes y prensa local"
        : "Quedó tibio: ni rompiste ni brillaste; se diluyó el momento";
  } else if (score >= 3) {
    relato =
      "La jugada te salió a favor: sumaste crédito y el entorno lo registró como un acierto";
  } else if (score <= -3) {
    relato =
      "La decisión te cobró factura: costó más de lo pensado y se notó en el ambiente";
  } else {
    relato =
      "El efecto fue mixto: algo ganaste, algo cediste, y la temporada siguió sin dramatismos";
  }

  const impactos = formatImpactos(efectos);
  if (impactos.length === 0) return `${relato}.`;
  return `${relato} (${impactos.join(", ")}).`;
}
