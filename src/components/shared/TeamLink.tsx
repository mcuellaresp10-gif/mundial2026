"use client";

import Link from "next/link";
import Image from "next/image";
import { getTeamColors } from "@/utils/colors";
import { translateTeamName } from "@/utils/teamNames";
import { cn } from "@/lib/utils";

type TeamLinkAlign = "start" | "center" | "end";
type TeamLinkSize = "sm" | "md" | "lg";
type TeamLinkVariant = "stack" | "inline" | "name";

interface TeamLinkProps {
  id: number;
  name: string;
  logo?: string;
  variant?: TeamLinkVariant;
  align?: TeamLinkAlign;
  size?: TeamLinkSize;
  className?: string;
}

const logoSizes: Record<TeamLinkSize, string> = {
  sm: "w-8 h-8",
  md: "w-14 @md/match:w-16",
  lg: "w-16 h-16",
};

const logoPixelSizes: Record<TeamLinkSize, number> = {
  sm: 32,
  md: 64,
  lg: 64,
};

const nameSizes: Record<TeamLinkSize, string> = {
  sm: "text-sm",
  md: "text-sm @md/match:text-base",
  lg: "text-base",
};

export function TeamLink({
  id,
  name,
  logo,
  variant = "stack",
  align = "center",
  size = "md",
  className,
}: TeamLinkProps) {
  const colors = getTeamColors(name);
  const displayName = translateTeamName(name);
  const href = `/equipos/${id}`;
  const ariaEntity = "equipo";

  if (variant === "name") {
    return (
      <Link
        href={href}
        aria-label={`Ver ${ariaEntity} ${displayName}`}
        className={cn(
          "font-medium hover:underline underline-offset-2 rounded-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className
        )}
        style={{ color: colors.primary }}
      >
        {displayName}
      </Link>
    );
  }

  if (variant === "inline") {
    return (
      <Link
        href={href}
        aria-label={`Ver ${ariaEntity} ${displayName}`}
        className={cn(
          "group flex min-w-0 items-center gap-2 rounded-xl p-1 -m-1",
          "transition-colors hover:bg-muted/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          align === "end" && "justify-end",
          className
        )}
      >
        {align === "end" ? (
          <>
            <span
              className={cn("font-semibold truncate", nameSizes[size])}
              style={{ color: colors.primary }}
            >
              {displayName}
            </span>
            {logo && (
              <LogoImage logo={logo} name={displayName} size={size} className="shrink-0" />
            )}
          </>
        ) : (
          <>
            {logo && (
              <LogoImage logo={logo} name={displayName} size={size} className="shrink-0" />
            )}
            <span
              className={cn("font-semibold truncate", nameSizes[size])}
              style={{ color: colors.primary }}
            >
              {displayName}
            </span>
          </>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-label={`Ver ${ariaEntity} ${displayName}`}
      className={cn(
        "group flex min-w-0 flex-col gap-2 rounded-xl p-2 -m-2",
        "transition-colors hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        align === "end" && "items-center @md/match:items-end",
        align === "start" && "items-center @md/match:items-start",
        align === "center" && "items-center",
        className
      )}
    >
      {logo && (
        <div
          className={cn(
            "relative aspect-square shrink-0 overflow-hidden rounded-full bg-muted/50 ring-2 ring-border",
            "transition-transform group-hover:scale-105",
            logoSizes[size]
          )}
        >
          <Image
            src={logo}
            alt={displayName}
            fill
            className="object-contain p-1.5"
            sizes={`${logoPixelSizes[size]}px`}
          />
        </div>
      )}
      <span
        className={cn(
          "font-bold text-center leading-tight line-clamp-2",
          nameSizes[size],
          align === "end" && "@md/match:text-right",
          align === "start" && "@md/match:text-left"
        )}
        style={{ color: colors.primary }}
      >
        {displayName}
      </span>
    </Link>
  );
}

function LogoImage({
  logo,
  name,
  size,
  className,
}: {
  logo: string;
  name: string;
  size: TeamLinkSize;
  className?: string;
}) {
  const px = logoPixelSizes[size];
  return (
    <Image
      src={logo}
      alt={name}
      width={px}
      height={px}
      className={cn("transition-transform group-hover:scale-105", className)}
    />
  );
}

interface MatchTeamPairProps {
  home: { id: number; name: string; logo?: string };
  away: { id: number; name: string; logo?: string };
  className?: string;
}

export function MatchTeamPair({ home, away, className }: MatchTeamPairProps) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 min-w-0", className)}>
      <TeamLink id={home.id} name={home.name} logo={home.logo} variant="name" />
      <span className="text-muted-foreground shrink-0">vs</span>
      <TeamLink id={away.id} name={away.name} logo={away.logo} variant="name" />
    </span>
  );
}

interface H2HRowProps {
  home: { id: number; name: string };
  away: { id: number; name: string };
  score: string;
  className?: string;
}

export function H2HRow({ home, away, score, className }: H2HRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 text-sm p-2 rounded bg-muted/50 min-w-0",
        className
      )}
    >
      <TeamLink id={home.id} name={home.name} variant="name" className="truncate min-w-0" />
      <span className="font-mono font-bold shrink-0 tabular-nums">{score}</span>
      <TeamLink id={away.id} name={away.name} variant="name" className="truncate min-w-0 text-right" />
    </div>
  );
}
