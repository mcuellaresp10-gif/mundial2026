import type { Fixture, StandingsGroup } from "@/types";
import { translateTeamName, teamNameMatchesQuery } from "@/utils/teamNames";
import { formatGroupFromRound } from "@/utils/formatters";
import {
  findStandingTeam,
  iterateStandingsTables,
} from "./standingsUtils";
import {
  getFixturesOnLocalDay,
  isFixtureFinished,
  isFixtureLive,
  isPlausibleLiveFixture,
  sortFixturesByKickoff,
} from "@/lib/liveRefresh";

function formatScore(f: Fixture): string {
  return `${f.goals.home ?? "-"}-${f.goals.away ?? "-"}`;
}

function formatMinute(f: Fixture): string {
  const { short, elapsed } = f.fixture.status;
  if (isFixtureFinished(short)) return short;
  if (elapsed != null) return `${elapsed}'`;
  return short;
}

function formatKickoff(dateStr: string): string {
  return new Date(dateStr).toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function livePulse(f: Fixture): string {
  const live = isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short);
  return live ? "🔴" : isFixtureFinished(f.fixture.status.short) ? "✅" : "🕐";
}

export function formatFixtureLine(f: Fixture, detailed = false): string {
  const home = translateTeamName(f.teams.home.name);
  const away = translateTeamName(f.teams.away.name);
  const round = formatGroupFromRound(f.league.round);
  const status = f.fixture.status.short;

  if (status === "NS") {
    return `${livePulse(f)} *${home}* vs *${away}*\n   🕐 ${formatKickoff(f.fixture.date)} · ${round}`;
  }

  const minute = formatMinute(f);
  let line = `${livePulse(f)} *${home}* ${formatScore(f)} *${away}* · _${minute}_\n   ${round}`;
  if (detailed && f.fixture.venue.name) {
    line += `\n   🏟️ ${f.fixture.venue.name}`;
  }
  return line;
}

export function formatTodayFixtures(all: Fixture[]): string {
  const today = getFixturesOnLocalDay(all, new Date());
  if (today.length === 0) {
    return "📅 *Hoy no hay partidos*\n\nPuedes ver el próximo con el botón ⏭️ Próximo o preguntarme *¿cuándo juega Colombia?*";
  }
  const liveCount = today.filter((f) => isPlausibleLiveFixture(f)).length;
  const header =
    liveCount > 0
      ? `📅 *Partidos de hoy* · ${liveCount} en vivo 🔥`
      : `📅 *Partidos de hoy* · ${today.length} partido${today.length > 1 ? "s" : ""}`;
  return `${header}\n\n${today.map((f) => formatFixtureLine(f, true)).join("\n\n")}`;
}

export function formatLiveFixtures(all: Fixture[]): string {
  const live = all.filter((f) => isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short));
  if (live.length === 0) {
    return "😴 *Nadie está jugando ahora*\n\nTe aviso en cuanto empiece un partido. Mientras, mira ⏭️ Próximo o 📅 Hoy.";
  }
  return `🔴 *En vivo ahora* · ${live.length} partido${live.length > 1 ? "s" : ""}\n\n${live.map((f) => formatFixtureLine(f, true)).join("\n\n")}`;
}

export function formatNextFixture(all: Fixture[]): string {
  const upcoming = sortFixturesByKickoff(all.filter((f) => f.fixture.status.short === "NS"));
  const next = upcoming[0];
  if (!next) return "🏁 *El Mundial terminó* — no quedan partidos por jugar.";
  const home = translateTeamName(next.teams.home.name);
  const away = translateTeamName(next.teams.away.name);
  return `⏭️ *Próximo partido*\n\n${formatFixtureLine(next, true)}\n\n⏰ Faltan ~${formatCountdown(next.fixture.date)} para el pitazo inicial.`;
}

function formatCountdown(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "pocos minutos";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)} día(s)`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} minutos`;
}

function formatStandingBlock(groupLabel: string, table: import("@/types").StandingTeam[]): string {
  const rows = table.map((t, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
    const name = translateTeamName(t.team.name);
    const played = t.all.played;
    const gd = t.goalsDiff >= 0 ? `+${t.goalsDiff}` : String(t.goalsDiff);
    return `${medal} ${name} — *${t.points} pts* (${played} PJ, ${gd})`;
  });
  return `📊 *${groupLabel}*\n${rows.join("\n")}`;
}

