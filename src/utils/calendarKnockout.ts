import type { CalendarMatchEntry, CalendarTeamSlot, Fixture, PhaseFilter } from "@/types";
import { ROUND_LABELS, ROUND_OF_32, KNOCKOUT_TREE, type BracketRound, type BracketSlotRef } from "@/data/worldCup2026Bracket";
import { getKnockoutMatchDate } from "@/data/worldCup2026KnockoutSchedule";
import { formatRoundLabel } from "@/utils/formatters";
import { translateTeamName } from "@/utils/teamNames";
import {
  mapFixturesToBracketMatchIds,
  resolveKnockoutWinnersFromFixtures,
  type BracketSlotTeam,
  type KnockoutBracketResult,
  type ResolvedBracketMatch,
  type ResolvedR32Match,
} from "@/utils/knockoutBracket";

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

function isPlaceholderTeamName(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.includes("winner") ||
    lower.includes("ganador") ||
    lower.includes("tbd") ||
    lower.includes("to be determined") ||
    lower.includes("perdedor") ||
    lower.includes("loser")
  );
}

function slotToCalendarTeam(slot: BracketSlotTeam): CalendarTeamSlot {
  if (slot.team) {
    return {
      id: slot.team.teamId,
      name: translateTeamName(slot.team.name),
      logo: slot.team.logo,
      label: slot.label,
      provisional: slot.provisional,
    };
  }
  return {
    name: slot.label,
    label: slot.label,
    provisional: true,
  };
}

function apiTeamToSlot(team: Fixture["teams"]["home"]): CalendarTeamSlot {
  return {
    id: team.id,
    name: translateTeamName(team.name),
    logo: team.logo,
  };
}

function mergeTeamSlot(
  apiTeam: CalendarTeamSlot,
  bracketSlot: BracketSlotTeam
): CalendarTeamSlot {
  const bracketTeam = slotToCalendarTeam(bracketSlot);
  const apiLooksPlaceholder = !apiTeam.id || isPlaceholderTeamName(apiTeam.name);

  if (bracketTeam.id && (apiLooksPlaceholder || bracketSlot.provisional)) {
    return {
      ...bracketTeam,
      provisional: bracketSlot.provisional,
    };
  }

  return {
    ...apiTeam,
    label: bracketSlot.label,
    provisional: bracketSlot.provisional,
  };
}

function fixtureToCalendarEntry(fixture: Fixture): CalendarMatchEntry {
  return {
    fixtureId: fixture.fixture.id,
    date: fixture.fixture.date,
    roundLabel: formatRoundLabel(fixture.league.round),
    home: apiTeamToSlot(fixture.teams.home),
    away: apiTeamToSlot(fixture.teams.away),
    goals: { home: fixture.goals.home, away: fixture.goals.away },
    statusShort: fixture.fixture.status.short,
    statusElapsed: fixture.fixture.status.elapsed,
    isProjected: false,
  };
}

function bracketMatchById(
  bracket: KnockoutBracketResult
): Map<number, ResolvedR32Match | ResolvedBracketMatch> {
  const map = new Map<number, ResolvedR32Match | ResolvedBracketMatch>();
  for (const match of bracket.roundOf32) map.set(match.matchId, match);
  for (const match of bracket.knockoutMatches) map.set(match.matchId, match);
  return map;
}

function enrichKnockoutEntry(
  fixture: Fixture,
  bracket: KnockoutBracketResult,
  matchId: number
): CalendarMatchEntry {
  const bracketMatch = bracketMatchById(bracket).get(matchId);
  const base = fixtureToCalendarEntry(fixture);

  if (!bracketMatch) {
    return { ...base, matchId };
  }

  const home = mergeTeamSlot(base.home, bracketMatch.home);
  const away = mergeTeamSlot(base.away, bracketMatch.away);
  const isProjected =
    Boolean(home.provisional || away.provisional) ||
    isPlaceholderTeamName(fixture.teams.home.name) ||
    isPlaceholderTeamName(fixture.teams.away.name);

  return {
    ...base,
    matchId,
    home,
    away,
    isProjected,
  };
}

function staticSlotLabel(ref: BracketSlotRef): string {
  if (ref.type === "winner") return `1${ref.group}`;
  if (ref.type === "runnerUp") return `2${ref.group}`;
  return `3º (${ref.eligibleGroups.join(",")})`;
}

