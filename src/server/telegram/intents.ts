import { extractPlayerQuery, isLineupQuestion } from "./questionAnalysis";

export type BotIntent =
  | { type: "today" }
  | { type: "live" }
  | { type: "next" }
  | { type: "standings"; group?: string }
  | { type: "colombia" }
  | { type: "digest" }
  | { type: "help" }
  | { type: "refresh" }
  | { type: "greet" }
  | { type: "lineups"; teamKey?: string }
  | { type: "player"; query: string }
  | { type: "team"; teamKey: string; teamLabel: string }
  | { type: "fixture"; id: number }
  | { type: "mute_menu" }
  | { type: "muted_list" }
  | { type: "mute"; id: number }
  | { type: "unmute"; id: number }
  | { type: "ai"; question: string };

const TEAM_ALIASES: Record<string, string> = {
  colombia: "colombia",
  café: "colombia",
  cafe: "colombia",
  tricolor: "colombia",
  argentina: "argentina",
  albiceleste: "argentina",
  brasil: "brazil",
  brazil: "brazil",
  mexico: "mexico",
  méxico: "mexico",
  usa: "usa",
  estados: "usa",
  "estados unidos": "usa",
  inglaterra: "england",
  england: "england",
  españa: "spain",
  spain: "spain",
  francia: "france",
  france: "france",
  alemania: "germany",
  germany: "germany",
  uruguay: "uruguay",
  chile: "chile",
  ecuador: "ecuador",
  paraguay: "paraguay",
  peru: "peru",
  perú: "peru",
  canada: "canada",
  canadá: "canada",
  japon: "japan",
  japón: "japan",
  japan: "japan",
  portugal: "portugal",
  holanda: "netherlands",
  "paises bajos": "netherlands",
  "países bajos": "netherlands",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\sáéíóúñü]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function includesAny(text: string, phrases: string[]): boolean {
  return phrases.some((p) => text.includes(normalize(p)));
}

function extractGroup(text: string): string | undefined {
  const m = text.match(/grupo\s*([a-l])/i) ?? text.match(/group\s*([a-l])/i);
  return m?.[1]?.toUpperCase();
}

function extractFixtureId(text: string): number | undefined {
  const m = text.match(/\b(\d{6,})\b/);
  if (!m) return undefined;
  const id = Number(m[1]);
  return Number.isFinite(id) ? id : undefined;
}

function findTeam(text: string): { key: string; label: string } | null {
  const sorted = Object.entries(TEAM_ALIASES).sort((a, b) => b[0].length - a[0].length);
  for (const [alias, key] of sorted) {
    if (text.includes(normalize(alias))) {
      return { key, label: alias.charAt(0).toUpperCase() + alias.slice(1) };
    }
  }
  return null;
}

/** Botones del teclado → intent (texto normalizado sin emojis). */
const BUTTON_MAP: Record<string, BotIntent> = {
  "partidos hoy": { type: "today" },
  "en vivo": { type: "live" },
  tablas: { type: "standings" },
  proximo: { type: "next" },
  colombia: { type: "colombia" },
  resumen: { type: "digest" },
  ayuda: { type: "help" },
  actualizar: { type: "refresh" },
  silenciar: { type: "mute_menu" },
  silenciados: { type: "muted_list" },
};

