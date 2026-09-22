import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type ArgentinaPhaseDraftStatus = "pending" | "published" | "rejected";

export interface ArgentinaPhaseDraftRow {
  teamId: number;
  teamName: string;
  zone: "A" | "B";
  rank: number;
  probPlayoffs: number;
  probQuarter: number;
  probSemi: number;
  probFinal: number;
  probChampion: number;
}

export interface ArgentinaPhaseDraft {
  dayKey: string;
  status: ArgentinaPhaseDraftStatus;
  createdAt: string;
  updatedAt: string;
  jornada: number;
  phase: "apertura" | "clausura";
  tweets: string[];
  rows: ArgentinaPhaseDraftRow[];
  telegramMessageIds?: number[];
  publishedTweetId?: string;
}

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "x-argentina-phase-draft.json");

function loadRaw(): ArgentinaPhaseDraft | null {
  try {
    if (!existsSync(FILE)) return null;
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as ArgentinaPhaseDraft;
    if (!parsed?.dayKey || !Array.isArray(parsed.tweets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(draft: ArgentinaPhaseDraft): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(draft, null, 2), "utf8");
}

export function getArgentinaPhaseDraftForDay(
  dayKey: string
): ArgentinaPhaseDraft | null {
  const d = loadRaw();
  return d?.dayKey === dayKey ? d : null;
}

export function saveArgentinaPhaseDraft(draft: ArgentinaPhaseDraft): void {
  save({ ...draft, updatedAt: new Date().toISOString() });
}

export function setArgentinaPhaseDraftStatus(
  dayKey: string,
  status: ArgentinaPhaseDraftStatus,
  extra?: Partial<
    Pick<ArgentinaPhaseDraft, "publishedTweetId" | "telegramMessageIds">
  >
): ArgentinaPhaseDraft | null {
  const d = getArgentinaPhaseDraftForDay(dayKey);
  if (!d) return null;
  const next: ArgentinaPhaseDraft = {
    ...d,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
  save(next);
  return next;
}
