"use client";

import { useMemo } from "react";
import { useTeams, useStandings, useH2H, useFixtures } from "@/hooks/usePartidos";
import { useTeamPlayers } from "@/hooks/useJugadores";
import { useEstadisticasAggregadas } from "@/hooks/useEstadisticasAggregadas";
import { runScoreSimulation, type ScoreProbabilityMatrix } from "@/utils/matchSimulation";
import type { StandingTeam, Team } from "@/types";

function flattenStandings(standingsRaw: import("@/types").StandingsGroup[]): StandingTeam[] {
  const result: StandingTeam[] = [];
  for (const sg of standingsRaw) {
    for (const group of sg.league.standings) {
      result.push(...group);
    }
  }
  return result;
}

export interface UseMatchSimulationResult {
  result: ScoreProbabilityMatrix | null;
  teamA: Team | undefined;
  teamB: Team | undefined;
  isLoading: boolean;
  isFetching: boolean;
  sameTeam: boolean;
}

/** Equipo A = local, Equipo B = visitante. */
export function useMatchSimulation(
  teamAId: number,
  teamBId: number
): UseMatchSimulationResult {
  const { data: teams = [], isLoading: loadingTeams } = useTeams();
  const { data: standingsRaw = [], isLoading: loadingStandings } = useStandings();
  const { data: fixtures = [], isFetching: fetchingFixtures } = useFixtures();
  const { data: h2h = [], isFetching: fetchingH2H } = useH2H(teamAId, teamBId);
  const { data: playersA = [], isFetching: fetchingPlayersA } = useTeamPlayers(teamAId);
  const { data: playersB = [], isFetching: fetchingPlayersB } = useTeamPlayers(teamBId);
  const { avgGoalsPerMatch, playedCount, startedCount } = useEstadisticasAggregadas();

  const teamA = teams.find((t) => t.id === teamAId);
  const teamB = teams.find((t) => t.id === teamBId);
  const sameTeam = teamAId > 0 && teamAId === teamBId;

  const allStandings = useMemo(() => flattenStandings(standingsRaw), [standingsRaw]);
  const standingA = allStandings.find((s) => s.team.id === teamAId);
  const standingB = allStandings.find((s) => s.team.id === teamBId);

  const isPreTournament = playedCount === 0 && startedCount === 0;

  const result = useMemo(() => {
    if (sameTeam || !teamA || !teamB || teamAId <= 0 || teamBId <= 0) return null;

    return runScoreSimulation({
      teamAId,
      teamBId,
      teamAName: teamA.name,
      teamBName: teamB.name,
      standingA,
      standingB,
      h2h,
      playersA,
      playersB,
      avgGoalsPerMatch,
      isPreTournament,
      clubCalibration: true,
      leagueFixtures: fixtures,
    });
  }, [
    sameTeam,
    teamA,
    teamB,
    teamAId,
    teamBId,
    standingA,
    standingB,
    h2h,
    playersA,
    playersB,
    avgGoalsPerMatch,
    isPreTournament,
    fixtures,
  ]);

  return {
    result,
    teamA,
    teamB,
    isLoading: loadingTeams || loadingStandings,
    isFetching:
      fetchingH2H || fetchingPlayersA || fetchingPlayersB || fetchingFixtures,
    sameTeam,
  };
}
