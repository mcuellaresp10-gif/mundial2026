export const FEEDBACK_CATEGORIES = [
  "incorrect_data",
  "visual_error",
  "chart_simulation",
  "suggestion",
  "other",
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  incorrect_data: "Datos incorrectos",
  visual_error: "Error visual / móvil",
  chart_simulation: "Gráfica / simulación",
  suggestion: "Sugerencia",
  other: "Otro",
};

export const FEEDBACK_MAX_DESCRIPTION = 500;

export function isFeedbackCategory(value: unknown): value is FeedbackCategory {
  return typeof value === "string" && FEEDBACK_CATEGORIES.includes(value as FeedbackCategory);
}
