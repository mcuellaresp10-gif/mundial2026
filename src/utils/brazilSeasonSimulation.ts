/**
 * Monte Carlo Brasileirão Serie A (liga 71).
 * Formato anual todos-contra-todos (≈20 equipos / 38 fechas).
 * Zonas típicas: G4/G6 Libertadores, 7–12 Sudamericana, Z4 descenso (17–20).
 */
import type { Fixture, StandingTeam } from "@/types";
import { isFixtureFinished } from "@/lib/liveRefresh";
import {
  avgGoalsFromFixtures,
  estimateMatchLambdas,
  standingToTeamGroupState,
  type TeamGroupState,
} from "@/utils/matchOutcomeEngine";
import {
  applyMatchToStates,
  formatBetPlayPct,
  sampleNoisyScore,
  shrinkPairLambdas,
  strengthConfidenceWeight,
  BETPLAY_DEFAULT_SIMULATIONS,
  BETPLAY_STRENGTH_SHRINK_K,
} from "@/utils/betPlaySeasonSimulation";

export const BRAZIL_DEFAULT_SIMULATIONS = BETPLAY_DEFAULT_SIMULATIONS;
export const BRAZIL_LEAGUE_ID = 71;
export const BRAZIL_TZ = "America/Sao_Paulo";
/** Plazas habituales a Libertadores (fase de grupos + preliminares). */
export const BRAZIL_LIBERTADORES_SPOTS = 6;
export const BRAZIL_SUDAMERICANA_FIRST = 7;
export const BRAZIL_SUDAMERICANA_LAST = 12;
export const BRAZIL_RELEGATION_SPOTS = 4;

export { formatBetPlayPct as formatBrazilPct, BETPLAY_STRENGTH_SHRINK_K };

export interface BrazilSeasonProbs {
  teamId: number;
  teamName: string;
  teamLogo: string;
  rank: number;
  probChampion: number;
  /** Top 4 — fase de grupos Libertadores (G4). */
  probLibertadoresG4: number;
  /** Top 6 — Libertadores en sentido amplio (G6). */
  probLibertadores: number;
  /** Puestos 7–12 Sudamericana. */
  probSudamericana: number;
  /** Últimos 4 — descenso. */
  probRelegation: number;
}

export interface BrazilSimMeta {
  maxPlayed: number;
  pendingCount: number;
  simulations: number;
  strengthWeight: number;
  teamCount: number;
}

export interface BrazilSimResult {
  rows: BrazilSeasonProbs[];
  meta: BrazilSimMeta;
}

export interface BrazilSimInput {
  standings: StandingTeam[];
  fixtures: Fixture[];
  historyFixtures?: Fixture[];
  simulations?: number;
  rng?: () => number;
}

type LambdaPair = { home: number; away: number };

function pairKey(homeId: number, awayId: number): string {
  return `${homeId}:${awayId}`;
}

function isPendingFixture(f: Fixture): boolean {
  const s = f.fixture.status.short;
  return s === "NS" || s === "PST" || s === "TBD";
}

function fixturesBetweenTeams(
  fixtures: Fixture[],
  a: number,
  b: number
): Fixture[] {
  return fixtures.filter(
    (f) =>
      (f.teams.home.id === a && f.teams.away.id === b) ||
      (f.teams.home.id === b && f.teams.away.id === a)
  );
}

function rankTeamStates(states: TeamGroupState[]): TeamGroupState[] {
  return [...states].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId - b.teamId;
  });
}

function cloneStates(states: TeamGroupState[]): Map<number, TeamGroupState> {
  return new Map(states.map((s) => [s.teamId, { ...s }]));
}

function buildAllPairLambdas(
  allStates: TeamGroupState[],
  standingsById: Map<number, StandingTeam>,
  historyFixtures: Fixture[],
  baseTotalGoals: number,
  isPreTournament: boolean
): Map<string, LambdaPair> {
  const map = new Map<string, LambdaPair>();
  const stateById = new Map(allStates.map((s) => [s.teamId, s]));
  const h2hCache = new Map<string, Fixture[]>();

  for (let i = 0; i < allStates.length; i++) {
    for (let j = 0; j < allStates.length; j++) {
      if (i === j) continue;
      const homeId = allStates[i].teamId;
      const awayId = allStates[j].teamId;
      const unordered =
        homeId < awayId ? `${homeId}:${awayId}` : `${awayId}:${homeId}`;
      let h2h = h2hCache.get(unordered);
      if (!h2h) {
        h2h = fixturesBetweenTeams(historyFixtures, homeId, awayId);
        h2hCache.set(unordered, h2h);
      }
      const { home, away } = estimateMatchLambdas({
        homeState: stateById.get(homeId)!,
        awayState: stateById.get(awayId)!,
        h2h,
        isPreTournament,
        baseTotalGoals,
        standingHome: standingsById.get(homeId),
        standingAway: standingsById.get(awayId),
        clubCalibration: {
          enabled: true,
          leagueFixtures: historyFixtures,
        },
      });
      map.set(pairKey(homeId, awayId), { home, away });
    }
  }
  return map;
}

