"use client";

import { useMemo } from "react";
import { useTeams, useStandings, useH2H, useFixtures } from "@/hooks/usePartidos";
import { useTeamPlayers } from "@/hooks/useJugadores";
import { useEstadisticasAggregadas } from "@/hooks/useEstadisticasAggregadas";
import { runScoreSimulation, type ScoreProbabilityMatrix } from "@/utils/matchSimulation";
import { pickStandingForClub } from "@/utils/clubMatchCalibration";
import type { Team } from "@/types";

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

  const pickA = useMemo(
    () => (teamAId > 0 ? pickStandingForClub(standingsRaw, teamAId) : null),
    [standingsRaw, teamAId]
  );
  const pickB = useMemo(
    () => (teamBId > 0 ? pickStandingForClub(standingsRaw, teamBId) : null),
    [standingsRaw, teamBId]
  );

  const standingA = pickA?.standing;
  const standingB = pickB?.standing;

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
      homeLeagueId: pickA?.leagueId ?? null,
      awayLeagueId: pickB?.leagueId ?? null,
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
    pickA?.leagueId,
    pickB?.leagueId,
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
