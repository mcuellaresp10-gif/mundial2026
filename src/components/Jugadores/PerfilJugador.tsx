"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RadarChart } from "@/components/shared/RadarChart";
import { StatsGrid } from "./PlayerStatsPanel";
import type { Player, AnalysisPlayer } from "@/types";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { formatPosition } from "@/utils/formatters";
import { getStatBundle, statSummary } from "@/utils/playerStats";
import {
  computePlayerRadar,
  computeMundialAverageRadar,
  eligibleRadarPoolPlayers,
  mundialAverageRadar,
} from "@/utils/radarMetrics";
import { useWorldCupBenchmarkPool, usePrefetchRadarBenchmark } from "@/hooks/useWorldCupBenchmarkPool";
import { fetchPlayerAnalysis } from "@/services/analysisAI";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PerfilJugadorProps {
  player: Player;
}

export function PerfilJugador({ player }: PerfilJugadorProps) {
  const bundle = getStatBundle(player);
  const [activeTab, setActiveTab] = useState("club");
  const [analysis, setAnalysis] = useState<AnalysisPlayer | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisRequested, setAnalysisRequested] = useState(false);

  const loadBenchmark = activeTab === "advanced";
  usePrefetchRadarBenchmark();

  const {
    players: benchmarkPool,
    isLoading: loadingPool,
    isReady: poolReady,
    isRevalidating,
  } = useWorldCupBenchmarkPool(loadBenchmark);

  const nationalSummary = statSummary(bundle.national);
  const clubSummary = statSummary(bundle.club);

  const position = bundle.club?.games.position ?? player.statistics[0]?.games.position ?? "M";
  const positionLabel = formatPosition(position);

  const radar = useMemo(() => {
    if (!bundle.club) return null;
    return computePlayerRadar(bundle.club, position, benchmarkPool);
  }, [bundle.club, position, benchmarkPool]);

  const { avgMundial, poolSampleSize } = useMemo(() => {
    if (benchmarkPool.length === 0) {
      return { avgMundial: mundialAverageRadar(), poolSampleSize: 0 };
    }
    return {
      avgMundial: computeMundialAverageRadar(benchmarkPool, position),
      poolSampleSize: eligibleRadarPoolPlayers(benchmarkPool).length,
    };
  }, [benchmarkPool, position]);

  useEffect(() => {
    if (activeTab !== "ai" || analysisRequested || loadingAnalysis || analysis) return;
    setAnalysisRequested(true);
    setLoadingAnalysis(true);
    fetchPlayerAnalysis(player.player.id)
      .then(setAnalysis)
      .catch(() => null)
      .finally(() => setLoadingAnalysis(false));
  }, [activeTab, analysis, analysisRequested, loadingAnalysis, player.player.id]);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            <CardTitle>Radar vs promedio Mundial · {positionLabel}</CardTitle>
            <p className="text-sm text-muted-foreground font-normal">
              Club · Temp. {PLAYER_STAT_SEASON_LABEL} (todas competiciones) · escala 0–10 (5 = promedio por posición)
              {poolSampleSize > 0 && ` · Promedio Mundial = media de ${poolSampleSize} convocados`}
            </p>
          </CardHeader>
          <CardContent>
            {!bundle.club ? (
              <p className="text-sm text-muted-foreground">Se necesitan stats de club para el radar.</p>
            ) : loadingPool && !poolReady ? (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  Cargando pool del Mundial (primera vez puede tardar 1–2 min)…
                </p>
                {radar && (
                  <RadarChart
                    data={radar}
                    compare={avgMundial}
                    labelA={player.player.name}
                    labelB="Promedio Mundial"
                  />
                )}
                <Skeleton className="h-2 w-full mt-3" />
              </>
            ) : (
              <>
                {isRevalidating && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Actualizando comparativa del pool…
                  </p>
                )}
                {!poolReady && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Comparativa aproximada (pool aún cargando).
                  </p>
                )}
                {radar && (
                  <RadarChart
                    data={radar}
                    compare={avgMundial}
                    labelA={player.player.name}
                    labelB="Promedio Mundial"
                  />
                )}
              </>
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
