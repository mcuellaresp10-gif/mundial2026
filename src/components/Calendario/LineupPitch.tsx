"use client";

import Link from "next/link";
import Image from "next/image";
import type { Lineup } from "@/types";
import { translateTeamName } from "@/utils/teamNames";
import {
  lineupPlayersToPitch,
  shouldFlipLineupLabel,
  type PitchPoint,
} from "@/utils/lineupGrid";
import {
  getLineupPlayerMeta,
  lineupShortName,
  type LineupPlayerMeta,
} from "@/utils/lineupPlayerMeta";
import { cn } from "@/lib/utils";

interface LineupPitchProps {
  lineup: Lineup;
  metaMap: Map<number, LineupPlayerMeta>;
}

function PitchPlayer({
  playerId,
  number,
  name,
  meta,
  point,
}: {
  playerId: number;
  number: number | null;
  name: string;
  meta: LineupPlayerMeta;
  point: PitchPoint;
}) {
  const labelAbove = shouldFlipLineupLabel(point.y);

  return (
    <div
      className="absolute z-10"
      style={{ left: `${point.x}%`, top: `${point.y}%`, width: 0, height: 0 }}
    >
      <Link
        href={`/jugadores/${playerId}`}
        className={cn(
          "absolute flex w-[52px] flex-col items-center gap-0.5 group sm:w-[58px] md:w-[64px]",
          "-translate-x-1/2",
          labelAbove ? "bottom-0 flex-col-reverse" : "top-0"
        )}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-mundial-gold bg-mundial-blue text-[9px] font-bold text-white shadow-md transition-transform group-hover:scale-110 sm:h-6 sm:w-6 sm:text-[10px]">
          {number}
        </span>
        <span className="max-w-[52px] truncate text-center text-[9px] font-semibold leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:max-w-[58px] sm:text-[10px] md:max-w-[64px]">
          {name}
        </span>
        {meta.clubName && (
          <span className="hidden max-w-[52px] truncate text-center text-[8px] leading-tight text-white/85 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:block sm:max-w-[58px] md:max-w-[64px]">
            {meta.clubName}
          </span>
        )}
        {meta.age != null && (
          <span className="hidden text-[8px] font-medium text-mundial-gold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:block">
            {meta.age} años
          </span>
        )}
      </Link>
    </div>
  );
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

      <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl shadow-inner sm:max-w-lg">
        <div className="relative aspect-[3/4] w-full min-h-[280px] sm:min-h-[320px]">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <radialGradient id={`pitchGrass-${lineup.team.id}`} cx="50%" cy="45%" r="70%">
                <stop offset="0%" stopColor="#1f5c34" />
                <stop offset="100%" stopColor="#0f3320" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={`url(#pitchGrass-${lineup.team.id})`} />
            <rect
              x="2"
              y="2"
              width="96"
              height="96"
              rx="2"
              fill="none"
              stroke="#fff"
              strokeWidth="0.45"
              opacity="0.7"
            />
            <line x1="2" y1="50" x2="98" y2="50" stroke="#fff" strokeWidth="0.35" opacity="0.45" />
            <circle cx="50" cy="50" r="8" fill="none" stroke="#fff" strokeWidth="0.35" opacity="0.45" />
            <rect x="25" y="2" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.35" opacity="0.45" />
            <rect x="36" y="2" width="28" height="6" fill="none" stroke="#fff" strokeWidth="0.25" opacity="0.35" />
            <rect x="25" y="82" width="50" height="16" fill="none" stroke="#fff" strokeWidth="0.35" opacity="0.45" />
            <rect x="36" y="90" width="28" height="6" fill="none" stroke="#fff" strokeWidth="0.25" opacity="0.35" />
            <circle cx="50" cy="12" r="0.6" fill="#fff" opacity="0.45" />
            <circle cx="50" cy="88" r="0.6" fill="#fff" opacity="0.45" />
          </svg>

          <div className="absolute inset-0">
            {positioned.map(({ player, point }) => {
              const meta = getLineupPlayerMeta(metaMap, player.player.id);
              return (
                <PitchPlayer
                  key={player.player.id}
                  playerId={player.player.id}
                  number={player.player.number}
                  name={lineupShortName(player.player.name)}
                  meta={meta}
                  point={point}
                />
              );
            })}
          </div>
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
