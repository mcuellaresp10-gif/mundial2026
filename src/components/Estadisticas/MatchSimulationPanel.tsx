"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { ScoreProbabilityHeatmap } from "@/components/Estadisticas/ScoreProbabilityHeatmap";
import { DomImageExportButtons } from "@/components/shared/DomImageExportButtons";
import { useTeams } from "@/hooks/usePartidos";
import { useMatchSimulation } from "@/hooks/useMatchSimulation";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { getLeagueById } from "@/data/americasLeagues";
import { translateTeamName } from "@/utils/teamNames";
import { Loader2 } from "lucide-react";
import type { Team } from "@/types";

function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function parsePositiveInt(value: string | null): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 0;
}

function stubTeam(id: number, name: string | null, logo: string | null): Team {
  return {
    id,
    name: name?.trim() || `Equipo ${id}`,
    code: null,
    country: "",
    founded: null,
    national: false,
    logo: logo?.trim() || "",
  };
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
  const searchParams = useSearchParams();
  const { data: teams = [], isLoading: loadingTeams } = useTeams();
  const { leagueIds, leagueSlugs, setLeagueSlugs } = useActiveLeague();
  const [teamAId, setTeamAId] = useState(0);
  const [teamBId, setTeamBId] = useState(0);
  const exportRef = useRef<HTMLDivElement>(null);
  const appliedQueryRef = useRef<string | null>(null);

  const queryHome = parsePositiveInt(searchParams.get("home"));
  const queryAway = parsePositiveInt(searchParams.get("away"));
  const queryLeague = parsePositiveInt(searchParams.get("league"));
  const queryHomeName = searchParams.get("homeName");
  const queryAwayName = searchParams.get("awayName");
  const queryHomeLogo = searchParams.get("homeLogo");
  const queryAwayLogo = searchParams.get("awayLogo");
  const queryKey = searchParams.toString();

  // Asegura la liga del partido en la selección (p. ej. al venir del dashboard).
  useEffect(() => {
    if (!queryLeague) return;
    if (leagueIds.includes(queryLeague)) return;
    const league = getLeagueById(queryLeague);
    if (!league || league.slug === "mundial-2026") return;
    setLeagueSlugs([...leagueSlugs, league.slug]);
  }, [queryLeague, leagueIds, leagueSlugs, setLeagueSlugs]);

  // Prefill desde URL una vez por query (Simular desde partido).
  useEffect(() => {
    if (!queryHome || !queryAway || queryHome === queryAway) return;
    if (appliedQueryRef.current === queryKey) return;
    appliedQueryRef.current = queryKey;
    setTeamAId(queryHome);
    setTeamBId(queryAway);
  }, [queryHome, queryAway, queryKey]);

  useEffect(() => {
    if (teams.length >= 2 && teamAId === 0) {
      setTeamAId(teams[0].id);
      setTeamBId(teams[1].id);
    }
  }, [teams, teamAId]);

  const fallbackTeams = useMemo(() => {
    const extras: Team[] = [];
    if (queryHome > 0) {
      extras.push(stubTeam(queryHome, queryHomeName, queryHomeLogo));
    }
    if (queryAway > 0) {
      extras.push(stubTeam(queryAway, queryAwayName, queryAwayLogo));
    }
    return extras;
  }, [queryHome, queryAway, queryHomeName, queryAwayName, queryHomeLogo, queryAwayLogo]);

  const teamOptions = useMemo(() => {
    const byId = new Map<number, Team>();
    for (const t of teams) byId.set(t.id, t);
    for (const t of fallbackTeams) {
      if (!byId.has(t.id)) byId.set(t.id, t);
    }
    return [...byId.values()].sort((a, b) =>
      translateTeamName(a.name).localeCompare(translateTeamName(b.name), "es")
    );
  }, [teams, fallbackTeams]);

  const { result, teamA, teamB, isLoading, isFetching, sameTeam } = useMatchSimulation(
    teamAId,
    teamBId,
    { fallbackTeams }
  );

  const teamAName = translateTeamName(teamA?.name ?? "Equipo A");
  const teamBName = translateTeamName(teamB?.name ?? "Equipo B");
  const exportFilename = `simulacion-${teamAName}-vs-${teamBName}.png`
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");

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
              {teamOptions.map((t) => (
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
              {teamOptions.map((t) => (
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
          <div className="flex justify-end">
            <DomImageExportButtons
              targetRef={exportRef}
              filename={exportFilename || "simulacion-partido.png"}
            />
          </div>

          <div
            ref={exportRef}
            className="space-y-4 rounded-xl border border-border/60 bg-card p-3 sm:p-5"
          >
            <div className="border-b border-border/60 pb-3">
              <p className="text-xs uppercase tracking-widest text-mundial-gold font-semibold">
                Fútbol Américas · Simulación
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {teamA?.logo && (
                  <Image
                    src={teamA.logo}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-sm"
                  />
                )}
                <h2 className="text-lg sm:text-xl font-bold">
                  {teamAName}{" "}
                  <span className="text-muted-foreground font-semibold">vs</span>{" "}
                  {teamBName}
                </h2>
                {teamB?.logo && (
                  <Image
                    src={teamB.logo}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-sm"
                  />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Local · Monte Carlo Poisson calibrado
              </p>
            </div>

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

            <Card className="border-border/60 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Matriz de probabilidad de marcador
                </CardTitle>
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
          </div>
        </>
      )}

      {!sameTeam && !result && !isLoading && (
        <p className="text-sm text-muted-foreground">No hay datos suficientes para simular.</p>
      )}
    </div>
  );
}
