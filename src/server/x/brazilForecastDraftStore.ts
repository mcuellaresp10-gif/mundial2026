import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type {
  ForecastDraft,
  ForecastDraftStatus,
} from "@/server/x/forecastDraftStore";

export type BrazilForecastDraft = ForecastDraft & { kind: "brazil" };

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "x-brazil-forecast-draft.json");

function loadRaw(): BrazilForecastDraft | null {
  try {
    if (!existsSync(FILE)) return null;
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as BrazilForecastDraft;
    if (!parsed?.dayKey || !Array.isArray(parsed.tweets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(draft: BrazilForecastDraft): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(draft, null, 2), "utf8");
}

export function getBrazilForecastDraftForDay(
  dayKey: string
): BrazilForecastDraft | null {
  const d = loadRaw();
  return d?.dayKey === dayKey ? d : null;
}

export function saveBrazilForecastDraft(draft: BrazilForecastDraft): void {
  save({ ...draft, kind: "brazil", updatedAt: new Date().toISOString() });
}

export function setBrazilForecastDraftStatus(
  dayKey: string,
  status: ForecastDraftStatus,
  extra?: Partial<
    Pick<BrazilForecastDraft, "publishedTweetId" | "telegramMessageIds">
  >
): BrazilForecastDraft | null {
  const d = getBrazilForecastDraftForDay(dayKey);
  if (!d) return null;
  const next: BrazilForecastDraft = {
    ...d,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
  save(next);
  return next;
}
