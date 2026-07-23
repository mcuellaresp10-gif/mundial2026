"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight, History, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EXAMPLE_QUESTIONS = [
  "¿Quién lidera la tabla?",
  "Mejores goleadores de la liga",
  "Próximos partidos de Copa Argentina",
];

export function AgenteCallToAction() {
  return (
    <section
      aria-labelledby="agente-cta-title"
      className="mb-6 lg:mb-8 scroll-mt-24"
      id="agente"
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-mundial-gold/35",
          "bg-gradient-to-r from-mundial-deep/90 via-slate-900 to-mundial-deep/80",
          "px-[clamp(1rem,3vw,1.75rem)] py-[clamp(1.25rem,3vw,1.75rem)]"
        )}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-mundial-gold/10 blur-2xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-4 @md:flex-row @md:items-center @md:justify-between min-w-0">
          <div className="flex gap-4 min-w-0">
            <div
              className="hidden @sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-mundial-gold/15 border border-mundial-gold/30"
              aria-hidden
            >
              <MessageCircle className="h-6 w-6 text-mundial-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-mundial-gold/90 font-semibold mb-1">
                Asistente IA
              </p>
              <h2 id="agente-cta-title" className="text-lg @md:text-xl font-bold text-white leading-snug">
                Pregúntale al agente Américas
              </h2>
              <p className="text-sm text-white/70 mt-1 max-w-prose">
                Ligas CONMEBOL, Liga MX, MLS, copas continentales y domésticas: tablas, goleadores y
                análisis. El Mundial 2026 sigue disponible en el archivo.
              </p>
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/55">
                <li className="flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-mundial-gold/80" />
                  Récords y ediciones
                </li>
                <li className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-mundial-gold/80" />
                  Probabilidades en vivo
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 @md:items-end">
            <Button asChild size="lg" className="w-full @md:w-auto font-semibold shadow-lg shadow-mundial-gold/10">
              <Link href="/agente">
                Abrir agente
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-[11px] text-white/45 @md:text-right">
              Ej.: {EXAMPLE_QUESTIONS.join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
