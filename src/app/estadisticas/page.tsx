"use client";

import { useMemo, useState } from "react";
import { TopScorers, TopAssists } from "@/components/Estadisticas/TopScorers";
import { TopGoalkeepers } from "@/components/Estadisticas/TopGoalkeepers";
import { EstadisticasDashboard } from "@/components/Estadisticas/EstadisticasDashboard";
import { useTeams } from "@/hooks/usePartidos";
import {
  useAllPlayers,
  useWorldCupTopScorers,
  useWorldCupTopAssists,
  useWorldCupTopGoalkeepers,
  extractTopScorers,
  extractTopAssists,
  extractTopGoalkeepers,
} from "@/hooks/useJugadores";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { TopGoalkeeperEntry, TopScorerEntry } from "@/types";

function TournamentLeaderTabs({
  scorers,
  assists,
  goalkeepers,
  loading,
  scorersTitle,
  assistsTitle,
  goalkeepersTitle,
  emptyMessage,
}: {
  scorers: TopScorerEntry[];
  assists: TopScorerEntry[];
  goalkeepers: TopGoalkeeperEntry[];
  loading: boolean;
  scorersTitle: string;
  assistsTitle: string;
  goalkeepersTitle: string;
  emptyMessage: string;
}) {
  const hasData =
    scorers.length > 0 || assists.length > 0 || goalkeepers.length > 0;

  if (loading && !hasData) {
    return <p className="text-sm text-muted-foreground py-4">Cargando estadísticas…</p>;
  }

  if (!hasData) {
    return <p className="text-sm text-muted-foreground py-4">{emptyMessage}</p>;
  }

  return (
    <Tabs defaultValue="scorers" className="mt-4">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="scorers">Top Goleadores</TabsTrigger>
        <TabsTrigger value="assists">Top Asistentes</TabsTrigger>
        <TabsTrigger value="goalkeepers">Top Porteros</TabsTrigger>
      </TabsList>
      <TabsContent value="scorers">
        {scorers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Sin goles registrados aún.</p>
        ) : (
          <TopScorers scorers={scorers} title={scorersTitle} />
        )}
      </TabsContent>
      <TabsContent value="assists">
        {assists.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Sin asistencias registradas aún.</p>
        ) : (
          <TopAssists assists={assists} title={assistsTitle} />
        )}
      </TabsContent>
      <TabsContent value="goalkeepers">
        {goalkeepers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Sin datos de porteros aún.</p>
        ) : (
          <TopGoalkeepers goalkeepers={goalkeepers} title={goalkeepersTitle} />
        )}
      </TabsContent>
    </Tabs>
  );
}

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

  const { scorers: wcScorers, isLoading: loadingWcScorers } = useWorldCupTopScorers(50);
  const { assists: wcAssists, isLoading: loadingWcAssists } = useWorldCupTopAssists(50);
  const { goalkeepers: wcGoalkeepers, isLoading: loadingWcGoalkeepers } =
    useWorldCupTopGoalkeepers();
  const natScorers = useMemo(() => extractTopScorers(players, "national"), [players]);
  const clubScorers = useMemo(() => extractTopScorers(players, "club"), [players]);
  const natAssists = useMemo(() => extractTopAssists(players, "national"), [players]);
  const natGoalkeepers = useMemo(() => extractTopGoalkeepers(players, "national"), [players]);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Estadísticas del Torneo</h1>
        <p className="text-muted-foreground mt-1">
          Goleadores, asistidores y porteros por contexto (Mundial / Selección / Club)
        </p>
      </div>

      <EstadisticasDashboard />

      <Tabs defaultValue="worldcup" onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="worldcup">Mundial 2026</TabsTrigger>
          <TabsTrigger value="national">Selección · Temp. {PLAYER_STAT_SEASON_LABEL}</TabsTrigger>
          <TabsTrigger value="club">Club · Temp. {PLAYER_STAT_SEASON_LABEL}</TabsTrigger>
        </TabsList>

        <TabsContent value="worldcup">
          <TournamentLeaderTabs
            scorers={wcScorers}
            assists={wcAssists}
            goalkeepers={wcGoalkeepers}
            loading={loadingWcScorers || loadingWcAssists || loadingWcGoalkeepers}
            scorersTitle="Top Goleadores — Mundial 2026"
            assistsTitle="Top Asistentes — Mundial 2026"
            goalkeepersTitle="Top Porteros — Mundial 2026"
            emptyMessage="Aún no hay datos del Mundial 2026. El torneo no ha comenzado o no hay estadísticas disponibles."
          />
        </TabsContent>

        <TabsContent value="national">
          <TournamentLeaderTabs
            scorers={natScorers}
            assists={natAssists}
            goalkeepers={natGoalkeepers}
            loading={isFetching && needsSquadStats}
            scorersTitle={`Top Goleadores — Selección (Temporada ${PLAYER_STAT_SEASON_LABEL})`}
            assistsTitle={`Top Asistentes — Selección (Temporada ${PLAYER_STAT_SEASON_LABEL})`}
            goalkeepersTitle={`Top Porteros — Selección (Temporada ${PLAYER_STAT_SEASON_LABEL})`}
            emptyMessage="Sin estadísticas de selección disponibles."
          />
        </TabsContent>

        <TabsContent value="club">
          {isFetching && needsClubStats ? (
            <p className="text-sm text-muted-foreground py-4">Cargando estadísticas de club (puede tardar un minuto)…</p>
          ) : clubScorers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Sin goles de club registrados.</p>
          ) : (
            <TopScorers scorers={clubScorers} title={`Top Goleadores — Club (Temporada ${PLAYER_STAT_SEASON_LABEL})`} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
