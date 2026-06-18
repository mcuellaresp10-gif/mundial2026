"use client";

import Image from "next/image";
import type { OnceIdealPlayer } from "@/types";
import { cn } from "@/lib/utils";
import { lineupShortName } from "@/utils/lineupPlayerMeta";
import { translateTeamName } from "@/utils/teamNames";
import { ratingClass } from "@/utils/formatters";
import { positionLabel } from "@/utils/onceIdealUi";

interface OnceIdealPlayerCardsProps {
  players: OnceIdealPlayer[];
  mvpId?: number | null;
  selectedId?: number | null;
  onSelect?: (player: OnceIdealPlayer) => void;
}

export function OnceIdealPlayerCards({
  players,
  mvpId,
  selectedId,
  onSelect,
}: OnceIdealPlayerCardsProps) {
  const sorted = [...players].sort((a, b) => b.rating - a.rating);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-semibold">Cartas del once</p>
        <p className="text-xs text-muted-foreground">Ordenadas por valoración</p>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {sorted.map((p) => {
          const isMvp = mvpId === p.id;
          const selected = selectedId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect?.(p)}
              className={cn(
                "snap-start shrink-0 w-[120px] rounded-xl border bg-gradient-to-b from-card to-muted/30 p-3 text-left shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mundial-gold",
                selected && "ring-2 ring-mundial-gold border-mundial-gold/50",
                isMvp && "border-mundial-gold/60"
              )}
            >
              <div className="relative mx-auto mb-2 w-fit">
                <Image
                  src={p.photo}
                  alt={p.name}
                  width={52}
                  height={52}
                  className="rounded-full border-2 border-mundial-gold/80 object-cover"
                  unoptimized
                />
                {isMvp && (
                  <span className="absolute -right-1 -top-1 rounded bg-mundial-gold px-1 text-[8px] font-bold text-black">
                    MVP
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-center font-mono text-2xl font-bold leading-none",
                  ratingClass(p.rating)
                )}
              >
                {p.rating.toFixed(1)}
              </p>
              <p className="mt-1 truncate text-center text-xs font-semibold">
                {lineupShortName(p.name)}
              </p>
              <div className="mt-1 flex items-center justify-center gap-1">
                {p.teamLogo && (
                  <Image
                    src={p.teamLogo}
                    alt=""
                    width={12}
                    height={12}
                    className="object-contain"
                    unoptimized
                  />
                )}
                <span className="truncate text-[10px] text-muted-foreground">
                  {translateTeamName(p.team)}
                </span>
              </div>
              <p className="mt-1 text-center text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
                {positionLabel(p.position)}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
