"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { POSICION_LABELS, calcularMedia } from "@/data/carrera/atributos";
import type { Atributos, Jugador, PiernaHabil, Posicion } from "@/data/carrera/types";
import { cn } from "@/lib/utils";

/** Códigos cortos tipo Winning Eleven. */
export const POSICION_CODE: Record<Posicion, string> = {
  arquero: "GK",
  defensa_central: "CB",
  lateral: "SB",
  mediocampista: "MF",
  extremo: "WF",
  delantero: "CF",
};

const POSICION_PILL: Record<Posicion, string> = {
  arquero: "bg-[#c9a227] text-black",
  defensa_central: "bg-[#2f6fed] text-white",
  lateral: "bg-[#2f6fed] text-white",
  mediocampista: "bg-[#2a9e5c] text-white",
  extremo: "bg-[#d94a3d] text-white",
  delantero: "bg-[#d94a3d] text-white",
};

/** Caras leyenda WE por posición (solo retrato, sin nombre). */
export const CARA_POR_POSICION: Partial<Record<Posicion, string>> = {
  delantero: "/juegos/carrera/caras/castolo.png",
  mediocampista: "/juegos/carrera/caras/minanda.png",
  extremo: "/juegos/carrera/caras/espimas.png",
  lateral: "/juegos/carrera/caras/ximelez.png",
  arquero: "/juegos/carrera/caras/ivarov.png",
  defensa_central: "/juegos/carrera/caras/valeny.png",
};

export function caraParaPosicion(posicion: Posicion): string | null {
  return CARA_POR_POSICION[posicion] ?? null;
}

const ATTR_ORDER_FIELD: { key: keyof Atributos; label: string }[] = [
  { key: "ritmo", label: "Ritmo" },
  { key: "tiro", label: "Tiro" },
  { key: "pase", label: "Pase" },
  { key: "regate", label: "Regate" },
  { key: "defensa", label: "Defensa" },
  { key: "fisico", label: "Físico" },
];

const ATTR_ORDER_GK: { key: keyof Atributos; label: string }[] = [
  { key: "atajadas", label: "Atajadas" },
  { key: "reflejos", label: "Reflejos" },
  { key: "pase", label: "Pase" },
  { key: "fisico", label: "Físico" },
  { key: "ritmo", label: "Ritmo" },
  { key: "defensa", label: "Defensa" },
];

function piernaLabel(p: PiernaHabil): string {
  if (p === "izquierda") return "Izq.";
  if (p === "derecha") return "Der.";
  return "Amb.";
}

/** Colores icónicos WE9 por valor 1–99. */
export function we9StatTone(value: number): {
  text: string;
  bar: string;
} {
  if (value >= 90) return { text: "text-[#ff5a1f]", bar: "bg-[#ff5a1f]" };
  if (value >= 80) return { text: "text-[#ffd400]", bar: "bg-[#ffd400]" };
  if (value >= 70) return { text: "text-[#f2f2f2]", bar: "bg-[#d8d8d8]" };
  return { text: "text-[#9aa0a6]", bar: "bg-[#6b727a]" };
}

function SegmentedBar({ value, barClass }: { value: number; barClass: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div
      className="relative h-2.5 w-full overflow-hidden rounded-[1px] border border-black/60 bg-[#1a1d21]"
      aria-hidden
    >
      <div
        className={cn("absolute inset-y-0 left-0", barClass)}
        style={{ width: `${pct}%` }}
      />
      {/* Segmentos estilo WE */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 3px, rgba(0,0,0,0.55) 3px 4px)",
        }}
      />
    </div>
  );
}