export function formatStandings(groups: StandingsGroup[], filterGroup?: string): string {
  if (groups.length === 0) return "📊 Tabla no disponible todavía.";
  const slices = iterateStandingsTables(groups).filter(
    (s) => !filterGroup || s.letter === filterGroup
  );
  if (slices.length === 0) {
    return filterGroup
      ? `No encontré datos del Grupo ${filterGroup}.`
      : "📊 Tabla no disponible.";
  }
  return slices.map(({ table, groupLabel }) => formatStandingBlock(groupLabel, table)).join("\n\n");
}

/** Parte tablas largas en chunks bajo el límite de Telegram (~4096). */
export function splitStandingsMessages(groups: StandingsGroup[], filterGroup?: string): string[] {
  const slices = iterateStandingsTables(groups).filter(
    (s) => !filterGroup || s.letter === filterGroup
  );
  if (slices.length === 0) {
    return [formatStandings(groups, filterGroup)];
  }

  const blocks = slices.map(({ table, groupLabel }) => formatStandingBlock(groupLabel, table));
  const messages: string[] = [];
  let chunk: string[] = [];
  let size = 0;

  for (const block of blocks) {
    if (size + block.length > 3800 && chunk.length > 0) {
      messages.push(chunk.join("\n\n"));
      chunk = [];
      size = 0;
    }
    chunk.push(block);
    size += block.length;
  }
  if (chunk.length > 0) messages.push(chunk.join("\n\n"));
  return messages;
}

export function formatFixtureDetail(f: Fixture): string {
  const home = translateTeamName(f.teams.home.name);
  const away = translateTeamName(f.teams.away.name);
  const status = f.fixture.status.short;
  const header =
    status === "NS"
      ? `📋 *${home} vs ${away}*`
      : isFixtureLive(status) || isPlausibleLiveFixture(f)
        ? `🔴 *${home} vs ${away}*`
        : `✅ *${home} vs ${away}*`;
  return `${header}\n\n${formatFixtureLine(f, true)}`;
}

export function formatColombiaHub(all: Fixture[], standings: StandingsGroup[]): string {
  const parts: string[] = ["🇨🇴 *Colombia en el Mundial*\n"];

  const colStandings = findStandingTeam(standings, "colombia", teamNameMatchesQuery);
  if (colStandings) {
    parts.push(
      `📊 *Posición:* ${colStandings.rank}º con *${colStandings.points} pts* (${colStandings.all.played} PJ, dif. ${colStandings.goalsDiff >= 0 ? "+" : ""}${colStandings.goalsDiff})`
    );
  }

  const colFixtures = all.filter(
    (f) =>
      teamNameMatchesQuery(f.teams.home.name, "colombia") ||
      teamNameMatchesQuery(f.teams.away.name, "colombia")
  );
  const live = colFixtures.filter((f) => isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short));
  const next = sortFixturesByKickoff(colFixtures.filter((f) => f.fixture.status.short === "NS"))[0];
  const last = colFixtures
    .filter((f) => isFixtureFinished(f.fixture.status.short))
    .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())[0];

  if (live.length > 0) {
    parts.push("\n🔴 *¡Jugando ahora!*\n" + live.map((f) => formatFixtureLine(f, true)).join("\n\n"));
  } else if (next) {
    parts.push("\n⏭️ *Próximo partido*\n" + formatFixtureLine(next, true));
  }
  if (last && live.length === 0) {
    parts.push("\n📜 *Último resultado*\n" + formatFixtureLine(last, true));
  }
  if (colFixtures.length === 0) {
    parts.push("\n_No encontré partidos de Colombia en el calendario._");
  }
  return parts.join("\n");
}

