import { readFileSync } from "node:fs";
import { join } from "node:path";

const env = {};
for (const line of readFileSync(join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const token = env.TELEGRAM_BOT_TOKEN;
const chatId = env.TELEGRAM_CHAT_ID;

const me = await fetch(`https://api.telegram.org/bot${token}/getMe`).then((r) => r.json());
console.log(
  "Bot:",
  me.ok ? `@${me.result.username} (${me.result.first_name})` : `ERROR: ${me.description}`
);

const msg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chat_id: chatId,
    text: "✅ Bot Mundial 2026 conectado.\nPrueba /hoy, /vivo o /tabla",
  }),
}).then((r) => r.json());

console.log(
  "Mensaje de prueba:",
  msg.ok ? `enviado a chat ${chatId}` : `ERROR: ${msg.description}`
);
