"use client";

import { useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Player } from "@/types";
import { getPositionProfile } from "@/config/positionMetricProfiles";
import type { ScoutingMetricViewId } from "@/config/scoutingMetricViews";
import { getMetricView } from "@/config/scoutingMetricViews";
import {
  SCOUTING_MIN_LEAGUE_MINUTES,
  SCOUTING_MIN_WC_MINUTES,
  playerHasScoutingEligibleWc,
} from "@/utils/worldCupScoutingMetrics";
import { useScoutingProfile } from "@/hooks/useWorldCupScoutingPool";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { LEAGUE_ID } from "@/lib/utils";
import {
  ChartExportButton,
  ScoutingRadarWC,
  peerAverageRadarFromPool,
  syntheticPeerProfile,
  ScoutingScatter,
  ScoutingPer90Table,
  ScoutingPercentileBar,
  ScoutingSummaryHeader,
  ScoutingMetricViewPicker,
} from "@/components/Jugadores/Scouting";

interface WorldCupScoutingTabProps {
  player: Player;
}

export function WorldCupScoutingTab({ player }: WorldCupScoutingTabProps) {
  const { league, leagueIds } = useActiveLeague();
  const minMinutes =
    leagueIds.length === 1 && leagueIds[0] === LEAGUE_ID
      ? SCOUTING_MIN_WC_MINUTES
      : SCOUTING_MIN_LEAGUE_MINUTES;
  const { profile, isLoading, isReady, profiles } = useScoutingProfile(player.player.id, true);
  const [metricView, setMetricView] = useState<ScoutingMetricViewId>("default");
  const chartRef = useRef<HTMLDivElement>(null);

  const positionProfiles = useMemo(() => {
    if (!profile) return [];
    return profiles.filter((p) => p.position === profile.position);
  }, [profile, profiles]);

  const peerRadar = useMemo(() => {
    if (!profile) return null;
    const values = peerAverageRadarFromPool(positionProfiles, profile.position, profile.playerId);
    if (!values) return null;
    return syntheticPeerProfile(values, profile.position, profile);
  }, [profile, positionProfiles]);

  const eligible = playerHasScoutingEligibleWc(
    player,
    league.id,
    league.defaultSeason
  );

  if (!eligible && !isLoading && !profile) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Análisis avanzado disponible solo para jugadores con al menos {minMinutes} minutos
          en {league.shortName}. Este jugador aún no alcanza ese umbral.
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !profile) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-[340px] w-full" />
        <Skeleton className="h-[360px] w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No hay datos de scouting para este jugador en la selección actual de ligas.
        </CardContent>
      </Card>
    );
  }

  const positionProfile = getPositionProfile(profile.position);
  const compositeAxis = positionProfile.radarAxes.find((a) => a.isComposite);
  const activeView = getMetricView(metricView, profile.position);

  return (
    <div className="space-y-6">
      <ScoutingSummaryHeader profile={profile} poolSize={positionProfiles.length} />

      <div ref={chartRef} className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Radar vs pares de la competición</CardTitle>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {positionProfile.label}s con ≥{minMinutes} min · escala 0–10 (5 = promedio del pool)
                {!isReady && " · pool aún cargando"}
              </p>
            </div>
            <ChartExportButton targetRef={chartRef} filename={`${profile.name}-radar-scouting.png`} />
          </CardHeader>
          <CardContent>
            <ScoutingRadarWC
              profile={profile}
              compareProfile={peerRadar}
              labelA={profile.name}
              labelB="Promedio del resto"
            />
            {compositeAxis?.compositeHelp && (
              <p className="text-xs text-muted-foreground mt-3">
                <span className="font-medium">{compositeAxis.label}:</span> {compositeAxis.compositeHelp}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Scatter · {activeView?.label ?? "Resumen"} · {positionProfile.label}s
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ScoutingMetricViewPicker
              position={profile.position}
              value={metricView}
              onChange={setMetricView}
            />
            <ScoutingScatter
              profiles={positionProfiles}
              position={profile.position}
              metricView={metricView}
              highlightIds={[profile.playerId]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Percentiles clave</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoutingPercentileBar profile={profile} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas por 90 minutos</CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Percentil vs {positionProfiles.length} {positionProfile.label.toLowerCase()}s del pool
            </p>
          </CardHeader>
          <CardContent>
            <ScoutingPer90Table profile={profile} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
