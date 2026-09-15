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
import type { Fixture, StandingTeam, StandingsGroup } from "@/types";
import {
  buildForecastThread,
  formatTelegramForecastPreview,
} from "@/server/x/formatForecastTweets";
import { getBogotaDayKey } from "@/server/x/buildBetPlayForecastDraft";
import {
  getConmebolForecastDraftForDay,
  saveConmebolForecastDraft,
  type ConmebolForecastDraft,
  type ForecastDraftMatch,
} from "@/server/x/conmebolForecastDraftStore";

export const LIBERTADORES_LEAGUE_ID = 13;
export const SUDAMERICANA_LEAGUE_ID = 11;

export const CONMEBOL_FORECAST_TITLE =
  "Partidos de hoy · Libertadores y Sudamericana";

const DONE_STATUSES = new Set(["FT", "AET", "PEN", "CANC", "ABD", "AWD", "WO"]);

const COMPETITIONS: { id: number; label: string }[] = [
  { id: LIBERTADORES_LEAGUE_ID, label: "🏆 Libertadores" },
  { id: SUDAMERICANA_LEAGUE_ID, label: "🌎 Sudamericana" },
];

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

interface LeagueBundle {
  id: number;
  label: string;
  fixtures: Fixture[];
  standingsGroups: StandingsGroup[];
  standingsFlat: StandingTeam[];
  seasonFixtures: Fixture[];
}

export interface BuildConmebolDraftResult {
  draft: ConmebolForecastDraft | null;
  skippedReason?: string;
}

async function loadLeagueBundle(
  dayKey: string,
  id: number,
  label: string
): Promise<LeagueBundle> {
  const [fixturesRaw, standingsGroups, seasonFixtures] = await Promise.all([
    getFixturesByDateLeague(dayKey, id),
    getLeagueStandings(id, DEFAULT_SEASON),
    getLeagueSeasonFixtures(id, DEFAULT_SEASON),
  ]);
  const fixtures = fixturesRaw
    .filter((f) => isPendingToday(f.fixture.status.short))
    .sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
  return {
    id,
    label,
    fixtures,
    standingsGroups,
    standingsFlat: flattenStandings(standingsGroups),
    seasonFixtures,
  };
}

async function simulateMatch(
  f: Fixture,
  bundle: LeagueBundle
): Promise<ForecastDraftMatch & { competition: string }> {
  const homeId = f.teams.home.id;
  const awayId = f.teams.away.id;
  const pickA = pickStandingForClub(bundle.standingsGroups, homeId);
  const pickB = pickStandingForClub(bundle.standingsGroups, awayId);
  const standingA =
    pickA?.standing ?? bundle.standingsFlat.find((s) => s.team.id === homeId);
  const standingB =
    pickB?.standing ?? bundle.standingsFlat.find((s) => s.team.id === awayId);

  let h2h: Fixture[] = [];
  try {
    h2h = await getH2H(homeId, awayId);
  } catch (e) {
    console.warn(`[x-conmebol] H2H failed ${homeId}-${awayId}`, e);
  }

  const playedCount = Math.max(
    ...bundle.standingsFlat.map((s) => s.all.played),
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
    avgGoalsPerMatch: 2.5,
    isPreTournament: playedCount === 0,
    clubCalibration: true,
    leagueFixtures: bundle.seasonFixtures,
    homeLeagueId: pickA?.leagueId ?? bundle.id,
    awayLeagueId: pickB?.leagueId ?? bundle.id,
    simulations: 4000,
  });

  return {
    fixtureId: f.fixture.id,
    homeId,
    awayId,
    homeName: f.teams.home.name,
    awayName: f.teams.away.name,
    winHome: result.outcomeProbs.winA,
    draw: result.outcomeProbs.draw,
    winAway: result.outcomeProbs.winB,
    competition: bundle.label,
  };
}

/**
 * Borrador 1X2 de partidos de hoy (Bogotá) en Libertadores + Sudamericana.
 */
export async function buildConmebolForecastDraft(options?: {
  force?: boolean;
  now?: Date;
}): Promise<BuildConmebolDraftResult> {
  const now = options?.now ?? new Date();
  const dayKey = getBogotaDayKey(now);
  const existing = getConmebolForecastDraftForDay(dayKey);

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

  const bundles = await Promise.all(
    COMPETITIONS.map((c) => loadLeagueBundle(dayKey, c.id, c.label))
  );

  const dated: { fixture: Fixture; bundle: LeagueBundle }[] = [];
  for (const bundle of bundles) {
    for (const fixture of bundle.fixtures) {
      dated.push({ fixture, bundle });
    }
  }
  dated.sort(
    (a, b) =>
      new Date(a.fixture.fixture.date).getTime() -
      new Date(b.fixture.fixture.date).getTime()
  );

  if (dated.length === 0) {
    return { draft: null, skippedReason: "no_fixtures" };
  }

  const matches: (ForecastDraftMatch & { competition: string })[] = [];
  for (const { fixture, bundle } of dated) {
    matches.push(await simulateMatch(fixture, bundle));
  }

  const tweets = buildForecastThread(matches, {
    title: CONMEBOL_FORECAST_TITLE,
  });
  const draft: ConmebolForecastDraft = {
    kind: "conmebol",
    dayKey,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tweets,
    matches,
  };
  saveConmebolForecastDraft(draft);
  return { draft };
}

export function getTelegramConmebolPreviewText(
  draft: ConmebolForecastDraft
): string {
  return formatTelegramForecastPreview(
    draft.matches,
    draft.dayKey,
    CONMEBOL_FORECAST_TITLE
  );
}
