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
} from "recharts";
import type { ScoutingPosition, ScatterConfig } from "@/config/positionMetricProfiles";
import type { ScoutingMetricViewId } from "@/config/scoutingMetricViews";
import { resolveScatterConfig } from "@/config/scoutingMetricViews";
import { resolveStarLabel } from "@/config/scoutingStarLabels";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";
import { getScatterPoint } from "@/utils/worldCupScoutingMetrics";
import { cn } from "@/lib/utils";

const SCATTER_DOT_FILL = "#FCD116";
/** Jugadores del equipo filtrado (distinto del dorado de selección). */
const SCATTER_TEAM_FILL = "#34D399";
/** Hover / señalamiento — contraste claro vs dorado. */
const SCATTER_HOVER_FILL = "#38BDF8";

export interface ScatterPoint {
  id: number;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  x: number;
  y: number;
  starLabel?: string | null;
}

interface ScoutingScatterProps {
  profiles: ScoutingProfile[];
  position: ScoutingPosition;
  metricView?: ScoutingMetricViewId;
  scatterConfig?: ScatterConfig;
  /** Jugador seleccionado — punto dorado grande. */
  highlightIds?: number[];
  /** Equipo filtrado — puntos verdes. */
  teamHighlightIds?: number[];
  teamHighlightLabel?: string | null;
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
}: {
  active?: boolean;
  payload?: { payload: ScatterPoint }[];
  xLabel: string;
  yLabel: string;
}) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border bg-card p-2 shadow-lg text-xs max-w-[200px]">
      <p className="font-semibold truncate">{p.name}</p>
      <p className="text-muted-foreground truncate">{p.team}</p>
      <p className="font-mono mt-1">
        {xLabel}: {p.x.toFixed(2)}
      </p>
      <p className="font-mono">{yLabel}: {p.y.toFixed(2)}</p>
    </div>
  );
}

export function ScoutingScatter({
  profiles,
  position,
  metricView = "default",
  scatterConfig: scatterConfigProp,
  highlightIds = [],
  teamHighlightIds = [],
  teamHighlightLabel = null,
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
        .map((p) => {
          const { id, name, photo, team, teamLogo, x, y } = getScatterPoint(
            p,
            config.x.key,
            config.y.key,
            config.color.key
          );
          return {
            id,
            name,
            photo,
            team,
            teamLogo,
            x,
            y,
            starLabel: resolveStarLabel(p.playerId, p.name),
          };
        }),
    [profiles, position, config]
  );

  const avgX = points.length ? points.reduce((s, p) => s + p.x, 0) / points.length : 0;
  const avgY = points.length ? points.reduce((s, p) => s + p.y, 0) / points.length : 0;

  const highlightSet = new Set(highlightIds);
  const teamSet = new Set(teamHighlightIds);

  return (
    <div className="space-y-2">
      <ResponsiveContainer width="100%" height={height}>
        <ScatterChart margin={{ top: 28, right: 16, bottom: 24, left: 8 }}>
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
          <ReferenceLine x={avgX} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          <ReferenceLine y={avgY} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
          <Tooltip
            content={<CustomTooltip xLabel={config.x.label} yLabel={config.y.label} />}
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
              const isHovered = payload.id === hoverId;
              const isSelected =
                highlightSet.has(payload.id) || payload.id === selectedId;
              const isTeam =
                !isHovered && !isSelected && teamSet.has(payload.id);
              const isEmphasized = isHovered || isSelected || isTeam;
              const fill = isHovered
                ? SCATTER_HOVER_FILL
                : isSelected
                  ? SCATTER_DOT_FILL
                  : isTeam
                    ? SCATTER_TEAM_FILL
                    : SCATTER_DOT_FILL;
              const label = payload.starLabel;
              const labelY = cy - (isEmphasized ? 14 : 11);
              return (
                <g>
                  {label && (
                    <text
                      x={cx}
                      y={labelY}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={600}
                      fill="hsl(var(--foreground))"
                      stroke="hsl(var(--background))"
                      strokeWidth={3}
                      paintOrder="stroke"
                      pointerEvents="none"
                    >
                      {label}
                    </text>
                  )}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 9 : isSelected ? 8 : isTeam ? 7 : 5}
                    fill={fill}
                    fillOpacity={
                      isHovered || isSelected
                        ? 1
                        : isTeam
                          ? 1
                          : teamSet.size > 0
                            ? 0.35
                            : 0.72
                    }
                    stroke={
                      isHovered
                        ? SCATTER_HOVER_FILL
                        : isSelected
                          ? "hsl(var(--mundial-gold))"
                          : isTeam
                            ? SCATTER_TEAM_FILL
                            : "hsl(var(--background))"
                    }
                    strokeWidth={isEmphasized ? 2.5 : 1}
                    style={{ cursor: onSelect ? "pointer" : "default" }}
                    onClick={() => onSelect?.(payload.id)}
                    onMouseEnter={() => setHoverId(payload.id)}
                    onMouseLeave={() => setHoverId(null)}
                  />
                </g>
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
          <span className="flex flex-wrap items-center gap-3 text-[10px]">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SCATTER_DOT_FILL }}
                aria-hidden
              />
              Seleccionado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SCATTER_HOVER_FILL }}
                aria-hidden
              />
              Al señalar
            </span>
            {teamHighlightLabel && (
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: SCATTER_TEAM_FILL }}
                  aria-hidden
                />
                {teamHighlightLabel}
              </span>
            )}
            <span>· estrellas etiquetadas</span>
          </span>
        </div>
      )}
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
