"use client";

import { useMemo } from "react";
import type { Fixture } from "@/types";
import { useFixtures } from "./usePartidos";
import { useMatchSimulation } from "./useMatchSimulation";
import {
  getNextMatchProbShortLabel,
  isKnockoutFixtureRound,
  knockoutAdvanceProbability,
} from "@/utils/matchPhase";
import { translateTeamName } from "@/utils/teamNames";

export interface TeamNextMatchProbResult {
  nextFixture: Fixture | null;
  rivalId: number | null;
  rivalName: string | null;
  isKnockout: boolean;
  label: string;
  /** Victoria en 90'/prórroga (0–100). */
  winProbability: number | null;
  /** Pasar ronda en eliminatoria (W+D, 0–100). */
  advanceProbability: number | null;
  drawProbability: number | null;
  isLoading: boolean;
}

export function useTeamNextMatchProb(teamId?: number): TeamNextMatchProbResult {
  const { data: fixtures = [], isLoading: loadingFixtures } = useFixtures({
    team: teamId,
  });

  const nextFixture = useMemo(() => {
    if (!teamId) return null;
    return (
      fixtures
        .filter((f) => f.fixture.status.short === "NS")
        .sort(
          (a, b) =>
            new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
        )[0] ?? null
    );
  }, [fixtures, teamId]);

  const rivalId = useMemo(() => {
    if (!nextFixture || !teamId) return null;
    return nextFixture.teams.home.id === teamId
      ? nextFixture.teams.away.id
      : nextFixture.teams.home.id;
  }, [nextFixture, teamId]);

  const isHome = nextFixture != null && teamId != null && nextFixture.teams.home.id === teamId;
  const { result, isLoading: loadingSim, isFetching } = useMatchSimulation(
    teamId ?? 0,
    rivalId ?? 0
  );

  const round = nextFixture?.league.round ?? "";
  const isKnockout = isKnockoutFixtureRound(round);

  const probabilities = useMemo(() => {
    if (!result || !nextFixture || !teamId || !rivalId) {
      return { win: null, draw: null, advance: null };
    }
    const win = isHome ? result.outcomeProbs.winA : result.outcomeProbs.winB;
    const draw = result.outcomeProbs.draw;
    const winPct = Math.round(win * 100);
    const drawPct = Math.round(draw * 100);
    const advancePct = isKnockout
      ? Math.round(knockoutAdvanceProbability(win, draw) * 100)
      : winPct;
    return { win: winPct, draw: drawPct, advance: advancePct };
  }, [result, nextFixture, teamId, rivalId, isHome, isKnockout]);

  const rivalName = nextFixture
    ? translateTeamName(
        isHome ? nextFixture.teams.away.name : nextFixture.teams.home.name
      )
    : null;

  return {
    nextFixture,
    rivalId,
    rivalName,
    isKnockout,
    label: nextFixture ? getNextMatchProbShortLabel(round) : "Prob. clasificar",
    winProbability: probabilities.win,
    advanceProbability: probabilities.advance,
    drawProbability: probabilities.draw,
    isLoading: loadingFixtures || loadingSim || isFetching,
  };
}
