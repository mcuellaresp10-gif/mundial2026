import type { CalendarMatchEntry, CalendarTeamSlot, Fixture, PhaseFilter } from "@/types";
import { formatRoundLabel } from "@/utils/formatters";
import { translateTeamName } from "@/utils/teamNames";
import type {
  BracketSlotTeam,
  KnockoutBracketResult,
  ResolvedBracketMatch,
  ResolvedR32Match,
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

export function buildCalendarEntries(
  fixtures: Fixture[],
  bracket: KnockoutBracketResult | null
): CalendarMatchEntry[] {
  const groupFixtures = fixtures.filter((fixture) => !isKnockoutApiRound(fixture.league.round));
  const knockoutFixtures = fixtures.filter((fixture) => isKnockoutApiRound(fixture.league.round));

  const entries: CalendarMatchEntry[] = groupFixtures.map(fixtureToCalendarEntry);

  if (!bracket) {
    entries.push(...knockoutFixtures.map(fixtureToCalendarEntry));
  } else {
    const fixtureIdToMatchId = new Map<number, number>();
    for (const [matchId, fixture] of bracket.fixtureByMatchId.entries()) {
      fixtureIdToMatchId.set(fixture.fixture.id, matchId);
    }

    for (const fixture of knockoutFixtures) {
      const matchId = fixtureIdToMatchId.get(fixture.fixture.id);
      if (matchId != null) {
        entries.push(enrichKnockoutEntry(fixture, bracket, matchId));
      } else {
        entries.push(fixtureToCalendarEntry(fixture));
      }
    }
  }

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
