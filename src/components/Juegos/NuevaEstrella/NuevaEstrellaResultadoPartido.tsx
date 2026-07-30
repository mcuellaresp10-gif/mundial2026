"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { labelEstatusClub } from "@/data/nueva-estrella/estatus";
import type { PartidoSemana } from "@/data/nueva-estrella/types";

interface Props {
  partido: PartidoSemana;
  onContinuar: () => void;
}

export function NuevaEstrellaResultadoPartido({ partido, onContinuar }: Props) {
  const resultado =
    partido.golesFavor > partido.golesContra
      ? "Victoria"
      : partido.golesFavor < partido.golesContra
        ? "Derrota"
        : "Empate";

  const delta = partido.estatusDelta ?? 0;
  const estatusTras = partido.estatusTras;

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Resultado de la fecha</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          vs {partido.rivalNombre} ({partido.local ? "L" : "V"})
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-4xl font-bold tabular-nums">
            {partido.golesFavor} – {partido.golesContra}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{resultado}</p>
          <p className="mt-2 text-lg">
            Nota: <span className="font-semibold">{partido.calificacion}</span>/10
          </p>
          {partido.bonoDinero > 0 && (
            <p className="text-sm text-emerald-500">
              Bono +${partido.bonoDinero.toLocaleString()}
            </p>
          )}
          {estatusTras != null && (
            <p className="mt-2 text-sm">
              En el club:{" "}
              <span className="font-semibold">
                {labelEstatusClub(estatusTras)}
              </span>
              {delta !== 0 && (
                <span
                  className={
                    delta > 0 ? "text-emerald-500 ml-1" : "text-rose-400 ml-1"
                  }
                >
                  ({delta > 0 ? "+" : ""}
                  {delta})
                </span>
              )}
            </p>
          )}
        </div>

        <ul className="space-y-2 text-sm">
          {partido.momentos.map((m, i) => (
            <li
              key={i}
              className="flex justify-between gap-2 border-b border-border/40 py-1"
            >
              <span className="capitalize">{m.tipo.replace("_", " ")}</span>
              <span className="text-muted-foreground">
                {m.resultadoMinijuego.tipo} → {m.resultadoJugada}
              </span>
            </li>
          ))}
        </ul>

        <Button className="w-full" onClick={onContinuar}>
          Continuar
        </Button>
      </CardContent>
    </Card>
  );
}
