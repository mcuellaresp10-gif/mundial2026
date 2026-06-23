import {
  ALL_TIME_TOP_SCORER_THROUGH_2022,
  WORLD_CUP_CAREER_SCORERS,
} from "@/data/worldCupCareerScorers";
import type { TopScorerEntry } from "@/types";

export interface AllTimeScorerRow {
  name: string;
  country: string;
  goalsBefore2026: number;
  goalsIn2026: number;
  totalGoals: number;
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchesCareerScorer(apiName: string, matchKeys: string[]): boolean {
  const normalized = normalizeName(apiName);
  return matchKeys.some((key) => normalized.includes(key) || key.includes(normalized));
}

function goalsIn2026ForCareerScorer(
  career: (typeof WORLD_CUP_CAREER_SCORERS)[number],
  tournamentScorers: TopScorerEntry[]
): number {
  const match = tournamentScorers.find((entry) => matchesCareerScorer(entry.name, career.matchKeys));
  return match?.goals ?? 0;
}

/** Combina carrera pre-2026 + goles del Mundial 2026 en curso. */
export function buildAllTimeScorerRankings(
  tournamentScorers: TopScorerEntry[] = []
): AllTimeScorerRow[] {
  const rows: AllTimeScorerRow[] = WORLD_CUP_CAREER_SCORERS.map((career) => {
    const goalsIn2026 = goalsIn2026ForCareerScorer(career, tournamentScorers);
    return {
      name: career.name,
      country: career.country,
      goalsBefore2026: career.goalsBefore2026,
      goalsIn2026,
      totalGoals: career.goalsBefore2026 + goalsIn2026,
    };
  });

  return rows.sort((a, b) => {
    if (b.totalGoals !== a.totalGoals) return b.totalGoals - a.totalGoals;
    return b.goalsBefore2026 - a.goalsBefore2026;
  });
}

export function getLeadingAllTimeScorer(
  tournamentScorers: TopScorerEntry[] = []
): { name: string; goals: number; country: string } {
  const leader = buildAllTimeScorerRankings(tournamentScorers)[0];
  if (!leader || leader.totalGoals <= ALL_TIME_TOP_SCORER_THROUGH_2022.goals) {
    return ALL_TIME_TOP_SCORER_THROUGH_2022;
  }
  return {
    name: leader.name,
    goals: leader.totalGoals,
    country: leader.country,
  };
}

export function findAllTimeScorerByQuery(
  query: string,
  tournamentScorers: TopScorerEntry[] = []
): AllTimeScorerRow | null {
  const normalized = normalizeName(query);
  return (
    buildAllTimeScorerRankings(tournamentScorers).find((row) => {
      const career = WORLD_CUP_CAREER_SCORERS.find((c) => c.name === row.name);
      if (career?.matchKeys.some((key) => normalized.includes(key))) return true;
      const rowNorm = normalizeName(row.name);
      return normalized.includes(rowNorm) || rowNorm.includes(normalized);
    }) ?? null
  );
}

export function findAllTimeScorerByKeys(
  keys: string[],
  tournamentScorers: TopScorerEntry[] = []
): AllTimeScorerRow | null {
  return (
    buildAllTimeScorerRankings(tournamentScorers).find((row) => {
      const career = WORLD_CUP_CAREER_SCORERS.find((c) => c.name === row.name);
      if (!career) return false;
      return keys.some((key) => career.matchKeys.some((mk) => mk.includes(key) || key.includes(mk)));
    }) ?? null
  );
}

export function formatAllTimeCareerScorersBlock(
  tournamentScorers: TopScorerEntry[] = [],
  limit = 10
): string {
  const rows = buildAllTimeScorerRankings(tournamentScorers).slice(0, limit);
  if (rows.length === 0) return "";

  const leader = rows[0];
  const lines = [
    "GOLEADORES HISTÓRICOS ALL-TIME (1930–2022 + Mundial 2026 en curso):",
    `Líder actual: ${leader.name} (${leader.country}) — ${leader.totalGoals} goles totales (${leader.goalsBefore2026} antes de 2026 + ${leader.goalsIn2026} en 2026).`,
    "Ranking:",
    ...rows.map(
      (row, index) =>
        `${index + 1}. ${row.name} (${row.country}) — ${row.totalGoals} total (${row.goalsBefore2026} pre-2026 + ${row.goalsIn2026} en 2026)`
    ),
  ];
  return lines.join("\n");
}

export function answerCareerGoalGapQuestion(
  question: string,
  tournamentScorers: TopScorerEntry[] = []
): string | null {
  const text = normalizeName(question);
  const wantsGap =
    /(le falt|faltan|alcanz|super|igual|pasar|coger|alcanzar)/.test(text) &&
    /(messi|mbappe)/.test(text);
  const wantsLeader = /(maximo|max goleador|goleador histor|record goleador|mas goles en mundiales)/.test(
    text
  );

  if (!wantsGap && !wantsLeader) return null;

  const rankings = buildAllTimeScorerRankings(tournamentScorers);
  const leader = rankings[0];
  if (!leader) return null;

  if (wantsLeader && !wantsGap) {
    return [
      `⚽ Máximo goleador histórico en Mundiales: ${leader.name} (${leader.country}) con ${leader.totalGoals} goles.`,
      `Desglose: ${leader.goalsBefore2026} antes del Mundial 2026 + ${leader.goalsIn2026} en este torneo.`,
      leader.name.includes("Messi")
        ? "Messi superó el récord de Miroslav Klose (16) sumando sus goles en Qatar 2022 y el Mundial 2026."
        : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  const messi = findAllTimeScorerByKeys(["messi"], tournamentScorers);
  const mbappe = findAllTimeScorerByKeys(["mbappe"], tournamentScorers);
  if (!messi || !mbappe) return null;

  const gap = Math.max(0, messi.totalGoals - mbappe.totalGoals);
  return [
    `⚽ Goleadores históricos all-time (incl. Mundial 2026):`,
    `• Lionel Messi: ${messi.totalGoals} goles (${messi.goalsBefore2026} pre-2026 + ${messi.goalsIn2026} en 2026)`,
    `• Kylian Mbappé: ${mbappe.totalGoals} goles (${mbappe.goalsBefore2026} pre-2026 + ${mbappe.goalsIn2026} en 2026)`,
    gap === 0
      ? "Mbappé está empatado con Messi en goles históricos de Mundiales."
      : `A Mbappé le faltan ${gap} gol${gap === 1 ? "" : "es"} para igualar a Messi como goleador histórico en Mundiales.`,
    `Líder absoluto: ${leader.name} (${leader.totalGoals} goles).`,
  ].join("\n");
}
