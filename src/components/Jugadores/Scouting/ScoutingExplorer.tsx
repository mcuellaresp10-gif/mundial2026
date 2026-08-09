"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  scoutingPositionOptions,
  type ScoutingPosition,
} from "@/config/positionMetricProfiles";
import type { ScoutingMetricViewId } from "@/config/scoutingMetricViews";
import {
  getMetricView,
  getMetricViewsForPosition,
  resolveScatterConfig,
} from "@/config/scoutingMetricViews";
import {
  getRoleTemplate,
  defaultRoleIdForPosition,
  rolesForPosition,
  type ScoutingRoleId,
} from "@/config/scoutingRoleProfiles";
import { profilesForPosition } from "@/utils/worldCupScoutingMetrics";
import { filterProfilesByThresholds } from "@/utils/scoutingInsights";
import { useWorldCupScoutingPool } from "@/hooks/useWorldCupScoutingPool";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { useLeagueStore } from "@/stores/useLeagueStore";
import { getLeagueById, getLeagueBySlug } from "@/data/americasLeagues";
import { normalizePlayerLabelName } from "@/config/scoutingStarLabels";
import {
  ChartExportButton,
  ScoutingRadarWC,
  peerAverageRadarFromPool,
  syntheticPeerProfile,
  ScoutingScatter,
  ScoutingSelectedCard,
  ScoutingMetricViewPicker,
  ScoutingPer90Table,
  ScoutingPercentileBar,
} from "@/components/Jugadores/Scouting";
import { ScoutingRankings, type RankMetricKey } from "./ScoutingRankings";
import { ScoutingFiltersBar, type ScoutingThresholdFilters } from "./ScoutingFiltersBar";
import {
  ScoutingScoutCard,
  ScoutingDataHonestyBadge,
  ScoutingMarketPanel,
} from "./ScoutingScoutCard";
import { ScoutingSimilarList } from "./ScoutingSimilarList";
import {
  ScoutingShortlistPanel,
  ScoutingShortlistToggle,
} from "./ScoutingShortlistPanel";
import {
  ScoutingPhaseNotice,
  ScoutingFormPlaceholder,
  ScoutingTimeSeries,
  ScoutingPartnerRoadmap,
} from "./ScoutingPhaseNotice";
import { buildAnchoredScoutBrief } from "@/utils/scoutingInsights";

function parsePos(v: string | null): ScoutingPosition | null {
  if (v === "G" || v === "D" || v === "M" || v === "F") return v;
  return null;
}

