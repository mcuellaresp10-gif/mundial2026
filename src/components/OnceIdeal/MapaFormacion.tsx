"use client";

import Image from "next/image";
import Link from "next/link";
import type { OnceIdealPlayer } from "@/types";
import { cn } from "@/lib/utils";
import { lineupShortName } from "@/utils/lineupPlayerMeta";
import { translateTeamName } from "@/utils/teamNames";

interface MapaFormacionProps {
  players: OnceIdealPlayer[];
  interactive?: boolean;
  onPlayerClick?: (player: OnceIdealPlayer) => void;
}

function PlayerMarker({
  player,
  interactive,
  onPlayerClick,
}: {
  player: OnceIdealPlayer;
  interactive?: boolean;
  onPlayerClick?: (player: OnceIdealPlayer) => void;
}) {
  const content = (
    <>
      <div className="relative shrink-0">
        <Image
          src={player.photo}
          alt={player.name}
          width={40}
          height={40}
          className="rounded-full border-2 border-mundial-gold bg-mundial-blue object-cover shadow-md group-hover:scale-105 transition-transform"
          unoptimized
        />
        {player.rating > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-mundial-gold bg-mundial-blue px-0.5 text-[9px] font-bold leading-none text-white shadow">
            {player.rating.toFixed(1)}
          </span>
        )}
      </div>
      <span className="max-w-[76px] truncate text-center text-[10px] font-semibold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
        {lineupShortName(player.name)}
      </span>
      <span className="max-w-[76px] truncate text-center text-[8px] leading-tight text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
        {translateTeamName(player.team)}
      </span>
    </>
  );

  const className =
    "group flex w-[76px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5";

  if (interactive) {
    return (
      <button
        type="button"
        onClick={() => onPlayerClick?.(player)}
        className={cn(className, "cursor-pointer")}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={`/jugadores/${player.id}`} className={className}>
      {content}
    </Link>
  );
}

export function MapaFormacion({ players, interactive, onPlayerClick }: MapaFormacionProps) {
  return (
    <div className="relative mx-auto w-full max-w-md px-1 py-2">
      <div className="relative aspect-[3/4] w-full">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <rect
            x="2"
            y="2"
            width="96"
            height="96"
            rx="2"
            fill="#1a472a"
            stroke="#fff"
            strokeWidth="0.5"
            opacity="0.95"
          />
          <line x1="2" y1="50" x2="98" y2="50" stroke="#fff" strokeWidth="0.3" opacity="0.45" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.45" />
          <rect x="25" y="2" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.45" />
          <rect x="25" y="82" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.45" />
        </svg>

        <div className="absolute inset-0 overflow-visible">
          {players.map((p) => (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.gridPosition.x}%`,
                top: `${p.gridPosition.y}%`,
              }}
            >
              <PlayerMarker
                player={p}
                interactive={interactive}
                onPlayerClick={onPlayerClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
