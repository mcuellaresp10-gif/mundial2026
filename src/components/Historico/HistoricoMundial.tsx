"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import type { HistoricoMundial } from "@/types";
import { getFixtures } from "@/services/apiFootball";

const FALLBACK: Record<number, HistoricoMundial> = {
  2022: {
    year: 2022,
    host: "Qatar",
    champion: "Argentina",
    championFlag: "🇦🇷",
    topScorer: { name: "Kylian Mbappé", goals: 8, country: "Francia" },
    goldenBall: "Lionel Messi",
    finalScore: "Argentina 3-3 Francia (4-2 pen)",
    totalGoals: 172,
    totalMatches: 64,
    groups: [],
    memorableMatches: [
      { description: "Final épica Argentina vs Francia", score: "3-3 (4-2 pen)" },
      { description: "Marruecos histórico semifinalista", score: "N/A" },
    ],
    curiosities: [
      "Primer Mundial en invierno (noviembre-diciembre)",
      "Messi finally won the World Cup",
      "Mbappé hat-trick en la final",
    ],
  },
  2018: {
    year: 2018,
    host: "Rusia",
    champion: "Francia",
    championFlag: "🇫🇷",
    topScorer: { name: "Harry Kane", goals: 6, country: "Inglaterra" },
    goldenBall: "Luka Modrić",
    finalScore: "Francia 4-2 Croacia",
    totalGoals: 169,
    totalMatches: 64,
    groups: [],
    memorableMatches: [
      { description: "Francia campeona con jóvenes estrellas", score: "4-2" },
      { description: "Bélgica tercer lugar", score: "N/A" },
    ],
    curiosities: [
      "VAR utilizado por primera vez",
      "Croacia llegó a su primera final",
      "Mbappé debutó como estrella mundial",
    ],
  },
  2014: {
    year: 2014,
    host: "Brasil",
    champion: "Alemania",
    championFlag: "🇩🇪",
    topScorer: { name: "James Rodríguez", goals: 6, country: "Colombia" },
    goldenBall: "Lionel Messi",
    finalScore: "Alemania 1-0 Argentina",
    totalGoals: 171,
    totalMatches: 64,
    groups: [],
    memorableMatches: [
      { description: "Alemania 7-1 Brasil semifinal", score: "7-1" },
      { description: "Gol de Götze en la final", score: "1-0" },
    ],
    curiosities: [
      "James Rodríguez ganó la Bota de Oro",
      "Colombia llegó a cuartos de final",
      "Mayor goleada semifinalista: 7-1",
    ],
  },
  2010: {
    year: 2010,
    host: "Sudáfrica",
    champion: "España",
    championFlag: "🇪🇸",
    topScorer: { name: "Thomas Müller", goals: 5, country: "Alemania" },
    goldenBall: "Diego Forlán",
    finalScore: "España 1-0 Países Bajos",
    totalGoals: 145,
    totalMatches: 64,
    groups: [],
    memorableMatches: [
      { description: "España campeona mundial", score: "1-0" },
      { description: "Uruguay semifinalista", score: "N/A" },
    ],
    curiosities: [
      "Primer Mundial en África",
      "España primer campeón europeo fuera de Europa",
      "Vuvuzelas marcaron el torneo",
    ],
  },
};

export function HistoricoMundialView() {
  const [data, setData] = useState<Record<number, HistoricoMundial>>(FALLBACK);
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
        {[2022, 2018, 2014, 2010].map((y) => (
          <TabsTrigger key={y} value={String(y)}>{y}</TabsTrigger>
        ))}
      </TabsList>

      {[2022, 2018, 2014, 2010].map((year) => {
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
