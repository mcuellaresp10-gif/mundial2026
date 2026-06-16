import type { FixtureEvent } from "@/types";
import { eventMinute } from "@/utils/matchMomentum";

export type EventMarkerKind =
  | "goal"
  | "yellow"
  | "red"
  | "subst"
  | "var"
  | "missed_penalty";

export interface ChartEventMarker {
  minute: number;
  teamSide: "home" | "away";
  kind: EventMarkerKind;
  icon: string;
  label: string;
  player: string;
  detail: string;
}

function eventKey(event: FixtureEvent): string {
  const min = eventMinute(event);
  return `${min}-${event.type}-${event.detail}-${event.player.id}-${event.team.id}`;
}

export function fixtureEventKey(event: FixtureEvent): string {
  return eventKey(event);
}

function classifyEvent(
  event: FixtureEvent,
  homeTeamId: number
): ChartEventMarker | null {
  const minute = eventMinute(event);
  const teamSide: "home" | "away" =
    event.team.id === homeTeamId ? "home" : "away";
  const player = event.player.name || "—";
  const minLabel = `${minute}'`;

  if (event.type === "Goal") {
    if (event.detail === "Missed Penalty") {
      return {
        minute,
        teamSide,
        kind: "missed_penalty",
        icon: "❌",
        label: `${player} ${minLabel}`,
        player,
        detail: event.detail,
      };
    }
    const icon = /Own Goal/i.test(event.detail) ? "🥅" : "⚽";
    return {
      minute,
      teamSide,
      kind: "goal",
      icon,
      label: `${player} ${minLabel}`,
      player,
      detail: event.detail,
    };
  }

  if (event.type === "Card") {
    if (/Red/i.test(event.detail)) {
      return {
        minute,
        teamSide,
        kind: "red",
        icon: "🟥",
        label: `${player} ${minLabel}`,
        player,
        detail: event.detail,
      };
    }
    if (/Yellow/i.test(event.detail)) {
      return {
        minute,
        teamSide,
        kind: "yellow",
        icon: "🟨",
        label: `${player} ${minLabel}`,
        player,
        detail: event.detail,
      };
    }
  }

  if (event.type === "subst") {
    return {
      minute,
      teamSide,
      kind: "subst",
      icon: "🔄",
      label: `${player} ${minLabel}`,
      player,
      detail: event.detail,
    };
  }

  if (event.type === "Var") {
    return {
      minute,
      teamSide,
      kind: "var",
      icon: "📺",
      label: `VAR ${minLabel}`,
      player,
      detail: event.detail,
    };
  }

  return null;
}

export function buildEventMarkers(
  events: FixtureEvent[],
  homeTeamId: number
): ChartEventMarker[] {
  const seen = new Set<string>();
  const markers: ChartEventMarker[] = [];

  for (const event of events) {
    const key = eventKey(event);
    if (seen.has(key)) continue;
    seen.add(key);
    const marker = classifyEvent(event, homeTeamId);
    if (marker) markers.push(marker);
  }

  return markers.sort((a, b) => a.minute - b.minute);
}

export function markersNearMinute(
  markers: ChartEventMarker[],
  minute: number,
  radius = 2
): ChartEventMarker[] {
  return markers.filter((m) => Math.abs(m.minute - minute) <= radius);
}
