import type { FixtureStatistic } from "@/types";

export interface MatchStatProfile {
  possession: number;
  shotsOn: number;
  shotsInside: number;
  dangerousAttacks: number;
  corners: number;
  passesAccurate: number;
  totalPasses: number;
  xg: number;
}

export interface ParsedFixtureStats {
  home: MatchStatProfile;
  away: MatchStatProfile;
}

const EMPTY_PROFILE: MatchStatProfile = {
  possession: 50,
  shotsOn: 0,
  shotsInside: 0,
  dangerousAttacks: 0,
  corners: 0,
  passesAccurate: 0,
  totalPasses: 0,
  xg: 0,
};

export function parseStatValue(value: number | string | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace("%", "").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function normalizeKey(type: string): string {
  return type.toLowerCase().trim().replace(/\s+/g, " ");
}

function getStatValue(
  statistics: { type: string; value: number | string | null }[],
  ...keys: string[]
): number {
  for (const key of keys) {
    const found = statistics.find((s) => normalizeKey(s.type) === normalizeKey(key));
    if (found?.value != null) return parseStatValue(found.value);
  }
  return 0;
}

export function profileFromStatistics(
  statistics: { type: string; value: number | string | null }[]
): MatchStatProfile {
  return {
    possession: getStatValue(statistics, "ball possession"),
    shotsOn: getStatValue(statistics, "shots on goal"),
    shotsInside: getStatValue(statistics, "shots insidebox", "shots inside box"),
    dangerousAttacks: getStatValue(
      statistics,
      "dangerous attacks",
      "attacks dangerous"
    ),
    corners: getStatValue(statistics, "corner kicks", "corners"),
    passesAccurate: getStatValue(statistics, "passes accurate"),
    totalPasses: getStatValue(statistics, "total passes"),
    xg: getStatValue(statistics, "expected goals", "expected_goals"),
  };
}

export function parseFixtureStats(
  stats: FixtureStatistic[] | undefined,
  homeTeamId: number,
  awayTeamId: number
): ParsedFixtureStats | null {
  if (!stats?.length) return null;

  const homeBlock = stats.find((s) => s.team.id === homeTeamId);
  const awayBlock = stats.find((s) => s.team.id === awayTeamId);
  if (!homeBlock || !awayBlock) return null;

  return {
    home: profileFromStatistics(homeBlock.statistics),
    away: profileFromStatistics(awayBlock.statistics),
  };
}

/** Amenaza agregada 0–100 por equipo a partir de stats acumuladas. */
export function computeStatThreat(profile: MatchStatProfile): number {
  const passAcc =
    profile.totalPasses > 0
      ? (profile.passesAccurate / profile.totalPasses) * 100
      : 0;

  return (
    profile.possession * 0.25 +
    Math.min(profile.shotsOn * 8, 25) +
    Math.min(profile.shotsInside * 5, 15) +
    Math.min(profile.dangerousAttacks * 1.5, 20) +
    Math.min(profile.corners * 3, 10) +
    Math.min(profile.xg * 12, 5) +
    passAcc * 0.05
  );
}

export function computeStatDifferential(parsed: ParsedFixtureStats): number {
  const homeThreat = computeStatThreat(parsed.home);
  const awayThreat = computeStatThreat(parsed.away);
  const total = homeThreat + awayThreat || 1;
  return ((homeThreat - awayThreat) / total) * 100;
}

export function hasMeaningfulStats(parsed: ParsedFixtureStats | null): boolean {
  if (!parsed) return false;
  const h = parsed.home;
  const a = parsed.away;
  return (
    h.shotsOn + a.shotsOn +
    h.dangerousAttacks + a.dangerousAttacks +
    h.corners + a.corners > 0 ||
    Math.abs(h.possession - 50) > 2
  );
}

export function emptyProfile(): MatchStatProfile {
  return { ...EMPTY_PROFILE };
}
