"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { randomEnRango } from "@/data/ruleta-carrera/opciones";
import { cn } from "@/lib/utils";

interface Props {
  min: number;
  max: number;
  disabled?: boolean;
  onResultado: (valor: number) => void;
  onContinuar?: () => void;
  autoStart?: boolean;
  unidad?: string;
}

export function RevelarNumeroRango({
  min,
  max,
  disabled,
  onResultado,
  onContinuar,
  autoStart = false,
  unidad = "goles",
}: Props) {
  const [fase, setFase] = useState<"idle" | "spinning" | "done">(
    autoStart ? "spinning" : "idle"
  );
  const [display, setDisplay] = useState(min);
  const finalRef = useRef<number | null>(null);
  const onResultadoRef = useRef(onResultado);
  onResultadoRef.current = onResultado;

  useEffect(() => {
    if (fase !== "spinning") return;
    const final = randomEnRango(min, max);
    finalRef.current = final;

    const started = performance.now();
    const duration = 2200;
    let frame = 0;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / duration);
      frame += 1;
      if (t < 0.75 || frame % Math.max(1, Math.floor((t - 0.75) * 40) + 1) === 0) {
        if (t < 0.85) {
          setDisplay(randomEnRango(min, max));
        } else {
          setDisplay(final);
        }
      }
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(final);
        setFase("done");
        onResultadoRef.current(final);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [fase, min, max]);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-4">
      <p className="text-center text-sm text-muted-foreground">
        Rango sorteado:{" "}
        <span className="font-semibold text-foreground">
          {min === max ? min : `${min}–${max}`}
        </span>
      </p>

      <div
        className={cn(
          "relative flex h-28 w-full items-center justify-center overflow-hidden rounded-xl border-2 border-mundial-gold/50 bg-[#0b1220]",
          fase === "spinning" && "animate-pulse"
        )}
      >
        <div
          className={cn(
            "font-mono text-5xl font-bold tabular-nums text-mundial-gold transition-transform",
            fase === "spinning" && "scale-110",
            fase === "done" &&
              "scale-100 drop-shadow-[0_0_12px_rgba(201,162,39,0.55)]"
          )}
        >
          {display}
        </div>
        {fase === "spinning" && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-mundial-gold/10 to-transparent" />
        )}
      </div>

      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {fase === "idle" && "Revelá el número exacto"}
        {fase === "spinning" && "Sorteando…"}
        {fase === "done" && `${unidad} definitivos`}
      </p>

      {fase === "idle" && (
        <Button
          disabled={disabled}
          className="min-w-[160px]"
          onClick={() => setFase("spinning")}
        >
          Revelar número
        </Button>
      )}

      {fase === "done" && onContinuar && (
        <Button className="min-w-[160px]" onClick={onContinuar}>
          Girar
        </Button>
      )}
    </div>
  );
}
