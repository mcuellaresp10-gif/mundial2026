"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PartidoCard } from "./PartidoCard";
import type { CalendarMatchEntry, Fixture } from "@/types";
import { formatDayHeading } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface CalendarioDiaDetalleProps {
  dayKey: string | null;
  entries: CalendarMatchEntry[];
  fixtureById: Map<number, Fixture>;
}

function ProjectedMatchCard({ entry }: { entry: CalendarMatchEntry }) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>{entry.roundLabel}</span>
          <div className="flex items-center gap-1">
            {entry.matchId != null && <Badge variant="outline">M{entry.matchId}</Badge>}
            <Badge variant="outline">Proyección</Badge>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className={cn("font-medium", entry.home.provisional && "italic text-muted-foreground")}>
            {entry.home.label ?? entry.home.name}
          </span>
          <span className="font-mono text-muted-foreground">vs</span>
          <span className={cn("font-medium text-right", entry.away.provisional && "italic text-muted-foreground")}>
            {entry.away.label ?? entry.away.name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function CalendarioDiaDetalle({
  dayKey,
  entries,
  fixtureById,
}: CalendarioDiaDetalleProps) {
  if (!dayKey) {
    return (
      <div className="rounded-xl border bg-muted/20 p-8 text-center text-muted-foreground">
        Selecciona un día del calendario
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/20 p-8 text-center text-muted-foreground">
        No hay partidos este día
      </div>
    );
  }

  const heading = formatDayHeading(entries[0].date);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold capitalize">{heading}</h2>
          <p className="text-sm text-muted-foreground">
            {entries.length} partido{entries.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {entries.map((entry) => {
          if (entry.fixtureId) {
            const fixture = fixtureById.get(entry.fixtureId);
            if (fixture) {
              return <PartidoCard key={entry.fixtureId} fixture={fixture} />;
            }
          }
          return (
            <ProjectedMatchCard
              key={`${entry.matchId ?? entry.date}-${entry.home.name}-${entry.away.name}`}
              entry={entry}
            />
          );
        })}
      </div>
    </section>
  );
}
