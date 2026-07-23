"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  AMERICAS_LEAGUES,
  continentalCupLeagues,
  domesticCupLeagues,
  domesticLeagues,
  type AmericasLeague,
} from "@/data/americasLeagues";
import { useActiveLeague } from "@/hooks/useActiveLeague";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type LeagueSelectorVariant = "header" | "page";

const triggerClass: Record<LeagueSelectorVariant, string> = {
  header:
    "rounded-md border border-white/20 bg-white/10 px-2 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-mundial-gold/50",
  page:
    "rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-mundial-gold/40",
};

/** Fondo 100% opaco (sin depender de --popover). */
const panelSurface: Record<LeagueSelectorVariant, string> = {
  header:
    "rounded-xl border border-white/20 bg-slate-950 text-white shadow-2xl ring-1 ring-black/40",
  page:
    "rounded-xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-black/50",
};

const PANEL_WIDTH = 340;
const VIEWPORT_PAD = 12;

function selectionLabel(leagues: AmericasLeague[]): string {
  if (leagues.length === 0) return "Elegir ligas";
  if (leagues.length === 1) return `${leagues[0].shortName} — ${leagues[0].name}`;
  if (leagues.length === 2) {
    return `${leagues[0].shortName} + ${leagues[1].shortName}`;
  }
  return `${leagues[0].shortName} +${leagues.length - 1}`;
}

function LeagueCheckRow({
  league,
  checked,
  onToggle,
  variant,
}: {
  league: AmericasLeague;
  checked: boolean;
  onToggle: () => void;
  variant: LeagueSelectorVariant;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
        checked
          ? variant === "header"
            ? "bg-mundial-gold/15 ring-1 ring-mundial-gold/35"
            : "bg-mundial-gold/10 ring-1 ring-mundial-gold/30"
          : variant === "header"
            ? "hover:bg-white/10"
            : "hover:bg-secondary"
      )}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 accent-mundial-gold"
        checked={checked}
        onChange={onToggle}
      />
      <span className="min-w-0 leading-snug">
        <span className="font-semibold text-[13px]">{league.shortName}</span>
        <span
          className={cn(
            "block text-xs truncate mt-0.5",
            variant === "header" ? "text-white/60" : "text-muted-foreground"
          )}
        >
          {league.name}
        </span>
      </span>
    </label>
  );
}

function SectionTitle({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: LeagueSelectorVariant;
}) {
  return (
    <p
      className={cn(
        "px-2.5 mb-1.5 text-[10px] uppercase tracking-wider font-bold",
        variant === "header" ? "text-white/50" : "text-muted-foreground"
      )}
    >
      {children}
    </p>
  );
}

