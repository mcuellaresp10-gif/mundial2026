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
  | { type: "x_phase_probs"; force?: boolean }
  | { type: "x_conmebol"; force?: boolean }
  | { type: "x_argentina"; force?: boolean }
  | { type: "x_argentina_phase"; force?: boolean }
  | { type: "x_approve"; dayKey: string }
  | { type: "x_reject"; dayKey: string }
  | { type: "xp_approve"; dayKey: string }
  | { type: "xp_reject"; dayKey: string }
  | { type: "xc_approve"; dayKey: string }
  | { type: "xc_reject"; dayKey: string }
  | { type: "xa_approve"; dayKey: string }
  | { type: "xa_reject"; dayKey: string }
  | { type: "xap_approve"; dayKey: string }
  | { type: "xap_reject"; dayKey: string }
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

const BUTTON_MAP: Record<string, BotIntent> = {
  ayuda: { type: "help" },
  pronosticos: { type: "x_forecasts", force: true },
  "pronosticos x": { type: "x_forecasts", force: true },
  cuadrangulares: { type: "x_phase_probs", force: true },
  "cuadrangulares x": { type: "x_phase_probs", force: true },
  conmebol: { type: "x_conmebol", force: true },
  "conmebol x": { type: "x_conmebol", force: true },
  argentina: { type: "x_argentina", force: true },
  "argentina x": { type: "x_argentina", force: true },
  "playoffs ar": { type: "x_argentina_phase", force: true },
  playoffsar: { type: "x_argentina_phase", force: true },
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

  if (includesAny(text, ["playoffs ar", "playoffs argentina", "octavos argentina", "probs argentina"])) {
    return { type: "x_argentina_phase", force: true };
  }

  if (includesAny(text, ["argentina", "liga profesional", "liga argentina"])) {
    return { type: "x_argentina", force: true };
  }

  if (includesAny(text, ["conmebol", "libertadores", "sudamericana", "sudaca"])) {
    return { type: "x_conmebol", force: true };
  }

  if (
    includesAny(text, [
      "cuadrangulares",
      "clasificar",
      "probabilidades de clasificar",
      "probs cuadrangulares",
    ])
  ) {
    return { type: "x_phase_probs", force: true };
  }

  if (
    includesAny(text, [
      "pronosticos",
      "pronósticos",
      "borrador x",
      "tweets betplay",
      "generar",
      "actualizar",
      "refresh",
    ])
  ) {
    return { type: "x_forecasts", force: true };
  }

  return { type: "help" };
}

export function callbackToIntent(data: string): BotIntent | null {
  if (data.startsWith("act:")) {
    const act = data.slice(4);
    const map: Record<string, BotIntent> = {
      help: { type: "help" },
      pronosticos: { type: "x_forecasts", force: true },
      cuadrangulares: { type: "x_phase_probs", force: true },
      conmebol: { type: "x_conmebol", force: true },
      argentina: { type: "x_argentina", force: true },
      playoffs_ar: { type: "x_argentina_phase", force: true },
    };
    return map[act] ?? null;
  }
  const prefixes: Array<[string, BotIntent["type"]]> = [
    ["xap:approve:", "xap_approve"],
    ["xap:reject:", "xap_reject"],
    ["xa:approve:", "xa_approve"],
    ["xa:reject:", "xa_reject"],
    ["xp:approve:", "xp_approve"],
    ["xp:reject:", "xp_reject"],
    ["xc:approve:", "xc_approve"],
    ["xc:reject:", "xc_reject"],
    ["x:approve:", "x_approve"],
    ["x:reject:", "x_reject"],
  ];
  for (const [prefix, type] of prefixes) {
    if (data.startsWith(prefix)) {
      const dayKey = data.slice(prefix.length);
      return dayKey ? ({ type, dayKey } as BotIntent) : null;
    }
  }
  return null;
}
