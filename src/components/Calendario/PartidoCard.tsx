"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartidoDetalle } from "./PartidoDetalle";
import { MatchMomentumChart } from "@/components/Analisis/MatchMomentumChart";
import { TeamLink } from "@/components/shared/TeamLink";
import type { Fixture } from "@/types";
import { formatFixtureDate, formatStatus, getFixtureScore, formatRoundLabel } from "@/utils/formatters";
import { isPlausibleLiveFixture, isWithinKickoffWindow, isFixtureStarted } from "@/lib/liveRefresh";
import { cn } from "@/lib/utils";

interface PartidoCardProps {
  fixture: Fixture;
}

export const PartidoCard = memo(function PartidoCard({ fixture }: PartidoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isColombia =
    fixture.teams.home.name.toLowerCase().includes("colombia") ||
    fixture.teams.away.name.toLowerCase().includes("colombia");
  const isLive =
    isPlausibleLiveFixture(fixture) ||
    isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short);
  const hasStarted =
    isFixtureStarted(fixture.fixture.status.short) ||
    isWithinKickoffWindow(fixture.fixture.date, fixture.fixture.status.short);
  const elapsed = fixture.fixture.status.elapsed;
  const statusLabel =
    isLive && elapsed != null
      ? `${formatStatus(fixture.fixture.status.short)} · ${elapsed}'`
      : formatStatus(fixture.fixture.status.short);

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-md",
        isColombia && "border-colombia-yellow/30",
        isLive && "ring-2 ring-mundial-red/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{formatFixtureDate(fixture.fixture.date)}</span>
          <Badge variant="outline">{formatRoundLabel(fixture.league.round)}</Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <TeamLink
              id={fixture.teams.home.id}
              name={fixture.teams.home.name}
              logo={fixture.teams.home.logo}
              variant="inline"
              size="sm"
            />
          </div>
          <div className="text-center px-3 shrink-0">
            <p className="text-2xl font-bold font-mono">
              {getFixtureScore(fixture.goals.home, fixture.goals.away, fixture.fixture.status.short)}
            </p>
            <Badge className={cn(isLive && "bg-mundial-red text-white border-0 animate-pulse")}>
              {statusLabel}
            </Badge>
          </div>
          <div className="flex-1 min-w-0">
            <TeamLink
              id={fixture.teams.away.id}
              name={fixture.teams.away.name}
              logo={fixture.teams.away.logo}
              variant="inline"
              align="end"
              size="sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>📍 {fixture.fixture.venue.city}</span>
          {fixture.fixture.referee && <span>⚖️ {fixture.fixture.referee}</span>}
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" variant="outline" asChild>
            <Link href={`/partidos/${fixture.fixture.id}`}>📊 Análisis</Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {expanded ? "Ocultar" : "Expandir"}
          </Button>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t animate-in fade-in duration-300 space-y-4">
            {hasStarted && (
              <MatchMomentumChart fixture={fixture} defaultExpanded={false} compact />
            )}
            <PartidoDetalle fixtureId={fixture.fixture.id} fixture={fixture} />
          </div>
        )}
      </CardContent>
    </Card>
  );
});
