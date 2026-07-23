"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Trophy } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { LeagueSelector } from "./LeagueSelector";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/calendario", label: "Calendario", icon: "📅" },
  { href: "/tablas", label: "Tablas", icon: "🏆" },
  { href: "/equipos", label: "Equipos", icon: "⚽" },
  { href: "/jugadores/scouting", label: "Scouting", icon: "📈" },
  { href: "/once-ideal", label: "Once Ideal", icon: "⭐" },
  { href: "/comparativas", label: "Comparativas", icon: "⚔️" },
  { href: "/simulacion", label: "Simulación", icon: "🎲" },
  { href: "/estadisticas", label: "Estadísticas", icon: "📊" },
  { href: "/mundial", label: "Mundial (archivo)", icon: "🌍" },
  { href: "/agente", label: "Agente", icon: "💬" },
];

function isNavLinkActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/estadisticas") return pathname === "/estadisticas";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const HIGHLIGHTS = [
  { href: "/estadisticas#scorers", label: "Top Scorers", icon: Trophy, match: (p: string) => p === "/estadisticas" },
  { href: "/mundial", label: "Archivo Mundial", icon: Trophy, match: (p: string) => p.startsWith("/mundial") },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const hideLeagueSelector = pathname.startsWith("/mundial");

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed top-[70px] left-0 z-40 h-[calc(100vh-6.5rem)] w-60 bg-mundial-sidebar border-r border-white/10 transition-transform duration-300 lg:translate-x-0 overflow-y-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-white font-semibold">Menú</span>
          <button onClick={() => setSidebarOpen(false)} className="text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {!hideLeagueSelector && (
          <div className="px-4 pb-3 md:hidden">
            <LeagueSelector />
          </div>
        )}

        <nav className="p-4 space-y-1">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isNavLinkActive(pathname, link.href)
                  ? "bg-mundial-gold/20 text-mundial-gold"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 pt-4 border-t border-white/10 mt-4 pb-6">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2 px-3">Destacados</p>
          {HIGHLIGHTS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                link.match(pathname)
                  ? "text-mundial-gold"
                  : "text-white/60 hover:text-white"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}
