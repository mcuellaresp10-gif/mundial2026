import type { Player, PlayerStatistics } from "@/types";
import type { MetricKey, ScoutingPosition } from "@/config/positionMetricProfiles";
import { getPositionProfile } from "@/config/positionMetricProfiles";
import { getWorldCupTournamentStat } from "@/utils/playerStats";
import { positionToCode } from "@/utils/squad";
import { parseRating } from "@/utils/formatters";
import { translateTeamName } from "@/utils/teamNames";

export const SCOUTING_MIN_WC_MINUTES = 90;

export interface WorldCupPer90Metrics {
  goals90: number;
  assists90: number;
  keyPasses90: number;
  shots90: number;
  shotsOn90: number;
  dribblesSuccess90: number;
  dribblesAttempts90: number;
  dribbleSuccessRate: number;
  shotOnTargetRate: number;
  tackles90: number;
  interceptions90: number;
  blocks90: number;
  duelsWon90: number;
  duelWinRate: number;
  foulsDrawn90: number;
  foulsCommitted90: number;
  passes90: number;
  passAccuracy: number;
  saves90: number;
  conceded90: number;
  savePercentage: number;
  rating: number;
  minutes: number;
  appearances: number;
  offensiveIndex: number;
  finishingIndex: number;
  defensiveIndex: number;
  goalkeeperIndex: number;
}

export interface ScoutingProfile {
  playerId: number;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  position: ScoutingPosition;
  positionRaw: string;
  minutes: number;
  rating: number;
  goals: number;
  assists: number;
  metrics: WorldCupPer90Metrics;
  percentiles: Partial<Record<MetricKey, number>>;
  radarValues: Record<string, number>;
  radarPeerAverage: Record<string, number>;
}

function per90(value: number, minutes: number): number {
  if (minutes <= 0) return 0;
  return (value / minutes) * 90;
}

