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
  BETPLAY_DEFAULT_SIMULATIONS,
  simulateBetPlayPhaseProbabilitiesDetailed,
} from "@/utils/betPlaySeasonSimulation";
import type { StandingTeam, StandingsGroup } from "@/types";
import { getBogotaDayKey } from "@/server/x/buildBetPlayForecastDraft";
import {
  buildPhaseProbsThread,
  formatTelegramPhaseProbsPreview,
} from "@/server/x/formatPhaseProbsTweets";
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
 * Genera borrador de probs de cuadrangulares (mismo motor que la web).
 * Torneo vigente: Clausura (como el dashboard en "all").
 */
export async function buildBetPlayPhaseProbsDraft(options?: {
  force?: boolean;
  now?: Date;
  tournamentPhase?: "apertura" | "clausura";
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
  const [standingsRaw, seasonFixtures] = await Promise.all([
    getLeagueStandings(BETPLAY_LEAGUE_ID, DEFAULT_SEASON),
    getLeagueSeasonFixtures(BETPLAY_LEAGUE_ID, DEFAULT_SEASON),
  ]);

  const standings = pickRegularSeasonTable(standingsRaw, tournamentPhase, league);
  if (standings.length < 8) {
    return { draft: null, skippedReason: "no_standings" };
  }

  const tournamentFixtures = seasonFixtures.filter((f) =>
    matchesLeaguePhase(f.league.round, league, tournamentPhase)
  );

  const { rows, meta } = simulateBetPlayPhaseProbabilitiesDetailed({
    standings,
    fixtures: tournamentFixtures,
    historyFixtures: seasonFixtures,
    simulations: BETPLAY_DEFAULT_SIMULATIONS,
  });

  const jornada = Math.max(meta.maxPlayed, 1);
  const draftRows = rows.map((r) => ({
    teamId: r.teamId,
    teamName: r.teamName,
    probCuadrangulares: r.probCuadrangulares,
    probFinal: r.probFinal,
    probChampion: r.probChampion,
  }));

  const tweets = buildPhaseProbsThread(draftRows, jornada);
  const draft: PhaseProbsDraft = {
    dayKey,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    jornada,
    phase: tournamentPhase,
    tweets,
    rows: draftRows,
  };
  savePhaseProbsDraft(draft);
  return { draft };
}

export function getTelegramPhaseProbsPreviewText(draft: PhaseProbsDraft): string {
  return formatTelegramPhaseProbsPreview(draft.rows, draft.dayKey, draft.jornada);
}
