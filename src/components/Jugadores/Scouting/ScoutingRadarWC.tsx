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
import type { ScoutingPosition } from "@/config/positionMetricProfiles";
import { getPositionProfile } from "@/config/positionMetricProfiles";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";

interface ScoutingRadarWCProps {
  profile: ScoutingProfile;
  compareProfile?: ScoutingProfile | null;
  labelA?: string;
  labelB?: string;
  height?: number;
}

export function ScoutingRadarWC({
  profile,
  compareProfile,
  labelA,
  labelB = "Promedio del resto",
  height = 340,
}: ScoutingRadarWCProps) {
  const positionProfile = getPositionProfile(profile.position);

  const chartData = positionProfile.radarAxes.map((axis) => ({
    stat: axis.label,
    A: profile.radarValues[axis.key] ?? 0,
    B: compareProfile
      ? compareProfile.radarValues[axis.key] ?? profile.radarPeerAverage[axis.key] ?? 5
      : profile.radarPeerAverage[axis.key] ?? 5,
    help: axis.compositeHelp,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadar data={chartData}>
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="stat" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
        <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9 }} />
        <Radar
          name={labelA ?? profile.name}
          dataKey="A"
          stroke="hsl(var(--mundial-red))"
          fill="hsl(var(--mundial-red))"
          fillOpacity={0.35}
        />
        <Radar
          name={labelB}
          dataKey="B"
          stroke="hsl(var(--muted-foreground))"
          fill="hsl(var(--muted-foreground))"
          fillOpacity={0.15}
        />
        <Legend />
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
