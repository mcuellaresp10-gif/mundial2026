"use client";

import { useEffect, useState } from "react";
import type { FixtureEvent, FixtureStatistic } from "@/types";
import type { MomentumSnapshot } from "@/utils/matchMomentum";
import { fixtureEventKey } from "@/utils/matchEventMarkers";
import { parseFixtureStats } from "@/utils/fixtureStatsParser";

const STORAGE_PREFIX = "mundial2026_momentum_";
const MIN_SNAPSHOT_GAP_MS = 25_000;

function loadSnapshots(fixtureId: number): MomentumSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${fixtureId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MomentumSnapshot[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSnapshots(fixtureId: number, snapshots: MomentumSnapshot[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${fixtureId}`, JSON.stringify(snapshots));
  } catch {
    /* ignore quota */
  }
}

function fractionalMinute(
  elapsed: number | null | undefined,
  extra: number | null | undefined
): number {
  const base = Math.max(0, elapsed ?? 0);
  const add = extra != null && extra > 0 ? extra / 60 : 0;
  return Math.round((base + add) * 2) / 2;
}

function statsFingerprint(stats: FixtureStatistic[] | undefined): string {
  if (!stats?.length) return "";
  return JSON.stringify(
    stats.map((s) =>
      s.statistics.map((x) => `${x.type}:${x.value}`).join("|")
    )
  );
}

function eventKeys(events: FixtureEvent[] | undefined): string[] {
  return (events ?? []).map(fixtureEventKey).sort();
}

export function useLiveMomentumSnapshots(
  fixtureId: number,
  enabled: boolean,
  stats: FixtureStatistic[] | undefined,
  events: FixtureEvent[] | undefined,
  homeTeamId: number,
  awayTeamId: number,
  elapsed: number | null | undefined,
  extra: number | null | undefined
): { snapshots: MomentumSnapshot[]; lastUpdated: number | null } {
  const [snapshots, setSnapshots] = useState<MomentumSnapshot[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    if (fixtureId > 0) {
      const loaded = loadSnapshots(fixtureId);
      setSnapshots(loaded);
      setLastUpdated(loaded.at(-1)?.ts ?? null);
    }
  }, [fixtureId]);

  useEffect(() => {
    if (!enabled || fixtureId <= 0 || !stats?.length) return;

    const parsed = parseFixtureStats(stats, homeTeamId, awayTeamId);
    if (!parsed) return;

    const now = Date.now();
    const minute = fractionalMinute(elapsed, extra);
    const keys = eventKeys(events);
    const fp = statsFingerprint(stats);

    setSnapshots((prev) => {
      const last = prev.at(-1);
      const timeOk = !last || now - last.ts >= MIN_SNAPSHOT_GAP_MS;
      const minuteChanged = !last || last.minute !== minute;
      const statsChanged = !last || last.statsFingerprint !== fp;
      const eventsChanged =
        !last || JSON.stringify(last.eventKeys) !== JSON.stringify(keys);

      if (!timeOk && !minuteChanged && !statsChanged && !eventsChanged) {
        return prev;
      }

      const snapshot: MomentumSnapshot = {
        ts: now,
        minute,
        home: { ...parsed.home },
        away: { ...parsed.away },
        eventKeys: keys,
        statsFingerprint: fp,
      };

      const next = [...prev, snapshot].sort((a, b) => a.minute - b.minute || a.ts - b.ts);
      saveSnapshots(fixtureId, next);
      setLastUpdated(now);
      return next;
    });
  }, [
    enabled,
    fixtureId,
    stats,
    events,
    homeTeamId,
    awayTeamId,
    elapsed,
    extra,
  ]);

  return { snapshots, lastUpdated };
}
