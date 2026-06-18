import type {
  Fixture,
  FormationType,
  OnceIdealPlayer,
  Player,
  RadarStats,
} from "@/types";
import { isFixtureFinished, isFixtureStarted } from "@/lib/liveRefresh";
import { parseRating } from "./formatters";
import { translateTeamName } from "./teamNames";
import {
  computePlayerRadarFromPlayer,
  mundialAverageRadar,
} from "./radarMetrics";
import { getWorldCupTournamentStat } from "./playerStats";

export function averageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export function calculatePPDA(passesAllowed: number, defensiveActions: number): number {
  if (defensiveActions === 0) return 0;
  return Math.round((passesAllowed / defensiveActions) * 10) / 10;
}

export function calculateWinProbability(
  teamAStats: { goalsFor: number; goalsAgainst: number; points: number },
  teamBStats: { goalsFor: number; goalsAgainst: number; points: number }
): { winA: number; draw: number; winB: number } {
  const strengthA = teamAStats.points * 3 + teamAStats.goalsFor - teamAStats.goalsAgainst;
  const strengthB = teamBStats.points * 3 + teamBStats.goalsFor - teamBStats.goalsAgainst;
  const total = strengthA + strengthB + 30;
  const winA = Math.round((strengthA / total) * 100);
  const winB = Math.round((strengthB / total) * 100);
  const draw = Math.max(0, 100 - winA - winB);
  return { winA, draw, winB };
}

export function aggregateFixtureGoals(fixtures: Fixture[]): number {
  return fixtures
    .filter((f) => isFixtureStarted(f.fixture.status.short))
    .reduce((sum, f) => sum + (f.goals.home ?? 0) + (f.goals.away ?? 0), 0);
}

export function getBiggestWin(fixtures: Fixture[]): { fixture: Fixture; margin: number } | null {
  let best: { fixture: Fixture; margin: number } | null = null;
  for (const f of fixtures.filter((x) => isFixtureFinished(x.fixture.status.short))) {
    const h = f.goals.home ?? 0;
    const a = f.goals.away ?? 0;
    const margin = Math.abs(h - a);
    if (!best || margin > best.margin) best = { fixture: f, margin };
  }
  return best;
}

export function playerToRadarStats(player: Player, pool: Player[] = []): RadarStats {
  return computePlayerRadarFromPlayer(player, pool) ?? mundialAverageRadar();
}

export function averageRadarByPosition(_players: Player[], _position: string): RadarStats {
  return mundialAverageRadar();
}

const FORMATION_SLOTS: Record<FormationType, { pos: string; x: number; y: number }[]> = {
  "4-3-3": [
    { pos: "G", x: 50, y: 86 },
    { pos: "D", x: 14, y: 68 }, { pos: "D", x: 38, y: 70 }, { pos: "D", x: 62, y: 70 }, { pos: "D", x: 86, y: 68 },
    { pos: "M", x: 24, y: 48 }, { pos: "M", x: 50, y: 46 }, { pos: "M", x: 76, y: 48 },
    { pos: "F", x: 22, y: 24 }, { pos: "F", x: 50, y: 22 }, { pos: "F", x: 78, y: 24 },
  ],
  "4-2-3-1": [
    { pos: "G", x: 50, y: 86 },
    { pos: "D", x: 14, y: 68 }, { pos: "D", x: 38, y: 70 }, { pos: "D", x: 62, y: 70 }, { pos: "D", x: 86, y: 68 },
    { pos: "M", x: 35, y: 54 }, { pos: "M", x: 65, y: 54 },
    { pos: "M", x: 20, y: 34 }, { pos: "M", x: 50, y: 32 }, { pos: "M", x: 80, y: 34 },
    { pos: "F", x: 50, y: 20 },
  ],
  "3-5-2": [
    { pos: "G", x: 50, y: 86 },
    { pos: "D", x: 26, y: 70 }, { pos: "D", x: 50, y: 72 }, { pos: "D", x: 74, y: 70 },
    { pos: "M", x: 12, y: 48 }, { pos: "M", x: 30, y: 50 }, { pos: "M", x: 50, y: 46 },
    { pos: "M", x: 70, y: 50 }, { pos: "M", x: 88, y: 48 },
    { pos: "F", x: 36, y: 24 }, { pos: "F", x: 64, y: 24 },
  ],
};

export function buildOnceIdeal(
  players: Player[],
  formation: FormationType = "4-3-3"
): OnceIdealPlayer[] {
  const slots = FORMATION_SLOTS[formation];
  const used = new Set<number>();
  const result: OnceIdealPlayer[] = [];

  for (const slot of slots) {
    const candidates = players
      .filter((p) => {
        const wc = getWorldCupTournamentStat(p);
        if (!wc) return false;
        const pos = wc.games.position;
        return pos === slot.pos && !used.has(p.player.id);
      })
      .sort(
        (a, b) =>
          parseRating(getWorldCupTournamentStat(b)?.games.rating) -
          parseRating(getWorldCupTournamentStat(a)?.games.rating)
      );

    const pick = candidates[0];
    if (pick) {
      used.add(pick.player.id);
      const stat = getWorldCupTournamentStat(pick)!;
      result.push({
        id: pick.player.id,
        name: pick.player.name,
        photo: pick.player.photo,
        team: translateTeamName(stat.team.name),
        teamLogo: stat.team.logo,
        position: slot.pos,
        rating: parseRating(stat.games.rating),
        gridPosition: { x: slot.x, y: slot.y },
      });
    }
  }
  return result;
}

export function getFormationSlots(formation: FormationType) {
  return FORMATION_SLOTS[formation];
}

export { averageRating as calcAverageRating };
