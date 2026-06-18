"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnceIdealExperience } from "./OnceIdealExperience";
import { useOnceIdeal } from "@/hooks/useOnceIdeal";
import { useMiXIStore } from "@/stores/useMiXIStore";
import { getFormationSlots } from "@/utils/calculations";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export function OnceIdealDisplay() {
  const [formation, setFormation] = useState<FormationType>("4-3-3");
  const { onceIdeal, averageRating, isLoading } = useOnceIdeal(formation);

  if (isLoading) return <Skeleton className="h-[520px] w-full max-w-5xl mx-auto rounded-xl" />;

  if (onceIdeal.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Once Ideal del Torneo</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Solo jugadores con minutos en el Mundial 2026
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Aún no hay valoraciones del Mundial 2026. El once se formará cuando haya jugadores con
            minutos en el torneo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b bg-gradient-to-r from-mundial-blue/5 via-transparent to-mundial-gold/5">
        <CardTitle>Once Ideal del Torneo</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Equipo del momento · Solo jugadores con minutos en el Mundial 2026
        </p>
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
            Selecciona jugadores desde la página de Jugadores para armar tu once ideal. Tu
            selección se guarda automáticamente.
          </p>
        ) : (
          <OnceIdealExperience players={mapped} averageRating={avgRating} />
        )}
      </CardContent>
    </Card>
  );
}
