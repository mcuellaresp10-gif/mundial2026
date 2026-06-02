"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlantillaJugadores } from "@/components/Selecciones/PlantillaJugadores";
import { AnalisisTactico } from "@/components/Selecciones/AnalisisTactico";
import { useTeams, useStandings, useFixtures, useH2H } from "@/hooks/usePartidos";
import { useTeamPlayers } from "@/hooks/useJugadores";
import { useClasificacionProb } from "@/hooks/useClasificacionProb";
import { ClassificationProbDisplay } from "@/components/shared/ClassificationProbDisplay";
import { getTeamColors } from "@/utils/colors";
import { GridSkeleton } from "@/components/shared/Loading";

export default function PerfilSeleccionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const teamId = Number(id);

  const { data: teams = [] } = useTeams();
  const { data: standings = [] } = useStandings();
  const { data: fixtures = [] } = useFixtures({ team: teamId });
  const { data: players = [], isLoading } = useTeamPlayers(teamId);

  const team = teams.find((t) => t.id === teamId);

  const standing = useMemo(() => {
    for (const sg of standings) {
      for (const group of sg.league.standings) {
        const found = group.find((s) => s.team.id === teamId);
        if (found) return found;
      }
    }
    return null;
  }, [standings, teamId]);

  const nextFixture = useMemo(() => {
    return fixtures
      .filter((f) => f.fixture.status.short === "NS")
      .sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime())[0];
  }, [fixtures]);

  const rivalId = nextFixture
    ? nextFixture.teams.home.id === teamId
      ? nextFixture.teams.away.id
      : nextFixture.teams.home.id
    : undefined;

  const { data: h2h = [] } = useH2H(teamId, rivalId);
  const { probability: classProb, isLoading: loadingProb, pendingMatchesPerTeam, isPreTournament, hasCalendar } =
    useClasificacionProb(teamId);

  if (!team) return <GridSkeleton count={4} />;

  const colors = getTeamColors(team.name);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Image src={team.logo} alt={team.name} width={80} height={80} />
        <div>
          <h1 className="text-4xl font-bold" style={{ color: colors.primary }}>{team.name}</h1>
          <p className="text-muted-foreground">{team.country} · Grupo {standing?.group ?? "N/D"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Ranking grupo" value={standing ? `#${standing.rank}` : "N/D"} />
        <InfoCard label="Puntos" value={standing?.points ?? 0} />
        <ProbInfoCard
          probability={classProb}
          isLoading={loadingProb}
          pendingMatchesPerTeam={pendingMatchesPerTeam}
          isPreTournament={isPreTournament}
          hasCalendar={hasCalendar}
        />
        <InfoCard label="Dif. goles" value={standing?.goalsDiff ?? 0} />
      </div>

      {standing && (
        <Card>
          <CardHeader><CardTitle>Tabla del Grupo — {standing.group}</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 text-left">#</th>
                    <th className="pb-2 text-left">Equipo</th>
                    <th className="pb-2">PJ</th>
                    <th className="pb-2">PG</th>
                    <th className="pb-2">PE</th>
                    <th className="pb-2">PP</th>
                    <th className="pb-2">GF</th>
                    <th className="pb-2">GC</th>
                    <th className="pb-2">DIF</th>
                    <th className="pb-2">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    for (const sg of standings) {
                      for (const group of sg.league.standings) {
                        if (group.some((s) => s.team.id === teamId)) {
                          return group.map((s) => (
                            <tr
                              key={s.team.id}
                              className={`border-b ${s.team.id === teamId ? "bg-mundial-gold/10 font-semibold" : ""}`}
                            >
                              <td className="py-2">{s.rank}</td>
                              <td className="py-2">{s.team.name}</td>
                              <td className="py-2 text-center">{s.all.played}</td>
                              <td className="py-2 text-center">{s.all.win}</td>
                              <td className="py-2 text-center">{s.all.draw}</td>
                              <td className="py-2 text-center">{s.all.lose}</td>
                              <td className="py-2 text-center">{s.all.goals.for}</td>
                              <td className="py-2 text-center">{s.all.goals.against}</td>
                              <td className="py-2 text-center">{s.goalsDiff}</td>
                              <td className="py-2 text-center font-bold">{s.points}</td>
                            </tr>
                          ));
                        }
                      }
                    }
                    return null;
                  })()}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <PlantillaJugadores players={players} isLoading={isLoading} />
      <AnalisisTactico players={players} standing={standing} />

      {nextFixture && rivalId && (
        <Card>
          <CardHeader>
            <CardTitle>Comparativa vs Próximo Rival</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Próximo partido vs{" "}
              <strong>
                {nextFixture.teams.home.id === teamId
                  ? nextFixture.teams.away.name
                  : nextFixture.teams.home.name}
              </strong>
            </p>
            {h2h.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Últimos H2H:</p>
                {h2h.slice(0, 5).map((f) => (
                  <div key={f.fixture.id} className="flex justify-between text-sm p-2 rounded bg-muted/50">
                    <span>{f.teams.home.name}</span>
                    <span className="font-mono font-bold">{f.goals.home}-{f.goals.away}</span>
                    <span>{f.teams.away.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin historial H2H reciente</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ProbInfoCard({
  probability,
  isLoading,
  pendingMatchesPerTeam,
  isPreTournament,
  hasCalendar,
}: {
  probability: number | null;
  isLoading: boolean;
  pendingMatchesPerTeam: number;
  isPreTournament: boolean;
  hasCalendar: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground">Prob. clasificación</p>
        <ClassificationProbDisplay
          probability={probability}
          isLoading={isLoading}
          pendingMatchesPerTeam={pendingMatchesPerTeam}
          isPreTournament={isPreTournament}
          hasCalendar={hasCalendar}
        />
      </CardContent>
    </Card>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold font-mono">{value}</p>
      </CardContent>
    </Card>
  );
}
