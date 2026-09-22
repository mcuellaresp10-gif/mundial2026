import { isFixtureFinished } from "@/lib/liveRefresh";
import { DEFAULT_SEASON } from "@/lib/utils";
import {
  getFixturesByDateLeague,
  getH2H,
  getLeagueSeasonFixtures,
  getLeagueStandings,
} from "@/server/footballClient";
import { pickStandingForClub } from "@/utils/clubMatchCalibration";
import { runScoreSimulation } from "@/utils/matchSimulation";
import type { StandingTeam, StandingsGroup } from "@/types";
import {
  buildForecastThread,
  formatTelegramForecastPreview,
} from "@/server/x/formatForecastTweets";
import { BRAZIL_LEAGUE_ID, BRAZIL_TZ } from "@/utils/brazilSeasonSimulation";
import {
  getBrazilForecastDraftForDay,
  saveBrazilForecastDraft,
  type BrazilForecastDraft,
} from "@/server/x/brazilForecastDraftStore";

export const BRAZIL_FORECAST_TITLE = "Partidos de hoy · Brasileirão Serie A";

const DONE_STATUSES = new Set(["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"]);

export function getBrazilDayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BRAZIL_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function flattenStandings(groups: StandingsGroup[]): StandingTeam[] {
  const rows: StandingTeam[] = [];
  for (const g of groups) {
    for (const table of g.league.standings ?? []) {
      rows.push(...table);
    }
  }
  return rows;
}

function isPendingToday(statusShort: string): boolean {
  if (DONE_STATUSES.has(statusShort)) return false;
  if (isFixtureFinished(statusShort)) return false;
  return true;
}

export async function buildBrazilForecastDraft(options?: {
  force?: boolean;
  now?: Date;
}): Promise<{ draft: BrazilForecastDraft | null; skippedReason?: string }> {
  const now = options?.now ?? new Date();
  const dayKey = getBrazilDayKey(now);
  const existing = getBrazilForecastDraftForDay(dayKey);

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

  const fixtures = (
    await getFixturesByDateLeague(
      dayKey,
      BRAZIL_LEAGUE_ID,
      DEFAULT_SEASON,
      BRAZIL_TZ
    )
  )
    .filter((f) => isPendingToday(f.fixture.status.short))
    .sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );

  if (fixtures.length === 0) {
    return { draft: null, skippedReason: "no_fixtures" };
  }

  const [standingsGroups, seasonFixtures] = await Promise.all([
    getLeagueStandings(BRAZIL_LEAGUE_ID, DEFAULT_SEASON),
    getLeagueSeasonFixtures(BRAZIL_LEAGUE_ID, DEFAULT_SEASON),
  ]);
  const standingsFlat = flattenStandings(standingsGroups);

  const matches = [];
  for (const f of fixtures) {
    const homeId = f.teams.home.id;
    const awayId = f.teams.away.id;
    const pickA = pickStandingForClub(standingsGroups, homeId);
    const pickB = pickStandingForClub(standingsGroups, awayId);
    const standingA =
      pickA?.standing ?? standingsFlat.find((s) => s.team.id === homeId);
    const standingB =
      pickB?.standing ?? standingsFlat.find((s) => s.team.id === awayId);

    let h2h: typeof seasonFixtures = [];
    try {
      h2h = await getH2H(homeId, awayId);
    } catch (e) {
      console.warn(`[x-brazil] H2H failed ${homeId}-${awayId}`, e);
    }

    const playedCount = Math.max(...standingsFlat.map((s) => s.all.played), 0);
    const result = runScoreSimulation({
      teamAId: homeId,
      teamBId: awayId,
      teamAName: f.teams.home.name,
      teamBName: f.teams.away.name,
      standingA,
      standingB,
      h2h,
      playersA: [],
      playersB: [],
      avgGoalsPerMatch: 2.4,
      isPreTournament: playedCount === 0,
      clubCalibration: true,
      leagueFixtures: seasonFixtures,
      homeLeagueId: pickA?.leagueId ?? BRAZIL_LEAGUE_ID,
      awayLeagueId: pickB?.leagueId ?? BRAZIL_LEAGUE_ID,
      simulations: 4000,
    });

    matches.push({
      fixtureId: f.fixture.id,
      homeId,
      awayId,
      homeName: f.teams.home.name,
      awayName: f.teams.away.name,
      winHome: result.outcomeProbs.winA,
      draw: result.outcomeProbs.draw,
      winAway: result.outcomeProbs.winB,
      competition: "🇧🇷 Brasileirão",
    });
  }

  const tweets = buildForecastThread(matches, { title: BRAZIL_FORECAST_TITLE });
  const draft: BrazilForecastDraft = {
    kind: "brazil",
    dayKey,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tweets,
    matches,
  };
  saveBrazilForecastDraft(draft);
  return { draft };
}

export function getTelegramBrazilForecastPreview(
  draft: BrazilForecastDraft
): string {
  return formatTelegramForecastPreview(
    draft.matches,
    draft.dayKey,
    BRAZIL_FORECAST_TITLE
  );
}
