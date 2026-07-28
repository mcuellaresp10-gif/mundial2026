"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchGlobal } from "./SearchGlobal";
import { TwitterLink } from "./TwitterLink";
import { LeagueSelector } from "./LeagueSelector";
import { useUIStore } from "@/stores/useUIStore";
import { useRefreshAll } from "@/hooks/usePartidos";
import { isLiveSessionActive } from "@/services/liveSession";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/calendario", label: "Calendario" },
  { href: "/tablas", label: "Tablas" },
  { href: "/equipos", label: "Equipos" },
  { href: "/jugadores/scouting", label: "Scouting" },
  { href: "/once-ideal", label: "Once Ideal" },
  { href: "/comparativas", label: "Comparativas" },
  { href: "/simulacion", label: "Simulación" },
  { href: "/juegos", label: "Juegos" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/mundial", label: "Archivo" },
  { href: "/agente", label: "Agente" },
];

export function Header() {
  const pathname = usePathname();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const lastRefresh = useUIStore((s) => s.lastRefresh);
  const setLastRefresh = useUIStore((s) => s.setLastRefresh);
  const refresh = useRefreshAll();
  const [secondsAgo, setSecondsAgo] = useState<number | null>(null);
  const hideLeagueSelector = pathname.startsWith("/mundial");

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
      <div className="flex h-full items-center gap-3 px-4 lg:px-8 max-w-[1600px] mx-auto">
        <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex-shrink-0">
          <span className="text-xl font-bold text-mundial-gold tracking-wide">Fútbol</span>
          <span className="text-xl font-bold text-white ml-1">Américas</span>
        </Link>

        {!hideLeagueSelector && (
          <div className="hidden md:block min-w-0">
            <LeagueSelector />
          </div>
        )}

        <nav className="hidden xl:flex items-center gap-1 ml-2">
          {NAV.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-2.5 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  ? "text-mundial-gold bg-white/10"
                  : "text-white/80 hover:text-white hover:bg-white/5"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden sm:block">
          <SearchGlobal />
        </div>
        <TwitterLink />
        <Button
          variant="ghost"
          size="icon"
          className="text-white relative"
          onClick={handleRefresh}
          title="Actualizar datos"
        >
          <RefreshCw className="h-4 w-4" />
          {secondsAgo != null && (
            <span className="absolute -bottom-1 text-[9px] text-white/50">{secondsAgo}s</span>
          )}
        </Button>
      </div>
    </header>
  );
}
