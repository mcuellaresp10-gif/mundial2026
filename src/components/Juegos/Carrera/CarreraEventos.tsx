"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClubById, getLigaById } from "@/data/carrera/clubes";
import type { EstadoCarrera, EventoDecision } from "@/data/carrera/types";
import { CarreraFichaWE9 } from "./CarreraFichaWE9";

interface Props {
  estado: EstadoCarrera;
  evento: EventoDecision;
  eventoIndex: number;
  totalEventos: number;
  onElegir: (opcionIndex: number) => void;
}

export function CarreraEventos({
  estado,
  evento,
  eventoIndex,
  totalEventos,
  onElegir,
}: Props) {
  const { jugador } = estado;
  const club = getClubById(jugador.clubActualId);
  const liga = getLigaById(jugador.ligaActualId);
  const etiqueta = evento.etiqueta?.trim() || "Decisión";
  const esUltima = eventoIndex + 1 >= totalEventos;

  return (
    <div className="mx-auto grid max-w-2xl gap-4 lg:max-w-4xl lg:grid-cols-[minmax(0,320px)_1fr]">
      <CarreraFichaWE9
        jugador={jugador}
        clubNombre={club?.nombre}
        ligaNombre={liga?.nombre}
        compact
      />

      <Card className="border-border/60">
        <CardHeader className="space-y-3 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-[2px] bg-mundial-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mundial-gold">
              {etiqueta}
            </span>
            <span className="text-[11px] text-muted-foreground">
              Decisión {eventoIndex + 1} de {totalEventos} en este periodo
            </span>
          </div>
          <CardTitle className="text-base font-semibold leading-snug sm:text-lg">
            {evento.texto}
          </CardTitle>
          <p className="text-xs text-muted-foreground font-normal leading-relaxed">
            Elegí una opción. Cambia atributos, moral o reputación.
            {esUltima
              ? " Después se cierra el periodo con tus números."
              : " Luego viene otra decisión antes del cierre."}
          </p>
        </CardHeader>
        <CardContent className="grid gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            ¿Qué hacés?
          </p>
          {evento.opciones.map((op, i) => (
            <Button
              key={i}
              variant="outline"
              className="h-auto min-h-11 w-full justify-start whitespace-normal px-4 py-2.5 text-left text-sm font-medium"
              onClick={() => onElegir(i)}
            >
              <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[2px] bg-muted text-[10px] font-bold text-muted-foreground">
                {i + 1}
              </span>
              {op.texto}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
