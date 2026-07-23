import type { Fixture } from "@/types";
import { isFixtureFinished } from "@/lib/liveRefresh";
import { formatRoundLabel } from "@/utils/formatters";

/** Claves ordenadas de fases eliminatorias (cupas / playoffs de liga). */
export type CupKoRoundKey =
  | "qualifying"
  | "round_256"
  | "round_128"
  | "round_64"
  | "round_32"
  | "round_16"
  | "quarter"
  | "semi"
  | "third"
  | "final"
  | "playoffs";

const ROUND_ORDER: CupKoRoundKey[] = [
  "qualifying",
  "playoffs",
  "round_256",
  "round_128",
  "round_64",
  "round_32",
  "round_16",
  "quarter",
  "semi",
  "third",
  "final",
];

export const CUP_KO_ROUND_LABELS: Record<CupKoRoundKey, string> = {
  qualifying: "Fase previa",
  round_256: "1/256",
  round_128: "Dieciseisavos (128)",
  round_64: "Treintaidosavos",
  round_32: "16avos de final",
  round_16: "Octavos de final",
  quarter: "Cuartos de final",
  semi: "Semifinal",
  third: "Tercer puesto",
  final: "Final",
  playoffs: "Eliminatorias",
};

/** Jornada regular (no eliminatoria): Apertura - 16, Group Stage - 3, etc. */
export function isRegularSeasonMatchday(round: string): boolean {
  const r = round.trim();
  if (/^(Apertura|Clausura|Regular Season|Liga|Primera (A|B)|Serie [A-Z])\s*-\s*\d+$/i.test(r)) {
    return true;
  }
  if (/^Group Stage\s*-\s*\d+$/i.test(r)) return true;
  if (/^Group\s+[A-L]$/i.test(r)) return true;
  return false;
}

/**
 * Clasifica una ronda API como eliminatoria.
 * Devuelve null si es fase de grupos / jornada de liga.
 */
