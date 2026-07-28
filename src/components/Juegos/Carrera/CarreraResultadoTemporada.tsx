"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POSICION_LABELS, calcularMedia, clipAtributo } from "@/data/carrera/atributos";
import { getClubById, getLigaById } from "@/data/carrera/clubes";
import type { Atributos, EstadoCarrera } from "@/data/carrera/types";
import { cn } from "@/lib/utils";

const ATTR_ROWS: { key: keyof Atributos; label: string }[] = [
  { key: "ritmo", label: "Ritmo" },
  { key: "tiro", label: "Tiro" },
  { key: "pase", label: "Pase" },
  { key: "regate", label: "Regate" },
  { key: "defensa", label: "Defensa" },
  { key: "fisico", label: "Físico" },
  { key: "atajadas", label: "Atajadas" },
  { key: "reflejos", label: "Reflejos" },
];

function DeltaMark({ delta }: { delta: number | undefined }) {
  if (delta == null || delta === 0) {
    return <Minus className="h-3 w-3 text-muted-foreground/50" aria-hidden />;
  }
  if (delta > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-400">
        <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
        <span className="text-[10px] font-semibold tabular-nums">+{delta}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-red-400">
      <ArrowDown className="h-3.5 w-3.5" strokeWidth={2.5} />
      <span className="text-[10px] font-semibold tabular-nums">{delta}</span>
    </span>
  );
}

interface Props {
  estado: EstadoCarrera;
  onResolverOferta: (aceptar: boolean) => void;
  onContinuar: () => void;
}

