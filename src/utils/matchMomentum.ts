import type { FixtureEvent } from "@/types";
import type { MatchStatProfile, ParsedFixtureStats } from "@/utils/fixtureStatsParser";
import { computeStatThreat } from "@/utils/fixtureStatsParser";

export interface MomentumPoint {
  minute: number;
  momentum: number;
  homePressure: number;
  awayPressure: number;
  homePossession?: number;
  awayPossession?: number;
}

export interface MomentumSnapshot {
  ts: number;
  minute: number;
  home: MatchStatProfile;
  away: MatchStatProfile;
  eventKeys: string[];
  statsFingerprint: string;
}

/** @deprecated Use MomentumSnapshot */
export type StatTimelineSnapshot = Pick<MomentumSnapshot, "minute" | "home" | "away">;

const WINDOW_MINUTES = 5;
const DECAY_RATE = 2;
const SMOOTH_WINDOW = 3;
const SNAPSHOT_SMOOTH = 5;
const MAX_MOMENTUM = 100;
const EVENT_WEIGHT = 0.35;
const SNAPSHOT_WEIGHT = 0.65;
const GAUSSIAN_SIGMA = 3;
const STEP = 0.5;

export function eventMinute(event: FixtureEvent): number {
  return event.time.elapsed + (event.time.extra ?? 0);
}

interface EventImpact {
  homeDelta: number;
  awayDelta: number;
}

