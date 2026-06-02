import type { Fixture, Player, StandingsGroup, Team } from "@/types";
import type { RadarPoolEntry } from "@/services/radarBenchmarkCache";

export interface WorldCupSnapshot {
  version: 1;
  generatedAt: string;
  teams: Team[];
  players: Player[];
  fixtures: Fixture[];
  standings: StandingsGroup[];
  radarPool: RadarPoolEntry[];
  meta: {
    teamCount: number;
    playerCount: number;
    fixtureCount: number;
  };
}

export type TournamentPhase = "pre" | "live";
