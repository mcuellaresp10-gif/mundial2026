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
import type { StandingTeam, StandingsGroup } from "@/types";
import {
  ARGENTINA_DEFAULT_SIMULATIONS,
  ARGENTINA_LEAGUE_ID,
  detectArgentinaZone,
  simulateArgentinaPhaseProbabilitiesDetailed,
} from "@/utils/argentinaSeasonSimulation";
import { getArgentinaDayKey } from "@/server/x/buildArgentinaForecastDraft";
import {
  buildArgentinaPhaseProbsThread,
  formatTelegramArgentinaPhasePreview,
} from "@/server/x/formatArgentinaPhaseProbsTweets";
import {
  getArgentinaPhaseDraftForDay,
  saveArgentinaPhaseDraft,
  type ArgentinaPhaseDraft,
} from "@/server/x/argentinaPhaseDraftStore";

function pickZones(
  standingsRaw: StandingsGroup[],
  tournamentPhase: "apertura" | "clausura",
  league: AmericasLeague
): { zoneA: StandingTeam[]; zoneB: StandingTeam[] } {
  let zoneA: StandingTeam[] = [];
  let zoneB: StandingTeam[] = [];

  for (const sg of standingsRaw) {
    for (const group of sg.league.standings ?? []) {
      if (!group.length) continue;
      const label = group[0]?.group ?? "";
      if (!matchesLeaguePhase(label, league, tournamentPhase)) continue;
      const zone = detectArgentinaZone(label);
      if (zone === "A") zoneA = group;
      if (zone === "B") zoneB = group;
    }
  }

  return { zoneA, zoneB };
}

export interface BuildArgentinaPhaseResult {
  draft: ArgentinaPhaseDraft | null;
  skippedReason?: string;
}

export async function buildArgentinaPhaseProbsDraft(options?: {
  force?: boolean;
  now?: Date;
  tournamentPhase?: "apertura" | "clausura";
}): Promise<BuildArgentinaPhaseResult> {
  const now = options?.now ?? new Date();
  const dayKey = getArgentinaDayKey(now);
  const existing = getArgentinaPhaseDraftForDay(dayKey);
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

  const league = getLeagueById(ARGENTINA_LEAGUE_ID);
  if (!league) return { draft: null, skippedReason: "no_league" };

  // Clausura vigente (como BetPlay); override opcional.
  const tournamentPhase = options?.tournamentPhase ?? "clausura";
  const [standingsRaw, seasonFixtures] = await Promise.all([
    getLeagueStandings(ARGENTINA_LEAGUE_ID, DEFAULT_SEASON),
    getLeagueSeasonFixtures(ARGENTINA_LEAGUE_ID, DEFAULT_SEASON),
  ]);

  const { zoneA, zoneB } = pickZones(standingsRaw, tournamentPhase, league);
  if (zoneA.length < 8 || zoneB.length < 8) {
    return { draft: null, skippedReason: "no_standings" };
  }

  const tournamentFixtures = seasonFixtures.filter((f) =>
    matchesLeaguePhase(f.league.round, league, tournamentPhase)
  );

  const { rows, meta } = simulateArgentinaPhaseProbabilitiesDetailed({
    zoneA,
    zoneB,
    fixtures: tournamentFixtures,
    historyFixtures: seasonFixtures,
    simulations: ARGENTINA_DEFAULT_SIMULATIONS,
  });

  const jornada = Math.max(meta.maxPlayed, 1);
  const draftRows = rows.map((r) => ({
    teamId: r.teamId,
    teamName: r.teamName,
    zone: r.zone,
    rank: r.rank,
    probPlayoffs: r.probPlayoffs,
    probQuarter: r.probQuarter,
    probSemi: r.probSemi,
    probFinal: r.probFinal,
    probChampion: r.probChampion,
  }));

  const tweets = buildArgentinaPhaseProbsThread(
    draftRows,
    jornada,
    tournamentPhase
  );
  const draft: ArgentinaPhaseDraft = {
    dayKey,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    jornada,
    phase: tournamentPhase,
    tweets,
    rows: draftRows,
  };
  saveArgentinaPhaseDraft(draft);
  return { draft };
}

export function getTelegramArgentinaPhasePreviewText(
  draft: ArgentinaPhaseDraft
): string {
  return formatTelegramArgentinaPhasePreview(
    draft.rows,
    draft.dayKey,
    draft.jornada,
    draft.phase
  );
}
