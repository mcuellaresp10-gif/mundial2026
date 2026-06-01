import { rmSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const root = process.cwd();
const nextDir = join(root, ".next");

try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("✓ Carpeta .next eliminada");
} catch (error) {
  console.warn("⚠ No se pudo borrar .next:", error.message);
  console.warn("  Cierra el servidor (Ctrl+C) y vuelve a ejecutar npm run dev:clean");
}

console.log("→ Iniciando next dev...\n");

const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: root,
});

child.on("exit", (code) => process.exit(code ?? 0));
