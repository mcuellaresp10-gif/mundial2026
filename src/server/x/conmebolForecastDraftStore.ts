import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ForecastDraft,
  ForecastDraftMatch,
  ForecastDraftStatus,
} from "@/server/x/forecastDraftStore";

export type ConmebolForecastDraft = ForecastDraft & {
  kind: "conmebol";
};

export type { ForecastDraftMatch, ForecastDraftStatus };

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "x-conmebol-forecast-draft.json");

function loadRaw(): ConmebolForecastDraft | null {
  try {
    if (!existsSync(FILE)) return null;
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as ConmebolForecastDraft;
    if (!parsed?.dayKey || !Array.isArray(parsed.tweets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(draft: ConmebolForecastDraft): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(draft, null, 2), "utf8");
}

export function getConmebolForecastDraftForDay(
  dayKey: string
): ConmebolForecastDraft | null {
  const d = loadRaw();
  return d?.dayKey === dayKey ? d : null;
}

export function saveConmebolForecastDraft(draft: ConmebolForecastDraft): void {
  save({ ...draft, kind: "conmebol", updatedAt: new Date().toISOString() });
}

export function setConmebolForecastDraftStatus(
  dayKey: string,
  status: ForecastDraftStatus,
  extra?: Partial<
    Pick<ConmebolForecastDraft, "publishedTweetId" | "telegramMessageIds">
  >
): ConmebolForecastDraft | null {
  const d = getConmebolForecastDraftForDay(dayKey);
  if (!d) return null;
  const next: ConmebolForecastDraft = {
    ...d,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
  save(next);
  return next;
}
