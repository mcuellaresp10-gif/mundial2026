"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ConfigTiming, ResultadoMinijuego } from "@/data/nueva-estrella/types";
import { evaluarToque, posicionIndicador } from "@/utils/nueva-estrella/timing";
import { cn } from "@/lib/utils";

export type ContextoTiming = "entrenamiento" | "partido" | "medios";

interface Props {
  config: ConfigTiming;
  contexto?: ContextoTiming;
  titulo?: string;
  instruccion?: string;
  onResultado: (r: ResultadoMinijuego) => void;
}

const CTX_STYLE: Record<ContextoTiming, string> = {
  entrenamiento: "from-emerald-950/80 to-slate-950",
  partido: "from-lime-950/70 to-slate-950",
  medios: "from-amber-950/70 to-slate-950",
};

export function MinijuegoTiming({
  config,
  contexto = "entrenamiento",
  titulo = "Timing",
  instruccion = "Tocá cuando el indicador esté en la zona verde",
  onResultado,
}: Props) {
  const [running, setRunning] = useState(true);
  const [pos, setPos] = useState(0);
  const startRef = useRef(performance.now());
  const posRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    doneRef.current = false;
    setRunning(true);
    startRef.current = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      if (doneRef.current) return;
      const p = posicionIndicador(now - startRef.current, config.velocidad);
      posRef.current = p;
      setPos(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [config.velocidad, config.zonaCentro, config.zonaVerdeAncho]);

  const tap = () => {
    if (doneRef.current || !running) return;
    doneRef.current = true;
    setRunning(false);
    const elapsed = performance.now() - startRef.current;
    const resultado = evaluarToque(posRef.current, config, elapsed);
    onResultado(resultado);
  };

  const halfVerde = config.zonaVerdeAncho / 2;
  const halfAmarilla = config.zonaAmarillaAncho / 2;
  const verdeLeft = Math.max(0, config.zonaCentro - halfVerde) * 100;
  const verdeWidth = config.zonaVerdeAncho * 100;
  const amarillaLeft = Math.max(0, config.zonaCentro - halfAmarilla) * 100;
  const amarillaWidth = config.zonaAmarillaAncho * 100;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-gradient-to-b p-5 space-y-4",
        CTX_STYLE[contexto]
      )}
    >
      <div>
        <h3 className="text-lg font-semibold">{titulo}</h3>
        <p className="text-sm text-muted-foreground">{instruccion}</p>
      </div>

      <div className="relative h-10 w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
        <div
          className="absolute inset-y-0 bg-amber-400/35"
          style={{ left: `${amarillaLeft}%`, width: `${amarillaWidth}%` }}
        />
        <div
          className="absolute inset-y-0 bg-emerald-400/55"
          style={{ left: `${verdeLeft}%`, width: `${verdeWidth}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-1 -translate-x-1/2 rounded bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{ left: `${pos * 100}%` }}
        />
      </div>

      <Button className="w-full h-12 text-base" onClick={tap} disabled={!running}>
        ¡Ya!
      </Button>
    </div>
  );
}
