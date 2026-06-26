"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useKnockoutBracket } from "@/hooks/useKnockoutBracket";
import { getKnockoutMatchMeta } from "@/data/worldCup2026KnockoutSchedule";
import type { Fixture } from "@/types";
import {
  getKnockoutByRound,
  getRoundOf32BySide,
  type BracketSlotTeam,
  type ResolvedBracketMatch,
  type ResolvedR32Match,
} from "@/utils/knockoutBracket";
import {
  BracketSlotProbabilities,
  getCandidatesForSlot,
} from "@/components/Grupos/BracketSlotProbabilities";
import type { KnockoutSlotKey, KnockoutSlotCandidate } from "@/utils/knockoutSlotProbabilities";
import { GROUP_LETTERS, ROUND_LABELS, type BracketRound, type GroupLetter } from "@/data/worldCup2026Bracket";
import { translateTeamName } from "@/utils/teamNames";
import { formatFixtureDate, formatKnockoutMatchHeader } from "@/utils/formatters";
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
  fixture,
  slotProbabilities,
  showProbabilities = false,
  allGroupsFinished = false,
}: {
  matchId: number;
  home: BracketSlotTeam;
  away: BracketSlotTeam;
  compact?: boolean;
  fixture?: Fixture | null;
  slotProbabilities?: Map<KnockoutSlotKey, KnockoutSlotCandidate[]>;
  showProbabilities?: boolean;
  allGroupsFinished?: boolean;
}) {
  const meta = getKnockoutMatchMeta(matchId, fixture?.fixture);
  const header = formatKnockoutMatchHeader(meta.date, meta.city);
  const fullDate = formatFixtureDate(meta.date);

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-card/80 shadow-sm overflow-hidden shrink-0",
        showProbabilities
          ? "w-[168px] sm:w-[190px] lg:w-[210px]"
          : compact
            ? "w-[112px] sm:w-[130px] lg:w-[148px]"
            : "w-[128px] sm:w-[148px] lg:w-[168px]"
      )}
    >
      <div
        className="px-2 py-1 bg-muted/40 text-[10px] border-b border-border/50"
        title={fullDate}
      >
        <p className="font-semibold text-foreground truncate">{meta.city}</p>
        <div className="flex items-baseline justify-between gap-1 text-muted-foreground">
          <span className="text-[9px]">{header.split("·").pop()?.trim() ?? header}</span>
          <span className="font-medium shrink-0 text-[9px]">M{matchId}</span>
        </div>
      </div>
      {showProbabilities && slotProbabilities ? (
        <>
          <BracketSlotProbabilities
            matchId={matchId}
            side="home"
            slot={home}
            candidates={getCandidatesForSlot(slotProbabilities, matchId, "home")}
            allGroupsFinished={allGroupsFinished}
          />
          <div className="text-[9px] text-center text-muted-foreground py-0.5 bg-muted/20 border-y border-border/30">
            vs
          </div>
          <BracketSlotProbabilities
            matchId={matchId}
            side="away"
            slot={away}
            candidates={getCandidatesForSlot(slotProbabilities, matchId, "away")}
            allGroupsFinished={allGroupsFinished}
          />
        </>
      ) : (
        <>
          <BracketTeamRow slot={home} />
          <BracketTeamRow slot={away} />
        </>
      )}
    </div>
  );
}

function R32Column({
  matches,
  fixtureByMatchId,
  slotProbabilities,
  allGroupsFinished,
}: {
  matches: ResolvedR32Match[];
  fixtureByMatchId: Map<number, Fixture>;
  slotProbabilities: Map<KnockoutSlotKey, KnockoutSlotCandidate[]>;
  allGroupsFinished?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 py-2 justify-around sm:gap-3 sm:py-4 min-h-[520px] sm:min-h-[600px] lg:min-h-[720px]">
      {matches.map((m) => (
        <MatchBox
          key={m.matchId}
          matchId={m.matchId}
          home={m.home}
          away={m.away}
          fixture={fixtureByMatchId.get(m.matchId) ?? null}
          slotProbabilities={slotProbabilities}
          allGroupsFinished={allGroupsFinished}
          showProbabilities
        />
      ))}
    </div>
  );
}

