import type { HistoricoMundial } from "@/types";

export interface WorldCupEdition extends HistoricoMundial {
  runnerUp: string;
}

export interface WorldCupRecords {
  mostTitles: { country: string; titles: number }[];
  allTimeTopScorer: { name: string; goals: number; country: string };
  biggestWin: { score: string; match: string; year: number };
  mostGoalsInEdition: { year: number; goals: number };
  mostTeams: { year: number; teams: number };
  notes: string[];
}

function ed(
  year: number,
  host: string,
  champion: string,
  championFlag: string,
  runnerUp: string,
  finalScore: string,
  topScorer: { name: string; goals: number; country: string },
  goldenBall: string,
  totalGoals: number,
  totalMatches: number,
  memorableMatches: { description: string; score: string }[],
  curiosities: string[]
): WorldCupEdition {
  return {
    year,
    host,
    champion,
    championFlag,
    runnerUp,
    finalScore,
    topScorer,
    goldenBall,
    totalGoals,
    totalMatches,
    groups: [],
    memorableMatches,
    curiosities,
  };
}

/** Ediciones del Mundial 1930–2022 (fuente única para UI histórico y agente). */
export const WORLD_CUP_EDITIONS: Record<number, WorldCupEdition> = {
  2022: ed(2022, "Qatar", "Argentina", "🇦🇷", "Francia", "Argentina 3-3 Francia (4-2 pen)", { name: "Kylian Mbappé", goals: 8, country: "Francia" }, "Lionel Messi", 172, 64, [{ description: "Final épica Argentina vs Francia", score: "3-3 (4-2 pen)" }, { description: "Marruecos histórico semifinalista", score: "N/A" }], ["Primer Mundial en invierno (nov-dic)", "Messi ganó su primer Mundial", "Mbappé hat-trick en la final"]),
  2018: ed(2018, "Rusia", "Francia", "🇫🇷", "Croacia", "Francia 4-2 Croacia", { name: "Harry Kane", goals: 6, country: "Inglaterra" }, "Luka Modrić", 169, 64, [{ description: "Francia campeona con jóvenes estrellas", score: "4-2" }, { description: "Croacia primera final", score: "N/A" }], ["VAR utilizado por primera vez", "Croacia llegó a su primera final", "Mbappé debutó como estrella mundial"]),
  2014: ed(2014, "Brasil", "Alemania", "🇩🇪", "Argentina", "Alemania 1-0 Argentina", { name: "James Rodríguez", goals: 6, country: "Colombia" }, "Lionel Messi", 171, 64, [{ description: "Alemania 7-1 Brasil semifinal", score: "7-1" }, { description: "Gol de Götze en la final", score: "1-0" }], ["James Rodríguez ganó la Bota de Oro", "Colombia llegó a cuartos", "Mayor goleada semifinalista: 7-1"]),
  2010: ed(2010, "Sudáfrica", "España", "🇪🇸", "Países Bajos", "España 1-0 Países Bajos", { name: "Thomas Müller", goals: 5, country: "Alemania" }, "Diego Forlán", 145, 64, [{ description: "España campeona mundial", score: "1-0" }, { description: "Uruguay semifinalista", score: "N/A" }], ["Primer Mundial en África", "España primer campeón europeo fuera de Europa", "Vuvuzelas marcaron el torneo"]),
  2006: ed(2006, "Alemania", "Italia", "🇮🇹", "Francia", "Italia 1-1 Francia (5-3 pen)", { name: "Miroslav Klose", goals: 5, country: "Alemania" }, "Zinedine Zidane", 147, 64, [{ description: "Final con expulsión de Zidane", score: "1-1 (5-3 pen)" }, { description: "Alemania 4-2 Argentina cuartos", score: "4-2 pen" }], ["Zidane cabezazo a Materazzi en la final", "Italia cuarto título", "Torneo de 32 equipos desde 1998"]),
  2002: ed(2002, "Corea del Sur / Japón", "Brasil", "🇧🇷", "Alemania", "Brasil 2-0 Alemania", { name: "Ronaldo", goals: 8, country: "Brasil" }, "Oliver Kahn", 161, 64, [{ description: "Brasil quinto título", score: "2-0" }, { description: "Corea del Sur semifinalista", score: "N/A" }], ["Primer Mundial en Asia", "Ronaldo regresa tras lesiones", "Corea del Sur llegó a semis"]),
  1998: ed(1998, "Francia", "Francia", "🇫🇷", "Brasil", "Francia 3-0 Brasil", { name: "Davor Šuker", goals: 6, country: "Croacia" }, "Ronaldo", 171, 64, [{ description: "Francia primer título en casa", score: "3-0" }, { description: "Croacia tercer lugar", score: "N/A" }], ["Expansión a 32 equipos", "Zidane dos goles de cabeza en la final", "Mystery illness de Ronaldo antes de la final"]),
  1994: ed(1994, "Estados Unidos", "Brasil", "🇧🇷", "Italia", "Brasil 0-0 Italia (3-2 pen)", { name: "Hristo Stoichkov / Oleg Salenko", goals: 6, country: "Bulgaria / Rusia" }, "Romário", 141, 52, [{ description: "Final definida por penales", score: "0-0 (3-2 pen)" }, { description: "Baggio erra el último penal", score: "N/A" }], ["Salenko 5 goles vs Camerún (récord partido)", "Primera final 0-0", "Estados Unidos como sede"]),
  1990: ed(1990, "Italia", "Alemania Occidental", "🇩🇪", "Argentina", "Alemania 1-0 Argentina", { name: "Salvatore Schillaci", goals: 6, country: "Italia" }, "Salvatore Schillaci", 115, 52, [{ description: "Alemania campeona", score: "1-0" }, { description: "Cameroon llega a cuartos", score: "N/A" }], ["Torneo más defensivo de la historia", "Schillaci sensación italiana", "Reunificación alemana simbólica"]),
  1986: ed(1986, "México", "Argentina", "🇦🇷", "Alemania Occidental", "Argentina 3-2 Alemania", { name: "Gary Lineker", goals: 6, country: "Inglaterra" }, "Diego Maradona", 132, 52, [{ description: "Mano de Dios y Gol del Siglo vs Inglaterra", score: "2-1" }, { description: "Final Argentina 3-2 Alemania", score: "3-2" }], ["Maradona llevó a Argentina al título", "México sede tras retiro de Colombia", "Lineker máximo goleador"]),
  1982: ed(1982, "España", "Italia", "🇮🇹", "Alemania Occidental", "Italia 3-1 Alemania", { name: "Paolo Rossi", goals: 6, country: "Italia" }, "Paolo Rossi", 146, 52, [{ description: "Italia campeona tras escándalo", score: "3-1" }, { description: "Brasil eliminado por Italia", score: "3-2" }], ["Rossi regresa tras sanción", "Primera fase con 24 equipos", "Brasil considerado mejor equipo sin título"]),
  1978: ed(1978, "Argentina", "Argentina", "🇦🇷", "Países Bajos", "Argentina 3-1 Países Bajos", { name: "Mario Kempes", goals: 6, country: "Argentina" }, "Mario Kempes", 102, 38, [{ description: "Argentina campeona en casa", score: "3-1" }, { description: "Kempes figura del torneo", score: "N/A" }], ["Kempes balón de oro y bota", "Controversia partido Perú vs Argentina", "Países Bajos segunda final consecutiva"]),
  1974: ed(1974, "Alemania Occidental", "Alemania Occidental", "🇩🇪", "Países Bajos", "Alemania 2-1 Países Bajos", { name: "Grzegorz Lato", goals: 7, country: "Polonia" }, "Johan Cruyff", 97, 38, [{ description: "Total Football holandés vs Alemania", score: "2-1" }, { description: "Polonia tercer lugar", score: "N/A" }], ["Cruyff y el fútbol total", "Primera copa con el nombre FIFA World Cup", "Alemania campeona en casa"]),
  1970: ed(1970, "México", "Brasil", "🇧🇷", "Italia", "Brasil 4-1 Italia", { name: "Gerd Müller", goals: 10, country: "Alemania Occidental" }, "Pelé", 95, 32, [{ description: "Brasil tricampeón", score: "4-1" }, { description: "Italia finalista", score: "N/A" }], ["Pelé tercer título", "Müller 10 goles en un torneo", "Considerado el mejor Brasil de la historia"]),
  1966: ed(1966, "Inglaterra", "Inglaterra", "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Alemania Occidental", "Inglaterra 4-2 Alemania", { name: "Eusébio", goals: 9, country: "Portugal" }, "Bobby Charlton", 89, 32, [{ description: "Gol de Hurst ¿entró la pelota?", score: "4-2" }, { description: "Portugal tercer lugar con Eusébio", score: "N/A" }], ["Inglaterra único título", "Eusébio 9 goles", "Primera transmisión a color en Inglaterra"]),
  1962: ed(1962, "Chile", "Brasil", "🇧🇷", "Checoslovaquia", "Brasil 3-1 Checoslovaquia", { name: "Garrincha / Vavá / Flórián Albert / Valentin Ivanov", goals: 4, country: "Varios" }, "Garrincha", 89, 32, [{ description: "Brasil bicampeón sin Pelé lesionado", score: "3-1" }, { description: "Chile organiza tras terremoto", score: "N/A" }], ["Garrincha figura absoluta", "Chile sede tras terremoto de 1960", "Pelé lesionado en el grupo"]),
  1958: ed(1958, "Suecia", "Brasil", "🇧🇷", "Suecia", "Brasil 5-2 Suecia", { name: "Just Fontaine", goals: 13, country: "Francia" }, "Didi", 126, 35, [{ description: "Brasil primer título", score: "5-2" }, { description: "Pelé 17 años marca en semis y final", score: "N/A" }], ["Fontaine 13 goles (récord torneo)", "Debut de Pelé en Mundiales", "Brasil revoluciona el fútbol"]),
  1954: ed(1954, "Suiza", "Alemania Occidental", "🇩🇪", "Hungría", "Alemania 3-2 Hungría", { name: "Sándor Kocsis", goals: 11, country: "Hungría" }, "N/A", 140, 26, [{ description: "Milagro de Berna", score: "3-2" }, { description: "Hungría favorita invicta en racha", score: "N/A" }], ["Hungría llegaba con 32 partidos invicta", "Alemania primer título", "Final en Berna"]),
  1950: ed(1950, "Brasil", "Uruguay", "🇺🇾", "Brasil", "Uruguay 2-1 Brasil", { name: "Ademir", goals: 9, country: "Brasil" }, "N/A", 88, 22, [{ description: "Maracanazo", score: "2-1" }, { description: "Brasil solo necesitaba empatar", score: "N/A" }], ["Sin final formal: grupo final de 4", "Maracanazo silenció el Maracaná", "Uruguay segundo título"]),
  1938: ed(1938, "Francia", "Italia", "🇮🇹", "Hungría", "Italia 4-2 Hungría", { name: "Leônidas", goals: 7, country: "Brasil" }, "N/A", 84, 18, [{ description: "Italia bicampeona", score: "4-2" }, { description: "Brasil viajó sin europeos", score: "N/A" }], ["Italia retiene el título", "Europa al borde de la guerra", "Leônidas goleador"]),
  1934: ed(1934, "Italia", "Italia", "🇮🇹", "Checoslovaquia", "Italia 2-1 Checoslovaquia", { name: "Oldřich Nejedlý", goals: 5, country: "Checoslovaquia" }, "N/A", 70, 17, [{ description: "Italia campeona en casa", score: "2-1" }, { description: "Formato eliminación directa", score: "N/A" }], ["Primera copa en Europa", "Mussolini usó el torneo políticamente", "Eliminación directa desde octavos"]),
  1930: ed(1930, "Uruguay", "Uruguay", "🇺🇾", "Argentina", "Uruguay 4-2 Argentina", { name: "Guillermo Stábile", goals: 8, country: "Argentina" }, "N/A", 70, 18, [{ description: "Primera final del mundo", score: "4-2" }, { description: "Uruguay anfitrión y campeón", score: "N/A" }], ["Primer Mundial de la historia", "Solo 13 equipos participaron", "Uruguay celebró centenario de su independencia"]),
};

