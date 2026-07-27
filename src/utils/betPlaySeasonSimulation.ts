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
/** Pseudocounts para confianza de tabla: w = played / (played + K). */
export const BETPLAY_STRENGTH_SHRINK_K = 9;
/** σ base del ruido log-normal en λ; se amortigua con w. */
export const BETPLAY_LAMBDA_NOISE_SIGMA = 0.28;
/** Por debajo de esto, la UI muestra "<0.1%" si no está eliminado. */
export const BETPLAY_DISPLAY_FLOOR = 0.001;

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
  /** Ya no puede alcanzar top 8 con los puntos restantes. */
  mathematicallyEliminated: boolean;
}

export interface BetPlaySimMeta {
  maxPlayed: number;
  pendingCount: number;
  simulations: number;
  strengthWeight: number;
  /** Partidos históricos usados para H2H/forma (Apertura + Clausura, etc.). */
  historyFixtureCount: number;
}

export interface BetPlaySimResult {
  rows: BetPlayPhaseProbs[];
  meta: BetPlaySimMeta;
}

export interface BetPlaySimInput {
  /** Tabla del torneo actual (p. ej. solo Clausura). No mezclar puntos de Apertura. */
  standings: StandingTeam[];
  /** Fixtures del torneo actual: pendientes a simular + resultados ya jugados de esta fase. */
  fixtures: Fixture[];
  /**
   * Historial de la temporada (Apertura + Clausura, etc.) para H2H y forma reciente.
   * No altera la tabla de puntos del torneo actual.
   */
  historyFixtures?: Fixture[];
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

export function strengthConfidenceWeight(
  maxPlayed: number,
  k: number = BETPLAY_STRENGTH_SHRINK_K
): number {
  const played = Math.max(0, maxPlayed);
  return played / (played + k);
}

/**
 * Mezcla cada λ hacia la media de la liga según confianza de tabla.
 * w≈0 temprano → casi todos iguales; w→1 tarde → se conserva el modelo.
 */
export function shrinkPairLambdas(
  lambdas: Map<string, LambdaPair>,
  strengthWeight: number
): Map<string, LambdaPair> {
  const w = Math.min(1, Math.max(0, strengthWeight));
  if (lambdas.size === 0 || w >= 0.999) return lambdas;

  let sum = 0;
  let n = 0;
  for (const pair of lambdas.values()) {
    sum += pair.home + pair.away;
    n += 2;
  }
  const mean = n > 0 ? sum / n : 1.2;

  const out = new Map<string, LambdaPair>();
  for (const [key, pair] of lambdas) {
    out.set(key, {
      home: Math.max(0.15, mean * (1 - w) + pair.home * w),
      away: Math.max(0.15, mean * (1 - w) + pair.away * w),
    });
  }
  return out;
}

/** Box-Muller con rng inyectable. */
function sampleNormal(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function applyLambdaNoise(
  pair: LambdaPair,
  strengthWeight: number,
  rng: () => number,
  baseSigma: number = BETPLAY_LAMBDA_NOISE_SIGMA
): LambdaPair {
  const sigma = baseSigma * (1 - Math.min(1, Math.max(0, strengthWeight)));
  if (sigma < 0.01) return pair;
  const mulHome = Math.exp(sampleNormal(rng) * sigma);
  const mulAway = Math.exp(sampleNormal(rng) * sigma);
  return {
    home: Math.max(0.15, Math.min(4.5, pair.home * mulHome)),
    away: Math.max(0.15, Math.min(4.5, pair.away * mulAway)),
  };
}

/**
 * Partidos restantes por equipo (pendientes en el calendario filtrado).
 */
export function remainingMatchesByTeam(
  pending: Fixture[],
  teamIds: Iterable<number>
): Map<number, number> {
  const remaining = new Map<number, number>();
  for (const id of teamIds) remaining.set(id, 0);
  for (const f of pending) {
    const homeId = f.teams.home.id;
    const awayId = f.teams.away.id;
    if (remaining.has(homeId)) remaining.set(homeId, remaining.get(homeId)! + 1);
    if (remaining.has(awayId)) remaining.set(awayId, remaining.get(awayId)! + 1);
  }
  return remaining;
}

/**
 * Eliminado de cuadrangulares si su máximo de puntos posibles
 * queda por debajo del 8º (umbrales actuales de la tabla).
 */
export function isMathematicallyEliminatedFromTopN(
  standings: StandingTeam[],
  remainingByTeam: Map<number, number>,
  spots: number = BETPLAY_QUALIFYING_SPOTS
): Map<number, boolean> {
  const result = new Map<number, boolean>();
  if (standings.length === 0) return result;

  const sorted = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalsDiff !== a.goalsDiff) return b.goalsDiff - a.goalsDiff;
    return b.all.goals.for - a.all.goals.for;
  });

  const maxPossible = new Map<number, number>();
  for (const s of standings) {
    const rem = remainingByTeam.get(s.team.id) ?? 0;
    maxPossible.set(s.team.id, s.points + rem * 3);
  }

  // Umbral conservador: puntos actuales del N-ésimo (si hay ≥N equipos).
  // Un equipo está eliminado si ni ganando todo supera ese piso *y*
  // hay al menos `spots` equipos con más puntos actuales que su máximo posible.
  for (const s of standings) {
    const myMax = maxPossible.get(s.team.id) ?? s.points;
    let teamsClearlyAbove = 0;
    for (const other of sorted) {
      if (other.team.id === s.team.id) continue;
      if (other.points > myMax) teamsClearlyAbove += 1;
    }
    result.set(s.team.id, teamsClearlyAbove >= spots);
  }
  return result;
}

