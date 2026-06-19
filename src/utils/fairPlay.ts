import type { FixtureEvent } from "@/types";

export interface FairPlayRecord {
  yellow: number;
  red: number;
}

export function fairPlayPoints(record?: FairPlayRecord | null): number {
  if (!record) return 0;
  return record.yellow + record.red * 3;
}

export function aggregateFairPlayFromEvents(events: FixtureEvent[]): FairPlayRecord {
  let yellow = 0;
  let red = 0;

  for (const event of events) {
    if (event.type !== "Card") continue;
    if (/Red/i.test(event.detail)) {
      red += 1;
    } else if (/Yellow/i.test(event.detail)) {
      yellow += 1;
    }
  }

  return { yellow, red };
}

export function mergeFairPlayRecords(
  target: Map<number, FairPlayRecord>,
  events: FixtureEvent[],
  homeTeamId: number,
  awayTeamId: number
): void {
  for (const event of events) {
    if (event.type !== "Card") continue;
    const teamId = event.team.id;
    if (teamId !== homeTeamId && teamId !== awayTeamId) continue;

    const current = target.get(teamId) ?? { yellow: 0, red: 0 };
    if (/Red/i.test(event.detail)) {
      current.red += 1;
    } else if (/Yellow/i.test(event.detail)) {
      current.yellow += 1;
    }
    target.set(teamId, current);
  }
}

export function buildFairPlayMapFromFixtures(
  fixtures: { fixtureId: number; homeId: number; awayId: number; events: FixtureEvent[] }[]
): Map<number, FairPlayRecord> {
  const map = new Map<number, FairPlayRecord>();
  for (const row of fixtures) {
    mergeFairPlayRecords(map, row.events, row.homeId, row.awayId);
  }
  return map;
}
