"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NACIONALIDADES_V1, POSICION_LABELS } from "@/data/carrera/atributos";
import { getClubesBetPlay } from "@/data/carrera/clubes";
import type { PiernaHabil, Posicion } from "@/data/carrera/types";
import type { CrearJugadorNEInput } from "@/data/nueva-estrella/types";

const POSICIONES = Object.keys(POSICION_LABELS) as Posicion[];
const PIERNAS: PiernaHabil[] = ["derecha", "izquierda", "ambidiestro"];

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

interface Props {
  onStart: (input: CrearJugadorNEInput) => void;
  onImportar?: (codigo: string) => void;
}

export function NuevaEstrellaSetup({ onStart, onImportar }: Props) {
  const clubes = getClubesBetPlay();
  const [apellido, setApellido] = useState("");
  const [posicion, setPosicion] = useState<Posicion>(() => pickRandom(POSICIONES));
  const [piernaHabil, setPiernaHabil] = useState<PiernaHabil>(() =>
    pickRandom(PIERNAS)
  );
  const [nacionalidad, setNacionalidad] = useState<string>(() =>
    pickRandom(NACIONALIDADES_V1)
  );
  const [clubOrigenId, setClubOrigenId] = useState(
    () => pickRandom(clubes)?.id ?? "millonarios"
  );
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      onStart({ apellido, posicion, piernaHabil, nacionalidad, clubOrigenId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear");
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Nueva Estrella</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Creá tu futbolista, gestioná la semana y resolvé momentos clave con
            timing. Inspirado en New Star Soccer — juego aparte del simulador de
            carrera.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Apellido</label>
              <Input
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Riquelme"
                className="mt-1"
                required
                maxLength={32}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Posición</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={posicion}
                onChange={(e) => setPosicion(e.target.value as Posicion)}
              >
                {POSICIONES.map((p) => (
                  <option key={p} value={p}>
                    {POSICION_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Pierna hábil</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={piernaHabil}
                onChange={(e) => setPiernaHabil(e.target.value as PiernaHabil)}
              >
                {PIERNAS.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Nacionalidad</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={nacionalidad}
                onChange={(e) => setNacionalidad(e.target.value)}
              >
                {NACIONALIDADES_V1.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Club de origen (BetPlay)</label>
              <select
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={clubOrigenId}
                onChange={(e) => setClubOrigenId(e.target.value)}
              >
                {clubes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">
              Empezar carrera
            </Button>
          </form>
        </CardContent>
      </Card>

      {onImportar && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Continuar con código</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Pegá tu código NE1...."
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                try {
                  onImportar(codigo);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Código inválido");
                }
              }}
            >
              Cargar código
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