function KnockoutColumn({
  matches,
  tall,
  fixtureByMatchId,
}: {
  matches: ResolvedBracketMatch[];
  tall?: boolean;
  fixtureByMatchId: Map<number, Fixture>;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-around gap-2 py-2 sm:gap-4 sm:py-4",
        tall ? "min-h-[480px] sm:min-h-[560px] lg:min-h-[640px]" : "min-h-[240px] sm:min-h-[280px] lg:min-h-[320px]"
      )}
    >
      {matches.map((m) => (
        <MatchBox
          key={m.matchId}
          matchId={m.matchId}
          home={m.home}
          away={m.away}
          compact
          fixture={fixtureByMatchId.get(m.matchId) ?? null}
        />
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

function BracketScrollHint() {
  return (
    <p className="lg:hidden text-center text-[11px] text-muted-foreground pb-2">
      Desliza para recorrer el cuadro · 16avos → final
    </p>
  );
}

function BracketHalf({
  side,
  r32,
  knockout,
  fixtureByMatchId,
  slotProbabilities,
  allGroupsFinished,
}: {
  side: "left" | "right";
  r32: ResolvedR32Match[];
  knockout: ResolvedBracketMatch[];
  fixtureByMatchId: Map<number, Fixture>;
  slotProbabilities: Map<KnockoutSlotKey, KnockoutSlotCandidate[]>;
  allGroupsFinished?: boolean;
}) {
  const r16 = getKnockoutByRound(knockout, "round_of_16", side);
  const qf = getKnockoutByRound(knockout, "quarterfinal", side);
  const sf = getKnockoutByRound(knockout, "semifinal", side);

  return (
    <div
      className={cn(
        "flex items-stretch gap-1.5 sm:gap-2 lg:gap-3",
        side === "right" && "flex-row-reverse"
      )}
    >
      <R32Column
        matches={r32}
        fixtureByMatchId={fixtureByMatchId}
        slotProbabilities={slotProbabilities}
        allGroupsFinished={allGroupsFinished}
      />
      <KnockoutColumn matches={r16} tall fixtureByMatchId={fixtureByMatchId} />
      <KnockoutColumn matches={qf} fixtureByMatchId={fixtureByMatchId} />
      <KnockoutColumn matches={sf} fixtureByMatchId={fixtureByMatchId} />
    </div>
  );
}

export function KnockoutBracketSection() {
  const { bracket, slotProbabilities, isLoading, hasData } = useKnockoutBracket();

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
        <h2 className="text-lg md:text-xl font-semibold">Cuadro eliminatorio</h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Proyección según tabla actual · Los 2 primeros de cada grupo + 8 mejores terceros.
          Los 16avos muestran probabilidades Monte Carlo por slot (1.000 simulaciones).
          {bracket.isProvisional && (
            <span className="block mt-0.5">
              Proyección en vivo: los cruces de terceros usan el ranking actual de mejores terceros
              (Anexo C FIFA). Los marcados con * en las tiras de grupo son mejores terceros proyectados.
            </span>
          )}
        </p>
      </div>

      <div className="hidden lg:block">
        <GroupStrip letters={topGroups} groups={bracket.groupStrips} />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-2 sm:p-4">
          <BracketScrollHint />
          <div className="overflow-x-auto overflow-y-auto pb-2 overscroll-x-contain [-webkit-overflow-scrolling:touch] scroll-smooth max-lg:max-h-[72dvh] lg:max-h-none">
            <div className="flex items-center gap-2 sm:gap-4 min-w-[980px] sm:min-w-[1100px] lg:min-w-[1200px] px-1 max-lg:origin-top-left max-lg:[zoom:0.56]">
              <BracketHalf
                side="left"
                r32={leftR32}
                knockout={bracket.knockoutMatches}
                fixtureByMatchId={bracket.fixtureByMatchId}
                slotProbabilities={slotProbabilities}
                allGroupsFinished={bracket.allGroupsFinished}
              />

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
                      fixture={bracket.fixtureByMatchId.get(finalMatch.matchId) ?? null}
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
                      fixture={bracket.fixtureByMatchId.get(bronzeMatch.matchId) ?? null}
                    />
                  </div>
                )}
              </div>

              <BracketHalf
                side="right"
                r32={rightR32}
                knockout={bracket.knockoutMatches}
                fixtureByMatchId={bracket.fixtureByMatchId}
                slotProbabilities={slotProbabilities}
                allGroupsFinished={bracket.allGroupsFinished}
              />
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

      <div className="hidden lg:block">
        <GroupStrip letters={bottomGroups} groups={bracket.groupStrips} />
      </div>
    </section>
  );
}
