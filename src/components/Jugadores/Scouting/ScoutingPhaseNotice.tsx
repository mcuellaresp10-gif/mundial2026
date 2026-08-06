"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlayerRecentForm } from "@/hooks/usePlayerRecentForm";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder de forma reciente / fase: la API season no parte Apertura/Clausura. */
export function ScoutingPhaseNotice({
  phase,
  supportsPhase,
}: {
  phase: string;
  supportsPhase: boolean;
}) {
  if (!supportsPhase || phase === "all") {
    return (
      <p className="text-xs text-muted-foreground">
        Pool de temporada completa (stats API por temporada).
      </p>
    );
  }
  const label = phase === "apertura" ? "Apertura" : "Clausura";
  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs">
      Fase <strong>{label}</strong> activa en el selector: las tablas/fixtures sí
      filtran por fase, pero el pool de scouting usa{" "}
      <strong>temporada completa</strong> (API-Football no parte stats de
      jugador por Apertura/Clausura). La forma reciente abajo usa los últimos
      partidos del club vía <code className="text-[10px]">fixtures/players</code>.
    </div>
  );
}

export function ScoutingFormPlaceholder({
  profile,
}: {
  profile: ScoutingProfile;
}) {
  const { appearances, isLoading, fixtureCount } = usePlayerRecentForm(
    profile.playerId,
    profile.teamId
  );

  if (isLoading && appearances.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Forma reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (appearances.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Forma reciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Sin apariciones en los últimos {fixtureCount || 6} partidos FT del
            club (o datos de jornada aún no cargados). Resumen temporada:{" "}
            {profile.rating.toFixed(1)} rating · {profile.goals}G ·{" "}
            {profile.assists}A · {profile.minutes}&apos;.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxRating = Math.max(...appearances.map((a) => a.rating), 7);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Forma reciente · {appearances.length} partidos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end gap-1 h-16">
          {appearances.map((a) => (
            <div
              key={a.fixtureId}
              className="flex-1 flex flex-col items-center gap-1 min-w-0"
              title={`${a.opponent}: ${a.rating.toFixed(1)} · ${a.goals}G ${a.assists}A · ${a.minutes}'`}
            >
              <div
                className="w-full rounded-t bg-mundial-gold/80"
                style={{
                  height: `${Math.max(12, (a.rating / maxRating) * 100)}%`,
                }}
              />
              <span className="text-[9px] text-muted-foreground truncate w-full text-center">
                {a.rating.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
        <ul className="space-y-1 text-[11px] text-muted-foreground max-h-28 overflow-y-auto">
          {[...appearances].reverse().map((a) => (
            <li key={a.fixtureId} className="flex justify-between gap-2">
              <span className="truncate">vs {a.opponent}</span>
              <span className="font-mono shrink-0">
                {a.rating.toFixed(1)} · {a.goals}G {a.assists}A · {a.minutes}&apos;
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

/** Serie temporal de rating (y G/A) en los últimos partidos. */
export function ScoutingTimeSeries({ profile }: { profile: ScoutingProfile }) {
  const { appearances, isLoading } = usePlayerRecentForm(
    profile.playerId,
    profile.teamId
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Serie · rating por partido</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && appearances.length === 0 ? (
          <Skeleton className="h-20 w-full" />
        ) : appearances.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            Sin puntos por partido aún. Cuando haya fixtures FT del club,
            verás la evolución de rating y G/A aquí.
          </p>
        ) : (
          <div className="space-y-2">
            <svg
              viewBox={`0 0 ${Math.max(appearances.length - 1, 1) * 40} 60`}
              className="w-full h-16 text-mundial-gold"
              preserveAspectRatio="none"
            >
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                points={appearances
                  .map((a, i) => {
                    const x = i * 40;
                    const y = 55 - ((a.rating - 5) / 5) * 50;
                    return `${x},${Math.min(55, Math.max(5, y))}`;
                  })
                  .join(" ")}
              />
            </svg>
            <p className="text-[10px] text-muted-foreground">
              Goles últimos {appearances.length}:{" "}
              {appearances.reduce((s, a) => s + a.goals, 0)} · Asist:{" "}
              {appearances.reduce((s, a) => s + a.assists, 0)} · Min:{" "}
              {appearances.reduce((s, a) => s + a.minutes, 0)}&apos;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ScoutingPartnerRoadmap() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Próximos partners</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground space-y-1">
        <p>· Deep-link a video (Wyscout / highlights) por partido.</p>
        <p>· Eventos avanzados (xG, progresivos) con proveedor Opta/StatsBomb.</p>
        <p>· Cobertura youth / Sudamericano sub-20.</p>
        <p>· CRM multi-usuario tipo club (bajo demanda).</p>
      </CardContent>
    </Card>
  );
}
