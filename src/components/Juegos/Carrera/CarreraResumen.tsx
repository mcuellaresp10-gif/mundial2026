"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DomImageExportButtons } from "@/components/shared/DomImageExportButtons";
import { POSICION_LABELS } from "@/data/carrera/atributos";
import type {
  EstadoCarrera,
  Jugador,
  PrimeCarrera,
  ResumenCarrera,
  StatsEtapaCarrera,
  TitulosPorClub,
} from "@/data/carrera/types";
import { CarreraFichaWE9 } from "./CarreraFichaWE9";

interface Props {
  estado: EstadoCarrera;
  resumen: ResumenCarrera;
  onReiniciar: () => void;
}

function BloqueEtapa({
  titulo,
  accent,
  stats,
  ocultarTitulos,
}: {
  titulo: string;
  accent?: boolean;
  stats: StatsEtapaCarrera;
  /** Si true, no lista títulos (van agrupados por club más abajo). */
  ocultarTitulos?: boolean;
}) {
  return (
    <div className="space-y-2">
      <p
        className={
          accent
            ? "text-[11px] uppercase tracking-wide text-mundial-gold font-semibold"
            : "text-[11px] uppercase tracking-wide text-muted-foreground font-semibold"
        }
      >
        {titulo}
      </p>
      <div className="grid grid-cols-2 gap-2.5 text-center sm:grid-cols-5">
        {[
          { label: "Partidos", value: stats.partidos },
          { label: "Goles", value: stats.goles },
          { label: "Asistencias", value: stats.asistencias },
          { label: "Títulos", value: stats.titulos.length },
          { label: "Premios", value: stats.premiosIndividuales.length },
        ].map((s) => (
          <div
            key={`${titulo}-${s.label}`}
            className={
              accent
                ? "rounded-lg border border-mundial-gold/25 bg-mundial-gold/5 p-2.5"
                : "rounded-lg bg-muted/40 p-2.5"
            }
          >
            <p className="text-xl font-bold tabular-nums">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      {!ocultarTitulos && stats.titulos.length > 0 && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/80">Títulos: </span>
          {[...new Set(stats.titulos)].join(", ")}
        </p>
      )}
      {stats.premiosIndividuales.length > 0 && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/80">Premios: </span>
          {[...new Set(stats.premiosIndividuales)].join(", ")}
        </p>
      )}
    </div>
  );
}

function TarjetaPrime({
  prime,
  jugador,
}: {
  prime: PrimeCarrera;
  jugador: Jugador;
}) {
  const rangoEdad =
    prime.edadInicio === prime.edad
      ? `${prime.edad} años`
      : `${prime.edadInicio}–${prime.edad} años`;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-mundial-gold">
          Tarjeta prime
        </p>
        <p className="text-[11px] text-muted-foreground">
          Mejor media · {rangoEdad}
        </p>
      </div>
      <CarreraFichaWE9
        jugador={{
          apellido: jugador.apellido,
          edad: prime.edad,
          posicion: jugador.posicion,
          piernaHabil: jugador.piernaHabil,
          nacionalidad: jugador.nacionalidad,
          atributos: prime.atributos,
          reputacion: prime.reputacion,
          moral: prime.moral,
          esProfesional: true,
        }}
        clubNombre={prime.clubNombre}
        badge="Prime"
      />
    </div>
  );
}

function TitulosPorEquipo({ grupos }: { grupos: TitulosPorClub[] }) {
  if (grupos.length === 0) return null;
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-mundial-gold">
        Títulos por club
      </p>
      <div className="space-y-3">
        {grupos.map((g) => (
          <div key={g.clubId} className="space-y-1">
            <p className="text-sm font-semibold">{g.clubNombre}</p>
            <ul className="space-y-0.5">
              {g.titulos.map((t) => (
                <li
                  key={`${g.clubId}-${t.nombre}`}
                  className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground"
                >
                  <span className="leading-snug">{t.nombre}</span>
                  {t.cantidad > 1 ? (
                    <span className="shrink-0 font-semibold tabular-nums text-foreground/80">
                      ×{t.cantidad}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CarreraResumen({ estado, resumen, onReiniciar }: Props) {
  const shareRef = useRef<HTMLDivElement>(null);
  const j = estado.jugador;

  const motivoLabel =
    resumen.motivoRetiro === "edad"
      ? "Retiro por edad"
      : resumen.motivoRetiro === "lesion_grave"
        ? "Retiro por lesión grave"
        : resumen.motivoRetiro === "mala_racha"
          ? "Retiro por mala racha"
          : "Retiro voluntario";

  return (
    <div className="space-y-4">
      <div ref={shareRef} className="space-y-4 rounded-xl border bg-card p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-mundial-gold">
            Fútbol Américas · Carrera
          </p>
          <h2 className="mt-1 text-2xl font-bold">
            {j.apellido} — {POSICION_LABELS[j.posicion]}
          </h2>
          <p className="text-sm text-muted-foreground">
            {j.nacionalidad} · {motivoLabel} a los {resumen.edadRetiro} años
            {j.edadDebutProfesional != null
              ? ` · Debut profesional a los ${j.edadDebutProfesional}`
              : ""}
          </p>
        </div>

        {resumen.prime && <TarjetaPrime prime={resumen.prime} jugador={j} />}

        <BloqueEtapa
          titulo="Cantera / juveniles"
          stats={resumen.cantera}
          ocultarTitulos
        />
        <BloqueEtapa
          titulo="Profesional"
          accent
          stats={resumen.profesional}
          ocultarTitulos
        />

        <TitulosPorEquipo grupos={resumen.titulosPorClub} />

        <div className="space-y-1 text-sm">
          <p>
            <span className="font-medium">Clubes: </span>
            {resumen.clubes.join(" → ") || "—"}
          </p>
        </div>

        <div className="space-y-1 rounded-lg border border-border/60 p-4">
          <p className="font-medium">
            Estilo comparable a: {resumen.comparacion.figura}
          </p>
          <p className="text-sm text-muted-foreground">
            {resumen.comparacion.razon}
          </p>
          <p className="pt-1 text-[11px] italic text-muted-foreground/80">
            {resumen.comparacion.disclaimer}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Compartir</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <DomImageExportButtons
            targetRef={shareRef}
            filename={`carrera-${j.apellido.toLowerCase()}.png`}
          />
          <Button variant="outline" onClick={onReiniciar}>
            Nueva carrera
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
