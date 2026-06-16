"use client";

import { useEffect, useState } from "react";
import type { FixtureStatistic } from "@/types";
import type { StatTimelineSnapshot } from "@/utils/matchMomentum";
import { parseFixtureStats } from "@/utils/fixtureStatsParser";

const STORAGE_PREFIX = "mundial2026_stat_timeline_";

function loadTimeline(fixtureId: number): StatTimelineSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${fixtureId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StatTimelineSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTimeline(fixtureId: number, snapshots: StatTimelineSnapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${fixtureId}`, JSON.stringify(snapshots));
  } catch {
    /* ignore quota */
  }
}

export function useFixtureStatTimeline(
  fixtureId: number,
  enabled: boolean,
  stats: FixtureStatistic[] | undefined,
  homeTeamId: number,
  awayTeamId: number,
  elapsed: number | null | undefined
): StatTimelineSnapshot[] {
  const [timeline, setTimeline] = useState<StatTimelineSnapshot[]>([]);

  useEffect(() => {
    if (fixtureId > 0) {
      setTimeline(loadTimeline(fixtureId));
    }
  }, [fixtureId]);

  useEffect(() => {
    if (!enabled || fixtureId <= 0 || !stats?.length) return;

    const parsed = parseFixtureStats(stats, homeTeamId, awayTeamId);
    if (!parsed) return;

    const minute = Math.max(0, elapsed ?? 0);

    setTimeline((prev) => {
      const idx = prev.findIndex((s) => s.minute === minute);
      const snapshot: StatTimelineSnapshot = {
        minute,
        home: { ...parsed.home },
        away: { ...parsed.away },
      };

      let next: StatTimelineSnapshot[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = snapshot;
      } else {
        next = [...prev, snapshot].sort((a, b) => a.minute - b.minute);
      }

      saveTimeline(fixtureId, next);
      return next;
    });
  }, [enabled, fixtureId, stats, homeTeamId, awayTeamId, elapsed]);

  return timeline;
}
