import type { Context } from "grammy";
import type { BotIntent } from "./intents";
import {
  getFixtureById,
  getStandings,
  getWorldCupFixtures,
} from "@/server/footballClient";
import { answerTelegramQuestion } from "@/server/aiClient";
import { fetchLineupsText, fetchPlayerText, buildRichTelegramContext, tryDirectAnswer } from "./qaService";
import {
  afterActionKeyboard,
  fixtureDetailKeyboard,
  liveFixturesKeyboard,
  mainReplyKeyboard,
  muteLiveKeyboard,
  standingsGroupsKeyboard,
  todayFixturesKeyboard,
  unmuteKeyboard,
} from "./keyboards";
import {
  formatColombiaHub,
  formatDailyDigest,
  formatFixtureDetail,
  formatLiveFixtures,
  formatNextFixture,
  formatStandings,
  splitStandingsMessages,
  formatTeamFixtures,
  formatTodayFixtures,
  HELP_MESSAGE,
  WELCOME_MESSAGE,
} from "./formatters";
import { getFixturesOnLocalDay } from "@/lib/liveRefresh";
import { formatFixtureTeamsLabel } from "@/utils/teamNames";
import {
  getMutedFixtures,
  isFixtureMuted,
  muteFixture,
  unmuteFixture,
} from "./mutedFixtures";

async function withTyping(ctx: Context, fn: () => Promise<void>): Promise<void> {
  await ctx.replyWithChatAction("typing");
  await fn();
}

