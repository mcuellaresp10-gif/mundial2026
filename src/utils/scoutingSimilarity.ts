import type { MetricKey } from "@/config/positionMetricProfiles";
import type { ScoutingProfile, WorldCupPer90Metrics } from "@/utils/worldCupScoutingMetrics";

function metricOf(m: WorldCupPer90Metrics, key: MetricKey): number {
  return (m[key as keyof WorldCupPer90Metrics] as number) ?? 0;
}

/**
 * Similitud por distancia euclídea en z-scores de las métricas del rol.
 * 100 = idéntico en el espacio de features del pool.
 */
export function findSimilarPlayers(
  target: ScoutingProfile,
  pool: ScoutingProfile[],
  focusKeys: MetricKey[],
  limit = 8
): { profile: ScoutingProfile; score: number }[] {
  const peers = pool.filter(
    (p) => p.position === target.position && p.playerId !== target.playerId
  );
  if (peers.length === 0 || focusKeys.length === 0) return [];

  const means = new Map<MetricKey, number>();
  const stds = new Map<MetricKey, number>();
  for (const key of focusKeys) {
    const values = peers.map((p) => metricOf(p.metrics, key));
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance =
      values.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(values.length, 1);
    means.set(key, mean);
    stds.set(key, Math.sqrt(variance) || 1);
  }

  const targetZ = focusKeys.map((key) => {
    const mean = means.get(key) ?? 0;
    const std = stds.get(key) ?? 1;
    return (metricOf(target.metrics, key) - mean) / std;
  });

  const scored = peers.map((profile) => {
    const z = focusKeys.map((key) => {
      const mean = means.get(key) ?? 0;
      const std = stds.get(key) ?? 1;
      return (metricOf(profile.metrics, key) - mean) / std;
    });
    const dist = Math.sqrt(
      targetZ.reduce((s, v, i) => s + (v - z[i]) ** 2, 0) / focusKeys.length
    );
    const score = Math.max(0, Math.round((1 / (1 + dist)) * 100));
    return { profile, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}
