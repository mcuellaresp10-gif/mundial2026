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
import { getScatterPoint, scatterColorPercent } from "@/utils/worldCupScoutingMetrics";
import { cn } from "@/lib/utils";

const SCATTER_DOT_FILL = "#FCD116";
/** Jugador en revisión (clic) — distinto del dorado del resto. */
const SCATTER_SELECTED_FILL = "#38BDF8";
/** Jugadores del equipo filtrado. */
const SCATTER_TEAM_FILL = "#34D399";
/** Solo al pasar el mouse (más claro que el seleccionado). */
const SCATTER_HOVER_FILL = "#E0F2FE";

export interface ScatterPoint {
  id: number;
  name: string;
  photo: string;
  team: string;
  teamLogo: string;
  x: number;
  y: number;
  colorValue: number;
  starLabel?: string | null;
}

interface ScoutingScatterProps {
  profiles: ScoutingProfile[];
  position: ScoutingPosition;
  metricView?: ScoutingMetricViewId;
  scatterConfig?: ScatterConfig;
  /** Jugador seleccionado — punto azul permanente. */
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
  colorLabel,
}: {
  active?: boolean;
  payload?: { payload: ScatterPoint }[];
  xLabel: string;
  yLabel: string;
  colorLabel?: string;
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
      {colorLabel && (
        <p className="font-mono text-muted-foreground">
          {colorLabel}: {p.colorValue.toFixed(2)}
        </p>
      )}
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
          const { id, name, photo, team, teamLogo, x, y, color } = getScatterPoint(
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
            colorValue: color,
            starLabel: resolveStarLabel(p.playerId, p.name),
          };
        }),
    [profiles, position, config]
  );

  const colorExtent = useMemo(() => {
    if (!points.length) return { min: 0, max: 1 };
    let min = points[0].colorValue;
    let max = points[0].colorValue;
    for (const p of points) {
      if (p.colorValue < min) min = p.colorValue;
      if (p.colorValue > max) max = p.colorValue;
    }
    if (config.color.isRate) {
      return { min: Math.min(min, 0), max: Math.max(max, 100) };
    }
    return { min, max: max === min ? min + 1 : max };
  }, [points, config.color.isRate]);

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
            content={
              <CustomTooltip
                xLabel={config.x.label}
                yLabel={config.y.label}
                colorLabel={config.colorLabel}
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
              const isHovered = payload.id === hoverId;
              const isSelected =
                highlightSet.has(payload.id) || payload.id === selectedId;
              const isTeam =
                !isHovered && !isSelected && teamSet.has(payload.id);
              const isEmphasized = isHovered || isSelected || isTeam;
              const fill = isHovered
                ? SCATTER_HOVER_FILL
                : isSelected
                  ? SCATTER_SELECTED_FILL
                  : isTeam
                    ? SCATTER_TEAM_FILL
                    : scatterColorPercent(
                        payload.colorValue,
                        colorExtent.min,
                        colorExtent.max
                      );
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
                    r={isSelected ? 9 : isHovered ? 8 : isTeam ? 7 : 5}
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
                      isSelected
                        ? "#7DD3FC"
                        : isHovered
                          ? SCATTER_HOVER_FILL
                          : isTeam
                            ? SCATTER_TEAM_FILL
                            : "hsl(var(--background))"
                    }
                    strokeWidth={isSelected ? 3 : isEmphasized ? 2.5 : 1}
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
                style={{
                  background: `linear-gradient(90deg, ${scatterColorPercent(colorExtent.min, colorExtent.min, colorExtent.max)}, ${scatterColorPercent(colorExtent.max, colorExtent.min, colorExtent.max)})`,
                }}
                aria-hidden
              />
              {config.colorLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SCATTER_SELECTED_FILL }}
                aria-hidden
              />
              Seleccionado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full border border-sky-300"
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