export function LeagueSelector({
  className,
  variant = "header",
  showCount = variant === "header",
}: {
  className?: string;
  variant?: LeagueSelectorVariant;
  showCount?: boolean;
}) {
  const {
    leagues,
    leagueSlugs,
    phase,
    setPhase,
    toggleLeagueSlug,
    setLeagueSlugs,
    supportsPhaseFilter,
    isScoped,
  } = useActiveLeague();

  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const domestics = domesticLeagues();
  const continentalCups = continentalCupLeagues();
  const nationalCups = domesticCupLeagues();
  const slugSet = useMemo(() => new Set(leagueSlugs), [leagueSlugs]);

  useEffect(() => {
    if (!open) return;

    function placePanel() {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_PAD * 2);
      const maxHeight = Math.min(480, window.innerHeight - VIEWPORT_PAD * 2);

      // Preferir alinear a la izquierda del botón; si no cabe, pegar al borde derecho.
      let left = rect.left;
      if (left + width > window.innerWidth - VIEWPORT_PAD) {
        left = window.innerWidth - VIEWPORT_PAD - width;
      }
      left = Math.max(VIEWPORT_PAD, left);

      let top = rect.bottom + 6;
      const estimatedHeight = Math.min(420, maxHeight);
      if (top + estimatedHeight > window.innerHeight - VIEWPORT_PAD) {
        const above = rect.top - 6 - estimatedHeight;
        top = above >= VIEWPORT_PAD ? above : VIEWPORT_PAD;
      }

      setPanelStyle({
        position: "fixed",
        top,
        left,
        width,
        maxHeight,
        zIndex: 300,
      });
    }

    placePanel();
    window.addEventListener("resize", placePanel);
    window.addEventListener("scroll", placePanel, true);

    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", placePanel);
      window.removeEventListener("scroll", placePanel, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isScoped) return null;

  const fieldClass = triggerClass[variant];
  const toolbarBg =
    variant === "header" ? "border-white/10 bg-slate-950" : "border-border bg-card";
  const chipBtn =
    variant === "header"
      ? "bg-white/12 hover:bg-white/20 text-white"
      : "bg-secondary hover:bg-secondary/80 text-secondary-foreground";

  return (
    <div className={cn("flex flex-col gap-2 min-w-0", className)} ref={rootRef}>
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <div className="relative min-w-0">
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              fieldClass,
              "inline-flex items-center gap-2 text-left",
              variant === "header"
                ? "max-w-[min(100%,240px)]"
                : "min-w-[min(100%,280px)] max-w-full"
            )}
          >
            <span className="truncate">{selectionLabel(leagues)}</span>
            <span
              className={cn(
                "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] tabular-nums font-semibold",
                variant === "header"
                  ? "bg-white/15 text-white/90"
                  : "bg-secondary text-secondary-foreground"
              )}
            >
              {leagues.length}
            </span>
            <span aria-hidden className="opacity-60 shrink-0">
              ▾
            </span>
          </button>

          {open && (
            <div
              className={cn(
                "overflow-hidden flex flex-col",
                panelSurface[variant]
              )}
              style={panelStyle}
              role="listbox"
              aria-multiselectable
            >
              <div
                className={cn(
                  "flex flex-wrap gap-1.5 border-b p-2.5 shrink-0",
                  toolbarBg
                )}
              >
                <button
                  type="button"
                  className={cn("rounded-md px-2.5 py-1 text-[11px] font-semibold", chipBtn)}
                  onClick={() => setLeagueSlugs(domestics.map((l) => l.slug))}
                >
                  Todas domésticas
                </button>
                <button
                  type="button"
                  className={cn("rounded-md px-2.5 py-1 text-[11px] font-semibold", chipBtn)}
                  onClick={() => setLeagueSlugs(AMERICAS_LEAGUES.map((l) => l.slug))}
                >
                  Todas
                </button>
                <button
                  type="button"
                  className={cn("rounded-md px-2.5 py-1 text-[11px] font-semibold", chipBtn)}
                  onClick={() => setLeagueSlugs(["liga-betplay"])}
                >
                  Solo Colombia
                </button>
              </div>

              <div className="overflow-y-auto flex-1 min-h-0 p-2 space-y-3 scrollbar-thin overscroll-contain">
                <section>
                  <SectionTitle variant={variant}>Ligas domésticas</SectionTitle>
                  {domestics.map((l) => (
                    <LeagueCheckRow
                      key={l.slug}
                      league={l}
                      checked={slugSet.has(l.slug)}
                      onToggle={() => toggleLeagueSlug(l.slug)}
                      variant={variant}
                    />
                  ))}
                </section>
                <section>
                  <SectionTitle variant={variant}>Copas continentales</SectionTitle>
                  {continentalCups.map((l) => (
                    <LeagueCheckRow
                      key={l.slug}
                      league={l}
                      checked={slugSet.has(l.slug)}
                      onToggle={() => toggleLeagueSlug(l.slug)}
                      variant={variant}
                    />
                  ))}
                </section>
                <section>
                  <SectionTitle variant={variant}>Copas domésticas</SectionTitle>
                  {nationalCups.map((l) => (
                    <LeagueCheckRow
                      key={l.slug}
                      league={l}
                      checked={slugSet.has(l.slug)}
                      onToggle={() => toggleLeagueSlug(l.slug)}
                      variant={variant}
                    />
                  ))}
                </section>
              </div>
            </div>
          )}
        </div>

        {supportsPhaseFilter && (
          <select
            aria-label="Fase Apertura/Clausura"
            value={phase}
            onChange={(e) => setPhase(e.target.value as typeof phase)}
            className={fieldClass}
          >
            <option value="all" className="bg-card text-foreground">
              Temporada completa
            </option>
            <option value="apertura" className="bg-card text-foreground">
              Apertura
            </option>
            <option value="clausura" className="bg-card text-foreground">
              Clausura
            </option>
          </select>
        )}

        {showCount && (
          <span
            className={cn(
              "hidden sm:inline text-[10px] tabular-nums",
              variant === "header" ? "text-white/50" : "text-muted-foreground"
            )}
          >
            {leagues.length}/{AMERICAS_LEAGUES.length}
          </span>
        )}
      </div>

      {variant === "page" && leagues.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {leagues.map((l) => (
            <Badge
              key={l.slug}
              variant="outline"
              className="gap-1 pr-1 cursor-default bg-card"
            >
              {l.shortName}
              <button
                type="button"
                aria-label={`Quitar ${l.shortName}`}
                className="rounded-full px-1 text-muted-foreground hover:text-foreground"
                onClick={() => toggleLeagueSlug(l.slug)}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
