import type { Fixture } from "@/types";
import { MIN_WORLDCUP_FIXTURES } from "@/lib/utils";
import { isFixtureFinished, isFixtureLive, isFixtureStarted, getLocalDayKey } from "@/lib/liveRefresh";

export function isFixtureListIncomplete(list: Fixture[]): boolean {
  if (list.length < MIN_WORLDCUP_FIXTURES) return true;

  const started = list.filter((f) => isFixtureStarted(f.fixture.status.short)).length;
  const finished = list.filter((f) => isFixtureFinished(f.fixture.status.short)).length;
  const pending = list.filter((f) => f.fixture.status.short === "NS").length;
  const hasLive = list.some((f) => isFixtureLive(f.fixture.status.short));

  // Catálogo snapshot (72 NS) + 1 live: parece completo por count pero sin J1 FT.
  if (hasLive && finished === 0 && pending > list.length * 0.85) return true;
  if (hasLive && started <= 1 && list.length >= MIN_WORLDCUP_FIXTURES) return true;

  return false;
}

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

/** Clave estable por enfrentamiento + día (evita contar dos veces el mismo partido). */
export function fixtureMatchKey(f: Fixture): string {
  const home = f.teams.home.id;
  const away = f.teams.away.id;
  const [a, b] = home < away ? [home, away] : [away, home];
  return `${a}-${b}-${getLocalDayKey(f.fixture.date)}`;
}

/** Un partido lógico por enfrentamiento/día — conserva el fixture más completo. */
export function dedupeFixturesByMatch(fixtures: Fixture[]): Fixture[] {
  const byKey = new Map<string, Fixture>();
  for (const f of fixtures) {
    const key = fixtureMatchKey(f);
    const existing = byKey.get(key);
    byKey.set(key, existing ? pickBetterFixture(existing, f) : f);
  }
  return [...byKey.values()];
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

/** IDs de selecciones presentes en el calendario (opcional: solo con partido iniciado). */
export function uniqueTeamIdsFromFixtures(
  fixtures: Fixture[],
  onlyStarted = false
): number[] {
  const ids = new Set<number>();
  for (const f of dedupeFixturesByMatch(fixtures)) {
    if (onlyStarted && !isFixtureStarted(f.fixture.status.short)) continue;
    if (f.teams.home.id > 0) ids.add(f.teams.home.id);
    if (f.teams.away.id > 0) ids.add(f.teams.away.id);
  }
  return [...ids].sort((a, b) => a - b);
}