/** Formato de % para UI: evita 0.0% engañoso temprano. */
export function formatBetPlayPct(
  value: number,
  opts: { mathematicallyEliminated?: boolean; maxPlayed?: number } = {}
): string {
  const { mathematicallyEliminated = false, maxPlayed = 0 } = opts;
  if (mathematicallyEliminated) return "0.0%";
  if (value <= 0) {
    // Temprano: no mostrar cero duro; tarde: 0.0% está bien.
    if (maxPlayed < BETPLAY_STRENGTH_SHRINK_K) return "<0.1%";
    return "0.0%";
  }
  if (value < BETPLAY_DISPLAY_FLOOR) return "<0.1%";
  return `${(value * 100).toFixed(1)}%`;
}

/** Enfrentamientos FT entre dos equipos (historial de temporada). */
export function fixturesBetweenTeams(
  fixtures: Fixture[],
  teamAId: number,
  teamBId: number
): Fixture[] {
  return fixtures.filter(
    (f) =>
      isFixtureFinished(f.fixture.status.short) &&
      ((f.teams.home.id === teamAId && f.teams.away.id === teamBId) ||
        (f.teams.home.id === teamBId && f.teams.away.id === teamAId))
  );
}

function buildAllPairLambdas(
  baseStates: TeamGroupState[],
  metaById: Map<number, TeamMeta>,
  /** Historial para H2H + forma (puede incluir Apertura). */
  historyFixtures: Fixture[],
  baseTotalGoals: number,
  isPreTournament: boolean
): Map<string, LambdaPair> {
  const map = new Map<string, LambdaPair>();
  const stateById = new Map(baseStates.map((s) => [s.teamId, s]));
  const h2hCache = new Map<string, Fixture[]>();

  for (let i = 0; i < baseStates.length; i++) {
    for (let j = 0; j < baseStates.length; j++) {
      if (i === j) continue;
      const homeId = baseStates[i].teamId;
      const awayId = baseStates[j].teamId;
      const homeState = stateById.get(homeId)!;
      const awayState = stateById.get(awayId)!;

      const unordered =
        homeId < awayId ? `${homeId}:${awayId}` : `${awayId}:${homeId}`;
      let h2h = h2hCache.get(unordered);
      if (!h2h) {
        h2h = fixturesBetweenTeams(historyFixtures, homeId, awayId);
        h2hCache.set(unordered, h2h);
      }

      const { home, away } = estimateMatchLambdas({
        homeState,
        awayState,
        h2h,
        isPreTournament,
        baseTotalGoals,
        standingHome: metaById.get(homeId)?.standing,
        standingAway: metaById.get(awayId)?.standing,
        clubCalibration: {
          enabled: true,
          // Forma reciente / calibración club: mira historial (Apertura incluido).
          leagueFixtures: historyFixtures,
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

function sampleNoisyScore(
  pairLambdas: Map<string, LambdaPair>,
  homeId: number,
  awayId: number,
  strengthWeight: number,
  rng: () => number
): { homeGoals: number; awayGoals: number } {
  const base = getPairLambdas(pairLambdas, homeId, awayId);
  const noisy = applyLambdaNoise(base, strengthWeight, rng);
  return sampleScoreFromLambdas(noisy.home, noisy.away, rng);
}

function simulateRoundRobinGroup(
  group: TeamGroupState[],
  pairLambdas: Map<string, LambdaPair>,
  strengthWeight: number,
  rng: () => number
): TeamGroupState {
  const states = freshPhaseStates(group);
  const ids = group.map((t) => t.teamId);

  for (const [a, b] of roundRobinPairs(ids)) {
    for (const [homeId, awayId] of [
      [a, b],
      [b, a],
    ] as const) {
      const score = sampleNoisyScore(
        pairLambdas,
        homeId,
        awayId,
        strengthWeight,
        rng
      );
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
  strengthWeight: number,
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
    const score = sampleNoisyScore(
      pairLambdas,
      homeId,
      awayId,
      strengthWeight,
      rng
    );
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
 * Shrinkage temprano + ruido por partido para no congelar 1 jornada.
 */
export function simulateBetPlayPhaseProbabilitiesDetailed(
  input: BetPlaySimInput
): BetPlaySimResult {
  const {
    standings,
    fixtures,
    historyFixtures,
    simulations = BETPLAY_DEFAULT_SIMULATIONS,
    rng = Math.random,
  } = input;

  const emptyMeta: BetPlaySimMeta = {
    maxPlayed: 0,
    pendingCount: 0,
    simulations: Math.max(1, simulations),
    strengthWeight: 0,
    historyFixtureCount: 0,
  };

  if (standings.length === 0) {
    return { rows: [], meta: emptyMeta };
  }

  // Torneo actual = standings + fixtures; historial = H2H/forma (default = mismos fixtures).
  const history = historyFixtures ?? fixtures;

  const maxPlayed = Math.max(...standings.map((s) => s.all.played), 0);
  const strengthWeight = strengthConfidenceWeight(maxPlayed);
  const isPreTournament = maxPlayed === 0;
  // Media de goles: preferir historial de temporada (más estable al inicio del torneo).
  const finishedForAvg = history.filter((f) =>
    isFixtureFinished(f.fixture.status.short)
  );
  const baseTotalGoals = avgGoalsFromFixtures(
    finishedForAvg.length > 0
      ? finishedForAvg
      : fixtures.filter((f) => isFixtureFinished(f.fixture.status.short))
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

  const remaining = remainingMatchesByTeam(
    pending,
    standings.map((s) => s.team.id)
  );
  const eliminated = isMathematicallyEliminatedFromTopN(
    standings,
    remaining,
    BETPLAY_QUALIFYING_SPOTS
  );

  const rawLambdas = buildAllPairLambdas(
    baseStates,
    metaById,
    history,
    baseTotalGoals,
    isPreTournament
  );
  const pairLambdas = shrinkPairLambdas(rawLambdas, strengthWeight);

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
    const top8 = ranked.slice(0, BETPLAY_QUALIFYING_SPOTS);

    for (const t of top8) {
      counts.get(t.teamId)!.cuadrangulares += 1;
    }

    if (top8.length < 2) {
      if (top8[0]) counts.get(top8[0].teamId)!.champion += 1;
      continue;
    }

    const { groupA, groupB } = drawCuadrangularGroups(top8, rng);

    const winnerA = simulateRoundRobinGroup(
      groupA,
      pairLambdas,
      strengthWeight,
      rng
    );
    const winnerB = simulateRoundRobinGroup(
      groupB,
      pairLambdas,
      strengthWeight,
      rng
    );

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
      strengthWeight,
      rng
    );
    counts.get(championId)!.champion += 1;
  }

  const rows: BetPlayPhaseProbs[] = baseStates.map((s) => {
    const c = counts.get(s.teamId)!;
    const meta = metaById.get(s.teamId)!;
    const elim = eliminated.get(s.teamId) === true;
    return {
      teamId: s.teamId,
      teamName: meta.teamName,
      teamLogo: meta.teamLogo,
      // Si está eliminado, forzar 0 en fase regular (final/campeón ya serían 0).
      probCuadrangulares: elim ? 0 : c.cuadrangulares / n,
      probFinal: elim ? 0 : c.final / n,
      probChampion: elim ? 0 : c.champion / n,
      mathematicallyEliminated: elim,
    };
  });

  rows.sort(
    (a, b) =>
      b.probCuadrangulares - a.probCuadrangulares ||
      b.probFinal - a.probFinal ||
      b.probChampion - a.probChampion
  );

  return {
    rows,
    meta: {
      maxPlayed,
      pendingCount: pending.length,
      simulations: n,
      strengthWeight,
      historyFixtureCount: history.length,
    },
  };
}

/** Compat: solo filas (ordenadas por Cuadrangulares). */
export function simulateBetPlayPhaseProbabilities(
  input: BetPlaySimInput
): BetPlayPhaseProbs[] {
  return simulateBetPlayPhaseProbabilitiesDetailed(input).rows;
}
