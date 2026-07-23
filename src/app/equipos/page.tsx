"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GridSkeleton } from "@/components/shared/Loading";
import { getTeams } from "@/services/apiFootball";
import { domesticLeagues, type AmericasLeague } from "@/data/americasLeagues";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { NORMAL_STALE_MS } from "@/lib/liveRefresh";
import { getTeamColors } from "@/utils/colors";
import { translateTeamName, teamNameMatchesQuery } from "@/utils/teamNames";
import type { Team } from "@/types";

interface LeagueTeamsGroup {
  league: AmericasLeague;
  teams: Team[];
}

function TeamCard({
  team,
  leagueSlug,
  onNavigate,
}: {
  team: Team;
  leagueSlug: string;
  onNavigate: (slug: string) => void;
}) {
  const displayName = translateTeamName(team.name);
  const displayCountry = translateTeamName(team.country);
  const colors = getTeamColors(team.name);

  return (
    <Link
      href={`/equipos/${team.id}`}
      onClick={() => onNavigate(leagueSlug)}
    >
      <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
        <CardContent className="p-4 flex flex-col items-center gap-2">
          {team.logo ? (
            <Image src={team.logo} alt={displayName} width={56} height={56} />
          ) : (
            <div className="w-14 h-14 rounded-full bg-muted" />
          )}
          <p
            className="font-semibold text-sm text-center"
            style={{ color: colors.primary }}
          >
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground text-center">
            {displayCountry}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function EquiposPage() {
  const { setLeagueSlug } = useActiveLeague();
  const [search, setSearch] = useState("");
  const leagues = domesticLeagues();

  const queries = useQueries({
    queries: leagues.map((league) => ({
      queryKey: ["teams", league.id, league.defaultSeason],
      queryFn: () => getTeams(league.defaultSeason, league.id),
      staleTime: NORMAL_STALE_MS,
    })),
  });

  const teamsData = queries.map((q) => q.data);
  const isLoading = queries.some((q) => q.isLoading && !q.data);

  const groups = useMemo((): LeagueTeamsGroup[] => {
    const q = search.trim().toLowerCase();
    return leagues
      .map((league, i) => {
        let teams = teamsData[i] ?? [];
        if (q) {
          teams = teams.filter(
            (t) =>
              teamNameMatchesQuery(t.name, q) ||
              teamNameMatchesQuery(t.country, q) ||
              league.shortName.toLowerCase().includes(q) ||
              league.name.toLowerCase().includes(q) ||
              league.country.toLowerCase().includes(q)
          );
        }
        teams = [...teams].sort((a, b) =>
          translateTeamName(a.name).localeCompare(translateTeamName(b.name), "es")
        );
        return { league, teams };
      })
      .filter((g) => g.teams.length > 0);
  }, [leagues, teamsData, search]);

  const totalTeams = useMemo(
    () => groups.reduce((n, g) => n + g.teams.length, 0),
    [groups]
  );

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipos</h1>
          <p className="text-muted-foreground mt-1">
            {isLoading
              ? "Cargando clubes por liga…"
              : `${totalTeams} clubes · ${groups.length} liga${groups.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Input
          placeholder="Buscar equipo o liga…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <GridSkeleton count={12} />
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No hay equipos que coincidan con la búsqueda
          </CardContent>
        </Card>
      ) : (
        groups.map(({ league, teams }) => (
          <section key={league.id} className="space-y-4" id={`liga-${league.slug}`}>
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border/60 pb-2">
              <div>
                <h2 className="text-lg font-semibold text-mundial-gold/90">
                  {league.shortName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {league.name} · {league.country} · {league.defaultSeason}
                </p>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {teams.length} equipo{teams.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {teams.map((team) => (
                <TeamCard
                  key={`${league.id}-${team.id}`}
                  team={team}
                  leagueSlug={league.slug}
                  onNavigate={setLeagueSlug}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
