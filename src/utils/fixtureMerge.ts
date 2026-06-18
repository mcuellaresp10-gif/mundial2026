import type { Fixture } from "@/types";
import { isFixtureFinished, isFixtureLive } from "@/lib/liveRefresh";

function statusRank(short: string): number {
  if (isFixtureFinished(short)) return 3;
  if (isFixtureLive(short)) return 2;
  return 1;
}

function hasConfirmedGoals(fixture: Fixture): boolean {
  return fixture.goals.home != null && fixture.goals.away != null;
}

/** Mayor = fixture más completo (FT con goles > live > NS). */
export function fixtureScoreRank(fixture: Fixture): number {
  let rank = statusRank(fixture.fixture.status.short) * 100;
  if (hasConfirmedGoals(fixture)) rank += 10;
  if (isFixtureFinished(fixture.fixture.status.short) && hasConfirmedGoals(fixture)) {
    rank += 5;
  }
  return rank;
}

export function pickBetterFixture(a: Fixture, b: Fixture): Fixture {
  const rankA = fixtureScoreRank(a);
  const rankB = fixtureScoreRank(b);
  if (rankA !== rankB) return rankA > rankB ? a : b;

  const goalsA = (a.goals.home ?? 0) + (a.goals.away ?? 0);
  const goalsB = (b.goals.home ?? 0) + (b.goals.away ?? 0);
  return goalsA >= goalsB ? a : b;
}

/** Fusiona listas por fixture.id sin degradar FT/goles a NS. */
export function mergeFixtureLists(base: Fixture[], overlay: Fixture[]): Fixture[] {
  const byId = new Map<number, Fixture>();

  for (const fixture of base) {
    byId.set(fixture.fixture.id, fixture);
  }

  for (const fixture of overlay) {
    const existing = byId.get(fixture.fixture.id);
    byId.set(fixture.fixture.id, existing ? pickBetterFixture(existing, fixture) : fixture);
  }

  return [...byId.values()];
}

/** Fusiona live=all sobre la lista base preservando orden y partidos históricos. */
export function mergeLiveIntoFixtures(fixtures: Fixture[], live: Fixture[]): Fixture[] {
  if (live.length === 0) return fixtures;

  const merged = mergeFixtureLists(fixtures, live);
  const byId = new Map(merged.map((f) => [f.fixture.id, f]));
  const baseIds = new Set(fixtures.map((f) => f.fixture.id));

  const result = fixtures.map((f) => byId.get(f.fixture.id) ?? f);
  for (const lf of live) {
    if (!baseIds.has(lf.fixture.id)) {
      result.push(byId.get(lf.fixture.id) ?? lf);
    }
  }
  return result;
}
