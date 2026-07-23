"use client";

import { use, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlantillaJugadores } from "@/components/Selecciones/PlantillaJugadores";
import { useTeams, useStandings, useH2H, useFixtures } from "@/hooks/usePartidos";
import { useTeamPlayers } from "@/hooks/useJugadores";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { H2HRow, TeamLink } from "@/components/shared/TeamLink";
import { getTeamColors } from "@/utils/colors";
import { translateTeamName } from "@/utils/teamNames";
import { formatRoundLabel, formatFixtureDate } from "@/utils/formatters";
import { GridSkeleton } from "@/components/shared/Loading";

export default function PerfilEquipoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const teamId = Number(id);
  const { league } = useActiveLeague();

  const { data: teams = [] } = useTeams();
  const { data: standings = [] } = useStandings();
  const { data: fixtures = [] } = useFixtures({ team: teamId, applyPhaseFilter: false });
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
    return (
      fixtures
        .filter((f) => f.fixture.status.short === "NS")
        .sort(
          (a, b) =>
            new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
        )[0] ?? null
    );
  }, [fixtures]);

  const rivalId = nextFixture
    ? nextFixture.teams.home.id === teamId
      ? nextFixture.teams.away.id
      : nextFixture.teams.home.id
    : undefined;

  const { data: h2h = [] } = useH2H(teamId, rivalId);

  if (!team) return <GridSkeleton count={4} />;

  const colors = getTeamColors(team.name);
  const displayName = translateTeamName(team.name);
  const displayCountry = translateTeamName(team.country);

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4">
        <Image src={team.logo} alt={displayName} width={80} height={80} />
        <div>
          <h1 className="text-4xl font-bold" style={{ color: colors.primary }}>
            {displayName}
          </h1>
          <p className="text-muted-foreground">
            {displayCountry} · {league.shortName}
            {standing ? ` · ${formatRoundLabel(standing.group)}` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <InfoCard label="Posición" value={standing ? `#${standing.rank}` : "N/D"} />
        <InfoCard label="Puntos" value={standing?.points ?? 0} />
        <InfoCard label="PJ" value={standing?.all.played ?? 0} />
        <InfoCard
          label="Dif. goles"
          value={
            standing
              ? standing.goalsDiff > 0
                ? `+${standing.goalsDiff}`
                : standing.goalsDiff
              : "N/D"
          }
        />
      </div>

      {nextFixture && (
        <Card>
          <CardHeader>
            <CardTitle>Próximo partido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-1">
              {translateTeamName(nextFixture.teams.home.name)} vs{" "}
              {translateTeamName(nextFixture.teams.away.name)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatFixtureDate(nextFixture.fixture.date)}
            </p>
          </CardContent>
        </Card>
      )}

      <PlantillaJugadores players={players} isLoading={isLoading} />

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
