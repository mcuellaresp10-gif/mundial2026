import { rmSync } from "node:fs";
import { join } from "node:path";
import { spawn, execSync } from "node:child_process";

const root = process.cwd();
const nextDir = join(root, ".next");
const PORT = process.env.PORT ?? "3000";

function killDevServerOnPort() {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr :${PORT}`, { encoding: "utf8" });
      const pids = new Set();
      for (const line of out.split("\n")) {
        if (!line.includes("LISTENING")) continue;
        const pid = line.trim().split(/\s+/).pop();
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      }
      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
          console.log(`✓ Proceso en puerto ${PORT} detenido (PID ${pid})`);
        } catch {
          /* already gone */
        }
      }
    } else {
      execSync(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true`, {
        stdio: "ignore",
        shell: true,
      });
    }
  } catch {
    /* no process on port */
  }
}

killDevServerOnPort();

// Breve pausa para liberar locks de .next en Windows
if (process.platform === "win32") {
  execSync("powershell -Command \"Start-Sleep -Seconds 2\"", { stdio: "ignore" });
}

try {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("✓ Carpeta .next eliminada");
} catch (error) {
  console.warn("⚠ No se pudo borrar .next:", error.message);
  console.warn("  Cierra el servidor (Ctrl+C) y vuelve a ejecutar npm run dev:clean");
  process.exit(1);
}

console.log("→ Iniciando next dev...\n");
console.log("  (No ejecutes npm run build mientras dev está activo — corrompe .next)\n");

const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: root,
});

child.on("exit", (code) => process.exit(code ?? 0));
