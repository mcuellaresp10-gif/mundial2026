import type { Fixture, Lineup, Player } from "@/types";
import type { StandingsGroup } from "@/types";
import { translateTeamName, teamNameMatchesQuery } from "@/utils/teamNames";
import {
  getFixtureLineups,
  getPlayerDetail,
  searchPlayers,
} from "@/server/footballClient";
import {
  getFixturesOnLocalDay,
  isFixtureLive,
  isPlausibleLiveFixture,
} from "@/lib/liveRefresh";
import { analyzeAgentQuestion, type QuestionHints } from "@/server/agent/questionAnalysis";
import { buildAgentContext } from "@/server/agent/contextBuilder";

const POS_ES: Record<string, string> = {
  G: "Portero",
  D: "Defensa",
  M: "Mediocampista",
  F: "Delantero",
};

function pickClubStat(player: Player) {
  const stats = player.statistics ?? [];
  return (
    stats.find(
      (s) =>
        s.league.id !== 1 &&
        !s.league.name.toLowerCase().includes("world cup") &&
        s.league.country !== "World"
    ) ?? stats[0]
  );
}

function pickNationalStat(player: Player) {
  const stats = player.statistics ?? [];
  return stats.find(
    (s) =>
      s.league.id === 1 ||
      s.league.name.toLowerCase().includes("world cup") ||
      s.league.country === "World"
  );
}

export function formatLineupBlock(fixture: Fixture, lineups: Lineup[]): string {
  const header = `⚽ *${translateTeamName(fixture.teams.home.name)} vs ${translateTeamName(fixture.teams.away.name)}*`;
  if (lineups.length === 0) {
    return `${header}\n_Alineación aún no publicada._`;
  }

  const blocks = lineups.map((lu) => {
    const team = translateTeamName(lu.team.name);
    const coach = lu.coach?.name ? `\n👔 DT: ${lu.coach.name}` : "";
    const xi =
      lu.startXI.length > 0
        ? lu.startXI
            .map((p) => `${p.player.number}. ${p.player.name} (${POS_ES[p.player.pos] ?? p.player.pos})`)
            .join("\n")
        : "_Titulares no disponibles_";
    const subs =
      lu.substitutes.length > 0
        ? `\n🪑 Suplentes: ${lu.substitutes
            .slice(0, 7)
            .map((p) => p.player.name)
            .join(", ")}${lu.substitutes.length > 7 ? "…" : ""}`
        : "";
    return `*${team}* · ${lu.formation || "—"}${coach}\n${xi}${subs}`;
  });

  return `${header}\n\n${blocks.join("\n\n")}`;
}

export function formatPlayerCard(player: Player): string {
  const p = player.player;
  const club = pickClubStat(player);
  const national = pickNationalStat(player);
  const lines = [`👤 *${p.name}*`];

  if (p.age) lines.push(`🎂 ${p.age} años · ${p.nationality ?? "—"}`);
  if (club) {
    lines.push(
      `🏟️ *Club:* ${translateTeamName(club.team.name)} (${club.league.name} ${club.league.season})`
    );
    if (club.games.position) {
      lines.push(`📍 Posición: ${POS_ES[club.games.position] ?? club.games.position}`);
    }
  } else {
    lines.push("🏟️ _Club no disponible en la API._");
  }
  if (national) {
    lines.push(`🌍 *Selección:* ${translateTeamName(national.team.name)}`);
    if (national.games.number) lines.push(`🔢 Dorsal: ${national.games.number}`);
  }
  return lines.join("\n");
}

function filterFixturesForLineups(all: Fixture[], teamKey?: string): Fixture[] {
  const live = all.filter((f) => isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short));
  const today = getFixturesOnLocalDay(all, new Date());
  const combined = [...live, ...today.filter((f) => !live.some((l) => l.fixture.id === f.fixture.id))];

  if (!teamKey) return combined.slice(0, 4);

  return combined
    .filter(
      (f) =>
        teamNameMatchesQuery(f.teams.home.name, teamKey) ||
        teamNameMatchesQuery(f.teams.away.name, teamKey)
    )
    .slice(0, 3);
}

export async function fetchLineupsText(all: Fixture[], teamKey?: string): Promise<string | null> {
  const targets = filterFixturesForLineups(all, teamKey);
  if (targets.length === 0) {
    return teamKey
      ? `No hay partidos en vivo ni hoy con *${translateTeamName(teamKey)}* para mostrar alineaciones.`
      : "No hay partidos en vivo ni hoy con alineaciones disponibles.";
  }

  const parts: string[] = ["📋 *Alineaciones*\n"];
  for (const f of targets) {
    const lineups = await getFixtureLineups(f.fixture.id);
    parts.push(formatLineupBlock(f, lineups));
  }
  return parts.join("\n\n");
}

export async function fetchPlayerText(query: string): Promise<string | null> {
  const results = await searchPlayers(query);
  if (results.length === 0) {
    return `No encontré a *${query}* en la base del Mundial. Prueba con apellido o nombre completo.`;
  }

  const best = results[0];
  const detail = (await getPlayerDetail(best.player.id)) ?? best;

  let text = formatPlayerCard(detail);
  if (results.length > 1) {
    const others = results
      .slice(1, 4)
      .map((r) => r.player.name)
      .join(", ");
    text += `\n\n_Otros resultados: ${others}_`;
  }
  return text;
}

export async function buildRichTelegramContext(
  question: string,
  fixtures: Fixture[],
  standings: StandingsGroup[],
  hints?: QuestionHints
): Promise<string> {
  const { context } = await buildAgentContext(
    question,
    fixtures,
    standings,
    new Map(),
    hints ?? analyzeAgentQuestion(question)
  );
  return context;
}

/** Respuesta directa sin IA cuando hay datos estructurados. */
export async function tryDirectAnswer(
  question: string,
  fixtures: Fixture[],
  teamKey?: string
): Promise<string | null> {
  const hints = analyzeAgentQuestion(question, teamKey);

  if (hints.wantsPlayerInfo && hints.playerQuery) {
    const playerText = await fetchPlayerText(hints.playerQuery);
    if (playerText && !playerText.includes("No encontré")) return playerText;
  }

  if (hints.wantsLineups) {
    return fetchLineupsText(fixtures, hints.teamKey ?? teamKey);
  }

  return null;
}
