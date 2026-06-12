import { execSync } from "node:child_process";

const PORTS = ["3000", "3001", "3002"];

function isPortInUse(port) {
  try {
    if (process.platform === "win32") {
      const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
      return out.split("\n").some((line) => line.includes("LISTENING"));
    }
    execSync(`lsof -ti:${port}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const busy = PORTS.filter(isPortInUse);
if (busy.length > 0) {
  console.error("\n❌ No puedes hacer build mientras el servidor de desarrollo está activo.");
  console.error(`   Puertos ocupados: ${busy.join(", ")}`);
  console.error("   Detén el dev server (Ctrl+C) o ejecuta: npm run dev:clean\n");
  process.exit(1);
}
