"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CupBracket, CupBracketTie } from "@/utils/cupBracket";
import { translateTeamName } from "@/utils/teamNames";
import { formatFixtureDate, formatStatus } from "@/utils/formatters";
import { cn } from "@/lib/utils";

function TieCard({ tie }: { tie: CupBracketTie }) {
  const primaryHref = `/partidos/${tie.legs[0].fixture.id}`;
  const isFinished = ["FT", "AET", "PEN"].includes(tie.statusShort);

  return (
    <Link
      href={primaryHref}
      className="block rounded-xl border bg-card/60 hover:border-mundial-gold/40 transition-colors overflow-hidden"
    >
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 border-b border-border/40 text-[10px] text-muted-foreground">
        <span className="truncate">
          {tie.legs.length > 1 ? `${tie.legs.length} partidos` : formatFixtureDate(tie.legs[0].fixture.date)}
        </span>
        <Badge variant="outline" className="text-[9px] h-5 shrink-0">
          {formatStatus(tie.statusShort)}
        </Badge>
      </div>

      <div className="p-3 space-y-2">
        <TeamRow
          team={tie.home}
          isWinner={tie.winnerId === tie.home.id}
          dimLoser={isFinished && tie.winnerId != null && tie.winnerId !== tie.home.id}
        />
        <div className="text-center font-mono text-sm font-semibold text-mundial-gold/90">
          {tie.scoreLabel}
        </div>
        <TeamRow
          team={tie.away}
          isWinner={tie.winnerId === tie.away.id}
          dimLoser={isFinished && tie.winnerId != null && tie.winnerId !== tie.away.id}
        />
      </div>
    </Link>
  );
}

function TeamRow({
  team,
  isWinner,
  dimLoser,
}: {
  team: CupBracketTie["home"];
  isWinner: boolean;
  dimLoser: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 min-w-0",
        dimLoser && "opacity-45",
        isWinner && "text-mundial-gold"
      )}
    >
      {team.logo ? (
        <Image
          src={team.logo}
          alt=""
          width={18}
          height={18}
          className="rounded-full shrink-0"
        />
      ) : (
        <span className="w-[18px] h-[18px] rounded-full bg-muted shrink-0" />
      )}
      <span className={cn("truncate text-sm", isWinner && "font-semibold")}>
        {translateTeamName(team.name)}
      </span>
    </div>
  );
}

interface CupBracketViewProps {
  bracket: CupBracket;
  isLoading?: boolean;
  title?: string;
}

export function CupBracketView({
  bracket,
  isLoading,
  title = "Cuadro eliminatorio",
}: CupBracketViewProps) {
  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  if (bracket.totalTies === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Sin series de eliminatoria para mostrar.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {bracket.totalTies} serie{bracket.totalTies === 1 ? "" : "s"} ·{" "}
          {bracket.rounds.length} fase{bracket.rounds.length === 1 ? "" : "s"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
          {bracket.rounds.map((round) => (
            <div
              key={round.key}
              className="min-w-[220px] max-w-[260px] flex-1 snap-start space-y-3"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide text-mundial-gold/90 sticky top-0 bg-card/95 py-1 backdrop-blur-sm">
                {round.label}
                <span className="ml-2 text-muted-foreground font-normal normal-case tracking-normal">
                  ({round.ties.length})
                </span>
              </h3>
              <div className="space-y-2">
                {round.ties.map((tie) => (
                  <TieCard key={tie.id} tie={tie} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
