"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnockoutBracket } from "@/hooks/useKnockoutBracket";
import {
  getKnockoutByRound,
  getRoundOf32BySide,
  type BracketSlotTeam,
  type ResolvedBracketMatch,
  type ResolvedR32Match,
} from "@/utils/knockoutBracket";
import { GROUP_LETTERS, ROUND_LABELS, type BracketRound, type GroupLetter } from "@/data/worldCup2026Bracket";
import { translateTeamName } from "@/utils/teamNames";
import { cn } from "@/lib/utils";

function BracketTeamRow({ slot }: { slot: BracketSlotTeam }) {
  const content = slot.team ? (
    <Link
      href={`/selecciones/${slot.team.teamId}`}
      className="flex items-center gap-1.5 min-w-0 hover:text-mundial-gold transition-colors"
    >
      <div className="relative w-4 h-4 shrink-0">
        <Image src={slot.team.logo} alt="" fill className="object-contain" sizes="16px" />
      </div>
      <span className="truncate text-[11px]">{translateTeamName(slot.team.name)}</span>
    </Link>
  ) : (
    <span className="truncate text-[11px] text-muted-foreground italic">{slot.label}</span>
  );

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-1 px-2 py-1 border-b border-border/50 last:border-0 min-h-[28px]",
        slot.provisional && "opacity-80"
      )}
      title={slot.label}
    >
      <span className="text-[9px] text-muted-foreground tabular-nums shrink-0">{slot.label}</span>
      <div className="min-w-0 flex-1 text-right">{content}</div>
    </div>
  );
}

function MatchBox({
  matchId,
  home,
  away,
  compact,
}: {
  matchId: number;
  home: BracketSlotTeam;
  away: BracketSlotTeam;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card/80 shadow-sm overflow-hidden",
        compact ? "w-[148px]" : "w-[168px]"
      )}
    >
      <div className="px-2 py-0.5 bg-muted/40 text-[9px] text-muted-foreground border-b border-border/50">
        M{matchId}
      </div>
      <BracketTeamRow slot={home} />
      <BracketTeamRow slot={away} />
    </div>
  );
}

function R32Column({ matches }: { matches: ResolvedR32Match[] }) {
  return (
    <div className="flex flex-col justify-around gap-3 py-4 min-h-[640px]">
      {matches.map((m) => (
        <MatchBox key={m.matchId} matchId={m.matchId} home={m.home} away={m.away} />
      ))}
    </div>
  );
}

function KnockoutColumn({
  matches,
  tall,
}: {
  matches: ResolvedBracketMatch[];
  tall?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-around gap-4 py-4",
        tall ? "min-h-[640px]" : "min-h-[320px]"
      )}
    >
      {matches.map((m) => (
        <MatchBox key={m.matchId} matchId={m.matchId} home={m.home} away={m.away} compact />
      ))}
    </div>
  );
}

function GroupStrip({ letters, groups }: { letters: GroupLetter[]; groups: Record<GroupLetter, import("@/utils/knockoutBracket").GroupStripTeam[]> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
      {letters.map((letter) => {
        const teams = groups[letter] ?? [];
        return (
          <div
            key={letter}
            className="rounded-lg border border-border bg-muted/20 p-2"
          >
            <p className="text-xs font-semibold text-mundial-gold mb-1.5">Grupo {letter}</p>
            <div className="space-y-1">
              {teams.map((t) => (
                <Link
                  key={t.teamId}
                  href={`/selecciones/${t.teamId}`}
                  className={cn(
                    "flex items-center gap-1.5 hover:text-mundial-gold transition-colors",
                    t.isQualifyingThird && "text-emerald-600 dark:text-emerald-400 font-medium"
                  )}
                >
                  <div className="relative w-4 h-4 shrink-0">
                    <Image src={t.logo} alt="" fill className="object-contain" sizes="16px" />
                  </div>
                  <span className="text-[10px] truncate">
                    {translateTeamName(t.name)}
                    {t.isQualifyingThird ? " *" : ""}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BracketHalf({
  side,
  r32,
  knockout,
}: {
  side: "left" | "right";
  r32: ResolvedR32Match[];
  knockout: ResolvedBracketMatch[];
}) {
  const r16 = getKnockoutByRound(knockout, "round_of_16", side);
  const qf = getKnockoutByRound(knockout, "quarterfinal", side);
  const sf = getKnockoutByRound(knockout, "semifinal", side);

  return (
    <div
      className={cn(
        "flex items-stretch gap-3",
        side === "right" && "flex-row-reverse"
      )}
    >
      <R32Column matches={r32} />
      <KnockoutColumn matches={r16} tall />
      <KnockoutColumn matches={qf} />
      <KnockoutColumn matches={sf} />
    </div>
  );
}

export function KnockoutBracketSection() {
  const { bracket, isLoading, hasData } = useKnockoutBracket();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cuadro eliminatorio</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  if (!hasData || !bracket) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          El cuadro eliminatorio aparecerá cuando haya tablas de grupos disponibles.
        </CardContent>
      </Card>
    );
  }

  const leftR32 = getRoundOf32BySide(bracket.roundOf32, "left");
  const rightR32 = getRoundOf32BySide(bracket.roundOf32, "right");
  const finalMatch = bracket.knockoutMatches.find((m) => m.round === "final");
  const bronzeMatch = bracket.knockoutMatches.find((m) => m.round === "third_place");

  const topGroups = GROUP_LETTERS.slice(0, 6);
  const bottomGroups = GROUP_LETTERS.slice(6, 12);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Cuadro eliminatorio</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Proyección según tabla actual · Los 2 primeros de cada grupo + 8 mejores terceros.
          {bracket.isProvisional && (
            <span className="block mt-0.5">
              Proyección en vivo: los cruces de terceros usan el ranking actual de mejores terceros
              (Anexo C FIFA). Los marcados con * en las tiras de grupo son mejores terceros proyectados.
            </span>
          )}
        </p>
      </div>

      <GroupStrip letters={topGroups} groups={bracket.groupStrips} />

      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-4 min-w-[1100px]">
              <BracketHalf side="left" r32={leftR32} knockout={bracket.knockoutMatches} />

              <div className="flex flex-col items-center justify-center gap-4 shrink-0 px-2">
                {finalMatch && (
                  <div className="text-center space-y-2">
                    <p className="text-xs font-semibold text-mundial-gold uppercase tracking-wide">
                      {ROUND_LABELS.final}
                    </p>
                    <MatchBox
                      matchId={finalMatch.matchId}
                      home={finalMatch.home}
                      away={finalMatch.away}
                    />
                    <p className="text-[10px] text-muted-foreground">Campeón del mundo</p>
                  </div>
                )}
                {bronzeMatch && (
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">
                      {ROUND_LABELS.third_place}
                    </p>
                    <MatchBox
                      matchId={bronzeMatch.matchId}
                      home={bronzeMatch.home}
                      away={bronzeMatch.away}
                      compact
                    />
                  </div>
                )}
              </div>

              <BracketHalf side="right" r32={rightR32} knockout={bracket.knockoutMatches} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-muted-foreground border-t border-border pt-3">
            {(Object.entries(ROUND_LABELS) as [BracketRound, string][]).map(([key, label]) => (
              <span key={key} className="rounded bg-muted/50 px-2 py-0.5">
                {label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <GroupStrip letters={bottomGroups} groups={bracket.groupStrips} />
    </section>
  );
}
