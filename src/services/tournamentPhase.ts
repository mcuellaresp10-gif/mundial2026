import type { StandingsGroup } from "@/types";
import type { TournamentPhase } from "@/types/snapshot";

/** true si algún equipo ya jugó partidos de fase de grupos. */
export function isWorldCupLive(standings: StandingsGroup[]): boolean {
  for (const sg of standings) {
    for (const group of sg.league.standings) {
      if (group.some((s) => (s.all.played ?? 0) > 0)) return true;
    }
  }
  return false;
}

export function getTournamentPhase(standings: StandingsGroup[]): TournamentPhase {
  return isWorldCupLive(standings) ? "live" : "pre";
}

/** Catálogo pesado (plantillas, stats club, radar) → snapshot si existe. */
export function shouldUseSnapshotForCatalog(phase: TournamentPhase): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_LIVE_API === "true") return false;
  if (process.env.NEXT_PUBLIC_FORCE_SNAPSHOT === "true") return true;
  return phase === "pre";
}

/** Fixtures, standings, eventos → API en vivo durante el torneo. */
export function shouldUseLiveApiForScores(phase: TournamentPhase): boolean {
  if (process.env.NEXT_PUBLIC_FORCE_SNAPSHOT === "true") return false;
  return phase === "live";
}
