"use client";

import { useMemo, useState } from "react";
import { TopScorers, TopAsistentes } from "@/components/Estadisticas/TopScorers";
import { EstadisticasDashboard } from "@/components/Estadisticas/EstadisticasDashboard";
import { useTeams } from "@/hooks/usePartidos";
import {
  useAllPlayers,
  useWorldCupTopScorers,
  extractTopScorers,
  extractTopAssists,
} from "@/hooks/useJugadores";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function EstadisticasPage() {
  const { data: teams = [] } = useTeams();
  const teamIds = useMemo(() => teams.map((t) => t.id), [teams]);
  const [activeTab, setActiveTab] = useState<"worldcup" | "national" | "club">("worldcup");
  const needsClubStats = activeTab === "club";
  const needsSquadStats = activeTab === "national" || activeTab === "club";
  const { data: players = [], isFetching } = useAllPlayers(
    teamIds,
    needsClubStats,
    needsSquadStats
  );

  const {
    scorers: wcScorers,
    assists: wcAssists,
    isLoading: loadingWcScorers,
  } = useWorldCupTopScorers(50);
  const natScorers = useMemo(() => extractTopScorers(players, "national"), [players]);
  const clubScorers = useMemo(() => extractTopScorers(players, "club"), [players]);
  const natAssists = useMemo(() => extractTopAssists(players, "national"), [players]);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Estadísticas del Torneo</h1>
        <p className="text-muted-foreground mt-1">
          Agregadas del Mundial 2026 · Goleadores separados por contexto (Mundial / Selección / Club)
        </p>
      </div>

      <EstadisticasDashboard />

      <Tabs defaultValue="worldcup" onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="worldcup">Goleadores Mundial 2026</TabsTrigger>
          <TabsTrigger value="national">Goleadores Selección · Temp. {PLAYER_STAT_SEASON_LABEL}</TabsTrigger>
          <TabsTrigger value="club">Goleadores Club · Temp. {PLAYER_STAT_SEASON_LABEL}</TabsTrigger>
        </TabsList>

        <TabsContent value="worldcup">
          {loadingWcScorers && wcScorers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Cargando goleadores del Mundial…</p>
          ) : wcScorers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              Aún no hay goles registrados en el Mundial 2026. El torneo no ha comenzado o no hay datos disponibles.
            </p>
          ) : (
            <>
              <TopScorers scorers={wcScorers} title="Top Goleadores — Mundial 2026" />
              <TopAsistentes scorers={wcAssists} title="Top Asistentes — Mundial 2026" />
            </>
          )}
        </TabsContent>

        <TabsContent value="national">
          <TopScorers scorers={natScorers} title={`Top Goleadores — Selección (Temporada ${PLAYER_STAT_SEASON_LABEL})`} />
          <TopAsistentes scorers={natAssists} title={`Top Asistentes — Selección (Temporada ${PLAYER_STAT_SEASON_LABEL})`} />
        </TabsContent>

        <TabsContent value="club">
          {isFetching && needsClubStats ? (
            <p className="text-sm text-muted-foreground py-4">Cargando estadísticas de club (puede tardar un minuto)…</p>
          ) : (
            <TopScorers scorers={clubScorers} title={`Top Goleadores — Club (Temporada ${PLAYER_STAT_SEASON_LABEL})`} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
