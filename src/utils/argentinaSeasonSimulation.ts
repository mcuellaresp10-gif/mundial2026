/**
 * Monte Carlo Liga Profesional Argentina (LPF 2026).
 * Reglamento: 2 zonas de 15 → top 8 por zona → octavos/cuartos/semis/final a partido único
 * (alargue + penales si empate). Local = mejor ubicado en su zona (final en sede LPF).
 */
import type { Fixture, StandingTeam } from "@/types";
import { isFixtureFinished } from "@/lib/liveRefresh";
import {
  avgGoalsFromFixtures,
  estimateMatchLambdas,
  sampleScoreFromLambdas,
  standingToTeamGroupState,
  type TeamGroupState,
} from "@/utils/matchOutcomeEngine";
import {
  applyMatchToStates,
  formatBetPlayPct,
  isMathematicallyEliminatedFromTopN,
  remainingMatchesByTeam,
  sampleNoisyScore,
  shrinkPairLambdas,
  strengthConfidenceWeight,
  BETPLAY_DEFAULT_SIMULATIONS,
  BETPLAY_STRENGTH_SHRINK_K,
} from "@/utils/betPlaySeasonSimulation";

export const ARGENTINA_DEFAULT_SIMULATIONS = BETPLAY_DEFAULT_SIMULATIONS;
export const ARGENTINA_ZONE_QUALIFYING_SPOTS = 8;
export const ARGENTINA_LEAGUE_ID = 128;
export const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

export { formatBetPlayPct as formatArgentinaPct, BETPLAY_STRENGTH_SHRINK_K };

export interface ArgentinaPhaseProbs {
  teamId: number;
  teamName: string;
  teamLogo: string;
  zone: "A" | "B";
  /** Posición actual en su zona. */
  rank: number;
  /** Clasificar a octavos (top 8 zona). */
  probPlayoffs: number;
  probQuarter: number;
  probSemi: number;
  probFinal: number;
  probChampion: number;
  mathematicallyEliminated: boolean;
}

export interface ArgentinaSimMeta {
  maxPlayed: number;
  pendingCount: number;
  simulations: number;
  strengthWeight: number;
  historyFixtureCount: number;
  zoneASize: number;
  zoneBSize: number;
}

export interface ArgentinaSimResult {
  rows: ArgentinaPhaseProbs[];
  meta: ArgentinaSimMeta;
}

