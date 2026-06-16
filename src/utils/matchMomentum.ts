import type { FixtureEvent } from "@/types";

export interface MomentumPoint {
  minute: number;
  momentum: number;
  homePressure: number;
  awayPressure: number;
}

const WINDOW_MINUTES = 5;
const DECAY_RATE = 2;
const SMOOTH_WINDOW = 3;
const MAX_MOMENTUM = 100;

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

export function computeMatchMomentum(
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number,
  maxMinute: number
): MomentumPoint[] {
  if (maxMinute <= 0) return [];

  const rawMomentum: number[] = [];

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

    rawMomentum.push(clamp(homeThreat - awayThreat, -MAX_MOMENTUM, MAX_MOMENTUM));
  }

  const smoothed = movingAverage(rawMomentum, SMOOTH_WINDOW);

  return smoothed.map((momentum, minute) => ({
    minute,
    momentum,
    homePressure: Math.max(0, momentum),
    awayPressure: Math.min(0, momentum),
  }));
}
