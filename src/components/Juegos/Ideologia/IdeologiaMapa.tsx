"use client";

import { ARQUETIPOS_DT } from "@/data/ideologia/arquetipos";
import type { EjesIdeologicos } from "@/data/ideologia/types";
import { cn } from "@/lib/utils";

/**
 * Mapa 2D:
 * X = Posesión (−) ↔ Vertical (+)
 * Y = Pragmático (arriba, resultadismo −) ↔ Dogmático (abajo, idealismo +)
 */
function toPercent(valor: number): number {
  return Math.max(0, Math.min(100, 50 + valor / 2));
}

function coordsFromEjes(ejes: EjesIdeologicos): { left: number; top: number } {
  return {
    left: toPercent(ejes.posesionVerticalidad),
    top: toPercent(ejes.resultadismoIdealismo),
  };
}

interface Props {
  ejesUsuario: EjesIdeologicos;
  ganadorId: string;
  className?: string;
}

export function IdeologiaMapa({ ejesUsuario, ganadorId, className }: Props) {
  const yo = coordsFromEjes(ejesUsuario);

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold">Mapa táctico</h3>
      <p className="text-[11px] text-muted-foreground leading-snug">
        Posesión ↔ Vertical · Pragmático ↔ Dogmático. El punto blanco eres tú;
        pasa el cursor sobre un DT para ver su nombre.
      </p>

      <div className="relative aspect-square w-full max-w-md mx-auto rounded-2xl overflow-hidden border border-white/15 bg-[#0a0c12] shadow-inner">
        {/* Grid 4×4 dashed */}
        <svg
          className="absolute inset-0 h-full w-full opacity-35 pointer-events-none"
          aria-hidden
        >
          {[25, 50, 75].map((p) => (
            <g key={p}>
              <line
                x1={`${p}%`}
                y1="0"
                x2={`${p}%`}
                y2="100%"
                stroke="white"
                strokeWidth="1"
                strokeDasharray="3 5"
                opacity={p === 50 ? 0 : 1}
              />
              <line
                x1="0"
                y1={`${p}%`}
                x2="100%"
                y2={`${p}%`}
                stroke="white"
                strokeWidth="1"
                strokeDasharray="3 5"
                opacity={p === 50 ? 0 : 1}
              />
            </g>
          ))}
        </svg>

        {/* Cross axes */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/75 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/75 -translate-y-1/2" />

        {/* Axis labels */}
        <span className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide text-white uppercase">
          Pragmático
        </span>
        <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide text-white uppercase">
          Dogmático
        </span>
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide text-white uppercase">
          Posesión
        </span>
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold tracking-wide text-white uppercase">
          Vertical
        </span>

        {/* DT dots */}
        {ARQUETIPOS_DT.map((dt) => {
          const { left, top } = coordsFromEjes(dt.vectorIdeologico);
          const esGanador = dt.id === ganadorId;
          const tooltipAbove = top >= 28;

          return (
            <div
              key={dt.id}
              className="absolute z-[5] -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              <span
                className={cn(
                  "block rounded-full border bg-transparent shadow-sm",
                  esGanador
                    ? "h-2.5 w-2.5 sm:h-3 sm:w-3 border-mundial-gold/90 shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                    : "h-2 w-2 sm:h-2.5 sm:w-2.5 border-white/50"
                )}
              />
              <div
                className={cn(
                  "pointer-events-none absolute left-1/2 -translate-x-1/2 w-max max-w-[150px] sm:max-w-[170px] opacity-0 group-hover:opacity-100 transition-opacity z-30",
                  tooltipAbove ? "bottom-full mb-1.5" : "top-full mt-1.5"
                )}
              >
                <div className="rounded-lg bg-black/85 border border-white/10 px-2 py-1.5 text-center shadow-lg">
                  <p className="text-[10px] sm:text-[11px] font-bold text-white leading-tight">
                    {dt.nombre}
                  </p>
                  <p className="text-[8px] sm:text-[9px] font-semibold tracking-wide text-white/55 uppercase mt-0.5 leading-tight">
                    {dt.etiquetaMapa}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* User */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${yo.left}%`, top: `${yo.top}%` }}
          title="Vos"
        >
          <span className="relative flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-white/30 animate-ping opacity-40" />
            <span className="relative h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-black/80 bg-white shadow-[0_0_10px_rgba(255,255,255,0.55)]" />
          </span>
        </div>
      </div>
    </div>
  );
}
