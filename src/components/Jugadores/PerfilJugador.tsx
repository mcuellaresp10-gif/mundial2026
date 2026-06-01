"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RadarChart } from "@/components/shared/RadarChart";
import { StatsGrid } from "./PlayerStatsPanel";
import type { Player, AnalysisPlayer } from "@/types";
import { playerToRadarStats, averageRadarByPosition } from "@/utils/calculations";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { formatPosition } from "@/utils/formatters";
import { getStatBundle, statSummary } from "@/utils/playerStats";
import { buildPlayerAnalysisPrompt, fetchAnalysis } from "@/services/analysisAI";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PerfilJugadorProps {
  player: Player;
  allPlayers?: Player[];
}

export function PerfilJugador({ player, allPlayers = [] }: PerfilJugadorProps) {
  const bundle = getStatBundle(player);
  const [analysis, setAnalysis] = useState<AnalysisPlayer | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const nationalSummary = statSummary(bundle.national);
  const clubSummary = statSummary(bundle.club);

  const radarPlayer: Player = bundle.club
    ? { ...player, statistics: [bundle.club] }
    : player;
  const radar = playerToRadarStats(radarPlayer);
  const avgPos = averageRadarByPosition(
    allPlayers.map((p) =>
      bundle.club ? { ...p, statistics: [getStatBundle(p).club ?? p.statistics[0]].filter(Boolean) as Player["statistics"] } : p
    ),
    bundle.club?.games.position ?? player.statistics[0]?.games.position ?? "M"
  );

  useEffect(() => {
    setLoadingAnalysis(true);
    const prompt = buildPlayerAnalysisPrompt({
      name: player.player.name,
      position: formatPosition(bundle.national?.games.position ?? bundle.club?.games.position),
      team: player.nationalTeam?.name ?? nationalSummary.teamName,
      stats: `Selección: ${nationalSummary.goals}G ${nationalSummary.assists}A (rating ${nationalSummary.rating}). Club: ${clubSummary.goals}G ${clubSummary.assists}A en ${clubSummary.teamName} (rating ${clubSummary.rating}).`,
      age: player.player.age ?? undefined,
    });
    fetchAnalysis<AnalysisPlayer>("player", prompt)
      .then(setAnalysis)
      .catch(() => null)
      .finally(() => setLoadingAnalysis(false));
  }, [player.player.id, player.player.name, player.player.age, player.nationalTeam?.name, nationalSummary, clubSummary, bundle.national?.games.position, bundle.club?.games.position]);

  return (
    <Tabs defaultValue="club">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="club">Club · Temp. {PLAYER_STAT_SEASON_LABEL}</TabsTrigger>
        <TabsTrigger value="national">Selección · Temp. {PLAYER_STAT_SEASON_LABEL}</TabsTrigger>
        <TabsTrigger value="worldcup">Mundial 2026</TabsTrigger>
        <TabsTrigger value="advanced">Stats avanzadas</TabsTrigger>
        <TabsTrigger value="ai">Análisis IA</TabsTrigger>
      </TabsList>

      <TabsContent value="club">
        <StatsGrid
          stat={bundle.club}
          emptyMessage={`Sin estadísticas de club para la Temporada ${PLAYER_STAT_SEASON_LABEL}.`}
        />
      </TabsContent>

      <TabsContent value="national">
        <StatsGrid
          stat={bundle.national}
          emptyMessage={`Sin partidos registrados con la selección en Temporada ${PLAYER_STAT_SEASON_LABEL}.`}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Incluye amistosos, eliminatorias y partidos de preparación · Temporada {PLAYER_STAT_SEASON_LABEL}.
        </p>
      </TabsContent>

      <TabsContent value="worldcup">
        <StatsGrid
          stat={bundle.worldCup}
          emptyMessage="Aún no hay estadísticas de Mundial 2026 para este jugador (el torneo no ha comenzado o no ha jugado minutos)."
        />
      </TabsContent>

      <TabsContent value="advanced">
        <Card>
          <CardHeader>
            <CardTitle>Radar vs promedio de posición (club)</CardTitle>
          </CardHeader>
          <CardContent>
            {bundle.club ? (
              <RadarChart data={radar} compare={avgPos} labelA={player.player.name} labelB="Promedio" />
            ) : (
              <p className="text-sm text-muted-foreground">Se necesitan stats de club para el radar.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai">
        {loadingAnalysis ? (
          <Skeleton className="h-48 w-full" />
        ) : analysis ? (
          <div className="space-y-4">
            <AIBlock title="¿Por qué fue convocado?" content={analysis.convocatoria} />
            <AIBlock title="Rol esperado" content={analysis.rolEsperado} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base text-mundial-green">Fortalezas</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">{analysis.fortalezas.map((f, i) => <li key={i} className="text-sm">✓ {f}</li>)}</ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base text-mundial-red">Debilidades</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">{analysis.debilidades.map((d, i) => <li key={i} className="text-sm">✗ {d}</li>)}</ul>
                </CardContent>
              </Card>
            </div>
            <AIBlock title="Posible XI" content={analysis.posibleXI} />
            <AIBlock title="Comparativa con competidores" content={analysis.comparativaCompetidores} />
            <AIBlock title="Riesgo/Oportunidad" content={analysis.riesgoOportunidad} />
          </div>
        ) : (
          <p className="text-muted-foreground">Análisis no disponible</p>
        )}
      </TabsContent>
    </Tabs>
  );
}

function AIBlock({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-sm leading-relaxed">{content}</p></CardContent>
    </Card>
  );
}
