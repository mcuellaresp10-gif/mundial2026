"use client";

import { useCallback, useMemo, useState } from "react";
import type { CrearJugadorInput, EstadoCarrera } from "@/data/carrera/types";
import {
  aceptarOferta,
  avanzarAnio,
  cerrarTemporada,
  construirResumen,
  crearJugador,
  EDAD_RETIRO_FORZADO,
  EDAD_RETIRO_OPCION,
  estadoInicial,
  iniciarPrimeraTemporada,
} from "@/utils/carrera/engine";

export type CarreraView =
  | "setup"
  | "eventos"
  | "resultado"
  | "retiro_prompt"
  | "resumen";

export function useCarreraGame() {
  const [estado, setEstado] = useState<EstadoCarrera | null>(null);
  const [eventoIndex, setEventoIndex] = useState(0);
  const [view, setView] = useState<CarreraView>("setup");
  const [showRetiroPrompt, setShowRetiroPrompt] = useState(false);

  const resumen = useMemo(
    () => (estado?.retirado ? construirResumen(estado) : null),
    [estado]
  );

  const start = useCallback((input: CrearJugadorInput) => {
    const jugador = crearJugador(input);
    const base = iniciarPrimeraTemporada(estadoInicial(jugador));
    setEstado(base);
    setEventoIndex(0);
    setView("eventos");
    setShowRetiroPrompt(false);
  }, []);

  const reset = useCallback(() => {
    setEstado(null);
    setEventoIndex(0);
    setView("setup");
    setShowRetiroPrompt(false);
  }, []);

  const elegirOpcion = useCallback(
    (opcionIndex: number) => {
      setEstado((prev) => {
        if (!prev || prev.fase !== "temporada_eventos") return prev;
        const ev = prev.eventosPendientes[eventoIndex];
        if (!ev) return prev;

        const decisiones = [
          ...prev.decisionesTemporada,
          { eventoId: ev.id, opcionIndex },
        ];
        const nextIndex = eventoIndex + 1;

        if (nextIndex < prev.eventosPendientes.length) {
          setEventoIndex(nextIndex);
          return { ...prev, decisionesTemporada: decisiones };
        }

        const cerrado = cerrarTemporada({
          ...prev,
          decisionesTemporada: decisiones,
        });
        setEventoIndex(0);
        if (cerrado.retirado) {
          setView("resumen");
        } else {
          setView("resultado");
        }
        return cerrado;
      });
    },
    [eventoIndex]
  );

  const resolverOferta = useCallback((aceptar: boolean) => {
    setEstado((prev) => (prev ? aceptarOferta(prev, aceptar) : prev));
  }, []);

  const continuarSiguienteAnio = useCallback((retirarse = false) => {
    setEstado((prev) => {
      if (!prev) return prev;

      if (retirarse) {
        const done = {
          ...prev,
          retirado: true,
          motivoRetiro: "voluntario" as const,
          fase: "retiro" as const,
          ofertaPendiente: null,
        };
        setView("resumen");
        setShowRetiroPrompt(false);
        return done;
      }

      const edadSiguiente = prev.jugador.edad + 1;
      const last = prev.historialTemporadas[prev.historialTemporadas.length - 1];
      const enDeclive = last != null && last.rendimientoPromedio < 0.55;

      if (
        !showRetiroPrompt &&
        edadSiguiente >= EDAD_RETIRO_OPCION &&
        edadSiguiente < EDAD_RETIRO_FORZADO &&
        enDeclive
      ) {
        setShowRetiroPrompt(true);
        setView("retiro_prompt");
        return prev;
      }

      const next = avanzarAnio(prev, {
        forzarRetiro: edadSiguiente >= EDAD_RETIRO_FORZADO,
      });
      setShowRetiroPrompt(false);
      if (next.retirado) {
        setView("resumen");
      } else {
        setView("eventos");
        setEventoIndex(0);
      }
      return next;
    });
  }, [showRetiroPrompt]);

  const eventoActual = estado?.eventosPendientes[eventoIndex] ?? null;

  return {
    estado,
    view,
    eventoIndex,
    eventoActual,
    resumen,
    start,
    reset,
    elegirOpcion,
    resolverOferta,
    continuarSiguienteAnio,
  };
}
