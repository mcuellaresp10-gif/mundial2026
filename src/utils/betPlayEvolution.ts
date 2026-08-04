import type { Fixture, StandingTeam, Team } from "@/types";
import { isFixtureFinished } from "@/lib/liveRefresh";
import { isRegularSeasonMatchday } from "@/utils/cupBracket";
import {
  simulateBetPlayPhaseProbabilitiesDetailed,
  type BetPlayPhaseProbs,
} from "@/utils/betPlaySeasonSimulation";

/** Sims por corte histórico (más liviano que el live). */
export const BETPLAY_EVOLUTION_SIMULATIONS = 300;

export type BetPlayProbMetric =
  | "probCuadrangulares"
  | "probFinal"
  | "probChampion";

export interface BetPlayTeamMeta {
  teamId: number;
  teamName: string;
  teamLogo: string;
}

export interface BetPlayMatchdayCut {
  matchday: number;
  label: string;
  /** Fixtures de esa jornada (cualquier estado). */
  fixtures: Fixture[];
  /** True si todos los partidos de la jornada terminaron. */
  complete: boolean;
}

export interface BetPlayPointsSnapshot {
  matchday: number;
  label: string;
  pointsByTeamId: Record<number, number>;
}

export interface BetPlayProbSnapshot {
  matchday: number;
  label: string;
  rows: BetPlayPhaseProbs[];
}

interface EvolutionTeamState {
  teamId: number;
  teamName: string;
  teamLogo: string;
  points: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
}