export function simulateBrazilSeasonProbabilitiesDetailed(
  input: BrazilSimInput
): BrazilSimResult {
  const {
    standings,
    fixtures,
    historyFixtures,
    simulations = BRAZIL_DEFAULT_SIMULATIONS,
    rng = Math.random,
  } = input;

  const emptyMeta: BrazilSimMeta = {
    maxPlayed: 0,
    pendingCount: 0,
    simulations: Math.max(1, simulations),
    strengthWeight: 0,
    teamCount: standings.length,
  };

  if (standings.length < 8) {
    return { rows: [], meta: emptyMeta };
  }

  const history = historyFixtures ?? fixtures;
  const standingsById = new Map(standings.map((s) => [s.team.id, s]));
  const maxPlayed = Math.max(...standings.map((s) => s.all.played), 0);
  const strengthWeight = strengthConfidenceWeight(maxPlayed);
  const isPreTournament = maxPlayed === 0;

  const finishedForAvg = history.filter((f) =>
    isFixtureFinished(f.fixture.status.short)
  );
  const baseTotalGoals = avgGoalsFromFixtures(
    finishedForAvg.length > 0
      ? finishedForAvg
      : fixtures.filter((f) => isFixtureFinished(f.fixture.status.short))
  );

  const baseStates = standings.map((s) =>
    standingToTeamGroupState(s, isPreTournament)
  );
  const teamIds = new Set(baseStates.map((t) => t.teamId));
  const pending = fixtures.filter(
    (f) =>
      isPendingFixture(f) &&
      teamIds.has(f.teams.home.id) &&
      teamIds.has(f.teams.away.id)
  );

  const rawLambdas = buildAllPairLambdas(
    baseStates,
    standingsById,
    history,
    baseTotalGoals,
    isPreTournament
  );
  const pairLambdas = shrinkPairLambdas(rawLambdas, strengthWeight);

  const counts = new Map<
    number,
    {
      champion: number;
      g4: number;
      libertadores: number;
      sudamericana: number;
      relegation: number;
    }
  >();
  for (const t of baseStates) {
    counts.set(t.teamId, {
      champion: 0,
      g4: 0,
      libertadores: 0,
      sudamericana: 0,
      relegation: 0,
    });
  }

  const n = Math.max(1, simulations);
  const relegatedFrom = Math.max(1, standings.length - BRAZIL_RELEGATION_SPOTS + 1);

  for (let sim = 0; sim < n; sim++) {
    const states = cloneStates(baseStates);
    for (const f of pending) {
      const score = sampleNoisyScore(
        pairLambdas,
        f.teams.home.id,
        f.teams.away.id,
        strengthWeight,
        rng
      );
      applyMatchToStates(
        states,
        f.teams.home.id,
        f.teams.away.id,
        score.homeGoals,
        score.awayGoals
      );
    }

    const ranked = rankTeamStates([...states.values()]);
    ranked.forEach((t, idx) => {
      const pos = idx + 1;
      const c = counts.get(t.teamId)!;
      if (pos === 1) c.champion += 1;
      if (pos <= 4) c.g4 += 1;
      if (pos <= BRAZIL_LIBERTADORES_SPOTS) c.libertadores += 1;
      if (pos >= BRAZIL_SUDAMERICANA_FIRST && pos <= BRAZIL_SUDAMERICANA_LAST) {
        c.sudamericana += 1;
      }
      if (pos >= relegatedFrom) c.relegation += 1;
    });
  }

  const rankNow = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalsDiff !== a.goalsDiff) return b.goalsDiff - a.goalsDiff;
    return b.all.goals.for - a.all.goals.for;
  });
  const rankMap = new Map(rankNow.map((s, i) => [s.team.id, i + 1]));

  const rows: BrazilSeasonProbs[] = standings.map((s) => {
    const c = counts.get(s.team.id)!;
    return {
      teamId: s.team.id,
      teamName: s.team.name,
      teamLogo: s.team.logo,
      rank: rankMap.get(s.team.id) ?? 99,
      probChampion: c.champion / n,
      probLibertadoresG4: c.g4 / n,
      probLibertadores: c.libertadores / n,
      probSudamericana: c.sudamericana / n,
      probRelegation: c.relegation / n,
    };
  });

  rows.sort(
    (a, b) =>
      b.probLibertadores - a.probLibertadores ||
      b.probChampion - a.probChampion ||
      a.rank - b.rank
  );

  return {
    rows,
    meta: {
      maxPlayed,
      pendingCount: pending.length,
      simulations: n,
      strengthWeight,
      teamCount: standings.length,
    },
  };
}