function DeltaChip({ delta }: { delta?: number }) {
  if (delta == null || delta === 0) return null;
  if (delta > 0) {
    return (
      <span className="inline-flex items-center text-[9px] font-bold text-[#5dff8a]">
        <ArrowUp className="h-2.5 w-2.5" strokeWidth={3} />
        {delta}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[9px] font-bold text-[#ff6b6b]">
      <ArrowDown className="h-2.5 w-2.5" strokeWidth={3} />
      {Math.abs(delta)}
    </span>
  );
}

export interface CarreraFichaWE9Props {
  jugador: Pick<
    Jugador,
    | "apellido"
    | "edad"
    | "posicion"
    | "piernaHabil"
    | "nacionalidad"
    | "atributos"
    | "reputacion"
    | "moral"
    | "esProfesional"
  >;
  clubNombre?: string;
  ligaNombre?: string;
  /** Deltas del periodo (resultado). */
  deltas?: Partial<Record<keyof Atributos, number>>;
  /** Padding más corto en el header. */
  compact?: boolean;
  /** Etiqueta pequeña en la barra del club (ej. Prime). */
  badge?: string;
  /** Estatus en el plantel (0–100) con etiqueta: Reserva, Titular… */
  estatusClub?: { label: string; value: number };
  className?: string;
}

export function CarreraFichaWE9({
  jugador,
  clubNombre,
  ligaNombre,
  deltas,
  compact = false,
  badge,
  estatusClub,
  className,
}: CarreraFichaWE9Props) {
  const media = calcularMedia(jugador.atributos, jugador.posicion);
  const mediaTone = we9StatTone(media);
  const caraSrc = caraParaPosicion(jugador.posicion);
  const rows =
    jugador.posicion === "arquero" ? ATTR_ORDER_GK : ATTR_ORDER_FIELD;
  const visible = rows.filter((r) => typeof jugador.atributos[r.key] === "number");

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-[#0d0f12] shadow-[0_8px_24px_rgba(0,0,0,0.45)]",
        "bg-[#2c3138] text-[#f0f2f4]",
        "font-sans antialiased",
        className
      )}
      style={{
        backgroundImage:
          "linear-gradient(180deg, #3a4048 0%, #2c3138 28%, #23272d 100%)",
      }}
    >
      {/* Club bar */}
      <div className="flex items-center justify-between gap-2 border-b border-black/40 bg-[#9aa3ad] px-3 py-1.5 text-[#1a1d21]">
        <p className="truncate text-[11px] font-bold uppercase tracking-wide">
          {clubNombre ?? "Club"}
          {ligaNombre ? (
            <span className="ml-1.5 font-semibold opacity-70">· {ligaNombre}</span>
          ) : null}
        </p>
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest opacity-80">
          {badge ?? (jugador.esProfesional ? "1ª" : "Cantera")}
        </span>
      </div>

      {/* Header jugador */}
      <div
        className={cn(
          "flex items-start justify-between gap-3 border-b border-black/35 px-3",
          compact ? "py-2.5" : "py-3"
        )}
      >
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex h-5 min-w-[2rem] items-center justify-center rounded-[2px] px-1.5 text-[10px] font-black tracking-wide",
                POSICION_PILL[jugador.posicion]
              )}
            >
              {POSICION_CODE[jugador.posicion]}
            </span>
            <p className="truncate text-base font-bold leading-none tracking-tight sm:text-lg">
              {jugador.apellido}
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-wide text-white/55">
            {POSICION_LABELS[jugador.posicion]}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-white/80">
            <span>
              Edad <strong className="text-white">{jugador.edad}</strong>
            </span>
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-3.5 rounded-[1px] border border-black/40"
                style={{
                  background:
                    "linear-gradient(180deg, #ffcd00 0 33%, #003893 33% 66%, #ce1126 66% 100%)",
                }}
                title={jugador.nacionalidad}
              />
              <strong className="text-white">{jugador.nacionalidad}</strong>
            </span>
            <span>
              Pie <strong className="text-white">{piernaLabel(jugador.piernaHabil)}</strong>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {caraSrc ? (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-black/60 bg-[#0b0d10] sm:h-16 sm:w-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={caraSrc}
                alt=""
                width={64}
                height={64}
                className="h-[96%] w-[96%] object-contain"
                draggable={false}
              />
            </div>
          ) : null}
          <div className="rounded-[2px] border border-black/50 bg-[#1a1d21]/90 px-2.5 py-1.5 text-center">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-white/50">
              OVR
            </p>
            <p
              className={cn(
                "text-3xl font-black tabular-nums leading-none",
                mediaTone.text
              )}
              style={{ textShadow: "0 1px 0 #000" }}
            >
              {media}
            </p>
          </div>
        </div>
      </div>

      {/* Panel de atributos */}
      <div className="border-b border-black/30 bg-[#1e2227]/px-2 py-1.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
            Atributos
          </p>
          <p className="text-[10px] font-semibold text-white/40">1 / 1</p>
        </div>
      </div>

      <ul className="divide-y divide-black/25">
        {visible.map((row, i) => {
          const value = jugador.atributos[row.key] as number;
          const tone = we9StatTone(value);
          const delta = deltas?.[row.key];
          return (
            <li
              key={row.key}
              className={cn(
                "grid grid-cols-[minmax(4.5rem,28%)_1fr_auto] items-center gap-2 px-3 py-1.5 sm:gap-3",
                i % 2 === 0 ? "bg-[#343a42]" : "bg-[#2a2f36]"
              )}
            >
              <span className="truncate text-[12px] font-semibold text-white/90">
                {row.label}
              </span>
              <SegmentedBar value={value} barClass={tone.bar} />
              <span className="inline-flex min-w-[2.75rem] items-center justify-end gap-0.5">
                <span
                  className={cn(
                    "text-sm font-black tabular-nums leading-none sm:text-[15px]",
                    tone.text
                  )}
                  style={{ textShadow: "0 1px 0 rgba(0,0,0,0.85)" }}
                >
                  {value}
                </span>
                <DeltaChip delta={delta} />
              </span>
            </li>
          );
        })}
      </ul>

      {/* Moral / reputación — fila secundaria tipo “condition” */}
      <div className="grid grid-cols-2 gap-px border-t border-black/40 bg-black/30">
        <CondRow label="Moral" value={jugador.moral} />
        <CondRow label="Reputación" value={jugador.reputacion} />
      </div>
      {estatusClub ? (
        <EstatusClubRow label={estatusClub.label} value={estatusClub.value} />
      ) : null}
    </div>
  );
}

