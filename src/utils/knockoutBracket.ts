import type { Fixture, StandingsGroup, StandingTeam } from "@/types";
import annexCData from "@/data/annexCThirdPlace.json";
import {
  GROUP_LETTERS,
  KNOCKOUT_TREE,
  ROUND_OF_32,
  type BracketRound,
  type BracketSide,
  type BracketSlotRef,
  type GroupLetter,
  type RoundOf32Definition,
} from "@/data/worldCup2026Bracket";
import {
  pickBestThirdQualifiers,
  type TeamGroupState,
} from "@/utils/groupClassification";
import { iterateStandingsTables } from "@/utils/standingsTables";
import {
  collectGroupMatchResults,
  rankGroupTeams,
} from "@/utils/groupTiebreakers";
import type { FairPlayRecord } from "@/utils/fairPlay";

const annexC = annexCData as Record<string, Record<string, string>>;

export interface KnockoutBracketOptions {
  fixtures?: Fixture[];
  fairPlay?: Map<number, FairPlayRecord>;
}

function rankGroupData(
  data: { states: TeamGroupState[]; rows: StandingTeam[] },
  fixtures: Fixture[],
  fairPlay: Map<number, FairPlayRecord>
): { states: TeamGroupState[]; rows: StandingTeam[] } {
  const teamIds = new Set(data.states.map((s) => s.teamId));
  const matches = collectGroupMatchResults(fixtures, teamIds);
  const ranked = rankGroupTeams(data.states, matches, fairPlay, () => 0.5);
  const rowsById = new Map(data.rows.map((r) => [r.team.id, r]));
  const rows = ranked.map((s, index) => {
    const row = rowsById.get(s.teamId);
    if (!row) return null;
    return { ...row, rank: index + 1 };
  }).filter((r): r is StandingTeam => r != null);
  return { states: ranked, rows };
}

export interface BracketTeam {
  teamId: number;
  name: string;
  logo: string;
}

export interface BracketSlotTeam {
  label: string;
  team: BracketTeam | null;
  provisional: boolean;
}

export interface ResolvedR32Match {
  matchId: number;
  side: BracketSide;
  order: number;
  home: BracketSlotTeam;
  away: BracketSlotTeam;
}

export interface ResolvedBracketMatch {
  matchId: number;
  round: BracketRound;
  side?: BracketSide;
  order?: number;
  feedsFrom: [number, number];
  home: BracketSlotTeam;
  away: BracketSlotTeam;
}

export interface GroupStripTeam {
  teamId: number;
  name: string;
  logo: string;
  rank: number;
}

export interface KnockoutBracketResult {
  roundOf32: ResolvedR32Match[];
  knockoutMatches: ResolvedBracketMatch[];
  groupStrips: Record<GroupLetter, GroupStripTeam[]>;
  qualifyingThirdGroups: GroupLetter[];
  annexKey: string | null;
  isProvisional: boolean;
}

function standingToState(row: StandingTeam): TeamGroupState {
  return {
    teamId: row.team.id,
    teamName: row.team.name,
    points: row.points,
    goalsFor: row.all.goals.for,
    goalsAgainst: row.all.goals.against,
    priorStrength: 0,
  };
}

function toBracketTeam(row: StandingTeam): BracketTeam {
  return {
    teamId: row.team.id,
    name: row.team.name,
    logo: row.team.logo,
  };
}

export function buildGroupStatesFromStandings(
  standings: StandingsGroup[]
): Map<GroupLetter, { states: TeamGroupState[]; rows: StandingTeam[] }> {
  const byGroup = new Map<GroupLetter, { states: TeamGroupState[]; rows: StandingTeam[] }>();
  for (const { table, letter } of iterateStandingsTables(standings)) {
    if (!letter || !GROUP_LETTERS.includes(letter as GroupLetter)) continue;
    const group = letter as GroupLetter;
    const rows = [...table].sort((a, b) => a.rank - b.rank);
    byGroup.set(group, {
      rows,
      states: rows.map(standingToState),
    });
  }
  return byGroup;
}

