"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeams } from "@/hooks/usePartidos";
import { useColombiaData } from "@/hooks/useEstadisticasAggregadas";
import { useTeamPlayers, getKeyPlayerByNationalRating } from "@/hooks/useJugadores";
import { getStatBundle, statSummary } from "@/utils/playerStats";
import { useClasificacionProb } from "@/hooks/useClasificacionProb";
import { ClassificationProbDisplay } from "@/components/shared/ClassificationProbDisplay";
import { formatFixtureDate, getFixtureScore, ratingClass } from "@/utils/formatters";
import { cn, PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";

export function ColombiaFocus() {
  const { data: teams = [] } = useTeams();
  const colombiaTeam = useMemo(
    () => teams.find((t) => t.name.toLowerCase().includes("colombia")),
    [teams]
  );
  const colombiaData = useColombiaData(colombiaTeam?.id);
  const { data: players = [] } = useTeamPlayers(colombiaTeam?.id);

  const keyPlayer = useMemo(() => getKeyPlayerByNationalRating(players), [players]);
  const keyNat = keyPlayer ? statSummary(getStatBundle(keyPlayer).national) : null;

  const { probability: classProb, isLoading: loadingProb, pendingMatchesPerTeam, isPreTournament, hasCalendar } =
    useClasificacionProb(colombiaTeam?.id);

  if (!colombiaTeam) {
    return (
      <Card className="border-colombia-yellow/30">
        <CardContent className="p-6 text-center text-muted-foreground">
          Colombia no encontrada en el torneo
        </CardContent>
      </Card>
    );
  }

  const standing = colombiaData?.standing;

  return (
    <Card className="border-colombia-yellow/40 bg-gradient-to-br from-colombia-blue/10 via-colombia-yellow/5 to-colombia-red/10 overflow-hidden">
      <CardHeader className="border-b border-colombia-yellow/20">
        <div className="flex items-center gap-3">
          <Image src={colombiaTeam.logo} alt="Colombia" width={40} height={40} />
          <div>
            <CardTitle className="text-colombia-blue dark:text-colombia-yellow">
              🇨🇴 Colombia Focus
            </CardTitle>
            <p className="text-sm text-muted-foreground">La Tricolor en el Mundial 2026</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {!colombiaData ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MiniStat
                label="Posición en grupo"
                value={standing ? `#${standing.rank}` : "N/D"}
              />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Prob. clasificación</p>
                <ClassificationProbDisplay
                  probability={classProb}
                  isLoading={loadingProb}
                  pendingMatchesPerTeam={pendingMatchesPerTeam}
                  isPreTournament={isPreTournament}
                  hasCalendar={hasCalendar}
                />
              </div>
              <MiniStat label="Puntos" value={standing?.points ?? 0} />
              <MiniStat label="Dif. goles" value={standing?.goalsDiff ?? 0} />
            </div>

            {colombiaData.nextMatch && (
              <div className="p-4 rounded-lg bg-white/50 dark:bg-white/5">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Próximo partido</p>
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {colombiaData.nextMatch.teams.home.name} vs {colombiaData.nextMatch.teams.away.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatFixtureDate(colombiaData.nextMatch.fixture.date)}
                  </span>
                </div>
              </div>
            )}

            {colombiaData.lastResults.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Últimos resultados</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {colombiaData.lastResults.map((f) => (
                    <Link
                      key={f.fixture.id}
                      href={`/partidos/${f.fixture.id}`}
                      className="flex-shrink-0 p-3 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white/80 transition-colors min-w-[140px] text-center"
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatFixtureDate(f.fixture.date).split("|")[0]}
                      </p>
                      <p className="font-mono font-bold">
                        {getFixtureScore(f.goals.home, f.goals.away, f.fixture.status.short)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {keyPlayer && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-colombia-yellow/10">
                <Image
                  src={keyPlayer.player.photo}
                  alt={keyPlayer.player.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Jugador clave en forma</p>
                  <Link href={`/jugadores/${keyPlayer.player.id}`} className="font-semibold hover:underline">
                    {keyPlayer.player.name}
                  </Link>
                </div>
                <span className={cn("text-xl font-bold font-mono", ratingClass(keyNat?.rating))}>
                  {keyNat && keyNat.rating > 0 ? keyNat.rating.toFixed(1) : "N/D"}
                </span>
                {keyNat && (
                  <p className="text-[10px] text-muted-foreground w-full text-right">
                    {keyNat.goals}G con la selección · Temp. {PLAYER_STAT_SEASON_LABEL}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-xl font-bold font-mono", highlight && "text-colombia-blue dark:text-colombia-yellow")}>
        {value}
      </p>
    </div>
  );
}
