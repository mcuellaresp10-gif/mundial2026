"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllPlayersForTeams } from "@/services/apiFootball";
import { buildOnceIdeal } from "@/utils/calculations";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { useTeams } from "./usePartidos";

export function useOnceIdeal(formation: FormationType = "4-3-3") {
  const { data: teams } = useTeams();

  const teamIds = useMemo(() => teams?.slice(0, 8).map((t) => t.id) ?? [], [teams]);

  const { data: players, isLoading } = useQuery({
    queryKey: ["onceIdealPlayers", teamIds],
    queryFn: () => getAllPlayersForTeams(teamIds),
    enabled: teamIds.length > 0,
    staleTime: 4 * 60 * 60 * 1000,
  });

  const onceIdeal: OnceIdealPlayer[] = useMemo(() => {
    if (!players) return [];
    return buildOnceIdeal(players, formation);
  }, [players, formation]);

  const averageRating = useMemo(() => {
    if (onceIdeal.length === 0) return 0;
    return Math.round((onceIdeal.reduce((s, p) => s + p.rating, 0) / onceIdeal.length) * 10) / 10;
  }, [onceIdeal]);

  return { onceIdeal, averageRating, isLoading };
}
