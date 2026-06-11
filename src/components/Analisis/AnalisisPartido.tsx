"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PartidoDetalle } from "@/components/Calendario/PartidoDetalle";
import type { Fixture, AnalysisPre, AnalysisPost } from "@/types";
import {
  buildPreMatchPrompt,
  buildPostMatchPrompt,
  fetchAnalysis,
} from "@/services/analysisAI";
import { useColombiaModeStore } from "@/stores/useColombiaModeStore";
import { formatFixtureDate, getFixtureScore, formatStatus } from "@/utils/formatters";
import { isFixtureLive } from "@/lib/liveRefresh";
import { getTeamColors } from "@/utils/colors";
import { cn } from "@/lib/utils";

interface AnalisisPartidoProps {
  fixture: Fixture;
}

export function AnalisisPartido({ fixture }: AnalisisPartidoProps) {
  const [preAnalysis, setPreAnalysis] = useState<AnalysisPre | null>(null);
  const [postAnalysis, setPostAnalysis] = useState<AnalysisPost | null>(null);
  const [loading, setLoading] = useState(true);
  const colombiaMode = useColombiaModeStore((s) => s.colombiaMode);

  const isColombia =
    fixture.teams.home.name.toLowerCase().includes("colombia") ||
    fixture.teams.away.name.toLowerCase().includes("colombia");
  const isFinished = fixture.fixture.status.short === "FT";
  const live = isFixtureLive(fixture.fixture.status.short);
  const elapsed = fixture.fixture.status.elapsed;
  const statusLabel =
    live && elapsed != null
      ? `${formatStatus(fixture.fixture.status.short)} · ${elapsed}'`
      : formatStatus(fixture.fixture.status.short);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const prePrompt = buildPreMatchPrompt({
          home: fixture.teams.home.name,
          away: fixture.teams.away.name,
          date: fixture.fixture.date,
          round: fixture.league.round,
          colombiaMode: colombiaMode && isColombia,
        });
        const pre = await fetchAnalysis<AnalysisPre>("pre-match", prePrompt);
        setPreAnalysis(pre);

        if (isFinished) {
          const postPrompt = buildPostMatchPrompt({
            home: fixture.teams.home.name,
            away: fixture.teams.away.name,
            score: getFixtureScore(fixture.goals.home, fixture.goals.away, "FT"),
            preAnalysis: pre?.contexto,
          });
          const post = await fetchAnalysis<AnalysisPost>("post-match", postPrompt);
          setPostAnalysis(post);
        }
      } catch {
        // fallback handled in API
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fixture.fixture.id, colombiaMode, isColombia, isFinished]);

  return (
    <div className="space-y-6">
      <Card className={cn(isColombia && "border-colombia-yellow/40 bg-colombia-yellow/5", live && "border-mundial-red/50")}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-8">
            <TeamBlock name={fixture.teams.home.name} logo={fixture.teams.home.logo} />
            <div className="text-center">
              <p className="text-4xl font-bold font-mono">
                {getFixtureScore(fixture.goals.home, fixture.goals.away, fixture.fixture.status.short)}
              </p>
              <p className={cn("text-sm mt-1", live ? "text-mundial-red font-semibold" : "text-muted-foreground")}>
                {statusLabel}
              </p>
              <p className="text-xs text-muted-foreground mt-2">{formatFixtureDate(fixture.fixture.date)}</p>
            </div>
            <TeamBlock name={fixture.teams.away.name} logo={fixture.teams.away.logo} />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={isFinished ? "post" : "pre"}>
        <TabsList>
          <TabsTrigger value="pre">Análisis Previo</TabsTrigger>
          {isFinished && <TabsTrigger value="post">Análisis Post</TabsTrigger>}
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="lineups">Alineaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="pre">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : preAnalysis ? (
            <div className="space-y-4">
              <AnalysisBlock title="Contexto" content={preAnalysis.contexto} />
              <AnalysisBlock title="Rival" content={preAnalysis.rival} />
              <Card>
                <CardHeader><CardTitle className="text-base">3 Claves Tácticas</CardTitle></CardHeader>
                <CardContent>
                  <ol className="space-y-2">
                    {preAnalysis.clavesTacticas.map((c, i) => (
                      <li key={i} className="text-sm"><span className="font-bold text-mundial-gold">{i + 1}.</span> {c}</li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
              <AnalysisBlock title="Alineación probable" content={preAnalysis.alineacionProbable} />
              <AnalysisBlock title="Pronóstico" content={preAnalysis.pronostico} />
              {preAnalysis.colombiaFocus && isColombia && (
                <Card className="border-colombia-yellow/50 bg-colombia-blue/5">
                  <CardHeader>
                    <CardTitle className="text-colombia-blue dark:text-colombia-yellow">🇨🇴 Colombia Focus</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm leading-relaxed">{preAnalysis.colombiaFocus}</p></CardContent>
                </Card>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">Análisis no disponible</p>
          )}
        </TabsContent>

        {isFinished && (
          <TabsContent value="post">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : postAnalysis ? (
              <div className="space-y-4">
                <AnalysisBlock title="Lectura táctica" content={postAnalysis.lecturaTactica} />
                <Card>
                  <CardHeader><CardTitle className="text-base">Momentos clave</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {postAnalysis.momentosClave.map((m, i) => (
                      <div key={i} className="flex gap-3 text-sm p-2 rounded bg-muted/50">
                        <span className="font-mono font-bold text-mundial-gold">{m.minuto}&apos;</span>
                        <span>{m.descripcion}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Jugador destacado</CardTitle></CardHeader>
                  <CardContent>
                    <p className="font-semibold">{postAnalysis.jugadorDestacado.nombre}</p>
                    <p className="text-sm text-muted-foreground">{postAnalysis.jugadorDestacado.stats}</p>
                    <p className="text-sm mt-2">{postAnalysis.jugadorDestacado.razon}</p>
                  </CardContent>
                </Card>
                <AnalysisBlock title="Comparación con análisis previo" content={postAnalysis.comparacionPrevia} />
                <AnalysisBlock title="Impacto en grupo" content={postAnalysis.impactoGrupo} />
                <AnalysisBlock title="Proyección" content={postAnalysis.proyeccion} />
              </div>
            ) : (
              <p className="text-muted-foreground">Análisis post-partido no disponible</p>
            )}
          </TabsContent>
        )}

        <TabsContent value="stats">
          <PartidoDetalle fixtureId={fixture.fixture.id} fixture={fixture} />
        </TabsContent>

        <TabsContent value="lineups">
          <PartidoDetalle fixtureId={fixture.fixture.id} fixture={fixture} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TeamBlock({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image src={logo} alt={name} width={64} height={64} />
      <span className="font-bold text-center" style={{ color: getTeamColors(name).primary }}>{name}</span>
    </div>
  );
}

function AnalysisBlock({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent><p className="text-sm leading-relaxed">{content}</p></CardContent>
    </Card>
  );
}
