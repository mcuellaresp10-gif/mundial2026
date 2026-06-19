"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { groupStageScoresSignature } from "@/utils/liveStandings";
import { isLiveSessionActive } from "@/services/liveSession";
import { getClientTournamentPhase } from "@/services/clientTournamentPhase";
import type { Fixture } from "@/types";

function readBaseFixtures(qc: ReturnType<typeof useQueryClient>): Fixture[] {
  return (
    qc.getQueryData<Fixture[]>(["fixtures", undefined]) ??
    qc.getQueryData<Fixture[]>(["fixtures", {}]) ??
    []
  );
}

/** Invalida standings cuando cambian resultados FT en la caché de fixtures. */
export function useStandingsSync() {
  const qc = useQueryClient();
  const signatureRef = useRef("");

  useEffect(() => {
    const syncIfNeeded = () => {
      const liveMode = isLiveSessionActive() || getClientTournamentPhase() === "live";
      if (!liveMode) return;

      const fixtures = readBaseFixtures(qc);
      const signature = groupStageScoresSignature(fixtures);
      if (signatureRef.current && signature !== signatureRef.current) {
        qc.invalidateQueries({ queryKey: ["standings"] });
      }
      signatureRef.current = signature;
    };

    syncIfNeeded();

    const unsubscribe = qc.getQueryCache().subscribe((event) => {
      const query = event?.query;
      if (!query || query.queryKey[0] !== "fixtures") return;
      if (event.type === "updated" || event.type === "added") {
        syncIfNeeded();
      }
    });

    return unsubscribe;
  }, [qc]);
}
