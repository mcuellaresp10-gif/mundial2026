"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { GridSkeleton } from "@/components/shared/Loading";
import type { Player, Team } from "@/types";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { formatPosition } from "@/utils/formatters";
import { positionToCode } from "@/utils/squad";
import { getStatBundle, statSummary } from "@/utils/playerStats";
import { translateTeamName } from "@/utils/teamNames";

interface GridJugadoresProps {
  players: Player[];
  teams: Team[];
  isLoading: boolean;
}

export function GridJugadores({ players, teams, isLoading }: GridJugadoresProps) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [posFilter, setPosFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"nationalGoals" | "clubGoals" | "nationalRating">("nationalGoals");

  const filtered = useMemo(() => {
    let list = [...players];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.player.name.toLowerCase().includes(q));
    }
    if (teamFilter !== "all") {
      list = list.filter((p) => p.nationalTeam?.id === Number(teamFilter));
    }
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
      return statSummary(bb.national).rating - statSummary(ba.national).rating;
    });
    return list;
  }, [players, search, teamFilter, posFilter, sortBy]);

  if (isLoading) return <GridSkeleton count={12} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Buscar jugador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="all">Todas las selecciones</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{translateTeamName(t.name)}</option>
          ))}
        </Select>
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
          <option value="nationalRating">Valoración selección</option>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} jugadores · Stats Temporada {PLAYER_STAT_SEASON_LABEL}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.slice(0, 100).map((p) => {
          const bundle = getStatBundle(p);
          const nat = statSummary(bundle.national);
          const club = statSummary(bundle.club);
          return (
            <Link key={p.player.id} href={`/jugadores/${p.player.id}`}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Image src={p.player.photo} alt={p.player.name} width={56} height={56} className="rounded-full" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{p.player.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPosition(p.statistics[0]?.games.position)}</p>
                      <p className="text-xs truncate text-muted-foreground">
                        {translateTeamName(p.nationalTeam?.name ?? nat.teamName)} · {club.teamName}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="rounded-md bg-colombia-blue/10 dark:bg-blue-950/30 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Selección</p>
                      <p className="text-[9px] text-muted-foreground">Temp. {PLAYER_STAT_SEASON_LABEL}</p>
                      <p className="font-mono font-bold">{nat.goals}G {nat.assists}A</p>
                    </div>
                    <div className="rounded-md bg-muted/60 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Club</p>
                      <p className="text-[9px] text-muted-foreground">Temp. {PLAYER_STAT_SEASON_LABEL}</p>
                      <p className="font-mono font-bold">{club.goals}G {club.assists}A</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
