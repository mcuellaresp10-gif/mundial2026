"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStandings, useTeams } from "@/hooks/usePartidos";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { matchesLeaguePhase } from "@/data/americasLeagues";
import { GridSkeleton } from "@/components/shared/Loading";
import { LeagueSelector } from "@/components/shared/LeagueSelector";
import { CupBracketView } from "@/components/Tablas/CupBracketView";
import { getFixturesForBracket } from "@/services/apiFootball";
import {
  buildCupBracketFromFixtures,
  isKnockoutPhaseActive,
  shouldHideGroupTablesForKnockout,
} from "@/utils/cupBracket";
import { translateTeamName } from "@/utils/teamNames";
import type { StandingTeam } from "@/types";

export default function TablasPage() {
  const { league, leagues, isMulti, phase, supportsPhaseFilter } = useActiveLeague();
  const { data: standings = [], isLoading: loadingStandings } = useStandings();
  const { data: teams = [] } = useTeams();
  const {
    data: fixtures = [],
    isLoading: loadingFixtures,
    isFetching: fetchingFixtures,
  } = useQuery({
    queryKey: [
      "fixtures",
      { league: league.id, season: league.defaultSeason, scope: "tablas-bracket" },
    ],
    queryFn: () => getFixturesForBracket(league.id, league.defaultSeason),
    staleTime: 5 * 60 * 1000,
  });
  const [showFinishedGroups, setShowFinishedGroups] = useState(false);

  const tables = useMemo(() => {
    const result: { title: string; rows: StandingTeam[] }[] = [];
    for (const sg of standings) {
      for (const group of sg.league.standings) {
        if (!group.length) continue;
        const groupLabel = group[0]?.group ?? "Tabla";
        let rows = group;
        if (supportsPhaseFilter && phase !== "all") {
          rows = group.filter(
            (r) =>
              matchesLeaguePhase(r.group, league, phase) ||
              matchesLeaguePhase(groupLabel, league, phase)
          );
          if (rows.length === 0) rows = group;
        }
        result.push({ title: groupLabel, rows });
      }
    }
    return result;
  }, [standings, league, phase, supportsPhaseFilter]);

  const bracket = useMemo(() => {
    let list = fixtures;
    if (supportsPhaseFilter && phase !== "all") {
      const token = phase === "apertura" ? "apertura" : "clausura";
      const phaseFixtures = list.filter((f) =>
        (f.league.round ?? "").toLowerCase().includes(token)
      );
      if (
        phaseFixtures.some((f) =>
          /final|quarter|semi|play-?off|round of/i.test(f.league.round ?? "")
        )
      ) {
        list = phaseFixtures;
      }
    }
    return buildCupBracketFromFixtures(list);
  }, [fixtures, supportsPhaseFilter, phase]);

  const knockoutActive = useMemo(
    () => isKnockoutPhaseActive(fixtures),
    [fixtures]
  );
  const hideGroups =
    shouldHideGroupTablesForKnockout(fixtures) && !showFinishedGroups;

  const showBracketSection =
    league.type === "cup" || bracket.totalTies > 0 || knockoutActive;

  const isLoading = loadingStandings && tables.length === 0 && fixtures.length === 0;

  const standingsBlock =
    tables.length === 0 ? (
      knockoutActive && bracket.totalTies > 0 ? null : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {league.type === "cup"
              ? "Sin tabla de grupos publicada para esta copa/temporada."
              : "Sin tabla disponible aún para esta liga/temporada."}
          </CardContent>
        </Card>
      )
    ) : hideGroups ? (
      <Card>
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Fase de grupos finalizada · la competencia está en eliminatorias
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowFinishedGroups(true)}
          >
            Ver tablas de grupos
          </Button>
        </CardContent>
      </Card>
    ) : (
      <>
        {knockoutActive && bracket.totalTies > 0 && tables.length > 0 && (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowFinishedGroups(false)}
            >
              Ocultar fase de grupos
            </Button>
          </div>
        )}
        {tables.map((table) => (
          <Card key={table.title}>
            <CardHeader>
              <CardTitle className="text-lg">{table.title}</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 text-left">#</th>
                    <th className="pb-2 text-left">Equipo</th>
                    <th className="pb-2 text-center">PJ</th>
                    <th className="pb-2 text-center">PG</th>
                    <th className="pb-2 text-center">PE</th>
                    <th className="pb-2 text-center">PP</th>
                    <th className="pb-2 text-center">GF</th>
                    <th className="pb-2 text-center">GC</th>
                    <th className="pb-2 text-center">DIF</th>
                    <th className="pb-2 text-center">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((s) => (
                    <tr key={s.team.id} className="border-b border-border/50">
                      <td className="py-2 font-mono">{s.rank}</td>
                      <td className="py-2">
                        <Link
                          href={`/equipos/${s.team.id}`}
                          className="inline-flex items-center gap-2 hover:underline"
                        >
                          {s.team.logo ? (
                            <Image
                              src={s.team.logo}
                              alt=""
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          ) : null}
                          {translateTeamName(s.team.name)}
                        </Link>
                      </td>
                      <td className="py-2 text-center">{s.all.played}</td>
                      <td className="py-2 text-center">{s.all.win}</td>
                      <td className="py-2 text-center">{s.all.draw}</td>
                      <td className="py-2 text-center">{s.all.lose}</td>
                      <td className="py-2 text-center">{s.all.goals.for}</td>
                      <td className="py-2 text-center">{s.all.goals.against}</td>
                      <td className="py-2 text-center font-mono">
                        {s.goalsDiff > 0 ? `+${s.goalsDiff}` : s.goalsDiff}
                      </td>
                      <td className="py-2 text-center font-bold">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </>
    );

  const bracketBlock = showBracketSection ? (
    loadingFixtures && bracket.totalTies === 0 ? (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cuadro eliminatorio</CardTitle>
        </CardHeader>
        <CardContent>
          <GridSkeleton count={2} />
        </CardContent>
      </Card>
    ) : bracket.totalTies > 0 ? (
      <CupBracketView
        bracket={bracket}
        title={
          league.type === "cup"
            ? knockoutActive
              ? "Cuadro eliminatorio (fase actual)"
              : "Cuadro eliminatorio"
            : "Eliminatorias / Playoffs"
        }
      />
    ) : league.type === "cup" ? (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          {fetchingFixtures
            ? "Buscando partidos de eliminatoria…"
            : "No hay series de eliminatoria en la temporada activa todavía."}
        </CardContent>
      </Card>
    ) : null
  ) : null;

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tablas</h1>
          <p className="text-muted-foreground mt-1">
            {isMulti
              ? `${leagues.map((l) => l.shortName).join(" · ")} · ${leagues.length} competiciones`
              : `${league.shortName} · ${league.name} · ${league.defaultSeason}`}
            {supportsPhaseFilter && phase !== "all"
              ? ` · ${phase === "apertura" ? "Apertura" : "Clausura"}`
              : ""}
            {knockoutActive ? " · Eliminatorias" : ""}
            {" · "}
            {teams.length} equipos
          </p>
        </div>
        <LeagueSelector variant="page" />
      </div>

      {isLoading ? (
        <GridSkeleton count={4} />
      ) : (
        <>
          {knockoutActive || (league.type === "cup" && bracket.totalTies > 0) ? (
            <>
              {bracketBlock}
              {standingsBlock}
            </>
          ) : (
            <>
              {standingsBlock}
              {bracketBlock}
            </>
          )}
        </>
      )}
    </div>
  );
}
