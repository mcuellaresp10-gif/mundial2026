import type { CSSProperties } from "react";

/** Paleta unificada — misma línea visual que «Goles por día del torneo». */
export const CHART_GOLD = "#FCD116";

export const CHART_HEIGHT = 260;
export const CHART_HEIGHT_MD = 240;
export const CHART_HEIGHT_SM = 220;

export const chartGridProps = {
  strokeDasharray: "3 3",
  opacity: 0.3,
};

export const chartXAxisProps = {
  tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
};

export const chartYAxisProps = {
  allowDecimals: false as const,
  tick: { fontSize: 11, fill: "hsl(var(--muted-foreground))" },
};

export const chartTooltipProps = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  } satisfies CSSProperties,
  labelStyle: { color: "hsl(var(--foreground))" },
  itemStyle: { color: CHART_GOLD },
};

export const chartAreaSeriesProps = {
  type: "monotone" as const,
  stroke: CHART_GOLD,
  fill: CHART_GOLD,
  fillOpacity: 0.25,
  strokeWidth: 2,
};

export const chartBarSeriesProps = {
  fill: CHART_GOLD,
  fillOpacity: 0.9,
  radius: [4, 4, 0, 0] as [number, number, number, number],
};

/** Variaciones doradas para series categóricas (sin arcoíris). */
export const CHART_GOLD_SCALE = [
  "#FCD116",
  "#E6BC00",
  "#CFA800",
  "#B89400",
  "#A18000",
  "#886C00",
  "#6F5800",
];

export function chartGoldColor(index: number): string {
  return CHART_GOLD_SCALE[index % CHART_GOLD_SCALE.length];
}

export const chartLegendProps = {
  wrapperStyle: { fontSize: "11px", color: "hsl(var(--muted-foreground))" },
};

/** @deprecated Usar CHART_GOLD / chartTheme */
export const CHART_COLORS = {
  gold: CHART_GOLD,
  blue: "#003DA5",
  red: "#CE1126",
  green: "#008751",
  orange: "#FF6B00",
  teal: "#00A1DE",
};

/** @deprecated Usar CHART_GOLD_SCALE */
export const PIE_COLORS = CHART_GOLD_SCALE;
