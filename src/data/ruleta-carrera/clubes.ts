import { getClubesBetPlay, getClubesByLiga, CLUBES } from "@/data/carrera/clubes";
import type { OpcionRuleta, Region, TituloNacional, CopaContinental } from "./types";

export interface ClubRuleta {
  id: string;
  nombre: string;
  region: Region;
  ligaNombre: string;
  /** 1–5: afecta probabilidad de títulos. */
  prestigio: number;
}

const PRESTIGIO_COL: Record<string, number> = {
  millonarios: 5,
  "atletico-nacional": 5,
  "santa-fe": 4,
  "america-cali": 4,
  junior: 4,
  "independiente-medellin": 4,
  "deportivo-cali": 3,
  "deportes-tolima": 3,
  "once-caldas": 3,
  "atletico-bucaramanga": 2,
  "aguilas-doradas": 2,
  envigado: 2,
  "deportivo-pasto": 2,
  "internacional-bogota": 2,
  "boyaca-chico": 1,
  "fortaleza-ceif": 1,
  llaneros: 1,
  "union-magdalena": 1,
};

const EXTRA_SUD: ClubRuleta[] = [
  {
    id: "penarol",
    nombre: "Peñarol",
    region: "sudamerica",
    ligaNombre: "Primera División (URU)",
    prestigio: 4,
  },
  {
    id: "nacional-uru",
    nombre: "Nacional (URU)",
    region: "sudamerica",
    ligaNombre: "Primera División (URU)",
    prestigio: 4,
  },
  {
    id: "colo-colo",
    nombre: "Colo-Colo",
    region: "sudamerica",
    ligaNombre: "Primera División (CHI)",
    prestigio: 4,
  },
  {
    id: "universidad-chile",
    nombre: "Universidad de Chile",
    region: "sudamerica",
    ligaNombre: "Primera División (CHI)",
    prestigio: 3,
  },
  {
    id: "cerro-porteno",
    nombre: "Cerro Porteño",
    region: "sudamerica",
    ligaNombre: "Primera División (PAR)",
    prestigio: 3,
  },
  {
    id: "olimpia-par",
    nombre: "Olimpia",
    region: "sudamerica",
    ligaNombre: "Primera División (PAR)",
    prestigio: 4,
  },
];

const EXTRA_EUR: ClubRuleta[] = [
  {
    id: "inter",
    nombre: "Inter",
    region: "europa",
    ligaNombre: "Serie A",
    prestigio: 5,
  },
  {
    id: "milan",
    nombre: "Milan",
    region: "europa",
    ligaNombre: "Serie A",
    prestigio: 5,
  },
  {
    id: "juventus",
    nombre: "Juventus",
    region: "europa",
    ligaNombre: "Serie A",
    prestigio: 5,
  },
  {
    id: "napoli",
    nombre: "Napoli",
    region: "europa",
    ligaNombre: "Serie A",
    prestigio: 4,
  },
  {
    id: "bayern",
    nombre: "Bayern Múnich",
    region: "europa",
    ligaNombre: "Bundesliga",
    prestigio: 5,
  },
  {
    id: "dortmund",
    nombre: "Borussia Dortmund",
    region: "europa",
    ligaNombre: "Bundesliga",
    prestigio: 4,
  },
  {
    id: "psg",
    nombre: "PSG",
    region: "europa",
    ligaNombre: "Ligue 1",
    prestigio: 5,
  },
  {
    id: "ajax",
    nombre: "Ajax",
    region: "europa",
    ligaNombre: "Eredivisie",
    prestigio: 4,
  },
  {
    id: "porto",
    nombre: "Porto",
    region: "europa",
    ligaNombre: "Primeira Liga",
    prestigio: 4,
  },
  {
    id: "benfica",
    nombre: "Benfica",
    region: "europa",
    ligaNombre: "Primeira Liga",
    prestigio: 4,
  },
];

