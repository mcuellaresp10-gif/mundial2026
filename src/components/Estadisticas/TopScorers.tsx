"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopScorerEntry } from "@/types";
import { cn } from "@/lib/utils";
import { ratingClass } from "@/utils/formatters";

interface TopScorersProps {
  scorers: TopScorerEntry[];
  title?: string;
}

export function TopScorers({ scorers, title = "Top Goleadores" }: TopScorersProps) {
  const [sortBy, setSortBy] = useState<"goals" | "assists" | "rating">("goals");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const list = [...scorers];
    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === "goals") diff = a.goals - b.goals;
      else if (sortBy === "assists") diff = a.assists - b.assists;
      else diff = a.rating - b.rating;
      return sortDir === "desc" ? -diff : diff;
    });
    return list;
  }, [scorers, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (sortDir === "desc" ? " ▼" : " ▲") : "";

  return (
    <Card id="scorers">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">Jugador</th>
                <th className="pb-2 pr-4 cursor-pointer" onClick={() => toggleSort("goals")}>
                  Goles<SortIcon col="goals" />
                </th>
                <th className="pb-2 pr-4 cursor-pointer" onClick={() => toggleSort("assists")}>
                  Asist.<SortIcon col="assists" />
                </th>
                <th className="pb-2 pr-4">Partidos</th>
                <th className="pb-2 cursor-pointer" onClick={() => toggleSort("rating")}>
                  Rating<SortIcon col="rating" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => (
                <tr key={s.playerId} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-3 pr-4 font-mono text-mundial-gold font-bold">{i + 1}</td>
                  <td className="py-3 pr-4">
                    <Link href={`/jugadores/${s.playerId}`} className="flex items-center gap-2 hover:underline">
                      <Image src={s.photo} alt="" width={32} height={32} className="rounded-full" />
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.team}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 font-mono font-bold text-lg">{s.goals}</td>
                  <td className="py-3 pr-4 font-mono">{s.assists}</td>
                  <td className="py-3 pr-4 font-mono">{s.matches}</td>
                  <td className={cn("py-3 font-mono font-bold", ratingClass(s.rating))}>
                    {s.rating.toFixed(1)}
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

export function TopAsistentes({ scorers, title = "Top Asistentes" }: { scorers: TopScorerEntry[]; title?: string }) {
  return <TopScorers scorers={scorers} title={title} />;
}
