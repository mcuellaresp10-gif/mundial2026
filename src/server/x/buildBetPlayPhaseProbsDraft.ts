import { DEFAULT_SEASON } from "@/lib/utils";
import {
  getLeagueById,
  matchesLeaguePhase,
  type AmericasLeague,
} from "@/data/americasLeagues";
import {
  getLeagueSeasonFixtures,
  getLeagueStandings,
} from "@/server/footballClient";
import {
  BETPLAY_SEMIS_SIMULATIONS,
  CLAUSURA_2026_CUADRANGULARES,
  simulateBetPlayCuadrangularesSemis,
} from "@/utils/betPlaySeasonSimulation";
import type { StandingTeam, StandingsGroup } from "@/types";
import { getBogotaDayKey } from "@/server/x/buildBetPlayForecastDraft";
import {
  buildCuadrangularesSemisThread,
  formatTelegramCuadrangularesSemisPreview,
} from "@/server/x/formatCuadrangularesSemisTweets";
import {
  getPhaseProbsDraftForDay,
  savePhaseProbsDraft,
  type PhaseProbsDraft,
} from "@/server/x/phaseProbsDraftStore";

export const BETPLAY_LEAGUE_ID = 239;

function flattenStandings(standingsRaw: StandingsGroup[]): StandingTeam[] {
  const byId = new Map<number, StandingTeam>();
  for (const sg of standingsRaw) {
    for (const group of sg.league.standings) {
      for (const row of group) {
        const existing = byId.get(row.team.id);
        if (!existing || row.all.played >= existing.all.played) {
          byId.set(row.team.id, row);
        }
      }
    }
  }
  return [...byId.values()];
}

function pickRegularSeasonTable(
  standingsRaw: StandingsGroup[],
  tournamentPhase: "apertura" | "clausura",
  league: AmericasLeague
): StandingTeam[] {
  const tables: StandingTeam[][] = [];
  for (const sg of standingsRaw) {
    for (const group of sg.league.standings) {
      if (!group.length) continue;
      const groupLabel = group[0]?.group ?? "";
      const matches =
        matchesLeaguePhase(groupLabel, league, tournamentPhase) ||
        group.some((r) => matchesLeaguePhase(r.group, league, tournamentPhase));
      if (matches) tables.push(group);
    }
  }

  if (tables.length === 0) {
    const all: StandingTeam[][] = [];
    for (const sg of standingsRaw) {
      for (const group of sg.league.standings) {
        if (group.length) all.push(group);
      }
    }
    if (all.length === 0) return flattenStandings(standingsRaw);
    all.sort((a, b) => b.length - a.length);
    return all[0];
  }

  tables.sort((a, b) => b.length - a.length);
  return tables[0];
}

export interface BuildPhaseProbsResult {
  draft: PhaseProbsDraft | null;
  skippedReason?: string;
}

/**
 * Borrador de cuadrangulares semifinales (grupos A/B ya sorteados).
 */
export async function buildBetPlayPhaseProbsDraft(options?: {
  force?: boolean;
  now?: Date;
  tournamentPhase?: "apertura" | "clausura";
  simulations?: number;
}): Promise<BuildPhaseProbsResult> {
  const now = options?.now ?? new Date();
  const dayKey = getBogotaDayKey(now);
  const existing = getPhaseProbsDraftForDay(dayKey);
  if (
    !options?.force &&
    existing &&
    (existing.status === "pending" || existing.status === "published")
  ) {
    return {
      draft: existing,
      skippedReason:
        existing.status === "published"
          ? "already_published"
          : "pending_exists",
    };
  }

  const league = getLeagueById(BETPLAY_LEAGUE_ID);
  if (!league) {
    return { draft: null, skippedReason: "no_league" };
  }

  const tournamentPhase = options?.tournamentPhase ?? "clausura";
  const simulations = options?.simulations ?? BETPLAY_SEMIS_SIMULATIONS;
  const [standingsRaw, seasonFixtures] = await Promise.all([
    getLeagueStandings(BETPLAY_LEAGUE_ID, DEFAULT_SEASON),
    getLeagueSeasonFixtures(BETPLAY_LEAGUE_ID, DEFAULT_SEASON),
  ]);

  const standings = pickRegularSeasonTable(standingsRaw, tournamentPhase, league);
  if (standings.length < 8) {
    return { draft: null, skippedReason: "no_standings" };
  }

  const groups = CLAUSURA_2026_CUADRANGULARES;
  let semis;
  try {
    semis = simulateBetPlayCuadrangularesSemis({
      standings,
      fixtures: seasonFixtures,
      historyFixtures: seasonFixtures,
      groupANames: groups.groupA.names,
      groupBNames: groups.groupB.names,
      seedAName: groups.groupA.seedName,
      seedBName: groups.groupB.seedName,
      simulations,
    });
  } catch (e) {
    console.error("[x-phase] semis sim failed:", e);
    return { draft: null, skippedReason: "sim_failed" };
  }

  const draftRows = [...semis.groupA, ...semis.groupB].map((r) => ({
    teamId: r.teamId,
    teamName: r.teamName,
    teamLogo: r.teamLogo,
    group: r.group,
    isSeed: r.isSeed,
    probCuadrangulares: 1,
    probFinal: r.probFinal,
    probChampion: r.probChampion,
    projectedPoints: r.projectedPoints,
  }));

  const tweets = buildCuadrangularesSemisThread(
    semis.groupA,
    semis.groupB,
    semis.meta.simulations
  );

  const draft: PhaseProbsDraft = {
    dayKey,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    jornada: Math.max(semis.meta.maxPlayed, 1),
    phase: tournamentPhase,
    mode: "semis",
    simulations: semis.meta.simulations,
    tweets,
    rows: draftRows,
  };
  savePhaseProbsDraft(draft);
  return { draft };
}

export function getTelegramPhaseProbsPreviewText(draft: PhaseProbsDraft): string {
  const groupA = draft.rows
    .filter((r) => r.group === "A")
    .map((r) => ({
      teamId: r.teamId,
      teamName: r.teamName,
      teamLogo: r.teamLogo ?? "",
      group: "A" as const,
      isSeed: r.isSeed ?? false,
      probFinal: r.probFinal,
      probChampion: r.probChampion,
      projectedPoints: r.projectedPoints ?? 0,
    }));
  const groupB = draft.rows
    .filter((r) => r.group === "B")
    .map((r) => ({
      teamId: r.teamId,
      teamName: r.teamName,
      teamLogo: r.teamLogo ?? "",
      group: "B" as const,
      isSeed: r.isSeed ?? false,
      probFinal: r.probFinal,
      probChampion: r.probChampion,
      projectedPoints: r.projectedPoints ?? 0,
    }));
  return formatTelegramCuadrangularesSemisPreview(
    groupA,
    groupB,
    draft.dayKey,
    draft.simulations ?? BETPLAY_SEMIS_SIMULATIONS
  );
}
