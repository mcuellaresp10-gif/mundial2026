export interface ScoutingStarLabelConfig {
  /** Texto corto en el gráfico. */
  shortLabel: string;
  /** Coincidencia flexible sobre el nombre API (sin acentos, minúsculas). */
  matchKeys: string[];
  /** ID API-Football cuando se conoce (prioritario). */
  playerId?: number;
}

/** Jugadores top del Mundial que siempre muestran etiqueta en el scatter. */
export const SCOUTING_STAR_LABELS: ScoutingStarLabelConfig[] = [
  { shortLabel: "Messi", matchKeys: ["messi"], playerId: 154 },
  { shortLabel: "Mbappé", matchKeys: ["mbappe", "mbapp"] },
  { shortLabel: "Haaland", matchKeys: ["haaland"] },
  { shortLabel: "C. Ronaldo", matchKeys: ["cristiano ronaldo"] },
  { shortLabel: "Kane", matchKeys: ["harry kane", "kane"] },
  { shortLabel: "Bellingham", matchKeys: ["bellingham"] },
  { shortLabel: "Vinícius", matchKeys: ["vinicius", "vinici"] },
  { shortLabel: "Lewandowski", matchKeys: ["lewandowski"] },
  { shortLabel: "Salah", matchKeys: ["salah"] },
  { shortLabel: "Modrić", matchKeys: ["modric", "modri"] },
  { shortLabel: "Yamal", matchKeys: ["yamal"] },
  { shortLabel: "James", matchKeys: ["james rodriguez", "j. rodriguez"] },
  { shortLabel: "Rodri", matchKeys: ["rodri"] },
  { shortLabel: "Musiala", matchKeys: ["musiala"] },
  { shortLabel: "Neymar", matchKeys: ["neymar"] },
  { shortLabel: "Griezmann", matchKeys: ["griezmann"] },
];

export function normalizePlayerLabelName(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveStarLabel(playerId: number, playerName: string): string | null {
  for (const star of SCOUTING_STAR_LABELS) {
    if (star.playerId != null && star.playerId === playerId) {
      return star.shortLabel;
    }
  }

  const normalized = normalizePlayerLabelName(playerName);
  for (const star of SCOUTING_STAR_LABELS) {
    if (star.matchKeys.some((key) => normalized.includes(key))) {
      return star.shortLabel;
    }
  }

  return null;
}

export function isStarLabelPlayer(playerId: number, playerName: string): boolean {
  return resolveStarLabel(playerId, playerName) != null;
}
