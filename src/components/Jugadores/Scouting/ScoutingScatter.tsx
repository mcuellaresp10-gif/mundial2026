"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ZAxis,
} from "recharts";
import type { ScoutingPosition, ScatterConfig } from "@/config/positionMetricProfiles";
import type { ScoutingMetricViewId } from "@/config/scoutingMetricViews";
import { resolveScatterConfig } from "@/config/scoutingMetricViews";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";
import { getScatterPoint, scatterColorPercent } from "@/utils/worldCupScoutingMetrics";
import { cn } from "@/lib/utils";

export interface ScatterPoint {
  id: number;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  x: number;
  y: number;
  color: number;
}

interface ScoutingScatterProps {
  profiles: ScoutingProfile[];
  position: ScoutingPosition;
  metricView?: ScoutingMetricViewId;
  scatterConfig?: ScatterConfig;
  highlightIds?: number[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
  height?: number;
  showLegend?: boolean;
}

function CustomTooltip({
  active,
  payload,
  xLabel,
  yLabel,
  colorLabel,
  colorIsRate,
}: {
  active?: boolean;
  payload?: { payload: ScatterPoint }[];
  xLabel: string;
  yLabel: string;
  colorLabel: string;
  colorIsRate?: boolean;
}) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0].payload;
  const colorDisplay = colorIsRate ? `${p.color.toFixed(1)}%` : p.color.toFixed(2);
  return (
    <div className="rounded-lg border bg-card p-2 shadow-lg text-xs max-w-[200px]">
      <p className="font-semibold truncate">{p.name}</p>
      <p className="text-muted-foreground truncate">{p.team}</p>
      <p className="font-mono mt-1">
        {xLabel}: {p.x.toFixed(2)}
      </p>
      <p className="font-mono">{yLabel}: {p.y.toFixed(2)}</p>
      <p className="font-mono text-muted-foreground">
        {colorLabel}: {colorDisplay}
      </p>
    </div>
  );
}

export function ScoutingScatter({
  profiles,
  position,
  metricView = "default",
  scatterConfig: scatterConfigProp,
  highlightIds = [],
  selectedId,
  onSelect,
  height = 360,
  showLegend = true,
}: ScoutingScatterProps) {
  const config =
    scatterConfigProp ?? resolveScatterConfig(position, metricView);
  const [hoverId, setHoverId] = useState<number | null>(null);

  const points: ScatterPoint[] = useMemo(
    () =>
      profiles
        .filter((p) => p.position === position)
        .map((p) => getScatterPoint(p, config.x.key, config.y.key, config.color.key)),
    [profiles, position, config]
  );

  const avgX = points.length ? points.reduce((s, p) => s + p.x, 0) / points.length : 0;
  const avgY = points.length ? points.reduce((s, p) => s + p.y, 0) / points.length : 0;
  const colorMin = points.length ? Math.min(...points.map((p) => p.color)) : 0;
  const colorMax = points.length ? Math.max(...points.map((p) => p.color)) : 100;
  const colorIsRate = config.color.isRate ?? false;

  const highlightSet = new Set(highlightIds);
  const activeId = selectedId ?? hoverId;

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 12, right: 12, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            dataKey="x"
            name={config.x.label}
            tick={{ fontSize: 10 }}
            label={{ value: config.x.label, position: "bottom", offset: 0, fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={config.y.label}
            tick={{ fontSize: 10 }}
            label={{ value: config.y.label, angle: -90, position: "insideLeft", fontSize: 11 }}
          />
          <ZAxis type="number" dataKey="color" range={[40, 120]} />
          <ReferenceLine x={avgX} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          <ReferenceLine y={avgY} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          <Tooltip
            content={
              <CustomTooltip
                xLabel={config.x.label}
                yLabel={config.y.label}
                colorLabel={config.colorLabel}
                colorIsRate={colorIsRate}
              />
            }
            cursor={{ strokeDasharray: "3 3" }}
          />
          <Scatter
            data={points}
            shape={(props: {
              cx?: number;
              cy?: number;
              payload?: ScatterPoint;
            }) => {
              const { cx = 0, cy = 0, payload } = props;
              if (!payload) return <g />;
              const isHighlight = highlightSet.has(payload.id) || payload.id === activeId;
              const fill = scatterColorPercent(
                payload.color,
                colorIsRate ? 0 : colorMin,
                colorIsRate ? 100 : colorMax
              );
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHighlight ? 8 : 5}
                  fill={fill}
                  stroke={isHighlight ? "hsl(var(--mundial-gold))" : "hsl(var(--background))"}
                  strokeWidth={isHighlight ? 2.5 : 1}
                  style={{ cursor: onSelect ? "pointer" : "default" }}
                  onClick={() => onSelect?.(payload.id)}
                  onMouseEnter={() => setHoverId(payload.id)}
                  onMouseLeave={() => setHoverId(null)}
                />
              );
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>
      {showLegend && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {points.length} jugadores · prom. X {avgX.toFixed(2)} · prom. Y {avgY.toFixed(2)}
          </span>
          <span>{config.colorLabel}</span>
        </div>
      )}
    </div>
  );
}

export function ScoutingScatterLegend({
  position,
  metricView = "default",
  scatterConfig,
}: {
  position: ScoutingPosition;
  metricView?: ScoutingMetricViewId;
  scatterConfig?: ScatterConfig;
}) {
  const config = scatterConfig ?? resolveScatterConfig(position, metricView);
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="inline-block h-3 w-16 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" />
      <span>{config.colorLabel}</span>
    </div>
  );
}

export function ScoutingSelectedCard({
  profile,
  className,
}: {
  profile: ScoutingProfile | null;
  className?: string;
}) {
  if (!profile) {
    return (
      <div className={cn("rounded-xl border p-4 text-sm text-muted-foreground", className)}>
        Selecciona un jugador en el gráfico
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Image
          src={profile.photo}
          alt=""
          width={48}
          height={48}
          className="rounded-full border"
          unoptimized
        />
        <div className="min-w-0">
          <p className="font-semibold truncate">{profile.name}</p>
          <p className="text-sm text-muted-foreground truncate">{profile.team}</p>
        </div>
      </div>
      <p className="text-sm font-mono">
        {profile.goals}G · {profile.assists}A · {profile.rating.toFixed(1)} rating · {profile.minutes}&apos;
      </p>
      <Link
        href={`/jugadores/${profile.playerId}`}
        className="text-sm text-mundial-gold hover:underline"
      >
        Ver perfil completo
      </Link>
    </div>
  );
}
