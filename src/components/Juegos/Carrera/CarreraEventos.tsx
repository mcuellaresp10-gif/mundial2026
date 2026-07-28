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
  /** Fase Selección Colombia (Fecha FIFA). */
  modoSeleccion?: boolean;
  nivelSeleccion?: string | null;
}

export function CarreraEventos({
  estado,
  evento,
  eventoIndex,
  totalEventos,
  onElegir,
  modoSeleccion = false,
  nivelSeleccion = null,
}: Props) {
  const { jugador } = estado;
  const club = getClubById(jugador.clubActualId);
  const liga = getLigaById(jugador.ligaActualId);
  const etiqueta = modoSeleccion
    ? evento.etiqueta?.trim() || "Selección"
    : evento.etiqueta?.trim() || "Decisión";
  const esUltima = eventoIndex + 1 >= totalEventos;
  const tituloFase = modoSeleccion
    ? `Fecha FIFA · ${nivelSeleccion ?? "Selección Colombia"}`
    : null;

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
            {tituloFase && (
              <span className="rounded-[2px] bg-[#ffcd00]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c9a000]">
                {tituloFase}
              </span>
            )}
            <span className="rounded-[2px] bg-mundial-gold/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-mundial-gold">
              {etiqueta}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {modoSeleccion ? "Selección" : "Decisión"} {eventoIndex + 1} de{" "}
              {totalEventos}
              {modoSeleccion ? "" : " en este periodo"}
            </span>
          </div>
          <CardTitle className="text-base font-semibold leading-snug sm:text-lg">
            {evento.texto}
          </CardTitle>
          <p className="text-xs text-muted-foreground font-normal leading-relaxed">
            {modoSeleccion
              ? "Decisión con la tricolor. Influye tu rendimiento en la fecha FIFA."
              : "Elegí una opción. Cambia atributos, moral o reputación."}
            {esUltima
              ? modoSeleccion
                ? " Después se cierra el periodo."
                : " Después se cierra el periodo con tus números."
              : " Luego viene otra decisión."}
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
