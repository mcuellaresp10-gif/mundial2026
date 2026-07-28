"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DomImageExportButtons } from "@/components/shared/DomImageExportButtons";
import { POSICION_LABELS } from "@/data/carrera/atributos";
import type { EstadoCarrera, ResumenCarrera } from "@/data/carrera/types";

interface Props {
  estado: EstadoCarrera;
  resumen: ResumenCarrera;
  onReiniciar: () => void;
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
      <div ref={shareRef} className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-mundial-gold font-semibold">
            Fútbol Américas · Carrera
          </p>
          <h2 className="text-2xl font-bold mt-1">
            {j.apellido} — {POSICION_LABELS[j.posicion]}
          </h2>
          <p className="text-sm text-muted-foreground">
            {j.nacionalidad} · {motivoLabel} a los {resumen.edadRetiro} años
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-2xl font-bold tabular-nums">{resumen.partidos}</p>
            <p className="text-xs text-muted-foreground">Partidos</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-2xl font-bold tabular-nums">{resumen.goles}</p>
            <p className="text-xs text-muted-foreground">Goles</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-2xl font-bold tabular-nums">{resumen.asistencias}</p>
            <p className="text-xs text-muted-foreground">Asistencias</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-2xl font-bold tabular-nums">
              {resumen.titulos.length + resumen.premiosIndividuales.length}
            </p>
            <p className="text-xs text-muted-foreground">Trofeos/premios</p>
          </div>
        </div>

        <div className="text-sm space-y-1">
          <p>
            <span className="font-medium">Clubes: </span>
            {resumen.clubes.join(" → ") || "—"}
          </p>
          {resumen.titulos.length > 0 && (
            <p>
              <span className="font-medium">Palmarés: </span>
              {[...new Set(resumen.titulos)].join(", ")}
            </p>
          )}
          {resumen.premiosIndividuales.length > 0 && (
            <p>
              <span className="font-medium">Premios: </span>
              {[...new Set(resumen.premiosIndividuales)].join(", ")}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border/60 p-4 space-y-1">
          <p className="font-medium">Estilo comparable a: {resumen.comparacion.figura}</p>
          <p className="text-sm text-muted-foreground">{resumen.comparacion.razon}</p>
          <p className="text-[11px] text-muted-foreground/80 italic pt-1">
            {resumen.comparacion.disclaimer}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Compartir</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
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
