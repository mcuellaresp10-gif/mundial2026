/**
 * Obtiene tu TELEGRAM_CHAT_ID desde mensajes recientes al bot.
 *
 * 1. Abre tu bot en Telegram y envía /start (o cualquier mensaje)
 * 2. Ejecuta: npm run telegram:chat-id
 * 3. Copia el número en .env.local → TELEGRAM_CHAT_ID=...
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function loadEnv(): void {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = readFileSync(join(ROOT, file), "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m && !process.env[m[1].trim()]) {
          process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
        }
      }
    } catch {
      /* missing file */
    }
  }
}

loadEnv();

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
if (!token || token.includes("your_telegram")) {
  console.error("❌ Falta TELEGRAM_BOT_TOKEN en .env.local");
  process.exit(1);
}

interface TelegramUpdate {
  message?: {
    chat: { id: number; type: string; username?: string; first_name?: string };
    text?: string;
  };
}

async function main(): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/getUpdates?limit=20`;
  const res = await fetch(url);
  const data = (await res.json()) as { ok: boolean; result: TelegramUpdate[]; description?: string };

  if (!data.ok) {
    console.error("❌ Error de Telegram:", data.description ?? res.status);
    process.exit(1);
  }

  const chats = new Map<number, { type: string; name: string; lastText?: string }>();

  for (const u of data.result) {
    const msg = u.message;
    if (!msg?.chat) continue;
    const c = msg.chat;
    const name = c.username ? `@${c.username}` : c.first_name ?? "desconocido";
    chats.set(c.id, { type: c.type, name, lastText: msg.text });
  }

  if (chats.size === 0) {
    console.log("");
    console.log("No hay mensajes todavía. Haz esto:");
    console.log("  1. Abre Telegram y busca tu bot (el que creaste con BotFather)");
    console.log("  2. Pulsa Iniciar o envía: /start");
    console.log("  3. Vuelve a ejecutar: npm run telegram:chat-id");
    console.log("");
    process.exit(0);
  }

  console.log("");
  console.log("✅ Chat(s) encontrados — copia el id en .env.local:");
  console.log("");
  for (const [id, info] of chats) {
    console.log(`  TELEGRAM_CHAT_ID=${id}`);
    console.log(`    tipo: ${info.type} · ${info.name}`);
    if (info.lastText) console.log(`    último mensaje: ${info.lastText}`);
    console.log("");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
