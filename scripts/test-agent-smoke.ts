import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { runAgentTurn } from "../src/server/agent/worldCupAgent";

for (const file of [".env.local", ".env"]) {
  const envPath = resolve(process.cwd(), file);
  if (!existsSync(envPath)) continue;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  break;
}

const hasKey =
  !!process.env.OPENROUTER_API_KEY ||
  !!process.env.OPENAI_API_KEY ||
  !!process.env.ANTHROPIC_API_KEY;

if (!hasKey) {
  console.error("No hay clave de IA en .env.local");
  process.exit(1);
}

async function main() {
  const result = await runAgentTurn({
    question: "¿Quién ganó el Mundial de 2022?",
    messages: [],
    fixtures: [],
    standings: [],
  });

  console.log("Respuesta (extracto):", result.answer.slice(0, 300));
  console.log("Fuentes:", result.sources.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
