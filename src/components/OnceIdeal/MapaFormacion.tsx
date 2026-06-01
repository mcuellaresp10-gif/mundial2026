"use client";

import Image from "next/image";
import Link from "next/link";
import type { OnceIdealPlayer } from "@/types";
import { cn } from "@/lib/utils";

interface MapaFormacionProps {
  players: OnceIdealPlayer[];
  interactive?: boolean;
  onPlayerClick?: (player: OnceIdealPlayer) => void;
}

export function MapaFormacion({ players, interactive, onPlayerClick }: MapaFormacionProps) {
  return (
    <div className="relative w-full aspect-[3/4] max-w-lg mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <rect x="2" y="2" width="96" height="96" rx="2" fill="#1a472a" stroke="#fff" strokeWidth="0.5" opacity="0.9" />
        <line x1="2" y1="50" x2="98" y2="50" stroke="#fff" strokeWidth="0.3" opacity="0.5" />
        <circle cx="50" cy="50" r="8" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.5" />
        <rect x="25" y="2" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.5" />
        <rect x="25" y="82" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.5" />

        {players.map((p) => (
          <g
            key={p.id}
            transform={`translate(${p.gridPosition.x}, ${p.gridPosition.y})`}
            className={cn(interactive && "cursor-pointer")}
            onClick={() => onPlayerClick?.(p)}
          >
            <circle r="4" fill="#003DA5" stroke="#FCD116" strokeWidth="0.4" />
            <text y="1" textAnchor="middle" fill="#fff" fontSize="2.5" fontWeight="bold">
              {p.rating.toFixed(1)}
            </text>
          </g>
        ))}
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {players.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-auto"
            style={{
              left: `${p.gridPosition.x}%`,
              top: `${p.gridPosition.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {interactive ? (
              <button
                onClick={() => onPlayerClick?.(p)}
                className="flex flex-col items-center gap-0.5 group"
              >
                <Image
                  src={p.photo}
                  alt={p.name}
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-mundial-gold group-hover:scale-110 transition-transform"
                />
                <span className="text-[10px] font-medium bg-black/70 text-white px-1 rounded truncate max-w-[60px]">
                  {p.name.split(" ").pop()}
                </span>
              </button>
            ) : (
              <Link href={`/jugadores/${p.id}`} className="flex flex-col items-center gap-0.5 group">
                <Image
                  src={p.photo}
                  alt={p.name}
                  width={36}
                  height={36}
                  className="rounded-full border-2 border-mundial-gold group-hover:scale-110 transition-transform"
                />
                <span className="text-[10px] font-medium bg-black/70 text-white px-1 rounded truncate max-w-[60px]">
                  {p.name.split(" ").pop()}
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
