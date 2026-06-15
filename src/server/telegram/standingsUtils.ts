import type { StandingTeam, StandingsGroup } from "@/types";
import {
  iterateStandingsTables,
  type StandingTableSlice,
} from "@/utils/standingsTables";

export type { StandingTableSlice };
export { iterateStandingsTables };

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
