"use client";

import Link from "next/link";
import Image from "next/image";
import type { Lineup } from "@/types";
import { translateTeamName } from "@/utils/teamNames";
import { lineupPlayersToPitch } from "@/utils/lineupGrid";
import {
  getLineupPlayerMeta,
  lineupShortName,
  type LineupPlayerMeta,
} from "@/utils/lineupPlayerMeta";

interface LineupPitchProps {
  lineup: Lineup;
  metaMap: Map<number, LineupPlayerMeta>;
}

export function LineupPitch({ lineup, metaMap }: LineupPitchProps) {
  const positioned = lineupPlayersToPitch(lineup.startXI);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Image
          src={lineup.team.logo}
          alt=""
          width={24}
          height={24}
          className="rounded-sm"
          unoptimized
        />
        <div>
          <p className="font-semibold text-sm">{translateTeamName(lineup.team.name)}</p>
          <p className="text-xs text-muted-foreground">
            {lineup.formation} · DT: {lineup.coach.name}
          </p>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-md aspect-[3/4]">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
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

        <div className="absolute inset-0">
          {positioned.map(({ player, point }) => {
            const meta = getLineupPlayerMeta(metaMap, player.player.id);
            return (
              <Link
                key={player.player.id}
                href={`/jugadores/${player.player.id}`}
                className="absolute flex w-[72px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 group"
                style={{ left: `${point.x}%`, top: `${point.y}%` }}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-mundial-gold bg-mundial-blue text-[10px] font-bold text-white shadow-md group-hover:scale-110 transition-transform">
                  {player.player.number}
                </span>
                <span className="max-w-[72px] truncate text-center text-[10px] font-semibold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {lineupShortName(player.player.name)}
                </span>
                {meta.clubName && (
                  <span className="max-w-[72px] truncate text-center text-[8px] leading-tight text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {meta.clubName}
                  </span>
                )}
                {meta.age != null && (
                  <span className="text-[8px] text-mundial-gold font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {meta.age} años
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {lineup.substitutes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Suplentes</p>
          <div className="flex flex-wrap gap-1.5">
            {lineup.substitutes.map((p) => {
              const meta = getLineupPlayerMeta(metaMap, p.player.id);
              return (
                <Link
                  key={p.player.id}
                  href={`/jugadores/${p.player.id}`}
                  className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-1 text-[10px] hover:bg-muted"
                >
                  <span className="font-mono text-muted-foreground">{p.player.number}</span>
                  <span className="font-medium">{lineupShortName(p.player.name)}</span>
                  {meta.clubName && (
                    <span className="text-muted-foreground truncate max-w-[80px]">· {meta.clubName}</span>
                  )}
                  {meta.age != null && (
                    <span className="text-muted-foreground">· {meta.age}a</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
