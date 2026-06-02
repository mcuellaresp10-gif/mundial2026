import type { TournamentPhase } from "@/types/snapshot";

let phase: TournamentPhase = "pre";

export function setClientTournamentPhase(next: TournamentPhase): void {
  phase = next;
}

export function getClientTournamentPhase(): TournamentPhase {
  return phase;
}
