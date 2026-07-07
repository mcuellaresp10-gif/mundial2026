"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlantillaJugadores } from "@/components/Selecciones/PlantillaJugadores";
import { AnalisisTactico } from "@/components/Selecciones/AnalisisTactico";
import { useTeams, useStandings, useH2H } from "@/hooks/usePartidos";
import { useTeamPlayers } from "@/hooks/useJugadores";
import { useClasificacionProb } from "@/hooks/useClasificacionProb";
import { useTeamNextMatchProb } from "@/hooks/useTeamNextMatchProb";
import { ClassificationProbDisplay } from "@/components/shared/ClassificationProbDisplay";
import { H2HRow, TeamLink } from "@/components/shared/TeamLink";
import { getTeamColors } from "@/utils/colors";
import { translateTeamName } from "@/utils/teamNames";
import { formatRoundLabel } from "@/utils/formatters";
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

  const {
    nextFixture,
    rivalId,
    rivalName,
    isKnockout: nextIsKnockout,
    label: probLabel,
    advanceProbability: nextAdvanceProb,
    winProbability: nextWinProb,
    isLoading: loadingNextMatchProb,
  } = useTeamNextMatchProb(teamId);

  const { data: h2h = [] } = useH2H(teamId, rivalId ?? undefined);
  const { probability: classProb, outcomes, isLoading: loadingProb, pendingMatchesPerTeam, isPreTournament, hasCalendar } =
    useClasificacionProb(teamId);

  const showNextMatchProb = nextFixture != null && nextAdvanceProb != null;
  const displayProb = showNextMatchProb ? nextAdvanceProb : classProb;
  const displayProbLoading = showNextMatchProb ? loadingNextMatchProb : loadingProb;
  const showGroupBreakdown = !showNextMatchProb;

  if (!team) return <GridSkeleton count={4} />;

  const colors = getTeamColors(team.name);
  const displayName = translateTeamName(team.name);
  const displayCountry = translateTeamName(team.country);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Image src={team.logo} alt={displayName} width={80} height={80} />
        <div>
          <h1 className="text-4xl font-bold" style={{ color: colors.primary }}>{displayName}</h1>
          <p className="text-muted-foreground">{displayCountry} · {standing ? formatRoundLabel(standing.group) : "N/D"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Ranking grupo" value={standing ? `#${standing.rank}` : "N/D"} />
        <InfoCard label="Puntos" value={standing?.points ?? 0} />
        <ProbInfoCard
          label={probLabel}
          probability={displayProb}
          outcomes={showGroupBreakdown ? outcomes : null}
          isLoading={displayProbLoading}
          pendingMatchesPerTeam={pendingMatchesPerTeam}
          isPreTournament={isPreTournament}
          hasCalendar={hasCalendar}
          rivalName={showNextMatchProb ? rivalName : null}
          nextIsKnockout={nextIsKnockout}
          nextWinProb={nextWinProb}
          showGroupBreakdown={showGroupBreakdown}
        />
        <InfoCard label="Dif. goles" value={standing?.goalsDiff ?? 0} />
      </div>

      {standing && (
        <Card>
          <CardHeader><CardTitle>Tabla del {standing ? formatRoundLabel(standing.group) : "Grupo"}</CardTitle></CardHeader>
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
                              <td className="py-2">{translateTeamName(s.team.name)}</td>
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
              <TeamLink
                id={rivalId}
                name={
                  nextFixture.teams.home.id === teamId
                    ? nextFixture.teams.away.name
                    : nextFixture.teams.home.name
                }
                logo={
                  nextFixture.teams.home.id === teamId
                    ? nextFixture.teams.away.logo
                    : nextFixture.teams.home.logo
                }
                variant="name"
                className="font-semibold"
              />
            </p>
            {h2h.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Últimos H2H:</p>
                {h2h.slice(0, 5).map((f) => (
                  <H2HRow
                    key={f.fixture.id}
                    home={f.teams.home}
                    away={f.teams.away}
                    score={`${f.goals.home}-${f.goals.away}`}
                  />
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
  label,
  probability,
  outcomes,
  isLoading,
  pendingMatchesPerTeam,
  isPreTournament,
  hasCalendar,
  rivalName,
  nextIsKnockout,
  nextWinProb,
  showGroupBreakdown,
}: {
  label: string;
  probability: number | null;
  outcomes: { probFirst: number; probSecond: number; probBestThird: number } | null;
  isLoading: boolean;
  pendingMatchesPerTeam: number;
  isPreTournament: boolean;
  hasCalendar: boolean;
  rivalName?: string | null;
  nextIsKnockout?: boolean;
  nextWinProb?: number | null;
  showGroupBreakdown?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs text-muted-foreground">{label}</p>
        <ClassificationProbDisplay
          probability={probability}
          outcomes={showGroupBreakdown ? outcomes : null}
          isLoading={isLoading}
          pendingMatchesPerTeam={pendingMatchesPerTeam}
          isPreTournament={isPreTournament}
          hasCalendar={hasCalendar}
          showBreakdown={showGroupBreakdown}
        />
        {rivalName && (
          <p className="text-[10px] text-muted-foreground mt-1 truncate">
            vs {rivalName}
            {nextIsKnockout && nextWinProb != null ? ` · ${nextWinProb}% victoria` : ""}
          </p>
        )}
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
