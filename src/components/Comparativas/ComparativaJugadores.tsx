"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScoutingPosition } from "@/config/positionMetricProfiles";
import { getPositionProfile, scoutingPositionOptions } from "@/config/positionMetricProfiles";
import type { ScoutingMetricViewId } from "@/config/scoutingMetricViews";
import { getMetricView, getMetricViewsForPosition } from "@/config/scoutingMetricViews";
import { profilesForPosition, SCOUTING_MIN_WC_MINUTES } from "@/utils/worldCupScoutingMetrics";
import { useWorldCupScoutingPool } from "@/hooks/useWorldCupScoutingPool";
import {
  ChartExportButton,
  ScoutingRadarWC,
  ScoutingScatter,
  ScoutingScatterLegend,
  ScoutingPer90Table,
  ScoutingMetricViewPicker,
} from "@/components/Jugadores/Scouting";

export function ComparativaJugadores() {
  const [posFilter, setPosFilter] = useState<ScoutingPosition>("F");
  const [metricView, setMetricView] = useState<ScoutingMetricViewId>("default");
  const [playerAId, setPlayerAId] = useState<number>(0);
  const [playerBId, setPlayerBId] = useState<number>(0);
  const chartRef = useRef<HTMLDivElement>(null);

  const { profiles, isLoading, isReady } = useWorldCupScoutingPool(true);

  const filtered = useMemo(() => {
    const list = profilesForPosition(profiles, posFilter);
    return [...list].sort((a, b) => b.rating - a.rating);
  }, [profiles, posFilter]);

  const profileA = filtered.find((p) => p.playerId === playerAId) ?? filtered[0];
  const profileB = filtered.find((p) => p.playerId === playerBId) ?? filtered[1];

  useEffect(() => {
    if (filtered[0] && !playerAId) setPlayerAId(filtered[0].playerId);
    if (filtered[1] && !playerBId) setPlayerBId(filtered[1].playerId);
  }, [filtered, playerAId, playerBId]);

  useEffect(() => {
    setPlayerAId(0);
    setPlayerBId(0);
    setMetricView("default");
  }, [posFilter]);

  useEffect(() => {
    const available = getMetricViewsForPosition(posFilter);
    if (!available.some((v) => v.id === metricView)) {
      setMetricView("default");
    }
  }, [posFilter, metricView]);

  const positionProfile = getPositionProfile(posFilter);
  const activeView = getMetricView(metricView, posFilter);
  const highlightIds = [profileA?.playerId, profileB?.playerId].filter(
    (id): id is number => id != null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativa Mundial 2026</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Stats del torneo · ≥{SCOUTING_MIN_WC_MINUTES} min · radar y scatter por posición
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Select
            value={posFilter}
            onChange={(e) => setPosFilter(e.target.value as ScoutingPosition)}
          >
            {scoutingPositionOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Select
            value={profileA?.playerId ?? 0}
            onChange={(e) => setPlayerAId(Number(e.target.value))}
          >
            {filtered.map((p) => (
              <option key={p.playerId} value={p.playerId}>
                {p.name} ({p.team})
              </option>
            ))}
          </Select>
          <span className="self-center font-bold">VS</span>
          <Select
            value={profileB?.playerId ?? 0}
            onChange={(e) => setPlayerBId(Number(e.target.value))}
          >
            {filtered.map((p) => (
              <option key={p.playerId} value={p.playerId}>
                {p.name} ({p.team})
              </option>
            ))}
          </Select>
        </div>

        {isLoading && !isReady ? (
          <Skeleton className="h-[320px] w-full" />
        ) : filtered.length < 2 ? (
          <p className="text-sm text-muted-foreground">
            Se necesitan al menos 2 jugadores con ≥{SCOUTING_MIN_WC_MINUTES} min en esta posición.
          </p>
        ) : profileA && profileB ? (
          <>
            <div ref={chartRef} className="space-y-6">
              <div className="flex justify-end">
                <ChartExportButton
                  targetRef={chartRef}
                  filename={`comparativa-${profileA.name}-vs-${profileB.name}.png`}
                />
              </div>
              <ScoutingRadarWC
                profile={profileA}
                compareProfile={profileB}
                labelA={profileA.name.split(" ").pop() ?? profileA.name}
                labelB={profileB.name.split(" ").pop() ?? profileB.name}
              />
              <div>
                <p className="text-sm font-medium mb-2">
                  Scatter · {activeView?.label ?? "Resumen"} · {positionProfile.label}s ({filtered.length})
                </p>
                <ScoutingMetricViewPicker
                  position={posFilter}
                  value={metricView}
                  onChange={setMetricView}
                  className="mb-3"
                />
                <ScoutingScatter
                  profiles={filtered}
                  position={posFilter}
                  metricView={metricView}
                  highlightIds={highlightIds}
                />
                <ScoutingScatterLegend position={posFilter} metricView={metricView} />
              </div>
            </div>
            <ScoutingPer90Table profile={profileA} compareProfile={profileB} />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ComparePlayerCard profile={profileA} />
              <ComparePlayerCard profile={profileB} />
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ComparePlayerCard({ profile }: { profile: { name: string; photo: string; team: string; goals: number; assists: number; rating: number; minutes: number } }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <Image src={profile.photo} alt="" width={32} height={32} className="rounded-full" unoptimized />
        <span className="font-semibold">{profile.name}</span>
      </div>
      <p className="text-xs text-muted-foreground">{profile.team}</p>
      <p>Goles: {profile.goals}</p>
      <p>Asistencias: {profile.assists}</p>
      <p>Rating WC: {profile.rating.toFixed(1)}</p>
      <p>Minutos: {profile.minutes}&apos;</p>
    </div>
  );
}
