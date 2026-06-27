"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useFixtures } from "@/hooks/usePartidos";
import { finishedFixturesSignature } from "@/lib/liveRefresh";
import { clearPlayerStatsLocalCache } from "@/services/liveSession";

/** Invalida stats de jugadores cuando cambia el resultado de un partido FT. */
export function PlayerStatsSync() {
  const { data: fixtures = [] } = useFixtures();
  const qc = useQueryClient();
  const prevSignatureRef = useRef("");

  useEffect(() => {
    const signature = finishedFixturesSignature(fixtures);
    if (prevSignatureRef.current && signature !== prevSignatureRef.current) {
      clearPlayerStatsLocalCache();
      qc.invalidateQueries({ queryKey: ["worldCupPlayerStatsPool"] });
      qc.invalidateQueries({ queryKey: ["worldCupTopScorers"] });
      qc.invalidateQueries({ queryKey: ["worldCupTopAssists"] });
      qc.invalidateQueries({ queryKey: ["worldCupGoalkeeperPool"] });
    }
    prevSignatureRef.current = signature;
  }, [fixtures, qc]);

  return null;
}
