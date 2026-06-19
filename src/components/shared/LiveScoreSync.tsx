"use client";

import { useLiveScoreSync } from "@/hooks/useLiveScoreSync";
import { useStandingsSync } from "@/hooks/useStandingsSync";

/** Motor de refresco en vivo (live=all → React Query). Montar una vez en layout. */
export function LiveScoreSync() {
  useLiveScoreSync();
  useStandingsSync();
  return null;
}
