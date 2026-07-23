"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { OnceIdealExperience } from "./OnceIdealExperience";
import {
  LeagueFilterSelect,
  leagueFilterLabel,
  type LeagueFilterValue,
} from "./LeagueFilterSelect";
import {
  ConfederationFilterSelect,
  confederationFilterLabel,
  type ConfederationFilterValue,
} from "./ConfederationFilterSelect";
import { useOnceIdeal } from "@/hooks/useOnceIdeal";
import { useOnceIdealJornada } from "@/hooks/useOnceIdealJornada";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { useMiXIStore } from "@/stores/useMiXIStore";
import { getFormationSlots } from "@/utils/calculations";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export function OnceIdealDisplay() {
  const [formation, setFormation] = useState<FormationType>("4-3-3");
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilterValue>("all");
  const [confederation, setConfederation] =
    useState<ConfederationFilterValue>("all");
  const { league, leagues, isScoped } = useActiveLeague();
  const { onceIdeal, averageRating, isLoading, isWorldCup } = useOnceIdeal(
    formation,
    leagueFilter,
    confederation
  );

  const filterLabel = isWorldCup
    ? confederationFilterLabel(confederation)
    : leagueFilterLabel(leagueFilter);
  const scopeLabel = isWorldCup
    ? "Mundial"
    : leagues.length > 1
      ? `${leagues.length} ligas`
      : league.shortName;

  if (isLoading) return <Skeleton className="h-[520px] w-full max-w-5xl mx-auto rounded-xl" />;

  if (onceIdeal.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                Once Ideal · {scopeLabel}
                {filterLabel ? ` · ${filterLabel}` : ""}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {isWorldCup
                  ? "Promedio ponderado por minutos en el Mundial (mín. 45 min)"
                  : `Rating de la liga ponderado por minutos · mín. 45 min · ${
                      leagues.length > 1
                        ? leagues.map((l) => l.shortName).join(" · ")
                        : league.name
                    }`}
              </p>
            </div>
            {isWorldCup || isScoped ? (
              <ConfederationFilterSelect
                value={confederation}
                onChange={setConfederation}
                className="w-full sm:w-64"
              />
            ) : (
              <LeagueFilterSelect
                value={leagueFilter}
                onChange={setLeagueFilter}
                leagues={leagues}
                className="w-full sm:w-64"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            {filterLabel
              ? `No hay jugadores elegibles de ${filterLabel} con ratings suficientes para armar el once.`
              : league.type === "cup"
                ? `Sin once ideal aún para ${scopeLabel}: faltan minutos/stats en esta copa.`
                : `Aún no hay valoraciones suficientes. El once se formará cuando haya jugadores con minutos.`}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-mundial-blue/5 via-transparent to-mundial-gold/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              Once Ideal · {scopeLabel}
              {filterLabel ? ` · ${filterLabel}` : ""}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Mejores por posición · rating ponderado por minutos · mín. 45 min jugados
            </p>
          </div>
          {isWorldCup || isScoped ? (
            <ConfederationFilterSelect
              value={confederation}
              onChange={setConfederation}
              className="w-full sm:w-64"
            />
          ) : (
            <LeagueFilterSelect
              value={leagueFilter}
              onChange={setLeagueFilter}
              leagues={leagues}
              className="w-full sm:w-64"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <OnceIdealExperience
          players={onceIdeal}
          averageRating={averageRating}
          formation={formation}
          onFormationChange={setFormation}
          showFormationSelector
          isPartial={onceIdeal.length < 11}
        />
      </CardContent>
    </Card>
  );
}

export function OnceIdealJornadaDisplay() {
  const [formation, setFormation] = useState<FormationType>("4-3-3");
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilterValue>("all");
  const [confederation, setConfederation] =
    useState<ConfederationFilterValue>("all");
  const { league, leagues } = useActiveLeague();
  const {
    jornadas,
    selectedRound,
    setSelectedRound,
    activeJornada,
    onceIdeal,
    averageRating,
    isLoading,
    playedCount,
    totalCount,
    isWorldCup,
  } = useOnceIdealJornada(formation, leagueFilter, confederation);

  const filterLabel = isWorldCup
    ? confederationFilterLabel(confederation)
    : leagueFilterLabel(leagueFilter);

  if (isLoading) return <Skeleton className="h-[520px] w-full max-w-5xl mx-auto rounded-xl" />;

  if (jornadas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Once Ideal por Jornada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            {league.type === "cup"
              ? "Sin fases/jornadas con datos suficientes en esta copa todavía."
              : "Aún no hay jornadas disponibles en el calendario de las ligas seleccionadas."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-mundial-blue/5 via-transparent to-mundial-gold/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              Once Ideal por Jornada
              {filterLabel ? ` · ${filterLabel}` : ""}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Mejores por posición · rating del partido ponderado por minutos en la jornada
              {!isWorldCup && leagues.length > 1
                ? ` · ${leagues.map((l) => l.shortName).join(" · ")}`
                : ""}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[16rem]">
            <Select
              value={selectedRound ?? ""}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="w-full"
            >
              {jornadas.map((j) => (
                <option key={j.round} value={j.round}>
                  {j.label}
                  {j.playedFixtureIds.length > 0
                    ? ` (${j.playedFixtureIds.length}/${j.fixtures.length})`
                    : ""}
                </option>
              ))}
            </Select>
            {isWorldCup ? (
              <ConfederationFilterSelect
                value={confederation}
                onChange={setConfederation}
                className="w-full"
              />
            ) : (
              <LeagueFilterSelect
                value={leagueFilter}
                onChange={setLeagueFilter}
                leagues={leagues}
                className="w-full"
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {playedCount === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {activeJornada?.label ?? "Esta jornada"} aún no tiene partidos jugados. El once
            aparecerá cuando comiencen los encuentros.
          </p>
        ) : onceIdeal.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {filterLabel
              ? `No hay jugadores de ${filterLabel} con ratings en ${activeJornada?.label ?? "esta jornada"}.`
              : `No hay ratings disponibles para ${activeJornada?.label ?? "esta jornada"} (${playedCount}/${totalCount} partidos con datos).`}
          </p>
        ) : (
          <OnceIdealExperience
            players={onceIdeal}
            averageRating={averageRating}
            formation={formation}
            onFormationChange={setFormation}
            showFormationSelector
            isPartial={onceIdeal.length < 11}
          />
        )}
      </CardContent>
    </Card>
  );
}

export function ArmarMiXI() {
  const { players, clear } = useMiXIStore();
  const [formation] = useState<FormationType>("4-3-3");
  const slots = getFormationSlots(formation);

  const mapped: OnceIdealPlayer[] = players.map((p) => {
    const slot = slots[p.slot] ?? slots[0];
    return {
      id: p.id,
      name: p.name,
      photo: p.photo,
      team: p.team,
      teamLogo: "",
      position: p.position,
      rating: p.rating,
      gridPosition: { x: slot.x, y: slot.y },
    };
  });

  const avgRating =
    players.length > 0
      ? Math.round((players.reduce((s, p) => s + p.rating, 0) / players.length) * 10) / 10
      : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Armar Mi XI Ideal</CardTitle>
          <Button variant="outline" size="sm" onClick={clear}>
            Limpiar
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {players.length}/11 jugadores · Valoración: {avgRating}
        </p>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Explora jugadores en Estadísticas jugadores para armar tu once ideal. Tu
            selección se guarda automáticamente.
          </p>
        ) : (
          <OnceIdealExperience players={mapped} averageRating={avgRating} />
        )}
      </CardContent>
    </Card>
  );
}
