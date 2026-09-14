import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type PhaseProbsDraftStatus = "pending" | "published" | "rejected";

export interface PhaseProbsDraftRow {
  teamId: number;
  teamName: string;
  probCuadrangulares: number;
  probFinal: number;
  probChampion: number;
}

export interface PhaseProbsDraft {
  dayKey: string;
  status: PhaseProbsDraftStatus;
  createdAt: string;
  updatedAt: string;
  jornada: number;
  phase: "apertura" | "clausura";
  tweets: string[];
  rows: PhaseProbsDraftRow[];
  telegramMessageIds?: number[];
  publishedTweetId?: string;
}

const DATA_DIR = join(process.cwd(), "data");
const FILE = join(DATA_DIR, "x-phase-probs-draft.json");

function loadRaw(): PhaseProbsDraft | null {
  try {
    if (!existsSync(FILE)) return null;
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as PhaseProbsDraft;
    if (!parsed?.dayKey || !Array.isArray(parsed.tweets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(draft: PhaseProbsDraft): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(FILE, JSON.stringify(draft, null, 2), "utf8");
}

export function getPhaseProbsDraftForDay(dayKey: string): PhaseProbsDraft | null {
  const d = loadRaw();
  return d?.dayKey === dayKey ? d : null;
}

export function savePhaseProbsDraft(draft: PhaseProbsDraft): void {
  save({ ...draft, updatedAt: new Date().toISOString() });
}

export function setPhaseProbsDraftStatus(
  dayKey: string,
  status: PhaseProbsDraftStatus,
  extra?: Partial<Pick<PhaseProbsDraft, "publishedTweetId" | "telegramMessageIds">>
): PhaseProbsDraft | null {
  const d = getPhaseProbsDraftForDay(dayKey);
  if (!d) return null;
  const next: PhaseProbsDraft = {
    ...d,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };
  save(next);
  return next;
}