export function resolveIntent(raw: string): BotIntent {
  const text = normalize(raw);
  if (!text) return { type: "help" };

  if (BUTTON_MAP[text]) return BUTTON_MAP[text];

  const fixtureId = extractFixtureId(text);
  if (fixtureId && (text.includes("partido") || text.match(/^\d{6,}$/))) {
    return { type: "fixture", id: fixtureId };
  }

  if (includesAny(text, ["hola", "buenas", "hey", "hello", "que tal", "qué tal", "buenos dias", "buenas tardes", "buenas noches"])) {
    return { type: "greet" };
  }

  if (includesAny(text, ["ayuda", "help", "como funciona", "cómo funciona", "menu", "menú", "comandos"])) {
    return { type: "help" };
  }

  if (includesAny(text, ["actualizar", "refresh", "update", "recargar"])) {
    return { type: "refresh" };
  }

  if (
    includesAny(text, [
      "en vivo",
      "vivo",
      "live",
      "marcador",
      "marcadores",
      "quien va ganando",
      "quién va ganando",
      "resultado ahora",
      "como van",
      "cómo van",
    ])
  ) {
    return { type: "live" };
  }

  if (
    includesAny(text, [
      "partidos de hoy",
      "partidos hoy",
      "hoy juega",
      "que hay hoy",
      "qué hay hoy",
      "jornada de hoy",
      "calendario hoy",
    ]) ||
    text === "hoy"
  ) {
    return { type: "today" };
  }

  if (
    includesAny(text, [
      "proximo partido",
      "próximo partido",
      "siguiente partido",
      "cuando juega",
      "cuándo juega",
      "a que hora",
      "a qué hora",
    ]) ||
    text.includes("proximo") ||
    text.includes("próximo")
  ) {
    return { type: "next" };
  }

  if (
    includesAny(text, [
      "tabla",
      "tablas",
      "posiciones",
      "clasificacion",
      "clasificación",
      "standings",
      "grupo",
    ])
  ) {
    return { type: "standings", group: extractGroup(text) };
  }

  if (
    includesAny(text, [
      "colombia",
      "la sele",
      "nuestra sele",
      "tricolor",
      "los nuestros",
    ])
  ) {
    return { type: "colombia" };
  }

  if (
    includesAny(text, [
      "resumen",
      "digest",
      "que paso hoy",
      "qué pasó hoy",
      "dame un resumen",
      "como va el mundial",
      "cómo va el mundial",
    ])
  ) {
    return { type: "digest" };
  }

  if (
    includesAny(text, [
      "silenciados",
      "partidos silenciados",
      "alertas silenciadas",
      "lista silenciados",
    ])
  ) {
    return { type: "muted_list" };
  }

  if (
    includesAny(text, [
      "silenciar",
      "silenciar partido",
      "mutear",
      "no alertas",
      "sin alertas",
      "dejar de avisar",
    ])
  ) {
    return { type: "mute_menu" };
  }

  const team = findTeam(text);

  const playerQuery = extractPlayerQuery(raw);
  if (playerQuery) {
    return { type: "player", query: playerQuery };
  }

  if (isLineupQuestion(raw)) {
    return { type: "lineups", teamKey: team?.key };
  }

  if (team) {
    return { type: "team", teamKey: team.key, teamLabel: team.label };
  }

  return { type: "ai", question: raw.trim() };
}

export function callbackToIntent(data: string): BotIntent | null {
  if (data.startsWith("act:")) {
    const act = data.slice(4);
    const map: Record<string, BotIntent> = {
      today: { type: "today" },
      live: { type: "live" },
      next: { type: "next" },
      standings: { type: "standings" },
      colombia: { type: "colombia" },
      digest: { type: "digest" },
      refresh: { type: "refresh" },
      help: { type: "help" },
      mute_menu: { type: "mute_menu" },
      muted_list: { type: "muted_list" },
    };
    return map[act] ?? null;
  }
  if (data.startsWith("grp:")) {
    return { type: "standings", group: data.slice(4).toUpperCase() };
  }
  if (data.startsWith("fx:")) {
    const id = Number(data.slice(3));
    return Number.isFinite(id) ? { type: "fixture", id } : null;
  }
  if (data.startsWith("mute:")) {
    const id = Number(data.slice(5));
    return Number.isFinite(id) ? { type: "mute", id } : null;
  }
  if (data.startsWith("unmute:")) {
    const id = Number(data.slice(7));
    return Number.isFinite(id) ? { type: "unmute", id } : null;
  }
  return null;
}