function getEventImpact(
  event: FixtureEvent,
  homeTeamId: number,
  awayTeamId: number
): EventImpact | null {
  const isHome = event.team.id === homeTeamId;
  const isAway = event.team.id === awayTeamId;
  if (!isHome && !isAway) return null;

  const type = event.type;
  const detail = event.detail;

  if (type === "Goal") {
    if (detail === "Missed Penalty") {
      return isHome ? { homeDelta: 0, awayDelta: 8 } : { homeDelta: 8, awayDelta: 0 };
    }
    if (/Own Goal/i.test(detail)) {
      return isHome ? { homeDelta: -25, awayDelta: 25 } : { homeDelta: 25, awayDelta: -25 };
    }
    return isHome ? { homeDelta: 25, awayDelta: 0 } : { homeDelta: 0, awayDelta: 25 };
  }

  if (type === "Card") {
    if (/Red/i.test(detail)) {
      return isHome ? { homeDelta: -12, awayDelta: 0 } : { homeDelta: 0, awayDelta: -12 };
    }
    if (/Yellow/i.test(detail)) {
      return isHome ? { homeDelta: -4, awayDelta: 0 } : { homeDelta: 0, awayDelta: -4 };
    }
  }

  if (type === "Var") {
    if (/Penalty confirmed/i.test(detail)) {
      return isHome ? { homeDelta: 10, awayDelta: 0 } : { homeDelta: 0, awayDelta: 10 };
    }
    if (/Goal (cancelled|disallowed)/i.test(detail)) {
      return isHome ? { homeDelta: -8, awayDelta: 0 } : { homeDelta: 0, awayDelta: -8 };
    }
  }

  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function movingAverage(values: number[], window: number): number[] {
  if (values.length === 0) return [];
  return values.map((_, i) => {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(values.length - 1, i + Math.floor(window / 2));
    let sum = 0;
    for (let j = start; j <= end; j++) sum += values[j];
    return sum / (end - start + 1);
  });
}

function toMomentumPoints(
  series: { minute: number; momentum: number; homePoss?: number; awayPoss?: number }[]
): MomentumPoint[] {
  return series.map(({ minute, momentum, homePoss, awayPoss }) => ({
    minute,
    momentum,
    homePressure: Math.max(0, momentum),
    awayPressure: Math.min(0, momentum),
    homePossession: homePoss,
    awayPossession: awayPoss,
  }));
}

export function resolveMaxMinute(
  statusShort: string,
  elapsed: number | null | undefined,
  events: FixtureEvent[]
): number {
  if (statusShort === "HT") return 45;
  if (["FT", "AET", "PEN"].includes(statusShort)) {
    const lastEvent = events.reduce((max, e) => Math.max(max, eventMinute(e)), 0);
    return Math.max(90, lastEvent, elapsed ?? 90);
  }
  return Math.max(STEP, elapsed ?? STEP);
}

export function resolveChartMaxMinute(
  isLive: boolean,
  statusShort: string,
  elapsed: number | null | undefined,
  events: FixtureEvent[]
): number {
  if (isLive && statusShort !== "HT") {
    return Math.max(STEP, elapsed ?? STEP);
  }
  return resolveMaxMinute(statusShort, elapsed, events);
}

function computeRawEventMomentum(
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number,
  step = 1
): Map<number, number> {
  const steps = Math.ceil(maxMinute / step);
  const raw = new Map<number, number>();

  for (let i = 0; i <= steps; i++) {
    const minute = Math.round(i * step * 10) / 10;
    let homeThreat = 0;
    let awayThreat = 0;

    for (const event of events) {
      const eventMin = eventMinute(event);
      if (eventMin > minute || eventMin < minute - WINDOW_MINUTES) continue;

      const impact = getEventImpact(event, homeTeamId, awayTeamId);
      if (!impact) continue;

      const decay = Math.exp(-(minute - eventMin) / DECAY_RATE);
      homeThreat += impact.homeDelta * decay;
      awayThreat += impact.awayDelta * decay;
    }

    raw.set(minute, clamp(homeThreat - awayThreat, -MAX_MOMENTUM, MAX_MOMENTUM));
  }

  const keys = [...raw.keys()].sort((a, b) => a - b);
  const values = keys.map((k) => raw.get(k)!);
  const smoothed = movingAverage(values, SMOOTH_WINDOW);
  const result = new Map<number, number>();
  keys.forEach((k, i) => result.set(k, smoothed[i]));
  return result;
}

function intervalAttackDelta(prev: MatchStatProfile, next: MatchStatProfile): number {
  const dShots = (next.shotsOn - prev.shotsOn) * 4;
  const dDanger = (next.dangerousAttacks - prev.dangerousAttacks) * 0.5;
  const dCorners = (next.corners - prev.corners) * 0.3;
  const dInside = (next.shotsInside - prev.shotsInside) * 0.4;
  return dShots + dDanger + dCorners + dInside;
}

/** Serie de momentum desde snapshots cada ~30s (prioridad en vivo). */
export function buildMomentumFromSnapshots(
  snapshots: MomentumSnapshot[],
  maxMinute: number
): MomentumPoint[] {
  if (snapshots.length === 0) return [];

  const sorted = [...snapshots].sort((a, b) => a.minute - b.minute || a.ts - b.ts);
  const pointMap = new Map<number, { momentum: number; homePoss: number; awayPoss: number }>();

  const seed = sorted[0];
  pointMap.set(0, {
    momentum: ((seed.home.possession - seed.away.possession) / 100) * 20,
    homePoss: seed.home.possession,
    awayPoss: seed.away.possession,
  });

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    const span = Math.max(STEP, next.minute - prev.minute);

    const possessionSignal = (next.home.possession - prev.home.possession) * 2;
    const attackSignal =
      intervalAttackDelta(prev.home, next.home) - intervalAttackDelta(prev.away, next.away);
    const intervalMomentum = clamp(
      possessionSignal * 0.5 + attackSignal * 0.5,
      -MAX_MOMENTUM,
      MAX_MOMENTUM
    );

    const steps = Math.max(1, Math.round(span / STEP));
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const minute = Math.min(
        maxMinute,
        Math.round((prev.minute + span * t) * 2) / 2
      );
      const homePoss = prev.home.possession + (next.home.possession - prev.home.possession) * t;
      const awayPoss = prev.away.possession + (next.away.possession - prev.away.possession) * t;
      pointMap.set(minute, { momentum: intervalMomentum, homePoss, awayPoss });
    }
  }

  const last = sorted[sorted.length - 1];
  pointMap.set(Math.min(maxMinute, last.minute), {
    momentum:
      ((last.home.possession - last.away.possession) / 100) * 30 +
      (intervalAttackDelta(
        { ...last.home, shotsOn: 0, dangerousAttacks: 0, corners: 0, shotsInside: 0 },
        last.home
      ) || 0),
    homePoss: last.home.possession,
    awayPoss: last.away.possession,
  });

  const minutes = [...pointMap.keys()].sort((a, b) => a - b);
  if (minutes.length === 0) return [];

  const filled: { minute: number; momentum: number; homePoss: number; awayPoss: number }[] = [];
  for (let m = 0; m <= maxMinute; m = Math.round((m + STEP) * 10) / 10) {
    let closest = minutes[0];
    for (const min of minutes) {
      if (min <= m) closest = min;
      else break;
    }
    const pt = pointMap.get(closest)!;
    filled.push({ minute: m, momentum: pt.momentum, homePoss: pt.homePoss, awayPoss: pt.awayPoss });
  }

  const smoothed = movingAverage(
    filled.map((p) => p.momentum),
    SNAPSHOT_SMOOTH
  );
  return toMomentumPoints(
    filled.map((p, i) => ({ ...p, momentum: smoothed[i] }))
  );
}

