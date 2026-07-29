"use client";

import { useRef } from "react";
import { CarreraFichaWE9 } from "@/components/Juegos/Carrera/CarreraFichaWE9";
import { DomImageExportButtons } from "@/components/shared/DomImageExportButtons";
import { Button } from "@/components/ui/button";
import type { CarreraGenerada } from "@/data/ruleta-carrera/types";
import { labelCopa, labelTitulo } from "@/data/ruleta-carrera/clubes";

interface Props {
  carrera: CarreraGenerada;
  onReiniciar: () => void;
}

export function RuletaCarreraResumen({
  carrera,
  onReiniciar,
}: Props) {
  const shareRef = useRef<HTMLDivElement>(null);
  const ultimo = carrera.equipos[carrera.equipos.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Carrera completa
        </p>
        <h2 className="text-2xl font-bold">Resumen de {carrera.apellido}</h2>
      </div>

      <div
        ref={shareRef}
        className="space-y-4 rounded-lg border border-border/60 bg-[#0b1220] p-4"
      >
        <CarreraFichaWE9
          jugador={{
            apellido: carrera.apellido,
            edad: carrera.edadRetiro,
            posicion: carrera.posicion,
            piernaHabil: carrera.piernaHabil,
            nacionalidad: "Colombia",
            atributos: carrera.atributosFinales,
            reputacion: 40,
            moral: 30,
            esProfesional: true,
          }}
          clubNombre={ultimo?.equipo}
          ligaNombre={ultimo?.ligaNombre}
          badge="Leyenda"
        />

        <ul className="grid gap-2 text-xs text-[#b8c0cc] sm:grid-cols-2">
          <li>
            Debut: {carrera.edadDebut} años · {carrera.equipoDebut}
          </li>
          <li>
            Temporadas: {carrera.temporadas} · Retiro: {carrera.edadRetiro}
          </li>
          <li>
            Goles {carrera.golesTotales} · Asistencias{" "}
            {carrera.asistenciasTotales}
            {carrera.vallasInvictas != null
              ? ` · Vallas ${carrera.vallasInvictas}`
              : ""}
          </li>
          <li>
            Habilidad:{" "}
            {carrera.habilidadEspecial?.nombre ?? "Sin habilidad especial"}
          </li>
          {carrera.equipos.map((eq, i) => (
            <li key={`${eq.clubId}-${i}`} className="sm:col-span-2">
              {i + 1}. {eq.equipo} — {labelTitulo(eq.tituloNacional)};{" "}
              {labelCopa(eq.copaContinental)}
            </li>
          ))}
        </ul>
      </div>

      <DomImageExportButtons
        targetRef={shareRef}
        filename={`ruleta-carrera-${carrera.apellido}.png`}
      />

      <Button variant="outline" onClick={onReiniciar}>
        Jugar otra carrera
      </Button>
    </div>
  );
}
