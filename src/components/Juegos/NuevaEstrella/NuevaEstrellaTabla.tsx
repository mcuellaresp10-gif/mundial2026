"use client";

import { Button } from "@/components/ui/button";
import { getClubById, getLigaById } from "@/data/carrera/clubes";
import type { PartidaNuevaEstrella } from "@/data/nueva-estrella/types";
import { ordenarTabla } from "@/utils/nueva-estrella/liga";
import { cn } from "@/lib/utils";

interface Props {
  partida: PartidaNuevaEstrella;
  onVolver: () => void;
}

export function NuevaEstrellaTabla({ partida, onVolver }: Props) {
  const tl = partida.temporadaLiga;
  const liga = getLigaById(tl.ligaId);
  const clubJugador = partida.jugador.clubActualId;
  const filas = ordenarTabla(tl.tabla);
  const totalJornadas = tl.fixture.length;
  const jornadaMostrada = Math.min(tl.jornadaActual, totalJornadas);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Temporada {tl.temporada} · Jornada {jornadaMostrada}/{totalJornadas}
          </p>
          <h2 className="text-2xl font-bold">{liga?.nombre ?? tl.ligaId}</h2>
          <p className="text-sm text-muted-foreground">
            Clasificación · solo ida
          </p>
        </div>
        <Button variant="outline" onClick={onVolver}>
          Volver
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-2 py-2 font-medium">Pos</th>
              <th className="px-2 py-2 font-medium">Club</th>
              <th className="px-2 py-2 text-center font-medium">PJ</th>
              <th className="px-2 py-2 text-center font-medium">PG</th>
              <th className="px-2 py-2 text-center font-medium">PE</th>
              <th className="px-2 py-2 text-center font-medium">PP</th>
              <th className="px-2 py-2 text-center font-medium">GF</th>
              <th className="px-2 py-2 text-center font-medium">GC</th>
              <th className="px-2 py-2 text-center font-medium">DIF</th>
              <th className="px-2 py-2 text-center font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f, i) => {
              const esJugador = f.clubId === clubJugador;
              const nombre = getClubById(f.clubId)?.nombre ?? f.clubId;
              const dif = f.gf - f.gc;
              return (
                <tr
                  key={f.clubId}
                  className={cn(
                    "border-b border-border/60 last:border-0",
                    esJugador && "bg-mundial-gold/15 font-semibold"
                  )}
                >
                  <td className="px-2 py-2 tabular-nums">{i + 1}</td>
                  <td className="px-2 py-2">{nombre}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{f.pj}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{f.pg}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{f.pe}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{f.pp}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{f.gf}</td>
                  <td className="px-2 py-2 text-center tabular-nums">{f.gc}</td>
                  <td className="px-2 py-2 text-center tabular-nums">
                    {dif > 0 ? `+${dif}` : dif}
                  </td>
                  <td className="px-2 py-2 text-center tabular-nums">{f.pts}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
