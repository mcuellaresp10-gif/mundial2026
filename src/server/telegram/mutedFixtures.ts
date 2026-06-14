import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

interface MutedEntry {
  label: string;
  mutedAt: string;
}

interface MutedStore {
  fixtures: Record<string, MutedEntry>;
}

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "telegram-muted.json");

function loadStore(): MutedStore {
  try {
    if (!existsSync(FILE)) return { fixtures: {} };
    const raw = readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw) as MutedStore;
    return parsed?.fixtures ? parsed : { fixtures: {} };
  } catch {
    return { fixtures: {} };
  }
}

function saveStore(store: MutedStore): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(store, null, 2), "utf8");
}

export function isFixtureMuted(fixtureId: number): boolean {
  return String(fixtureId) in loadStore().fixtures;
}

export function muteFixture(fixtureId: number, label: string): void {
  const store = loadStore();
  store.fixtures[String(fixtureId)] = {
    label,
    mutedAt: new Date().toISOString(),
  };
  saveStore(store);
}

export function unmuteFixture(fixtureId: number): boolean {
  const store = loadStore();
  const key = String(fixtureId);
  if (!store.fixtures[key]) return false;
  delete store.fixtures[key];
  saveStore(store);
  return true;
}

export function getMutedFixtures(): { id: number; label: string }[] {
  const store = loadStore();
  return Object.entries(store.fixtures)
    .map(([id, entry]) => ({ id: Number(id), label: entry.label }))
    .filter((x) => Number.isFinite(x.id))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/** Quita partidos ya finalizados de la lista de silenciados. */
export function unmuteFinishedFixtures(finishedIds: number[]): number {
  const store = loadStore();
  let removed = 0;
  for (const id of finishedIds) {
    const key = String(id);
    if (store.fixtures[key]) {
      delete store.fixtures[key];
      removed++;
    }
  }
  if (removed > 0) saveStore(store);
  return removed;
}
