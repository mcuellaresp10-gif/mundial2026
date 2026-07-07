"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeams } from "@/hooks/usePartidos";
import { useColombiaData } from "@/hooks/useEstadisticasAggregadas";
import { useTeamWorldCupKeyPlayers } from "@/hooks/useJugadores";
import { useClasificacionProb } from "@/hooks/useClasificacionProb";
import { useTeamNextMatchProb } from "@/hooks/useTeamNextMatchProb";
import { ClassificationProbDisplay } from "@/components/shared/ClassificationProbDisplay";
import { MatchTeamPair } from "@/components/shared/TeamLink";
import { formatFixtureDate, getFixtureScore, ratingClass } from "@/utils/formatters";
import { cn } from "@/lib/utils";

export function ColombiaFocus() {
  const { data: teams = [] } = useTeams();
  const colombiaTeam = useMemo(
    () => teams.find((t) => t.name.toLowerCase().includes("colombia")),
    [teams]
  );
  const colombiaData = useColombiaData(colombiaTeam?.id);
  const { keyPlayers: topWorldCupPlayers, isLoading: loadingKeyPlayers } = useTeamWorldCupKeyPlayers(
    colombiaTeam?.id,
    5
  );

  const { probability: classProb, outcomes, isLoading: loadingProb, pendingMatchesPerTeam, isPreTournament, hasCalendar } =
    useClasificacionProb(colombiaTeam?.id);

  const {
    nextFixture: nextMatchFixture,
    rivalName,
    isKnockout: nextIsKnockout,
    label: probLabel,
    advanceProbability: nextAdvanceProb,
    winProbability: nextWinProb,
    isLoading: loadingNextMatchProb,
  } = useTeamNextMatchProb(colombiaTeam?.id);

  const showNextMatchProb = nextMatchFixture != null && nextAdvanceProb != null;
  const displayProb = showNextMatchProb ? nextAdvanceProb : classProb;
  const displayProbLoading = showNextMatchProb ? loadingNextMatchProb : loadingProb;
  const showGroupBreakdown = !showNextMatchProb && outcomes && !loadingProb;

  if (!colombiaTeam) {
    return (
      <Card className="rounded-2xl border-colombia-yellow/30">
        <CardContent className="p-6 text-center text-muted-foreground">
          Colombia no encontrada en el torneo
        </CardContent>
      </Card>
    );
  }

  const standing = colombiaData?.standing;

  return (
    <Card className="@container/colombia rounded-2xl border-colombia-yellow/40 bg-gradient-to-br from-colombia-blue/10 via-colombia-yellow/5 to-colombia-red/10 overflow-hidden h-full">
      <CardHeader className="border-b border-colombia-yellow/20 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/selecciones/${colombiaTeam.id}`}
            aria-label="Ver selección Colombia"
            className="relative aspect-square w-10 shrink-0 overflow-hidden rounded-full bg-white/80 ring-2 ring-colombia-yellow/40 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image src={colombiaTeam.logo} alt="Colombia" fill className="object-contain p-1" sizes="40px" />
          </Link>
          <div className="min-w-0">
            <CardTitle className="text-colombia-blue dark:text-colombia-yellow truncate">
              🇨🇴 Colombia Focus
            </CardTitle>
            <p className="text-sm text-muted-foreground truncate">La Tricolor en el Mundial 2026</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 @md/colombia:p-5 space-y-5">
        {!colombiaData ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 @md/colombia:grid-cols-4 @md/colombia:gap-4">
              <MiniStat label="Posición en grupo" value={standing ? `#${standing.rank}` : "N/D"} />
              <div className="flex flex-col items-center justify-center text-center min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{probLabel}</p>
                <ClassificationProbDisplay
                  probability={displayProb}
                  outcomes={showGroupBreakdown ? outcomes : null}
                  isLoading={displayProbLoading}
                  pendingMatchesPerTeam={pendingMatchesPerTeam}
                  isPreTournament={isPreTournament}
                  hasCalendar={hasCalendar}
                  compact
                  showBreakdown={false}
                />
                {showNextMatchProb && rivalName && (
                  <p className="text-[10px] text-muted-foreground mt-1 truncate max-w-full px-1">
                    vs {rivalName}
                    {nextIsKnockout && nextWinProb != null ? ` · ${nextWinProb}% victoria` : ""}
                  </p>
                )}
              </div>
              <MiniStat label="Puntos" value={standing != null ? standing.points : "N/D"} />
              <MiniStat
                label="Dif. goles"
                value={
                  standing != null
                    ? standing.goalsDiff > 0
                      ? `+${standing.goalsDiff}`
                      : standing.goalsDiff
                    : "N/D"
                }
              />
            </div>

            {showGroupBreakdown && (
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <p className="text-muted-foreground">1º grupo</p>
                  <p className="font-mono font-bold">{outcomes.probFirst}%</p>
                </div>
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <p className="text-muted-foreground">2º grupo</p>
                  <p className="font-mono font-bold">{outcomes.probSecond}%</p>
                </div>
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <p className="text-muted-foreground">Mejor 3º</p>
                  <p className="font-mono font-bold">{outcomes.probBestThird}%</p>
                </div>
              </div>
            )}

            {colombiaData.nextMatch && (
              <div className="rounded-xl border border-colombia-yellow/20 bg-white/50 dark:bg-white/5 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                  Próximo partido
                </p>
                <div className="flex min-w-0 flex-col gap-2 @md/colombia:flex-row @md/colombia:items-center @md/colombia:justify-between">
                  <MatchTeamPair
                    home={colombiaData.nextMatch.teams.home}
                    away={colombiaData.nextMatch.teams.away}
                  />
                  <span className="text-sm text-muted-foreground shrink-0">
                    {formatFixtureDate(colombiaData.nextMatch.fixture.date)}
                  </span>
                </div>
              </div>
            )}

            {colombiaData.lastResults.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Últimos resultados
                </p>
                <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-thin -mx-1 px-1">
                  {colombiaData.lastResults.map((f) => (
                    <Link
                      key={f.fixture.id}
                      href={`/partidos/${f.fixture.id}`}
                      className="snap-start shrink-0 w-[min(100%,148px)] rounded-xl border border-colombia-yellow/15 bg-white/50 dark:bg-white/5 p-3 text-center transition-colors hover:bg-white/80 dark:hover:bg-white/10"
                    >
                      <p className="text-xs text-muted-foreground mb-1 truncate">
                        {formatFixtureDate(f.fixture.date).split("|")[0]}
                      </p>
                      <p className="font-mono text-lg font-bold tabular-nums">
                        {getFixtureScore(f.goals.home, f.goals.away, f.fixture.status.short)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {loadingKeyPlayers ? (
              <Skeleton className="h-40 w-full rounded-xl" />
            ) : topWorldCupPlayers.length > 0 ? (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Jugadores clave en el Mundial
                </p>
                <div className="space-y-2">
                  {topWorldCupPlayers.map((player, index) => (
                    <div
                      key={player.playerId}
                      className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-2 rounded-xl bg-colombia-yellow/10 p-2.5 min-w-0 @md/colombia:gap-3 @md/colombia:p-3"
                    >
                      <span className="text-xs font-bold font-mono text-colombia-blue dark:text-colombia-yellow w-5 text-center shrink-0">
                        {index + 1}
                      </span>
                      <div className="relative aspect-square w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-colombia-yellow/30 @md/colombia:w-11">
                        <Image
                          src={player.photo}
                          alt={player.name}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/jugadores/${player.playerId}`}
                          className="font-semibold text-sm hover:underline truncate block"
                        >
                          {player.name}
                        </Link>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {player.goals}G · {player.assists}A · {player.matches} PJ (Mundial)
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-lg font-bold font-mono shrink-0 tabular-nums @md/colombia:text-xl",
                          ratingClass(player.rating)
                        )}
                      >
                        {player.rating > 0 ? player.rating.toFixed(1) : "N/D"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground rounded-xl bg-colombia-yellow/5 px-3 py-3 text-center">
                Aún no hay datos de rendimiento en el Mundial para la plantilla colombiana.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center min-w-0 rounded-lg bg-white/30 dark:bg-white/5 px-2 py-2">
      <p className="text-[10px] @md/colombia:text-xs text-muted-foreground leading-tight">{label}</p>
      <p
        className={cn(
          "text-lg @md/colombia:text-xl font-bold font-mono tabular-nums mt-0.5",
          highlight && "text-colombia-blue dark:text-colombia-yellow"
        )}
      >
        {value}
      </p>
    </div>
  );
}
