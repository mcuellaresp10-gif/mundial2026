"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PlayerStatistics } from "@/types";
import { parseRating, ratingClass } from "@/utils/formatters";
import { cn, PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { translateTeamName } from "@/utils/teamNames";

interface StatsGridProps {
  stat: PlayerStatistics | null | undefined;
  emptyMessage?: string;
}

export function StatsGrid({ stat, emptyMessage = "Sin datos disponibles" }: StatsGridProps) {
  if (!stat) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">{emptyMessage}</CardContent>
      </Card>
    );
  }

  const subtitle = [translateTeamName(stat.team.name), stat.league.name, stat.league.season]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{subtitle}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Partidos" value={stat.games.appearences ?? 0} />
        <StatBox label="Minutos" value={stat.games.minutes ?? 0} />
        <StatBox label="Goles" value={stat.goals.total ?? 0} highlight />
        <StatBox label="Asistencias" value={stat.goals.assists ?? 0} />
        <StatBox label="Valoración" value={parseRating(stat.games.rating).toFixed(1)} />
        <StatBox label="Amarillas" value={stat.cards.yellow ?? 0} />
        <StatBox label="Rojas" value={stat.cards.red ?? 0} />
        <StatBox label="Tiros" value={stat.shots.total ?? 0} />
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("text-2xl font-bold font-mono", highlight && "text-mundial-gold")}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function StatBadge({
  label,
  goals,
  assists,
  rating,
  seasonLabel = PLAYER_STAT_SEASON_LABEL,
}: {
  label: string;
  goals: number;
  assists: number;
  rating: number;
  seasonLabel?: string;
}) {
  return (
    <div className="rounded-lg border p-2 text-center min-w-[88px]">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">{label}</p>
      <p className="text-[9px] text-muted-foreground mb-1">Temp. {seasonLabel}</p>
      <p className="font-mono text-sm font-bold">{goals}G · {assists}A</p>
      <p className={cn("font-mono text-xs font-bold mt-0.5", ratingClass(rating))}>
        {rating > 0 ? rating.toFixed(1) : "N/D"}
      </p>
    </div>
  );
}
