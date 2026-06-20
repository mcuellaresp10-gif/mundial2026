import type { StandingTeam, StandingsGroup } from "@/types";
import { isWorldCupGroupLabel } from "@/utils/groupClassification";
import { formatGroupFromRound } from "@/utils/formatters";

export interface StandingTableSlice {
  table: StandingTeam[];
  groupLabel: string;
  letter?: string;
}

/** Cada grupo del Mundial viene en league.standings[i], no solo standings[0]. */
export function iterateStandingsTables(groups: StandingsGroup[]): StandingTableSlice[] {
  const slices: StandingTableSlice[] = [];
  for (const g of groups) {
    for (const table of g.league.standings) {
      if (!table?.length) continue;
      const rawGroup = (table[0]?.group ?? g.league.name ?? "").trim();
      if (!isWorldCupGroupLabel(rawGroup)) continue;
      const groupLabel = formatGroupFromRound(rawGroup);
      const letter = groupLabel.match(/Grupo\s+([A-L])/i)?.[1]?.toUpperCase();
      slices.push({ table, groupLabel, letter });
    }
  }
  return slices.sort((a, b) => (a.letter ?? a.groupLabel).localeCompare(b.letter ?? b.groupLabel, "es"));
}
