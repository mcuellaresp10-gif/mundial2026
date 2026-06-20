import type { StandingTeam, StandingsGroup } from "@/types";
import { isWorldCupGroupLabel } from "@/utils/groupClassification";
import { formatGroupFromRound } from "@/utils/formatters";

export interface StandingTableSlice {
  table: StandingTeam[];
  groupLabel: string;
  letter?: string;
}

/** Una fila por equipo (la API a veces repite selecciones en la misma tabla). */
export function dedupeStandingTable(table: StandingTeam[]): StandingTeam[] {
  const byTeam = new Map<number, StandingTeam>();
  for (const row of table) {
    const existing = byTeam.get(row.team.id);
    if (!existing || row.all.played > existing.all.played) {
      byTeam.set(row.team.id, row);
    }
  }
  return [...byTeam.values()]
    .sort((a, b) => a.rank - b.rank || a.team.id - b.team.id)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/** Cada grupo del Mundial viene en league.standings[i], no solo standings[0]. */
export function iterateStandingsTables(groups: StandingsGroup[]): StandingTableSlice[] {
  const slices: StandingTableSlice[] = [];
  const seenGroups = new Set<string>();

  for (const g of groups) {
    for (const table of g.league.standings) {
      if (!table?.length) continue;
      const rawGroup = (table[0]?.group ?? g.league.name ?? "").trim();
      if (!isWorldCupGroupLabel(rawGroup)) continue;

      const groupKey = rawGroup.trim().toUpperCase();
      if (seenGroups.has(groupKey)) continue;
      seenGroups.add(groupKey);

      const groupLabel = formatGroupFromRound(rawGroup);
      const letter = groupLabel.match(/Grupo\s+([A-L])/i)?.[1]?.toUpperCase();
      slices.push({ table: dedupeStandingTable(table), groupLabel, letter });
    }
  }
  return slices.sort((a, b) => (a.letter ?? a.groupLabel).localeCompare(b.letter ?? b.groupLabel, "es"));
}