function CondRow({ label, value }: { label: string; value: number }) {
  // moral/rep -100..100 → 0..100 para barra
  const pct = Math.min(100, Math.max(0, ((value + 100) / 200) * 100));
  const tone =
    value >= 40
      ? "text-[#ffd400]"
      : value >= 0
        ? "text-[#f2f2f2]"
        : "text-[#9aa0a6]";
  return (
    <div className="bg-[#2a2f36] px-3 py-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
          {label}
        </span>
        <span
          className={cn("text-xs font-black tabular-nums", tone)}
          style={{ textShadow: "0 1px 0 #000" }}
        >
          {value}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-[1px] border border-black/50 bg-[#1a1d21]">
        <div
          className="h-full bg-[#2f6fed]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function EstatusClubRow({ label, value }: { label: string; value: number }) {
  const pct = Math.min(100, Math.max(0, value));
  const tone = we9StatTone(Math.round(pct * 0.99) || 1);
  return (
    <div className="border-t border-black/40 bg-[#2a2f36] px-3 py-2">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-white/50">
          En el club
        </span>
        <span
          className={cn("text-xs font-black uppercase tracking-wide", tone.text)}
          style={{ textShadow: "0 1px 0 #000" }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-[1px] border border-black/50 bg-[#1a1d21]">
          <div className={cn("h-full", tone.bar)} style={{ width: `${pct}%` }} />
        </div>
        <span
          className={cn("min-w-[1.75rem] text-right text-[11px] font-black tabular-nums", tone.text)}
          style={{ textShadow: "0 1px 0 #000" }}
        >
          {Math.round(value)}
        </span>
      </div>
    </div>
  );
}
