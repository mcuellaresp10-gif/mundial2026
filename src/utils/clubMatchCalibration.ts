import type { Fixture, StandingTeam } from "@/types";
import { isFixtureFinished } from "@/lib/liveRefresh";

/** Pesos fuerza club: tabla + plantilla + forma reciente. */
export const CLUB_TABLE_WEIGHT = 0.45;
export const CLUB_SQUAD_WEIGHT = 0.35;
export const CLUB_RECENT_WEIGHT = 0.2;

export const RECENT_FORM_MATCHES = 5;

function clip(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export interface SideRecord {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: { for: number; against: number };
}

export function pointsPerGame(record: SideRecord): number {
  if (record.played <= 0) return 0;
  return (record.win * 3 + record.draw) / record.played;
}

export function goalsForPerGame(record: SideRecord): number {
  if (record.played <= 0) return 0;
  return record.goals.for / record.played;
}

export function goalsAgainstPerGame(record: SideRecord): number {
  if (record.played <= 0) return 0;
  return record.goals.against / record.played;
}

/** Escala PPG + GD a fuerza 35–95 (misma familia que forma FIFA). */
export function strengthFromRecord(record: SideRecord): number {
  if (record.played <= 0) return 50;
  const ppg = pointsPerGame(record);
  const gd = (record.goals.for - record.goals.against) / record.played;
  const gf = goalsForPerGame(record);
  const raw = ppg * 18 + gd * 6 + gf * 3;
  return clip(42 + raw, 35, 95);
}

export function strengthFromStandingAll(standing: StandingTeam | undefined): number {
  if (!standing || standing.all.played <= 0) return 50;
  return strengthFromRecord(standing.all);
}

/** Plantilla: mods ~0.75–1.35 → fuerza 38–88. */
export function strengthFromSquadMods(attackMod: number, defenseMod: number): number {
  const attack = clip(attackMod, 0.75, 1.35);
  // defenseMod alto = más goles en contra → peor defensa
  const defenseQuality = clip(2 - defenseMod, 0.75, 1.35);
  const blended = attack * 0.55 + defenseQuality * 0.45;
  return clip(50 + (blended - 1) * 55, 38, 88);
}

export interface RecentFormSummary {
  played: number;
  pointsPerGame: number;
  goalsForPerGame: number;
  goalsAgainstPerGame: number;
  strength: number;
}

/** Últimos N partidos finalizados del equipo (liga activa). */
export function recentFormFromFixtures(
  fixtures: Fixture[],
  teamId: number,
  lastN = RECENT_FORM_MATCHES
): RecentFormSummary {
  const finished = fixtures
    .filter(
      (f) =>
        isFixtureFinished(f.fixture.status.short) &&
        (f.teams.home.id === teamId || f.teams.away.id === teamId) &&
        f.goals.home != null &&
        f.goals.away != null
    )
    .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)
    .slice(0, lastN);

  if (finished.length === 0) {
    return {
      played: 0,
      pointsPerGame: 0,
      goalsForPerGame: 0,
      goalsAgainstPerGame: 0,
      strength: 50,
    };
  }

  let points = 0;
  let gf = 0;
  let ga = 0;

  for (const f of finished) {
    const isHome = f.teams.home.id === teamId;
    const forGoals = isHome ? (f.goals.home ?? 0) : (f.goals.away ?? 0);
    const againstGoals = isHome ? (f.goals.away ?? 0) : (f.goals.home ?? 0);
    gf += forGoals;
    ga += againstGoals;
    if (forGoals > againstGoals) points += 3;
    else if (forGoals === againstGoals) points += 1;
  }

  const n = finished.length;
  const record: SideRecord = {
    played: n,
    win: finished.filter((f) => {
      const isHome = f.teams.home.id === teamId;
      const forGoals = isHome ? (f.goals.home ?? 0) : (f.goals.away ?? 0);
      const againstGoals = isHome ? (f.goals.away ?? 0) : (f.goals.home ?? 0);
      return forGoals > againstGoals;
    }).length,
    draw: finished.filter((f) => (f.goals.home ?? 0) === (f.goals.away ?? 0)).length,
    lose: 0,
    goals: { for: gf, against: ga },
  };
  record.lose = n - record.win - record.draw;

  return {
    played: n,
    pointsPerGame: points / n,
    goalsForPerGame: gf / n,
    goalsAgainstPerGame: ga / n,
    strength: strengthFromRecord(record),
  };
}

/**
 * Fuerza club: mix tabla + plantilla + forma reciente.
 * Sin FIFA de selecciones.
 */
export function getClubEffectiveStrength(input: {
  standing?: StandingTeam;
  attackMod: number;
  defenseMod: number;
  recent?: RecentFormSummary | null;
  /** true = usar split home; false = split away; undefined = all */
  venue?: "home" | "away";
}): number {
  const { standing, attackMod, defenseMod, recent, venue } = input;
  const tableAll = strengthFromStandingAll(standing);
  let table = tableAll;

  if (standing && venue === "home" && standing.home.played >= 2) {
    table = tableAll * 0.4 + strengthFromRecord(standing.home) * 0.6;
  } else if (standing && venue === "away" && standing.away.played >= 2) {
    table = tableAll * 0.4 + strengthFromRecord(standing.away) * 0.6;
  }

  const squad = strengthFromSquadMods(attackMod, defenseMod);
  const hasRecent = recent && recent.played >= 2;

  if (!hasRecent) {
    const wTable = CLUB_TABLE_WEIGHT + CLUB_RECENT_WEIGHT * 0.5;
    const wSquad = 1 - wTable;
    return clip(table * wTable + squad * wSquad, 35, 95);
  }

  return clip(
    table * CLUB_TABLE_WEIGHT +
      squad * CLUB_SQUAD_WEIGHT +
      recent!.strength * CLUB_RECENT_WEIGHT,
    35,
    95
  );
}

