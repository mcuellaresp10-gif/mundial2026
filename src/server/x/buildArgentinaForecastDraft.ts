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
  ARGENTINA_LEAGUE_ID,
  ARGENTINA_TZ,
} from "@/utils/argentinaSeasonSimulation";
import {
  getArgentinaForecastDraftForDay,
  saveArgentinaForecastDraft,
  type ArgentinaForecastDraft,
} from "@/server/x/argentinaForecastDraftStore";

export const ARGENTINA_FORECAST_TITLE = "Partidos de hoy · Liga Profesional Argentina";

const DONE_STATUSES = new Set(["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"]);

export function getArgentinaDayKey(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ARGENTINA_TZ,
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

export interface BuildArgentinaForecastResult {
  draft: ArgentinaForecastDraft | null;
  skippedReason?: string;
}

export async function buildArgentinaForecastDraft(options?: {
  force?: boolean;
  now?: Date;
}): Promise<BuildArgentinaForecastResult> {
  const now = options?.now ?? new Date();
  const dayKey = getArgentinaDayKey(now);
  const existing = getArgentinaForecastDraftForDay(dayKey);

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
      ARGENTINA_LEAGUE_ID,
      DEFAULT_SEASON,
      ARGENTINA_TZ
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
    getLeagueStandings(ARGENTINA_LEAGUE_ID, DEFAULT_SEASON),
    getLeagueSeasonFixtures(ARGENTINA_LEAGUE_ID, DEFAULT_SEASON),
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
      console.warn(`[x-argentina] H2H failed ${homeId}-${awayId}`, e);
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
      avgGoalsPerMatch: 2.3,
      isPreTournament: playedCount === 0,
      clubCalibration: true,
      leagueFixtures: seasonFixtures,
      homeLeagueId: pickA?.leagueId ?? ARGENTINA_LEAGUE_ID,
      awayLeagueId: pickB?.leagueId ?? ARGENTINA_LEAGUE_ID,
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
      competition: f.league.round?.includes("Clausura")
        ? "🇦🇷 Clausura"
        : f.league.round?.includes("Apertura")
          ? "🇦🇷 Apertura"
          : "🇦🇷 Liga Profesional",
    });
  }

  const tweets = buildForecastThread(matches, {
    title: ARGENTINA_FORECAST_TITLE,
  });
  const draft: ArgentinaForecastDraft = {
    kind: "argentina",
    dayKey,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tweets,
    matches,
  };
  saveArgentinaForecastDraft(draft);
  return { draft };
}

export function getTelegramArgentinaForecastPreview(
  draft: ArgentinaForecastDraft
): string {
  return formatTelegramForecastPreview(
    draft.matches,
    draft.dayKey,
    ARGENTINA_FORECAST_TITLE
  );
}
