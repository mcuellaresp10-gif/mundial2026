/** Re-export del analizador compartido web + Telegram. */
export {
  analyzeAgentQuestion as analyzeQuestion,
  extractPlayerQuery,
  isLineupQuestion,
  isPlayerQuestion,
  type QuestionHints,
} from "@/server/agent/questionAnalysis";
