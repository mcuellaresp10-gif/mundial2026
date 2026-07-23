"use client";

import { ScoutingExplorer } from "@/components/Jugadores/Scouting";
import { LeagueSelector } from "@/components/shared/LeagueSelector";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { LEAGUE_ID } from "@/lib/utils";
import {
  SCOUTING_MIN_LEAGUE_MINUTES,
  SCOUTING_MIN_WC_MINUTES,
} from "@/utils/worldCupScoutingMetrics";

export default function ScoutingPage() {
  const { league, leagues, leagueIds, isMulti } = useActiveLeague();
  const minMinutes =
    leagueIds.length === 1 && leagueIds[0] === LEAGUE_ID
      ? SCOUTING_MIN_WC_MINUTES
      : SCOUTING_MIN_LEAGUE_MINUTES;
  const label = isMulti
    ? leagues.map((l) => l.shortName).join(" + ")
    : `${league.shortName} · ${league.defaultSeason}`;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estadísticas jugadores</h1>
          <p className="text-muted-foreground mt-1">
            {label} · radar, scatter y percentiles vs pares (≥{minMinutes} min,
            misma posición)
            {isMulti ? " · stats sumadas si juega en varias" : ""}
          </p>
        </div>
        <LeagueSelector variant="page" />
      </div>
      <ScoutingExplorer />
    </div>
  );
}
