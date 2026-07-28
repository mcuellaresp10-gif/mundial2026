"use client";

import { useCallback, useMemo, useState } from "react";
import { DILEMAS } from "@/data/ideologia/dilemas";
import type { EleccionDilema, ResultadoTest } from "@/data/ideologia/types";
import { calcularResultadoTest } from "@/utils/ideologia/engine";

export type IdeologiaView = "intro" | "pregunta" | "resultado";

export function useIdeologiaTest() {
  const [view, setView] = useState<IdeologiaView>("intro");
  const [index, setIndex] = useState(0);
  const [elecciones, setElecciones] = useState<EleccionDilema[]>([]);
  const [resultado, setResultado] = useState<ResultadoTest | null>(null);

  const total = DILEMAS.length;
  const dilemaActual = view === "pregunta" ? DILEMAS[index] : null;

  const start = useCallback(() => {
    setElecciones([]);
    setResultado(null);
    setIndex(0);
    setView("pregunta");
  }, []);

  const elegir = useCallback(
    (eleccion: EleccionDilema) => {
      const next = [...elecciones];
      next[index] = eleccion;
      setElecciones(next);

      if (index + 1 >= total) {
        const r = calcularResultadoTest(next);
        setResultado(r);
        setView("resultado");
      } else {
        setIndex(index + 1);
      }
    },
    [elecciones, index, total]
  );

  const reiniciar = useCallback(() => {
    setElecciones([]);
    setResultado(null);
    setIndex(0);
    setView("intro");
  }, []);

  const progreso = useMemo(
    () => ({ actual: Math.min(index + 1, total), total }),
    [index, total]
  );

  return {
    view,
    dilemaActual,
    progreso,
    resultado,
    start,
    elegir,
    reiniciar,
  };
}