export const WORLD_CUP_RECORDS: WorldCupRecords = {
  mostTitles: [
    { country: "Brasil", titles: 5 },
    { country: "Alemania", titles: 4 },
    { country: "Italia", titles: 4 },
    { country: "Argentina", titles: 3 },
    { country: "Francia", titles: 2 },
    { country: "Uruguay", titles: 2 },
  ],
  allTimeTopScorer: { name: "Miroslav Klose", goals: 16, country: "Alemania" },
  biggestWin: { score: "10-1", match: "Hungría vs El Salvador", year: 1982 },
  mostGoalsInEdition: { year: 1998, goals: 171 },
  mostTeams: { year: 2026, teams: 48 },
  notes: [
    "Just Fontaine (1958) tiene el récord de goles en un solo Mundial: 13.",
    "Miroslav Klose es el máximo goleador histórico en Mundiales con 16 goles.",
    "Brasil es la única selección presente en todos los Mundiales.",
    "El Mundial 2026 será el primero con 48 equipos (EE.UU., México, Canadá).",
  ],
};

/** Años con pestaña en la UI de histórico. */
export const WORLD_CUP_UI_YEARS = [2022, 2018, 2014, 2010] as const;

export function getEditionSummary(year: number): WorldCupEdition | null {
  return WORLD_CUP_EDITIONS[year] ?? null;
}