/** Cuadro eliminatorio con placeholders cuando aún no hay standings. */
export function buildStaticKnockoutBracket(fixtures: Fixture[] = []): KnockoutBracketResult {
  const roundOf32: ResolvedR32Match[] = ROUND_OF_32.map((def) => ({
    matchId: def.matchId,
    side: def.side,
    order: def.order,
    home: { label: staticSlotLabel(def.home), team: null, provisional: true },
    away: { label: staticSlotLabel(def.away), team: null, provisional: true },
  }));

  const knockoutMatches: ResolvedBracketMatch[] = KNOCKOUT_TREE.map((def) => {
    if (def.round === "third_place") {
      return {
        ...def,
        home: { label: "Perdedor M101", team: null, provisional: true },
        away: { label: "Perdedor M102", team: null, provisional: true },
      };
    }
    const [feederA, feederB] = def.feedsFrom;
    return {
      ...def,
      home: { label: `Ganador M${feederA}`, team: null, provisional: true },
      away: { label: `Ganador M${feederB}`, team: null, provisional: true },
    };
  });

  const fixtureByMatchId = mapFixturesToBracketMatchIds(
    fixtures,
    roundOf32,
    knockoutMatches
  );

  const resolvedKnockout =
    fixtureByMatchId.size > 0
      ? resolveKnockoutWinnersFromFixtures(roundOf32, knockoutMatches, fixtureByMatchId)
      : knockoutMatches;

  return {
    roundOf32,
    knockoutMatches: resolvedKnockout,
    fixtureByMatchId,
    groupStrips: {} as KnockoutBracketResult["groupStrips"],
    qualifyingThirdGroups: [],
    annexKey: null,
    isProvisional: true,
    rankedBestThirds: [],
  };
}

function roundLabelForBracketMatch(
  match: ResolvedR32Match | ResolvedBracketMatch
): string {
  if ("round" in match && match.round) {
    return ROUND_LABELS[match.round as BracketRound];
  }
  return ROUND_LABELS.round_of_32;
}

function syntheticEntryFromBracket(
  match: ResolvedR32Match | ResolvedBracketMatch,
  date: string
): CalendarMatchEntry {
  const home = slotToCalendarTeam(match.home);
  const away = slotToCalendarTeam(match.away);

  return {
    matchId: match.matchId,
    date,
    roundLabel: roundLabelForBracketMatch(match),
    home,
    away,
    isProjected: Boolean(
      match.home.provisional ||
        match.away.provisional ||
        !match.home.team ||
        !match.away.team
    ),
  };
}

function buildKnockoutCalendarEntries(
  fixtures: Fixture[],
  bracket: KnockoutBracketResult
): CalendarMatchEntry[] {
  const entries: CalendarMatchEntry[] = [];
  const coveredFixtureIds = new Set<number>();

  const allMatches = [...bracket.roundOf32, ...bracket.knockoutMatches].sort(
    (a, b) => a.matchId - b.matchId
  );

  for (const match of allMatches) {
    const fixture = bracket.fixtureByMatchId.get(match.matchId);
    const date = fixture?.fixture.date ?? getKnockoutMatchDate(match.matchId);

    if (fixture) {
      entries.push(enrichKnockoutEntry(fixture, bracket, match.matchId));
      coveredFixtureIds.add(fixture.fixture.id);
    } else {
      entries.push(syntheticEntryFromBracket(match, date));
    }
  }

  for (const fixture of fixtures.filter((f) => isKnockoutApiRound(f.league.round))) {
    if (!coveredFixtureIds.has(fixture.fixture.id)) {
      entries.push(fixtureToCalendarEntry(fixture));
    }
  }

  return entries;
}

export function buildCalendarEntries(
  fixtures: Fixture[],
  bracket: KnockoutBracketResult | null
): CalendarMatchEntry[] {
  const groupFixtures = fixtures.filter((fixture) => !isKnockoutApiRound(fixture.league.round));

  const entries: CalendarMatchEntry[] = groupFixtures.map(fixtureToCalendarEntry);
  const effectiveBracket = bracket ?? buildStaticKnockoutBracket(fixtures);
  entries.push(...buildKnockoutCalendarEntries(fixtures, effectiveBracket));

  return entries.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function filterCalendarEntriesByPhase(
  entries: CalendarMatchEntry[],
  phase: PhaseFilter
): CalendarMatchEntry[] {
  if (phase === "Todos") return entries;

  return entries.filter((entry) => {
    if (phase.startsWith("Grupo ")) {
      return entry.roundLabel === phase;
    }
    const phaseLabels: Record<Exclude<PhaseFilter, "Todos">, string> = {
      "Grupo A": "Grupo A",
      "Grupo B": "Grupo B",
      "Grupo C": "Grupo C",
      "Grupo D": "Grupo D",
      "Grupo E": "Grupo E",
      "Grupo F": "Grupo F",
      "Grupo G": "Grupo G",
      "Grupo H": "Grupo H",
      "Grupo I": "Grupo I",
      "Grupo J": "Grupo J",
      "Grupo K": "Grupo K",
      "Grupo L": "Grupo L",
      "16avos": "16avos de final",
      Octavos: "Octavos de final",
      Cuartos: "Cuartos de final",
      Semis: "Semifinal",
      Final: "Final",
    };
    return entry.roundLabel === phaseLabels[phase];
  });
}

export function calendarEntryPhase(entry: CalendarMatchEntry): PhaseFilter | "Todos" {
  if (entry.roundLabel.startsWith("Grupo ")) {
    return entry.roundLabel as PhaseFilter;
  }
  const reverse: Record<string, PhaseFilter> = {
    "16avos de final": "16avos",
    "Octavos de final": "Octavos",
    "Cuartos de final": "Cuartos",
    Semifinal: "Semis",
    Final: "Final",
  };
  return reverse[entry.roundLabel] ?? "Todos";
}
