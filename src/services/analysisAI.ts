import type { AnalysisPlayer, AnalysisPost, AnalysisPre } from "@/types";

export function buildPreMatchPrompt(context: {
  home: string;
  away: string;
  date: string;
  round: string;
  colombiaMode: boolean;
  h2hSummary?: string;
  homeForm?: string;
  awayForm?: string;
}): string {
  const colombiaNote = context.colombiaMode
    ? "\nIMPORTANTE: Si Colombia participa, incluye una sección 'Colombia Focus' con tono apasionado pero analítico, con claves para ganar y predicción emocional."
    : "";

  return `Eres un analista táctico experto del Mundial FIFA 2026. Genera un análisis PRE-partido en español.

Partido: ${context.home} vs ${context.away}
Fecha: ${context.date}
Fase: ${context.round}
${context.h2hSummary ? `H2H: ${context.h2hSummary}` : ""}
${context.homeForm ? `Forma ${context.home}: ${context.homeForm}` : ""}
${context.awayForm ? `Forma ${context.away}: ${context.awayForm}` : ""}
${colombiaNote}

Responde SOLO con JSON válido con esta estructura:
{
  "contexto": "string",
  "rival": "string",
  "clavesTacticas": ["string", "string", "string"],
  "alineacionProbable": "string",
  "pronostico": "string",
  "colombiaFocus": "string o null"
}`;
}

export function buildPostMatchPrompt(context: {
  home: string;
  away: string;
  score: string;
  events?: string;
  stats?: string;
  preAnalysis?: string;
}): string {
  return `Eres un analista táctico experto del Mundial FIFA 2026. Genera un análisis POST-partido en español.

Partido: ${context.home} vs ${context.away}
Resultado: ${context.score}
${context.events ? `Eventos: ${context.events}` : ""}
${context.stats ? `Estadísticas: ${context.stats}` : ""}
${context.preAnalysis ? `Análisis previo: ${context.preAnalysis}` : ""}

Responde SOLO con JSON válido:
{
  "lecturaTactica": "string",
  "momentosClave": [{"minuto": number, "descripcion": "string"}, ...],
  "jugadorDestacado": {"nombre": "string", "stats": "string", "razon": "string"},
  "comparacionPrevia": "string",
  "impactoGrupo": "string",
  "proyeccion": "string"
}`;
}

export function buildPlayerAnalysisPrompt(context: {
  name: string;
  position: string;
  team: string;
  stats: string;
  age?: number;
}): string {
  return `Eres un analista de selecciones nacionales. Analiza al jugador para el Mundial 2026.

Jugador: ${context.name}
Posición: ${context.position}
Selección: ${context.team}
${context.age ? `Edad: ${context.age}` : ""}
Estadísticas: ${context.stats}

Responde SOLO con JSON válido:
{
  "convocatoria": "string",
  "rolEsperado": "string",
  "fortalezas": ["string", ...],
  "debilidades": ["string", ...],
  "posibleXI": "string",
  "comparativaCompetidores": "string",
  "riesgoOportunidad": "string",
  "historialMundiales": "string o null"
}`;
}

export async function fetchAnalysis<T>(
  type: "pre-match" | "post-match" | "player",
  prompt: string
): Promise<T> {
  const res = await fetch(`/api/analysis/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  const data = await res.json();
  return data.analysis as T;
}

export type { AnalysisPre, AnalysisPost, AnalysisPlayer };