export function ScoutingExplorer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { phase: leaguePhase, supportsPhaseFilter: phaseOk, leagues } =
    useActiveLeague();
  const setLeagueSlugs = useLeagueStore((s) => s.setLeagueSlugs);

  const initialPos = parsePos(searchParams.get("pos")) ?? "M";
  const [position, setPosition] = useState<ScoutingPosition>(initialPos);
  const [metricView, setMetricView] = useState<ScoutingMetricViewId>(
    () => (searchParams.get("view") as ScoutingMetricViewId) || "default"
  );
  const [roleId, setRoleId] = useState<ScoutingRoleId>(
    () =>
      (searchParams.get("role") as ScoutingRoleId) ||
      defaultRoleIdForPosition(initialPos)
  );
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const raw = searchParams.get("player");
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  });
  const [rankMetric, setRankMetric] = useState<RankMetricKey>("keyPasses90");
  const [benchmarkScope, setBenchmarkScope] = useState<
    "league" | "conmebol" | "position"
  >("position");
  const [thresholds, setThresholds] = useState<ScoutingThresholdFilters>({
    minMinutes: 0,
    minGoals: 0,
    minAssists: 0,
    minRating: 0,
  });
  const chartRef = useRef<HTMLDivElement>(null);

  const {
    profiles,
    isLoading,
    isReady,
    isEmpty,
    isEnriching,
    selectionLabel,
    minMinutes,
    leagueIds,
    searchActive,
  } = useWorldCupScoutingPool(true, {
    loadGoalkeepers: position === "G",
    searchQuery: search,
  });

  const leagueKey = leagueIds.join(",");
  const role = getRoleTemplate(position, roleId);

  useEffect(() => {
    setTeamFilter("");
  }, [leagueKey]);

  useEffect(() => {
    const valid = rolesForPosition(position).some((r) => r.id === roleId);
    if (!valid) setRoleId(defaultRoleIdForPosition(position));
  }, [position, roleId]);

  useEffect(() => {
    const suggested = getRoleTemplate(position, roleId).suggestedMin;
    if (!suggested) return;
    setThresholds((prev) => ({
      ...prev,
      minGoals: suggested.goals ?? prev.minGoals,
      minAssists: suggested.assists ?? prev.minAssists,
      minRating: suggested.rating ?? prev.minRating,
      minMinutes: suggested.minutes ?? prev.minMinutes,
    }));
  }, [roleId, position]);

  useEffect(() => {
    const leagueParam = searchParams.get("league");
    if (!leagueParam) return;
    const byId = Number(leagueParam);
    const league =
      Number.isFinite(byId) && byId > 0
        ? getLeagueById(byId)
        : getLeagueBySlug(leagueParam);
    if (league && league.slug !== "mundial-2026") {
      setLeagueSlugs([league.slug]);
    }
    // solo al montar / cuando cambia el param externo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("league")]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pos", position);
    params.set("view", metricView);
    params.set("role", roleId);
    if (leagues[0]) params.set("league", String(leagues[0].id));
    if (selectedId) params.set("player", String(selectedId));
    else params.delete("player");
    const next = params.toString();
    if (next !== searchParams.toString()) {
      router.replace(`${pathname}?${next}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, metricView, roleId, selectedId, pathname, leagueKey]);

  const positionProfiles = useMemo(
    () => profilesForPosition(profiles, position),
    [profiles, position]
  );

  const thresholded = useMemo(
    () =>
      filterProfilesByThresholds(positionProfiles, {
        minMinutes: Math.max(thresholds.minMinutes, 0),
        minGoals: thresholds.minGoals,
        minAssists: thresholds.minAssists,
        minRating: thresholds.minRating,
      }),
    [positionProfiles, thresholds]
  );

  const teamOptions = useMemo(() => {
    const names = new Set(thresholded.map((p) => p.team).filter(Boolean));
    return [...names].sort((a, b) => a.localeCompare(b, "es"));
  }, [thresholded]);

  useEffect(() => {
    if (teamFilter && !teamOptions.includes(teamFilter)) setTeamFilter("");
  }, [teamFilter, teamOptions]);

  const filtered = useMemo(() => {
    const q = normalizePlayerLabelName(search);
    let list = thresholded;
    if (q) {
      list = list.filter((p) => {
        const name = normalizePlayerLabelName(p.name);
        const team = normalizePlayerLabelName(p.team);
        return name.includes(q) || team.includes(q);
      });
    }
    return list;
  }, [thresholded, search]);

  const teamHighlightIds = useMemo(() => {
    if (!teamFilter) return [] as number[];
    return thresholded.filter((p) => p.team === teamFilter).map((p) => p.playerId);
  }, [thresholded, teamFilter]);

  const selectedProfile = useMemo(() => {
    const id = selectedId ?? filtered[0]?.playerId ?? null;
    if (id == null) return null;
    return (
      filtered.find((p) => p.playerId === id) ??
      positionProfiles.find((p) => p.playerId === id) ??
      null
    );
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

  const positionLabel =
    scoutingPositionOptions().find((o) => o.value === position)?.label ?? position;
  const activeView = getMetricView(metricView, position);
  const scatterConfig = role.scatter ?? resolveScatterConfig(position, metricView);

  useEffect(() => {
    const available = getMetricViewsForPosition(position);
    if (!available.some((v) => v.id === metricView)) setMetricView("default");
  }, [position, metricView]);

  useEffect(() => {
    if (role.focusKeys[0]) setRankMetric(role.focusKeys[0]);
  }, [roleId, position]);

  const brief = selectedProfile ? buildAnchoredScoutBrief(selectedProfile) : [];

  const statusText = [
    `${filtered.length} de ${positionProfiles.length} ${positionLabel.toLowerCase()}`,
    teamFilter ? `${teamHighlightIds.length} de ${teamFilter}` : null,
    !isReady && isLoading ? "cargando…" : null,
    isReady && isEnriching ? "ampliando…" : null,
    searchActive ? "búsqueda API" : null,
    isEmpty && !isLoading ? "sin datos" : null,
    thresholds.minMinutes > minMinutes &&
    filtered.length === 0 &&
    positionProfiles.length > 0
      ? `filtro ${thresholds.minMinutes}' oculta todos`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const roleHint =
    `${role.label}: ${role.description}` +
    (benchmarkScope !== "position"
      ? ` · Benchmark: ${benchmarkScope} (percentiles del pool activo)`
      : " · Percentiles vs misma posición");

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <ScoutingDataHonestyBadge />
        <ScoutingPhaseNotice phase={leaguePhase} supportsPhase={phaseOk} />
      </div>

      <ScoutingFiltersBar
        position={position}
        onPositionChange={(next) => {
          setPosition(next);
          setRoleId(defaultRoleIdForPosition(next));
          setSelectedId(null);
        }}
        roleId={roleId}
        onRoleChange={setRoleId}
        teamFilter={teamFilter}
        onTeamFilterChange={setTeamFilter}
        teamOptions={teamOptions}
        search={search}
        onSearchChange={setSearch}
        thresholds={thresholds}
        onThresholdsChange={setThresholds}
        benchmarkScope={benchmarkScope}
        onBenchmarkScopeChange={setBenchmarkScope}
        statusText={statusText}
        roleHint={roleHint}
      />

      <ScoutingMetricViewPicker
        position={position}
        value={metricView}
        onChange={setMetricView}
      />

      {isLoading && profiles.length === 0 ? (
        <Skeleton className="h-[480px] w-full" />
      ) : (
        <div className="space-y-6">
          {/* 1 · Descubrimiento */}
          <section className="space-y-4" aria-label="Mapa y rankings">
            <div ref={chartRef}>
              <Card>
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                  <div>
                    <CardTitle>
                      {activeView?.label ?? "Mapa"} · {positionLabel.toLowerCase()}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-normal">
                      Pool {selectionLabel} · ≥{minMinutes} min
                      {searchActive ? " (búsqueda ≥1 min)" : ""} · clic para
                      seleccionar
                      {teamFilter ? ` · resaltados: ${teamFilter}` : ""}
                    </p>
                  </div>
                  <ChartExportButton
                    targetRef={chartRef}
                    filename={`scouting-${position}-${metricView}-${leagueIds.join("-")}.png`}
                  />
                </CardHeader>
                <CardContent>
                  <ScoutingScatter
                    profiles={filtered}
                    position={position}
                    metricView={metricView}
                    scatterConfig={scatterConfig}
                    highlightIds={
                      selectedProfile ? [selectedProfile.playerId] : []
                    }
                    teamHighlightIds={teamHighlightIds}
                    teamHighlightLabel={teamFilter || null}
                    selectedId={selectedProfile?.playerId}
                    onSelect={setSelectedId}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoutingRankings
                profiles={filtered}
                metricKey={rankMetric}
                onMetricChange={setRankMetric}
                selectedId={selectedProfile?.playerId ?? null}
                onSelect={setSelectedId}
              />
              <ScoutingShortlistPanel onSelect={setSelectedId} />
            </div>
          </section>

          {/* 2 · Ficha del seleccionado (ancho completo, no rail derecho) */}
          <section className="space-y-4" aria-label="Jugador seleccionado">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b pb-2">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Jugador seleccionado
                </h2>
                <p className="text-xs text-muted-foreground">
                  Radar, percentiles, forma y ficha exportable
                </p>
              </div>
              {selectedProfile && (
                <ScoutingShortlistToggle profile={selectedProfile} />
              )}
            </div>

            {!selectedProfile ? (
              <ScoutingSelectedCard profile={null} />
            ) : (
              <div className="space-y-4">
                <ScoutingSelectedCard profile={selectedProfile} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {peerRadar && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Radar · {role.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScoutingRadarWC
                          profile={selectedProfile}
                          compareProfile={peerRadar}
                          labelA={selectedProfile.name.split(" ").pop()}
                          labelB="Promedio"
                          height={300}
                          axisKeys={role.focusKeys}
                        />
                      </CardContent>
                    </Card>
                  )}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Per 90 + percentiles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ScoutingPer90Table profile={selectedProfile} />
                      <ScoutingPercentileBar profile={selectedProfile} />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Brief</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        {brief.map((line) => (
                          <li key={line} className="leading-snug">
                            · {line}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <ScoutingSimilarList
                    profile={selectedProfile}
                    peers={positionProfiles}
                    focusKeys={role.focusKeys}
                    onSelect={setSelectedId}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ScoutingFormPlaceholder profile={selectedProfile} />
                  <ScoutingTimeSeries profile={selectedProfile} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ScoutingScoutCard
                    profile={selectedProfile}
                    peers={positionProfiles}
                    position={position}
                  />
                  <ScoutingMarketPanel profile={selectedProfile} />
                </div>
              </div>
            )}
          </section>

          <ScoutingPartnerRoadmap />
        </div>
      )}
    </div>
  );
}
