"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroupStandings } from "@/hooks/useGroupStandings";
import { useTournamentClassificationProbs } from "@/hooks/useTournamentClassificationProbs";
import { ClassificationProbCells } from "@/components/shared/ClassificationProbDisplay";
import { iterateStandingsTables } from "@/utils/standingsTables";
import { translateTeamName } from "@/utils/teamNames";
import type { StandingTeam } from "@/types";
import type { TeamOutcomeProbs } from "@/utils/groupClassification";
import { cn } from "@/lib/utils";

function GroupTable({
  groupLabel,
  table,
  probMap,
  loadingProbs,
  isLive,
}: {
  groupLabel: string;
  table: StandingTeam[];
  probMap: Map<number, TeamOutcomeProbs>;
  loadingProbs: boolean;
  isLive?: boolean;
}) {
  return (
    <Card
      className={cn(
        "overflow-hidden",
        isLive && "border-amber-500/50 ring-1 ring-amber-500/30"
      )}
    >
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{groupLabel}</CardTitle>
          {isLive && (
            <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 animate-pulse">
              En vivo
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
          Tabla · desempate FIFA (H2H, fair play) · prob. Monte Carlo
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-3">
        <div className="overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
          <table className="w-full min-w-[280px] text-[11px] sm:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pl-3 pr-1 text-left w-7 sm:pl-4 sm:w-8">#</th>
                <th className="py-2 pr-2 text-left min-w-[88px]">Selección</th>
                <th className="py-2 px-1 text-center w-8">PJ</th>
                <th className="py-2 px-1 text-center hidden md:table-cell">PG</th>
                <th className="py-2 px-1 text-center hidden md:table-cell">PE</th>
                <th className="py-2 px-1 text-center hidden md:table-cell">PP</th>
                <th className="py-2 px-1 text-center hidden md:table-cell">GF</th>
                <th className="py-2 px-1 text-center hidden md:table-cell">GC</th>
                <th className="py-2 px-1 text-center hidden md:table-cell">DIF</th>
                <th className="py-2 px-1 text-center font-semibold w-9">PTS</th>
                <th
                  className="py-2 px-1 text-center md:hidden w-11"
                  title="Probabilidad de clasificar"
                >
                  P(cl)
                </th>
                <th className="py-2 px-1 text-center hidden md:table-cell" title="Probabilidad de quedar 1º">
                  1º
                </th>
                <th className="py-2 px-1 text-center hidden md:table-cell" title="Probabilidad de quedar 2º">
                  2º
                </th>
                <th
                  className="py-2 pr-3 pl-1 text-center hidden md:table-cell md:pr-4"
                  title="Probabilidad de clasificar como mejor tercero"
                >
                  3º*
                </th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => {
                const qualifies = row.rank <= 2 && row.all.played > 0;
                const outcomes = probMap.get(row.team.id);
                const classifyProb = outcomes?.probClassify;
                return (
                  <tr
                    key={row.team.id}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      qualifies && "bg-emerald-500/5",
                      row.rank === 1 && "font-medium"
                    )}
                  >
                    <td className="py-2 pl-3 pr-1 tabular-nums text-muted-foreground sm:pl-4">
                      {row.rank}
                    </td>
                    <td className="py-2 pr-2 max-w-[120px] sm:max-w-none">
                      <Link
                        href={`/selecciones/${row.team.id}`}
                        className="flex items-center gap-1.5 min-w-0 hover:text-mundial-gold transition-colors"
                      >
                        <div className="relative w-4 h-4 sm:w-5 sm:h-5 shrink-0">
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
                    <td className="py-2 px-1 text-center tabular-nums">{row.all.played}</td>
                    <td className="py-2 px-1 text-center tabular-nums hidden md:table-cell">
                      {row.all.win}
                    </td>
                    <td className="py-2 px-1 text-center tabular-nums hidden md:table-cell">
                      {row.all.draw}
                    </td>
                    <td className="py-2 px-1 text-center tabular-nums hidden md:table-cell">
                      {row.all.lose}
                    </td>
                    <td className="py-2 px-1 text-center tabular-nums hidden md:table-cell">
                      {row.all.goals.for}
                    </td>
                    <td className="py-2 px-1 text-center tabular-nums hidden md:table-cell">
                      {row.all.goals.against}
                    </td>
                    <td className="py-2 px-1 text-center tabular-nums hidden md:table-cell">
                      {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                    </td>
                    <td className="py-2 px-1 text-center tabular-nums font-bold text-mundial-gold">
                      {row.points}
                    </td>
                    <td className="py-2 px-1 text-center tabular-nums font-mono text-[10px] md:hidden">
                      {loadingProbs ? "…" : classifyProb != null ? `${classifyProb}%` : "—"}
                    </td>
                    <ClassificationProbCells
                      outcomes={outcomes}
                      isLoading={loadingProbs}
                      hideOnMobile
                    />
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

export function GruposSection() {
  const { standings, liveGroupLetters, isProjected, isLoading } = useGroupStandings();
  const { probMap, isLoading: loadingProbs } = useTournamentClassificationProbs();
  const groups = iterateStandingsTables(standings);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Las tablas de grupos aparecerán cuando comience la fase de grupos.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {isProjected && (
        <p className="text-xs text-muted-foreground">
          Tablas recalculadas con marcadores en vivo — se actualizan al instante con cada gol.
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map(({ groupLabel, table, letter }) => (
          <GroupTable
            key={letter ?? groupLabel}
            groupLabel={groupLabel}
            table={table}
            probMap={probMap}
            loadingProbs={loadingProbs}
            isLive={letter ? liveGroupLetters.has(letter) : false}
          />
        ))}
      </div>
    </div>
  );
}
