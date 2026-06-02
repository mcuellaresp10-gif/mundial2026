"use client";

import { useMemo } from "react";
import { useTeams } from "@/hooks/usePartidos";
import { useAllPlayers } from "@/hooks/useJugadores";

/**
 * Pool de jugadores convocados al Mundial (48 selecciones) para benchmark del radar.
 * Comparte cache React Query con /jugadores, /estadisticas y /comparativas.
 */
export function useWorldCupBenchmarkPool(enabled = true) {
  const { data: teams = [], isLoading: loadingTeams } = useTeams();

  const teamIds = useMemo(() => teams.map((t) => t.id), [teams]);

  const {
    data: players = [],
    isLoading: loadingPlayers,
    isFetching,
  } = useAllPlayers(teamIds, true, enabled && teamIds.length > 0);

  const isLoading = loadingTeams || loadingPlayers;
  const isReady = !isLoading && players.length > 0;

  return {
    players,
    isLoading,
    isFetching,
    isReady,
    teamCount: teams.length,
  };
}
