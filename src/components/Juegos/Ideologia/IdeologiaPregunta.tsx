"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PreguntaDilema } from "@/data/ideologia/types";

interface Props {
  dilema: PreguntaDilema;
  actual: number;
  total: number;
  onElegir: (eleccion: "A" | "B") => void;
}

export function IdeologiaPregunta({ dilema, actual, total, onElegir }: Props) {
  const pct = Math.round((actual / total) * 100);

  return (
    <div className="space-y-4 max-w-2xl animate-in fade-in">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Pregunta {actual} de {total}
          </span>
          <span className="font-mono">{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-mundial-gold transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-semibold leading-snug">
            {dilema.texto}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Button
            variant="outline"
            className="h-auto min-h-[3.25rem] py-3 px-4 text-left whitespace-normal justify-start text-sm sm:text-base"
            onClick={() => onElegir("A")}
          >
            <span className="mr-2 shrink-0 font-semibold text-mundial-gold">A</span>
            {dilema.opcionA.texto}
          </Button>
          <Button
            variant="outline"
            className="h-auto min-h-[3.25rem] py-3 px-4 text-left whitespace-normal justify-start text-sm sm:text-base"
            onClick={() => onElegir("B")}
          >
            <span className="mr-2 shrink-0 font-semibold text-mundial-gold">B</span>
            {dilema.opcionB.texto}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
