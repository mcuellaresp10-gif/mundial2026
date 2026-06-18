import { get, set } from "idb-keyval";
import type { Fixture } from "@/types";
import { isFixtureFinished, isFixtureStarted } from "@/lib/liveRefresh";
import { mergeFixtureLists, pickBetterFixture } from "@/utils/fixtureMerge";

/** IndexedDB — no se borra con clearLiveFixtureLocalCache (solo afecta localStorage). */
export const FIXTURE_HISTORY_KEY = "mundial2026_fixtures-history-v1";
const HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface HistoryStore {
  updatedAt: number;
  byId: Record<number, Fixture>;
}

function shouldPersist(fixture: Fixture): boolean {
  const short = fixture.fixture.status.short;
  if (isFixtureFinished(short)) return true;
  return (
    isFixtureStarted(short) &&
    fixture.goals.home != null &&
    fixture.goals.away != null
  );
}

export async function loadFixtureHistory(): Promise<Map<number, Fixture>> {
  try {
    const store = await get<HistoryStore>(FIXTURE_HISTORY_KEY);
    if (!store) return new Map();
    if (Date.now() - store.updatedAt > HISTORY_TTL_MS) return new Map();
    return new Map(
      Object.entries(store.byId).map(([id, fixture]) => [Number(id), fixture])
    );
  } catch {
    return new Map();
  }
}

export async function upsertFixtureHistory(fixtures: Fixture[]): Promise<void> {
  const persistable = fixtures.filter(shouldPersist);
  if (persistable.length === 0) return;

  try {
    const existing = await loadFixtureHistory();
    for (const fixture of persistable) {
      const prev = existing.get(fixture.fixture.id);
      existing.set(
        fixture.fixture.id,
        prev ? pickBetterFixture(prev, fixture) : fixture
      );
    }

    const byId: Record<number, Fixture> = {};
    for (const [id, fixture] of existing) {
      byId[id] = fixture;
    }
    await set(FIXTURE_HISTORY_KEY, { updatedAt: Date.now(), byId } satisfies HistoryStore);
  } catch {
    /* quota / private mode */
  }
}

export async function applyFixtureHistory(fixtures: Fixture[]): Promise<Fixture[]> {
  const history = await loadFixtureHistory();
  if (history.size === 0) return fixtures;
  return mergeFixtureLists(fixtures, [...history.values()]);
}