export function lookupAnnexC(qualifyingThirdGroups: Set<GroupLetter>): Record<string, string> | null {
  const key = [...qualifyingThirdGroups].sort().join("");
  return annexC[key] ?? null;
}

function slotLabel(ref: BracketSlotRef, thirdGroup?: GroupLetter): string {
  if (ref.type === "winner") return `1${ref.group}`;
  if (ref.type === "runnerUp") return `2${ref.group}`;
  if (thirdGroup) return `3${thirdGroup}`;
  return `3º (${ref.eligibleGroups.join(",")})`;
}

function resolveDirectSlot(
  ref: Extract<BracketSlotRef, { type: "winner" | "runnerUp" }>,
  byGroup: Map<GroupLetter, { states: TeamGroupState[]; rows: StandingTeam[] }>,
  groupFinished: (g: GroupLetter) => boolean
): BracketSlotTeam {
  const rank = ref.type === "winner" ? 1 : 2;
  const data = byGroup.get(ref.group);
  const row = data?.rows.find((r) => r.rank === rank) ?? data?.rows[rank - 1];
  const provisional = !groupFinished(ref.group);
  return {
    label: slotLabel(ref),
    team: row ? toBracketTeam(row) : null,
    provisional,
  };
}

function getQualifyingThirdGroups(
  byGroup: Map<GroupLetter, { states: TeamGroupState[]; rows: StandingTeam[] }>,
  bestThirdIds: Set<number>
): GroupLetter[] {
  const qualifying: GroupLetter[] = [];
  for (const letter of GROUP_LETTERS) {
    const data = byGroup.get(letter);
    if (!data) continue;
    const third = data.states[2];
    if (third && bestThirdIds.has(third.teamId)) {
      qualifying.push(letter);
    }
  }
  return qualifying.sort();
}

function resolveThirdSlot(
  ref: Extract<BracketSlotRef, { type: "third" }>,
  byGroup: Map<GroupLetter, { states: TeamGroupState[]; rows: StandingTeam[] }>,
  annexMap: Record<string, string> | null,
  bestThirdIds: Set<number>
): BracketSlotTeam {
  if (!annexMap) {
    return {
      label: slotLabel(ref),
      team: null,
      provisional: true,
    };
  }

  const assigned = annexMap[ref.annexWinnerSlot];
  const thirdGroup = assigned?.replace(/^3/, "") as GroupLetter | undefined;
  if (!thirdGroup || !ref.eligibleGroups.includes(thirdGroup)) {
    return {
      label: slotLabel(ref),
      team: null,
      provisional: true,
    };
  }

  const data = byGroup.get(thirdGroup);
  const thirdState = data?.states[2];
  const row = data?.rows.find((r) => r.team.id === thirdState?.teamId) ?? data?.rows[2];
  const qualifies = thirdState && bestThirdIds.has(thirdState.teamId);

  return {
    label: slotLabel(ref, thirdGroup),
    team: qualifies && row ? toBracketTeam(row) : null,
    provisional: !qualifies,
  };
}

function resolveR32Match(
  def: RoundOf32Definition,
  byGroup: Map<GroupLetter, { states: TeamGroupState[]; rows: StandingTeam[] }>,
  annexMap: Record<string, string> | null,
  bestThirdIds: Set<number>,
  groupFinished: (g: GroupLetter) => boolean
): ResolvedR32Match {
  const resolveSlot = (ref: BracketSlotRef): BracketSlotTeam => {
    if (ref.type === "third") {
      return resolveThirdSlot(ref, byGroup, annexMap, bestThirdIds);
    }
    return resolveDirectSlot(ref, byGroup, groupFinished);
  };

  return {
    matchId: def.matchId,
    side: def.side,
    order: def.order,
    home: resolveSlot(def.home),
    away: resolveSlot(def.away),
  };
}

function placeholderSlot(matchId: number, slot: "home" | "away"): BracketSlotTeam {
  return {
    label: `Ganador M${matchId}`,
    team: null,
    provisional: true,
  };
}

