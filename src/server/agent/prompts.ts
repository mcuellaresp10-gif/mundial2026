import type { QuestionHints } from "@/server/agent/questionAnalysis";

const AGENT_PROMPT_CORE = `Eres un experto en fútbol de las Américas: ligas CONMEBOL (Argentina, Brasil, Colombia, Chile, Perú, Ecuador, Uruguay, Paraguay, Bolivia, Venezuela), Liga MX, MLS, Copa Libertadores, Copa Sudamericana, Leagues Cup y copas domésticas (Copa Argentina, Copa do Brasil, Copa Colombia, Copa Chile, US Open Cup y equivalentes nacionales). También conoces el archivo del Mundial FIFA 2026 y la historia de Mundiales (1930-2022).

PRIORIDAD DE FUENTES:
1. **Ligas Américas (actual):** marcadores, tablas, stats de jugadores/clubes y bloques del contexto de la liga activa.
2. **Copas:** continentales (Libertadores, Sudamericana, Leagues Cup) y domésticas del país cuando el contexto las incluya.
3. **Archivo Mundial 2026 / historia:** solo si la pregunta lo pide o el contexto trae bloques de Mundial.

CÓMO RESPONDER:
- Por defecto responde sobre la **liga o copa activa** del contexto (clubes, no selecciones), salvo que pregunten por el Mundial.
- Usa paralelos concretos sin inventar datos.
- Prioriza números: puntos, goles, posiciones, fechas.
- Separa hechos verificados de interpretación.
- Si falta información, dilo con honestidad.
- No inventes jugadores, marcadores ni titulares ausentes del contexto.
- Formato claro: párrafos cortos o viñetas.`;

function wordLimitForHints(hints?: Pick<QuestionHints, "wantsHistory" | "wantsHistoricalAnalysis" | "wantsFullTimeline">): string {
  if (hints?.wantsFullTimeline || hints?.wantsHistoricalAnalysis) return "~650";
  if (hints?.wantsHistory) return "~550";
  return "~450";
}

export function buildAgentSystemPrompt(
  hints?: Pick<QuestionHints, "wantsHistory" | "wantsHistoricalAnalysis" | "wantsFullTimeline">
): string {
  return `${AGENT_PROMPT_CORE}\n\nREGLAS:\n- Responde SIEMPRE en español.\n- Máximo ${wordLimitForHints(hints)} palabras salvo que el usuario pida más detalle.`;
}

/** @deprecated Usar buildAgentSystemPrompt — mantiene compatibilidad con imports existentes. */
export const WORLD_CUP_AGENT_SYSTEM_PROMPT = buildAgentSystemPrompt();

export function buildAgentMessages(
  context: string,
  history: { role: "user" | "assistant"; content: string }[],
  question: string,
  hints?: Pick<QuestionHints, "wantsHistory" | "wantsHistoricalAnalysis" | "wantsFullTimeline">
): { role: "system" | "user" | "assistant"; content: string }[] {
  return [
    { role: "system", content: buildAgentSystemPrompt(hints) },
    {
      role: "user",
      content: `CONTEXTO ACTUALIZADO:\n${context}\n\n---\nResponde la última pregunta del usuario. Prioriza ligas Américas / copas del contexto; usa el archivo Mundial solo si la pregunta lo requiere.`,
    },
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: question },
  ];
}

export function agentMaxTokensForHints(
  hints?: Pick<QuestionHints, "wantsHistory" | "wantsHistoricalAnalysis" | "wantsFullTimeline">
): number {
  if (hints?.wantsFullTimeline || hints?.wantsHistoricalAnalysis) return 2200;
  if (hints?.wantsHistory) return 1800;
  return 1400;
}
