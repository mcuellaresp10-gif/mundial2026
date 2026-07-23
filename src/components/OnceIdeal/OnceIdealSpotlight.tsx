"use client";

import Image from "next/image";
import Link from "next/link";
import type { OnceIdealPlayer } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ratingClass } from "@/utils/formatters";
import { translateTeamName } from "@/utils/teamNames";
import { groupPlayersByLine, positionLabel } from "@/utils/onceIdealUi";

interface OnceIdealSpotlightProps {
  player: OnceIdealPlayer | null;
  isMvp?: boolean;
  onClose?: () => void;
  variant?: "panel" | "sheet";
}

function RatingGauge({ rating }: { rating: number }) {
  const pct = Math.min(100, Math.max(0, (rating / 10) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Valoración</span>
        <span className={cn("font-mono font-bold", ratingClass(rating))}>
          {rating.toFixed(1)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            rating >= 8 && "bg-emerald-500",
            rating >= 6 && rating < 8 && "bg-yellow-500",
            rating > 0 && rating < 6 && "bg-red-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SpotlightContent({
  player,
  isMvp,
  onClose,
}: {
  player: OnceIdealPlayer;
  isMvp?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Image
            src={player.photo}
            alt={player.name}
            width={72}
            height={72}
            className="rounded-xl border-2 border-mundial-gold object-cover shadow-md"
            unoptimized
          />
          {isMvp && (
            <span className="absolute -left-1 -top-1 rounded bg-mundial-gold px-1.5 py-0.5 text-[9px] font-bold uppercase text-black">
              MVP
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-tight">{player.name}</p>
          <div className="mt-1 flex items-center gap-1.5">
            {player.teamLogo && (
              <Image
                src={player.teamLogo}
                alt=""
                width={16}
                height={16}
                className="rounded-sm object-contain"
                unoptimized
              />
            )}
            <span className="text-sm text-muted-foreground">
              {translateTeamName(player.team)}
            </span>
          </div>
          <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide">
            {positionLabel(player.position)}
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted lg:hidden"
            aria-label="Cerrar"
          >
            ✕
          </button>
        )}
      </div>

      <RatingGauge rating={player.rating} />

      <Button asChild className="w-full">
        <Link href={`/jugadores/${player.id}`}>Ver perfil completo</Link>
      </Button>
    </div>
  );
}

export function OnceIdealSpotlight({
  player,
  isMvp,
  onClose,
  variant = "panel",
}: OnceIdealSpotlightProps) {
  if (!player) {
    return (
      <div className="hidden rounded-xl border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground lg:flex lg:flex-col lg:items-center lg:justify-center lg:min-h-[320px]">
        <p className="font-medium">Selecciona un jugador</p>
        <p className="mt-1 text-xs">Toca una ficha en el campo o una carta abajo</p>
      </div>
    );
  }

  if (variant === "sheet") {
    return (
      <>
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
        <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t bg-card p-4 pb-6 shadow-2xl animate-in fade-in lg:hidden">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
          <SpotlightContent player={player} isMvp={isMvp} onClose={onClose} />
        </div>
      </>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <SpotlightContent player={player} isMvp={isMvp} />
    </div>
  );
}

export function OnceIdealLineList({
  players,
  selectedId,
  onSelect,
}: {
  players: OnceIdealPlayer[];
  selectedId?: number | null;
  onSelect?: (player: OnceIdealPlayer) => void;
}) {
  const groups = groupPlayersByLine(players);

  return (
    <div className="space-y-3">
      {groups.map((group) => (
        <div key={group.line}>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {group.title}
          </p>
          <ul className="space-y-1">
            {group.players.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => onSelect?.(p)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60",
                    selectedId === p.id && "bg-muted ring-1 ring-mundial-gold/40"
                  )}
                >
                  <Image
                    src={p.photo}
                    alt=""
                    width={24}
                    height={24}
                    className="rounded-full shrink-0"
                    unoptimized
                  />
                  <span className="min-w-0 flex-1 truncate">{p.name.split(" ").pop()}</span>
                  <span className={cn("font-mono text-xs font-bold", ratingClass(p.rating))}>
                    {p.rating.toFixed(1)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
