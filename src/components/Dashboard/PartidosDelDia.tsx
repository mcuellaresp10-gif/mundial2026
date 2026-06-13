"use client";

import { useMemo } from "react";
import { PartidoCard } from "@/components/Calendario/PartidoCard";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFixtures } from "@/hooks/usePartidos";
import {
  getDashboardFixtures,
  isPlausibleLiveFixture,
  isWithinKickoffWindow,
} from "@/lib/liveRefresh";
import { formatDayHeading } from "@/utils/formatters";
import { cn } from "@/lib/utils";

export function PartidosDelDia() {
  const { data: fixtures = [], isLoading } = useFixtures();

  const group = useMemo(() => getDashboardFixtures(fixtures), [fixtures]);

  const liveCount = useMemo(
    () =>
      group.fixtures.filter(
        (f) =>
          isPlausibleLiveFixture(f) ||
          isWithinKickoffWindow(f.fixture.date, f.fixture.status.short)
      ).length,
    [group.fixtures]
  );

  const dayLabel = useMemo(() => {
    const first = group.fixtures[0];
    if (!first) return null;
    return formatDayHeading(first.fixture.date);
  }, [group.fixtures]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (group.fixtures.length === 0) {
    return (
      <div className="rounded-2xl border bg-muted/30 p-8 text-center text-muted-foreground">
        No hay partidos programados próximamente
      </div>
    );
  }

  return (
    <section className="@container/day space-y-4">
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-4 @md/day:px-6",
          liveCount > 0 ? "border-mundial-red/40 bg-mundial-red/5" : "bg-muted/30"
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{group.title}</h2>
            {liveCount > 0 && (
              <>
                <Badge className="bg-mundial-red text-white border-0 animate-pulse">
                  {liveCount} en vivo
                </Badge>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mundial-red opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-mundial-red" />
                </span>
              </>
            )}
          </div>
          {dayLabel && (
            <p className="text-sm capitalize text-muted-foreground">{dayLabel}</p>
          )}
        </div>
        <Badge variant="outline" className="shrink-0">
          {group.fixtures.length} partido{group.fixtures.length === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {group.fixtures.map((fixture) => (
          <PartidoCard key={fixture.fixture.id} fixture={fixture} />
        ))}
      </div>
    </section>
  );
}