export function resolveKnockoutBracket(
  standings: StandingsGroup[],
  options: KnockoutBracketOptions = {}
): KnockoutBracketResult {
  const fixtures = options.fixtures ?? [];
  const fairPlay = options.fairPlay ?? new Map();

  let byGroup = buildGroupStatesFromStandings(standings);
  if (fixtures.length > 0 || fairPlay.size > 0) {
    const reranked = new Map<
      GroupLetter,
      { states: TeamGroupState[]; rows: StandingTeam[] }
    >();
    for (const letter of GROUP_LETTERS) {
      const data = byGroup.get(letter);
      if (!data) continue;
      reranked.set(letter, rankGroupData(data, fixtures, fairPlay));
    }
    byGroup = reranked;
  }

  const groupEntries = GROUP_LETTERS.flatMap((letter) => {
    const data = byGroup.get(letter);
    if (!data || data.states.length === 0) return [];
    return [{ letter, data }];
  });

  const groupStatesList = groupEntries.map((entry) => entry.data.states);
  const matchesByGroup = groupEntries.map(({ data }) => {
    const teamIds = new Set(data.states.map((s) => s.teamId));
    return collectGroupMatchResults(fixtures, teamIds);
  });

  const groupFinished = (g: GroupLetter): boolean => {
    const rows = byGroup.get(g)?.rows ?? [];
    return rows.length > 0 && rows.every((r) => r.all.played >= 3);
  };

  const bestThirdIds = pickBestThirdQualifiers(
    groupStatesList,
    matchesByGroup,
    fairPlay
  );
  const qualifyingThirdGroups = getQualifyingThirdGroups(byGroup, bestThirdIds);
  const annexKey =
    qualifyingThirdGroups.length === 8 ? [...qualifyingThirdGroups].sort().join("") : null;
  const annexMap = annexKey ? lookupAnnexC(new Set(qualifyingThirdGroups)) : null;

  const roundOf32 = ROUND_OF_32.map((def) =>
    resolveR32Match(def, byGroup, annexMap, bestThirdIds, groupFinished)
  );

  const resolvedById = new Map<number, ResolvedBracketMatch>();

  for (const def of KNOCKOUT_TREE) {
    const [a, b] = def.feedsFrom;
    let home: BracketSlotTeam;
    let away: BracketSlotTeam;

    if (def.round === "third_place") {
      home = { label: "Perdedor M101", team: null, provisional: true };
      away = { label: "Perdedor M102", team: null, provisional: true };
    } else {
      home = placeholderSlot(a, "home");
      away = placeholderSlot(b, "away");
    }

    resolvedById.set(def.matchId, {
      ...def,
      home,
      away,
    });
  }

  const groupStrips = {} as Record<GroupLetter, GroupStripTeam[]>;
  for (const letter of GROUP_LETTERS) {
    const rows = byGroup.get(letter)?.rows ?? [];
    groupStrips[letter] = rows.slice(0, 4).map((r) => ({
      teamId: r.team.id,
      name: r.team.name,
      logo: r.team.logo,
      rank: r.rank,
    }));
  }

  const isProvisional =
    !annexMap ||
    roundOf32.some((m) => m.home.provisional || m.away.provisional);

  return {
    roundOf32,
    knockoutMatches: [...resolvedById.values()].sort((a, b) => a.matchId - b.matchId),
    groupStrips,
    qualifyingThirdGroups,
    annexKey,
    isProvisional,
  };
}

export function getRoundOf32BySide(
  roundOf32: ResolvedR32Match[],
  side: BracketSide
): ResolvedR32Match[] {
  return roundOf32.filter((m) => m.side === side).sort((a, b) => a.order - b.order);
}

export function getKnockoutByRound(
  matches: ResolvedBracketMatch[],
  round: BracketRound,
  side?: BracketSide
): ResolvedBracketMatch[] {
  return matches
    .filter((m) => m.round === round && (side == null || m.side === side))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
