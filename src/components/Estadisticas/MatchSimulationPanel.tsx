"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ScoreProbabilityHeatmap } from "@/components/Estadisticas/ScoreProbabilityHeatmap";
import { useTeams } from "@/hooks/usePartidos";
import { useMatchSimulation } from "@/hooks/useMatchSimulation";
import { translateTeamName } from "@/utils/teamNames";
import { Loader2 } from "lucide-react";

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-0.5">{value}</p>
    </div>
  );
}

export function MatchSimulationPanel() {
  const { data: teams = [], isLoading: loadingTeams } = useTeams();
  const [teamAId, setTeamAId] = useState(0);
  const [teamBId, setTeamBId] = useState(0);

  useEffect(() => {
    if (teams.length >= 2 && teamAId === 0) {
      setTeamAId(teams[0].id);
      setTeamBId(teams[1].id);
    }
  }, [teams, teamAId]);

  const { result, teamA, teamB, isLoading, isFetching, sameTeam } = useMatchSimulation(
    teamAId,
    teamBId
  );

  const teamAName = translateTeamName(teamA?.name ?? "Equipo A");
  const teamBName = translateTeamName(teamB?.name ?? "Equipo B");
  const cal = result?.calibration;
  const homeBoostPct = cal
    ? `+${((cal.homeAdvantage.homeLambdaMul - 1) * 100).toFixed(0)}% xG`
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
            Local
          </p>
          <div className="flex items-center gap-2">
            {teamA?.logo && (
              <Image src={teamA.logo} alt="" width={28} height={28} className="rounded-sm" />
            )}
            <Select
              value={teamAId || ""}
              onChange={(e) => setTeamAId(Number(e.target.value))}
              disabled={loadingTeams}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {translateTeamName(t.name)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <span className="font-bold text-muted-foreground pb-2">VS</span>

        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
            Visitante
          </p>
          <div className="flex items-center gap-2">
            {teamB?.logo && (
              <Image src={teamB.logo} alt="" width={28} height={28} className="rounded-sm" />
            )}
            <Select
              value={teamBId || ""}
              onChange={(e) => setTeamBId(Number(e.target.value))}
              disabled={loadingTeams}
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {translateTeamName(t.name)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {(isLoading || isFetching) && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mb-2.5" />
        )}
      </div>

      {sameTeam && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Selecciona dos equipos distintos para simular el partido.
        </p>
      )}

      {!sameTeam && result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard
              label="Marcador más probable"
              value={`${result.mostLikely.home}-${result.mostLikely.away} · ${formatPct(result.mostLikely.prob)}`}
            />
            <KpiCard
              label={`Victoria ${teamAName} (L)`}
              value={formatPct(result.outcomeProbs.winA)}
            />
            <KpiCard label="Empate" value={formatPct(result.outcomeProbs.draw)} />
            <KpiCard
              label={`Victoria ${teamBName} (V)`}
              value={formatPct(result.outcomeProbs.winB)}
            />
            <KpiCard
              label="Goles esperados (xG)"
              value={`${result.expectedGoals.home.toFixed(2)} - ${result.expectedGoals.away.toFixed(2)}`}
            />
          </div>

          {cal?.mode === "club" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <KpiCard
                label="Fuerza local"
                value={cal.strengthHome.toFixed(1)}
              />
              <KpiCard
                label="Fuerza visitante"
                value={cal.strengthAway.toFixed(1)}
              />
              <KpiCard
                label="Boost localía"
                value={homeBoostPct ?? "—"}
              />
              <KpiCard
                label="Forma reciente (L / V)"
                value={`${cal.recentHome.played > 0 ? cal.recentHome.pointsPerGame.toFixed(2) : "—"} / ${cal.recentAway.played > 0 ? cal.recentAway.pointsPerGame.toFixed(2) : "—"} PPG`}
              />
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Matriz de probabilidad de marcador
              </CardTitle>
              <p className="text-sm text-muted-foreground font-normal">
                {result.simulations.toLocaleString()} simulaciones · localía dinámica, forma
                reciente, ritmo goleador de liga, H2H (más peso si coincidió la localía) y mix
                tabla + plantilla · 1X2: {formatPct(result.target1X2.homeWin)} /{" "}
                {formatPct(result.target1X2.draw)} / {formatPct(result.target1X2.awayWin)}
              </p>
            </CardHeader>
            <CardContent>
              <ScoreProbabilityHeatmap
                matrix={result.matrix}
                teamAName={`${teamAName} (L)`}
                teamBName={`${teamBName} (V)`}
                mostLikely={result.mostLikely}
              />
            </CardContent>
          </Card>
        </>
      )}

      {!sameTeam && !result && !isLoading && (
        <p className="text-sm text-muted-foreground">No hay datos suficientes para simular.</p>
      )}
    </div>
  );
}
