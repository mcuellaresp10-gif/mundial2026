import type { OnceIdealPlayer } from "@/types";
import { lineupShortName } from "@/utils/lineupPlayerMeta";

export function formatOnceIdealTweet(input: {
  phaseLabel: string;
  formation: string;
  averageRating: number;
  mvpName: string;
}): string {
  const text = [
    `#LigaBetPlay 🔥`,
    ``,
    `Once Ideal · ${input.phaseLabel}`,
    `Formación ${input.formation} · media ${input.averageRating.toFixed(1)}`,
    ``,
    `MVP: ${input.mvpName}`,
    ``,
    `El XI aquí 👇`,
  ].join("\n");
  return text.length > 280 ? text.slice(0, 277) + "…" : text;
}

export function buildOnceIdealThread(input: {
  phaseLabel: string;
  formation: string;
  averageRating: number;
  players: OnceIdealPlayer[];
}): string[] {
  const mvp = [...input.players].sort((a, b) => b.rating - a.rating)[0];
  const header = formatOnceIdealTweet({
    phaseLabel: input.phaseLabel,
    formation: input.formation,
    averageRating: input.averageRating,
    mvpName: mvp ? lineupShortName(mvp.name) : "—",
  });

  // Sin club: 11 líneas caben en 280; el club va en la imagen.
  const lines = input.players.map(
    (p) => `${p.position} · ${lineupShortName(p.name)} ${p.rating.toFixed(1)}`
  );
  let detail = `Once Ideal ${input.formation}\n\n${lines.join("\n")}`;
  if (detail.length > 280) detail = detail.slice(0, 277) + "…";
  return [header, detail];
}

export function formatTelegramOnceIdealPreview(input: {
  dayKey: string;
  phaseLabel: string;
  formation: string;
  averageRating: number;
  players: OnceIdealPlayer[];
}): string {
  const lines = [
    `📋 *Borrador X — Once Ideal*`,
    `_${input.phaseLabel} · ${input.dayKey}_`,
    "",
    `Formación *${input.formation}* · media *${input.averageRating.toFixed(1)}*`,
    "",
    ...input.players.map(
      (p) =>
        `• *${p.position}* ${lineupShortName(p.name)} (${p.team}) — ${p.rating.toFixed(1)}`
    ),
    "",
    "_Nada se publica en X hasta que apruebes._",
    "_Al publicar se adjunta la imagen del XI._",
  ];
  return lines.join("\n");
}
