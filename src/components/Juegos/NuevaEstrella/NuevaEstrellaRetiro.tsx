"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DomImageExportButtons } from "@/components/shared/DomImageExportButtons";
import { CarreraFichaWE9 } from "@/components/Juegos/Carrera/CarreraFichaWE9";
import { getClubById, getLigaById } from "@/data/carrera/clubes";
import { labelEstatusClub } from "@/data/nueva-estrella/estatus";
import type { PartidaNuevaEstrella } from "@/data/nueva-estrella/types";

interface Props {
  partida: PartidaNuevaEstrella;
  onReiniciar: () => void;
}

export function NuevaEstrellaRetiro({ partida, onReiniciar }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const j = partida.jugador;
  const club = getClubById(j.clubActualId);
  const liga = getLigaById(j.ligaActualId);

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div
        ref={ref}
        className="space-y-4 rounded-xl border border-border/60 bg-[#0b1220] p-4"
      >
        <div className="text-[#e8ecf2]">
          <p className="text-xs uppercase tracking-widest text-[#8b93a3]">
            Fin de carrera
          </p>
          <p className="mt-1 text-sm text-[#b8c0cc]">
            {partida.motivoRetiro ?? "Carrera terminada"}
          </p>
        </div>

        <CarreraFichaWE9
          jugador={{
            apellido: j.apellido,
            edad: j.edad,
            posicion: j.posicion,
            piernaHabil: j.piernaHabil,
            nacionalidad: j.nacionalidad,
            atributos: j.atributos,
            reputacion: Math.round(j.fama),
            moral: Math.round(j.moral),
            esProfesional: true,
          }}
          clubNombre={club?.nombre}
          ligaNombre={liga?.nombre}
          badge="Leyenda"
          estatusClub={{
            label: labelEstatusClub(j.estatusClub ?? 0),
            value: j.estatusClub ?? 0,
          }}
        />

        <ul className="grid grid-cols-2 gap-2 text-sm text-[#b8c0cc]">
          <li>Partidos: {partida.stats.partidos}</li>
          <li>Goles: {partida.stats.goles}</li>
          <li>Asistencias: {partida.stats.asistencias}</li>
          <li>Fama máx: {partida.stats.famaMax}</li>
          <li>Familia: {j.relaciones.familia}</li>
          <li>Pareja: {j.relaciones.pareja}</li>
          <li>Agente: {j.relaciones.agente}</li>
          <li>Dinero máx: ${partida.stats.dineroMax.toLocaleString()}</li>
        </ul>
      </div>

      <DomImageExportButtons
        targetRef={ref}
        filename={`nueva-estrella-${j.apellido}.png`}
      />

      <Button className="w-full" onClick={onReiniciar}>
        Nueva carrera
      </Button>
    </div>
  );
}
