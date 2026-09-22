import { DEFAULT_SEASON } from "@/lib/utils";
import {
  getLeagueSeasonFixtures,
  getLeagueStandings,
} from "@/server/footballClient";
import type { StandingTeam, StandingsGroup } from "@/types";
import {
  BRAZIL_DEFAULT_SIMULATIONS,
  BRAZIL_LEAGUE_ID,
  simulateBrazilSeasonProbabilitiesDetailed,
} from "@/utils/brazilSeasonSimulation";
import { getBrazilDayKey } from "@/server/x/buildBrazilForecastDraft";
import {
  buildBrazilPhaseProbsThread,
  formatTelegramBrazilPhasePreview,
} from "@/server/x/formatBrazilPhaseProbsTweets";
import {
  getBrazilPhaseDraftForDay,
  saveBrazilPhaseDraft,
  type BrazilPhaseDraft,
} from "@/server/x/brazilPhaseDraftStore";

function flattenStandings(standingsRaw: StandingsGroup[]): StandingTeam[] {
  const byId = new Map<number, StandingTeam>();
  for (const sg of standingsRaw) {
    for (const group of sg.league.standings ?? []) {
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

export async function buildBrazilPhaseProbsDraft(options?: {
  force?: boolean;
  now?: Date;
}): Promise<{ draft: BrazilPhaseDraft | null; skippedReason?: string }> {
  const now = options?.now ?? new Date();
  const dayKey = getBrazilDayKey(now);
  const existing = getBrazilPhaseDraftForDay(dayKey);
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

  const [standingsRaw, seasonFixtures] = await Promise.all([
    getLeagueStandings(BRAZIL_LEAGUE_ID, DEFAULT_SEASON),
    getLeagueSeasonFixtures(BRAZIL_LEAGUE_ID, DEFAULT_SEASON),
  ]);

  const standings = flattenStandings(standingsRaw);
  if (standings.length < 8) {
    return { draft: null, skippedReason: "no_standings" };
  }

  const { rows, meta } = simulateBrazilSeasonProbabilitiesDetailed({
    standings,
    fixtures: seasonFixtures,
    historyFixtures: seasonFixtures,
    simulations: BRAZIL_DEFAULT_SIMULATIONS,
  });

  const jornada = Math.max(meta.maxPlayed, 1);
  const draftRows = rows.map((r) => ({
    teamId: r.teamId,
    teamName: r.teamName,
    rank: r.rank,
    probChampion: r.probChampion,
    probLibertadoresG4: r.probLibertadoresG4,
    probLibertadores: r.probLibertadores,
    probSudamericana: r.probSudamericana,
    probRelegation: r.probRelegation,
  }));

  const tweets = buildBrazilPhaseProbsThread(draftRows, jornada);
  const draft: BrazilPhaseDraft = {
    dayKey,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    jornada,
    tweets,
    rows: draftRows,
  };
  saveBrazilPhaseDraft(draft);
  return { draft };
}

export function getTelegramBrazilPhasePreviewText(draft: BrazilPhaseDraft): string {
  return formatTelegramBrazilPhasePreview(draft.rows, draft.dayKey, draft.jornada);
}