export function buildPossessionSeries(
  snapshots: MomentumSnapshot[],
  maxMinute: number
): { minute: number; homePoss: number; awayPoss: number }[] {
  if (snapshots.length === 0) return [];

  const sorted = [...snapshots].sort((a, b) => a.minute - b.minute || a.ts - b.ts);
  const series: { minute: number; homePoss: number; awayPoss: number }[] = [];

  for (let m = 0; m <= maxMinute; m = Math.round((m + STEP) * 10) / 10) {
    let snap = sorted[0];
    for (const s of sorted) {
      if (s.minute <= m) snap = s;
      else break;
    }
    series.push({
      minute: m,
      homePoss: snap.home.possession,
      awayPoss: snap.away.possession,
    });
  }

  return series;
}

function gaussianKernel(minute: number, center: number, sigma: number): number {
  const d = minute - center;
  return Math.exp(-(d * d) / (2 * sigma * sigma));
}

function eventActivityAtMinute(
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  minute: number
): number {
  let activity = 0;
  for (const event of events) {
    const eventMin = eventMinute(event);
    const impact = getEventImpact(event, homeTeamId, awayTeamId);
    if (!impact) continue;
    activity +=
      Math.abs(impact.homeDelta - impact.awayDelta) *
      gaussianKernel(minute, eventMin, GAUSSIAN_SIGMA);
  }
  return activity;
}

export function computeStatMomentumFromAggregate(
  parsed: ParsedFixtureStats,
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number
): number[] {
  const possessionTilt = ((parsed.home.possession - parsed.away.possession) / 100) * 40;
  const threatDiff = computeStatThreat(parsed.home) - computeStatThreat(parsed.away);
  const threatTilt = clamp(
    (threatDiff / Math.max(computeStatThreat(parsed.home) + computeStatThreat(parsed.away), 1)) * 60,
    -60,
    60
  );

  const raw: number[] = [];
  let totalActivity = 0;
  const activities: number[] = [];

  for (let minute = 0; minute <= maxMinute; minute++) {
    const act = eventActivityAtMinute(events, homeTeamId, awayTeamId, minute) + 0.5;
    activities.push(act);
    totalActivity += act;
  }

  for (let minute = 0; minute <= maxMinute; minute++) {
    const activityShare =
      totalActivity > 0 ? activities[minute] / totalActivity : 1 / (maxMinute + 1);
    const dynamic = (activityShare - 1 / (maxMinute + 1)) * threatTilt * 2;
    raw.push(clamp(possessionTilt + dynamic + threatTilt * 0.3, -MAX_MOMENTUM, MAX_MOMENTUM));
  }

  return movingAverage(raw, SMOOTH_WINDOW + 2);
}

