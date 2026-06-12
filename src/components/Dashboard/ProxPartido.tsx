"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNextFixture } from "@/hooks/usePartidos";
import { formatFixtureDate, formatStatus, getFixtureScore } from "@/utils/formatters";
import { isEffectivelyFinished, isPlausibleLiveFixture } from "@/lib/liveRefresh";
import { TeamLink } from "@/components/shared/TeamLink";
import { cn } from "@/lib/utils";

export function ProxPartido() {
  const { data: fixture, isLoading } = useNextFixture();

  if (isLoading) {
    return <Skeleton className="aspect-[21/9] min-h-[220px] w-full rounded-2xl" />;
  }

  if (!fixture) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="p-8 text-center text-muted-foreground">
          No hay partidos programados próximamente
        </CardContent>
      </Card>
    );
  }

  const live = isPlausibleLiveFixture(fixture);
  const finished = isEffectivelyFinished(fixture);
  const elapsed = fixture.fixture.status.elapsed;
  const statusLabel =
    live && elapsed != null
      ? `${formatStatus(fixture.fixture.status.short)} · ${elapsed}'`
      : formatStatus(fixture.fixture.status.short);

  const cardTitle = live
    ? "Partido en vivo"
    : finished
      ? "Último resultado"
      : "Próximo Partido";

  const isColombia =
    fixture.teams.home.name.toLowerCase().includes("colombia") ||
    fixture.teams.away.name.toLowerCase().includes("colombia");

  return (
    <Card
      className={cn(
        "@container/match overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-lg",
        isColombia &&
          "border-colombia-yellow/50 bg-gradient-to-br from-colombia-blue/5 via-colombia-yellow/5 to-colombia-red/5",
        live && "border-mundial-red/60 ring-1 ring-mundial-red/30"
      )}
    >
      {/* Header band — grid template areas */}
      <div
        className={cn(
          "grid gap-3 border-b px-4 py-4 @md/match:px-6",
          "grid-cols-1 @md/match:grid-cols-[1fr_auto]",
          "@md/match:items-center",
          live ? "bg-mundial-red/5" : "bg-muted/30"
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">{cardTitle}</h2>
            {live && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mundial-red opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mundial-red" />
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{fixture.league.round}</p>
        </div>
        <Badge variant="outline" className="w-fit shrink-0">
          {formatFixtureDate(fixture.fixture.date)}
        </Badge>
      </div>

      <CardContent className="p-4 @md/match:p-6">
        {/* Scoreboard — 3-column grid with flexible sides */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 @md/match:gap-6 py-2 @md/match:py-4">
          <TeamLink
            id={fixture.teams.home.id}
            name={fixture.teams.home.name}
            logo={fixture.teams.home.logo}
            variant="stack"
            align="end"
          />
          <div className="flex flex-col items-center justify-center px-2 shrink-0">
            <p className="text-[clamp(1.75rem,8cqw,3rem)] font-bold font-mono leading-none tabular-nums">
              {getFixtureScore(fixture.goals.home, fixture.goals.away, fixture.fixture.status.short)}
            </p>
            <Badge
              className={cn(
                "mt-2 whitespace-nowrap",
                live && "bg-mundial-red text-white animate-pulse border-0"
              )}
            >
              {statusLabel}
            </Badge>
          </div>
          <TeamLink
            id={fixture.teams.away.id}
            name={fixture.teams.away.name}
            logo={fixture.teams.away.logo}
            variant="stack"
            align="start"
          />
        </div>

        {/* Meta row — flex with min-w-0 truncate */}
        <div className="mt-4 grid gap-2 border-t pt-4 text-sm text-muted-foreground @md/match:grid-cols-2 min-w-0">
          <span className="min-w-0 truncate">📍 {fixture.fixture.venue.city}</span>
          {fixture.fixture.referee && (
            <span className="min-w-0 truncate @md/match:text-right">
              ⚖️ {fixture.fixture.referee}
            </span>
          )}
        </div>

        <div className="mt-5 flex justify-center @md/match:justify-end">
          <Button asChild className="w-full @md/match:w-auto">
            <Link href={`/partidos/${fixture.fixture.id}`}>Ver análisis</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
