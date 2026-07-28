"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POSICION_LABELS, calcularMedia, clipAtributo } from "@/data/carrera/atributos";
import { getClubById, getLigaById } from "@/data/carrera/clubes";
import type { Atributos, EstadoCarrera } from "@/data/carrera/types";
import { cn } from "@/lib/utils";
import { CarreraFichaWE9, POSICION_CODE, we9StatTone } from "./CarreraFichaWE9";

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

function StatBig({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-bold tabular-nums tracking-tight leading-none sm:text-4xl">
        {value}
      </p>
      <p className="mt-1.5 text-[10px] uppercase tracking-wide text-muted-foreground sm:text-xs">
        {label}
      </p>
    </div>
  );
}

function EtapaMini({
  titulo,
  accent,
  partidos,
  goles,
  asistencias,
  titulos,
  premios,
}: {
  titulo: string;
  accent?: boolean;
  partidos: number;
  goles: number;
  asistencias: number;
  titulos: number;
  premios: number;
}) {
  if (partidos <= 0 && titulos <= 0 && premios <= 0) return null;
  return (
    <div>
      <p
        className={cn(
          "mb-1.5 text-[10px] font-semibold uppercase tracking-wide",
          accent ? "text-mundial-gold" : "text-muted-foreground"
        )}
      >
        {titulo}
      </p>
      <p className="text-sm tabular-nums">
        <span className="font-semibold">{partidos}</span> PJ ·{" "}
        <span className="font-semibold">{goles}</span> G ·{" "}
        <span className="font-semibold">{asistencias}</span> A ·{" "}
        <span className="font-semibold">{titulos}</span> Tít ·{" "}
        <span className="font-semibold">{premios}</span> Prem
      </p>
    </div>
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
  const [cronicaOpen, setCronicaOpen] = useState(false);
  const [carreraOpen, setCarreraOpen] = useState(false);

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
  const mediaTone = we9StatTone(media);

  const carrera = estado.historialTemporadas.reduce(
    (acc, t) => {
      const can = t.cantera ?? {
        partidos: 0,
        goles: 0,
        asistencias: 0,
        titulos: [] as string[],
        premiosIndividuales: [] as string[],
      };
      const pro = t.profesional ?? {
        partidos: 0,
        goles: 0,
        asistencias: 0,
        titulos: [] as string[],
        premiosIndividuales: [] as string[],
      };
      acc.cantera.partidos += can.partidos;
      acc.cantera.goles += can.goles;
      acc.cantera.asistencias += can.asistencias;
      acc.cantera.titulos += can.titulos.length;
      acc.cantera.premios += can.premiosIndividuales.length;
      acc.profesional.partidos += pro.partidos;
      acc.profesional.goles += pro.goles;
      acc.profesional.asistencias += pro.asistencias;
      acc.profesional.titulos += pro.titulos.length;
      acc.profesional.premios += pro.premiosIndividuales.length;
      return acc;
    },
    {
      cantera: { partidos: 0, goles: 0, asistencias: 0, titulos: 0, premios: 0 },
      profesional: { partidos: 0, goles: 0, asistencias: 0, titulos: 0, premios: 0 },
    }
  );

  const hechos: string[] = [];
  if (last.debutProfesional) {
    hechos.push(`Debut profesional · ${j.edadDebutProfesional ?? last.edad} años`);
  }
  for (const t of last.titulos.slice(0, 2)) hechos.push(`Campeón · ${t}`);
  for (const p of (last.premiosIndividuales ?? []).slice(0, 2)) {
    hechos.push(`Premio · ${p}`);
  }
  if (last.convocatoriaSeleccion) {
    hechos.push(
      last.narrativaSeleccion?.slice(0, 100) ??
        `Selección · ${last.convocatoriaSeleccion}`
    );
  }
  if (last.lesion) {
    hechos.push(last.lesion.grave ? "Lesión grave · menos minutos" : "Lesión menor");
  }
  if (oferta) {
    hechos.push(`Oferta · ${oferta.clubNombre}`);
  }
  const hechosCortos = hechos.slice(0, 3);

  const pk = last.partidoClave;
  const clubNombre = club?.nombre ?? "Tu club";

  const fichaJugador = {
    ...j,
    atributos: attrs,
    reputacion: last.reputacion,
    moral: last.moral,
    edad: last.edad,
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 animate-in fade-in">
      {/* Marcador de periodo */}
      <Card>
        <CardHeader className="border-b border-border/50 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Periodo {temporadaN} · {last.edadInicio}–{last.edad} años · {rendPct}%
              </p>
              <CardTitle className="flex flex-wrap items-center gap-2 text-xl sm:text-2xl">
                <span
                  className={cn(
                    "inline-flex h-5 min-w-[2rem] items-center justify-center rounded-[2px] bg-[#d94a3d] px-1.5 text-[10px] font-black text-white",
                    j.posicion === "arquero" && "bg-[#c9a227] text-black",
                    (j.posicion === "defensa_central" || j.posicion === "lateral") &&
                      "bg-[#2f6fed]",
                    j.posicion === "mediocampista" && "bg-[#2a9e5c]"
                  )}
                >
                  {POSICION_CODE[j.posicion]}
                </span>
                {j.apellido}
                <span className="text-base font-normal text-muted-foreground">
                  {POSICION_LABELS[j.posicion]}
                </span>
              </CardTitle>
              <p className="text-sm font-normal text-muted-foreground">
                {clubNombre} · {liga?.nombre}
                {j.esProfesional ? " · Pro" : " · Cantera"}
              </p>
            </div>
            <div className="min-w-[4.5rem] shrink-0 rounded-[2px] border border-black/20 bg-[#1e2227] px-3 py-2 text-right">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                OVR
              </p>
              <p
                className={cn(
                  "text-3xl font-black tabular-nums leading-none",
                  mediaTone.text
                )}
              >
                {media}
              </p>
              <div className="mt-1 flex justify-end">
                <DeltaMark delta={deltaMedia} />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-5">
          <div className="grid grid-cols-4 gap-2 rounded-2xl border border-border/60 bg-muted/20 px-3 py-5 sm:px-6">
            <StatBig label="PJ" value={last.partidosJugados} />
            <StatBig label="Goles" value={last.goles} />
            <StatBig label="Asist." value={last.asistencias} />
            <StatBig
              label="Títulos"
              value={last.titulos.length + (last.premiosIndividuales?.length ?? 0)}
            />
          </div>

          {pk && (
            <div className="space-y-2 rounded-2xl border border-mundial-gold/35 bg-gradient-to-b from-mundial-gold/10 to-transparent px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-mundial-gold">
                Partido del periodo
              </p>
              <div className="flex items-center justify-center gap-3 sm:gap-5">
                <span className="flex-1 truncate text-right text-sm font-semibold sm:text-base">
                  {pk.condicion === "local" ? clubNombre : pk.rival}
                </span>
                <span className="shrink-0 text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
                  {pk.condicion === "local"
                    ? `${pk.golesFavor}–${pk.golesContra}`
                    : `${pk.golesContra}–${pk.golesFavor}`}
                </span>
                <span className="flex-1 truncate text-left text-sm font-semibold sm:text-base">
                  {pk.condicion === "local" ? pk.rival : clubNombre}
                </span>
              </div>
              <p className="text-center text-xs text-muted-foreground">{pk.nota}</p>
            </div>
          )}

          {hechosCortos.length > 0 && (
            <ul className="space-y-1.5">
              {hechosCortos.map((line, i) => (
                <li key={`h-${i}`} className="flex gap-2 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mundial-gold" />
                  <span className="leading-snug">{line}</span>
                </li>
              ))}
            </ul>
          )}

          {last.debutProfesional && hechosCortos.every((h) => !h.includes("Debut")) && (
            <div className="rounded-lg border border-mundial-gold/40 bg-mundial-gold/10 px-3 py-2 text-sm font-medium">
              Ascenso a Primera · debut a los {j.edadDebutProfesional ?? last.edad}
            </div>
          )}

          {last.eventosResolvidos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {last.eventosResolvidos.map((d, i) => (
                <span
                  key={`${d.eventoId}-${i}`}
                  className="inline-flex max-w-full items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                  title={d.afectacion}
                >
                  <span className="mr-1 font-medium text-mundial-gold">
                    {d.decision.slice(0, 28)}
                  </span>
                  <span className="truncate">{d.afectacion}</span>
                </span>
              ))}
            </div>
          )}

          {oferta && (
            <div className="space-y-3 rounded-xl border border-mundial-gold/35 bg-mundial-gold/5 p-4">
              <p className="text-sm font-medium">
                Oferta · {oferta.clubNombre}
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {oferta.ligaNombre}
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => onResolverOferta(true)}>Aceptar</Button>
                <Button variant="outline" onClick={() => onResolverOferta(false)}>
                  Rechazar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ficha WE9 siempre visible — el gancho nostálgico */}
      <CarreraFichaWE9
        jugador={fichaJugador}
        clubNombre={clubNombre}
        ligaNombre={liga?.nombre}
        deltas={deltas}
      />

      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-border/50">
          <button
            type="button"
            className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/30"
            onClick={() => setCarreraOpen((v) => !v)}
          >
            Totales de carrera
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", carreraOpen && "rotate-180")}
            />
          </button>
          {carreraOpen && (
            <div className="space-y-3 border-t border-border/50 px-3 py-3">
              <EtapaMini
                titulo="Cantera"
                partidos={carrera.cantera.partidos}
                goles={carrera.cantera.goles}
                asistencias={carrera.cantera.asistencias}
                titulos={carrera.cantera.titulos}
                premios={carrera.cantera.premios}
              />
              <EtapaMini
                titulo="Profesional"
                accent
                partidos={carrera.profesional.partidos}
                goles={carrera.profesional.goles}
                asistencias={carrera.profesional.asistencias}
                titulos={carrera.profesional.titulos}
                premios={carrera.profesional.premios}
              />
            </div>
          )}
        </div>

        {last.resumenAnio && (
          <div className="overflow-hidden rounded-xl border border-border/50">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/30"
              onClick={() => setCronicaOpen((v) => !v)}
            >
              Ver crónica
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  cronicaOpen && "rotate-180"
                )}
              />
            </button>
            {cronicaOpen && (
              <p className="border-t border-border/50 px-3 py-3 text-xs leading-relaxed text-muted-foreground">
                {last.resumenAnio}
              </p>
            )}
          </div>
        )}

        {!oferta && (
          <Button className="w-full" onClick={onContinuar}>
            Siguiente periodo
          </Button>
        )}
      </div>
    </div>
  );
}
