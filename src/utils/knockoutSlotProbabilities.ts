import type { StandingsGroup, StandingTeam } from "@/types";
import {
  GROUP_LETTERS,
  ROUND_OF_32,
  type BracketSlotRef,
  type GroupLetter,
} from "@/data/worldCup2026Bracket";
import { BEST_THIRD_QUALIFIERS } from "@/utils/bestThirdsRanking";
import {
  forEachGroupStageMonteCarloRun,
  type H2HMap,
  type TeamGroupState,
  type TeamOutcomeProbs,
  type TournamentGroupInput,
} from "@/utils/groupClassification";
import type { FairPlayRecord } from "@/utils/fairPlay";
import {
  buildGroupStatesFromStandings,
  lookupAnnexC,
  resolveR32Match,
  type BracketSlotTeam,
  type KnockoutBracketResult,
} from "@/utils/knockoutBracket";

export type KnockoutSlotKey = `${number}:${"home" | "away"}`;

export interface KnockoutSlotCandidate {
  teamId: number;
  name: string;
  logo: string;
  probability: number;
}

export const CLINCHED_PROB_THRESHOLD = 95;
const MAX_CANDIDATES = 4;
const MIN_DISPLAY_PCT = 2;

export function knockoutSlotKey(matchId: number, side: "home" | "away"): KnockoutSlotKey {
  return `${matchId}:${side}`;
}

function slotSourceLabel(ref: BracketSlotRef): string {
  if (ref.type === "winner") return `Campeón Grupo ${ref.group}`;
  if (ref.type === "runnerUp") return `Subcampeón Grupo ${ref.group}`;
  return `3º (Grupos ${ref.eligibleGroups.join(", ")})`;
}

function incrementSlotCount(
  counts: Map<KnockoutSlotKey, Map<number, { count: number; row: StandingTeam }>>,
  key: KnockoutSlotKey,
  teamId: number,
  row: StandingTeam
): void {
  const bucket = counts.get(key) ?? new Map();
  const existing = bucket.get(teamId);
  bucket.set(teamId, { count: (existing?.count ?? 0) + 1, row: existing?.row ?? row });
  counts.set(key, bucket);
}

function countsToCandidates(
  bucket: Map<number, { count: number; row: StandingTeam }> | undefined,
  runs: number
): KnockoutSlotCandidate[] {
  if (!bucket || runs <= 0) return [];
  return [...bucket.values()]
    .map(({ count, row }) => ({
      teamId: row.team.id,
      name: row.team.name,
      logo: row.team.logo,
      probability: Math.round((count / runs) * 100),
    }))
    .filter((c) => c.probability >= MIN_DISPLAY_PCT)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, MAX_CANDIDATES);
}

function buildByGroupFromRows(
  rankedRowsByLetter: Map<string, StandingTeam[]>
): Map<GroupLetter, { states: TeamGroupState[]; rows: StandingTeam[] }> {
  const byGroup = new Map<GroupLetter, { states: TeamGroupState[]; rows: StandingTeam[] }>();
  for (const letter of GROUP_LETTERS) {
    const rows = rankedRowsByLetter.get(letter);
    if (!rows?.length) continue;
    byGroup.set(letter, {
      rows,
      states: rows.map((row) => ({
        teamId: row.team.id,
        teamName: row.team.name,
        points: row.points,
        goalsFor: row.all.goals.for,
        goalsAgainst: row.all.goals.against,
        priorStrength: 0,
      })),
    });
  }
  return byGroup;
}

function resolveSimulatedR32Slots(
  rankedRowsByLetter: Map<string, StandingTeam[]>,
  bestThirdIds: Set<number>
): Map<KnockoutSlotKey, StandingTeam | null> {
  const byGroup = buildByGroupFromRows(rankedRowsByLetter);
  const thirdRows = new Map<GroupLetter, StandingTeam>();
  for (const letter of GROUP_LETTERS) {
    const third = byGroup.get(letter)?.rows.find((r) => r.rank === 3) ?? byGroup.get(letter)?.rows[2];
    if (third) thirdRows.set(letter, third);
  }

  const qualifyingThirdGroups = GROUP_LETTERS.filter((letter) => {
    const row = thirdRows.get(letter);
    return row != null && bestThirdIds.has(row.team.id);
  }).sort();

  const annexKey =
    qualifyingThirdGroups.length >= BEST_THIRD_QUALIFIERS
      ? [...qualifyingThirdGroups].sort().join("")
      : null;
  const annexMap = annexKey ? lookupAnnexC(new Set(qualifyingThirdGroups)) : null;

  const groupFinished = (g: GroupLetter): boolean => {
    const rows = byGroup.get(g)?.rows ?? [];
    return rows.length > 0 && rows.every((r) => r.all.played >= 3);
  };

  const slotTeams = new Map<KnockoutSlotKey, StandingTeam | null>();

  for (const def of ROUND_OF_32) {
    const resolved = resolveR32Match(
      def,
      byGroup,
      annexMap,
      bestThirdIds,
      thirdRows,
      groupFinished
    );
    for (const side of ["home", "away"] as const) {
      const slot = resolved[side];
      const key = knockoutSlotKey(def.matchId, side);
      if (slot.team) {
        const row =
          [...byGroup.values()]
            .flatMap((g) => g.rows)
            .find((r) => r.team.id === slot.team!.teamId) ?? null;
        slotTeams.set(key, row);
      } else {
        slotTeams.set(key, null);
      }
    }
  }

  return slotTeams;
}

