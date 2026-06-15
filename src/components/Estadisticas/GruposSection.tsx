"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStandings } from "@/hooks/usePartidos";
import { iterateStandingsTables } from "@/utils/standingsTables";
import { translateTeamName } from "@/utils/teamNames";
import type { StandingTeam } from "@/types";
import { cn } from "@/lib/utils";

function GroupTable({ groupLabel, table }: { groupLabel: string; table: StandingTeam[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-base">{groupLabel}</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pl-4 pr-1 text-left w-8">#</th>
                <th className="py-2 pr-2 text-left">Selección</th>
                <th className="py-2 px-1 text-center">PJ</th>
                <th className="py-2 px-1 text-center hidden sm:table-cell">PG</th>
                <th className="py-2 px-1 text-center hidden sm:table-cell">PE</th>
                <th className="py-2 px-1 text-center hidden sm:table-cell">PP</th>
                <th className="py-2 px-1 text-center">GF</th>
                <th className="py-2 px-1 text-center">GC</th>
                <th className="py-2 px-1 text-center">DIF</th>
                <th className="py-2 pr-4 pl-1 text-center font-semibold">PTS</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row) => {
                const qualifies = row.rank <= 2 && row.all.played > 0;
                return (
                  <tr
                    key={row.team.id}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      qualifies && "bg-emerald-500/5",
                      row.rank === 1 && "font-medium"
                    )}
                  >
                    <td className="py-2.5 pl-4 pr-1 tabular-nums text-muted-foreground">
                      {row.rank}
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
                    <td className="py-2.5 px-1 text-center tabular-nums hidden sm:table-cell">
                      {row.all.win}
                    </td>
                    <td className="py-2.5 px-1 text-center tabular-nums hidden sm:table-cell">
                      {row.all.draw}
                    </td>
                    <td className="py-2.5 px-1 text-center tabular-nums hidden sm:table-cell">
                      {row.all.lose}
                    </td>
                    <td className="py-2.5 px-1 text-center tabular-nums">{row.all.goals.for}</td>
                    <td className="py-2.5 px-1 text-center tabular-nums">{row.all.goals.against}</td>
                    <td className="py-2.5 px-1 text-center tabular-nums">
                      {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
                    </td>
                    <td className="py-2.5 pr-4 pl-1 text-center tabular-nums font-bold text-mundial-gold">
                      {row.points}
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

export function GruposSection() {
  const { data: standings = [], isLoading } = useStandings();
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {groups.map(({ groupLabel, table, letter }) => (
        <GroupTable key={letter ?? groupLabel} groupLabel={groupLabel} table={table} />
      ))}
    </div>
  );
}
