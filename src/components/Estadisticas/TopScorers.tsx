"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import type { TopScorerEntry } from "@/types";
import { cn } from "@/lib/utils";
import { ratingClass, olympicRank } from "@/utils/formatters";

interface TopScorersProps {
  scorers: TopScorerEntry[];
  title?: string;
  /** Muestra goles/90, min/gol, tiros y conversiones (como API-Football). */
  showShootingStats?: boolean;
}

function formatStat(value: number | null | undefined, suffix = ""): string {
  if (value == null) return "—";
  return `${value}${suffix}`;
}

export function TopScorers({
  scorers,
  title = "Top Goleadores",
  showShootingStats = true,
}: TopScorersProps) {
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
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (sortDir === "desc" ? " ▼" : " ▲") : "";

  const hasShootingData =
    showShootingStats &&
    scorers.some(
      (s) =>
        s.goalsPer90 != null ||
        s.totalShots != null ||
        s.goalConversion != null ||
        s.shotAccuracy != null
    );

  return (
    <Card id="scorers">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground text-xs">
                <th className="pb-2 pr-3 w-8">#</th>
                <th className="pb-2 pr-4 min-w-[140px]">Jugador</th>
                <th
                  className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("goals")}
                >
                  Goles
                  <SortIcon col="goals" />
                </th>
                <th
                  className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("assists")}
                >
                  Asist.
                  <SortIcon col="assists" />
                </th>
                <th className="pb-2 pr-3 whitespace-nowrap">PJ</th>
                {hasShootingData && (
                  <>
                    <th className="pb-2 pr-3 whitespace-nowrap" title="Goles por 90 minutos">
                      G/90
                    </th>
                    <th className="pb-2 pr-3 whitespace-nowrap" title="Minutos por gol">
                      Min/gol
                    </th>
                    <th className="pb-2 pr-3 whitespace-nowrap">Tiros</th>
                    <th className="pb-2 pr-3 whitespace-nowrap" title="Conversión a gol">
                      Conv. %
                    </th>
                    <th className="pb-2 pr-3 whitespace-nowrap" title="Precisión de tiro">
                      Prec. %
                    </th>
                  </>
                )}
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
              {sorted.map((s, i) => (
                <tr
                  key={s.playerId}
                  className="border-b border-border/50 hover:bg-muted/50"
                >
                  <td className="py-3 pr-3 font-mono text-mundial-gold font-bold tabular-nums">
                    {olympicRank(scorers, s.goals, "goals")}
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/jugadores/${s.playerId}`}
                      className="flex items-center gap-2 hover:underline min-w-0"
                    >
                      <PlayerAvatar photo={s.photo} teamLogo={s.teamLogo} size={32} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.team}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 pr-3 font-mono font-bold text-base tabular-nums">
                    {s.goals}
                  </td>
                  <td className="py-3 pr-3 font-mono tabular-nums">{s.assists}</td>
                  <td className="py-3 pr-3 font-mono tabular-nums">{s.matches}</td>
                  {hasShootingData && (
                    <>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.goalsPer90)}
                      </td>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.minsPerGoal)}
                      </td>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.totalShots)}
                      </td>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.goalConversion, "%")}
                      </td>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.shotAccuracy, "%")}
                      </td>
                    </>
                  )}
                  <td
                    className={cn(
                      "py-3 pr-2 font-mono font-bold tabular-nums text-xs",
                      ratingClass(s.rating)
                    )}
                  >
                    {s.rating > 0 ? s.rating.toFixed(1) : "—"}
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

export function TopAsistentes({
  scorers,
  title = "Top Asistentes",
}: {
  scorers: TopScorerEntry[];
  title?: string;
}) {
  return <TopAssists assists={scorers} title={title} />;
}

interface TopAssistsProps {
  assists: TopScorerEntry[];
  title?: string;
}

export function TopAssists({ assists, title = "Top Asistentes" }: TopAssistsProps) {
  const [sortBy, setSortBy] = useState<
    "assists" | "goals" | "chancesCreated" | "passAccuracy" | "rating"
  >("assists");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const list = [...assists];
    list.sort((a, b) => {
      let diff = 0;
      if (sortBy === "assists") diff = a.assists - b.assists;
      else if (sortBy === "goals") diff = a.goals - b.goals;
      else if (sortBy === "chancesCreated")
        diff = (a.chancesCreated ?? 0) - (b.chancesCreated ?? 0);
      else if (sortBy === "passAccuracy")
        diff = (a.passAccuracy ?? 0) - (b.passAccuracy ?? 0);
      else diff = a.rating - b.rating;
      return sortDir === "desc" ? -diff : diff;
    });
    return list;
  }, [assists, sortBy, sortDir]);

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortBy(col);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (sortDir === "desc" ? " ▼" : " ▲") : "";

  const hasPassingData = assists.some(
    (s) =>
      s.chancesCreated != null ||
      s.totalPasses != null ||
      s.passAccuracy != null
  );

  return (
    <Card id="assists">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground text-xs">
                <th className="pb-2 pr-3 w-8">#</th>
                <th className="pb-2 pr-4 min-w-[140px]">Jugador</th>
                <th
                  className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("assists")}
                >
                  Asist.
                  <SortIcon col="assists" />
                </th>
                <th
                  className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                  onClick={() => toggleSort("goals")}
                >
                  Goles
                  <SortIcon col="goals" />
                </th>
                <th className="pb-2 pr-3 whitespace-nowrap">PJ</th>
                {hasPassingData && (
                  <>
                    <th
                      className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                      onClick={() => toggleSort("chancesCreated")}
                      title="Pases clave / ocasiones de gol creadas"
                    >
                      Ocasiones
                      <SortIcon col="chancesCreated" />
                    </th>
                    <th className="pb-2 pr-3 whitespace-nowrap" title="Ocasiones por 90 minutos">
                      Ocas./90
                    </th>
                    <th className="pb-2 pr-3 whitespace-nowrap">Pases tot.</th>
                    <th className="pb-2 pr-3 whitespace-nowrap">Completos</th>
                    <th className="pb-2 pr-3 whitespace-nowrap">Incompletos</th>
                    <th
                      className="pb-2 pr-3 cursor-pointer whitespace-nowrap"
                      onClick={() => toggleSort("passAccuracy")}
                      title="Precisión de pase"
                    >
                      Prec. pase
                      <SortIcon col="passAccuracy" />
                    </th>
                  </>
                )}
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
              {sorted.map((s, i) => (
                <tr
                  key={s.playerId}
                  className="border-b border-border/50 hover:bg-muted/50"
                >
                  <td className="py-3 pr-3 font-mono text-mundial-gold font-bold tabular-nums">
                    {olympicRank(assists, s.assists, "assists")}
                  </td>
                  <td className="py-3 pr-4">
                    <Link
                      href={`/jugadores/${s.playerId}`}
                      className="flex items-center gap-2 hover:underline min-w-0"
                    >
                      <PlayerAvatar photo={s.photo} teamLogo={s.teamLogo} size={32} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.team}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 pr-3 font-mono font-bold text-base tabular-nums">
                    {s.assists}
                  </td>
                  <td className="py-3 pr-3 font-mono tabular-nums">{s.goals}</td>
                  <td className="py-3 pr-3 font-mono tabular-nums">{s.matches}</td>
                  {hasPassingData && (
                    <>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.chancesCreated)}
                      </td>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.chancesPer90)}
                      </td>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.totalPasses)}
                      </td>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.passesComplete)}
                      </td>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.passesIncomplete)}
                      </td>
                      <td className="py-3 pr-3 font-mono tabular-nums text-xs">
                        {formatStat(s.passAccuracy, "%")}
                      </td>
                    </>
                  )}
                  <td
                    className={cn(
                      "py-3 pr-2 font-mono font-bold tabular-nums text-xs",
                      ratingClass(s.rating)
                    )}
                  >
                    {s.rating > 0 ? s.rating.toFixed(1) : "—"}
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
