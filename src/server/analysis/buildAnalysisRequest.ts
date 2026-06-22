import { getFixtureById, getPlayerDetail } from "@/server/footballClient";
import { formatPosition, getFixtureScore } from "@/utils/formatters";
import { translateTeamName } from "@/utils/teamNames";
import { getStatBundle, statSummary } from "@/utils/playerStats";
import {
  buildPlayerAnalysisPrompt,
  buildPostMatchPrompt,
  buildPreMatchPrompt,
} from "@/server/analysis/prompts";

export type AnalysisType = "pre-match" | "post-match" | "player";

export interface PreMatchBody {
  fixtureId: number;
  colombiaMode?: boolean;
}

export interface PostMatchBody {
  fixtureId: number;
  preContexto?: string;
}

export interface PlayerAnalysisBody {
  playerId: number;
}

function isColombiaFixture(home: string, away: string): boolean {
  return (
    home.toLowerCase().includes("colombia") || away.toLowerCase().includes("colombia")
  );
}

export async function buildAnalysisPrompt(
  type: AnalysisType,
  body: PreMatchBody | PostMatchBody | PlayerAnalysisBody
): Promise<{ prompt: string; cacheId: string } | { error: string; status: number }> {
  if (type === "pre-match") {
    const { fixtureId, colombiaMode = false } = body as PreMatchBody;
    const fixture = await getFixtureById(fixtureId);
    if (!fixture) return { error: "Partido no encontrado", status: 404 };

    const isColombia = isColombiaFixture(fixture.teams.home.name, fixture.teams.away.name);
    const prompt = buildPreMatchPrompt({
      home: fixture.teams.home.name,
      away: fixture.teams.away.name,
      date: fixture.fixture.date,
      round: fixture.league.round,
      colombiaMode: colombiaMode && isColombia,
    });
    return { prompt, cacheId: String(fixtureId) };
  }

  if (type === "post-match") {
    const { fixtureId, preContexto } = body as PostMatchBody;
    const fixture = await getFixtureById(fixtureId);
    if (!fixture) return { error: "Partido no encontrado", status: 404 };

    const prompt = buildPostMatchPrompt({
      home: fixture.teams.home.name,
      away: fixture.teams.away.name,
      score: getFixtureScore(fixture.goals.home, fixture.goals.away, "FT"),
      preAnalysis: preContexto,
    });
    return { prompt, cacheId: String(fixtureId) };
  }

  const { playerId } = body as PlayerAnalysisBody;
  const player = await getPlayerDetail(playerId);
  if (!player) return { error: "Jugador no encontrado", status: 404 };

  const bundle = getStatBundle(player);
  const nationalSummary = statSummary(bundle.national);
  const clubSummary = statSummary(bundle.club);
  const position = formatPosition(
    bundle.national?.games.position ?? bundle.club?.games.position ?? "M"
  );

  const prompt = buildPlayerAnalysisPrompt({
    name: player.player.name,
    position,
    team: translateTeamName(player.statistics[0]?.team.name ?? nationalSummary.teamName),
    stats: `Selección: ${nationalSummary.goals}G ${nationalSummary.assists}A (rating ${nationalSummary.rating}). Club: ${clubSummary.goals}G ${clubSummary.assists}A en ${clubSummary.teamName} (rating ${clubSummary.rating}).`,
    age: player.player.age ?? undefined,
  });

  return { prompt, cacheId: String(playerId) };
}

export function parseAnalysisBody(
  type: AnalysisType,
  body: unknown
): PreMatchBody | PostMatchBody | PlayerAnalysisBody | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;

  if (type === "pre-match" || type === "post-match") {
    const fixtureId = Number(record.fixtureId);
    if (!Number.isInteger(fixtureId) || fixtureId <= 0) return null;
    if (type === "pre-match") {
      return {
        fixtureId,
        colombiaMode: record.colombiaMode === true,
      };
    }
    return {
      fixtureId,
      preContexto:
        typeof record.preContexto === "string" ? record.preContexto.slice(0, 500) : undefined,
    };
  }

  const playerId = Number(record.playerId);
  if (!Number.isInteger(playerId) || playerId <= 0) return null;
  return { playerId };
}
