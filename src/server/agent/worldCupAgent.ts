import type { Fixture, StandingsGroup } from "@/types";
import { callAIChat } from "@/server/aiClient";
import { buildAgentContext } from "@/server/agent/contextBuilder";
import { buildAgentMessages, agentMaxTokensForHints } from "@/server/agent/prompts";
import { analyzeAgentQuestion } from "@/server/agent/questionAnalysis";
import { tryDirectAnswer } from "@/server/telegram/qaService";
import type { FairPlayRecord } from "@/utils/fairPlay";

export interface AgentChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentTurnInput {
  question: string;
  messages?: AgentChatMessage[];
  fixtures: Fixture[];
  standings: StandingsGroup[];
  fairPlay?: Map<number, FairPlayRecord>;
}

export interface AgentTurnResult {
  answer: string;
  sources: string[];
  direct: boolean;
}

export async function runAgentTurn(input: AgentTurnInput): Promise<AgentTurnResult> {
  const { question, messages = [], fixtures, standings, fairPlay = new Map() } = input;
  const trimmed = question.trim();
  if (!trimmed) {
    return { answer: "Escribe una pregunta sobre ligas, copas o el archivo Mundial.", sources: [], direct: true };
  }

  const hints = analyzeAgentQuestion(trimmed);
  const direct = await tryDirectAnswer(trimmed, fixtures);
  if (direct && !direct.includes("No encontré") && !direct.includes("No hay partidos")) {
    return {
      answer: direct.replace(/\*/g, ""),
      sources: direct.includes("Goleadores históricos")
        ? ["goleadores-historicos"]
        : hints.wantsLineups
          ? ["alineaciones"]
          : hints.wantsPlayerInfo
            ? ["jugador"]
            : [],
      direct: true,
    };
  }

  const { context, sources } = await buildAgentContext(trimmed, fixtures, standings, fairPlay, hints);
  const chatMessages = buildAgentMessages(context, messages, trimmed, hints);
  const raw = await callAIChat(chatMessages, { maxTokens: agentMaxTokensForHints(hints) });
  const answer = raw.trim() || "No pude generar una respuesta. Intenta reformular la pregunta.";

  return { answer, sources, direct: false };
}

/** Compat Telegram: respuesta con contexto ya construido. */
export async function answerWorldCupQuestion(
  question: string,
  context: string,
  history: AgentChatMessage[] = []
): Promise<string> {
  const hints = analyzeAgentQuestion(question);
  const chatMessages = buildAgentMessages(context, history, question, hints);
  const raw = await callAIChat(chatMessages, { maxTokens: agentMaxTokensForHints(hints) });
  return raw.trim() || "No pude generar una respuesta.";
}
