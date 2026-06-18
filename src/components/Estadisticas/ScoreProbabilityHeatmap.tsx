"use client";

import { cn } from "@/lib/utils";

interface ScoreProbabilityHeatmapProps {
  matrix: number[][];
  teamAName: string;
  teamBName: string;
  mostLikely: { home: number; away: number; prob: number };
  className?: string;
}

function cellIntensity(prob: number, maxProb: number): number {
  if (maxProb <= 0) return 0;
  return Math.min(1, prob / maxProb);
}

export function ScoreProbabilityHeatmap({
  matrix,
  teamAName,
  teamBName,
  mostLikely,
  className,
}: ScoreProbabilityHeatmapProps) {
  const maxProb = matrix.reduce(
    (max, row) => Math.max(max, ...row.map((p) => p)),
    0
  );
  const maxHome = matrix.length - 1;
  const maxAway = (matrix[0]?.length ?? 1) - 1;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm min-w-[320px]">
          <thead>
            <tr>
              <th className="p-2 text-left text-muted-foreground font-normal w-24">
                {teamAName}
              </th>
              <th
                colSpan={maxAway + 1}
                className="p-2 text-center text-muted-foreground font-medium border-b"
              >
                Goles — {teamBName}
              </th>
            </tr>
            <tr>
              <th className="p-1" />
              {Array.from({ length: maxAway + 1 }, (_, j) => (
                <th
                  key={j}
                  className="p-1 text-center text-xs font-medium text-muted-foreground w-12"
                >
                  {j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, i) => (
              <tr key={i}>
                <th className="p-1 text-right text-xs font-medium text-muted-foreground pr-2">
                  {i}
                </th>
                {row.map((prob, j) => {
                  const intensity = cellIntensity(prob, maxProb);
                  const isPeak =
                    i === mostLikely.home &&
                    j === mostLikely.away &&
                    prob === mostLikely.prob;
                  const pct = (prob * 100).toFixed(1);

                  return (
                    <td
                      key={j}
                      className={cn(
                        "p-0 border border-border/40 relative",
                        isPeak && "ring-2 ring-mundial-gold ring-inset z-10"
                      )}
                      aria-label={`${teamAName} ${i}, ${teamBName} ${j}: ${pct}% probabilidad`}
                    >
                      <div
                        className="flex items-center justify-center min-h-[2.5rem] min-w-[2.5rem] text-xs font-medium transition-colors"
                        style={{
                          backgroundColor: `rgba(212, 175, 55, ${0.08 + intensity * 0.72})`,
                          color:
                            intensity > 0.45
                              ? "rgb(15 23 42)"
                              : "rgb(100 116 139)",
                        }}
                        title={`${i}-${j}: ${pct}%`}
                      >
                        {prob >= 0.01 ? `${pct}%` : prob >= 0.003 ? "<1%" : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>Menos probable</span>
        <div className="flex h-3 flex-1 max-w-xs rounded overflow-hidden border border-border/50">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{
                backgroundColor: `rgba(212, 175, 55, ${0.08 + (i / 7) * 0.72})`,
              }}
            />
          ))}
        </div>
        <span>Más probable</span>
      </div>
    </div>
  );
}
