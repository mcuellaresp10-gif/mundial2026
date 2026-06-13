"use client";

import { useLiveScoreSync } from "@/hooks/useLiveScoreSync";

/** Motor de refresco en vivo (live=all → React Query). Montar una vez en layout. */
export function LiveScoreSync() {
  useLiveScoreSync();
  return null;
}
