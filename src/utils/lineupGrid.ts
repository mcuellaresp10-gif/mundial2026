import type { LineupPlayer } from "@/types";

/** Márgenes internos para que número + nombre quepan dentro del césped. */
const LINEUP_PITCH_INSET = { top: 14, right: 10, bottom: 20, left: 10 };

const POS_BAND_Y: Record<string, number> = {
  G: 88,
  D: 68,
  M: 48,
  F: 20,
};

export interface PitchPoint {
  x: number;
  y: number;
}

/** Normaliza coordenadas 0–100 al área jugable con márgenes. */
export function toSafeLineupPitchCoord(x: number, y: number): PitchPoint {
  const width = 100 - LINEUP_PITCH_INSET.left - LINEUP_PITCH_INSET.right;
  const height = 100 - LINEUP_PITCH_INSET.top - LINEUP_PITCH_INSET.bottom;
  const nx = Math.min(100, Math.max(0, x));
  const ny = Math.min(100, Math.max(0, y));
  return {
    x: LINEUP_PITCH_INSET.left + (nx / 100) * width,
    y: LINEUP_PITCH_INSET.top + (ny / 100) * height,
  };
}

function parseGrid(grid: string): { row: number; col: number } | null {
  const [rowStr, colStr] = grid.split(":");
  const row = Number(rowStr);
  const col = Number(colStr);
  if (!Number.isFinite(row) || !Number.isFinite(col) || row < 1 || col < 1) return null;
  return { row, col };
}

function fallbackByPosition(
  pos: string,
  indexInPos: number,
  countInPos: number
): PitchPoint {
  const band = POS_BAND_Y[pos] ?? 50;
  const rawX = countInPos <= 1 ? 50 : ((indexInPos + 1) / (countInPos + 1)) * 100;
  return toSafeLineupPitchCoord(rawX, band);
}

/** Convierte grid API-Football (fila:columna) a % en el campo. Portero abajo. */
export function lineupGridToPitch(
  grid: string | null,
  startXI: LineupPlayer[]
): PitchPoint {
  const grids = startXI.map((p) => p.player.grid).filter(Boolean) as string[];

  if (grid) {
    const parsed = parseGrid(grid);
    if (parsed) {
      const { row, col } = parsed;
      const rows = grids
        .map((g) => parseGrid(g)?.row ?? 0)
        .filter((r) => r > 0);
      const maxRow = Math.max(...rows, row, 5);

      const colsInRow = grids
        .map((g) => parseGrid(g))
        .filter((p): p is { row: number; col: number } => !!p && p.row === row)
        .map((p) => p.col);
      const maxCol = Math.max(...colsInRow, col, 1);

      const rawX = (col / (maxCol + 1)) * 100;
      const rawY = 100 - ((row - 1) / Math.max(maxRow - 1, 1)) * 100;
      return toSafeLineupPitchCoord(rawX, rawY);
    }
  }

  const pos = startXI.find((p) => p.player.grid === grid)?.player.pos ?? "M";
  const samePos = startXI.filter((p) => p.player.pos === pos);
  const idx = samePos.findIndex((p) => p.player.grid === grid);
  return fallbackByPosition(pos, Math.max(0, idx), samePos.length);
}

export function lineupPlayersToPitch(
  startXI: LineupPlayer[]
): { player: LineupPlayer; point: PitchPoint }[] {
  const byPosCount = new Map<string, number>();

  return startXI.map((entry) => {
    const pos = entry.player.pos;
    const indexInPos = byPosCount.get(pos) ?? 0;
    byPosCount.set(pos, indexInPos + 1);
    const countInPos = startXI.filter((p) => p.player.pos === pos).length;

    const point = entry.player.grid
      ? lineupGridToPitch(entry.player.grid, startXI)
      : fallbackByPosition(pos, indexInPos, countInPos);

    return { player: entry, point };
  });
}

/** Porteros y delanteros extremos: etiqueta hacia el interior del campo. */
export function shouldFlipLineupLabel(y: number): boolean {
  return y >= 68;
}
