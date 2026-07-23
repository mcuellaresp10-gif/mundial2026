import type { RatedPlayerCandidate } from "@/utils/calculations";

export type LeagueFilter = number | "all";

export function filterCandidatesByLeague(
  candidates: RatedPlayerCandidate[],
  leagueFilter: LeagueFilter
): RatedPlayerCandidate[] {
  if (leagueFilter === "all") return candidates;
  return candidates.filter((c) => c.leagueId === leagueFilter);
}
