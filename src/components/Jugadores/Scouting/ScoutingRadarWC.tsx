"use client";

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { MetricKey, ScoutingPosition } from "@/config/positionMetricProfiles";
import { getPositionProfile } from "@/config/positionMetricProfiles";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";
import { CHART_GOLD } from "@/components/Estadisticas/charts/chartTheme";

const RADAR_PLAYER = {
  stroke: CHART_GOLD,
  fill: CHART_GOLD,
  fillOpacity: 0.25,
  strokeWidth: 2,
};

const RADAR_COMPARE = {
  stroke: "hsl(var(--muted-foreground))",
  fill: "hsl(var(--muted-foreground))",
  fillOpacity: 0.12,
  strokeWidth: 1.5,
};

const KEY_LABELS: Partial<Record<MetricKey, string>> = {
  dribblesSuccess90: "Regates/90",
  duelsWon90: "Duelos/90",
  keyPasses90: "Pases clave",
  shots90: "Tiros/90",
  shotsOn90: "A puerta/90",
  foulsDrawn90: "Faltas rec.",
  tackles90: "Entradas/90",
  offensiveIndex: "Ofensivo",
  goals90: "Goles/90",
  assists90: "Asist./90",
  finishingIndex: "Finalización",
  interceptions90: "Intercep./90",
  duelWinRate: "% duelos",
  blocks90: "Bloqueos/90",
  foulsCommitted90: "Faltas",
  defensiveIndex: "Defensivo",
  saves90: "Paradas/90",
  conceded90: "Recibidos/90",
  savePercentage: "% paro",
  passes90: "Pases/90",
  passAccuracy: "% pase",
  goalkeeperIndex: "Portero",
  dribbleSuccessRate: "% regate",
  dribblesAttempts90: "Intentos/90",
  shotOnTargetRate: "% a puerta",
};

interface ScoutingRadarWCProps {
  profile: ScoutingProfile;
  compareProfile?: ScoutingProfile | null;
  labelA?: string;
  labelB?: string;
  height?: number;
  /** Ejes del rol (si no, radar de posición por defecto). */
  axisKeys?: MetricKey[];
}

export function ScoutingRadarWC({
  profile,
  compareProfile,
  labelA,
  labelB = "Promedio del resto",
  height = 340,
  axisKeys,
}: ScoutingRadarWCProps) {
  const positionProfile = getPositionProfile(profile.position);
  const axes =
    axisKeys && axisKeys.length > 0
      ? axisKeys.map((key) => ({
          key,
          label: KEY_LABELS[key] ?? key.replace(/90$/, "/90"),
        }))
      : positionProfile.radarAxes.map((a) => ({ key: a.key, label: a.label }));

  const chartData = axes.map((axis) => {
    const fromRadar = profile.radarValues[axis.key];
    const fromPct = profile.percentiles[axis.key];
    const A =
      fromRadar != null
        ? fromRadar
        : fromPct != null
          ? Math.round((fromPct / 10) * 10) / 10
          : 5;
    const B =
      compareProfile?.radarValues[axis.key] ??
      (compareProfile?.percentiles[axis.key] != null
        ? Math.round(((compareProfile.percentiles[axis.key] as number) / 10) * 10) / 10
        : profile.radarPeerAverage[axis.key] ?? 5);
    return { stat: axis.label, A, B };
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadar data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="stat" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
        />
        <Radar name={labelA ?? profile.name} dataKey="A" {...RADAR_PLAYER} />
        <Radar name={labelB} dataKey="B" {...RADAR_COMPARE} />
        <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--muted-foreground))" }} />
      </RechartsRadar>
    </ResponsiveContainer>
  );
}

export function peerAverageRadarFromPool(
  profiles: ScoutingProfile[],
  position: ScoutingPosition,
  excludeId?: number
): Record<string, number> | null {
  const peers = profiles.filter(
    (p) => p.position === position && p.playerId !== excludeId
  );
  if (peers.length === 0) return null;

  const positionProfile = getPositionProfile(position);
  const out: Record<string, number> = {};

  for (const axis of positionProfile.radarAxes) {
    const values = peers.map((p) => p.radarValues[axis.key] ?? 0);
    out[axis.key] = Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10;
  }

  return out;
}

/** Perfil sintético solo con radarValues para comparar vs promedio del pool. */
export function syntheticPeerProfile(
  radarValues: Record<string, number>,
  position: ScoutingPosition,
  profile: ScoutingProfile
): ScoutingProfile {
  return { ...profile, radarValues, playerId: -1, name: "Promedio del resto" };
}