export function formatTeamFixtures(all: Fixture[], query: string, displayName?: string): string {
  const matches = all.filter(
    (f) =>
      teamNameMatchesQuery(f.teams.home.name, query) ||
      teamNameMatchesQuery(f.teams.away.name, query)
  );
  if (matches.length === 0) {
    return `🤷 No encontré partidos de *${query}* en el Mundial.`;
  }
  const live = matches.filter((f) => isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short));
  const upcoming = sortFixturesByKickoff(matches.filter((f) => f.fixture.status.short === "NS"));
  const finished = matches
    .filter((f) => isFixtureFinished(f.fixture.status.short))
    .sort((a, b) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime());

  const label =
    displayName ??
    translateTeamName(
      matches[0]?.teams.home.name && teamNameMatchesQuery(matches[0].teams.home.name, query)
        ? matches[0].teams.home.name
        : matches[0]?.teams.away.name ?? query
    );

  const parts: string[] = [`⚽ *${label}*\n`];
  if (live.length) parts.push("🔴 *En vivo*\n" + live.map((f) => formatFixtureLine(f, true)).join("\n\n"));
  if (upcoming[0]) parts.push("⏭️ *Próximo*\n" + formatFixtureLine(upcoming[0], true));
  if (finished[0]) parts.push("📜 *Último*\n" + formatFixtureLine(finished[0], true));
  return parts.join("\n\n");
}

export function formatDailyDigest(all: Fixture[], standings: StandingsGroup[]): string {
  const now = new Date();
  const today = getFixturesOnLocalDay(all, now);
  const live = all.filter((f) => isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short));
  const parts: string[] = [`⚡ *Resumen express* · ${now.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}\n`];

  if (live.length > 0) {
    parts.push(`🔴 *${live.length} en vivo:*\n${live.map((f) => formatFixtureLine(f)).join("\n")}`);
  }
  if (today.length > 0) {
    parts.push(`\n📅 *Hoy (${today.length}):*\n${today.slice(0, 4).map((f) => formatFixtureLine(f)).join("\n")}`);
    if (today.length > 4) parts.push(`_…y ${today.length - 4} más. Pulsa 📅 Partidos hoy_`);
  } else {
    parts.push("\n📅 _Hoy no hay partidos._");
  }

  const col = findStandingTeam(standings, "colombia", teamNameMatchesQuery);
  if (col) {
    parts.push(
      `\n🇨🇴 *Colombia:* ${col.rank}º · ${col.points} pts · dif. ${col.goalsDiff >= 0 ? "+" : ""}${col.goalsDiff}`
    );
  }
  return parts.join("\n");
}

export function buildTelegramContext(all: Fixture[], standings: StandingsGroup[]): string {
  const today = getFixturesOnLocalDay(all, new Date());
  const live = all.filter((f) => isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short));
  const parts: string[] = [];
  if (live.length > 0) parts.push("EN VIVO:\n" + live.map((f) => formatFixtureLine(f)).join("\n"));
  if (today.length > 0) parts.push("HOY:\n" + today.map((f) => formatFixtureLine(f)).join("\n"));
  if (standings.length > 0) parts.push(formatStandings(standings).replace(/\*/g, ""));
  return parts.join("\n\n") || "Sin datos recientes del torneo.";
}

export function greeting(name?: string): string {
  const h = new Date().getHours();
  const period = h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  const who = name ? `, ${name}` : "";
  return `${period}${who}! 👋`;
}

export const WELCOME_MESSAGE = (name?: string) =>
  `${greeting(name)}

🏆 *Soy tu compañero del fútbol Américas*

Puedes usar los *botones de abajo* o hablarme normal:
• _"partidos de hoy"_
• _"cómo va Colombia"_
• _"quién juega en vivo"_
• _"tabla del grupo B"_

Te aviso solo cuando hay *goles, inicios y finales* ⚽🔔`;

export const HELP_MESSAGE = `❓ *Guía rápida*

*Botones* — siempre abajo del chat
*Pregúntame en lenguaje natural*, por ejemplo:
• _"alineaciones de los partidos en vivo"_
• _"¿en qué club juega Messi?"_
• _"formación de Colombia"_
• _"tabla del grupo B"_
• _"silenciar partido en vivo"_

🔕 *Alertas:* usa los botones *Silenciar* / *Silenciados* para mutear goles de un partido.

Comandos: /hoy /vivo /colombia /tabla /silenciar /silenciados`;
