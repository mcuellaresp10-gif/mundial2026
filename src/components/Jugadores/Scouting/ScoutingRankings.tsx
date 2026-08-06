"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricKey } from "@/config/positionMetricProfiles";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";
import { rankProfilesByMetric } from "@/utils/scoutingInsights";
import { cn } from "@/lib/utils";

export type RankMetricKey = MetricKey | "rating";

const RANK_OPTIONS: { key: RankMetricKey; label: string }[] = [
  { key: "goals90", label: "Goles/90" },
  { key: "assists90", label: "Asistencias/90" },
  { key: "keyPasses90", label: "Pases clave/90" },
  { key: "dribblesSuccess90", label: "Regates/90" },
  { key: "tackles90", label: "Entradas/90" },
  { key: "duelsWon90", label: "Duelos/90" },
  { key: "shotsOn90", label: "Tiros a puerta/90" },
  { key: "offensiveIndex", label: "Índice ofensivo" },
  { key: "finishingIndex", label: "Índice finalización" },
  { key: "defensiveIndex", label: "Índice defensivo" },
  { key: "saves90", label: "Paradas/90" },
  { key: "rating", label: "Rating" },
];

function metricValue(p: ScoutingProfile, key: RankMetricKey): number {
  if (key === "rating") return p.rating;
  return (p.metrics[key as keyof typeof p.metrics] as number) ?? 0;
}

interface ScoutingRankingsProps {
  profiles: ScoutingProfile[];
  metricKey: RankMetricKey;
  onMetricChange: (key: RankMetricKey) => void;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function ScoutingRankings({
  profiles,
  metricKey,
  onMetricChange,
  selectedId,
  onSelect,
}: ScoutingRankingsProps) {
  const available = RANK_OPTIONS.filter((opt) =>
    profiles.some((p) => Number.isFinite(metricValue(p, opt.key)))
  );
  const key = available.some((o) => o.key === metricKey)
    ? metricKey
    : available[0]?.key ?? "keyPasses90";
  const ranked = rankProfilesByMetric(profiles, key, 20);
  const label = available.find((o) => o.key === key)?.label ?? key;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">Ranking · {label}</CardTitle>
          <select
            className="h-8 rounded-md border bg-background px-2 text-xs"
            value={key}
            onChange={(e) => onMetricChange(e.target.value as RankMetricKey)}
          >
            {available.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="max-h-[320px] overflow-y-auto divide-y text-sm">
          {ranked.map((p, i) => {
            const value = metricValue(p, key);
            const active = p.playerId === selectedId;
            return (
              <li key={p.playerId}>
                <button
                  type="button"
                  onClick={() => onSelect(p.playerId)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50",
                    active && "bg-sky-500/15"
                  )}
                >
                  <span className="w-6 text-xs text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{p.team}</span>
                  <span className="font-mono text-xs tabular-nums">
                    {value.toFixed(2)}
                  </span>
                </button>
              </li>
            );
          })}
          {ranked.length === 0 && (
            <li className="px-3 py-4 text-muted-foreground">Sin jugadores</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
