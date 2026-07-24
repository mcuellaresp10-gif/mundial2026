"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  scoutingPositionOptions,
  type ScoutingPosition,
} from "@/config/positionMetricProfiles";
import type { ScoutingMetricViewId } from "@/config/scoutingMetricViews";
import { getMetricView, getMetricViewsForPosition } from "@/config/scoutingMetricViews";
import { profilesForPosition } from "@/utils/worldCupScoutingMetrics";
import { useWorldCupScoutingPool } from "@/hooks/useWorldCupScoutingPool";
import {
  ChartExportButton,
  ScoutingRadarWC,
  peerAverageRadarFromPool,
  syntheticPeerProfile,
  ScoutingScatter,
  ScoutingSelectedCard,
  ScoutingMetricViewPicker,
} from "@/components/Jugadores/Scouting";

export function ScoutingExplorer() {
  const [position, setPosition] = useState<ScoutingPosition>("M");
  const [metricView, setMetricView] = useState<ScoutingMetricViewId>("default");
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const {
    profiles,
    isLoading,
    isReady,
    isEnriching,
    selectionLabel,
    minMinutes,
    leagueIds,
  } = useWorldCupScoutingPool(true, {
    loadGoalkeepers: position === "G",
  });

  const leagueKey = leagueIds.join(",");

  useEffect(() => {
    setSelectedId(null);
    setTeamFilter("");
  }, [leagueKey]);

  const positionProfiles = useMemo(
    () => profilesForPosition(profiles, position),
    [profiles, position]
  );

  const teamOptions = useMemo(() => {
    const names = new Set(positionProfiles.map((p) => p.team).filter(Boolean));
    return [...names].sort((a, b) => a.localeCompare(b, "es"));
  }, [positionProfiles]);

  useEffect(() => {
    if (teamFilter && !teamOptions.includes(teamFilter)) {
      setTeamFilter("");
    }
  }, [teamFilter, teamOptions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return positionProfiles;
    return positionProfiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.team.toLowerCase().includes(q)
    );
  }, [positionProfiles, search]);

  const teamHighlightIds = useMemo(() => {
    if (!teamFilter) return [] as number[];
    return positionProfiles
      .filter((p) => p.team === teamFilter)
      .map((p) => p.playerId);
  }, [positionProfiles, teamFilter]);

  const selectedProfile = useMemo(() => {
    const id = selectedId ?? filtered[0]?.playerId ?? null;
    if (id == null) return null;
    return filtered.find((p) => p.playerId === id) ?? positionProfiles.find((p) => p.playerId === id) ?? null;
  }, [selectedId, filtered, positionProfiles]);

  const peerRadar = useMemo(() => {
    if (!selectedProfile) return null;
    const values = peerAverageRadarFromPool(
      positionProfiles,
      position,
      selectedProfile.playerId
    );
    if (!values) return null;
    return syntheticPeerProfile(values, position, selectedProfile);
  }, [selectedProfile, positionProfiles, position]);

  const positionLabel = scoutingPositionOptions().find((o) => o.value === position)?.label ?? position;
  const activeView = getMetricView(metricView, position);

  useEffect(() => {
    const available = getMetricViewsForPosition(position);
    if (!available.some((v) => v.id === metricView)) {
      setMetricView("default");
    }
  }, [position, metricView]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Posición</label>
          <Select
            value={position}
            onChange={(e) => {
              setPosition(e.target.value as ScoutingPosition);
              setSelectedId(null);
            }}
          >
            {scoutingPositionOptions().map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs text-muted-foreground block mb-1">Equipo</label>
          <Select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <option value="">Todos los equipos</option>
            {teamOptions.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs text-muted-foreground block mb-1">Buscar jugador</label>
          <Input
            placeholder="Nombre o equipo…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-sm text-muted-foreground pb-2">
          {filtered.length} de {positionProfiles.length} {positionLabel.toLowerCase()}
          {teamFilter ? ` · ${teamHighlightIds.length} de ${teamFilter}` : ""}
          {!isReady && isLoading && " · cargando pool…"}
          {isReady && isEnriching && " · actualizando porteros…"}
        </p>
      </div>

      <ScoutingMetricViewPicker
        position={position}
        value={metricView}
        onChange={setMetricView}
      />

      {isLoading && profiles.length === 0 ? (
        <Skeleton className="h-[480px] w-full" />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
          <div ref={chartRef} className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>
                    {activeView?.label ?? "Mapa"} · {positionLabel.toLowerCase()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-normal">
                    Pool {selectionLabel} · ≥{minMinutes} min · clic en un punto
                    para seleccionar
                    {teamFilter ? ` · resaltados: ${teamFilter}` : ""}
                  </p>
                </div>
                <ChartExportButton
                  targetRef={chartRef}
                  filename={`scouting-${position}-${metricView}-${leagueIds.join("-")}.png`}
                />
              </CardHeader>
              <CardContent className="space-y-2">
                <ScoutingScatter
                  profiles={filtered}
                  position={position}
                  metricView={metricView}
                  highlightIds={selectedProfile ? [selectedProfile.playerId] : []}
                  teamHighlightIds={teamHighlightIds}
                  teamHighlightLabel={teamFilter || null}
                  selectedId={selectedProfile?.playerId}
                  onSelect={setSelectedId}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <ScoutingSelectedCard profile={selectedProfile} />
            {selectedProfile && peerRadar && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mini radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScoutingRadarWC
                    profile={selectedProfile}
                    compareProfile={peerRadar}
                    labelA={selectedProfile.name.split(" ").pop()}
                    labelB="Promedio"
                    height={280}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
