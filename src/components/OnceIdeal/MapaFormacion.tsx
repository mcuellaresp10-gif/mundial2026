"use client";

import Image from "next/image";
import type { OnceIdealPlayer } from "@/types";
import { cn } from "@/lib/utils";
import { lineupShortName } from "@/utils/lineupPlayerMeta";
import { translateTeamName } from "@/utils/teamNames";
import { ratingClass } from "@/utils/formatters";
import { positionLabel, toSafePitchCoord } from "@/utils/onceIdealUi";

interface MapaFormacionProps {
  players: OnceIdealPlayer[];
  selectedId?: number | null;
  onSelect?: (player: OnceIdealPlayer) => void;
  mvpId?: number | null;
}

function PlayerChip({
  player,
  selected,
  isMvp,
  index,
  onSelect,
}: {
  player: OnceIdealPlayer;
  selected: boolean;
  isMvp: boolean;
  index: number;
  onSelect?: (player: OnceIdealPlayer) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(player)}
      className={cn(
        "group pitch-reveal flex w-[82px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 rounded-xl border px-1.5 py-1.5 text-left transition-all",
        "bg-black/55 backdrop-blur-sm shadow-lg hover:scale-105 hover:z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mundial-gold",
        selected
          ? "border-mundial-gold ring-2 ring-mundial-gold/40 z-20 scale-105"
          : "border-white/15 hover:border-white/30",
        isMvp && !selected && "border-mundial-gold/50"
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="relative">
        <div
          className={cn(
            "rounded-full p-0.5 ring-2",
            player.rating >= 8 && "ring-emerald-400",
            player.rating >= 6 && player.rating < 8 && "ring-yellow-400",
            player.rating > 0 && player.rating < 6 && "ring-red-400",
            player.rating === 0 && "ring-white/20"
          )}
        >
          <Image
            src={player.photo}
            alt={player.name}
            width={36}
            height={36}
            className="rounded-full bg-mundial-blue object-cover"
            unoptimized
          />
        </div>
        {player.rating > 0 && (
          <span
            className={cn(
              "absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/80 px-0.5 text-[9px] font-bold leading-none text-white shadow",
              ratingClass(player.rating)
            )}
          >
            {player.rating.toFixed(1)}
          </span>
        )}
        {isMvp && (
          <span className="absolute -left-1 -top-1 rounded bg-mundial-gold px-1 text-[7px] font-bold uppercase text-black shadow">
            MVP
          </span>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-0.5">
        <span className="max-w-full truncate text-center text-[10px] font-semibold leading-tight text-white">
          {lineupShortName(player.name)}
        </span>
        <div className="flex items-center gap-1">
          {player.teamLogo && (
            <Image
              src={player.teamLogo}
              alt=""
              width={12}
              height={12}
              className="rounded-sm object-contain"
              unoptimized
            />
          )}
          <span className="max-w-[68px] truncate text-[8px] text-white/85">
            {translateTeamName(player.team)}
          </span>
        </div>
        <span className="rounded bg-white/10 px-1 text-[7px] font-medium uppercase tracking-wide text-white/80">
          {positionLabel(player.position)}
        </span>
      </div>
    </button>
  );
}

export function MapaFormacion({
  players,
  selectedId,
  onSelect,
  mvpId,
}: MapaFormacionProps) {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl shadow-inner">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="pitchGrass" cx="50%" cy="45%" r="70%">
              <stop offset="0%" stopColor="#1f5c34" />
              <stop offset="100%" stopColor="#0f3320" />
            </radialGradient>
            <radialGradient id="pitchVignette" cx="50%" cy="50%" r="65%">
              <stop offset="55%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#pitchGrass)" />
          <rect x="2" y="2" width="96" height="96" rx="2" fill="none" stroke="#fff" strokeWidth="0.45" opacity="0.7" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="#fff" strokeWidth="0.35" opacity="0.45" />
          <circle cx="50" cy="50" r="8" fill="none" stroke="#fff" strokeWidth="0.35" opacity="0.45" />
          <circle cx="50" cy="50" r="0.8" fill="#fff" opacity="0.5" />
          <rect x="25" y="2" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.35" opacity="0.45" />
          <rect x="36" y="2" width="28" height="6" fill="none" stroke="#fff" strokeWidth="0.25" opacity="0.35" />
          <rect x="25" y="82" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.35" opacity="0.45" />
          <rect x="36" y="90" width="28" height="6" fill="none" stroke="#fff" strokeWidth="0.25" opacity="0.35" />
          <circle cx="50" cy="12" r="0.6" fill="#fff" opacity="0.45" />
          <circle cx="50" cy="88" r="0.6" fill="#fff" opacity="0.45" />
          <rect x="0" y="0" width="100" height="100" fill="url(#pitchVignette)" pointerEvents="none" />
        </svg>

        <div className="absolute inset-0">
          {players.map((p, index) => {
            const coord = toSafePitchCoord(p.gridPosition.x, p.gridPosition.y);
            return (
              <div
                key={p.id}
                className="absolute"
                style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
              >
                <PlayerChip
                  player={p}
                  selected={selectedId === p.id}
                  isMvp={mvpId === p.id}
                  index={index}
                  onSelect={onSelect}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
