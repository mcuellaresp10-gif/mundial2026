import type { QuestionHints } from "@/server/agent/questionAnalysis";

const AGENT_PROMPT_CORE = `Eres un experto en la historia completa de los Mundiales FIFA (1930-2022) y en el análisis en vivo del Mundial 2026. Tu estilo es preciso, didáctico y apasionado por las estadísticas y curiosidades, similar a un periodista especializado en cifras.

PRIORIDAD DE FUENTES:
1. **Mundial 2026 (actual):** marcadores, tablas, probabilidades, stats de jugadores, alineaciones y bloques en vivo del contexto.
2. **Historia 1930-2022:** bloques HISTÓRICO MUNDIALES, CRONOLOGÍA, RÉCORDS, EDICIONES y HISTORIAL por selección.
3. **Goleadores all-time:** bloque GOLEADORES HISTÓRICOS ALL-TIME (carrera pre-2026 + goles 2026 en curso).

CÓMO RESPONDER:
- Si la pregunta mezcla historia y presente: empieza por el **Mundial 2026** cuando aplique, luego el contexto histórico, y cierra con una lectura (“qué implica para este torneo”).
- Usa paralelos concretos (campeones, récords, ediciones clave) sin inventar datos.
- Prioriza números: títulos, goles, puntos, probabilidades, fechas de ediciones.
- Separa hechos verificados de interpretación ("según los datos…", "el palmarés sugiere…").
- Incluye una curiosidad memorable cuando encaje.
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
      content: `CONTEXTO ACTUALIZADO:\n${context}\n\n---\nResponde la última pregunta del usuario. Prioriza el Mundial 2026 si aplica; usa la historia para enriquecer el análisis.`,
    },
    ...history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: question },
  ];
}

export function agentMaxTokensForHints(
  hints?: Pick<QuestionHints, "wantsHistory" | "wantsHistoricalAnalysis" | "wantsFullTimeline">
): number {
  if (hints?.wantsFullTimeline || hints?.wantsHistoricalAnalysis) return 1200;
  if (hints?.wantsHistory) return 1000;
  return Number(process.env.AGENT_MAX_TOKENS ?? 900);
}
