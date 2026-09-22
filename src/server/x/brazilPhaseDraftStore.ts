import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type BrazilPhaseDraftStatus = "pending" | "published" | "rejected";

export interface BrazilPhaseDraftRow {
  teamId: number;
  teamName: string;
  rank: number;
  probChampion: number;
  probLibertadoresG4: number;
  probLibertadores: number;
  probSudamericana: number;
  probRelegation: number;
}

export interface BrazilPhaseDraft {
  dayKey: string;
  status: BrazilPhaseDraftStatus;
  createdAt: string;
  updatedAt: string;
  jornada: number;
  tweets: string[];
  rows: BrazilPhaseDraftRow[];
  telegramMessageIds?: number[];
  publishedTweetId?: string;
}

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "x-brazil-phase-draft.json");

function loadRaw(): BrazilPhaseDraft | null {
  try {
    if (!existsSync(FILE)) return null;
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as BrazilPhaseDraft;
    if (!parsed?.dayKey || !Array.isArray(parsed.tweets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(draft: BrazilPhaseDraft): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(draft, null, 2), "utf8");
}

export function getBrazilPhaseDraftForDay(dayKey: string): BrazilPhaseDraft | null {
  const d = loadRaw();
  return d?.dayKey === dayKey ? d : null;
}

export function saveBrazilPhaseDraft(draft: BrazilPhaseDraft): void {
  save({ ...draft, updatedAt: new Date().toISOString() });
}

export function setBrazilPhaseDraftStatus(
  dayKey: string,
  status: BrazilPhaseDraftStatus,
  extra?: Partial<Pick<BrazilPhaseDraft, "publishedTweetId" | "telegramMessageIds">>
): BrazilPhaseDraft | null {
  const d = getBrazilPhaseDraftForDay(dayKey);
  if (!d) return null;
  const next: BrazilPhaseDraft = {
    ...d,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
  save(next);
  return next;
}
