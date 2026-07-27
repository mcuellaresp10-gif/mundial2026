import type { Fixture, StandingTeam } from "@/types";
import { isFixtureFinished } from "@/lib/liveRefresh";
import {
  avgGoalsFromFixtures,
  estimateMatchLambdas,
  sampleScoreFromLambdas,
  standingToTeamGroupState,
  type TeamGroupState,
} from "@/utils/matchOutcomeEngine";

export const BETPLAY_DEFAULT_SIMULATIONS = 1000;
export const BETPLAY_QUALIFYING_SPOTS = 8;

export interface BetPlayPhaseProbs {
  teamId: number;
  teamName: string;
  teamLogo: string;
  /** 0–1 */
  probCuadrangulares: number;
  /** 0–1 */
  probFinal: number;
  /** 0–1 */
  probChampion: number;
}

export interface BetPlaySimInput {
  /** Tabla de la fase regular (un grupo / tabla plana). */
  standings: StandingTeam[];
  /** Fixtures de la fase (ya filtrados Apertura/Clausura si aplica). */
  fixtures: Fixture[];
  simulations?: number;
  rng?: () => number;
}

interface TeamMeta {
  teamId: number;
  teamName: string;
  teamLogo: string;
  standing: StandingTeam;
}

function isPendingFixture(f: Fixture): boolean {
  const s = f.fixture.status.short;
  return s === "NS" || s === "PST" || s === "TBD";
}

/** Orden: pts → DIF → GF. */
export function rankTeamStates(states: TeamGroupState[]): TeamGroupState[] {
  return [...states].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId - b.teamId;
  });
}

export function applyMatchToStates(
  states: Map<number, TeamGroupState>,
  homeId: number,
  awayId: number,
  homeGoals: number,
  awayGoals: number
): void {
  const home = states.get(homeId);
  const away = states.get(awayId);
  if (!home || !away) return;

  home.goalsFor += homeGoals;
  home.goalsAgainst += awayGoals;
  away.goalsFor += awayGoals;
  away.goalsAgainst += homeGoals;

  if (homeGoals > awayGoals) home.points += 3;
  else if (homeGoals === awayGoals) {
    home.points += 1;
    away.points += 1;
  } else away.points += 3;
}

function cloneStates(states: TeamGroupState[]): Map<number, TeamGroupState> {
  return new Map(states.map((s) => [s.teamId, { ...s }]));
}

function freshPhaseStates(teams: TeamGroupState[]): Map<number, TeamGroupState> {
  return new Map(
    teams.map((t) => [
      t.teamId,
      {
        ...t,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
    ])
  );
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
}

/**
 * 1º y 2º son cabezas de serie (A y B).
 * Puestos 3–8 se sortean: 3 por grupo.
 */
export function drawCuadrangularGroups(
  top8: TeamGroupState[],
  rng: () => number = Math.random
): { groupA: TeamGroupState[]; groupB: TeamGroupState[] } {
  if (top8.length < BETPLAY_QUALIFYING_SPOTS) {
    const padded = [...top8];
    return {
      groupA: padded.slice(0, Math.ceil(padded.length / 2)),
      groupB: padded.slice(Math.ceil(padded.length / 2)),
    };
  }

  const seedA = top8[0];
  const seedB = top8[1];
  const rest = top8.slice(2);
  shuffleInPlace(rest, rng);

  return {
    groupA: [seedA, rest[0], rest[1], rest[2]],
    groupB: [seedB, rest[3], rest[4], rest[5]],
  };
}

function roundRobinPairs(teamIds: number[]): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      pairs.push([teamIds[i], teamIds[j]]);
    }
  }
  return pairs;
}

type LambdaPair = { home: number; away: number };

function pairKey(homeId: number, awayId: number): string {
  return `${homeId}:${awayId}`;
}

function buildAllPairLambdas(
  baseStates: TeamGroupState[],
  metaById: Map<number, TeamMeta>,
  fixtures: Fixture[],
  baseTotalGoals: number,
  isPreTournament: boolean
): Map<string, LambdaPair> {
  const map = new Map<string, LambdaPair>();
  const stateById = new Map(baseStates.map((s) => [s.teamId, s]));

  for (let i = 0; i < baseStates.length; i++) {
    for (let j = 0; j < baseStates.length; j++) {
      if (i === j) continue;
      const homeId = baseStates[i].teamId;
      const awayId = baseStates[j].teamId;
      const homeState = stateById.get(homeId)!;
      const awayState = stateById.get(awayId)!;
      const { home, away } = estimateMatchLambdas({
        homeState,
        awayState,
        h2h: [],
        isPreTournament,
        baseTotalGoals,
        standingHome: metaById.get(homeId)?.standing,
        standingAway: metaById.get(awayId)?.standing,
        clubCalibration: {
          enabled: true,
          leagueFixtures: fixtures,
        },
      });
      map.set(pairKey(homeId, awayId), { home, away });
    }
  }
  return map;
}

function getPairLambdas(
  lambdas: Map<string, LambdaPair>,
  homeId: number,
  awayId: number
): LambdaPair {
  return lambdas.get(pairKey(homeId, awayId)) ?? { home: 1.3, away: 1.1 };
}

function simulateRoundRobinGroup(
  group: TeamGroupState[],
  pairLambdas: Map<string, LambdaPair>,
  rng: () => number
): TeamGroupState {
  const states = freshPhaseStates(group);
  const ids = group.map((t) => t.teamId);

  for (const [a, b] of roundRobinPairs(ids)) {
    for (const [homeId, awayId] of [
      [a, b],
      [b, a],
    ] as const) {
      const { home, away } = getPairLambdas(pairLambdas, homeId, awayId);
      const score = sampleScoreFromLambdas(home, away, rng);
      applyMatchToStates(states, homeId, awayId, score.homeGoals, score.awayGoals);
    }
  }

  const ranked = rankTeamStates([...states.values()]);
  return ranked[0];
}