const ASIA_CLUBS: ClubRuleta[] = [
  {
    id: "al-hilal",
    nombre: "Al Hilal",
    region: "asia",
    ligaNombre: "Saudi Pro League",
    prestigio: 5,
  },
  {
    id: "al-nassr",
    nombre: "Al Nassr",
    region: "asia",
    ligaNombre: "Saudi Pro League",
    prestigio: 5,
  },
  {
    id: "al-ahli",
    nombre: "Al Ahli",
    region: "asia",
    ligaNombre: "Saudi Pro League",
    prestigio: 4,
  },
  {
    id: "al-ittihad",
    nombre: "Al Ittihad",
    region: "asia",
    ligaNombre: "Saudi Pro League",
    prestigio: 4,
  },
  {
    id: "kawasaki",
    nombre: "Kawasaki Frontale",
    region: "asia",
    ligaNombre: "J-League",
    prestigio: 3,
  },
  {
    id: "urawa",
    nombre: "Urawa Red Diamonds",
    region: "asia",
    ligaNombre: "J-League",
    prestigio: 3,
  },
  {
    id: "yokohama",
    nombre: "Yokohama F. Marinos",
    region: "asia",
    ligaNombre: "J-League",
    prestigio: 3,
  },
  {
    id: "ulsan",
    nombre: "Ulsan HD",
    region: "asia",
    ligaNombre: "K-League",
    prestigio: 3,
  },
  {
    id: "jeonbuk",
    nombre: "Jeonbuk Hyundai",
    region: "asia",
    ligaNombre: "K-League",
    prestigio: 3,
  },
];

function fromCarrera(
  ligaIds: string[],
  region: Region,
  ligaNombre: string,
  prestigioFn: (id: string) => number
): ClubRuleta[] {
  return ligaIds.flatMap((ligaId) =>
    getClubesByLiga(ligaId).map((c) => ({
      id: c.id,
      nombre: c.nombre,
      region,
      ligaNombre,
      prestigio: prestigioFn(c.id),
    }))
  );
}

export function clubesPorRegion(region: Region): ClubRuleta[] {
  switch (region) {
    case "colombia":
      return getClubesBetPlay().map((c) => ({
        id: c.id,
        nombre: c.nombre,
        region: "colombia",
        ligaNombre: "Liga BetPlay Dimayor",
        prestigio: PRESTIGIO_COL[c.id] ?? 2,
      }));
    case "sudamerica":
      return [
        ...fromCarrera(
          ["brasileirao", "liga-profesional-ar"],
          "sudamerica",
          "Sudamérica",
          (id) =>
            ["flamengo", "palmeiras", "boca-juniors", "river-plate"].includes(id)
              ? 5
              : 4
        ),
        ...EXTRA_SUD,
      ];
    case "europa":
      return [
        ...fromCarrera(["premier-league", "laliga"], "europa", "Europa", (id) =>
          ["real-madrid", "barcelona", "manchester-city", "liverpool"].includes(id)
            ? 5
            : 4
        ),
        ...EXTRA_EUR,
      ];
    case "norteamerica":
      return fromCarrera(
        ["liga-mx", "mls"],
        "norteamerica",
        "MLS / Liga MX",
        (id) =>
          ["club-america", "tigres", "monterrey", "inter-miami"].includes(id)
            ? 4
            : 3
      );
    case "asia":
      return ASIA_CLUBS;
  }
}

export function opcionesEquipoDebut(): OpcionRuleta<ClubRuleta>[] {
  return clubesPorRegion("colombia").map((c) => ({
    id: c.id,
    label: c.nombre,
    valor: c,
  }));
}

export function opcionesEquipoRegion(
  region: Region,
  excludeIds: string[]
): OpcionRuleta<ClubRuleta>[] {
  return clubesPorRegion(region)
    .filter((c) => !excludeIds.includes(c.id))
    .map((c) => ({
      id: c.id,
      label: c.nombre,
      valor: c,
    }));
}

export function opcionesTituloNacional(
  prestigio: number
): OpcionRuleta<TituloNacional>[] {
  const p = Math.min(5, Math.max(1, prestigio));
  return [
    {
      id: "ninguno",
      label: "No ganó nada",
      valor: "ninguno",
      peso: 8 - p,
    },
    {
      id: "campeon",
      label: "Campeón 1 vez",
      valor: "campeon",
      peso: p,
    },
    {
      id: "bi",
      label: "Bicampeón o más",
      valor: "bicampeon_o_mas",
      peso: Math.max(1, p - 2),
    },
  ];
}