export interface HomeAdvantageAdjustments {
  /** Bonus de fuerza al local (puntos 0–100). */
  strengthBonusHome: number;
  /** Multiplicador λ local. */
  homeLambdaMul: number;
  /** Multiplicador λ visitante. */
  awayLambdaMul: number;
  /** Resumen para UI. */
  homePower: number;
}

/**
 * Ventaja de local dinámica según rendimiento en casa del anfitrión
 * y fragilidad fuera del visitante.
 */
export function computeDynamicHomeAdvantage(
  homeStanding: StandingTeam | undefined,
  awayStanding: StandingTeam | undefined,
  leagueAvgGoalsPerMatch: number
): HomeAdvantageAdjustments {
  const leagueHomeShare = Math.max(leagueAvgGoalsPerMatch * 0.55, 0.9);

  let homePower = 1;
  if (homeStanding && homeStanding.home.played >= 2) {
    const ppg = pointsPerGame(homeStanding.home);
    const gf = goalsForPerGame(homeStanding.home);
    const ga = goalsAgainstPerGame(homeStanding.home);
    // Liga tipica ~1.5 PPG en casa, GF ~ leagueHomeShare
    homePower =
      (ppg / 1.55) * 0.5 +
      (gf / leagueHomeShare) * 0.35 +
      (1.1 / Math.max(ga, 0.4)) * 0.15;
  }

  let awayFragility = 1;
  if (awayStanding && awayStanding.away.played >= 2) {
    const awayPpg = pointsPerGame(awayStanding.away);
    const awayGa = goalsAgainstPerGame(awayStanding.away);
    // Más frágil fuera → sube ventaja del local
    awayFragility =
      (1.2 / Math.max(awayPpg, 0.4)) * 0.45 + (awayGa / leagueHomeShare) * 0.55;
  }

  const combined = homePower * 0.65 + awayFragility * 0.35;

  return {
    strengthBonusHome: clip(2 + (combined - 1) * 9, 1.5, 14),
    homeLambdaMul: clip(1.04 + (combined - 1) * 0.18, 1.02, 1.32),
    awayLambdaMul: clip(0.98 - (combined - 1) * 0.1, 0.78, 0.98),
    homePower: clip(combined, 0.55, 1.85),
  };
}

/**
 * H2H con peso mayor cuando el partido histórico coincide con localía actual
 * (A local vs B visitante).
 */
export function computeVenueAwareH2HGoalRates(
  h2h: Fixture[],
  homeId: number,
  awayId: number
): { rateA: number; rateB: number; weightSum: number } | null {
  const finished = h2h.filter((f) => f.fixture.status.short === "FT");
  if (finished.length === 0) return null;

  let goalsA = 0;
  let goalsB = 0;
  let weightSum = 0;

  for (const f of finished) {
    const matchHomeId = f.teams.home.id;
    const matchAwayId = f.teams.away.id;
    if (
      ![matchHomeId, matchAwayId].includes(homeId) ||
      ![matchHomeId, matchAwayId].includes(awayId)
    ) {
      continue;
    }

    const hg = f.goals.home ?? 0;
    const ag = f.goals.away ?? 0;
    const sameVenue = matchHomeId === homeId;
    const w = sameVenue ? 1.6 : 0.55;

    if (matchHomeId === homeId) {
      goalsA += hg * w;
      goalsB += ag * w;
    } else {
      goalsA += ag * w;
      goalsB += hg * w;
    }
    weightSum += w;
  }

  if (weightSum <= 0) return null;
  return {
    rateA: goalsA / weightSum,
    rateB: goalsB / weightSum,
    weightSum,
  };
}

export function computeVenueAwareH2H1X2(
  h2h: Fixture[],
  homeId: number,
  awayId: number
): { homeWin: number; draw: number; awayWin: number; weightSum: number } | null {
  const finished = h2h.filter((f) => f.fixture.status.short === "FT");
  if (finished.length === 0) return null;

  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  let weightSum = 0;

  for (const f of finished) {
    const matchHomeId = f.teams.home.id;
    const matchAwayId = f.teams.away.id;
    if (
      ![matchHomeId, matchAwayId].includes(homeId) ||
      ![matchHomeId, matchAwayId].includes(awayId)
    ) {
      continue;
    }

    const hg = f.goals.home ?? 0;
    const ag = f.goals.away ?? 0;
    const sameVenue = matchHomeId === homeId;
    const w = sameVenue ? 1.6 : 0.55;
    weightSum += w;

    if (hg === ag) {
      draws += w;
      continue;
    }

    const homeSideWon =
      (matchHomeId === homeId && hg > ag) || (matchAwayId === homeId && ag > hg);
    if (homeSideWon) homeWins += w;
    else awayWins += w;
  }

  if (weightSum <= 0) return null;
  const sum = homeWins + draws + awayWins || 1;
  return {
    homeWin: homeWins / sum,
    draw: Math.max(draws / sum, 0.08),
    awayWin: awayWins / sum,
    weightSum,
  };
}
