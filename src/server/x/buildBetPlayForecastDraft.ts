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
import {
  getForecastDraftForDay,
  saveForecastDraft,
  type ForecastDraft,
  type ForecastDraftMatch,
} from "@/server/x/forecastDraftStore";

export const BETPLAY_LEAGUE_ID = 239;
export const FORECAST_TZ = "America/Bogota";

const DONE_STATUSES = new Set(["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"]);

/** YYYY-MM-DD en zona America/Bogota. */
export function getBogotaDayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FORECAST_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function getBogotaHour(now = new Date()): number {
  const hourStr = new Intl.DateTimeFormat("en-US", {
    timeZone: FORECAST_TZ,
    hour: "numeric",
    hour12: false,
  }).format(now);
  return Number(hourStr);
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

export interface BuildDraftResult {
  draft: ForecastDraft | null;
  skippedReason?: string;
}

/**
 * Genera (o reutiliza) el borrador del día. Si ya hay pending/published y force=false, no regenera.
 */
export async function buildBetPlayForecastDraft(options?: {
  force?: boolean;
  now?: Date;
}): Promise<BuildDraftResult> {
  const now = options?.now ?? new Date();
  const dayKey = getBogotaDayKey(now);
  const existing = getForecastDraftForDay(dayKey);

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

  const fixtures = (await getFixturesByDateLeague(dayKey, BETPLAY_LEAGUE_ID))
    .filter((f) => isPendingToday(f.fixture.status.short))
    .sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );

  if (fixtures.length === 0) {
    return { draft: null, skippedReason: "no_fixtures" };
  }

  const [standingsGroups, seasonFixtures] = await Promise.all([
    getLeagueStandings(BETPLAY_LEAGUE_ID, DEFAULT_SEASON),
    getLeagueSeasonFixtures(BETPLAY_LEAGUE_ID, DEFAULT_SEASON),
  ]);
  const standingsFlat = flattenStandings(standingsGroups);

  const matches: ForecastDraftMatch[] = [];

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
      console.warn(`[x-forecast] H2H failed ${homeId}-${awayId}`, e);
    }

    const playedCount = Math.max(
      ...standingsFlat.map((s) => s.all.played),
      0
    );
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
      homeLeagueId: pickA?.leagueId ?? BETPLAY_LEAGUE_ID,
      awayLeagueId: pickB?.leagueId ?? BETPLAY_LEAGUE_ID,
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
    });
  }

  const tweets = buildForecastThread(matches);
  const draft: ForecastDraft = {
    dayKey,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tweets,
    matches,
  };
  saveForecastDraft(draft);
  return { draft };
}

export function getTelegramPreviewText(draft: ForecastDraft): string {
  return formatTelegramForecastPreview(draft.matches, draft.dayKey);
}