export function getAllEditionYears(): number[] {
  return Object.keys(WORLD_CUP_EDITIONS)
    .map(Number)
    .sort((a, b) => b - a);
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Busca ediciones por país, año, jugador o palabra clave. */
export function searchHistory(query: string): WorldCupEdition[] {
  const q = normalize(query);
  if (!q) return [];

  const yearMatch = q.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    const year = Number(yearMatch[0]);
    const ed = WORLD_CUP_EDITIONS[year];
    return ed ? [ed] : [];
  }

  const results: WorldCupEdition[] = [];
  for (const edition of Object.values(WORLD_CUP_EDITIONS)) {
    const haystack = normalize(
      [
        edition.year,
        edition.host,
        edition.champion,
        edition.runnerUp,
        edition.goldenBall,
        edition.topScorer.name,
        edition.topScorer.country,
        ...edition.curiosities,
        ...edition.memorableMatches.map((m) => m.description),
      ].join(" ")
    );
    if (haystack.includes(q)) results.push(edition);
  }
  return results.sort((a, b) => b.year - a.year);
}

function formatEditionBlock(e: WorldCupEdition): string {
  return [
    `Mundial ${e.year} (${e.host})`,
    `Campeón: ${e.champion} | Subcampeón: ${e.runnerUp}`,
    `Final: ${e.finalScore}`,
    `Bota de Oro: ${e.topScorer.name} (${e.topScorer.goals} goles, ${e.topScorer.country})`,
    `Balón de Oro: ${e.goldenBall}`,
    `Goles totales: ${e.totalGoals} en ${e.totalMatches} partidos`,
    `Partidos memorables: ${e.memorableMatches.map((m) => `${m.description} (${m.score})`).join("; ")}`,
    `Curiosidades: ${e.curiosities.join("; ")}`,
  ].join("\n");
}

