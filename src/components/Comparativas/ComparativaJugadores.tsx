"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ComparativaRadar } from "@/components/shared/RadarChart";
import type { Player } from "@/types";
import { playerToRadarStats } from "@/utils/calculations";
import { parseRating } from "@/utils/formatters";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { getStatBundle } from "@/utils/playerStats";
import { useWorldCupBenchmarkPool } from "@/hooks/useWorldCupBenchmarkPool";

function nationalStat(player: Player) {
  return getStatBundle(player).national ?? player.statistics[0];
}

interface ComparativaJugadoresProps {
  players: Player[];
}

export function ComparativaJugadores({ players }: ComparativaJugadoresProps) {
  const [posFilter, setPosFilter] = useState("F");
  const [playerAId, setPlayerAId] = useState<number>(0);
  const [playerBId, setPlayerBId] = useState<number>(0);

  const { players: benchmarkPool, isLoading: loadingPool, isReady: poolReady } =
    useWorldCupBenchmarkPool(true);

  const filtered = useMemo(
    () =>
      players
        .filter((p) => nationalStat(p)?.games.position === posFilter)
        .sort((a, b) => parseRating(nationalStat(b)?.games.rating) - parseRating(nationalStat(a)?.games.rating))
        .slice(0, 20),
    [players, posFilter]
  );

  const playerA = filtered.find((p) => p.player.id === playerAId) ?? filtered[0];
  const playerB = filtered.find((p) => p.player.id === playerBId) ?? filtered[1];

  useEffect(() => {
    if (filtered[0] && !playerAId) setPlayerAId(filtered[0].player.id);
    if (filtered[1] && !playerBId) setPlayerBId(filtered[1].player.id);
  }, [filtered, playerAId, playerBId]);

  const pool = poolReady ? benchmarkPool : players;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Liga de Posiciones — Comparativa</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Radar normalizado vs pool Mundial · stats club · Temp. {PLAYER_STAT_SEASON_LABEL}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Select value={posFilter} onChange={(e) => setPosFilter(e.target.value)}>
            <option value="G">Porteros</option>
            <option value="D">Defensas</option>
            <option value="M">Mediocampistas</option>
            <option value="F">Delanteros</option>
          </Select>
          <Select value={playerA?.player.id ?? 0} onChange={(e) => setPlayerAId(Number(e.target.value))}>
            {filtered.map((p) => (
              <option key={p.player.id} value={p.player.id}>{p.player.name}</option>
            ))}
          </Select>
          <span className="self-center font-bold">VS</span>
          <Select value={playerB?.player.id ?? 0} onChange={(e) => setPlayerBId(Number(e.target.value))}>
            {filtered.map((p) => (
              <option key={p.player.id} value={p.player.id}>{p.player.name}</option>
            ))}
          </Select>
        </div>

        {playerA && playerB && (
          <>
            {loadingPool && !poolReady ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <ComparativaRadar
                dataA={playerToRadarStats(playerA, pool)}
                dataB={playerToRadarStats(playerB, pool)}
                labelA={playerA.player.name}
                labelB={playerB.player.name}
              />
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <PlayerStats player={playerA} />
              <PlayerStats player={playerB} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PlayerStats({ player }: { player: Player }) {
  const stat = getStatBundle(player).national;
  const club = getStatBundle(player).club;
  return (
    <div className="p-3 rounded-lg bg-muted/50 space-y-1">
      <div className="flex items-center gap-2 mb-2">
        <Image src={player.player.photo} alt="" width={32} height={32} className="rounded-full" />
        <span className="font-semibold">{player.player.name}</span>
      </div>
      <p className="text-xs text-muted-foreground uppercase">Selección · Temp. {PLAYER_STAT_SEASON_LABEL}</p>
      <p>Goles: {stat?.goals.total ?? 0}</p>
      <p>Asistencias: {stat?.goals.assists ?? 0}</p>
      <p>Rating: {parseRating(stat?.games.rating).toFixed(1)}</p>
      <p className="text-xs text-muted-foreground uppercase mt-2">Club · Temp. {PLAYER_STAT_SEASON_LABEL}</p>
      <p>Goles: {club?.goals.total ?? 0} · Asistencias: {club?.goals.assists ?? 0}</p>
    </div>
  );
}