export function opcionesCopaContinental(
  region: Region,
  prestigio: number
): OpcionRuleta<CopaContinental>[] {
  const p = Math.min(5, Math.max(1, prestigio));
  if (region === "colombia" || region === "sudamerica") {
    return [
      { id: "nada", label: "No clasificó / no jugó", valor: "ninguna", peso: 5 },
      {
        id: "sud-sin",
        label: "Jugó Sudamericana sin título",
        valor: "jugo_sudamericana",
        peso: 3,
      },
      {
        id: "sud-cam",
        label: "Campeón Sudamericana",
        valor: "campeon_sudamericana",
        peso: Math.max(1, p - 2),
      },
      {
        id: "lib-sin",
        label: "Jugó Libertadores sin título",
        valor: "jugo_libertadores",
        peso: 3,
      },
      {
        id: "lib-cam",
        label: "Campeón Libertadores",
        valor: "campeon_libertadores",
        peso: Math.max(1, p - 3),
      },
    ];
  }
  if (region === "europa") {
    return [
      { id: "nada", label: "No jugó copas europeas", valor: "ninguna", peso: 4 },
      {
        id: "el-sin",
        label: "Jugó Europa League sin título",
        valor: "jugo_europa_league",
        peso: 3,
      },
      {
        id: "el-cam",
        label: "Campeón Europa League",
        valor: "campeon_europa_league",
        peso: Math.max(1, p - 2),
      },
      {
        id: "ucl-sin",
        label: "Jugó Champions sin título",
        valor: "jugo_champions",
        peso: 3,
      },
      {
        id: "ucl-cam",
        label: "Campeón Champions",
        valor: "campeon_champions",
        peso: Math.max(1, p - 3),
      },
    ];
  }
  if (region === "norteamerica") {
    return [
      { id: "nada", label: "No clasificó", valor: "ninguna", peso: 4 },
      {
        id: "conc-sin",
        label: "Jugó Concachampions sin título",
        valor: "jugo_concachampions",
        peso: 3,
      },
      {
        id: "conc-cam",
        label: "Campeón Concachampions",
        valor: "campeon_concachampions",
        peso: Math.max(1, p - 1),
      },
    ];
  }
  return [
    { id: "nada", label: "No clasificó", valor: "ninguna", peso: 4 },
    {
      id: "acl-sin",
      label: "Jugó Champions Asia sin título",
      valor: "jugo_acl",
      peso: 3,
    },
    {
      id: "acl-cam",
      label: "Campeón Champions Asia",
      valor: "campeon_acl",
      peso: Math.max(1, p - 1),
    },
  ];
}

export function labelCopa(c: CopaContinental): string {
  const map: Record<CopaContinental, string> = {
    ninguna: "no jugó copas continentales",
    jugo_sin_titulo: "jugó copa continental sin título",
    campeon: "fue campeón continental",
    finalista: "fue finalista continental",
    jugo_sudamericana: "jugó la Sudamericana sin título",
    campeon_sudamericana: "fue campeón de la Sudamericana",
    jugo_libertadores: "jugó la Libertadores sin título",
    campeon_libertadores: "fue campeón de la Libertadores",
    jugo_europa_league: "jugó la Europa League sin título",
    campeon_europa_league: "fue campeón de la Europa League",
    jugo_champions: "jugó la Champions sin título",
    campeon_champions: "fue campeón de la Champions",
    jugo_concachampions: "jugó la Concachampions sin título",
    campeon_concachampions: "fue campeón de la Concachampions",
    jugo_acl: "jugó la Champions de Asia sin título",
    campeon_acl: "fue campeón de la Champions de Asia",
  };
  return map[c];
}

export function labelTitulo(t: TituloNacional): string {
  if (t === "ninguno") return "no ganó títulos de liga";
  if (t === "campeon") return "fue campeón de liga";
  return "fue bicampeón o más en liga";
}

/** Evita warning unused CLUBES if tree-shaken oddly — used for sanity. */
export function totalClubesCatalogo(): number {
  return CLUBES.length + EXTRA_SUD.length + EXTRA_EUR.length + ASIA_CLUBS.length;
}