function rate(numerator: number, denominator: number, fallback = 0): number {
  if (denominator <= 0) return fallback;
  return numerator / denominator;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function extractWorldCupPer90(stat: PlayerStatistics): WorldCupPer90Metrics {
  const minutes = stat.games.minutes ?? 0;
  const dribbleAttempts = stat.dribbles.attempts ?? 0;
  const dribbleSuccess = stat.dribbles.success ?? 0;
  const duelsTotal = stat.duels.total ?? 0;
  const duelsWon = stat.duels.won ?? 0;
  const saves = stat.goals.saves ?? 0;
  const conceded = stat.goals.conceded ?? 0;
  const shotsOn = stat.shots.on ?? 0;
  const shotsTotal = stat.shots.total ?? 0;
  const keyPasses = stat.passes.key ?? 0;
  const foulsDrawn = stat.fouls.drawn ?? 0;

  const base = {
    goals90: round2(per90(stat.goals.total ?? 0, minutes)),
    assists90: round2(per90(stat.goals.assists ?? 0, minutes)),
    keyPasses90: round2(per90(keyPasses, minutes)),
    shots90: round2(per90(shotsTotal, minutes)),
    shotsOn90: round2(per90(shotsOn, minutes)),
    dribblesSuccess90: round2(per90(dribbleSuccess, minutes)),
    dribblesAttempts90: round2(per90(dribbleAttempts, minutes)),
    dribbleSuccessRate: round1(rate(dribbleSuccess, dribbleAttempts) * 100),
    shotOnTargetRate: round1(rate(shotsOn, shotsTotal) * 100),
    tackles90: round2(per90(stat.tackles.total ?? 0, minutes)),
    interceptions90: round2(per90(stat.tackles.interceptions ?? 0, minutes)),
    blocks90: round2(per90(stat.tackles.blocks ?? 0, minutes)),
    duelsWon90: round2(per90(duelsWon, minutes)),
    duelWinRate: round1(rate(duelsWon, duelsTotal) * 100),
    foulsDrawn90: round2(per90(foulsDrawn, minutes)),
    foulsCommitted90: round2(per90(stat.fouls.committed ?? 0, minutes)),
    passes90: round2(per90(stat.passes.total ?? 0, minutes)),
    passAccuracy: round1(stat.passes.accuracy ?? 0),
    saves90: round2(per90(saves, minutes)),
    conceded90: round2(per90(conceded, minutes)),
    savePercentage: round1(rate(saves, saves + conceded) * 100),
    rating: parseRating(stat.games.rating),
    minutes,
    appearances: stat.games.appearences ?? 0,
    offensiveIndex: 0,
    finishingIndex: 0,
    defensiveIndex: 0,
    goalkeeperIndex: 0,
  };

  return base;
}

function percentileRank(values: number[], value: number): number {
  if (values.length === 0) return 50;
  const below = values.filter((v) => v < value).length;
  return Math.round((below / values.length) * 100);
}

function normalizeToTen(values: number[], value: number): number {
  if (values.length === 0) return 5;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 5;
  return round1(((value - min) / (max - min)) * 10);
}

function metricValue(metrics: WorldCupPer90Metrics, key: MetricKey): number {
  return metrics[key as keyof WorldCupPer90Metrics] as number;
}

function computeCompositeIndices(
  metrics: WorldCupPer90Metrics,
  position: ScoutingPosition,
  poolMetrics: WorldCupPer90Metrics[]
): WorldCupPer90Metrics {
  const offensiveParts = [
    normalizeToTen(
      poolMetrics.map((m) => m.keyPasses90),
      metrics.keyPasses90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.shotsOn90),
      metrics.shotsOn90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.dribblesSuccess90),
      metrics.dribblesSuccess90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.foulsDrawn90),
      metrics.foulsDrawn90
    ),
  ];

  const finishingParts = [
    normalizeToTen(
      poolMetrics.map((m) => m.goals90),
      metrics.goals90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.shotsOn90),
      metrics.shotsOn90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.dribblesSuccess90),
      metrics.dribblesSuccess90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.keyPasses90),
      metrics.keyPasses90
    ),
  ];

  const defensiveParts = [
    normalizeToTen(
      poolMetrics.map((m) => m.duelsWon90),
      metrics.duelsWon90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.tackles90),
      metrics.tackles90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.interceptions90),
      metrics.interceptions90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.duelWinRate),
      metrics.duelWinRate
    ),
  ];

  const gkParts = [
    normalizeToTen(
      poolMetrics.map((m) => m.saves90),
      metrics.saves90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.savePercentage),
      metrics.savePercentage
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.duelsWon90),
      metrics.duelsWon90
    ),
    normalizeToTen(
      poolMetrics.map((m) => m.passAccuracy),
      metrics.passAccuracy
    ),
  ];

  const avg = (parts: number[]) =>
    round1(parts.reduce((s, p) => s + p, 0) / Math.max(parts.length, 1));

  return {
    ...metrics,
    offensiveIndex: position === "M" ? avg(offensiveParts) : metrics.offensiveIndex,
    finishingIndex: position === "F" ? avg(finishingParts) : metrics.finishingIndex,
    defensiveIndex: position === "D" ? avg(defensiveParts) : metrics.defensiveIndex,
    goalkeeperIndex: position === "G" ? avg(gkParts) : metrics.goalkeeperIndex,
  };
}

function buildRadarValues(
  metrics: WorldCupPer90Metrics,
  position: ScoutingPosition,
  poolMetrics: WorldCupPer90Metrics[]
): { player: Record<string, number>; peer: Record<string, number> } {
  const profile = getPositionProfile(position);
  const player: Record<string, number> = {};
  const peer: Record<string, number> = {};

  for (const axis of profile.radarAxes) {
    const poolValues = poolMetrics.map((m) => metricValue(m, axis.key));
    const raw = metricValue(metrics, axis.key);

    if (axis.isComposite || axis.key.endsWith("Index")) {
      player[axis.key] = raw;
      peer[axis.key] = poolValues.length
        ? round1(poolValues.reduce((s, v) => s + v, 0) / poolValues.length)
        : 5;
    } else if (axis.isRate) {
      player[axis.key] = normalizeToTen(poolValues, raw);
      peer[axis.key] = 5;
    } else {
      player[axis.key] = normalizeToTen(poolValues, raw);
      peer[axis.key] = 5;
    }
  }

  return { player, peer };
}

export function playerHasScoutingEligibleWc(player: Player): boolean {
  const wc = getWorldCupTournamentStat(player);
  if (!wc) return false;
  return (wc.games.minutes ?? 0) >= SCOUTING_MIN_WC_MINUTES;
}

export function getScoutingPosition(player: Player): ScoutingPosition {
  const wc = getWorldCupTournamentStat(player);
  const pos = wc?.games.position ?? player.statistics[0]?.games.position ?? "M";
  const code = positionToCode(pos);
  if (code === "G" || code === "D" || code === "M" || code === "F") return code;
  return "M";
}

