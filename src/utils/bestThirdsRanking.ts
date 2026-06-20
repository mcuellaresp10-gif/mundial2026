import type { Fixture, StandingTeam, StandingsGroup } from "@/types";
import type { FairPlayRecord } from "@/utils/fairPlay";
import { standingToTeamGroupState, type TeamGroupState } from "@/utils/matchOutcomeEngine";
import {
  collectGroupMatchResults,
  rankGroupTeams,
} from "@/utils/groupTiebreakers";
import { iterateStandingsTables } from "@/utils/standingsTables";

export const BEST_THIRD_QUALIFIERS = 8;

export interface RankedThirdPlaceEntry {
  rankAmongThirds: number;
  groupLetter: string;
  row: StandingTeam;
  qualifies: boolean;
}

function findStandingRow(table: StandingTeam[], teamId: number): StandingTeam | undefined {
  return table.find((r) => r.team.id === teamId);
}

/** Terceros de cada grupo A–L ordenados de mejor a peor (criterios FIFA entre terceros). */
export function rankThirdPlaceTeamsFromStandings(
  standings: StandingsGroup[],
  fixtures: Fixture[],
  fairPlay: Map<number, FairPlayRecord> = new Map()
): RankedThirdPlaceEntry[] {
  const snapshots = iterateStandingsTables(standings);
  const thirds: { letter: string; state: TeamGroupState; row: StandingTeam }[] = [];

  for (const snap of snapshots) {
    if (!snap.letter) continue;

    const teamIds = new Set(snap.table.map((r) => r.team.id));
    const matches = collectGroupMatchResults(fixtures, teamIds);
    const isPreTournament = snap.table.every((r) => r.all.played === 0);
    const states = snap.table.map((row) => standingToTeamGroupState(row, isPreTournament));
    const ranked = rankGroupTeams(states, matches, fairPlay, () => 0.5);
    const thirdState = ranked[2];
    if (!thirdState) continue;

    const row = findStandingRow(snap.table, thirdState.teamId);
    if (!row) continue;

    thirds.push({ letter: snap.letter, state: thirdState, row });
  }

  const rankedThirds = rankGroupTeams(
    thirds.map((t) => t.state),
    [],
    fairPlay,
    () => 0.5
  );
  const byTeamId = new Map(thirds.map((t) => [t.state.teamId, t]));

  return rankedThirds.map((state, index) => {
    const meta = byTeamId.get(state.teamId)!;
    return {
      rankAmongThirds: index + 1,
      groupLetter: meta.letter,
      row: meta.row,
      qualifies: index < BEST_THIRD_QUALIFIERS,
    };
  });
}
