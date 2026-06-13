"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Player, StandingTeam } from "@/types";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { getStatBundle, statSummary } from "@/utils/playerStats";

interface AnalisisTacticoProps {
  players: Player[];
  standing?: StandingTeam | null;
  formation?: string;
}

export function AnalisisTactico({ players, standing, formation = "4-2-3-1" }: AnalisisTacticoProps) {
  const nationalStats = players.map((p) => statSummary(getStatBundle(p).national));
  const clubStats = players.map((p) => statSummary(getStatBundle(p).club));

  const avgNationalRating =
    nationalStats.length > 0
      ? nationalStats.reduce((s, n) => s + n.rating, 0) / nationalStats.filter((n) => n.rating > 0).length || 1
      : 0;

  const totalNationalGoals = nationalStats.reduce((s, n) => s + n.goals, 0);
  const totalClubGoals = clubStats.reduce((s, n) => s + n.goals, 0);
  const avgAge =
    players.length > 0
      ? players.reduce((s, p) => s + (p.player.age ?? 0), 0) / players.length
      : 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (avgNationalRating >= 7) strengths.push("Plantilla con alto nivel individual en selección");
  if (totalNationalGoals > 5) strengths.push(`Potencia ofensiva con la selección (Temp. ${PLAYER_STAT_SEASON_LABEL})`);
  if (totalClubGoals > 20) strengths.push("Jugadores en forma goleadora en sus clubes");
  if (avgAge < 27) strengths.push("Plantilla joven con proyección");
  if (standing && standing.all.win > standing.all.lose) strengths.push("Buen rendimiento en fase de grupos del Mundial");

  if (avgNationalRating < 6.5 && avgNationalRating > 0) weaknesses.push("Nivel en selección por debajo del promedio");
  if (standing && standing.all.goals.against > standing.all.goals.for) weaknesses.push("Defensa vulnerable en el Mundial");
  if (avgAge > 30) weaknesses.push("Plantilla veterana, riesgo físico");

  if (strengths.length === 0) strengths.push("Equipo equilibrado en todas las líneas");
  if (weaknesses.length === 0) weaknesses.push("Por confirmar en partidos decisivos");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Análisis Táctico</CardTitle>
        <p className="text-xs text-muted-foreground">
          Basado en rendimiento con la selección y en clubes · Temporada {PLAYER_STAT_SEASON_LABEL}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MiniStat label="Formación preferida" value={formation} />
          <MiniStat label="Valoración prom. selección" value={avgNationalRating > 0 ? avgNationalRating.toFixed(1) : "N/D"} />
          <MiniStat label={`Goles selección (Temp. ${PLAYER_STAT_SEASON_LABEL})`} value={String(totalNationalGoals)} />
          <MiniStat label={`Goles club (Temp. ${PLAYER_STAT_SEASON_LABEL})`} value={String(totalClubGoals)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-mundial-green mb-2">Fortalezas</h4>
            <ul className="space-y-1">
              {strengths.map((s, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-mundial-green">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-mundial-red mb-2">Debilidades</h4>
            <ul className="space-y-1">
              {weaknesses.map((w, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-mundial-red">✗</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Patrones de juego</h4>
          <div className="flex flex-wrap gap-2">
            {["Posesión", "Transición rápida", "Presión alta", "Balón parado"].map((p) => (
              <span key={p} className="px-3 py-1 rounded-full bg-muted text-sm">{p}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-bold font-mono">{value}</p>
    </div>
  );
}