export function buildScoutingProfiles(players: Player[]): ScoutingProfile[] {
  const eligible = players.filter(playerHasScoutingEligibleWc);
  const byPosition = new Map<ScoutingPosition, { player: Player; base: WorldCupPer90Metrics }[]>();

  for (const player of eligible) {
    const wc = getWorldCupTournamentStat(player)!;
    const position = getScoutingPosition(player);
    const base = extractWorldCupPer90(wc);
    const list = byPosition.get(position) ?? [];
    list.push({ player, base });
    byPosition.set(position, list);
  }

  const profiles: ScoutingProfile[] = [];

  for (const [position, entries] of byPosition) {
    const poolMetrics = entries.map((e) => e.base);
    const withComposites = poolMetrics.map((m) =>
      computeCompositeIndices(m, position, poolMetrics)
    );

    const profileConfig = getPositionProfile(position);

    for (let i = 0; i < entries.length; i += 1) {
      const { player } = entries[i];
      const metrics = withComposites[i];
      const wc = getWorldCupTournamentStat(player)!;
      const percentiles: Partial<Record<MetricKey, number>> = {};

      for (const axis of profileConfig.radarAxes) {
        const values = withComposites.map((m) => metricValue(m, axis.key));
        percentiles[axis.key] = percentileRank(values, metricValue(metrics, axis.key));
      }

      for (const axis of [profileConfig.scatter.x, profileConfig.scatter.y, profileConfig.scatter.color]) {
        const values = withComposites.map((m) => metricValue(m, axis.key));
        percentiles[axis.key] = percentileRank(values, metricValue(metrics, axis.key));
      }

      const radar = buildRadarValues(metrics, position, withComposites);

      profiles.push({
        playerId: player.player.id,
        name: player.player.name,
        photo: player.player.photo,
        team: translateTeamName(wc.team.name),
        teamLogo: wc.team.logo,
        position,
        positionRaw: wc.games.position ?? position,
        minutes: metrics.minutes,
        rating: metrics.rating,
        goals: wc.goals.total ?? 0,
        assists: wc.goals.assists ?? 0,
        metrics,
        percentiles,
        radarValues: radar.player,
        radarPeerAverage: radar.peer,
      });
    }
  }

  return profiles;
}

export function buildScoutingProfileForPlayer(
  player: Player,
  allPlayers: Player[]
): ScoutingProfile | null {
  const profiles = buildScoutingProfiles(allPlayers);
  return profiles.find((p) => p.playerId === player.player.id) ?? null;
}

export function getMetricDisplayValue(metrics: WorldCupPer90Metrics, key: MetricKey, isRate?: boolean): number {
  const v = metricValue(metrics, key);
  if (isRate) return v;
  return v;
}

export function scatterColorPercent(value: number, min = 0, max = 100): string {
  const t = clamp((value - min) / Math.max(max - min, 1), 0, 1);
  const r = Math.round(239 - t * 180);
  const g = Math.round(68 + t * 120);
  const b = Math.round(68 + t * 40);
  return `rgb(${r},${g},${b})`;
}

export function computePoolAverages(profiles: ScoutingProfile[]): Partial<Record<MetricKey, number>> {
  if (profiles.length === 0) return {};
  const keys = Object.keys(profiles[0].metrics) as (keyof WorldCupPer90Metrics)[];
  const out: Partial<Record<MetricKey, number>> = {};
  for (const key of keys) {
    const values = profiles.map((p) => p.metrics[key as keyof WorldCupPer90Metrics] as number);
    out[key as MetricKey] = round2(values.reduce((s, v) => s + v, 0) / values.length);
  }
  return out;
}

export function profilesForPosition(
  profiles: ScoutingProfile[],
  position: ScoutingPosition
): ScoutingProfile[] {
  return profiles.filter((p) => p.position === position);
}

export function getScatterPoint(
  profile: ScoutingProfile,
  xKey: MetricKey,
  yKey: MetricKey,
  colorKey: MetricKey
) {
  return {
    id: profile.playerId,
    name: profile.name,
    photo: profile.photo,
    team: profile.team,
    teamLogo: profile.teamLogo,
    x: metricValue(profile.metrics, xKey),
    y: metricValue(profile.metrics, yKey),
    color: metricValue(profile.metrics, colorKey),
  };
}
