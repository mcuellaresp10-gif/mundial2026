"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Moon, RefreshCw, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchGlobal } from "./SearchGlobal";
import { useThemeStore } from "@/stores/useThemeStore";
import { useUIStore } from "@/stores/useUIStore";
import { useRefreshAll } from "@/hooks/usePartidos";
import { isLiveSessionActive } from "@/services/liveSession";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/calendario", label: "Calendario" },
  { href: "/selecciones", label: "Selecciones" },
  { href: "/grupos", label: "Grupos" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/once-ideal", label: "Once Ideal" },
  { href: "/comparativas", label: "Comparativas" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/agente", label: "Agente" },
  { href: "/historico", label: "Histórico" },
];

export function Header() {
  const pathname = usePathname();
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const lastRefresh = useUIStore((s) => s.lastRefresh);
  const setLastRefresh = useUIStore((s) => s.setLastRefresh);
  const refresh = useRefreshAll();
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);

  useEffect(() => {
    if (!isLiveSessionActive() || !lastRefresh) {
      setSecondsAgo(null);
      return;
    }
    const update = () => setSecondsAgo(Math.max(0, Math.floor((Date.now() - lastRefresh) / 1000)));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [lastRefresh]);

  const handleRefresh = () => {
    refresh();
    setLastRefresh(Date.now());
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-[70px] bg-gradient-to-r from-mundial-deep to-slate-800 border-b border-white/10">
      <div className="flex h-full items-center gap-4 px-4 lg:px-8 max-w-[1600px] mx-auto">
        <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex-shrink-0">
          <span className="text-xl font-bold text-mundial-gold tracking-wide">MUNDIAL</span>
          <span className="text-xl font-bold text-white ml-1">2026</span>
        </Link>

        <nav className="hidden xl:flex items-center gap-1 ml-6">
          {NAV.slice(0, 6).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href
                  ? "text-mundial-gold bg-white/10"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <SearchGlobal />
        </div>

        <div className="flex items-center gap-2">
          {secondsAgo !== null && (
            <span
              className="hidden sm:inline text-xs text-emerald-300/90 tabular-nums"
              title="Última sincronización de marcadores en vivo"
            >
              Actualizado hace {secondsAgo}s
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-white"
            onClick={handleRefresh}
            title="Actualizar ahora"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}
