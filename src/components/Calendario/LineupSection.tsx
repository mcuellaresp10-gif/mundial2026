"use client";

import { useMemo } from "react";
import type { Lineup } from "@/types";
import { LineupPitch } from "@/components/Calendario/LineupPitch";
import { useAllPlayers } from "@/hooks/useJugadores";
import { buildLineupPlayerMetaMap } from "@/utils/lineupPlayerMeta";

interface LineupSectionProps {
  lineups: Lineup[];
}

export function LineupSection({ lineups }: LineupSectionProps) {
  const teamIds = useMemo(
    () => lineups.map((lu) => lu.team.id),
    [lineups]
  );

  const { data: squadPlayers, isLoading } = useAllPlayers(teamIds, true, teamIds.length > 0);

  const metaMap = useMemo(() => {
    const map = new Map<number, { clubName: string | null; age: number | null }>();
    if (!squadPlayers?.length) return map;

    for (const lu of lineups) {
      const teamMap = buildLineupPlayerMetaMap(squadPlayers, lu.team.id);
      for (const [id, meta] of teamMap) {
        if (!map.has(id)) map.set(id, meta);
      }
    }

    for (const p of squadPlayers) {
      if (!map.has(p.player.id)) {
        const fallback = buildLineupPlayerMetaMap([p], 0);
        const meta = fallback.get(p.player.id);
        if (meta) map.set(p.player.id, meta);
      }
    }

    return map;
  }, [squadPlayers, lineups]);

  if (lineups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Alineaciones no confirmadas</p>
    );
  }

  return (
    <div className="space-y-6">
      {isLoading && (
        <p className="text-xs text-muted-foreground text-center">Cargando datos de jugadores…</p>
      )}
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {lineups.map((lu) => (
          <LineupPitch key={lu.team.id} lineup={lu} metaMap={metaMap} />
        ))}
      </div>
    </div>
  );
}
