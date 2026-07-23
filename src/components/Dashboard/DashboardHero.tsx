"use client";

import Link from "next/link";
import { Calendar, BarChart3, Shield, Star, GitCompare, MessageCircle, Table2, Dices } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActiveLeague } from "@/hooks/useActiveLeague";

const QUICK_LINKS = [
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/tablas", label: "Tablas", icon: Table2 },
  { href: "/equipos", label: "Equipos", icon: Shield },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/once-ideal", label: "Once Ideal", icon: Star },
  { href: "/comparativas", label: "Comparativas", icon: GitCompare },
  { href: "/simulacion", label: "Simulación", icon: Dices },
  { href: "/agente", label: "Agente", icon: MessageCircle },
] as const;

export function DashboardHero() {
  const { league, leagues, isMulti } = useActiveLeague();
  const label = isMulti
    ? `${leagues[0].shortName} +${leagues.length - 1}`
    : league.shortName;

  return (
    <header id="inicio" className="scroll-mt-24 @container/hero mb-6 lg:mb-8">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-mundial-deep via-slate-800 to-mundial-deep px-[clamp(1.25rem,4vw,2.5rem)] py-[clamp(1.75rem,5vw,3rem)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #FCD116 0%, transparent 45%), radial-gradient(circle at 80% 20%, #10B981 0%, transparent 40%)",
          }}
        />

        <div className="relative grid gap-6 @md/hero:grid-cols-[1fr_auto] @md/hero:items-end min-w-0">
          <div className="min-w-0">
            <p className="text-mundial-gold/90 text-xs @md/hero:text-sm font-semibold uppercase tracking-[0.2em] mb-2">
              CONMEBOL · Liga MX · MLS · Copas
            </p>
            <h1 className="text-[clamp(2rem,6cqw,3.25rem)] font-bold tracking-tight text-white leading-tight">
              Fútbol Américas
            </h1>
            <p className="text-white/70 mt-2 max-w-prose text-sm @md/hero:text-base">
              Análisis táctico y estadísticas · {label}
            </p>
          </div>

          <div className="hidden @md/hero:flex flex-col items-end gap-1 text-right shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-white/50">Temporada</span>
            <span className="font-mono text-2xl font-bold text-mundial-gold">
              {league.defaultSeason}
            </span>
          </div>
        </div>

        <nav
          aria-label="Accesos rápidos"
          className="relative mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,130px),1fr))] gap-2 @md/hero:gap-3"
        >
          {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/90 transition hover:bg-white/10 hover:border-mundial-gold/40"
              )}
            >
              <Icon className="h-4 w-4 text-mundial-gold shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
