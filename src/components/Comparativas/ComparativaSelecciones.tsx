"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { TeamRadarChart } from "@/components/shared/RadarChart";
import { H2HRow } from "@/components/shared/TeamLink";
import { useH2H } from "@/hooks/usePartidos";
import { useTeamPlayers } from "@/hooks/useJugadores";
import type { Team, StandingTeam } from "@/types";
import { calculateWinProbability } from "@/utils/calculations";
import { parseRating } from "@/utils/formatters";
import { getStatBundle } from "@/utils/playerStats";
import { getTeamColors } from "@/utils/colors";
import { translateTeamName } from "@/utils/teamNames";

interface ComparativaSeleccionesProps {
  teams: Team[];
  standings: StandingTeam[];
}

export function ComparativaSelecciones({ teams, standings }: ComparativaSeleccionesProps) {
  const [teamAId, setTeamAId] = useState(teams[0]?.id ?? 0);
  const [teamBId, setTeamBId] = useState(teams[1]?.id ?? 0);

  const teamA = teams.find((t) => t.id === teamAId);
  const teamB = teams.find((t) => t.id === teamBId);
  const standingA = standings.find((s) => s.team.id === teamAId);
  const standingB = standings.find((s) => s.team.id === teamBId);

  const { data: h2h = [] } = useH2H(teamAId, teamBId);
  const { data: playersA = [] } = useTeamPlayers(teamAId);
  const { data: playersB = [] } = useTeamPlayers(teamBId);

  const bestA = useMemo(
    () =>
      [...playersA].sort(
        (a, b) =>
          parseRating(getStatBundle(b).national?.games.rating) -
          parseRating(getStatBundle(a).national?.games.rating)
      )[0],
    [playersA]
  );
  const bestB = useMemo(
    () =>
      [...playersB].sort(
        (a, b) =>
          parseRating(getStatBundle(b).national?.games.rating) -
          parseRating(getStatBundle(a).national?.games.rating)
      )[0],
    [playersB]
  );

  const winProb = standingA && standingB
    ? calculateWinProbability(
        { goalsFor: standingA.all.goals.for, goalsAgainst: standingA.all.goals.against, points: standingA.points },
        { goalsFor: standingB.all.goals.for, goalsAgainst: standingB.all.goals.against, points: standingB.points }
      )
    : null;

  const avgAgeA = playersA.length ? playersA.reduce((s, p) => s + (p.player.age ?? 0), 0) / playersA.length : 0;
  const avgAgeB = playersB.length ? playersB.reduce((s, p) => s + (p.player.age ?? 0), 0) / playersB.length : 0;

  const radarStats = [
    { label: "Ataque", value: Math.min(10, (standingA?.all.goals.for ?? 0) / 2) },
    { label: "Defensa", value: Math.min(10, 10 - (standingA?.all.goals.against ?? 0) / 2) },
    { label: "Posesión", value: 6 },
    { label: "Transición", value: 7 },
    { label: "Físico", value: 7 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={teamAId} onChange={(e) => setTeamAId(Number(e.target.value))}>
          {teams.map((t) => <option key={t.id} value={t.id}>{translateTeamName(t.name)}</option>)}
        </Select>
        <span className="font-bold text-muted-foreground">VS</span>
        <Select value={teamBId} onChange={(e) => setTeamBId(Number(e.target.value))}>
          {teams.map((t) => <option key={t.id} value={t.id}>{translateTeamName(t.name)}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CompareCol team={teamA} standing={standingA} best={bestA} avgAge={avgAgeA} color={getTeamColors(teamA?.name ?? "").primary} />
        <Card>
          <CardHeader><CardTitle className="text-center">Comparativa</CardTitle></CardHeader>
          <CardContent>
            {winProb && (
              <div className="space-y-3 mb-6">
                <ProbBar label={translateTeamName(teamA?.name ?? "A")} value={winProb.winA} color="#003DA5" />
                <ProbBar label="Empate" value={winProb.draw} color="#64748B" />
                <ProbBar label={translateTeamName(teamB?.name ?? "B")} value={winProb.winB} color="#EF4444" />
              </div>
            )}
            <TeamRadarChart stats={radarStats} />
          </CardContent>
        </Card>
        <CompareCol team={teamB} standing={standingB} best={bestB} avgAge={avgAgeB} color={getTeamColors(teamB?.name ?? "").primary} />
      </div>

      {h2h.length > 0 && (
        <Card>
          <CardHeader><CardTitle>H2H — Últimos enfrentamientos</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {h2h.slice(0, 5).map((f) => (
              <H2HRow
                key={f.fixture.id}
                home={f.teams.home}
                away={f.teams.away}
                score={`${f.goals.home}-${f.goals.away}`}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CompareCol({
  team,
  standing,
  best,
  avgAge,
  color,
}: {
  team?: Team;
  standing?: StandingTeam;
  best?: import("@/types").Player;
  avgAge: number;
  color: string;
}) {
  if (!team) return null;
  const displayName = translateTeamName(team.name);
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Image src={team.logo} alt={displayName} width={48} height={48} />
          <h3 className="text-xl font-bold" style={{ color }}>{displayName}</h3>
        </div>
        <div className="space-y-2 text-sm">
          <Row label="Puntos" value={standing?.points ?? 0} />
          <Row label="Goles a favor" value={standing?.all.goals.for ?? 0} />
          <Row label="Goles en contra" value={standing?.all.goals.against ?? 0} />
          <Row label="Edad promedio" value={avgAge.toFixed(1)} />
          {best && (
            <Row
              label="Mejor jugador"
              value={`${best.player.name} (${parseRating(getStatBundle(best).national?.games.rating).toFixed(1)})`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium">{value}</span>
    </div>
  );
}

function ProbBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
