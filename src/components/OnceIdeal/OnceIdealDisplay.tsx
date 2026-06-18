"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapaFormacion } from "./MapaFormacion";
import { SelectorFormacion } from "./SelectorFormacion";
import { useOnceIdeal } from "@/hooks/useOnceIdeal";
import { useMiXIStore } from "@/stores/useMiXIStore";
import { getFormationSlots } from "@/utils/calculations";
import type { FormationType, OnceIdealPlayer } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export function OnceIdealDisplay() {
  const [formation, setFormation] = useState<FormationType>("4-3-3");
  const { onceIdeal, averageRating, isLoading } = useOnceIdeal(formation);

  if (isLoading) return <Skeleton className="h-96 w-full max-w-lg mx-auto" />;

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

  const isPartial = onceIdeal.length < 11;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle>Once Ideal del Torneo</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Solo jugadores con minutos en el Mundial 2026 · Valoración promedio:{" "}
              <span className="font-bold font-mono text-mundial-gold">{averageRating}</span>
            </p>
            {isPartial && (
              <p className="text-xs text-muted-foreground mt-1">
                Once parcial ({onceIdeal.length}/11) — faltan posiciones con jugadores que hayan
                jugado en el torneo.
              </p>
            )}
          </div>
          <SelectorFormacion value={formation} onChange={setFormation} />
        </div>
      </CardHeader>
      <CardContent>
        <MapaFormacion players={onceIdeal} />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2">
          {onceIdeal.map((p) => (
            <div key={p.id} className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
              <Image src={p.photo} alt="" width={28} height={28} className="rounded-full" />
              <div className="min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.team}</p>
              </div>
              <span className="font-mono font-bold ml-auto">{p.rating.toFixed(1)}</span>
            </div>
          ))}
        </div>
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
          <Button variant="outline" size="sm" onClick={clear}>Limpiar</Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {players.length}/11 jugadores · Valoración: {avgRating}
        </p>
      </CardHeader>
      <CardContent>
        {players.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Selecciona jugadores desde la página de Jugadores para armar tu once ideal.
            Tu selección se guarda automáticamente.
          </p>
        ) : (
          <MapaFormacion players={mapped} />
        )}
      </CardContent>
    </Card>
  );
}