export function CarreraResultadoTemporada({
  estado,
  onResolverOferta,
  onContinuar,
}: Props) {
  const last = estado.historialTemporadas[estado.historialTemporadas.length - 1];
  if (!last) return null;

  const j = estado.jugador;
  const club = getClubById(last.clubId);
  const liga = getLigaById(last.ligaId);
  const oferta = estado.ofertaPendiente;
  const attrs = last.atributos;
  const deltas = last.deltasAtributos ?? {};
  const temporadaN = estado.historialTemporadas.length;
  const rendPct = Math.round(last.rendimientoPromedio * 100);
  const visibleRows = ATTR_ROWS.filter((row) => typeof attrs[row.key] === "number");
  const media = calcularMedia(attrs, j.posicion);
  const attrsAntes: Atributos = { ...attrs };
  for (const [k, d] of Object.entries(deltas)) {
    if (typeof d !== "number") continue;
    const key = k as keyof Atributos;
    const cur = attrs[key];
    if (typeof cur !== "number") continue;
    attrsAntes[key] = clipAtributo(cur - d);
  }
  const mediaAntes = calcularMedia(attrsAntes, j.posicion);
  const deltaMedia = media - mediaAntes;

  const carrera = estado.historialTemporadas.reduce(
    (acc, t) => {
      acc.partidos += t.partidosJugados;
      acc.goles += t.goles;
      acc.asistencias += t.asistencias;
      acc.titulos += t.titulos.length;
      acc.premios += t.premiosIndividuales?.length ?? 0;
      return acc;
    },
    { partidos: 0, goles: 0, asistencias: 0, titulos: 0, premios: 0 }
  );
  const clubesCarrera = [
    ...new Set(
      [
        ...estado.historialTemporadas.map((t) => t.clubId),
        j.clubActualId,
      ]
        .map((id) => getClubById(id)?.nombre)
        .filter((n): n is string => Boolean(n))
    ),
  ];

  const hechos: string[] = [
    `${last.partidosJugados} partidos · ${last.goles} goles · ${last.asistencias} asistencias`,
    `${club?.nombre ?? "Club"} (${liga?.nombre ?? "Liga"}) · rendimiento ${rendPct}%`,
  ];
  for (const t of last.titulos) hechos.push(`Título: ${t}`);
  for (const p of last.premiosIndividuales ?? []) hechos.push(`Premio: ${p}`);
  if (last.narrativaSeleccion) hechos.push(last.narrativaSeleccion);
  if (last.lesion) {
    hechos.push(
      last.lesion.grave
        ? "Lesión grave: perdiste gran parte de la temporada"
        : "Lesión menor: algunos partidos de baja"
    );
  }
  if (oferta) {
    hechos.push(`Oferta recibida: ${oferta.clubNombre} (${oferta.ligaNombre})`);
  }
  for (const n of last.notas ?? []) {
    if (n && !hechos.includes(n)) hechos.push(n);
  }

  return (
    <div className="space-y-4 animate-in fade-in">
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Temporada {temporadaN} · {last.edad} años
              </p>
              <CardTitle className="text-xl sm:text-2xl">
                {j.apellido}
                <span className="text-muted-foreground font-normal text-base ml-2">
                  {POSICION_LABELS[j.posicion]}
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground font-normal">
                {club?.nombre} · {liga?.nombre}
                {j.esProfesional
                  ? j.edadDebutProfesional != null
                    ? ` · Profesional (debut ${j.edadDebutProfesional})`
                    : " · Profesional"
                  : " · Cantera"}
              </p>
            </div>
            <div className="shrink-0 text-right rounded-xl border border-mundial-gold/40 bg-mundial-gold/10 px-3 py-2 min-w-[4.5rem]">
              <p className="text-[10px] uppercase tracking-wider text-mundial-gold font-semibold">
                Media
              </p>
              <p className="text-3xl font-bold tabular-nums leading-none text-foreground mt-0.5">
                {media}
              </p>
              <div className="mt-1 flex justify-end">
                <DeltaMark delta={deltaMedia} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-2">Esta temporada</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Partidos", value: last.partidosJugados },
                { label: "Goles", value: last.goles },
                { label: "Asistencias", value: last.asistencias },
                {
                  label: "Trofeos",
                  value: last.titulos.length + (last.premiosIndividuales?.length ?? 0),
                },
              ].map((s) => (
                <div
                  key={`temp-${s.label}`}
                  className="rounded-xl border border-border/60 bg-muted/30 px-3 py-3 text-center"
                >
                  <p className="text-2xl font-bold tabular-nums tracking-tight">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-mundial-gold/25 bg-mundial-gold/5 p-4 space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">Totales de carrera</h3>
              <p className="text-[11px] text-muted-foreground">
                {temporadaN} temporada{temporadaN === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[
                { label: "Partidos", value: carrera.partidos },
                { label: "Goles", value: carrera.goles },
                { label: "Asistencias", value: carrera.asistencias },
                { label: "Títulos", value: carrera.titulos },
                { label: "Premios", value: carrera.premios },
              ].map((s) => (
                <div
                  key={`car-${s.label}`}
                  className="rounded-lg border border-border/50 bg-background/40 px-2.5 py-2.5 text-center"
                >
                  <p className="text-xl font-bold tabular-nums tracking-tight">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            {clubesCarrera.length > 0 && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="text-foreground/80 font-medium">Clubes: </span>
                {clubesCarrera.join(" → ")}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold">Atributos</h3>
              <p className="text-xs text-muted-foreground">
                Rendimiento temporada:{" "}
                <span className="font-mono text-foreground">{rendPct}%</span>
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Reputación</span>
                  <span className="inline-flex items-center gap-1.5 font-mono tabular-nums font-semibold">
                    {last.reputacion}
                    <DeltaMark delta={last.deltaReputacion} />
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-mundial-gold/85"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((last.reputacion + 100) / 200) * 100))}%`,
                    }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">Moral</span>
                  <span className="inline-flex items-center gap-1.5 font-mono tabular-nums font-semibold">
                    {last.moral}
                    <DeltaMark delta={last.deltaMoral} />
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-400/85"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((last.moral + 100) / 200) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mb-2">
              Los atributos también suben o bajan según el rendimiento de la campaña (además
              de tus decisiones).
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleRows.map((row) => {
                const value = attrs[row.key] as number;
                const delta = deltas[row.key];
                return (
                  <div key={row.key} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="inline-flex items-center gap-1.5 font-mono tabular-nums font-semibold">
                        {value}
                        <DeltaMark delta={delta} />
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width]",
                          (delta ?? 0) > 0
                            ? "bg-emerald-500/85"
                            : (delta ?? 0) < 0
                              ? "bg-red-500/75"
                              : "bg-mundial-gold/80"
                        )}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Balance de la temporada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {last.debutProfesional && (
            <div className="rounded-xl border border-mundial-gold/50 bg-mundial-gold/10 px-4 py-3 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-mundial-gold font-semibold">
                Hito de carrera
              </p>
              <p className="text-sm font-semibold leading-snug">
                Ascendiste al plantel profesional
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Debutás en Primera con {club?.nombre ?? "tu club"} a los {last.edad}{" "}
                años. De la cantera al fútbol de verdad.
              </p>
            </div>
          )}
          <ul className="space-y-2.5">
            {hechos.map((line, i) => (
              <li key={`h-${i}`} className="flex gap-3 text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-mundial-gold" />
                <span className="text-foreground/90 leading-relaxed">{line}</span>
              </li>
            ))}
          </ul>

          {last.eventosResolvidos.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
              <h4 className="text-sm font-semibold">Decisiones del año</h4>
              <ol className="space-y-3">
                {last.eventosResolvidos.map((d, i) => (
                  <li key={`${d.eventoId}-${i}`} className="text-sm pl-3 border-l-2 border-mundial-gold/40 space-y-1">
                    <p className="text-muted-foreground text-xs">Momento {i + 1}</p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      <span className="text-foreground/70">Contexto:</span> {d.situacion}
                    </p>
                    <p className="leading-snug">
                      <span className="font-medium text-mundial-gold">Decisión:</span>{" "}
                      {d.decision}
                    </p>
                    <p className="leading-snug text-foreground/90">
                      <span className="font-medium">Afectación:</span> {d.afectacion}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {oferta && (
            <div className="rounded-xl border border-mundial-gold/35 bg-mundial-gold/5 p-4 space-y-3">
              <p className="text-sm font-medium">
                Oferta de {oferta.clubNombre}
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · {oferta.ligaNombre}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onResolverOferta(true)}>Aceptar fichaje</Button>
                <Button variant="outline" onClick={() => onResolverOferta(false)}>
                  Rechazar
                </Button>
              </div>
            </div>
          )}

          {!oferta && (
            <Button className="w-full sm:w-auto" onClick={onContinuar}>
              Siguiente temporada
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
