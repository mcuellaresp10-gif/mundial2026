import { translateTeamName } from "@/utils/teamNames";
import type { CuadrangularSemisTeamProbs } from "@/utils/betPlaySeasonSimulation";
import { formatPct1 } from "@/server/x/formatPhaseProbsTweets";

function shortName(name: string): string {
  const t = translateTeamName(name);
  if (/atletico nacional/i.test(t)) return "Nacional";
  if (/independiente medellin|independiente medellín/i.test(t)) return "Medellín";
  if (/independiente santa fe|santa fe/i.test(t)) return "Santa Fe";
  if (/america de cali|américa de cali/i.test(t)) return "América";
  if (/atletico bucaramanga|atlético bucaramanga/i.test(t)) return "Bucaramanga";
  return t;
}

export function buildCuadrangularesSemisThread(
  groupA: CuadrangularSemisTeamProbs[],
  groupB: CuadrangularSemisTeamProbs[],
  simulations: number
): string[] {
  const favA = groupA[0];
  const favB = groupB[0];
  const title = [...groupA, ...groupB].sort(
    (a, b) => b.probChampion - a.probChampion
  )[0];

  const header = [
    `#LigaBetPlay 🔥`,
    ``,
    `Cuadrangulares Clausura — proyección Monte Carlo (${simulations.toLocaleString("es-CO")} sims)`,
    ``,
    favA && favB
      ? `Final más probable: ${shortName(favA.teamName)} vs ${shortName(favB.teamName)}`
      : `Proyección por grupos A y B`,
    title ? `Favorito al título: ${shortName(title.teamName)} (${formatPct1(title.probChampion)})` : "",
    ``,
    `Las probs aquí 👇`,
  ]
    .filter(Boolean)
    .join("\n");

  const detailA = [
    `Cuadrangular A · % final`,
    ...groupA.map(
      (t, i) =>
        `${i + 1}. ${shortName(t.teamName)} ${formatPct1(t.probFinal)}${t.isSeed ? " · Pto. invisible" : ""}`
    ),
  ].join("\n");

  const detailB = [
    `Cuadrangular B · % final`,
    ...groupB.map(
      (t, i) =>
        `${i + 1}. ${shortName(t.teamName)} ${formatPct1(t.probFinal)}${t.isSeed ? " · Pto. invisible" : ""}`
    ),
  ].join("\n");

  return [header, detailA, detailB].map((t) =>
    t.length > 280 ? t.slice(0, 277) + "…" : t
  );
}

export function formatTelegramCuadrangularesSemisPreview(
  groupA: CuadrangularSemisTeamProbs[],
  groupB: CuadrangularSemisTeamProbs[],
  dayKey: string,
  simulations: number
): string {
  const lines = [
    `📋 *Borrador X — Cuadrangulares semifinales*`,
    `_${dayKey} · ${simulations.toLocaleString("es-CO")} sims_`,
    "",
    "*Grupo A*",
    ...groupA.map(
      (t, i) =>
        `${i + 1}. ${shortName(t.teamName)} — Final ${formatPct1(t.probFinal)} · Título ${formatPct1(t.probChampion)}${t.isSeed ? " · ⭐" : ""}`
    ),
    "",
    "*Grupo B*",
    ...groupB.map(
      (t, i) =>
        `${i + 1}. ${shortName(t.teamName)} — Final ${formatPct1(t.probFinal)} · Título ${formatPct1(t.probChampion)}${t.isSeed ? " · ⭐" : ""}`
    ),
    "",
    "_Nada se publica en X hasta que apruebes._",
    "_Al publicar se adjunta la imagen A/B._",
  ];
  return lines.join("\n");
}
