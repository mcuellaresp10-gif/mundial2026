import type { Fixture, StandingsGroup, StandingTeam } from "@/types";
import { isFixtureFinished } from "@/lib/liveRefresh";
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
import type { TeamGroupState } from "@/utils/groupClassification";
import {
  BEST_THIRD_QUALIFIERS,
  rankThirdPlaceTeamsFromStandings,
} from "@/utils/bestThirdsRanking";
import { dedupeStandingTable, iterateStandingsTables } from "@/utils/standingsTables";
import {
  collectGroupMatchResults,
  rankGroupTeams,
} from "@/utils/groupTiebreakers";
import type { FairPlayRecord } from "@/utils/fairPlay";
import { formatRoundLabel } from "@/utils/formatters";

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
  isQualifyingThird?: boolean;
}

export interface KnockoutBracketResult {
  roundOf32: ResolvedR32Match[];
  knockoutMatches: ResolvedBracketMatch[];
  /** Fixtures API indexados por número de partido FIFA (M73…). */
  fixtureByMatchId: Map<number, Fixture>;
  groupStrips: Record<GroupLetter, GroupStripTeam[]>;
  qualifyingThirdGroups: GroupLetter[];
  annexKey: string | null;
  isProvisional: boolean;
  /** Los 12 grupos terminaron la fase de grupos. */
  allGroupsFinished: boolean;
  /** Mejores terceros proyectados (misma fuente que la tabla de mejores terceros). */
  rankedBestThirds: ReturnType<typeof rankThirdPlaceTeamsFromStandings>;
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
    const rows = dedupeStandingTable(table);
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
  rankedThirds: ReturnType<typeof rankThirdPlaceTeamsFromStandings>
): GroupLetter[] {
  return rankedThirds
    .filter((t) => t.qualifies)
    .map((t) => t.groupLetter as GroupLetter)
    .sort();
}

function thirdRowByGroup(
  rankedThirds: ReturnType<typeof rankThirdPlaceTeamsFromStandings>
): Map<GroupLetter, StandingTeam> {
  const map = new Map<GroupLetter, StandingTeam>();
  for (const entry of rankedThirds) {
    map.set(entry.groupLetter as GroupLetter, entry.row);
  }
  return map;
}

function resolveThirdSlot(
  ref: Extract<BracketSlotRef, { type: "third" }>,
  thirdRows: Map<GroupLetter, StandingTeam>,
  annexMap: Record<string, string> | null,
  bestThirdIds: Set<number>,
  groupFinished: (g: GroupLetter) => boolean,
  allGroupsFinished: boolean
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

  const row = thirdRows.get(thirdGroup);
  const qualifies = row != null && bestThirdIds.has(row.team.id);

  return {
    label: slotLabel(ref, thirdGroup),
    team: qualifies && row ? toBracketTeam(row) : null,
    // Mejor tercero no está cerrado hasta que terminen los 12 grupos.
    provisional: !qualifies || !groupFinished(thirdGroup) || !allGroupsFinished,
  };
}