export interface ArgentinaSimInput {
  zoneA: StandingTeam[];
  zoneB: StandingTeam[];
  /** Fixtures del torneo actual (zonas + interzonales). */
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

interface SeededTeam {
  state: TeamGroupState;
  zone: "A" | "B";
  /** 1 = mejor de la zona. */
  zoneRank: number;
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

/** Ganador a partido único: 90' → si empate, penales sesgados por fuerza. */
function simulateSingleLegKnockout(
  home: SeededTeam,
  away: SeededTeam,
  pairLambdas: Map<string, LambdaPair>,
  strengthWeight: number,
  rng: () => number
): SeededTeam {
  const score = sampleNoisyScore(
    pairLambdas,
    home.state.teamId,
    away.state.teamId,
    strengthWeight,
    rng
  );
  if (score.homeGoals > score.awayGoals) return home;
  if (score.awayGoals > score.homeGoals) return away;

  // Alargue: segunda muestra con λ reducidas; si sigue empate → penales.
  const pair = pairLambdas.get(pairKey(home.state.teamId, away.state.teamId)) ?? {
    home: 1.2,
    away: 1.2,
  };
  const et = sampleScoreFromLambdas(pair.home * 0.35, pair.away * 0.35, rng);
  if (et.homeGoals > et.awayGoals) return home;
  if (et.awayGoals > et.homeGoals) return away;

  const pHome =
    0.5 +
    0.12 *
      Math.tanh(
        ((home.state.priorStrength ?? 50) - (away.state.priorStrength ?? 50)) / 20
      );
  return rng() < pHome ? home : away;
}

function betterSeed(a: SeededTeam, b: SeededTeam): SeededTeam {
  if (a.zoneRank !== b.zoneRank) return a.zoneRank < b.zoneRank ? a : b;
  return a.state.priorStrength >= b.state.priorStrength ? a : b;
}

function playKnockoutMatch(
  a: SeededTeam,
  b: SeededTeam,
  pairLambdas: Map<string, LambdaPair>,
  strengthWeight: number,
  rng: () => number
): SeededTeam {
  const home = betterSeed(a, b);
  const away = home.state.teamId === a.state.teamId ? b : a;
  return simulateSingleLegKnockout(home, away, pairLambdas, strengthWeight, rng);
}

/**
 * Octavos LPF: 1A-8B, 1B-8A, 2A-7B, 2B-7A, 3A-6B, 3B-6A, 4A-5B, 4B-5A
 * Cuartos: W1-W8, W2-W7, W3-W6, W4-W5
 * Semis: WC1-WC4, WC2-WC3
 */
function simulateArgentinaPlayoffs(
  zoneATop8: TeamGroupState[],
  zoneBTop8: TeamGroupState[],
  pairLambdas: Map<string, LambdaPair>,
  strengthWeight: number,
  rng: () => number
): {
  playoffs: number[];
  quarters: number[];
  semis: number[];
  finalists: number[];
  champion: number;
} {
  const seed = (zone: "A" | "B", list: TeamGroupState[], idx: number): SeededTeam => ({
    state: list[idx],
    zone,
    zoneRank: idx + 1,
  });

  const r16: Array<[SeededTeam, SeededTeam]> = [
    [seed("A", zoneATop8, 0), seed("B", zoneBTop8, 7)], // P1
    [seed("B", zoneBTop8, 0), seed("A", zoneATop8, 7)], // P2
    [seed("A", zoneATop8, 1), seed("B", zoneBTop8, 6)], // P3
    [seed("B", zoneBTop8, 1), seed("A", zoneATop8, 6)], // P4
    [seed("A", zoneATop8, 2), seed("B", zoneBTop8, 5)], // P5
    [seed("B", zoneBTop8, 2), seed("A", zoneATop8, 5)], // P6
    [seed("A", zoneATop8, 3), seed("B", zoneBTop8, 4)], // P7
    [seed("B", zoneBTop8, 3), seed("A", zoneATop8, 4)], // P8
  ];

  const playoffs = [
    ...zoneATop8.map((t) => t.teamId),
    ...zoneBTop8.map((t) => t.teamId),
  ];

  const w: SeededTeam[] = r16.map(([a, b]) =>
    playKnockoutMatch(a, b, pairLambdas, strengthWeight, rng)
  );

  const qfPairs: Array<[number, number]> = [
    [0, 7],
    [1, 6],
    [2, 5],
    [3, 4],
  ];
  const qfWinners = qfPairs.map(([i, j]) =>
    playKnockoutMatch(w[i], w[j], pairLambdas, strengthWeight, rng)
  );
  const quarters = qfWinners.map((t) => t.state.teamId);

  const sf1 = playKnockoutMatch(
    qfWinners[0],
    qfWinners[3],
    pairLambdas,
    strengthWeight,
    rng
  );
  const sf2 = playKnockoutMatch(
    qfWinners[1],
    qfWinners[2],
    pairLambdas,
    strengthWeight,
    rng
  );
  const semis = [sf1.state.teamId, sf2.state.teamId];

  const championTeam = playKnockoutMatch(
    sf1,
    sf2,
    pairLambdas,
    strengthWeight,
    rng
  );
  const finalists = [sf1.state.teamId, sf2.state.teamId];

  return {
    playoffs,
    quarters,
    semis,
    finalists,
    champion: championTeam.state.teamId,
  };
}

export function simulateArgentinaPhaseProbabilitiesDetailed(
  input: ArgentinaSimInput
): ArgentinaSimResult {
  const {
    zoneA,
    zoneB,
    fixtures,
    historyFixtures,
    simulations = ARGENTINA_DEFAULT_SIMULATIONS,
    rng = Math.random,
  } = input;

  const emptyMeta: ArgentinaSimMeta = {
    maxPlayed: 0,
    pendingCount: 0,
    simulations: Math.max(1, simulations),
    strengthWeight: 0,
    historyFixtureCount: 0,
    zoneASize: zoneA.length,
    zoneBSize: zoneB.length,
  };

  if (zoneA.length < 8 || zoneB.length < 8) {
    return { rows: [], meta: emptyMeta };
  }

  const history = historyFixtures ?? fixtures;
  const allStandings = [...zoneA, ...zoneB];
  const standingsById = new Map(allStandings.map((s) => [s.team.id, s]));
  const maxPlayed = Math.max(...allStandings.map((s) => s.all.played), 0);
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

  const baseA = zoneA.map((s) => standingToTeamGroupState(s, isPreTournament));
  const baseB = zoneB.map((s) => standingToTeamGroupState(s, isPreTournament));
  const allBase = [...baseA, ...baseB];

  const teamIds = new Set(allBase.map((t) => t.teamId));
  const pending = fixtures.filter(
    (f) =>
      isPendingFixture(f) &&
      teamIds.has(f.teams.home.id) &&
      teamIds.has(f.teams.away.id)
  );

  const elimA = isMathematicallyEliminatedFromTopN(
    zoneA,
    remainingMatchesByTeam(pending, zoneA.map((s) => s.team.id)),
    ARGENTINA_ZONE_QUALIFYING_SPOTS
  );
  const elimB = isMathematicallyEliminatedFromTopN(
    zoneB,
    remainingMatchesByTeam(pending, zoneB.map((s) => s.team.id)),
    ARGENTINA_ZONE_QUALIFYING_SPOTS
  );

  const rawLambdas = buildAllPairLambdas(
    allBase,
    standingsById,
    history,
    baseTotalGoals,
    isPreTournament
  );
  const pairLambdas = shrinkPairLambdas(rawLambdas, strengthWeight);

  const counts = new Map<
    number,
    {
      playoffs: number;
      quarter: number;
      semi: number;
      final: number;
      champion: number;
    }
  >();
  for (const t of allBase) {
    counts.set(t.teamId, {
      playoffs: 0,
      quarter: 0,
      semi: 0,
      final: 0,
      champion: 0,
    });
  }

  const n = Math.max(1, simulations);
  const zoneOf = new Map<number, "A" | "B">();
  for (const s of zoneA) zoneOf.set(s.team.id, "A");
  for (const s of zoneB) zoneOf.set(s.team.id, "B");

  for (let sim = 0; sim < n; sim++) {
    const states = cloneStates(allBase);

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

    const rankedA = rankTeamStates(
      baseA.map((t) => states.get(t.teamId)!).filter(Boolean)
    );
    const rankedB = rankTeamStates(
      baseB.map((t) => states.get(t.teamId)!).filter(Boolean)
    );
    const topA = rankedA.slice(0, ARGENTINA_ZONE_QUALIFYING_SPOTS);
    const topB = rankedB.slice(0, ARGENTINA_ZONE_QUALIFYING_SPOTS);

    if (topA.length < 8 || topB.length < 8) continue;

    const ko = simulateArgentinaPlayoffs(
      topA,
      topB,
      pairLambdas,
      strengthWeight,
      rng
    );

    for (const id of ko.playoffs) counts.get(id)!.playoffs += 1;
    for (const id of ko.quarters) counts.get(id)!.quarter += 1;
    for (const id of ko.semis) counts.get(id)!.semi += 1;
    for (const id of ko.finalists) counts.get(id)!.final += 1;
    counts.get(ko.champion)!.champion += 1;
  }

  const rankNow = (zone: StandingTeam[]) => {
    const sorted = [...zone].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalsDiff !== a.goalsDiff) return b.goalsDiff - a.goalsDiff;
      return b.all.goals.for - a.all.goals.for;
    });
    const m = new Map<number, number>();
    sorted.forEach((s, i) => m.set(s.team.id, i + 1));
    return m;
  };
  const rankA = rankNow(zoneA);
  const rankB = rankNow(zoneB);

  const rows: ArgentinaPhaseProbs[] = allStandings.map((s) => {
    const c = counts.get(s.team.id)!;
    const zone = zoneOf.get(s.team.id)!;
    const elim =
      zone === "A"
        ? elimA.get(s.team.id) === true
        : elimB.get(s.team.id) === true;
    return {
      teamId: s.team.id,
      teamName: s.team.name,
      teamLogo: s.team.logo,
      zone,
      rank: zone === "A" ? rankA.get(s.team.id)! : rankB.get(s.team.id)!,
      probPlayoffs: elim ? 0 : c.playoffs / n,
      probQuarter: elim ? 0 : c.quarter / n,
      probSemi: elim ? 0 : c.semi / n,
      probFinal: elim ? 0 : c.final / n,
      probChampion: elim ? 0 : c.champion / n,
      mathematicallyEliminated: elim,
    };
  });

  rows.sort((a, b) => b.probPlayoffs - a.probPlayoffs || b.probChampion - a.probChampion);

  return {
    rows,
    meta: {
      maxPlayed,
      pendingCount: pending.length,
      simulations: n,
      strengthWeight,
      historyFixtureCount: history.length,
      zoneASize: zoneA.length,
      zoneBSize: zoneB.length,
    },
  };
}

/** Detecta zona A/B desde label API ("Clausura - Group A", "Zona B", …). */
export function detectArgentinaZone(groupLabel: string): "A" | "B" | null {
  const g = groupLabel.toLowerCase();
  if (/\bgroup\s*a\b|\bzona\s*a\b|\bgrupo\s*a\b/.test(g)) return "A";
  if (/\bgroup\s*b\b|\bzona\s*b\b|\bgrupo\s*b\b/.test(g)) return "B";
  return null;
}
