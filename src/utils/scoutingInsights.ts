import type { MetricKey } from "@/config/positionMetricProfiles";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";

export function rankProfilesByMetric(
  profiles: ScoutingProfile[],
  key: MetricKey | "rating",
  limit = 20
): ScoutingProfile[] {
  return [...profiles]
    .sort((a, b) => {
      const av =
        key === "rating"
          ? a.rating
          : ((a.metrics[key as keyof typeof a.metrics] as number) ?? 0);
      const bv =
        key === "rating"
          ? b.rating
          : ((b.metrics[key as keyof typeof b.metrics] as number) ?? 0);
      return bv - av;
    })
    .slice(0, limit);
}

export function filterProfilesByThresholds(
  profiles: ScoutingProfile[],
  thresholds: {
    minMinutes?: number;
    minGoals?: number;
    minAssists?: number;
    minRating?: number;
  }
): ScoutingProfile[] {
  return profiles.filter((p) => {
    if (thresholds.minMinutes != null && p.minutes < thresholds.minMinutes) return false;
    if (thresholds.minGoals != null && p.goals < thresholds.minGoals) return false;
    if (thresholds.minAssists != null && p.assists < thresholds.minAssists) return false;
    if (thresholds.minRating != null && p.rating < thresholds.minRating) return false;
    return true;
  });
}

/** Brief determinista anclado a percentiles (sin LLM). */
export function buildAnchoredScoutBrief(profile: ScoutingProfile): string[] {
  const bullets: string[] = [];
  const entries = Object.entries(profile.percentiles) as [MetricKey, number][];
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const strengths = sorted.filter(([, p]) => p >= 75).slice(0, 3);
  const weaknesses = [...sorted].reverse().filter(([, p]) => p <= 35).slice(0, 2);

  if (strengths.length) {
    bullets.push(
      `Fortalezas vs pares: ${strengths
        .map(([k, p]) => `${k.replace(/90$/, "/90")} (P${p})`)
        .join(", ")}.`
    );
  }
  if (weaknesses.length) {
    bullets.push(
      `Áreas bajo el promedio del pool: ${weaknesses
        .map(([k, p]) => `${k.replace(/90$/, "/90")} (P${p})`)
        .join(", ")}.`
    );
  }
  bullets.push(
    `Volumen: ${profile.minutes}' · ${profile.goals}G · ${profile.assists}A · rating ${profile.rating.toFixed(1)}.`
  );
  bullets.push(
    "Fuente: percentiles del pool activo (API-Football volumen). Sin xG ni acciones progresivas."
  );
  return bullets;
}
