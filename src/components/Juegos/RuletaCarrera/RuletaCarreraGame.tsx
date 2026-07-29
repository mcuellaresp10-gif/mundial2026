"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RuletaSpinner } from "./RuletaSpinner";
import { RevelarNumeroRango } from "./RevelarNumeroRango";
import { RuletaCarreraResumen } from "./RuletaCarreraResumen";
import { useRuletaCarrera } from "@/hooks/useRuletaCarrera";
import type { OpcionRuleta } from "@/data/ruleta-carrera/types";

export function RuletaCarreraGame() {
  const game = useRuletaCarrera();
  const [autoNonce, setAutoNonce] = useState(0);
  const spinnerKey = `${game.paso?.id ?? "none"}-a${autoNonce}`;

  if (game.terminado && game.carrera) {
    return (
      <RuletaCarreraResumen
        carrera={game.carrera}
        onReiniciar={() => {
          setAutoNonce(0);
          game.reiniciar();
        }}
      />
    );
  }

  if (!game.paso) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Preparando carrera…</p>
        <Button onClick={game.reiniciar}>Empezar de nuevo</Button>
      </div>
    );
  }

  const esGolesExacto = game.paso.kind === "golesExacto";
  const esAsistenciasExacto = game.paso.kind === "asistenciasExacto";
  const rangoGoles = game.draft.golesRango;
  const rangoAsistencias = game.draft.asistenciasRango;
  const debeAutoGirar = autoNonce > 0 && !game.resultadoActual;

  const avanzarYSeguirGirando = () => {
    setAutoNonce((n) => n + 1);
    game.siguiente();
  };

  const revelarExacto =
    (esGolesExacto && rangoGoles) || (esAsistenciasExacto && rangoAsistencias)
      ? {
          key: esGolesExacto
            ? `goles-${rangoGoles!.min}-${rangoGoles!.max}-a${autoNonce}`
            : `asist-${rangoAsistencias!.min}-${rangoAsistencias!.max}-a${autoNonce}`,
          min: esGolesExacto ? rangoGoles!.min : rangoAsistencias!.min,
          max: esGolesExacto ? rangoGoles!.max : rangoAsistencias!.max,
          unidad: esGolesExacto ? "goles" : "asistencias",
          idPrefix: esGolesExacto ? "goles-exacto" : "asistencias-exacto",
        }
      : null;

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-mundial-gold transition-all duration-500"
            style={{
              width: `${Math.min(
                100,
                ((game.pasoIndex + (game.bloqueoGiro ? 1 : 0)) /
                  Math.max(1, game.totalPasos)) *
                  100
              )}%`,
            }}
          />
        </div>
        <h2 className="pt-2 text-xl font-bold">{game.paso.titulo}</h2>
      </div>

      {revelarExacto ? (
        <RevelarNumeroRango
          key={revelarExacto.key}
          min={revelarExacto.min}
          max={revelarExacto.max}
          disabled={false}
          unidad={revelarExacto.unidad}
          autoStart={debeAutoGirar}
          onContinuar={avanzarYSeguirGirando}
          onResultado={(valor) =>
            game.onResultadoRuleta({
              id: `${revelarExacto.idPrefix}-${valor}`,
              label: `${valor}`,
              valor,
            })
          }
        />
      ) : (
        <RuletaSpinner
          key={spinnerKey}
          opciones={game.opciones as OpcionRuleta<unknown>[]}
          disabled={game.bloqueoGiro}
          resultadoListo={Boolean(game.resultadoActual)}
          autoGirar={debeAutoGirar}
          onContinuar={avanzarYSeguirGirando}
          onResultado={(op) => game.onResultadoRuleta(op)}
        />
      )}

      {game.resultadoActual && (
        <div className="rounded-lg border border-mundial-gold/35 bg-mundial-gold/10 px-4 py-3 text-center">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Resultado
          </p>
          <p className="mt-1 text-lg font-semibold">{game.resultadoActual}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tocá <span className="font-semibold text-foreground">Girar</span>{" "}
            para seguir
          </p>
        </div>
      )}
    </div>
  );
}
