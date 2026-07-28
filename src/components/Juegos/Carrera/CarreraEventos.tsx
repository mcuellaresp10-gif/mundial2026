"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POSICION_LABELS, calcularMedia } from "@/data/carrera/atributos";
import { getClubById, getLigaById } from "@/data/carrera/clubes";
import type { EstadoCarrera, EventoDecision } from "@/data/carrera/types";
import { TRAMO_LABELS, tramoDesdeEdad } from "@/utils/carrera/engine";

function AttrBar({
  label,
  value,
  barClassName = "bg-primary/80",
  widthPct,
}: {
  label: string;
  value: number;
  barClassName?: string;
  /** Si no se pasa, asume escala 0–100 (atributos). */
  widthPct?: number;
}) {
  const width = widthPct ?? Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{value}</span>
      </div>
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${barClassName}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

/** Escala reputación/moral (-100..100) a porcentaje de barra. */
function scoreBarPct(score: number): number {
  return Math.min(100, Math.max(0, ((score + 100) / 200) * 100));
}

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
  const a = jugador.atributos;
  const media = calcularMedia(a, jugador.posicion);

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-base">
                {jugador.apellido}, {jugador.edad} años
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {POSICION_LABELS[jugador.posicion]} · {club?.nombre} · {liga?.nombre}
              </p>
              <p className="text-xs text-muted-foreground">
                {jugador.esProfesional
                  ? `Profesional · Primera${
                      jugador.edadDebutProfesional != null
                        ? ` (desde los ${jugador.edadDebutProfesional})`
                        : ""
                    }`
                  : "Cantera / juveniles"}
                {" · "}
                {TRAMO_LABELS[tramoDesdeEdad(jugador.edad)]}
              </p>
            </div>
            <div className="shrink-0 text-right rounded-lg border border-mundial-gold/40 bg-mundial-gold/10 px-2.5 py-1.5">
              <p className="text-[9px] uppercase tracking-wider text-mundial-gold font-semibold">
                Media
              </p>
              <p className="text-2xl font-bold tabular-nums leading-none">{media}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <AttrBar
            label="Reputación"
            value={jugador.reputacion}
            barClassName="bg-mundial-gold/85"
            widthPct={scoreBarPct(jugador.reputacion)}
          />
          <AttrBar
            label="Moral"
            value={jugador.moral}
            barClassName="bg-sky-400/85"
            widthPct={scoreBarPct(jugador.moral)}
          />
          <AttrBar label="Ritmo" value={a.ritmo} />
          <AttrBar label="Tiro" value={a.tiro} />
          <AttrBar label="Pase" value={a.pase} />
          <AttrBar label="Regate" value={a.regate} />
          <AttrBar label="Defensa" value={a.defensa} />
          <AttrBar label="Físico" value={a.fisico} />
          {a.atajadas != null && <AttrBar label="Atajadas" value={a.atajadas} />}
          {a.reflejos != null && <AttrBar label="Reflejos" value={a.reflejos} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Decisión {eventoIndex + 1} de {totalEventos}
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal leading-relaxed">
            {evento.texto}
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {evento.opciones.map((op, i) => (
            <Button
              key={i}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4 text-left whitespace-normal"
              onClick={() => onElegir(i)}
            >
              {op.texto}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