export function classifyCupKnockoutRound(round: string | null | undefined): CupKoRoundKey | null {
  if (!round) return null;
  if (isRegularSeasonMatchday(round)) return null;

  const r = round.toLowerCase();

  if (/1\/256|round of 256/i.test(r)) return "round_256";
  if (/1\/128|round of 128/i.test(r)) return "round_128";
  if (/1\/64|round of 64/i.test(r)) return "round_64";
  if (/round of 32|round of thirty-two|1\/32/i.test(r)) return "round_32";
  if (/round of 16|round of sixteen|8th finals|1\/16|1\/8-finals|octavos/i.test(r)) {
    return "round_16";
  }
  if (/quarter/i.test(r)) return "quarter";
  if (/semi/i.test(r)) return "semi";
  if (/3rd place|third place|tercer/i.test(r)) return "third";
  // Final (incluye "Apertura - Final", "Final")
  if (/\bfinal\b/i.test(r) && !/semi|quarter|round of|1\//i.test(r)) return "final";
  if (/play-?offs?/i.test(r)) return "playoffs";
  if (
    /qualification|qualifying|preliminary|1st round|2nd round|3rd round|4th round|5th round/i.test(
      r
    )
  ) {
    return "qualifying";
  }

  return null;
}

export function isCupKnockoutRound(round: string | null | undefined): boolean {
  return classifyCupKnockoutRound(round) != null;
}

function teamPairKey(homeId: number, awayId: number): string {
  return homeId < awayId ? `${homeId}-${awayId}` : `${awayId}-${homeId}`;
}

export interface CupBracketTeam {
  id: number;
  name: string;
  logo: string;
}

export interface CupBracketTie {
  id: string;
  roundKey: CupKoRoundKey;
  roundLabel: string;
  legs: Fixture[];
  home: CupBracketTeam;
  away: CupBracketTeam;
  /** Marcador agregado o del partido único. */
  scoreLabel: string;
  winnerId: number | null;
  statusShort: string;
}

export interface CupBracketRound {
  key: CupKoRoundKey;
  label: string;
  ties: CupBracketTie[];
}

export interface CupBracket {
  rounds: CupBracketRound[];
  totalTies: number;
}

function pickDisplayTeams(legs: Fixture[]): { home: CupBracketTeam; away: CupBracketTeam } {
  const first = legs[0];
  const home = {
    id: first.teams.home.id,
    name: first.teams.home.name,
    logo: first.teams.home.logo,
  };
  const away = {
    id: first.teams.away.id,
    name: first.teams.away.name,
    logo: first.teams.away.logo,
  };
  if (legs.length === 1) return { home, away };

  // Orden canónico por id para etiquetas estables
  const a = home.id < away.id ? home : away;
  const b = home.id < away.id ? away : home;
  return { home: a, away: b };
}

function goalsForTeam(fixture: Fixture, teamId: number): number {
  if (fixture.teams.home.id === teamId) return fixture.goals.home ?? 0;
  if (fixture.teams.away.id === teamId) return fixture.goals.away ?? 0;
  return 0;
}

function penForTeam(fixture: Fixture, teamId: number): number | null {
  const pen = fixture.score?.penalty;
  if (!pen) return null;
  if (fixture.teams.home.id === teamId) return pen.home;
  if (fixture.teams.away.id === teamId) return pen.away;
  return null;
}

function resolveTieOutcome(legs: Fixture[], homeId: number, awayId: number): {
  scoreLabel: string;
  winnerId: number | null;
  statusShort: string;
} {
  const sorted = [...legs].sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );
  const allFinished = sorted.every((f) => isFixtureFinished(f.fixture.status.short));
  const anyLive = sorted.some((f) =>
    ["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "INT"].includes(f.fixture.status.short)
  );

  if (sorted.length === 1) {
    const f = sorted[0];
    const hs = f.goals.home;
    const as = f.goals.away;
    const scoreLabel =
      hs != null && as != null ? `${hs} - ${as}` : "vs";
    let winnerId: number | null = null;
    if (allFinished) {
      if (f.teams.home.winner === true) winnerId = f.teams.home.id;
      else if (f.teams.away.winner === true) winnerId = f.teams.away.id;
      else if (hs != null && as != null && hs !== as) {
        winnerId = hs > as ? f.teams.home.id : f.teams.away.id;
      }
      const ph = penForTeam(f, homeId);
      const pa = penForTeam(f, awayId);
      if (winnerId == null && ph != null && pa != null && ph !== pa) {
        winnerId = ph > pa ? homeId : awayId;
      }
    }
    return {
      scoreLabel,
      winnerId,
      statusShort: f.fixture.status.short,
    };
  }

  let homeGoals = 0;
  let awayGoals = 0;
  for (const f of sorted) {
    if (f.goals.home == null || f.goals.away == null) continue;
    homeGoals += goalsForTeam(f, homeId);
    awayGoals += goalsForTeam(f, awayId);
  }

  const legScores = sorted
    .map((f) => {
      if (f.goals.home == null || f.goals.away == null) return null;
      return `${f.goals.home}-${f.goals.away}`;
    })
    .filter(Boolean)
    .join(" · ");

  const scoreLabel =
    allFinished || legScores
      ? `${homeGoals} - ${awayGoals}${legScores ? ` (${legScores})` : ""}`
      : "vs";

  let winnerId: number | null = null;
  if (allFinished) {
    if (homeGoals !== awayGoals) {
      winnerId = homeGoals > awayGoals ? homeId : awayId;
    } else {
      const last = sorted[sorted.length - 1];
      const ph = penForTeam(last, homeId);
      const pa = penForTeam(last, awayId);
      if (ph != null && pa != null && ph !== pa) {
        winnerId = ph > pa ? homeId : awayId;
      } else if (last.teams.home.winner === true) {
        winnerId = last.teams.home.id;
      } else if (last.teams.away.winner === true) {
        winnerId = last.teams.away.id;
      }
    }
  }

  return {
    scoreLabel,
    winnerId,
    statusShort: anyLive
      ? "LIVE"
      : allFinished
        ? sorted[sorted.length - 1].fixture.status.short
        : sorted[0].fixture.status.short,
  };
}

/** Construye el cuadro eliminatorio a partir de fixtures de la liga/copa activa. */
export function buildCupBracketFromFixtures(fixtures: Fixture[]): CupBracket {
  const ko = fixtures.filter((f) => isCupKnockoutRound(f.league.round));
  const byRoundPair = new Map<string, Fixture[]>();

  for (const f of ko) {
    const key = classifyCupKnockoutRound(f.league.round)!;
    const pair = teamPairKey(f.teams.home.id, f.teams.away.id);
    const mapKey = `${key}::${pair}`;
    const list = byRoundPair.get(mapKey) ?? [];
    list.push(f);
    byRoundPair.set(mapKey, list);
  }

  const tiesByRound = new Map<CupKoRoundKey, CupBracketTie[]>();

  for (const [mapKey, legs] of byRoundPair) {
    const roundKey = mapKey.split("::")[0] as CupKoRoundKey;
    const sortedLegs = [...legs].sort(
      (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
    const { home, away } = pickDisplayTeams(sortedLegs);
    const outcome = resolveTieOutcome(sortedLegs, home.id, away.id);
    const apiRound = sortedLegs[0].league.round ?? "";
    const tie: CupBracketTie = {
      id: mapKey,
      roundKey,
      roundLabel: CUP_KO_ROUND_LABELS[roundKey] || formatRoundLabel(apiRound),
      legs: sortedLegs,
      home,
      away,
      scoreLabel: outcome.scoreLabel,
      winnerId: outcome.winnerId,
      statusShort: outcome.statusShort,
    };
    const list = tiesByRound.get(roundKey) ?? [];
    list.push(tie);
    tiesByRound.set(roundKey, list);
  }

  const rounds: CupBracketRound[] = [];
  for (const key of ROUND_ORDER) {
    const ties = tiesByRound.get(key);
    if (!ties?.length) continue;
    ties.sort(
      (a, b) =>
        new Date(a.legs[0].fixture.date).getTime() -
        new Date(b.legs[0].fixture.date).getTime()
    );
    rounds.push({
      key,
      label: CUP_KO_ROUND_LABELS[key],
      ties,
    });
  }

  return {
    rounds,
    totalTies: rounds.reduce((n, r) => n + r.ties.length, 0),
  };
}

function isTerminalStatus(short: string): boolean {
  return ["FT", "AET", "PEN", "CANC", "ABD"].includes(short);
}

/** True cuando la copa/liga ya entró en eliminatorias (p. ej. Copa Colombia Play-offs). */
export function isKnockoutPhaseActive(fixtures: Fixture[]): boolean {
  const ko = fixtures.filter((f) => isCupKnockoutRound(f.league.round));
  if (ko.length === 0) return false;

  const hasLiveOrPendingKo = ko.some((f) => !isTerminalStatus(f.fixture.status.short));
  if (hasLiveOrPendingKo) return true;

  const groupOrLeague = fixtures.filter(
    (f) =>
      isRegularSeasonMatchday(f.league.round ?? "") ||
      /^Group Stage/i.test(f.league.round ?? "")
  );
  if (groupOrLeague.length === 0) return true;

  const groupsDone = groupOrLeague.every((f) =>
    isTerminalStatus(f.fixture.status.short) || f.fixture.status.short === "PST"
  );
  return groupsDone && ko.some((f) => isTerminalStatus(f.fixture.status.short));
}

/** Ocultar tablas de grupos cuando la competencia ya está en eliminatoria. */
export function shouldHideGroupTablesForKnockout(fixtures: Fixture[]): boolean {
  return isKnockoutPhaseActive(fixtures) && buildCupBracketFromFixtures(fixtures).totalTies > 0;
}

