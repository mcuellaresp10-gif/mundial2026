import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type ForecastDraftStatus = "pending" | "published" | "rejected";

export interface ForecastDraftMatch {
  fixtureId: number;
  homeId: number;
  awayId: number;
  homeName: string;
  awayName: string;
  winHome: number;
  draw: number;
  winAway: number;
  /** Etiqueta de competición (Conmebol). */
  competition?: string;
}

export interface ForecastDraft {
  dayKey: string;
  status: ForecastDraftStatus;
  createdAt: string;
  updatedAt: string;
  tweets: string[];
  matches: ForecastDraftMatch[];
  telegramMessageIds?: number[];
  publishedTweetId?: string;
}

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "x-forecast-draft.json");

function loadRaw(): ForecastDraft | null {
  try {
    if (!existsSync(FILE)) return null;
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as ForecastDraft;
    if (!parsed?.dayKey || !Array.isArray(parsed.tweets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(draft: ForecastDraft): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(draft, null, 2), "utf8");
}

export function getForecastDraft(): ForecastDraft | null {
  return loadRaw();
}

export function getForecastDraftForDay(dayKey: string): ForecastDraft | null {
  const d = loadRaw();
  return d?.dayKey === dayKey ? d : null;
}

export function saveForecastDraft(draft: ForecastDraft): void {
  save({ ...draft, updatedAt: new Date().toISOString() });
}

export function setForecastDraftStatus(
  dayKey: string,
  status: ForecastDraftStatus,
  extra?: Partial<Pick<ForecastDraft, "publishedTweetId" | "telegramMessageIds">>
): ForecastDraft | null {
  const d = getForecastDraftForDay(dayKey);
  if (!d) return null;
  const next: ForecastDraft = {
    ...d,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
  save(next);
  return next;
}
