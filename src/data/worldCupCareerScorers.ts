/** Goles en Mundiales acumulados antes del torneo 2026 (1930–2022). */
export interface WorldCupCareerScorer {
  name: string;
  country: string;
  goalsBefore2026: number;
  /** Subcadenas normalizadas para emparejar con la API. */
  matchKeys: string[];
}

export const WORLD_CUP_CAREER_SCORERS: WorldCupCareerScorer[] = [
  { name: "Miroslav Klose", country: "Alemania", goalsBefore2026: 16, matchKeys: ["miroslav klose", "klose"] },
  { name: "Ronaldo", country: "Brasil", goalsBefore2026: 15, matchKeys: ["ronaldo", "ronaldo nazario"] },
  { name: "Gerd Müller", country: "Alemania", goalsBefore2026: 14, matchKeys: ["gerd muller", "muller"] },
  { name: "Lionel Messi", country: "Argentina", goalsBefore2026: 13, matchKeys: ["lionel messi", "messi"] },
  { name: "Just Fontaine", country: "Francia", goalsBefore2026: 13, matchKeys: ["just fontaine", "fontaine"] },
  { name: "Pelé", country: "Brasil", goalsBefore2026: 12, matchKeys: ["pele", "pelé"] },
  { name: "Kylian Mbappé", country: "Francia", goalsBefore2026: 12, matchKeys: ["kylian mbappe", "mbappe"] },
  { name: "Jürgen Klinsmann", country: "Alemania", goalsBefore2026: 11, matchKeys: ["jurgen klinsmann", "klinsmann"] },
  { name: "Gabriel Batistuta", country: "Argentina", goalsBefore2026: 10, matchKeys: ["gabriel batistuta", "batistuta"] },
  { name: "Thomas Müller", country: "Alemania", goalsBefore2026: 10, matchKeys: ["thomas muller"] },
  { name: "Teófilo Cubillas", country: "Perú", goalsBefore2026: 10, matchKeys: ["teofilo cubillas", "cubillas"] },
  { name: "Grzegorz Lato", country: "Polonia", goalsBefore2026: 10, matchKeys: ["grzegorz lato", "lato"] },
  { name: "Gary Lineker", country: "Inglaterra", goalsBefore2026: 10, matchKeys: ["gary lineker", "lineker"] },
];

/** Récord histórico oficial hasta Qatar 2022. */
export const ALL_TIME_TOP_SCORER_THROUGH_2022 = {
  name: "Miroslav Klose",
  goals: 16,
  country: "Alemania",
} as const;
