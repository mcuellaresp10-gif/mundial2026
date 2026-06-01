"use client";

import { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartidoDetalle } from "./PartidoDetalle";
import type { Fixture } from "@/types";
import { formatFixtureDate, formatStatus, getFixtureScore, formatGroupFromRound } from "@/utils/formatters";
import { getTeamColors } from "@/utils/colors";
import { cn } from "@/lib/utils";

interface PartidoCardProps {
  fixture: Fixture;
}

export const PartidoCard = memo(function PartidoCard({ fixture }: PartidoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isColombia =
    fixture.teams.home.name.toLowerCase().includes("colombia") ||
    fixture.teams.away.name.toLowerCase().includes("colombia");
  const isLive = ["LIVE", "1H", "2H", "HT", "ET"].includes(fixture.fixture.status.short);

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-md",
        isColombia && "border-colombia-yellow/30",
        isLive && "ring-2 ring-mundial-green/50"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span>{formatFixtureDate(fixture.fixture.date)}</span>
          <Badge variant="outline">{formatGroupFromRound(fixture.league.round)}</Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <Image src={fixture.teams.home.logo} alt="" width={32} height={32} />
            <span className="font-semibold truncate" style={{ color: getTeamColors(fixture.teams.home.name).primary }}>
              {fixture.teams.home.name}
            </span>
          </div>
          <div className="text-center px-3">
            <p className="text-2xl font-bold font-mono">
              {getFixtureScore(fixture.goals.home, fixture.goals.away, fixture.fixture.status.short)}
            </p>
            <Badge className={cn(isLive && "bg-mundial-green text-white")}>
              {formatStatus(fixture.fixture.status.short)}
            </Badge>
          </div>
          <div className="flex-1 flex items-center gap-2 justify-end">
            <span className="font-semibold truncate text-right" style={{ color: getTeamColors(fixture.teams.away.name).primary }}>
              {fixture.teams.away.name}
            </span>
            <Image src={fixture.teams.away.logo} alt="" width={32} height={32} />
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
          <div className="mt-4 pt-4 border-t animate-in fade-in duration-300">
            <PartidoDetalle fixtureId={fixture.fixture.id} fixture={fixture} />
          </div>
        )}
      </CardContent>
    </Card>
  );
});