function simulateTwoLegFinal(
  teamA: TeamGroupState,
  teamB: TeamGroupState,
  secondLegHomeId: number,
  pairLambdas: Map<string, LambdaPair>,
  rng: () => number
): number {
  const firstHome = secondLegHomeId === teamA.teamId ? teamB.teamId : teamA.teamId;
  const firstAway = secondLegHomeId;
  const secondHome = secondLegHomeId;
  const secondAway = firstHome;

  let aggA = 0;
  let aggB = 0;

  for (const [homeId, awayId] of [
    [firstHome, firstAway],
    [secondHome, secondAway],
  ] as const) {
    const { home, away } = getPairLambdas(pairLambdas, homeId, awayId);
    const score = sampleScoreFromLambdas(home, away, rng);
    if (homeId === teamA.teamId) {
      aggA += score.homeGoals;
      aggB += score.awayGoals;
    } else {
      aggB += score.homeGoals;
      aggA += score.awayGoals;
    }
  }

  if (aggA > aggB) return teamA.teamId;
  if (aggB > aggA) return teamB.teamId;

  if (teamA.priorStrength !== teamB.priorStrength) {
    return teamA.priorStrength > teamB.priorStrength ? teamA.teamId : teamB.teamId;
  }
  return teamA.teamId > teamB.teamId ? teamA.teamId : teamB.teamId;
}

/**
 * Monte Carlo Liga BetPlay: Cuadrangulares / Final / Campeón.
 * Usa el motor de club (`estimateMatchLambdas` + Poisson).
 */
export function simulateBetPlayPhaseProbabilities(
  input: BetPlaySimInput
): BetPlayPhaseProbs[] {
  const {
    standings,
    fixtures,
    simulations = BETPLAY_DEFAULT_SIMULATIONS,
    rng = Math.random,
  } = input;

  if (standings.length === 0) return [];

  const isPreTournament = !standings.some((s) => s.all.played > 0);
  const baseTotalGoals = avgGoalsFromFixtures(
    fixtures.filter((f) => isFixtureFinished(f.fixture.status.short))
  );

  const metaById = new Map<number, TeamMeta>();
  const baseStates: TeamGroupState[] = [];

  for (const s of standings) {
    metaById.set(s.team.id, {
      teamId: s.team.id,
      teamName: s.team.name,
      teamLogo: s.team.logo,
      standing: s,
    });
    baseStates.push(standingToTeamGroupState(s, isPreTournament));
  }

  const pending = fixtures.filter(
    (f) =>
      isPendingFixture(f) &&
      metaById.has(f.teams.home.id) &&
      metaById.has(f.teams.away.id)
  );

  // Una sola pasada de λ por par dirigido (regular + playoffs).
  const pairLambdas = buildAllPairLambdas(
    baseStates,
    metaById,
    fixtures,
    baseTotalGoals,
    isPreTournament
  );

  const counts = new Map<
    number,
    { cuadrangulares: number; final: number; champion: number }
  >();
  for (const s of baseStates) {
    counts.set(s.teamId, { cuadrangulares: 0, final: 0, champion: 0 });
  }

  const n = Math.max(1, simulations);

  for (let sim = 0; sim < n; sim++) {
    const states = cloneStates(baseStates);

    for (const f of pending) {
      const lambdas = getPairLambdas(
        pairLambdas,
        f.teams.home.id,
        f.teams.away.id
      );
      const score = sampleScoreFromLambdas(lambdas.home, lambdas.away, rng);
      applyMatchToStates(
        states,
        f.teams.home.id,
        f.teams.away.id,
        score.homeGoals,
        score.awayGoals
      );
    }

    const ranked = rankTeamStates([...states.values()]);
    const top8 = ranked.slice(0, BETPLAY_QUALIFYING_SPOTS);

    for (const t of top8) {
      counts.get(t.teamId)!.cuadrangulares += 1;
    }

    if (top8.length < 2) {
      if (top8[0]) counts.get(top8[0].teamId)!.champion += 1;
      continue;
    }

    const { groupA, groupB } = drawCuadrangularGroups(top8, rng);

    const winnerA = simulateRoundRobinGroup(groupA, pairLambdas, rng);
    const winnerB = simulateRoundRobinGroup(groupB, pairLambdas, rng);

    counts.get(winnerA.teamId)!.final += 1;
    counts.get(winnerB.teamId)!.final += 1;

    const rankIndex = new Map(ranked.map((t, i) => [t.teamId, i]));
    const secondLegHomeId =
      (rankIndex.get(winnerA.teamId) ?? 99) <= (rankIndex.get(winnerB.teamId) ?? 99)
        ? winnerA.teamId
        : winnerB.teamId;

    const finalA = ranked.find((t) => t.teamId === winnerA.teamId) ?? winnerA;
    const finalB = ranked.find((t) => t.teamId === winnerB.teamId) ?? winnerB;

    const championId = simulateTwoLegFinal(
      finalA,
      finalB,
      secondLegHomeId,
      pairLambdas,
      rng
    );
    counts.get(championId)!.champion += 1;
  }

  const rows: BetPlayPhaseProbs[] = baseStates.map((s) => {
    const c = counts.get(s.teamId)!;
    const meta = metaById.get(s.teamId)!;
    return {
      teamId: s.teamId,
      teamName: meta.teamName,
      teamLogo: meta.teamLogo,
      probCuadrangulares: c.cuadrangulares / n,
      probFinal: c.final / n,
      probChampion: c.champion / n,
    };
  });

  return rows.sort((a, b) => b.probChampion - a.probChampion || b.probFinal - a.probFinal);
}
