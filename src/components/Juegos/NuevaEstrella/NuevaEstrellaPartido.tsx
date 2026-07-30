"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MinijuegoTiming } from "./MinijuegoTiming";
import type {
  PartidaNuevaEstrella,
  ResultadoMinijuego,
  TipoMomentoPartido,
} from "@/data/nueva-estrella/types";
import {
  configTimingMomento,
  tiposMomentosPartido,
} from "@/utils/nueva-estrella/engine";

const LABEL_MOMENTO: Record<TipoMomentoPartido, string> = {
  definicion: "Definición",
  cabezazo: "Cabezazo",
  gambeta: "Gambeta",
  atajada: "Atajada",
  pase_clave: "Pase clave",
};

interface Props {
  partida: PartidaNuevaEstrella;
  onMomento: (tipo: TipoMomentoPartido, r: ResultadoMinijuego) => void;
}

export function NuevaEstrellaPartido({ partida, onMomento }: Props) {
  const tipos = tiposMomentosPartido(partida);
  const idx = partida.momentoPartidoIndex;
  const tipo = tipos[idx];
  const partido = partida.partidoEnCurso;

  if (!partido || !tipo) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Preparando partido…
        </CardContent>
      </Card>
    );
  }

  const config = configTimingMomento(partida, tipo);

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Momento {idx + 1} / {tipos.length}
        </p>
        <h2 className="text-xl font-bold">
          {partida.jugador.apellido} vs {partido.rivalNombre}
        </h2>
        <p className="text-sm text-muted-foreground">
          {partido.local ? "Local" : "Visitante"} · {partido.golesFavor} –{" "}
          {partido.golesContra}
        </p>
      </div>

      <Card className="border-lime-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{LABEL_MOMENTO[tipo]}</CardTitle>
        </CardHeader>
        <CardContent>
          <MinijuegoTiming
            key={`${partido.semana}-${idx}`}
            config={config}
            contexto="partido"
            titulo={LABEL_MOMENTO[tipo]}
            instruccion="Acertá el timing para resolver la jugada"
            onResultado={(r) => onMomento(tipo, r)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button variant="ghost" disabled className="opacity-0 pointer-events-none">
          —
        </Button>
      </div>
    </div>
  );
}
