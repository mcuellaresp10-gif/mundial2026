import type { AnalysisPlayer, AnalysisPost, AnalysisPre } from "@/types";

export async function fetchPreMatchAnalysis(
  fixtureId: number,
  colombiaMode = false
): Promise<AnalysisPre> {
  const res = await fetch("/api/analysis/pre-match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fixtureId, colombiaMode }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  const data = await res.json();
  return data.analysis as AnalysisPre;
}

export async function fetchPostMatchAnalysis(
  fixtureId: number,
  preContexto?: string
): Promise<AnalysisPost> {
  const res = await fetch("/api/analysis/post-match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fixtureId, preContexto }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  const data = await res.json();
  return data.analysis as AnalysisPost;
}

export async function fetchPlayerAnalysis(playerId: number): Promise<AnalysisPlayer> {
  const res = await fetch("/api/analysis/player", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerId }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  const data = await res.json();
  return data.analysis as AnalysisPlayer;
}

export type { AnalysisPre, AnalysisPost, AnalysisPlayer };