export async function handleIntent(ctx: Context, intent: BotIntent): Promise<void> {
  const name = ctx.from?.first_name;

  switch (intent.type) {
    case "greet":
    case "help":
      await ctx.reply(intent.type === "help" ? HELP_MESSAGE : WELCOME_MESSAGE(name), {
        parse_mode: "Markdown",
        reply_markup: mainReplyKeyboard(),
      });
      return;

    case "today":
      await withTyping(ctx, async () => {
        const fixtures = await getWorldCupFixtures();
        const today = getFixturesOnLocalDay(fixtures, new Date());
        await ctx.reply(formatTodayFixtures(fixtures), {
          parse_mode: "Markdown",
          reply_markup: today.length > 0 ? todayFixturesKeyboard(today) : afterActionKeyboard(),
        });
      });
      return;

    case "live":
      await withTyping(ctx, async () => {
        const fixtures = await getWorldCupFixtures();
        await ctx.reply(formatLiveFixtures(fixtures), {
          parse_mode: "Markdown",
          reply_markup: liveFixturesKeyboard(fixtures),
        });
      });
      return;

    case "next":
      await withTyping(ctx, async () => {
        const fixtures = await getWorldCupFixtures();
        await ctx.reply(formatNextFixture(fixtures), {
          parse_mode: "Markdown",
          reply_markup: afterActionKeyboard(),
        });
      });
      return;

    case "standings":
      await withTyping(ctx, async () => {
        const standings = await getStandings();
        const parts = splitStandingsMessages(standings, intent.group);
        const kb = intent.group ? afterActionKeyboard() : standingsGroupsKeyboard(standings);
        for (let i = 0; i < parts.length; i++) {
          const header = parts.length > 1 ? `📊 *Tablas* (${i + 1}/${parts.length})\n\n` : "";
          await ctx.reply(header + parts[i], {
            parse_mode: "Markdown",
            reply_markup: i === parts.length - 1 ? kb : undefined,
          });
        }
      });
      return;

    case "colombia":
      await withTyping(ctx, async () => {
        const [fixtures, standings] = await Promise.all([
          getWorldCupFixtures(),
          getStandings(),
        ]);
        await ctx.reply(formatColombiaHub(fixtures, standings), {
          parse_mode: "Markdown",
          reply_markup: afterActionKeyboard(),
        });
      });
      return;

    case "digest":
      await withTyping(ctx, async () => {
        const [fixtures, standings] = await Promise.all([
          getWorldCupFixtures(),
          getStandings(),
        ]);
        await ctx.reply(formatDailyDigest(fixtures, standings), {
          parse_mode: "Markdown",
          reply_markup: afterActionKeyboard(),
        });
      });
      return;

    case "team":
      await withTyping(ctx, async () => {
        const fixtures = await getWorldCupFixtures();
        await ctx.reply(formatTeamFixtures(fixtures, intent.teamKey, intent.teamLabel), {
          parse_mode: "Markdown",
          reply_markup: liveFixturesKeyboard(
            fixtures.filter(
              (f) =>
                f.teams.home.name.toLowerCase().includes(intent.teamKey) ||
                f.teams.away.name.toLowerCase().includes(intent.teamKey)
            )
          ),
        });
      });
      return;

    case "fixture":
      await withTyping(ctx, async () => {
        const fixture = await getFixtureById(intent.id);
        if (!fixture) {
          await ctx.reply(`No encontré el partido #${intent.id}.`, {
            reply_markup: afterActionKeyboard(),
          });
          return;
        }
        await ctx.reply(formatFixtureDetail(fixture), {
          parse_mode: "Markdown",
          reply_markup: fixtureDetailKeyboard(intent.id, isFixtureMuted(intent.id)),
        });
      });
      return;

    case "lineups":
      await withTyping(ctx, async () => {
        const fixtures = await getWorldCupFixtures();
        const text = await fetchLineupsText(fixtures, intent.teamKey);
        await ctx.reply(text ?? "No hay alineaciones disponibles.", {
          parse_mode: "Markdown",
          reply_markup: afterActionKeyboard(),
        });
      });
      return;

    case "player":
      await withTyping(ctx, async () => {
        const text = await fetchPlayerText(intent.query);
        await ctx.reply(text ?? "No encontré al jugador.", {
          parse_mode: "Markdown",
          reply_markup: afterActionKeyboard(),
        });
      });
      return;

    case "mute_menu":
      await withTyping(ctx, async () => {
        const fixtures = await getWorldCupFixtures();
        await ctx.reply(
          "🔕 *Silenciar alertas*\n\nElige un partido en vivo. No recibirás goles ni avisos de ese partido (puedes seguir consultando con /vivo).",
          { parse_mode: "Markdown", reply_markup: muteLiveKeyboard(fixtures) }
        );
      });
      return;

    case "muted_list":
      await withTyping(ctx, async () => {
        const muted = getMutedFixtures();
        if (muted.length === 0) {
          await ctx.reply("🔔 *No tienes partidos silenciados.*\n\nUsa 🔕 Silenciar para mutear uno en vivo.", {
            parse_mode: "Markdown",
            reply_markup: afterActionKeyboard(),
          });
          return;
        }
        const lines = muted.map((m) => `• ${m.label}`).join("\n");
        await ctx.reply(`🔕 *Partidos silenciados*\n\n${lines}\n\nToca 🔔 para reactivar alertas.`, {
          parse_mode: "Markdown",
          reply_markup: unmuteKeyboard(muted),
        });
      });
      return;

    case "mute":
      await withTyping(ctx, async () => {
        const fixture = await getFixtureById(intent.id);
        const label = fixture
          ? formatFixtureTeamsLabel(fixture.teams.home.name, fixture.teams.away.name)
          : `Partido #${intent.id}`;
        muteFixture(intent.id, label);
        await ctx.reply(`🔕 *Silenciado:* ${label}\n\nYa no te avisaré goles ni eventos de este partido.`, {
          parse_mode: "Markdown",
          reply_markup: unmuteKeyboard(getMutedFixtures()),
        });
      });
      return;

    case "unmute":
      await withTyping(ctx, async () => {
        const muted = getMutedFixtures();
        const entry = muted.find((m) => m.id === intent.id);
        unmuteFixture(intent.id);
        await ctx.reply(
          entry
            ? `🔔 *Alertas activadas:* ${entry.label}`
            : `🔔 Alertas activadas para partido #${intent.id}`,
          { parse_mode: "Markdown", reply_markup: afterActionKeyboard() }
        );
      });
      return;

    case "refresh":
      await handleIntent(ctx, { type: "digest" });
      return;

    case "ai":
      await withTyping(ctx, async () => {
        const [fixtures, standings] = await Promise.all([
          getWorldCupFixtures(),
          getStandings(),
        ]);

        const direct = await tryDirectAnswer(intent.question, fixtures);
        if (direct) {
          await ctx.reply(direct.slice(0, 4000), {
            parse_mode: "Markdown",
            reply_markup: afterActionKeyboard(),
          });
          return;
        }

        const context = await buildRichTelegramContext(intent.question, fixtures, standings);
        const answer = await answerTelegramQuestion(intent.question, context);
        await ctx.reply(answer.slice(0, 4000), { reply_markup: afterActionKeyboard() });
      });
      return;
  }
}

export async function answerCallback(ctx: Context, intent: BotIntent): Promise<void> {
  const toast =
    intent.type === "mute"
      ? "Silenciado 🔕"
      : intent.type === "unmute"
        ? "Alertas activadas 🔔"
        : undefined;
  await ctx.answerCallbackQuery(toast ? { text: toast } : undefined);
  if (ctx.callbackQuery?.message) {
    await handleIntent(ctx, intent);
  }
}
