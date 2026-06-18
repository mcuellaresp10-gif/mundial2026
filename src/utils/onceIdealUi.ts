import type { OnceIdealPlayer } from "@/types";

const PITCH_INSET = { top: 8, right: 7, bottom: 12, left: 7 };

export function toSafePitchCoord(x: number, y: number): { x: number; y: number } {
  const width = 100 - PITCH_INSET.left - PITCH_INSET.right;
  const height = 100 - PITCH_INSET.top - PITCH_INSET.bottom;
  return {
    x: PITCH_INSET.left + (x / 100) * width,
    y: PITCH_INSET.top + (y / 100) * height,
  };
}

const POSITION_LABELS: Record<string, string> = {
  G: "POR",
  D: "DEF",
  M: "MED",
  F: "DEL",
};

export function positionLabel(code: string): string {
  return POSITION_LABELS[code] ?? code;
}

const LINE_ORDER = ["G", "D", "M", "F"] as const;
const LINE_TITLES: Record<(typeof LINE_ORDER)[number], string> = {
  G: "Portero",
  D: "Defensa",
  M: "Mediocampo",
  F: "Delantera",
};

export function groupPlayersByLine(players: OnceIdealPlayer[]) {
  return LINE_ORDER.map((line) => ({
    line,
    title: LINE_TITLES[line],
    players: players
      .filter((p) => p.position === line)
      .sort((a, b) => b.rating - a.rating),
  })).filter((g) => g.players.length > 0);
}

export function findMvp(players: OnceIdealPlayer[]): OnceIdealPlayer | null {
  if (players.length === 0) return null;
  return [...players].sort((a, b) => b.rating - a.rating)[0];
}

export function countUniqueTeams(players: OnceIdealPlayer[]): number {
  return new Set(players.map((p) => p.team)).size;
}
