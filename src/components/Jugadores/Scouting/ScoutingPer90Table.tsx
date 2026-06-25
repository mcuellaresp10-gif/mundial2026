"use client";

import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";
import { getPositionProfile, type MetricKey } from "@/config/positionMetricProfiles";
import { cn } from "@/lib/utils";

interface ScoutingPer90TableProps {
  profile: ScoutingProfile;
  compareProfile?: ScoutingProfile | null;
}

function percentileLabel(p: number | undefined): string {
  if (p == null) return "—";
  if (p >= 90) return `Top ${100 - p}%`;
  if (p >= 75) return `Top ${100 - p}%`;
  return `P${p}`;
}

function percentileClass(p: number | undefined): string {
  if (p == null) return "";
  if (p >= 90) return "text-mundial-green font-semibold";
  if (p >= 75) return "text-mundial-gold";
  return "";
}

export function ScoutingPer90Table({ profile, compareProfile }: ScoutingPer90TableProps) {
  const positionProfile = getPositionProfile(profile.position);
  const rows = [
    ...positionProfile.radarAxes,
    positionProfile.scatter.x,
    positionProfile.scatter.y,
  ].filter(
    (axis, index, self) => self.findIndex((a) => a.key === axis.key) === index
  );

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left">
            <th className="p-3 font-medium">Métrica</th>
            <th className="p-3 font-medium font-mono">{profile.name.split(" ").pop()}</th>
            {compareProfile && (
              <th className="p-3 font-medium font-mono">
                {compareProfile.name.split(" ").pop()}
              </th>
            )}
            <th className="p-3 font-medium">Percentil</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((axis) => {
            const value = profile.metrics[axis.key as keyof typeof profile.metrics] as number;
            const compareValue = compareProfile
              ? (compareProfile.metrics[axis.key as keyof typeof compareProfile.metrics] as number)
              : null;
            const display = axis.isRate ? `${value.toFixed(1)}%` : value.toFixed(2);
            const compareDisplay =
              compareValue != null
                ? axis.isRate
                  ? `${compareValue.toFixed(1)}%`
                  : compareValue.toFixed(2)
                : null;

            return (
              <tr key={axis.key} className="border-b last:border-0">
                <td className="p-3">
                  <span>{axis.label}</span>
                  {"compositeHelp" in axis && typeof axis.compositeHelp === "string" && (
                    <span
                      className="ml-1 text-muted-foreground cursor-help"
                      title={axis.compositeHelp}
                    >
                      ⓘ
                    </span>
                  )}
                </td>
                <td className="p-3 font-mono">{display}</td>
                {compareProfile && (
                  <td className="p-3 font-mono text-muted-foreground">{compareDisplay}</td>
                )}
                <td className={cn("p-3 font-mono", percentileClass(profile.percentiles[axis.key as MetricKey]))}>
                  {percentileLabel(profile.percentiles[axis.key as MetricKey])}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ScoutingPercentileBar({ profile }: { profile: ScoutingProfile }) {
  const positionProfile = getPositionProfile(profile.position);
  const keys = positionProfile.radarAxes.slice(0, 6);

  return (
    <div className="space-y-3">
      {keys.map((axis) => {
        const pct = profile.percentiles[axis.key] ?? 0;
        return (
          <div key={axis.key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{axis.label}</span>
              <span className="font-mono">{pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-mundial-gold transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ScoutingSummaryHeader({ profile, poolSize }: { profile: ScoutingProfile; poolSize: number }) {
  const positionProfile = getPositionProfile(profile.position);
  const indexKey = positionProfile.radarAxes.find((a) => a.isComposite)?.key;
  const indexPct = indexKey ? profile.percentiles[indexKey] : undefined;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <SummaryChip label="Rating WC" value={profile.rating.toFixed(1)} />
      <SummaryChip label="Goles" value={String(profile.goals)} />
      <SummaryChip label="Asistencias" value={String(profile.assists)} />
      <SummaryChip label="Minutos" value={String(profile.minutes)} />
      <SummaryChip label="Posición" value={profile.position} />
      <SummaryChip
        label="Pool"
        value={`${poolSize} ${positionProfile.label.toLowerCase()}s`}
      />
      {indexPct != null && (
        <SummaryChip label="Percentil índice" value={`P${indexPct}`} />
      )}
    </div>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-mono font-bold text-lg">{value}</p>
    </div>
  );
}

export function WorldCupExtendedStatsGrid({ profile }: { profile: ScoutingProfile }) {
  const m = profile.metrics;
  const items = [
    { label: "Pases clave/90", value: m.keyPasses90.toFixed(2) },
    { label: "Regates/90", value: m.dribblesSuccess90.toFixed(2) },
    { label: "% regates", value: `${m.dribbleSuccessRate.toFixed(1)}%` },
    { label: "Duelos ganados/90", value: m.duelsWon90.toFixed(2) },
    { label: "Tiros/90", value: m.shots90.toFixed(2) },
    { label: "Tiros a puerta/90", value: m.shotsOn90.toFixed(2) },
    { label: "Entradas/90", value: m.tackles90.toFixed(2) },
    { label: "Intercepciones/90", value: m.interceptions90.toFixed(2) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border p-3 text-center">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <p className="font-mono font-bold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