function fallbackCandidatesForRef(
  ref: BracketSlotRef,
  standings: StandingsGroup[],
  probMap: Map<number, TeamOutcomeProbs>
): KnockoutSlotCandidate[] {
  const byGroup = buildGroupStatesFromStandings(standings);

  if (ref.type === "winner" || ref.type === "runnerUp") {
    const rows = byGroup.get(ref.group)?.rows ?? [];
    const probKey = ref.type === "winner" ? "probFirst" : "probSecond";
    return rows
      .map((row) => ({
        teamId: row.team.id,
        name: row.team.name,
        logo: row.team.logo,
        probability: probMap.get(row.team.id)?.[probKey] ?? 0,
      }))
      .filter((c) => c.probability >= MIN_DISPLAY_PCT)
      .sort((a, b) => b.probability - a.probability)
      .slice(0, MAX_CANDIDATES);
  }

  const candidates: KnockoutSlotCandidate[] = [];
  for (const letter of ref.eligibleGroups) {
    const third = byGroup.get(letter)?.rows.find((r) => r.rank === 3) ?? byGroup.get(letter)?.rows[2];
    if (!third) continue;
    const prob = probMap.get(third.team.id)?.probBestThird ?? 0;
    if (prob >= MIN_DISPLAY_PCT) {
      candidates.push({
        teamId: third.team.id,
        name: third.team.name,
        logo: third.team.logo,
        probability: prob,
      });
    }
  }
  return candidates.sort((a, b) => b.probability - a.probability).slice(0, MAX_CANDIDATES);
}

function clinchedFromSlot(ref: BracketSlotRef, slot: BracketSlotTeam): KnockoutSlotCandidate[] | null {
  if (ref.type === "third") return null;
  if (!slot.team || slot.provisional) return null;
  return [
    {
      teamId: slot.team.teamId,
      name: slot.team.name,
      logo: slot.team.logo,
      probability: 100,
    },
  ];
}

export function canShowSlotAsClinched(
  ref: BracketSlotRef | null,
  slot: BracketSlotTeam,
  candidates: KnockoutSlotCandidate[],
  allGroupsFinished: boolean
): boolean {
  if (!slot.team || slot.provisional || candidates.length === 0) return false;
  if (ref?.type === "third") {
    return (
      allGroupsFinished &&
      candidates.length === 1 &&
      candidates[0].teamId === slot.team.teamId
    );
  }
  return candidates.length === 1 && candidates[0].teamId === slot.team.teamId;
}

export function isSlotClinched(candidates: KnockoutSlotCandidate[]): boolean {
  return (
    candidates.length === 1 &&
    candidates[0].probability >= CLINCHED_PROB_THRESHOLD
  );
}

export function simulateKnockoutSlotProbabilities(
  standings: StandingsGroup[],
  groups: TournamentGroupInput[],
  h2hMap: H2HMap,
  fairPlay: Map<number, FairPlayRecord>,
  probMap: Map<number, TeamOutcomeProbs>,
  bracket: KnockoutBracketResult | null
): Map<KnockoutSlotKey, KnockoutSlotCandidate[]> {
  const result = new Map<KnockoutSlotKey, KnockoutSlotCandidate[]>();
  const slotCounts = new Map<
    KnockoutSlotKey,
    Map<number, { count: number; row: StandingTeam }>
  >();

  const runs = forEachGroupStageMonteCarloRun(groups, h2hMap, fairPlay, 1000, (run) => {
    const slotTeams = resolveSimulatedR32Slots(run.rankedRowsByLetter, run.bestThirdIds);
    for (const [key, row] of slotTeams) {
      if (row) incrementSlotCount(slotCounts, key, row.team.id, row);
    }
  });

  for (const def of ROUND_OF_32) {
    for (const side of ["home", "away"] as const) {
      const ref = def[side];
      const key = knockoutSlotKey(def.matchId, side);
      const resolvedSlot = bracket?.roundOf32.find((m) => m.matchId === def.matchId)?.[side];

      const clinched = resolvedSlot ? clinchedFromSlot(ref, resolvedSlot) : null;
      if (clinched) {
        result.set(key, clinched);
        continue;
      }

      const fromSim = countsToCandidates(slotCounts.get(key), runs);
      if (fromSim.length > 0) {
        result.set(key, fromSim);
        continue;
      }

      result.set(key, fallbackCandidatesForRef(ref, standings, probMap));
    }
  }

  return result;
}
