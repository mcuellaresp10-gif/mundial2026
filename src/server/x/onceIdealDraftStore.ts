import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { FormationType, OnceIdealPlayer } from "@/types";

export type OnceIdealDraftStatus = "pending" | "published" | "rejected";

export interface OnceIdealDraft {
  dayKey: string;
  status: OnceIdealDraftStatus;
  createdAt: string;
  updatedAt: string;
  leagueId: number;
  season: number;
  phaseLabel: string;
  formation: FormationType;
  averageRating: number;
  tweets: string[];
  players: OnceIdealPlayer[];
  telegramMessageIds?: number[];
  publishedTweetId?: string;
}

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "x-once-ideal-draft.json");

function loadRaw(): OnceIdealDraft | null {
  try {
    if (!existsSync(FILE)) return null;
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as OnceIdealDraft;
    if (!parsed?.dayKey || !Array.isArray(parsed.tweets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(draft: OnceIdealDraft): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(draft, null, 2), "utf8");
}

export function getOnceIdealDraftForDay(dayKey: string): OnceIdealDraft | null {
  const d = loadRaw();
  return d?.dayKey === dayKey ? d : null;
}

export function saveOnceIdealDraft(draft: OnceIdealDraft): void {
  save({ ...draft, updatedAt: new Date().toISOString() });
}

export function setOnceIdealDraftStatus(
  dayKey: string,
  status: OnceIdealDraftStatus,
  extra?: Partial<Pick<OnceIdealDraft, "publishedTweetId" | "telegramMessageIds">>
): OnceIdealDraft | null {
  const d = getOnceIdealDraftForDay(dayKey);
  if (!d) return null;
  const next: OnceIdealDraft = {
    ...d,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
  save(next);
  return next;
}