/** Extrae N de "Apertura - 5", "Clausura - 12", "Finalización - 3", etc. */
export function parseBetPlayMatchday(round: string | null | undefined): number | null {
  if (!round) return null;
  const r = round.trim();
  const betPlay = r.match(
    /^(?:Apertura|Clausura|Finalizaci[oó]n)\s*-\s*(\d+)$/i
  );
  if (betPlay) {
    const n = Number(betPlay[1]);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  if (!isRegularSeasonMatchday(r)) return null;
  const m = r.match(/-\s*(\d+)\s*$/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function emptyTeamState(meta: BetPlayTeamMeta): EvolutionTeamState {
  return {
    teamId: meta.teamId,
    teamName: meta.teamName,
    teamLogo: meta.teamLogo,
    points: 0,
    played: 0,
    win: 0,
    draw: 0,
    lose: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };
}

function applyFinishedToEvolution(
  states: Map<number, EvolutionTeamState>,
  fixture: Fixture
): void {
  const hg = fixture.goals.home;
  const ag = fixture.goals.away;
  if (hg == null || ag == null) return;
  const home = states.get(fixture.teams.home.id);
  const away = states.get(fixture.teams.away.id);
  if (!home || !away) return;

  home.played += 1;
  away.played += 1;
  home.goalsFor += hg;
  home.goalsAgainst += ag;
  away.goalsFor += ag;
  away.goalsAgainst += hg;

  if (hg > ag) {
    home.points += 3;
    home.win += 1;
    away.lose += 1;
  } else if (hg < ag) {
    away.points += 3;
    away.win += 1;
    home.lose += 1;
  } else {
    home.points += 1;
    away.points += 1;
    home.draw += 1;
    away.draw += 1;
  }
}

function toTeam(meta: BetPlayTeamMeta): Team {
  return {
    id: meta.teamId,
    name: meta.teamName,
    logo: meta.teamLogo,
    code: null,
    country: "Colombia",
    founded: null,
    national: false,
  };
}

/** Convierte estado de evolución a StandingTeam para el Monte Carlo. */
export function evolutionStateToStanding(
  state: EvolutionTeamState,
  rank: number,
  group = "Clausura"
): StandingTeam {
  return {
    rank,
    team: toTeam({
      teamId: state.teamId,
      teamName: state.teamName,
      teamLogo: state.teamLogo,
    }),
    points: state.points,
    goalsDiff: state.goalsFor - state.goalsAgainst,
    group,
    form: null,
    status: null,
    description: null,
    all: {
      played: state.played,
      win: state.win,
      draw: state.draw,
      lose: state.lose,
      goals: { for: state.goalsFor, against: state.goalsAgainst },
    },
    home: {
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    away: {
      played: 0,
      win: 0,
      draw: 0,
      lose: 0,
      goals: { for: 0, against: 0 },
    },
    update: "",
  };
}

/**
 * Lista jornadas regulares del torneo (ordenadas).
 * Incluye jornadas con al menos un partido (FT o pendiente).
 */
export function listBetPlayMatchdayCuts(
  tournamentFixtures: Fixture[]
): BetPlayMatchdayCut[] {
  const byMd = new Map<number, Fixture[]>();
  for (const f of tournamentFixtures) {
    const md = parseBetPlayMatchday(f.league.round);
    if (md == null) continue;
    const list = byMd.get(md) ?? [];
    list.push(f);
    byMd.set(md, list);
  }

  return [...byMd.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([matchday, fixtures]) => {
      const complete =
        fixtures.length > 0 &&
        fixtures.every((f) => isFixtureFinished(f.fixture.status.short));
      return {
        matchday,
        label: `J${matchday}`,
        fixtures,
        complete,
      };
    });
}

/**
 * Puntos acumulados tras cada jornada que tenga ≥1 partido finalizado.
 */
export function buildPointsEvolution(
  tournamentFixtures: Fixture[],
  teams: BetPlayTeamMeta[]
): BetPlayPointsSnapshot[] {
  const cuts = listBetPlayMatchdayCuts(tournamentFixtures);
  const states = new Map(teams.map((t) => [t.teamId, emptyTeamState(t)]));
  const out: BetPlayPointsSnapshot[] = [];

  for (const cut of cuts) {
    const finishedInCut = cut.fixtures.filter((f) =>
      isFixtureFinished(f.fixture.status.short)
    );
    if (finishedInCut.length === 0) continue;

    for (const f of finishedInCut) {
      applyFinishedToEvolution(states, f);
    }

    const pointsByTeamId: Record<number, number> = {};
    for (const [id, st] of states) {
      pointsByTeamId[id] = st.points;
    }
    out.push({
      matchday: cut.matchday,
      label: cut.label,
      pointsByTeamId,
    });
  }

  return out;
}

/**
 * Tabla reconstruida con todos los partidos finalizados de matchday ≤ J.
 */
export function buildStandingsAtMatchday(
  tournamentFixtures: Fixture[],
  teams: BetPlayTeamMeta[],
  matchday: number,
  groupLabel = "Clausura"
): StandingTeam[] {
  const states = new Map(teams.map((t) => [t.teamId, emptyTeamState(t)]));

  for (const f of tournamentFixtures) {
    const md = parseBetPlayMatchday(f.league.round);
    if (md == null || md > matchday) continue;
    if (!isFixtureFinished(f.fixture.status.short)) continue;
    applyFinishedToEvolution(states, f);
  }

  const ranked = [...states.values()].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamId - b.teamId;
  });

  return ranked.map((st, i) => evolutionStateToStanding(st, i + 1, groupLabel));
}

/** Fixtures del torneo aún no jugados al cierre de la jornada J. */
export function pendingFixturesAfterMatchday(
  tournamentFixtures: Fixture[],
  matchday: number
): Fixture[] {
  return tournamentFixtures.filter((f) => {
    const md = parseBetPlayMatchday(f.league.round);
    if (md != null && md <= matchday) {
      // Misma jornada o anterior: solo pendientes si no terminó
      return !isFixtureFinished(f.fixture.status.short);
    }
    // Jornadas futuras o sin número de jornada regular
    return !isFixtureFinished(f.fixture.status.short);
  });
}

export function teamMetasFromStandings(
  standings: StandingTeam[]
): BetPlayTeamMeta[] {
  return standings.map((s) => ({
    teamId: s.team.id,
    teamName: s.team.name,
    teamLogo: s.team.logo,
  }));
}

/** Color estable por teamId (contraste en fondo oscuro). */
export function colorForTeamId(teamId: number): string {
  const hue = (teamId * 47) % 360;
  const sat = 65 + (teamId % 20);
  const light = 52 + (teamId % 15);
  return `hsl(${hue} ${sat}% ${light}%)`;
}

export function metricValue(
  row: BetPlayPhaseProbs,
  metric: BetPlayProbMetric
): number {
  return row[metric];
}

/**
 * Backtest síncrono de un corte (útil en tests).
 */
export function simulateProbSnapshotAtMatchday(input: {
  tournamentFixtures: Fixture[];
  historyFixtures: Fixture[];
  teams: BetPlayTeamMeta[];
  matchday: number;
  label: string;
  simulations?: number;
  groupLabel?: string;
  rng?: () => number;
}): BetPlayProbSnapshot {
  const {
    tournamentFixtures,
    historyFixtures,
    teams,
    matchday,
    label,
    simulations = BETPLAY_EVOLUTION_SIMULATIONS,
    groupLabel = "Clausura",
    rng,
  } = input;

  const standings = buildStandingsAtMatchday(
    tournamentFixtures,
    teams,
    matchday,
    groupLabel
  );
  const pending = pendingFixturesAfterMatchday(tournamentFixtures, matchday);
  const fixturesForSim = [
    ...tournamentFixtures.filter((f) => {
      const md = parseBetPlayMatchday(f.league.round);
      return (
        md != null &&
        md <= matchday &&
        isFixtureFinished(f.fixture.status.short)
      );
    }),
    ...pending,
  ];

  const { rows } = simulateBetPlayPhaseProbabilitiesDetailed({
    standings,
    fixtures: fixturesForSim,
    historyFixtures,
    simulations,
    rng,
  });

  return { matchday, label, rows };
}

/**
 * Corre el backtest por jornadas completas (+ última parcial si hay FT),
 * cediendo el event loop entre cortes.
 */
export async function runBetPlayProbBacktest(input: {
  tournamentFixtures: Fixture[];
  historyFixtures: Fixture[];
  teams: BetPlayTeamMeta[];
  simulations?: number;
  groupLabel?: string;
  onProgress?: (done: number, total: number) => void;
  signal?: AbortSignal;
}): Promise<BetPlayProbSnapshot[]> {
  const {
    tournamentFixtures,
    historyFixtures,
    teams,
    simulations = BETPLAY_EVOLUTION_SIMULATIONS,
    groupLabel = "Clausura",
    onProgress,
    signal,
  } = input;

  const cuts = listBetPlayMatchdayCuts(tournamentFixtures).filter((c) =>
    c.fixtures.some((f) => isFixtureFinished(f.fixture.status.short))
  );

  const snapshots: BetPlayProbSnapshot[] = [];
  for (let i = 0; i < cuts.length; i++) {
    if (signal?.aborted) break;
    const cut = cuts[i]!;
    snapshots.push(
      simulateProbSnapshotAtMatchday({
        tournamentFixtures,
        historyFixtures,
        teams,
        matchday: cut.matchday,
        label: cut.label,
        simulations,
        groupLabel,
      })
    );
    onProgress?.(i + 1, cuts.length);
    // Yield al browser entre jornadas
    await new Promise<void>((r) => setTimeout(r, 0));
  }

  return snapshots;
}

/** Firma de resultados FT para invalidar cache. */
export function finishedFixturesSignature(fixtures: Fixture[]): string {
  return fixtures
    .filter((f) => isFixtureFinished(f.fixture.status.short))
    .map(
      (f) =>
        `${f.fixture.id}:${f.goals.home ?? "x"}-${f.goals.away ?? "x"}`
    )
    .sort()
    .join("|");
}

const LS_PREFIX = "betplay-evolution-probs:v1:";

export function loadCachedProbEvolution(
  cacheKey: string
): BetPlayProbSnapshot[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_PREFIX + cacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BetPlayProbSnapshot[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCachedProbEvolution(
  cacheKey: string,
  snapshots: BetPlayProbSnapshot[]
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_PREFIX + cacheKey, JSON.stringify(snapshots));
  } catch {
    // quota / private mode
  }
}

/** Filas de chart: una por jornada, keys = teamId string → valor. */
export function buildChartRowsFromPoints(
  snapshots: BetPlayPointsSnapshot[],
  teamIds: number[]
): Record<string, string | number>[] {
  return snapshots.map((s) => {
    const row: Record<string, string | number> = {
      matchday: s.matchday,
      label: s.label,
    };
    for (const id of teamIds) {
      row[String(id)] = s.pointsByTeamId[id] ?? 0;
    }
    return row;
  });
}

export function buildChartRowsFromProbs(
  snapshots: BetPlayProbSnapshot[],
  teamIds: number[],
  metric: BetPlayProbMetric
): Record<string, string | number>[] {
  return snapshots.map((s) => {
    const row: Record<string, string | number> = {
      matchday: s.matchday,
      label: s.label,
    };
    const byId = new Map(s.rows.map((r) => [r.teamId, r]));
    for (const id of teamIds) {
      const r = byId.get(id);
      row[String(id)] = r ? Math.round(metricValue(r, metric) * 1000) / 10 : 0;
    }
    return row;
  });
}
