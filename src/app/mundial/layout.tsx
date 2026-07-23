"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WorldCupScopeProvider } from "@/hooks/useActiveLeague";
import { cn } from "@/lib/utils";

const MUNDIAL_NAV = [
  { href: "/mundial", label: "Resumen" },
  { href: "/mundial/grupos", label: "Grupos" },
  { href: "/mundial/selecciones", label: "Selecciones" },
  { href: "/mundial/historico", label: "Histórico" },
];

export default function MundialLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <WorldCupScopeProvider>
      <div className="space-y-4 animate-in fade-in">
        <div className="rounded-xl border border-mundial-gold/30 bg-gradient-to-r from-mundial-deep/80 to-slate-800/80 px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-mundial-gold/80 font-semibold">
            Archivo
          </p>
          <h1 className="text-lg font-bold text-white">Mundial 2026</h1>
          <p className="text-xs text-white/60 mt-0.5">
            Sección archivada del torneo · el hub principal es Américas
          </p>
          <nav className="mt-3 flex flex-wrap gap-1">
            {MUNDIAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  pathname === item.href
                    ? "bg-mundial-gold/20 text-mundial-gold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        {children}
      </div>
    </WorldCupScopeProvider>
  );
}
