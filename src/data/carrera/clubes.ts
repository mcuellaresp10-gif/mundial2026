import type { Liga, Club } from "./types";

export const LIGAS: Liga[] = [
  {
    id: "liga-betplay",
    nombre: "Liga BetPlay Dimayor",
    pais: "Colombia",
    nivel: "colombia_primera",
  },
  {
    id: "liga-mx",
    nombre: "Liga MX",
    pais: "México",
    nivel: "intermedia",
  },
  {
    id: "brasileirao",
    nombre: "Brasileirão",
    pais: "Brasil",
    nivel: "intermedia",
  },
  {
    id: "liga-profesional-ar",
    nombre: "Liga Profesional",
    pais: "Argentina",
    nivel: "intermedia",
  },
  {
    id: "mls",
    nombre: "MLS",
    pais: "Estados Unidos",
    nivel: "intermedia",
  },
  {
    id: "premier-league",
    nombre: "Premier League",
    pais: "Inglaterra",
    nivel: "grande_europa",
  },
  {
    id: "laliga",
    nombre: "LaLiga",
    pais: "España",
    nivel: "grande_europa",
  },
];

/** Plantilla de referencia Primera A — validar vs temporada vigente si hace falta. */
const BETPLAY_CLUBS: Omit<Club, "ligaId" | "pais" | "nivel">[] = [
  { id: "millonarios", nombre: "Millonarios" },
  { id: "atletico-nacional", nombre: "Atlético Nacional" },
  { id: "santa-fe", nombre: "Independiente Santa Fe" },
  { id: "america-cali", nombre: "América de Cali" },
  { id: "deportivo-cali", nombre: "Deportivo Cali" },
  { id: "junior", nombre: "Junior de Barranquilla" },
  { id: "independiente-medellin", nombre: "Independiente Medellín" },
  { id: "deportes-tolima", nombre: "Deportes Tolima" },
  { id: "once-caldas", nombre: "Once Caldas" },
  { id: "envigado", nombre: "Envigado" },
  { id: "aguilas-doradas", nombre: "Águilas Doradas" },
  { id: "deportivo-pasto", nombre: "Deportivo Pasto" },
  { id: "atletico-bucaramanga", nombre: "Atlético Bucaramanga" },
  { id: "internacional-bogota", nombre: "Internacional de Bogotá" },
  { id: "boyaca-chico", nombre: "Boyacá Chicó" },
  { id: "fortaleza-ceif", nombre: "Fortaleza CEIF" },
  { id: "llaneros", nombre: "Llaneros" },
  { id: "union-magdalena", nombre: "Unión Magdalena" },
];

const MX_CLUBS = [
  { id: "club-america", nombre: "América" },
  { id: "chivas", nombre: "Chivas" },
  { id: "cruz-azul", nombre: "Cruz Azul" },
  { id: "pumas", nombre: "Pumas" },
  { id: "monterrey", nombre: "Monterrey" },
  { id: "tigres", nombre: "Tigres" },
];

const BR_CLUBS = [
  { id: "flamengo", nombre: "Flamengo" },
  { id: "palmeiras", nombre: "Palmeiras" },
  { id: "sao-paulo", nombre: "São Paulo" },
  { id: "corinthians", nombre: "Corinthians" },
  { id: "gremio", nombre: "Grêmio" },
  { id: "internacional", nombre: "Internacional" },
];

const AR_CLUBS = [
  { id: "boca-juniors", nombre: "Boca Juniors" },
  { id: "river-plate", nombre: "River Plate" },
  { id: "racing", nombre: "Racing" },
  { id: "independiente-avellaneda", nombre: "Independiente" },
  { id: "san-lorenzo", nombre: "San Lorenzo" },
];

const MLS_CLUBS = [
  { id: "inter-miami", nombre: "Inter Miami" },
  { id: "la-galaxy", nombre: "LA Galaxy" },
  { id: "lafc", nombre: "LAFC" },
  { id: "seattle-sounders", nombre: "Seattle Sounders" },
  { id: "atlanta-united", nombre: "Atlanta United" },
];

const PL_CLUBS = [
  { id: "manchester-city", nombre: "Manchester City" },
  { id: "manchester-united", nombre: "Manchester United" },
  { id: "liverpool", nombre: "Liverpool" },
  { id: "arsenal", nombre: "Arsenal" },
  { id: "chelsea", nombre: "Chelsea" },
  { id: "tottenham", nombre: "Tottenham" },
  { id: "newcastle", nombre: "Newcastle" },
];

const LALIGA_CLUBS = [
  { id: "real-madrid", nombre: "Real Madrid" },
  { id: "barcelona", nombre: "Barcelona" },
  { id: "atletico-madrid", nombre: "Atlético Madrid" },
  { id: "sevilla", nombre: "Sevilla" },
  { id: "real-sociedad", nombre: "Real Sociedad" },
  { id: "villarreal", nombre: "Villarreal" },
  { id: "athletic-bilbao", nombre: "Athletic Bilbao" },
];

function mapClubs(
  items: { id: string; nombre: string }[],
  ligaId: string,
  pais: string,
  nivel: Club["nivel"]
): Club[] {
  return items.map((c) => ({ ...c, ligaId, pais, nivel }));
}

export const CLUBES: Club[] = [
  ...mapClubs(BETPLAY_CLUBS, "liga-betplay", "Colombia", "colombia_primera"),
  ...mapClubs(MX_CLUBS, "liga-mx", "México", "intermedia"),
  ...mapClubs(BR_CLUBS, "brasileirao", "Brasil", "intermedia"),
  ...mapClubs(AR_CLUBS, "liga-profesional-ar", "Argentina", "intermedia"),
  ...mapClubs(MLS_CLUBS, "mls", "Estados Unidos", "intermedia"),
  ...mapClubs(PL_CLUBS, "premier-league", "Inglaterra", "grande_europa"),
  ...mapClubs(LALIGA_CLUBS, "laliga", "España", "grande_europa"),
];

export function getLigaById(id: string): Liga | undefined {
  return LIGAS.find((l) => l.id === id);
}

export function getClubById(id: string): Club | undefined {
  return CLUBES.find((c) => c.id === id);
}

export function getClubesByLiga(ligaId: string): Club[] {
  return CLUBES.filter((c) => c.ligaId === ligaId);
}

export function getClubesBetPlay(): Club[] {
  return getClubesByLiga("liga-betplay");
}

export function getClubesByNivel(nivel: Club["nivel"]): Club[] {
  return CLUBES.filter((c) => c.nivel === nivel);
}
