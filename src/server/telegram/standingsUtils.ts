import type { StandingTeam, StandingsGroup } from "@/types";
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
      const groupLabel = formatGroupFromRound(table[0]?.group ?? g.league.name);
      const letter = groupLabel.match(/Grupo\s+([A-L])/i)?.[1]?.toUpperCase();
      slices.push({ table, groupLabel, letter });
    }
  }
  return slices.sort((a, b) => (a.letter ?? a.groupLabel).localeCompare(b.letter ?? b.groupLabel, "es"));
}

export function findStandingTeam(
  groups: StandingsGroup[],
  teamQuery: string,
  matches: (name: string, query: string) => boolean
): StandingTeam | undefined {
  for (const { table } of iterateStandingsTables(groups)) {
    const found = table.find((t) => matches(t.team.name, teamQuery));
    if (found) return found;
  }
  return undefined;
}
