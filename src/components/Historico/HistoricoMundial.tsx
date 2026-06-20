"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { HistoricoMundial } from "@/types";
import { getHistoricoForUI, WORLD_CUP_UI_YEARS } from "@/data/worldCupHistory";
import { getFixtures } from "@/services/apiFootball";

export function HistoricoMundialView() {
  const [data, setData] = useState<Record<number, HistoricoMundial>>(getHistoricoForUI);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        for (const year of [2018, 2022]) {
          const fixtures = await getFixtures({ season: year });
          if (fixtures.length > 0 && data[year]) {
            setData((prev) => ({
              ...prev,
              [year]: {
                ...prev[year],
                totalMatches: fixtures.length,
                totalGoals: fixtures
                  .filter((f) => f.fixture.status.short === "FT")
                  .reduce((s, f) => s + (f.goals.home ?? 0) + (f.goals.away ?? 0), 0),
              },
            }));
          }
        }
      } catch {
        // use fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <Tabs defaultValue="2022">
      <TabsList>
        {WORLD_CUP_UI_YEARS.map((y) => (
          <TabsTrigger key={y} value={String(y)}>{y}</TabsTrigger>
        ))}
      </TabsList>

      {WORLD_CUP_UI_YEARS.map((year) => {
        const h = data[year];
        if (!h) return null;
        return (
          <TabsContent key={year} value={String(year)}>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mundial {h.year} — {h.host}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Stat label="Campeón" value={`${h.championFlag} ${h.champion}`} />
                  <Stat label="Final" value={h.finalScore} />
                  <Stat label="Goleador" value={`${h.topScorer.name} (${h.topScorer.goals})`} />
                  <Stat label="Balón de Oro" value={h.goldenBall} />
                  <Stat label="Goles totales" value={String(h.totalGoals)} />
                  <Stat label="Partidos" value={String(h.totalMatches)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Partidos Memorables</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {h.memorableMatches.map((m, i) => (
                    <div key={i} className="flex justify-between p-2 rounded bg-muted/50 text-sm">
                      <span>{m.description}</span>
                      <span className="font-mono font-bold">{m.score}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Datos Curiosos</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {h.curiosities.map((c, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-mundial-gold">★</span> {c}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
