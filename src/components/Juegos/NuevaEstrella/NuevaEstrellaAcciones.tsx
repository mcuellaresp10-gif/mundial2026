"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pickEntrevista } from "@/data/nueva-estrella/entrevistas";
import { LABEL_ATRIBUTO } from "@/data/nueva-estrella/constantes";
import type {
  AtributoEntrenable,
  PartidaNuevaEstrella,
  ResultadoMinijuego,
} from "@/data/nueva-estrella/types";
import { configTimingDesdeAtributo } from "@/utils/nueva-estrella/timing";
import { MinijuegoTiming } from "./MinijuegoTiming";

interface EntrenarProps {
  partida: PartidaNuevaEstrella;
  atributo: AtributoEntrenable;
  onDone: (r: ResultadoMinijuego) => void;
  onCancel: () => void;
}

export function NuevaEstrellaEntrenar({
  partida,
  atributo,
  onDone,
  onCancel,
}: EntrenarProps) {
  const valor = partida.jugador.atributos[atributo] ?? 40;
  const config = configTimingDesdeAtributo(valor, 0.3);

  return (
    <div className="space-y-3 max-w-lg mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Entrenar {LABEL_ATRIBUTO[atributo]}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
      <MinijuegoTiming
        config={config}
        contexto="entrenamiento"
        titulo={`Drill de ${LABEL_ATRIBUTO[atributo]}`}
        onResultado={onDone}
      />
    </div>
  );
}

interface MediosProps {
  partida: PartidaNuevaEstrella;
  onElegir: (preguntaId: string, opcionId: string) => void;
  onCancel: () => void;
}

const TIEMPO_MEDIOS_MS = 8000;

export function NuevaEstrellaMedios({ partida, onElegir, onCancel }: MediosProps) {
  const pregunta = pickEntrevista(
    partida.jugador.semanaActual + partida.jugador.temporadaActual * 100
  );
  const [restante, setRestante] = useState(TIEMPO_MEDIOS_MS);
  const onElegirRef = useRef(onElegir);
  onElegirRef.current = onElegir;
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const left = Math.max(0, TIEMPO_MEDIOS_MS - (now - start));
      setRestante(left);
      if (left <= 0) {
        if (!doneRef.current) {
          doneRef.current = true;
          const mid = pregunta.opciones[0]!;
          onElegirRef.current(pregunta.id, mid.id);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pregunta.id, pregunta.opciones]);

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex justify-between gap-2">
          <CardTitle className="text-base">Entrevista</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Salir
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Tiempo: {(restante / 1000).toFixed(1)}s
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium">{pregunta.pregunta}</p>
        <div className="space-y-2">
          {pregunta.opciones.map((o) => (
            <Button
              key={o.id}
              variant="secondary"
              className="w-full justify-start h-auto whitespace-normal py-3 text-left"
              onClick={() => {
                if (doneRef.current) return;
                doneRef.current = true;
                onElegir(pregunta.id, o.id);
              }}
            >
              <span className="text-xs uppercase text-muted-foreground mr-2">
                {o.tono}
              </span>
              {o.texto}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
