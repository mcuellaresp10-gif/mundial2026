"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBetPlayEvolution } from "@/hooks/useBetPlayEvolution";
import { translateTeamName } from "@/utils/teamNames";
import { cn } from "@/lib/utils";
import {
  buildChartRowsFromPoints,
  buildChartRowsFromProbs,
  colorForTeamId,
  type BetPlayProbMetric,
  type BetPlayTeamMeta,
} from "@/utils/betPlayEvolution";

const METRIC_TABS: { id: BetPlayProbMetric; label: string }[] = [
  { id: "probCuadrangulares", label: "Cuadrangulares" },
  { id: "probFinal", label: "Final" },
  { id: "probChampion", label: "Título" },
];

function TeamPills({
  teams,
  highlightId,
  onToggle,
}: {
  teams: BetPlayTeamMeta[];
  highlightId: number | null;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {teams.map((t) => {
        const active = highlightId == null || highlightId === t.teamId;
        const color = colorForTeamId(t.teamId);
        return (
          <button
            key={t.teamId}
            type="button"
            onClick={() => onToggle(t.teamId)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[11px] transition-opacity",
              active ? "opacity-100" : "opacity-35"
            )}
            style={{ borderColor: color, color }}
          >
            {translateTeamName(t.teamName)}
          </button>
        );
      })}
    </div>
  );
}

function EvolutionTooltip({
  active,
  payload,
  label,
  teams,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number; color?: string }>;
  label?: string;
  teams: BetPlayTeamMeta[];
  unit: "%" | "pts";
}) {
  if (!active || !payload?.length) return null;
  const byId = new Map(teams.map((t) => [String(t.teamId), t]));
  const sorted = [...payload]
    .filter((p) => p.dataKey && typeof p.value === "number")
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  return (
    <div className="max-h-64 overflow-y-auto rounded-lg border bg-card p-2 text-xs shadow-lg min-w-[180px]">
      <p className="mb-1.5 font-semibold">{label}</p>
      <ul className="space-y-0.5">
        {sorted.map((p, i) => {
          const team = byId.get(String(p.dataKey));
          const name = team ? translateTeamName(team.teamName) : p.dataKey;
          return (
            <li key={String(p.dataKey)} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-muted-foreground tabular-nums w-5">
                {i + 1}º
              </span>
              <span className="truncate flex-1">{name}</span>
              <span className="font-mono tabular-nums">
                {unit === "%"
                  ? `${(p.value ?? 0).toFixed(1)}%`
                  : `${p.value ?? 0}`}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MultiTeamLineChart({
  rows,
  teams,
  highlightId,
  yDomain,
  unit,
  yTickFormatter,
}: {
  rows: Record<string, string | number>[];
  teams: BetPlayTeamMeta[];
  highlightId: number | null;
  yDomain?: [number | "auto", number | "auto"];
  unit: "%" | "pts";
  yTickFormatter?: (v: number) => string;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Sin datos de jornadas aún.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10 }}
          domain={yDomain}
          tickFormatter={yTickFormatter}
          width={40}
        />
        <Tooltip
          content={(props) => (
            <EvolutionTooltip
              active={props.active}
              payload={props.payload as Array<{
                dataKey?: string;
                value?: number;
                color?: string;
              }>}
              label={String(props.label ?? "")}
              teams={teams}
              unit={unit}
            />
          )}
        />
        {teams.map((t) => {
          const dimmed = highlightId != null && highlightId !== t.teamId;
          const color = colorForTeamId(t.teamId);
          return (
            <Line
              key={t.teamId}
              type="monotone"
              dataKey={String(t.teamId)}
              name={translateTeamName(t.teamName)}
              stroke={color}
              strokeWidth={dimmed ? 1 : highlightId === t.teamId ? 2.5 : 1.5}
              strokeOpacity={dimmed ? 0.18 : 1}
              dot={false}
              isAnimationActive={false}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function BetPlayEvolutionCharts() {
  const {
    enabled,
    teams,
    pointsSeries,
    probSeries,
    progress,
    phase,
    isLoading,
    isComputingProbs,
    hasPoints,
    hasProbs,
  } = useBetPlayEvolution();

  const [metric, setMetric] = useState<BetPlayProbMetric>("probCuadrangulares");
  const [highlightId, setHighlightId] = useState<number | null>(null);

  const teamIds = useMemo(() => teams.map((t) => t.teamId), [teams]);

  const probRows = useMemo(
    () => buildChartRowsFromProbs(probSeries, teamIds, metric),
    [probSeries, teamIds, metric]
  );

  const pointsRows = useMemo(
    () => buildChartRowsFromPoints(pointsSeries, teamIds),
    [pointsSeries, teamIds]
  );

  if (!enabled) return null;

  const toggleHighlight = (id: number) => {
    setHighlightId((prev) => (prev === id ? null : id));
  };

  const phaseLabel = phase === "apertura" ? "Apertura" : "Clausura";

  if (isLoading && !hasPoints && !hasProbs) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle>Evolución de probabilidad</CardTitle>
              <p className="text-sm text-muted-foreground font-normal mt-1">
                {phaseLabel} · click un equipo para resaltar ·{" "}
                {teams.length} equipos
                {isComputingProbs
                  ? ` · calculando ${progress.done}/${progress.total} jornadas…`
                  : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {METRIC_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMetric(tab.id)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                    metric === tab.id
                      ? "border-mundial-gold/50 bg-mundial-gold/15 text-foreground"
                      : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <TeamPills
            teams={teams}
            highlightId={highlightId}
            onToggle={toggleHighlight}
          />
        </CardHeader>
        <CardContent>
          {hasProbs ? (
            <MultiTeamLineChart
              rows={probRows}
              teams={teams}
              highlightId={highlightId}
              yDomain={[0, 100]}
              unit="%"
              yTickFormatter={(v) => `${v}%`}
            />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {isComputingProbs
                ? `Reconstruyendo probs jornada a jornada (${progress.done}/${progress.total})…`
                : "Aún no hay jornadas finalizadas para estimar evolución."}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div>
            <CardTitle>Evolución del puntaje</CardTitle>
            <p className="text-sm text-muted-foreground font-normal mt-1">
              Puntos acumulados {phaseLabel.toLowerCase()} · click un equipo
              para resaltar
            </p>
          </div>
          <TeamPills
            teams={teams}
            highlightId={highlightId}
            onToggle={toggleHighlight}
          />
        </CardHeader>
        <CardContent>
          {hasPoints ? (
            <MultiTeamLineChart
              rows={pointsRows}
              teams={teams}
              highlightId={highlightId}
              unit="pts"
            />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Sin partidos finalizados en esta fase.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
