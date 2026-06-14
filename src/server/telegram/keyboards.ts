import { InlineKeyboard, Keyboard } from "grammy";
import type { Fixture, StandingsGroup } from "@/types";
import { translateTeamName } from "@/utils/teamNames";
import { iterateStandingsTables } from "./standingsUtils";
import { isFixtureLive, isPlausibleLiveFixture, isFixtureFinished } from "@/lib/liveRefresh";
import { isFixtureMuted } from "./mutedFixtures";

/** Teclado fijo abajo del chat — siempre visible. */
export function mainReplyKeyboard(): Keyboard {
  return new Keyboard()
    .text("📅 Partidos hoy")
    .text("🔴 En vivo")
    .row()
    .text("📊 Tablas")
    .text("⏭️ Próximo")
    .row()
    .text("🇨🇴 Colombia")
    .text("⚡ Resumen")
    .row()
    .text("❓ Ayuda")
    .text("🔄 Actualizar")
    .row()
    .text("🔕 Silenciar")
    .text("🔔 Silenciados")
    .resized()
    .persistent();
}

export function afterActionKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text("🔄 Actualizar", "act:refresh")
    .text("🔴 En vivo", "act:live")
    .row()
    .text("📅 Hoy", "act:today")
    .text("⚡ Resumen", "act:digest");
}

export function liveFixturesKeyboard(fixtures: Fixture[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  const live = fixtures.filter(
    (f) => isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short)
  );
  live.slice(0, 6).forEach((f, i) => {
    const label = `${translateTeamName(f.teams.home.name)} ${f.goals.home ?? 0}-${f.goals.away ?? 0} ${translateTeamName(f.teams.away.name)}`;
    const short = label.length > 38 ? label.slice(0, 35) + "…" : label;
    if (i > 0 && i % 2 === 0) kb.row();
    kb.text(short, `fx:${f.fixture.id}`);
  });
  if (live.length === 0) {
    kb.text("⏭️ Ver próximo", "act:next");
  } else {
    kb.row().text("🔄 Actualizar marcadores", "act:live");
  }
  return kb;
}

export function standingsGroupsKeyboard(standings: StandingsGroup[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  const groups: string[] = [];
  for (const { letter } of iterateStandingsTables(standings)) {
    if (letter && !groups.includes(letter)) groups.push(letter);
  }
  groups.sort().forEach((letter, i) => {
    if (i > 0 && i % 4 === 0) kb.row();
    kb.text(`Grupo ${letter}`, `grp:${letter}`);
  });
  kb.row().text("📊 Ver todas", "act:standings");
  return kb;
}

export function todayFixturesKeyboard(fixtures: Fixture[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  fixtures.slice(0, 8).forEach((f, i) => {
    const h = translateTeamName(f.teams.home.name);
    const a = translateTeamName(f.teams.away.name);
    const label = `${h} vs ${a}`.slice(0, 32);
    if (i > 0 && i % 2 === 0) kb.row();
    kb.text(label, `fx:${f.fixture.id}`);
  });
  if (fixtures.length > 0) {
    kb.row().text("🔄 Actualizar", "act:today");
  }
  return kb;
}

export function fixtureDetailKeyboard(fixtureId: number, muted = false): InlineKeyboard {
  return new InlineKeyboard()
    .text(muted ? "🔔 Activar alertas" : "🔕 Silenciar", muted ? `unmute:${fixtureId}` : `mute:${fixtureId}`)
    .text("🔄 Actualizar", `fx:${fixtureId}`)
    .row()
    .text("🔴 En vivo", "act:live")
    .text("📅 Hoy", "act:today");
}

export function notificationKeyboard(fixtureId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text("🔕 Silenciar", `mute:${fixtureId}`)
    .text("📋 Detalle", `fx:${fixtureId}`);
}

export function muteLiveKeyboard(fixtures: Fixture[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  const live = fixtures
    .filter((f) => isPlausibleLiveFixture(f) || isFixtureLive(f.fixture.status.short))
    .filter((f) => !isFixtureMuted(f.fixture.id))
    .slice(0, 8);

  live.forEach((f, i) => {
    const h = translateTeamName(f.teams.home.name);
    const a = translateTeamName(f.teams.away.name);
    const label = `🔕 ${h} vs ${a}`.slice(0, 36);
    if (i > 0) kb.row();
    kb.text(label, `mute:${f.fixture.id}`);
  });
  if (live.length === 0) {
    kb.text("😴 Nada en vivo", "act:live");
  }
  kb.row().text("🔔 Ver silenciados", "act:muted_list");
  return kb;
}

export function unmuteKeyboard(muted: { id: number; label: string }[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  muted.slice(0, 10).forEach((m, i) => {
    const label = `🔔 ${m.label}`.slice(0, 36);
    if (i > 0) kb.row();
    kb.text(label, `unmute:${m.id}`);
  });
  if (muted.length === 0) {
    kb.text("🔕 Silenciar un partido", "act:mute_menu");
  }
  return kb;
}

export const BOT_COMMANDS = [
  { command: "start", description: "Menú principal" },
  { command: "hoy", description: "Partidos de hoy" },
  { command: "vivo", description: "Marcadores en vivo" },
  { command: "colombia", description: "Todo sobre Colombia" },
  { command: "tabla", description: "Posiciones por grupo" },
  { command: "resumen", description: "Resumen express del día" },
  { command: "silenciar", description: "Silenciar alertas de un partido" },
  { command: "silenciados", description: "Partidos silenciados" },
] as const;
