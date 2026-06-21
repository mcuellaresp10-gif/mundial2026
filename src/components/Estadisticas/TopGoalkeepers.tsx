"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import type { TopGoalkeeperEntry } from "@/types";
import { cn } from "@/lib/utils";
import { ratingClass, olympicRankAscending } from "@/utils/formatters";

interface TopGoalkeepersProps {
  goalkeepers: TopGoalkeeperEntry[];
  title?: string;
}

function formatStat(value: number | null | undefined, suffix = ""): string {
  if (value == null) return "—";
  return `${value}${suffix}`;
}

export function TopGoalkeepers({
  goalkeepers,
  title = "Top Porteros",
}: TopGoalkeepersProps) {
  const [sortBy, setSortBy] = useState<
    "goalsConceded" | "concededPer90" | "savePercentage" | "cleanSheets" | "rating"
  >("goalsConceded");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const list = [...goalkeepers];
    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === "goalsConceded") diff = a.goalsConceded - b.goalsConceded;
      else if (sortBy === "concededPer90")
        diff = (a.concededPer90 ?? Infinity) - (b.concededPer90 ?? Infinity);
      else if (sortBy === "savePercentage")
        diff = (a.savePercentage ?? 0) - (b.savePercentage ?? 0);
      else if (sortBy === "cleanSheets") diff = a.cleanSheets - b.cleanSheets;
      else diff = a.rating - b.rating;

      const lowerIsBetter =
        sortBy === "goalsConceded" || sortBy === "concededPer90";
      if (lowerIsBetter) {
        return sortDir === "asc" ? diff : -diff;
      }
      return sortDir === "desc" ? -diff : diff;
    });
    return list;
  }, [goalkeepers, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    const lowerIsBetter = col === "goalsConceded" || col === "concededPer90";
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir(lowerIsBetter ? "asc" : "desc");
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (sortDir === "desc" ? " ▼" : " ▲") : "";

  const displayRank = (gk: TopGoalkeeperEntry) =>
    olympicRankAscending(goalkeepers, gk.goalsConceded, "goalsConceded");

  return (
    <Card id="goalkeepers">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[880px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground text-xs">
                <th className="pb-2 pr-3 w-8">#</th>
                <th className="pb-2 pr-4 min-w-[140px]">Portero</th>
                <th
                  className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("goalsConceded")}
                >
                  Goles enc.
                  <SortIcon col="goalsConceded" />
                </th>
                <th
                  className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("concededPer90")}
                  title="Goles encajados por 90 minutos"
                >
                  GA/90
                  <SortIcon col="concededPer90" />
                </th>
                <th
                  className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("savePercentage")}
                  title="Paradas / (paradas + goles encajados)"
                >
                  % paradas
                  <SortIcon col="savePercentage" />
                </th>
                <th
                  className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("cleanSheets")}
                >
                  V. invicta
                  <SortIcon col="cleanSheets" />
                </th>
                <th className="pb-2 pr-3 whitespace-nowrap">PJ</th>
                <th
                  className="pb-2 pr-2 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("rating")}
                >
                  Valor.
                  <SortIcon col="rating" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((gk) => (
                <tr
                  key={gk.playerId}
                  className="border-b border-border/50 hover:bg-muted/50"
                >
                  <td className="py-3 pr-3 font-mono text-mundial-gold font-bold tabular-nums">
                    {displayRank(gk)}
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/jugadores/${gk.playerId}`}
                      className="flex items-center gap-2 hover:underline min-w-0"
                    >
                      <PlayerAvatar photo={gk.photo} teamLogo={gk.teamLogo} size={32} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{gk.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{gk.team}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 pr-3 font-mono font-bold tabular-nums">
                    {gk.goalsConceded}
                  </td>
                  <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                    {formatStat(gk.concededPer90)}
                  </td>
                  <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                    {formatStat(gk.savePercentage, "%")}
                  </td>
                  <td className="py-3 pr-3 font-mono tabular-nums">
                    {gk.cleanSheets}
                  </td>
                  <td className="py-3 pr-3 font-mono tabular-nums">{gk.matches}</td>
                  <td
                    className={cn(
                      "py-3 pr-2 font-mono font-bold tabular-nums text-xs",
                      ratingClass(gk.rating)
                    )}
                  >
                    {gk.rating > 0 ? gk.rating.toFixed(1) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