function mergeSeriesAtStep(
  snapshotPoints: MomentumPoint[],
  eventMap: Map<number, number>,
  maxMinute: number
): MomentumPoint[] {
  const result: MomentumPoint[] = [];

  for (let m = 0; m <= maxMinute; m = Math.round((m + STEP) * 10) / 10) {
    const snap =
      snapshotPoints.find((p) => p.minute === m) ??
      snapshotPoints.reduce((best, p) =>
        Math.abs(p.minute - m) < Math.abs(best.minute - m) ? p : best
      , snapshotPoints[0]);

    const ev = eventMap.get(m) ?? 0;
    const snapMom = snap?.momentum ?? 0;
    const momentum = clamp(
      SNAPSHOT_WEIGHT * snapMom + EVENT_WEIGHT * ev,
      -MAX_MOMENTUM,
      MAX_MOMENTUM
    );

    result.push({
      minute: m,
      momentum,
      homePressure: Math.max(0, momentum),
      awayPressure: Math.min(0, momentum),
      homePossession: snap?.homePossession,
      awayPossession: snap?.awayPossession,
    });
  }

  const smoothed = movingAverage(
    result.map((p) => p.momentum),
    SMOOTH_WINDOW
  );
  return result.map((p, i) => ({
    ...p,
    momentum: smoothed[i],
    homePressure: Math.max(0, smoothed[i]),
    awayPressure: Math.min(0, smoothed[i]),
  }));
}

/** Entrada principal: snapshots en vivo + capa de eventos + fallback FT. */
export function computeLiveMomentum(
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number,
  parsedStats: ParsedFixtureStats | null,
  snapshots: MomentumSnapshot[] = []
): MomentumPoint[] {
  if (maxMinute <= 0) return [];

  const eventMap = computeRawEventMomentum(events, homeTeamId, awayTeamId, maxMinute, STEP);

  if (snapshots.length >= 2) {
    const fromSnapshots = buildMomentumFromSnapshots(snapshots, maxMinute);
    return mergeSeriesAtStep(fromSnapshots, eventMap, maxMinute);
  }

  if (parsedStats) {
    const aggregate = computeStatMomentumFromAggregate(
      parsedStats,
      events,
      homeTeamId,
      awayTeamId,
      maxMinute
    );
    const merged: MomentumPoint[] = [];
    for (let m = 0; m <= maxMinute; m = Math.round((m + STEP) * 10) / 10) {
      const ev = eventMap.get(m) ?? eventMap.get(Math.floor(m)) ?? 0;
      const st = aggregate[Math.floor(m)] ?? 0;
      const momentum = clamp(EVENT_WEIGHT * ev + SNAPSHOT_WEIGHT * st, -MAX_MOMENTUM, MAX_MOMENTUM);
      merged.push({
        minute: m,
        momentum,
        homePressure: Math.max(0, momentum),
        awayPressure: Math.min(0, momentum),
        homePossession: parsedStats.home.possession,
        awayPossession: parsedStats.away.possession,
      });
    }
    const smoothed = movingAverage(
      merged.map((p) => p.momentum),
      SMOOTH_WINDOW
    );
    return merged.map((p, i) => ({
      ...p,
      momentum: smoothed[i],
      homePressure: Math.max(0, smoothed[i]),
      awayPressure: Math.min(0, smoothed[i]),
    }));
  }

  const keys = [...eventMap.keys()].sort((a, b) => a - b);
  return keys.map((minute) => {
    const momentum = eventMap.get(minute)!;
    return {
      minute,
      momentum,
      homePressure: Math.max(0, momentum),
      awayPressure: Math.min(0, momentum),
    };
  });
}

export function computeMatchMomentum(
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number
): MomentumPoint[] {
  return computeLiveMomentum(events, homeTeamId, awayTeamId, maxMinute, null, []);
}

export function computeEnrichedMatchMomentum(
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number,
  parsedStats: ParsedFixtureStats | null,
  snapshots: MomentumSnapshot[] = []
): MomentumPoint[] {
  return computeLiveMomentum(
    events,
    homeTeamId,
    awayTeamId,
    maxMinute,
    parsedStats,
    snapshots
  );
}

export function summarizeMomentum(points: MomentumPoint[]): {
  leader: "home" | "away" | "even";
  dominancePct: number;
} {
  if (points.length === 0) return { leader: "even", dominancePct: 0 };

  const recent = points.slice(-Math.min(15, points.length));
  const avg = recent.reduce((s, p) => s + p.momentum, 0) / recent.length;

  if (Math.abs(avg) < 5) return { leader: "even", dominancePct: 50 };
  return {
    leader: avg > 0 ? "home" : "away",
    dominancePct: Math.round(50 + Math.abs(avg) / 2),
  };
}
