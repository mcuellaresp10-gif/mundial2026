import type { Fixture } from "@/types";
import { translateTeamName } from "@/utils/teamNames";
import { formatGroupFromRound } from "@/utils/formatters";
import { isFixtureFinished, isFixtureLive } from "@/lib/liveRefresh";
import { fixtureDetailKeyboard, notificationKeyboard } from "./keyboards";

export interface FixtureSnapshot {
  id: number;
  status: string;
  goalsHome: number | null;
  goalsAway: number | null;
  elapsed: number | null;
}

export interface NotificationEvent {
  fixtureId: number;
  message: string;
  replyMarkup?: ReturnType<typeof fixtureDetailKeyboard>;
}

export function toSnapshot(f: Fixture): FixtureSnapshot {
  return {
    id: f.fixture.id,
    status: f.fixture.status.short,
    goalsHome: f.goals.home,
    goalsAway: f.goals.away,
    elapsed: f.fixture.status.elapsed,
  };
}

function formatMatchHeader(f: Fixture): string {
  const home = translateTeamName(f.teams.home.name);
  const away = translateTeamName(f.teams.away.name);
  const round = formatGroupFromRound(f.league.round);
  const venue = f.fixture.venue.name ? `\n🏟️ ${f.fixture.venue.name}` : "";
  return `${home} vs ${away}\n${round}${venue}`;
}

function formatScoreLine(f: Fixture): string {
  const h = f.goals.home ?? 0;
  const a = f.goals.away ?? 0;
  return `${translateTeamName(f.teams.home.name)} ${h}-${a} ${translateTeamName(f.teams.away.name)}`;
}

export function diffFixtures(
  previous: Map<number, FixtureSnapshot>,
  current: Fixture[]
): NotificationEvent[] {
  const events: NotificationEvent[] = [];

  for (const f of current) {
    const id = f.fixture.id;
    const prev = previous.get(id);
    const snap = toSnapshot(f);
    const header = formatMatchHeader(f);

    if (!prev) {
      if (isFixtureLive(snap.status) || isFixtureFinished(snap.status)) {
        events.push({
          fixtureId: id,
          message: `🏁 *Inicio de partido*\n${header}\n${formatScoreLine(f)}`,
        });
      }
      previous.set(id, snap);
      continue;
    }

    const wasLive = isFixtureLive(prev.status);
    const isLive = isFixtureLive(snap.status);
    const wasFinished = isFixtureFinished(prev.status);
    const isFinished = isFixtureFinished(snap.status);

    if (prev.status === "NS" && isLive) {
      events.push({
        fixtureId: id,
        message: `🏁 *¡Pitazo inicial!*\n${header}`,
        replyMarkup: notificationKeyboard(id),
      });
    }

    if (snap.status === "HT" && prev.status !== "HT") {
      events.push({
        fixtureId: id,
        message: `⏸️ *Medio tiempo*\n${formatScoreLine(f)}\n${header}`,
        replyMarkup: notificationKeyboard(id),
      });
    }

    const prevGoals = (prev.goalsHome ?? 0) + (prev.goalsAway ?? 0);
    const currGoals = (snap.goalsHome ?? 0) + (snap.goalsAway ?? 0);
    if (currGoals > prevGoals && isLive) {
      const minute = snap.elapsed != null ? ` (${snap.elapsed}')` : "";
      events.push({
        fixtureId: id,
        message: `⚽ *¡GOL!*${minute}\n${formatScoreLine(f)}\n${header}`,
        replyMarkup: notificationKeyboard(id),
      });
    }

    if (!wasFinished && isFinished) {
      events.push({
        fixtureId: id,
        message: `🏆 *Final del partido*\n${formatScoreLine(f)}\n${header}`,
        replyMarkup: notificationKeyboard(id),
      });
    }

    if (!wasLive && isLive && prev.status !== "NS") {
      events.push({
        fixtureId: id,
        message: `🔴 *En vivo*\n${formatScoreLine(f)}\n${header}`,
      });
    }

    previous.set(id, snap);
  }

  return events;
}

export class NotifierState {
  private snapshots = new Map<number, FixtureSnapshot>();
  private initialized = false;

  process(fixtures: Fixture[]): NotificationEvent[] {
    if (!this.initialized) {
      for (const f of fixtures) {
        this.snapshots.set(f.fixture.id, toSnapshot(f));
      }
      this.initialized = true;
      return [];
    }
    return diffFixtures(this.snapshots, fixtures);
  }
}
