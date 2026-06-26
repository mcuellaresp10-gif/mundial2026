"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ROUND_OF_32, type BracketSlotRef } from "@/data/worldCup2026Bracket";
import { translateTeamName } from "@/utils/teamNames";
import {
  CLINCHED_PROB_THRESHOLD,
  isSlotClinched,
  type KnockoutSlotCandidate,
  type KnockoutSlotKey,
} from "@/utils/knockoutSlotProbabilities";
import type { BracketSlotTeam } from "@/utils/knockoutBracket";
import { cn } from "@/lib/utils";

function slotSourceLabel(ref: BracketSlotRef): string {
  if (ref.type === "winner") return `Campeón Grupo ${ref.group}`;
  if (ref.type === "runnerUp") return `Subcampeón Grupo ${ref.group}`;
  return `3º · Grupos ${ref.eligibleGroups.join(", ")}`;
}

function getSlotRef(matchId: number, side: "home" | "away"): BracketSlotRef | null {
  const def = ROUND_OF_32.find((m) => m.matchId === matchId);
  return def ? def[side] : null;
}

function ProbabilityBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-14 shrink-0 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

function CandidateRow({ candidate }: { candidate: KnockoutSlotCandidate }) {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      <div className="relative w-4 h-4 shrink-0">
        <Image
          src={candidate.logo}
          alt=""
          fill
          className="object-contain"
          sizes="16px"
        />
      </div>
      <Link
        href={`/selecciones/${candidate.teamId}`}
        className="flex-1 min-w-0 truncate text-[11px] hover:text-mundial-gold transition-colors"
      >
        {translateTeamName(candidate.name)}
      </Link>
      <ProbabilityBar value={candidate.probability} />
      <span className="text-[10px] tabular-nums text-muted-foreground w-7 text-right shrink-0">
        {candidate.probability}%
      </span>
    </div>
  );
}

export function BracketSlotProbabilities({
  matchId,
  side,
  slot,
  candidates,
}: {
  matchId: number;
  side: "home" | "away";
  slot: BracketSlotTeam;
  candidates: KnockoutSlotCandidate[];
}) {
  const ref = getSlotRef(matchId, side);
  const sourceLabel = ref ? slotSourceLabel(ref) : slot.label;
  const clinched =
    isSlotClinched(candidates) ||
    Boolean(slot.team && !slot.provisional && candidates[0]?.probability === 100);

  return (
    <div className="px-2 py-1.5 border-b border-border/50 last:border-0">
      <p className="text-[9px] text-muted-foreground mb-1 leading-tight">{sourceLabel}</p>

      {clinched && candidates[0] ? (
        <div className="flex items-center gap-1.5">
          <div className="relative w-5 h-5 shrink-0">
            <Image
              src={candidates[0].logo}
              alt=""
              fill
              className="object-contain"
              sizes="20px"
            />
          </div>
          <Link
            href={`/selecciones/${candidates[0].teamId}`}
            className="flex-1 min-w-0 truncate text-[11px] font-semibold hover:text-mundial-gold transition-colors"
          >
            {translateTeamName(candidates[0].name)}
          </Link>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide",
              "text-emerald-600 dark:text-emerald-400"
            )}
          >
            <CheckCircle2 className="w-3 h-3" aria-hidden />
            Confirmado
          </span>
        </div>
      ) : candidates.length > 0 ? (
        <div className="space-y-0.5">
          {candidates.map((c) => (
            <CandidateRow key={c.teamId} candidate={c} />
          ))}
        </div>
      ) : slot.team ? (
        <div className="flex items-center gap-1.5 opacity-80">
          <div className="relative w-4 h-4 shrink-0">
            <Image src={slot.team.logo} alt="" fill className="object-contain" sizes="16px" />
          </div>
          <span className="text-[11px] truncate">{translateTeamName(slot.team.name)}</span>
        </div>
      ) : (
        <p className="text-[10px] text-muted-foreground italic">Por definir</p>
      )}
    </div>
  );
}

export function getCandidatesForSlot(
  slotProbabilities: Map<KnockoutSlotKey, KnockoutSlotCandidate[]>,
  matchId: number,
  side: "home" | "away"
): KnockoutSlotCandidate[] {
  return slotProbabilities.get(`${matchId}:${side}`) ?? [];
}

export { CLINCHED_PROB_THRESHOLD };
