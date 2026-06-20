"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroupStandings } from "@/hooks/useGroupStandings";
import { useFixtures } from "@/hooks/usePartidos";
import { useTournamentClassificationProbs } from "@/hooks/useTournamentClassificationProbs";
import {
  BEST_THIRD_QUALIFIERS,
  rankThirdPlaceTeamsFromStandings,
} from "@/utils/bestThirdsRanking";
import { translateTeamName } from "@/utils/teamNames";
import { cn } from "@/lib/utils";

export function BestThirdsSection() {
  const { standings, fairPlayByTeam, isLoading } = useGroupStandings();
  const { data: fixtures = [] } = useFixtures();
  const { probMap, isLoading: loadingProbs } = useTournamentClassificationProbs();

  const rankedThirds = useMemo(
    () => rankThirdPlaceTeamsFromStandings(standings, fixtures, fairPlayByTeam),
    [standings, fixtures, fairPlayByTeam]
  );

  if (isLoading) {
    return <Skeleton className="h-72 rounded-xl" />;
  }

  if (rankedThirds.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base">Mejores terceros</CardTitle>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Los {BEST_THIRD_QUALIFIERS} mejores terceros de los 12 grupos pasan a dieciseisavos (criterios
          FIFA: puntos, diferencia, goles a favor, fair play). Prob. Monte Carlo en columna P(mej. 3º).
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pl-4 pr-1 text-left w-8">#</th>
                <th className="py-2 px-1 text-center w-10">Gr.</th>
                <th className="py-2 pr-2 text-left">Selección</th>
                <th className="py-2 px-1 text-center">PJ</th>
                <th className="py-2 px-1 text-center font-semibold">PTS</th>
                <th className="py-2 px-1 text-center">DIF</th>
                <th className="py-2 px-1 text-center">GF</th>
                <th className="py-2 px-1 text-center" title="Probabilidad Monte Carlo de clasificar como mejor tercero">
                  P(mej. 3º)
                </th>
                <th className="py-2 pr-4 pl-1 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rankedThirds.map((entry) => {
                const { row } = entry;
                const probBestThird = probMap.get(row.team.id)?.probBestThird;
                return (
                  <tr
                    key={row.team.id}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      entry.qualifies && "bg-emerald-500/5"
                    )}
                  >
                    <td className="py-2.5 pl-4 pr-1 tabular-nums text-muted-foreground">
                      {entry.rankAmongThirds}
                    </td>
                    <td className="py-2.5 px-1 text-center tabular-nums font-medium">
                      {entry.groupLetter}
                    </td>
                    <td className="py-2.5 pr-2">
                      <Link
                        href={`/selecciones/${row.team.id}`}
                        className="flex items-center gap-2 min-w-0 hover:text-mundial-gold transition-colors"
                      >
                        <div className="relative w-5 h-5 shrink-0">
                          <Image
                            src={row.team.logo}
                            alt=""
                            fill
                            className="object-contain"
                            sizes="20px"
                          />
                        </div>
                        <span className="truncate">{translateTeamName(row.team.name)}</span>
                      </Link>
                    </td>
                    <td className="py-2.5 px-1 text-center tabular-nums">{row.all.played}</td>
                    <td className="py-2.5 px-1 text-center tabular-nums font-bold text-mundial-gold">
                      {row.points}
                    </td>
                    <td className="py-2.5 px-1 text-center tabular-nums">
                      {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                    </td>
                    <td className="py-2.5 px-1 text-center tabular-nums">{row.all.goals.for}</td>
                    <td className="py-2.5 px-1 text-center tabular-nums font-mono text-xs">
                      {loadingProbs ? "…" : probBestThird != null ? `${probBestThird}%` : "—"}
                    </td>
                    <td className="py-2.5 pr-4 pl-1 text-center">
                      {entry.qualifies ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                          Clasifica
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Eliminado</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
