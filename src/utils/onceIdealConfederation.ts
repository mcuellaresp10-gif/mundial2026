import type { RatedPlayerCandidate } from "@/utils/calculations";
import { getConfederation, type Confederation } from "@/utils/confederations";

export type ConfederationFilter = Confederation | "all";

export function filterCandidatesByConfederation(
  candidates: RatedPlayerCandidate[],
  confederation: ConfederationFilter
): RatedPlayerCandidate[] {
  if (confederation === "all") return candidates;
  return candidates.filter((candidate) => getConfederation(candidate.team) === confederation);
}
