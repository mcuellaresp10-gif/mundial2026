import { translateTeamName } from "@/utils/teamNames";

/** Handles oficiales de X, sin @. Clave = nombre normalizado. */
const HANDLES_BY_NAME: Record<string, string> = {
  // BetPlay
  millonarios: "MillosFCoficial",
  "atletico nacional": "Nacionaloficial",
  "independiente medellin": "DIMOficial",
  "america de cali": "AmericadeCali",
  "deportivo cali": "DeportivoCali",
  junior: "JuniorClubSA",
  "independiente santa fe": "IndependSantaFe",
  "santa fe": "IndependSantaFe",
  "deportes tolima": "CDTolima",
  tolima: "CDTolima",
  "once caldas": "oncecaldas",
  "atletico bucaramanga": "CDABOficial",
  bucaramanga: "CDABOficial",
  "aguilas doradas": "AguilasDoradasR",
  "deportivo pasto": "DeporPasto",
  envigado: "EnvigadoFutbolC",
  "la equidad": "Equidadfutbol",
  "boyaca chico": "BoyacaChicoFC",
  "alianza fc": "AlianzaFCSde",
  "alianza petrolera": "AlianzaFCSde",
  "fortaleza ceif": "FortalezaCEIF",
  "fortaleza fc": "FortalezaCEIF",
  llaneros: "LlanerosFC",
  "union magdalena": "UnionMagdalena",
  jaguares: "JaguaresDeCordo",
  "deportivo pereira": "DeportivoPereir",
  pereira: "DeportivoPereir",

  // Argentina
  boca: "BocaJrsOficial",
  "boca juniors": "BocaJrsOficial",
  "river plate": "RiverPlate",
  river: "RiverPlate",
  racing: "RacingClub",
  "racing club": "RacingClub",
  independiente: "Independiente",
  "san lorenzo": "SanLorenzo",
  velez: "Velez",
  "velez sarsfield": "Velez",
  estudiantes: "EstudiantesdeLP",
  "estudiantes de la plata": "EstudiantesdeLP",
  gimnasia: "GELPoficial",
  "gimnasia la plata": "GELPoficial",
  "gimnasia y esgrima": "GELPoficial",
  "rosario central": "RosarioCentral",
  "newells old boys": "Newells",
  newells: "Newells",
  lanus: "Clublanus",
  banfield: "CABanfield",
  "argentinos juniors": "AAAJoficial",
  argentinos: "AAAJoficial",
  "defensa y justicia": "DefensaJOficial",
  defensa: "DefensaJOficial",
  huracan: "CAHuracan",
  belgrano: "Belgrano",
  instituto: "InstitutoACC",
  talleres: "CATalleresdecba",
  "talleres de cordoba": "CATalleresdecba",
  "godoy cruz": "GodoyCruzCAof",
  platense: "CAP_Argentina",
  tigre: "CATigreOficial",
  union: "ClubAUnion",
  "union de santa fe": "ClubAUnion",
  sarmiento: "CASarmiento",
  "barracas central": "BarracasCentral",
  "independiente rivadavia": "CAIRivadavia",
  "central cordoba": "CACentralCba",
  "atletico tucuman": "ATOficial",
  aldosivi: "CAAldosivi",
  "deportivo riestra": "DepRiestra",

  // Brasil
  flamengo: "Flamengo",
  palmeiras: "Palmeiras",
  corinthians: "Corinthians",
  "sao paulo": "SaoPauloFC",
  santos: "SantosFC",
  vasco: "Vasco",
  "vasco da gama": "Vasco",
  fluminense: "FluminenseFC",
  botafogo: "Botafogo",
  gremio: "Gremio",
  internacional: "SCInternacional",
  "atletico mineiro": "Atletico",
  "atletico mg": "Atletico",
  "athletico paranaense": "Athleticopr",
  "athletico-pr": "Athleticopr",
  cruzeiro: "Cruzeiro",
  bahia: "ECBahia",
  "fortaleza ec": "FortalezaEC",
  bragantino: "RedBullBraga",
  "red bull bragantino": "RedBullBraga",
  cuiaba: "CuiabaEC",
  goias: "GoiasOficial",
  coritiba: "Coritiba",
  ceara: "CearaSC",
  "sport recife": "sportrecife",
  vitoria: "ECVitoria",
  mirassol: "MirassolFC",
  juventude: "ECJuventude",
};

function normalizeName(name: string): string {
  return translateTeamName(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function xHandleForTeam(name: string): string | null {
  const n = normalizeName(name);
  if (HANDLES_BY_NAME[n]) return HANDLES_BY_NAME[n];
  const stripped = n
    .replace(/\b(fc|ec|ca|cf|sc|club)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped && stripped !== n && HANDLES_BY_NAME[stripped]) {
    return HANDLES_BY_NAME[stripped];
  }
  return null;
}

export function formatTeamForTweet(name: string): string {
  const handle = xHandleForTeam(name);
  return handle ? `@${handle}` : translateTeamName(name);
}

export function missingXHandleNames(names: string[]): string[] {
  const missing: string[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    if (xHandleForTeam(name)) continue;
    const label = translateTeamName(name);
    if (seen.has(label)) continue;
    seen.add(label);
    missing.push(label);
  }
  return missing;
}
