"use client";

import { useMemo } from "react";
import type { Fixture } from "@/types";
import { useFixtures, useStandings, useTeams } from "./usePartidos";
import { useMatchSimulation } from "./useMatchSimulation";
import { useKnockoutBracket } from "./useKnockoutBracket";
import {
  buildProjectedKnockoutFixture,
  findTeamNextKnockoutMatch,
} from "@/utils/knockoutBracket";
import {
  getBracketRoundProbShortLabel,
  getNextMatchProbShortLabel,
  isGroupStageFixtureRound,
  isKnockoutFixtureRound,
  knockoutAdvanceProbability,
  shouldHideGroupClassification,
} from "@/utils/matchPhase";
import { knockoutSlotKey } from "@/utils/knockoutSlotProbabilities";
import { translateTeamName } from "@/utils/teamNames";

export interface TeamNextMatchProbResult {
  nextFixture: Fixture | null;
  /** Fixture de API o proyectado desde el cuadro para la UI. */
  displayFixture: Fixture | null;
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
  /** Mostrar % del próximo partido (no clasificación grupal). */
  showNextMatchProb: boolean;
  /** Mostrar probabilidad/desglose de clasificar del grupo. */
  showGroupClassification: boolean;
  isClassified: boolean;
}

export function useTeamNextMatchProb(teamId?: number): TeamNextMatchProbResult {
  const { data: fixtures = [], isLoading: loadingFixtures } = useFixtures({
    team: teamId,
  });
  const { data: standings = [], isLoading: loadingStandings } = useStandings();
  const { data: teams = [], isLoading: loadingTeams } = useTeams();
  const { bracket, slotProbabilities, isLoading: loadingBracket } = useKnockoutBracket();

  const standing = useMemo(() => {
    if (!teamId) return null;
    for (const sg of standings) {
      for (const group of sg.league.standings) {
        const found = group.find((s) => s.team.id === teamId);
        if (found) return found;
      }
    }
    return null;
  }, [standings, teamId]);

  const pendingGroupMatches = useMemo(() => {
    if (!teamId) return 0;
    return fixtures.filter(
      (f) =>
        f.fixture.status.short === "NS" &&
        isGroupStageFixtureRound(f.league.round) &&
        (f.teams.home.id === teamId || f.teams.away.id === teamId)
    ).length;
  }, [fixtures, teamId]);

  const bestThirdTeamIds = useMemo(
    () =>
      bracket?.rankedBestThirds
        .filter((t) => t.qualifies)
        .map((t) => t.row.team.id) ?? [],
    [bracket]
  );

  const isClassified = shouldHideGroupClassification(standing, pendingGroupMatches, {
    bestThirdTeamIds,
  });

  const bracketMatch = useMemo(() => {
    if (!teamId || !bracket || !isClassified) return null;
    return findTeamNextKnockoutMatch(teamId, bracket);
  }, [teamId, bracket, isClassified]);

  const resolvedContext = useMemo(() => {
    if (!teamId) {
      return {
        nextFixture: null as Fixture | null,
        displayFixture: null as Fixture | null,
        rivalId: null as number | null,
        rivalName: null as string | null,
        isKnockout: false,
        label: "Prob. clasificar",
      };
    }

    const nsFixtures = fixtures
      .filter((f) => f.fixture.status.short === "NS")
      .sort(
        (a, b) =>
          new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
      );

    const knockoutNs = nsFixtures.filter((f) => isKnockoutFixtureRound(f.league.round));
    const groupNs = nsFixtures.filter((f) => isGroupStageFixtureRound(f.league.round));

    let nextFixture: Fixture | null = null;

    if (isClassified) {
      nextFixture = knockoutNs[0] ?? bracketMatch?.fixture ?? null;
    } else {
      nextFixture = nsFixtures[0] ?? null;
    }

    let rivalId: number | null = null;
    let rivalName: string | null = null;
    let isHome = false;
    let isKnockout = false;
    let label = "Prob. clasificar";

    if (nextFixture) {
      isHome = nextFixture.teams.home.id === teamId;
      rivalId = isHome ? nextFixture.teams.away.id : nextFixture.teams.home.id;
      rivalName = translateTeamName(
        isHome ? nextFixture.teams.away.name : nextFixture.teams.home.name
      );
      isKnockout = isKnockoutFixtureRound(nextFixture.league.round);
      label = getNextMatchProbShortLabel(nextFixture.league.round);
    } else if (bracketMatch) {
      isHome = bracketMatch.isHome;
      rivalId = bracketMatch.rivalId;
      rivalName = bracketMatch.rivalName
        ? translateTeamName(bracketMatch.rivalName)
        : bracketMatch.rivalLabel;

      if (!rivalId && bracket && bracketMatch.rivalProvisional) {
        const side = isHome ? "away" : "home";
        const candidates = slotProbabilities.get(
          knockoutSlotKey(bracketMatch.matchId, side)
        );
        const top = candidates?.[0];
        if (top) {
          rivalId = top.teamId;
          rivalName = translateTeamName(top.name);
        }
      }

      isKnockout = true;
      label = getBracketRoundProbShortLabel(bracketMatch.round);
    } else if (isClassified) {
      label = "Clasificado";
    } else if (groupNs.length > 0) {
      label = "Prob. victoria";
    }

    let displayFixture: Fixture | null = nextFixture;
    if (!displayFixture && bracketMatch) {
      displayFixture = buildProjectedKnockoutFixture(teamId, bracketMatch, teams);
    }

    return {
      nextFixture,
      displayFixture,
      rivalId,
      rivalName,
      isKnockout,
      label,
    };
  }, [
    teamId,
    fixtures,
    isClassified,
    bracketMatch,
    bracket,
    slotProbabilities,
    teams,
  ]);

  const { result, isLoading: loadingSim, isFetching } = useMatchSimulation(
    teamId ?? 0,
    resolvedContext.rivalId ?? 0
  );

  const probabilities = useMemo(() => {
    if (!result || !teamId || !resolvedContext.rivalId) {
      return { win: null, draw: null, advance: null };
    }
    const isHome =
      resolvedContext.nextFixture != null
        ? resolvedContext.nextFixture.teams.home.id === teamId
        : bracketMatch?.isHome ?? false;
    const win = isHome ? result.outcomeProbs.winA : result.outcomeProbs.winB;
    const draw = result.outcomeProbs.draw;
    const winPct = Math.round(win * 100);
    const drawPct = Math.round(draw * 100);
    const advancePct = resolvedContext.isKnockout
      ? Math.round(knockoutAdvanceProbability(win, draw) * 100)
      : winPct;
    return { win: winPct, draw: drawPct, advance: advancePct };
  }, [result, teamId, resolvedContext, bracketMatch]);

  const showNextMatchProb =
    probabilities.advance != null &&
    (resolvedContext.nextFixture != null || bracketMatch != null);

  const showGroupClassification = !isClassified && !showNextMatchProb;

  const isLoading =
    loadingFixtures ||
    loadingStandings ||
    loadingTeams ||
    loadingBracket ||
    (resolvedContext.rivalId != null && (loadingSim || isFetching));

  return {
    nextFixture: resolvedContext.nextFixture,
    displayFixture: resolvedContext.displayFixture,
    rivalId: resolvedContext.rivalId,
    rivalName: resolvedContext.rivalName,
    isKnockout: resolvedContext.isKnockout,
    label: resolvedContext.label,
    winProbability: probabilities.win,
    advanceProbability: probabilities.advance,
    drawProbability: probabilities.draw,
    isLoading,
    showNextMatchProb,
    showGroupClassification,
    isClassified,
  };
}
