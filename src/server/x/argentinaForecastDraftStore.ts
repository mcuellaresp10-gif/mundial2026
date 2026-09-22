import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ForecastDraft,
  ForecastDraftStatus,
} from "@/server/x/forecastDraftStore";

export type ArgentinaForecastDraft = ForecastDraft & { kind: "argentina" };

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "x-argentina-forecast-draft.json");

function loadRaw(): ArgentinaForecastDraft | null {
  try {
    if (!existsSync(FILE)) return null;
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as ArgentinaForecastDraft;
    if (!parsed?.dayKey || !Array.isArray(parsed.tweets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(draft: ArgentinaForecastDraft): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(draft, null, 2), "utf8");
}

export function getArgentinaForecastDraftForDay(
  dayKey: string
): ArgentinaForecastDraft | null {
  const d = loadRaw();
  return d?.dayKey === dayKey ? d : null;
}

export function saveArgentinaForecastDraft(draft: ArgentinaForecastDraft): void {
  save({ ...draft, kind: "argentina", updatedAt: new Date().toISOString() });
}

export function setArgentinaForecastDraftStatus(
  dayKey: string,
  status: ForecastDraftStatus,
  extra?: Partial<
    Pick<ArgentinaForecastDraft, "publishedTweetId" | "telegramMessageIds">
  >
): ArgentinaForecastDraft | null {
  const d = getArgentinaForecastDraftForDay(dayKey);
  if (!d) return null;
  const next: ArgentinaForecastDraft = {
    ...d,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
  save(next);
  return next;
}
