"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SEGMENT_COLORS } from "@/data/ruleta-carrera/opciones";
import type { OpcionRuleta } from "@/data/ruleta-carrera/types";
import { pickWeighted, segmentAngles } from "@/utils/ruleta-carrera/pickWeighted";
import { cn } from "@/lib/utils";

interface RuletaSpinnerProps<T> {
  opciones: OpcionRuleta<T>[];
  disabled?: boolean;
  spinning?: boolean;
  /** Ya hay resultado: Girar actúa como continuar + auto-giro. */
  resultadoListo?: boolean;
  onContinuar?: () => void;
  /** Al montar, gira solo de inmediato. */
  autoGirar?: boolean;
  onResultado: (opcion: OpcionRuleta<T>) => void;
  className?: string;
}

function polar(cx: number, cy: number, r: number, angleDegFromTop: number) {
  const rad = ((angleDegFromTop - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function wrapLabel(text: string, maxLineLen: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [text];
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > maxLineLen && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 4);
}

function slicePath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  sweepDeg: number
): string {
  const end = startDeg + sweepDeg;
  const p0 = polar(cx, cy, r, startDeg);
  const p1 = polar(cx, cy, r, end);
  const large = sweepDeg > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${p0.x} ${p0.y}`,
    `A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`,
    "Z",
  ].join(" ");
}

export function RuletaSpinner<T>({
  opciones,
  disabled,
  spinning: spinningExternal,
  resultadoListo,
  onContinuar,
  autoGirar = false,
  onResultado,
  className,
}: RuletaSpinnerProps<T>) {
  const safeOpciones: OpcionRuleta<T>[] = Array.isArray(opciones)
    ? opciones
    : [];
  const angles = useMemo(() => segmentAngles(safeOpciones), [safeOpciones]);

  const [rotation, setRotation] = useState(() => {
    const a = segmentAngles(safeOpciones);
    return a[0] ? -a[0].mid : 0;
  });
  const [spinning, setSpinning] = useState(false);
  const locked = useRef(false);
  const rotationRef = useRef(rotation);
  rotationRef.current = rotation;
  const opcionesRef = useRef<OpcionRuleta<T>[]>(safeOpciones);
  opcionesRef.current = safeOpciones;
  const anglesRef = useRef(angles);
  anglesRef.current = angles;
  const onResultadoRef = useRef(onResultado);
  onResultadoRef.current = onResultado;
  const onContinuarRef = useRef(onContinuar);
  onContinuarRef.current = onContinuar;
  const resultadoListoRef = useRef(resultadoListo);
  resultadoListoRef.current = resultadoListo;

  const iniciarGiro = (force = false) => {
    if (!force && resultadoListoRef.current) {
      onContinuarRef.current?.();
      return;
    }
    if (locked.current || spinning) return;
    const ops = opcionesRef.current;
    const angs = anglesRef.current;
    if (ops.length === 0) return;

    locked.current = true;
    setSpinning(true);

    const ganadora = pickWeighted(ops);
    const idx = ops.findIndex((o) => o.id === ganadora.id);
    const seg = angs[idx] ?? { mid: 0, start: 0, sweep: 360 };

    const targetMod = ((-seg.mid) % 360 + 360) % 360;
    const vueltas = 4 + Math.floor(Math.random() * 3);
    const currentMod = ((rotationRef.current % 360) + 360) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const next = rotationRef.current + vueltas * 360 + delta;

    setRotation(next);
    rotationRef.current = next;

    window.setTimeout(() => {
      setSpinning(false);
      locked.current = false;
      onResultadoRef.current(ganadora);
    }, 4200);
  };

  // Auto-giro forzado al montar / cuando autoGirar pasa a true
  useEffect(() => {
    if (!autoGirar) return;
    if (safeOpciones.length === 0) return;

    locked.current = false;
    const t = window.setTimeout(() => {
      iniciarGiro(true);
    }, 120);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGirar, safeOpciones.length]);

  const busy = spinning || spinningExternal;
  const cx = 100;
  const cy = 100;
  const r = 98;
  const puedeContinuar = Boolean(resultadoListo && onContinuar);
  // Con resultado listo, Girar siempre puede continuar (aunque no haya segmentos).
  const botonDisabled =
    busy || (!puedeContinuar && (disabled || safeOpciones.length === 0));

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative mx-auto w-full max-w-[320px] aspect-square">
        <div
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-0.5"
          aria-hidden
        >
          <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-mundial-gold drop-shadow" />
        </div>

        <div
          className="absolute inset-2 overflow-hidden rounded-full border-4 border-[#1a1d21] shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: busy
              ? "transform 4s cubic-bezier(0.12, 0.75, 0.08, 1)"
              : "none",
          }}
        >
          <svg viewBox="0 0 200 200" className="h-full w-full">
            {safeOpciones.map((op, i) => {
              const a = angles[i];
              if (!a) return null;
              const color =
                op.color ?? SEGMENT_COLORS[i % SEGMENT_COLORS.length]!;
              const n = Math.max(1, safeOpciones.length);
              const flip = a.mid > 90 && a.mid < 270;
              const labelAngle = flip ? a.mid + 90 : a.mid - 90;
              const labelR = n > 12 ? r * 0.68 : r * 0.62;
              const mid = polar(cx, cy, labelR, a.mid);

              const maxLine =
                n > 14
                  ? 10
                  : n > 10
                    ? 12
                    : n > 6
                      ? 14
                      : op.label.length > 22
                        ? 12
                        : 18;
              const lines = wrapLabel(op.label, maxLine);
              const longest = Math.max(...lines.map((l) => l.length), 1);
              let fontSize =
                n > 16 ? 3.8 : n > 12 ? 4.4 : n > 8 ? 5 : n > 5 ? 5.4 : 6;
              if (longest > 16) fontSize *= 0.85;
              if (longest > 20) fontSize *= 0.9;
              const lineH = fontSize * 1.15;
              const startDy = -((lines.length - 1) * lineH) / 2;

              return (
                <g key={op.id}>
                  <path
                    d={slicePath(cx, cy, r, a.start, a.sweep)}
                    fill={color}
                    stroke="#0b1220"
                    strokeWidth="1.2"
                  />
                  <text
                    x={mid.x}
                    y={mid.y}
                    fill="#fff"
                    fontSize={fontSize}
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${labelAngle}, ${mid.x}, ${mid.y})`}
                    style={{
                      paintOrder: "stroke",
                      stroke: "rgba(0,0,0,0.8)",
                      strokeWidth: 0.65,
                    }}
                  >
                    {lines.map((line, li) => (
                      <tspan
                        key={`${op.id}-l${li}`}
                        x={mid.x}
                        dy={li === 0 ? startDy : lineH}
                      >
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-mundial-gold bg-[#0b1220] text-[10px] font-bold uppercase tracking-wide text-mundial-gold">
          {busy ? "…" : "GO"}
        </div>
      </div>

      <button
        type="button"
        disabled={botonDisabled}
        onClick={() => iniciarGiro(false)}
        className={cn(
          "rounded-md bg-mundial-gold px-8 py-2.5 text-sm font-bold text-black transition",
          "hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        {busy ? "Girando…" : "Girar"}
      </button>
    </div>
  );
}
