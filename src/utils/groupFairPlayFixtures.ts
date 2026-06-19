import type { Fixture, StandingsGroup } from "@/types";
import { isWorldCupGroupLabel } from "@/utils/groupClassification";
import { filterGroupStageCountableFixtures } from "@/utils/groupTiebreakers";
import { iterateStandingsTables } from "@/utils/standingsTables";
import type { FairPlayRecord } from "@/utils/fairPlay";

export interface FtGroupFixtureRow {
  fixtureId: number;
  homeId: number;
  awayId: number;
}

export function listFtGroupStageFixtureRows(
  fixtures: Fixture[],
  standings: StandingsGroup[]
): FtGroupFixtureRow[] {
  const rows: FtGroupFixtureRow[] = [];
  const seen = new Set<number>();

  for (const { table } of iterateStandingsTables(standings)) {
    if (!table.length || !isWorldCupGroupLabel(table[0].group)) continue;
    const teamIds = new Set(table.map((r) => r.team.id));
    for (const f of filterGroupStageCountableFixtures(fixtures, teamIds)) {
      if (f.fixture.status.short !== "FT") continue;
      if (seen.has(f.fixture.id)) continue;
      seen.add(f.fixture.id);
      rows.push({
        fixtureId: f.fixture.id,
        homeId: f.teams.home.id,
        awayId: f.teams.away.id,
      });
    }
  }

  return rows;
}

export function fairPlaySignature(map: Map<number, FairPlayRecord>): string {
  let yellow = 0;
  let red = 0;
  for (const record of map.values()) {
    yellow += record.yellow;
    red += record.red;
  }
  return `${yellow}-${red}`;
}
