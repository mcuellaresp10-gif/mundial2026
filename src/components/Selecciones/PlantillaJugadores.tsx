"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TableSkeleton } from "@/components/shared/Loading";
import { StatBadge } from "@/components/Jugadores/PlayerStatsPanel";
import type { Player } from "@/types";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { formatPosition } from "@/utils/formatters";
import { positionToCode } from "@/utils/squad";
import { getStatBundle, statSummary } from "@/utils/playerStats";

interface PlantillaJugadoresProps {
  players: Player[];
  isLoading: boolean;
}

export function PlantillaJugadores({ players, isLoading }: PlantillaJugadoresProps) {
  const [posFilter, setPosFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"nationalGoals" | "clubGoals" | "age">("nationalGoals");

  const filtered = useMemo(() => {
    let list = [...players];
    if (posFilter !== "all") {
      list = list.filter(
        (p) => positionToCode(p.statistics[0]?.games.position) === posFilter
      );
    }
    list.sort((a, b) => {
      const ba = getStatBundle(a);
      const bb = getStatBundle(b);
      if (sortBy === "nationalGoals") {
        return (bb.national?.goals.total ?? 0) - (ba.national?.goals.total ?? 0);
      }
      if (sortBy === "clubGoals") {
        return (bb.club?.goals.total ?? 0) - (ba.club?.goals.total ?? 0);
      }
      return (b.player.age ?? 0) - (a.player.age ?? 0);
    });
    return list;
  }, [players, posFilter, sortBy]);

  if (isLoading) return <TableSkeleton rows={8} />;

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plantilla Convocada</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          Convocatoria aún no publicada en API-Football para esta selección.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>Plantilla Convocada ({filtered.length})</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Stats de selección y club separadas · Temporada {PLAYER_STAT_SEASON_LABEL}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
              <option value="all">Todas las posiciones</option>
              <option value="G">Portero</option>
              <option value="D">Defensa</option>
              <option value="M">Mediocampista</option>
              <option value="F">Delantero</option>
            </Select>
            <Select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
              <option value="nationalGoals">Goles selección</option>
              <option value="clubGoals">Goles club</option>
              <option value="age">Edad</option>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">Jugador</th>
                <th className="pb-2 pr-4">Pos</th>
                <th className="pb-2 pr-4">Club</th>
                <th className="pb-2 pr-4">Edad</th>
                <th className="pb-2 pr-4 text-center">Selección<br /><span className="text-[10px] font-normal">Temp. {PLAYER_STAT_SEASON_LABEL}</span></th>
                <th className="pb-2 pr-4 text-center">Club<br /><span className="text-[10px] font-normal">Temp. {PLAYER_STAT_SEASON_LABEL}</span></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const bundle = getStatBundle(p);
                const nat = statSummary(bundle.national);
                const club = statSummary(bundle.club);
                const dorsal = bundle.national?.games.number ?? bundle.club?.games.number;
                return (
                  <tr key={p.player.id} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 pr-4 font-mono">{dorsal ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <Link href={`/jugadores/${p.player.id}`} className="flex items-center gap-2 hover:underline">
                        <Image src={p.player.photo} alt="" width={32} height={32} className="rounded-full" />
                        <span className="font-medium">{p.player.name}</span>
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{formatPosition(p.statistics[0]?.games.position)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{club.teamName}</td>
                    <td className="py-3 pr-4 font-mono">{p.player.age ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <StatBadge label="SEL" goals={nat.goals} assists={nat.assists} rating={nat.rating} />
                    </td>
                    <td className="py-3 pr-4">
                      <StatBadge label="CLUB" goals={club.goals} assists={club.assists} rating={club.rating} />
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