export function resolveR32Match(
  def: RoundOf32Definition,
  byGroup: Map<GroupLetter, { states: TeamGroupState[]; rows: StandingTeam[] }>,
  annexMap: Record<string, string> | null,
  bestThirdIds: Set<number>,
  thirdRows: Map<GroupLetter, StandingTeam>,
  groupFinished: (g: GroupLetter) => boolean,
  allGroupsFinished = false
): ResolvedR32Match {
  const resolveSlot = (ref: BracketSlotRef): BracketSlotTeam => {
    if (ref.type === "third") {
      return resolveThirdSlot(
        ref,
        thirdRows,
        annexMap,
        bestThirdIds,
        groupFinished,
        allGroupsFinished
      );
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

function isKnockoutApiRound(round: string): boolean {
  const label = formatRoundLabel(round);
  return (
    label === "16avos de final" ||
    label === "Octavos de final" ||
    label === "Cuartos de final" ||
    label === "Semifinal" ||
    label === "Tercer puesto" ||
    label === "Final"
  );
}

function isRoundOf32ApiRound(round: string): boolean {
  return formatRoundLabel(round) === "16avos de final";
}

function sortFixturesByKickoff(fixtures: Fixture[]): Fixture[] {
  return [...fixtures].sort(
    (a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );
}

function teamsMatchFixture(fixture: Fixture, homeId: number, awayId: number): boolean {
  const h = fixture.teams.home.id;
  const a = fixture.teams.away.id;
  return (h === homeId && a === awayId) || (h === awayId && a === homeId);
}

function bracketSlotTeamIds(match: {
  home: BracketSlotTeam;
  away: BracketSlotTeam;
}): [number, number] | null {
  const homeId = match.home.team?.teamId;
  const awayId = match.away.team?.teamId;
  if (!homeId || !awayId) return null;
  return [homeId, awayId];
}

/** Empareja fixtures API con números de partido FIFA (M73…M104). */
export function mapFixturesToBracketMatchIds(
  fixtures: Fixture[],
  roundOf32: ResolvedR32Match[],
  knockoutMatches: ResolvedBracketMatch[]
): Map<number, Fixture> {
  const byMatchId = new Map<number, Fixture>();
  const usedFixtureIds = new Set<number>();
  const knockoutFixtures = sortFixturesByKickoff(
    fixtures.filter((fixture) => isKnockoutApiRound(fixture.league.round))
  );

  const r32Fixtures = knockoutFixtures.filter((fixture) =>
    isRoundOf32ApiRound(fixture.league.round)
  );
  const laterFixtures = knockoutFixtures.filter(
    (fixture) => !isRoundOf32ApiRound(fixture.league.round)
  );

  for (const match of roundOf32) {
    const ids = bracketSlotTeamIds(match);
    if (!ids) continue;
    const [homeId, awayId] = ids;
    const found = r32Fixtures.find(
      (fixture) =>
        !usedFixtureIds.has(fixture.fixture.id) &&
        teamsMatchFixture(fixture, homeId, awayId)
    );
    if (found) {
      byMatchId.set(match.matchId, found);
      usedFixtureIds.add(found.fixture.id);
    }
  }

  const unmatchedR32 = roundOf32
    .filter((match) => !byMatchId.has(match.matchId))
    .sort((a, b) => a.matchId - b.matchId);
  const unmatchedR32Fixtures = r32Fixtures
    .filter((fixture) => !usedFixtureIds.has(fixture.fixture.id))
    .sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
  for (let i = 0; i < Math.min(unmatchedR32.length, unmatchedR32Fixtures.length); i++) {
    byMatchId.set(unmatchedR32[i].matchId, unmatchedR32Fixtures[i]);
    usedFixtureIds.add(unmatchedR32Fixtures[i].fixture.id);
  }

  const allBracketMatches = [...roundOf32, ...knockoutMatches].sort(
    (a, b) => a.matchId - b.matchId
  );

  for (const match of allBracketMatches) {
    if (byMatchId.has(match.matchId)) continue;
    const ids = bracketSlotTeamIds(match);
    if (!ids) continue;
    const [homeId, awayId] = ids;
    const found = laterFixtures.find(
      (fixture) =>
        !usedFixtureIds.has(fixture.fixture.id) &&
        teamsMatchFixture(fixture, homeId, awayId)
    );
    if (found) {
      byMatchId.set(match.matchId, found);
      usedFixtureIds.add(found.fixture.id);
    }
  }

  const unmatchedLater = allBracketMatches
    .filter((match) => match.matchId >= 89 && !byMatchId.has(match.matchId))
    .sort((a, b) => a.matchId - b.matchId);
  const unmatchedLaterFixtures = laterFixtures
    .filter((fixture) => !usedFixtureIds.has(fixture.fixture.id))
    .sort(
      (a, b) =>
        new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
    );
  for (let i = 0; i < Math.min(unmatchedLater.length, unmatchedLaterFixtures.length); i++) {
    byMatchId.set(unmatchedLater[i].matchId, unmatchedLaterFixtures[i]);
    usedFixtureIds.add(unmatchedLaterFixtures[i].fixture.id);
  }

  return byMatchId;
}

function placeholderSlot(matchId: number, _slot: "home" | "away"): BracketSlotTeam {
  return {
    label: `Ganador M${matchId}`,
    team: null,
    provisional: true,
  };
}

function teamFromWinner(winner: BracketTeam, matchId: number): BracketSlotTeam {
  return {
    label: `Ganador M${matchId}`,
    team: winner,
    provisional: false,
  };
}

function teamFromLoser(loser: BracketTeam, matchId: number): BracketSlotTeam {
  return {
    label: `Perdedor M${matchId}`,
    team: loser,
    provisional: false,
  };
}

export function bracketTeamFromFixtureTeam(team: {
  id: number;
  name: string;
  logo: string;
}): BracketTeam {
  return { teamId: team.id, name: team.name, logo: team.logo };
}

function resolveKnockoutSide(
  fixture: Fixture,
  side: "home" | "away"
): BracketTeam | null {
  const team = side === "home" ? fixture.teams.home : fixture.teams.away;
  if (!team?.id) return null;
  return bracketTeamFromFixtureTeam(team);
}

/** Ganador de un partido de eliminatoria finalizado (incluye penales). */
export function getKnockoutWinnerFromFixture(fixture: Fixture): BracketTeam | null {
  if (!isFixtureFinished(fixture.fixture.status.short)) return null;

  const penHome = fixture.score.penalty.home;
  const penAway = fixture.score.penalty.away;
  if (penHome != null && penAway != null && penHome !== penAway) {
    return penHome > penAway
      ? resolveKnockoutSide(fixture, "home")
      : resolveKnockoutSide(fixture, "away");
  }

  const home = fixture.goals.home ?? 0;
  const away = fixture.goals.away ?? 0;
  if (home === away) return null;
  return home > away
    ? resolveKnockoutSide(fixture, "home")
    : resolveKnockoutSide(fixture, "away");
}

export function getKnockoutLoserFromFixture(fixture: Fixture): BracketTeam | null {
  const winner = getKnockoutWinnerFromFixture(fixture);
  if (!winner) return null;
  const home = resolveKnockoutSide(fixture, "home");
  const away = resolveKnockoutSide(fixture, "away");
  if (!home || !away) return null;
  return winner.teamId === home.teamId ? away : home;
}

function slotFromWinner(
  feederMatchId: number,
  winners: Map<number, BracketTeam>,
  fallbackLabel: string
): BracketSlotTeam {
  const team = winners.get(feederMatchId);
  if (!team) {
    return { label: fallbackLabel, team: null, provisional: true };
  }
  return teamFromWinner(team, feederMatchId);
}

function slotFromLoser(
  feederMatchId: number,
  losers: Map<number, BracketTeam>,
  fallbackLabel: string
): BracketSlotTeam {
  const team = losers.get(feederMatchId);
  if (!team) {
    return { label: fallbackLabel, team: null, provisional: true };
  }
  return teamFromLoser(team, feederMatchId);
}

/** Propaga ganadores/perdedores reales desde fixtures FT al cuadro octavos→final. */
export function resolveKnockoutWinnersFromFixtures(
  roundOf32: ResolvedR32Match[],
  knockoutMatches: ResolvedBracketMatch[],
  fixtureByMatchId: Map<number, Fixture>
): ResolvedBracketMatch[] {
  const winners = new Map<number, BracketTeam>();
  const losers = new Map<number, BracketTeam>();

  function recordResult(matchId: number) {
    const fixture = fixtureByMatchId.get(matchId);
    if (!fixture) return;
    const winner = getKnockoutWinnerFromFixture(fixture);
    const loser = getKnockoutLoserFromFixture(fixture);
    if (winner) winners.set(matchId, winner);
    if (loser) losers.set(matchId, loser);
  }

  for (const match of roundOf32) {
    recordResult(match.matchId);
  }

  return knockoutMatches.map((def) => {
    let home: BracketSlotTeam;
    let away: BracketSlotTeam;

    if (def.round === "third_place") {
      home = slotFromLoser(101, losers, "Perdedor M101");
      away = slotFromLoser(102, losers, "Perdedor M102");
    } else {
      const [feederA, feederB] = def.feedsFrom;
      home = slotFromWinner(feederA, winners, `Ganador M${feederA}`);
      away = slotFromWinner(feederB, winners, `Ganador M${feederB}`);
    }

    const updated = { ...def, home, away };
    recordResult(def.matchId);
    return updated;
  });
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

  const groupFinished = (g: GroupLetter): boolean => {
    const rows = byGroup.get(g)?.rows ?? [];
    return rows.length > 0 && rows.every((r) => r.all.played >= 3);
  };

  const rankedBestThirds = rankThirdPlaceTeamsFromStandings(standings, fixtures, fairPlay);
  const bestThirdIds = new Set(
    rankedBestThirds.filter((t) => t.qualifies).map((t) => t.row.team.id)
  );
  const qualifyingThirdGroups = getQualifyingThirdGroups(rankedBestThirds);
  const thirdRows = thirdRowByGroup(rankedBestThirds);

  const annexKey =
    qualifyingThirdGroups.length >= BEST_THIRD_QUALIFIERS
      ? [...qualifyingThirdGroups].sort().join("")
      : null;
  const annexMap = annexKey ? lookupAnnexC(new Set(qualifyingThirdGroups)) : null;

  const allGroupsFinished = GROUP_LETTERS.every((g) => groupFinished(g));

  const roundOf32 = ROUND_OF_32.map((def) =>
    resolveR32Match(
      def,
      byGroup,
      annexMap,
      bestThirdIds,
      thirdRows,
      groupFinished,
      allGroupsFinished
    )
  );

  const initialKnockout: ResolvedBracketMatch[] = [];
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

    initialKnockout.push({ ...def, home, away });
  }

  const fixtureByMatchId =
    fixtures.length > 0
      ? mapFixturesToBracketMatchIds(fixtures, roundOf32, initialKnockout)
      : new Map<number, Fixture>();

  const knockoutMatches =
    fixtureByMatchId.size > 0
      ? resolveKnockoutWinnersFromFixtures(roundOf32, initialKnockout, fixtureByMatchId)
      : initialKnockout;

  const groupStrips = {} as Record<GroupLetter, GroupStripTeam[]>;
  for (const letter of GROUP_LETTERS) {
    const rows = byGroup.get(letter)?.rows ?? [];
    const thirdRow = thirdRows.get(letter);
    groupStrips[letter] = rows.slice(0, 4).map((r) => ({
      teamId: r.team.id,
      name: r.team.name,
      logo: r.team.logo,
      rank: r.rank,
      isQualifyingThird:
        thirdRow?.team.id === r.team.id && bestThirdIds.has(r.team.id),
    }));
  }

  const isProvisional =
    !allGroupsFinished ||
    !annexMap ||
    roundOf32.some((m) => m.home.provisional || m.away.provisional);

  return {
    roundOf32,
    knockoutMatches: [...knockoutMatches].sort((a, b) => a.matchId - b.matchId),
    fixtureByMatchId,
    groupStrips,
    qualifyingThirdGroups,
    annexKey,
    isProvisional,
    allGroupsFinished,
    rankedBestThirds,
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
