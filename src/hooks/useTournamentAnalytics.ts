"use client";

import { useMemo } from "react";
import { useFixtures, useTeams, useStandings } from "./usePartidos";
import { useTournamentEventData } from "./useTournamentEventData";
import { buildTeamConfederationMap } from "@/utils/confederations";
import {
  aggregateGoalsByDay,
  aggregateGoalsByDayLastN,
  aggregateGoalsByRound,
  aggregateMatchResults,
  aggregateScoreDistribution,
  aggregateGoalsByConfederation,
  aggregateConfederationEfficiency,
  aggregatePointsByConfederation,
  aggregatePointsEfficiencyByConfederation,
  aggregateHomeAwayGoals,
  aggregateGoalsByPhase,
  aggregateGoalsByMinute,
  aggregateGoalsByPosition,
  aggregateGoalTypes,
  countLateGoals,
  findComebacks,
  topScoringMatches,
  topScoringCities,
  aggregateRedCardsByConfederation,
  aggregateEarlyVsLateFirstGoal,
  generateDynamicInsight,
  buildPlayerPositionMap,
  flattenEvents,
  flattenLineups,
} from "@/utils/tournamentAnalytics";
import { aggregateFixtureGoals, getBiggestWin } from "@/utils/calculations";
import {
  isFixtureFinished,
  isFixtureStarted,
  isPlausibleLiveFixture,
  isWithinKickoffWindow,
} from "@/lib/liveRefresh";
import { translateTeamName } from "@/utils/teamNames";

export function useTournamentAnalytics(loadEvents = true) {
  const { data: fixtures = [] } = useFixtures();
  const { data: teams = [] } = useTeams();
  const { data: standings = [] } = useStandings();
  const { eventsByFixture, lineupsByFixture, isLoading: eventsLoading, hasFinished } =
    useTournamentEventData(fixtures, loadEvents);

  return useMemo(() => {
    const teamConfed = buildTeamConfederationMap(teams);
    const allEvents = flattenEvents(eventsByFixture);
    const allLineups = flattenLineups(lineupsByFixture);
    const positionMap = buildPlayerPositionMap(allLineups);

    const finished = fixtures.filter((f) => isFixtureFinished(f.fixture.status.short));
    const liveNow = fixtures.filter(
      (f) =>
        isPlausibleLiveFixture(f) ||
        (isWithinKickoffWindow(f.fixture.date, f.fixture.status.short) &&
          !isFixtureFinished(f.fixture.status.short))
    );
    const started = fixtures.filter((f) => isFixtureStarted(f.fixture.status.short));
    const pending = fixtures.filter((f) => f.fixture.status.short === "NS");

    const totalGoals = aggregateFixtureGoals(fixtures);
    const avgGoalsPerMatch = started.length > 0 ? totalGoals / started.length : 0;
    const biggestWin = getBiggestWin(fixtures);

    const datoDelDia = liveNow.length
      ? `En vivo: ${liveNow
          .map(
            (f) =>
              `${translateTeamName(f.teams.home.name)} ${f.goals.home ?? 0}-${f.goals.away ?? 0} ${translateTeamName(f.teams.away.name)}`
          )
          .join(" · ")}`
      : generateDynamicInsight(fixtures, teamConfed, allEvents);

    return {
      playedCount: finished.length,
      liveCount: liveNow.length,
      pendingCount: pending.length,
      totalGoals,
      avgGoalsPerMatch: Math.round(avgGoalsPerMatch * 100) / 100,
      biggestWin,
      datoDelDia,
      eventsLoading,
      hasFinished,
      goalsByDay: aggregateGoalsByDay(fixtures),
      goalsByDayLast7: aggregateGoalsByDayLastN(fixtures, 7),
      goalsByRound: aggregateGoalsByRound(fixtures),
      matchResults: aggregateMatchResults(fixtures),
      scoreDistribution: aggregateScoreDistribution(fixtures),
      goalsByConfederation: aggregateGoalsByConfederation(fixtures, teamConfed),
      confederationEfficiency: aggregateConfederationEfficiency(fixtures, teamConfed),
      pointsByConfederation: aggregatePointsByConfederation(standings, teamConfed),
      pointsEfficiencyByConfederation: aggregatePointsEfficiencyByConfederation(standings, teamConfed),
      homeAwayGoals: aggregateHomeAwayGoals(fixtures),
      goalsByPhase: aggregateGoalsByPhase(fixtures),
      goalsByMinute: aggregateGoalsByMinute(allEvents),
      goalsByPosition: aggregateGoalsByPosition(allEvents, positionMap),
      goalTypes: aggregateGoalTypes(allEvents),
      lateGoals: countLateGoals(allEvents),
      comebacks: findComebacks(fixtures),
      topMatches: topScoringMatches(fixtures),
      topCities: topScoringCities(fixtures),
      redCardsByConfederation: aggregateRedCardsByConfederation(allEvents, teamConfed),
      earlyVsLateFirstGoal: aggregateEarlyVsLateFirstGoal(eventsByFixture),
      dynamicInsight: generateDynamicInsight(fixtures, teamConfed, allEvents),
    };
  }, [fixtures, teams, standings, eventsByFixture, lineupsByFixture, eventsLoading, hasFinished]);
}
