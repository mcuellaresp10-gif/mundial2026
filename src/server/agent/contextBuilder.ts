import type { Fixture, StandingsGroup } from "@/types";
import { formatHistoryContext, formatCompactHistoryDigest } from "@/data/worldCupHistory";
import { buildTelegramContext } from "@/server/telegram/formatters";
import {
  fetchLineupsText,
  fetchPlayerText,
} from "@/server/telegram/qaService";
import { analyzeAgentQuestion, type QuestionHints } from "@/server/agent/questionAnalysis";
import { formatTournamentPlayerStatsContext } from "@/server/agent/tournamentStatsContext";
import {
  BEST_THIRD_QUALIFIERS,
  rankThirdPlaceTeamsFromStandings,
} from "@/utils/bestThirdsRanking";
import {
  resolveAllGroupContexts,
  simulateTournamentOutcomeProbabilities,
} from "@/utils/groupClassification";
import { groupStageScoresSignature } from "@/utils/liveStandings";
import { translateTeamName, teamNameMatchesQuery } from "@/utils/teamNames";
import type { FairPlayRecord } from "@/utils/fairPlay";

const AGENT_MC_SIMS = 300;
const probCache = new Map<string, { data: string; timestamp: number }>();
const PROB_CACHE_TTL = 5 * 60 * 1000;

function getCachedProbBlock(signature: string): string | null {
  const entry = probCache.get(signature);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > PROB_CACHE_TTL) return null;
  return entry.data;
}

function setCachedProbBlock(signature: string, data: string): void {
  probCache.set(signature, { data, timestamp: Date.now() });
}

function formatProbabilitiesBlock(
  fixtures: Fixture[],
  standings: StandingsGroup[],
  fairPlay: Map<number, FairPlayRecord>,
  teamKey?: string
): string {
  const signature = groupStageScoresSignature(fixtures);
  const cached = getCachedProbBlock(signature);
  if (cached && !teamKey) return cached;

  const groups = resolveAllGroupContexts(standings, fixtures);
  if (groups.length === 0) return "PROBABILIDADES: datos de grupos no disponibles.";

  const probMap = simulateTournamentOutcomeProbabilities(groups, new Map(), fairPlay, AGENT_MC_SIMS);

  const lines: string[] = ["PROBABILIDADES MONTE CARLO (simulación aproximada):"];
  const entries = [...probMap.entries()].sort((a, b) => b[1].probClassify - a[1].probClassify);

  for (const [teamId, probs] of entries) {
    const group = groups.find((g) => g.groupStandings.some((s) => s.team.id === teamId));
    const row = group?.groupStandings.find((s) => s.team.id === teamId);
    if (!row) continue;
    if (teamKey && !teamNameMatchesQuery(row.team.name, teamKey)) continue;

    lines.push(
      `${translateTeamName(row.team.name)}: clasificar ${probs.probClassify}%, 1º ${probs.probFirst}%, 2º ${probs.probSecond}%, mej. 3º ${probs.probBestThird}%`
    );
  }

  if (teamKey && lines.length === 1) {
    lines.push(`No se encontró probabilidad para "${teamKey}" en los grupos actuales.`);
  }

  const block = lines.join("\n");
  if (!teamKey) setCachedProbBlock(signature, block);
  return block;
}

function formatBestThirdsBlock(
  fixtures: Fixture[],
  standings: StandingsGroup[],
  fairPlay: Map<number, FairPlayRecord>
): string {
  const ranked = rankThirdPlaceTeamsFromStandings(standings, fixtures, fairPlay);
  if (ranked.length === 0) return "MEJORES TERCEROS: sin datos de grupos.";

  const lines = [`MEJORES TERCEROS (top ${BEST_THIRD_QUALIFIERS} clasifican):`];
  for (const entry of ranked) {
    const status = entry.qualifies ? "CLASIFICA" : "ELIMINADO";
    lines.push(
      `#${entry.rankAmongThirds} Gr.${entry.groupLetter} ${translateTeamName(entry.row.team.name)} — ${entry.row.points} pts, DIF ${entry.row.goalsDiff}, GF ${entry.row.all.goals.for} [${status}]`
    );
  }
  return lines.join("\n");
}

function formatTeamStatsBlock(
  standings: StandingsGroup[],
  teamKey?: string
): string | null {
  if (!teamKey || teamKey.startsWith("grupo ")) return null;

  for (const sg of standings) {
    for (const table of sg.league.standings) {
      const row = table.find((r) => teamNameMatchesQuery(r.team.name, teamKey));
      if (row) {
        return [
          `EQUIPO CONSULTADO: ${translateTeamName(row.team.name)}`,
          `Grupo: ${row.group}`,
          `Posición: ${row.rank}º | ${row.points} pts | PJ ${row.all.played}`,
          `GF ${row.all.goals.for} GC ${row.all.goals.against} DIF ${row.goalsDiff}`,
        ].join("\n");
      }
    }
  }
  return null;
}

export async function buildAgentContext(
  question: string,
  fixtures: Fixture[],
  standings: StandingsGroup[],
  fairPlay: Map<number, FairPlayRecord> = new Map(),
  hints?: QuestionHints
): Promise<{ context: string; sources: string[] }> {
  const h = hints ?? analyzeAgentQuestion(question);
  const parts: string[] = [formatCompactHistoryDigest()];
  const sources: string[] = ["historico", "torneo-2026"];

  parts.push(buildTelegramContext(fixtures, standings));

  if (h.wantsTournamentPlayerStats) {
    const statsBlock = await formatTournamentPlayerStatsContext(question);
    if (statsBlock) {
      parts.push(statsBlock);
      sources.push("stats-jugadores");
    }
  }

  if (h.wantsLineups) {
    const lineups = await fetchLineupsText(fixtures, h.teamKey);
    if (lineups) {
      parts.push("ALINEACIONES:\n" + lineups.replace(/\*/g, ""));
      sources.push("alineaciones");
    }
  }

  if (h.wantsPlayerInfo && h.playerQuery) {
    const player = await fetchPlayerText(h.playerQuery);
    if (player) {
      parts.push("JUGADOR:\n" + player.replace(/\*/g, ""));
      sources.push("jugador");
    }
  }

  if (h.wantsTeamStats) {
    const teamBlock = formatTeamStatsBlock(standings, h.teamKey);
    if (teamBlock) {
      parts.push(teamBlock);
      sources.push("tabla-equipo");
    }
  }

  if (h.wantsProbabilities) {
    parts.push(formatProbabilitiesBlock(fixtures, standings, fairPlay, h.teamKey));
    sources.push("monte-carlo");
  }

  if (h.wantsBestThirds) {
    parts.push(formatBestThirdsBlock(fixtures, standings, fairPlay));
    sources.push("mejores-terceros");
  }

  if (h.wantsHistory || h.wantsRecords || h.historyYear) {
    const historyBlock = formatHistoryContext({
      wantsHistory: h.wantsHistory,
      historyYear: h.historyYear,
      wantsRecords: h.wantsRecords || h.wantsHistory,
      searchQuery: h.historySearchQuery,
    });
    if (historyBlock) {
      parts.push(historyBlock);
      if (!sources.includes("historico-detalle")) sources.push("historico-detalle");
    }
  }

  return {
    context: parts.filter(Boolean).join("\n\n") || "Sin datos recientes del torneo.",
    sources,
  };
}

/** Para tests: limpia caché Monte Carlo. */
export function clearAgentProbCache(): void {
  probCache.clear();
}