export interface HistoryContextHints {
  wantsHistory?: boolean;
  historyYear?: number;
  wantsRecords?: boolean;
  searchQuery?: string;
}

export function formatHistoryContext(hints: HistoryContextHints): string {
  const parts: string[] = [];

  if (hints.wantsRecords) {
    parts.push(
      "RÉCORDS HISTÓRICOS:",
      `Más títulos: ${WORLD_CUP_RECORDS.mostTitles.map((t) => `${t.country} (${t.titles})`).join(", ")}`,
      `Máximo goleador histórico: ${WORLD_CUP_RECORDS.allTimeTopScorer.name} (${WORLD_CUP_RECORDS.allTimeTopScorer.goals} goles, ${WORLD_CUP_RECORDS.allTimeTopScorer.country})`,
      `Mayor goleada: ${WORLD_CUP_RECORDS.biggestWin.match} ${WORLD_CUP_RECORDS.biggestWin.score} (${WORLD_CUP_RECORDS.biggestWin.year})`,
      `Edición con más goles: ${WORLD_CUP_RECORDS.mostGoalsInEdition.year} (${WORLD_CUP_RECORDS.mostGoalsInEdition.goals})`,
      WORLD_CUP_RECORDS.notes.join("\n")
    );
  }

  if (hints.historyYear) {
    const ed = getEditionSummary(hints.historyYear);
    if (ed) parts.push("EDICIÓN SOLICITADA:\n" + formatEditionBlock(ed));
  }

  if (hints.searchQuery) {
    const hits = searchHistory(hints.searchQuery);
    if (hits.length > 0) {
      parts.push(
        "EDICIONES RELACIONADAS:",
        hits
          .slice(0, 4)
          .map(formatEditionBlock)
          .join("\n\n")
      );
    }
  }

  if (hints.wantsHistory && !hints.historyYear && !hints.searchQuery) {
    const recent = [2022, 2018, 2014, 2010, 2006, 2002]
      .map((y) => WORLD_CUP_EDITIONS[y])
      .filter(Boolean);
    parts.push(
      "RESUMEN MUNDIALES RECIENTES:",
      recent.map(formatEditionBlock).join("\n\n")
    );
  }

  return parts.join("\n\n");
}

/** Mapa compatible con HistoricoMundialView (sin runnerUp en UI). */
export function getHistoricoForUI(): Record<number, HistoricoMundial> {
  const out: Record<number, HistoricoMundial> = {};
  for (const year of WORLD_CUP_UI_YEARS) {
    const e = WORLD_CUP_EDITIONS[year];
    if (e) {
      const { runnerUp: _omit, ...rest } = e;
      void _omit;
      out[year] = rest;
    }
  }
  return out;
}
