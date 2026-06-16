import type { FixtureEvent } from "@/types";
import type { MatchStatProfile, ParsedFixtureStats } from "@/utils/fixtureStatsParser";
import { computeStatThreat } from "@/utils/fixtureStatsParser";

export interface MomentumPoint {
  minute: number;
  momentum: number;
  homePressure: number;
  awayPressure: number;
}

export interface StatTimelineSnapshot {
  minute: number;
  home: MatchStatProfile;
  away: MatchStatProfile;
}

const WINDOW_MINUTES = 5;
const DECAY_RATE = 2;
const SMOOTH_WINDOW = 3;
const MAX_MOMENTUM = 100;
const EVENT_WEIGHT = 0.45;
const STAT_WEIGHT = 0.55;
const GAUSSIAN_SIGMA = 3;

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

function toMomentumPoints(values: number[]): MomentumPoint[] {
  return values.map((momentum, minute) => ({
    minute,
    momentum,
    homePressure: Math.max(0, momentum),
    awayPressure: Math.min(0, momentum),
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
  return Math.max(1, elapsed ?? 1);
}

function computeRawEventMomentum(
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number
): number[] {
  const raw: number[] = [];

  for (let minute = 0; minute <= maxMinute; minute++) {
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

    raw.push(clamp(homeThreat - awayThreat, -MAX_MOMENTUM, MAX_MOMENTUM));
  }

  return movingAverage(raw, SMOOTH_WINDOW);
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
    activity += Math.abs(impact.homeDelta - impact.awayDelta) * gaussianKernel(minute, eventMin, GAUSSIAN_SIGMA);
  }
  return activity;
}

/** Distribuye stats acumuladas minuto a minuto (partidos sin snapshots). */
export function computeStatMomentumFromAggregate(
  parsed: ParsedFixtureStats,
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number
): number[] {
  const possessionTilt = ((parsed.home.possession - parsed.away.possession) / 100) * 40;
  const threatDiff = computeStatThreat(parsed.home) - computeStatThreat(parsed.away);
  const threatTilt = clamp((threatDiff / Math.max(computeStatThreat(parsed.home) + computeStatThreat(parsed.away), 1)) * 60, -60, 60);

  const raw: number[] = [];
  let totalActivity = 0;
  const activities: number[] = [];

  for (let minute = 0; minute <= maxMinute; minute++) {
    const act = eventActivityAtMinute(events, homeTeamId, awayTeamId, minute) + 0.5;
    activities.push(act);
    totalActivity += act;
  }

  for (let minute = 0; minute <= maxMinute; minute++) {
    const activityShare = totalActivity > 0 ? activities[minute] / totalActivity : 1 / (maxMinute + 1);
    const dynamic = (activityShare - 1 / (maxMinute + 1)) * threatTilt * 2;
    raw.push(clamp(possessionTilt + dynamic + threatTilt * 0.3, -MAX_MOMENTUM, MAX_MOMENTUM));
  }

  return movingAverage(raw, SMOOTH_WINDOW + 2);
}

function profileDeltaThreat(prev: MatchStatProfile, next: MatchStatProfile): number {
  const prevT = computeStatThreat(prev);
  const nextT = computeStatThreat(next);
  return nextT - prevT;
}

/** Construye capa stat desde snapshots en vivo (deltas entre polls). */
export function computeStatMomentumFromTimeline(
  snapshots: StatTimelineSnapshot[],
  maxMinute: number
): number[] {
  if (snapshots.length === 0) {
    return Array.from({ length: maxMinute + 1 }, () => 0);
  }

  const sorted = [...snapshots].sort((a, b) => a.minute - b.minute);
  const raw = Array.from({ length: maxMinute + 1 }, () => 0);

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const next = sorted[i];
    const homeDelta = profileDeltaThreat(prev.home, next.home);
    const awayDelta = profileDeltaThreat(prev.away, next.away);
    const diff = homeDelta - awayDelta;
    const span = Math.max(1, next.minute - prev.minute);

    for (let m = prev.minute; m <= Math.min(next.minute, maxMinute); m++) {
      raw[m] += diff / span;
    }
  }

  const last = sorted[sorted.length - 1];
  const possessionTilt = ((last.home.possession - last.away.possession) / 100) * 25;
  for (let m = 0; m <= maxMinute; m++) {
    raw[m] = clamp(raw[m] * 3 + possessionTilt, -MAX_MOMENTUM, MAX_MOMENTUM);
  }

  return movingAverage(raw, SMOOTH_WINDOW + 2);
}

function mergeLayers(eventLayer: number[], statLayer: number[]): number[] {
  const len = Math.max(eventLayer.length, statLayer.length);
  const merged: number[] = [];

  for (let i = 0; i < len; i++) {
    const ev = eventLayer[i] ?? 0;
    const st = statLayer[i] ?? 0;
    merged.push(clamp(EVENT_WEIGHT * ev + STAT_WEIGHT * st, -MAX_MOMENTUM, MAX_MOMENTUM));
  }

  return movingAverage(merged, SMOOTH_WINDOW);
}

export function computeMatchMomentum(
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number
): MomentumPoint[] {
  if (maxMinute <= 0) return [];
  const eventLayer = computeRawEventMomentum(events, homeTeamId, awayTeamId, maxMinute);
  return toMomentumPoints(eventLayer);
}

export function computeEnrichedMatchMomentum(
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number,
  parsedStats: ParsedFixtureStats | null,
  statTimeline: StatTimelineSnapshot[] = []
): MomentumPoint[] {
  if (maxMinute <= 0) return [];

  const eventLayer = computeRawEventMomentum(events, homeTeamId, awayTeamId, maxMinute);

  if (!parsedStats && statTimeline.length === 0) {
    return toMomentumPoints(eventLayer);
  }

  const statLayer =
    statTimeline.length >= 2
      ? computeStatMomentumFromTimeline(statTimeline, maxMinute)
      : parsedStats
        ? computeStatMomentumFromAggregate(parsedStats, events, homeTeamId, awayTeamId, maxMinute)
        : Array.from({ length: maxMinute + 1 }, () => 0);

  return toMomentumPoints(mergeLayers(eventLayer, statLayer));
}

/** Resumen de dominio para vista colapsada. */
export function summarizeMomentum(points: MomentumPoint[]): {
  leader: "home" | "away" | "even";
  dominancePct: number;
} {
  if (points.length === 0) return { leader: "even", dominancePct: 0 };

  const recent = points.slice(-15);
  const avg = recent.reduce((s, p) => s + p.momentum, 0) / recent.length;

  if (Math.abs(avg) < 5) return { leader: "even", dominancePct: 50 };
  return {
    leader: avg > 0 ? "home" : "away",
    dominancePct: Math.round(50 + Math.abs(avg) / 2),
  };
}
