"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { CalendarMatchEntry } from "@/types";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  isFixtureLive,
  isFixtureStarted,
  isWithinKickoffWindow,
} from "@/lib/liveRefresh";
import { getFixtureScore } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface PartidoCalendarioChipProps {
  entry: CalendarMatchEntry;
}

function teamLabel(team: CalendarMatchEntry["home"]): string {
  if (team.name && !team.provisional) return team.name;
  return team.label ?? team.name;
}

export function PartidoCalendarioChip({ entry }: PartidoCalendarioChipProps) {
  const time = format(parseISO(entry.date), "HH:mm", { locale: es });
  const status = entry.statusShort ?? "NS";
  const isLive =
    isFixtureLive(status) ||
    isWithinKickoffWindow(entry.date, status);
  const hasStarted = isFixtureStarted(status) || isLive;
  const score =
    hasStarted && entry.goals
      ? getFixtureScore(entry.goals.home, entry.goals.away, status)
      : time;

  const content = (
    <div
      className={cn(
        "rounded-md border px-1.5 py-1 text-[10px] leading-tight transition-colors",
        isLive && "border-mundial-red/50 bg-mundial-red/10",
        entry.isProjected && !isLive && "border-dashed border-muted-foreground/40 bg-muted/40",
        !isLive && !entry.isProjected && "border-border/60 bg-background/80 hover:bg-muted/60"
      )}
    >
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="font-mono tabular-nums text-muted-foreground">{time}</span>
        <div className="flex items-center gap-0.5 shrink-0">
          {entry.matchId != null && (
            <span className="text-[9px] text-muted-foreground">M{entry.matchId}</span>
          )}
          {entry.isProjected && (
            <Badge variant="outline" className="h-4 px-1 text-[8px] py-0">
              Proy.
            </Badge>
          )}
          {isLive && (
            <span className="h-1.5 w-1.5 rounded-full bg-mundial-red animate-pulse" />
          )}
        </div>
      </div>
      <p className={cn("truncate font-medium", entry.home.provisional && "italic text-muted-foreground")}>
        {teamLabel(entry.home)}
      </p>
      <p className="font-mono font-bold tabular-nums text-[11px] my-0.5">{score}</p>
      <p className={cn("truncate font-medium", entry.away.provisional && "italic text-muted-foreground")}>
        {teamLabel(entry.away)}
      </p>
    </div>
  );

  if (entry.fixtureId) {
    return (
      <Link href={`/partidos/${entry.fixtureId}`} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
