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
  | { type: "x_forecasts"; force?: boolean }
  | { type: "x_approve"; dayKey: string }
  | { type: "x_reject"; dayKey: string }
  | { type: "ai"; question: string };

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

/** Botones del teclado → intent (texto normalizado sin emojis). */
const BUTTON_MAP: Record<string, BotIntent> = {
  ayuda: { type: "help" },
  pronosticos: { type: "x_forecasts", force: true },
  "pronosticos x": { type: "x_forecasts", force: true },
};

export function resolveIntent(raw: string): BotIntent {
  const text = normalize(raw);
  if (!text) return { type: "help" };

  if (BUTTON_MAP[text]) return BUTTON_MAP[text];

  if (includesAny(text, ["hola", "buenas", "hey", "hello", "que tal", "qué tal", "buenos dias", "buenas tardes", "buenas noches"])) {
    return { type: "greet" };
  }

  if (includesAny(text, ["ayuda", "help", "como funciona", "cómo funciona", "menu", "menú", "comandos"])) {
    return { type: "help" };
  }

  if (
    includesAny(text, [
      "pronosticos",
      "pronósticos",
      "borrador x",
      "publicar en x",
      "tweets betplay",
      "generar",
      "actualizar",
      "refresh",
    ])
  ) {
    return { type: "x_forecasts", force: true };
  }

  // Bot de contenido X: sin alertas ni Q&A del Mundial.
  return { type: "help" };
}

export function callbackToIntent(data: string): BotIntent | null {
  if (data.startsWith("act:")) {
    const act = data.slice(4);
    const map: Record<string, BotIntent> = {
      help: { type: "help" },
      pronosticos: { type: "x_forecasts", force: true },
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
  if (data.startsWith("x:approve:")) {
    const dayKey = data.slice("x:approve:".length);
    return dayKey ? { type: "x_approve", dayKey } : null;
  }
  if (data.startsWith("x:reject:")) {
    const dayKey = data.slice("x:reject:".length);
    return dayKey ? { type: "x_reject", dayKey } : null;
  }
  return null;
}
