"use client";

import { IdeologiaMapa } from "./IdeologiaMapa";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DomImageExportButtons } from "@/components/shared/DomImageExportButtons";
import type { ResultadoTest } from "@/data/ideologia/types";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface Props {
  resultado: ResultadoTest;
  onReiniciar: () => void;
}

export function IdeologiaResultado({ resultado, onReiniciar }: Props) {
  const shareRef = useRef<HTMLDivElement>(null);
  const dt = resultado.arquetipoGanador;

  return (
    <div className="space-y-4 max-w-2xl animate-in fade-in">
      <div ref={shareRef} className="rounded-xl border bg-card p-5 sm:p-6 space-y-5">
        <div>
          <p className="text-xs uppercase tracking-widest text-mundial-gold font-semibold">
            Fútbol Américas · Ideología
          </p>
          <p className="text-xs text-muted-foreground mt-1">Tu DT es</p>
          <h2 className="text-2xl sm:text-3xl font-bold mt-0.5">{dt.nombre}</h2>
          <p className="text-sm text-mundial-gold/90 mt-1">{dt.apodoOFrase}</p>
          <p className="text-[11px] text-muted-foreground mt-1 capitalize">
            {dt.origen === "colombia" ? "Arquetipo colombiano" : "Arquetipo internacional"}
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-3">
          <ClipboardList className="h-5 w-5 text-mundial-gold shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/90 leading-relaxed">{dt.descripcion}</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Tu mapa ideológico</h3>
          {resultado.porcentajesPorEje.map((eje) => {
            const izq = 100 - eje.porcentajeDerecho;
            return (
              <div key={eje.eje} className="space-y-1.5">
                <div className="flex justify-between gap-2 text-xs">
                  <span className="text-muted-foreground">
                    {eje.ladoIzquierdo}{" "}
                    <span className="font-mono text-foreground">{izq}%</span>
                  </span>
                  <span className="text-muted-foreground text-right">
                    <span className="font-mono text-foreground">{eje.porcentajeDerecho}%</span>{" "}
                    {eje.ladoDerecho}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
                  <div
                    className={cn(
                      "h-full transition-[width]",
                      izq >= eje.porcentajeDerecho ? "bg-sky-500/80" : "bg-sky-500/45"
                    )}
                    style={{ width: `${izq}%` }}
                  />
                  <div
                    className={cn(
                      "h-full transition-[width]",
                      eje.porcentajeDerecho > izq
                        ? "bg-mundial-gold/90"
                        : "bg-mundial-gold/50"
                    )}
                    style={{ width: `${eje.porcentajeDerecho}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <IdeologiaMapa
          ejesUsuario={resultado.ejesUsuario}
          ganadorId={dt.id}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Compartir / repetir</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
          <DomImageExportButtons
            targetRef={shareRef}
            filename={`ideologia-${dt.id}.png`}
          />
          <Button variant="outline" onClick={onReiniciar}>
            Repetir test
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
