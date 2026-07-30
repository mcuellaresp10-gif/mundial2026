"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarreraFichaWE9 } from "@/components/Juegos/Carrera/CarreraFichaWE9";
import { getClubById, getLigaById } from "@/data/carrera/clubes";
import {
  ATRIBUTOS_ENTRENABLES,
  LABEL_ATRIBUTO,
  SEMANAS_SIN_ENTRENAR_PARA_DECAY,
} from "@/data/nueva-estrella/constantes";
import { labelEstatusClub } from "@/data/nueva-estrella/estatus";
import type { AtributoEntrenable, PartidaNuevaEstrella } from "@/data/nueva-estrella/types";
import { puedeEjecutarAccion } from "@/utils/nueva-estrella/engine";

function Bar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="text-muted-foreground">{Math.round(value)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-mundial-gold/80" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface Props {
  partida: PartidaNuevaEstrella;
  onEntrenar: (attr: AtributoEntrenable) => void;
  onSocializar: (
    tipo: "socializar_familia" | "socializar_pareja" | "socializar_agente"
  ) => void;
  onMedios: () => void;
  onDescansar: () => void;
  onIrPartido: () => void;
  onTienda: () => void;
  onTabla: () => void;
  onExportar: () => void;
  onRetirar: () => void;
}

export function NuevaEstrellaHub({
  partida,
  onEntrenar,
  onSocializar,
  onMedios,
  onDescansar,
  onIrPartido,
  onTienda,
  onTabla,
  onExportar,
  onRetirar,
}: Props) {
  const j = partida.jugador;
  const club = getClubById(j.clubActualId);
  const liga = getLigaById(j.ligaActualId);
  const sinEnergia = j.energiaActual <= 0;
  const oxidados = ATRIBUTOS_ENTRENABLES.filter(
    (a) => (j.semanasSinEntrenar?.[a] ?? 0) >= SEMANAS_SIN_ENTRENAR_PARA_DECAY - 1
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            T{j.temporadaActual} · Semana {j.semanaActual}
          </p>
          <h2 className="text-2xl font-bold">Hub semanal</h2>
          <p className="text-sm text-muted-foreground">
            ${j.salarioSemanal.toLocaleString()}/sem · Energía {j.energiaActual}/
            {j.energiaMaxima} · ${j.dinero.toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportar}>
            Código
          </Button>
          <Button variant="ghost" size="sm" onClick={onRetirar}>
            Retirarse
          </Button>
        </div>
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
        badge={`T${j.temporadaActual}`}
        estatusClub={{
          label: labelEstatusClub(j.estatusClub ?? 0),
          value: j.estatusClub ?? 0,
        }}
        compact
      />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Relaciones</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Bar label="Familia" value={j.relaciones.familia} />
          <Bar label="Pareja" value={j.relaciones.pareja} />
          <Bar label="Agente" value={j.relaciones.agente} />
        </CardContent>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Entrenar (1⚡)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {ATRIBUTOS_ENTRENABLES.map((a) => (
              <Button
                key={a}
                size="sm"
                variant="secondary"
                disabled={!puedeEjecutarAccion(partida, "entrenar")}
                onClick={() => onEntrenar(a)}
              >
                {LABEL_ATRIBUTO[a]}
              </Button>
            ))}
            {oxidados.length > 0 && (
              <p className="w-full text-xs text-amber-700 dark:text-amber-400">
                Sin entrenar hace semanas:{" "}
                {oxidados.map((a) => LABEL_ATRIBUTO[a]).join(", ")}. A la 5.ª
                bajan.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Socializar (1⚡)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={!puedeEjecutarAccion(partida, "socializar_familia")}
              onClick={() => onSocializar("socializar_familia")}
            >
              Familia
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!puedeEjecutarAccion(partida, "socializar_pareja")}
              onClick={() => onSocializar("socializar_pareja")}
            >
              Pareja
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={!puedeEjecutarAccion(partida, "socializar_agente")}
              onClick={() => onSocializar("socializar_agente")}
            >
              Agente
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Otras acciones</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={!puedeEjecutarAccion(partida, "medios")}
              onClick={onMedios}
            >
              Medios (1⚡)
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={!puedeEjecutarAccion(partida, "descansar")}
              onClick={onDescansar}
            >
              Descansar (1⚡)
            </Button>
            <Button size="sm" variant="outline" onClick={onTienda}>
              Tienda
            </Button>
            <Button size="sm" variant="outline" onClick={onTabla}>
              Tabla
            </Button>
          </CardContent>
        </Card>

        <Card className="border-mundial-gold/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Día de partido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {sinEnergia
                ? "Sin energía: hora de jugar el partido y cerrar la semana."
                : "Podés seguir usando energía o ir al partido cuando quieras."}
            </p>
            <Button className="w-full" onClick={onIrPartido}>
              Jugar partido
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
