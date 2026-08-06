"use client";

import { findSimilarPlayers } from "@/utils/scoutingSimilarity";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";
import type { MetricKey } from "@/config/positionMetricProfiles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface ScoutingSimilarProps {
  profile: ScoutingProfile;
  peers: ScoutingProfile[];
  focusKeys: MetricKey[];
  onSelect: (id: number) => void;
}

export function ScoutingSimilarList({
  profile,
  peers,
  focusKeys,
  onSelect,
}: ScoutingSimilarProps) {
  const similar = useMemo(
    () => findSimilarPlayers(profile, peers, focusKeys, 8),
    [profile, peers, focusKeys]
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Jugadores como {profile.name.split(" ").pop()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y text-sm">
          {similar.map(({ profile: p, score }) => (
            <li key={p.playerId}>
              <button
                type="button"
                onClick={() => onSelect(p.playerId)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/50"
                )}
              >
                <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">{p.team}</span>
                <span className="font-mono text-xs text-mundial-gold">{score}</span>
              </button>
            </li>
          ))}
          {similar.length === 0 && (
            <li className="px-3 py-3 text-muted-foreground text-xs">
              Sin pares suficientes en el pool.
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
