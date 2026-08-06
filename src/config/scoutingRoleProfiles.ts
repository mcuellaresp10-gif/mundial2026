import type { MetricKey, ScoutingPosition, ScatterConfig } from "@/config/positionMetricProfiles";

export type ScoutingRoleId =
  | "m_default"
  | "m_destroyer"
  | "m_creator"
  | "m_dribbler"
  | "f_default"
  | "f_finisher"
  | "f_creator"
  | "d_default"
  | "d_duelist"
  | "d_progressive"
  | "g_default"
  | "g_shotstopper";

export interface ScoutingRoleTemplate {
  id: ScoutingRoleId;
  position: ScoutingPosition;
  label: string;
  description: string;
  focusKeys: MetricKey[];
  scatter?: ScatterConfig;
  suggestedMin?: Partial<{
    minutes: number;
    goals: number;
    assists: number;
    rating: number;
  }>;
}

export const SCOUTING_ROLE_TEMPLATES: ScoutingRoleTemplate[] = [
  {
    id: "m_default",
    position: "M",
    label: "Volante (general)",
    description: "Perfil amplio de mediocampo.",
    focusKeys: ["keyPasses90", "dribblesSuccess90", "tackles90", "offensiveIndex"],
  },
  {
    id: "m_destroyer",
    position: "M",
    label: "#6 destructivo",
    description: "Recuperación: entradas, intercepciones y duelos.",
    focusKeys: ["tackles90", "interceptions90", "duelsWon90", "duelWinRate"],
    scatter: {
      x: { key: "tackles90", label: "Entradas/90" },
      y: { key: "interceptions90", label: "Intercepciones/90" },
      color: { key: "duelWinRate", label: "% duelos", isRate: true },
      colorLabel: "% duelos",
    },
  },
  {
    id: "m_creator",
    position: "M",
    label: "Interior creativo",
    description: "Pases clave y volumen de pase.",
    focusKeys: ["keyPasses90", "passes90", "passAccuracy", "assists90"],
    scatter: {
      x: { key: "keyPasses90", label: "Pases clave/90" },
      y: { key: "passes90", label: "Pases/90" },
      color: { key: "passAccuracy", label: "Precisión", isRate: true },
      colorLabel: "Precisión",
    },
  },
  {
    id: "m_dribbler",
    position: "M",
    label: "Volante 1v1",
    description: "Regates y faltas recibidas.",
    focusKeys: [
      "dribblesSuccess90",
      "dribblesAttempts90",
      "foulsDrawn90",
      "dribbleSuccessRate",
    ],
  },
  {
    id: "f_default",
    position: "F",
    label: "Delantero (general)",
    description: "Perfil amplio de ataque.",
    focusKeys: ["goals90", "shotsOn90", "assists90", "finishingIndex"],
  },
  {
    id: "f_finisher",
    position: "F",
    label: "9 rematador",
    description: "Goles y tiros a puerta.",
    focusKeys: ["goals90", "shots90", "shotsOn90", "shotOnTargetRate"],
    scatter: {
      x: { key: "goals90", label: "Goles/90" },
      y: { key: "shotsOn90", label: "Tiros a puerta/90" },
      color: { key: "shotOnTargetRate", label: "% a puerta", isRate: true },
      colorLabel: "% a puerta",
    },
    suggestedMin: { goals: 1 },
  },
  {
    id: "f_creator",
    position: "F",
    label: "Falso 9 / creador",
    description: "Pases clave, asistencias y regates.",
    focusKeys: ["keyPasses90", "assists90", "dribblesSuccess90", "foulsDrawn90"],
  },
  {
    id: "d_default",
    position: "D",
    label: "Defensa (general)",
    description: "Perfil amplio defensivo.",
    focusKeys: ["duelsWon90", "tackles90", "interceptions90", "defensiveIndex"],
  },
  {
    id: "d_duelist",
    position: "D",
    label: "Central duelista",
    description: "Duelos ganados y % de éxito.",
    focusKeys: ["duelsWon90", "duelWinRate", "tackles90", "blocks90"],
  },
  {
    id: "d_progressive",
    position: "D",
    label: "Defensa con salida",
    description: "Pases clave y volumen de pase desde atrás.",
    focusKeys: ["keyPasses90", "passes90", "passAccuracy", "duelsWon90"],
  },
  {
    id: "g_default",
    position: "G",
    label: "Portero (general)",
    description: "Paradas y control del área.",
    focusKeys: ["saves90", "savePercentage", "conceded90", "goalkeeperIndex"],
  },
  {
    id: "g_shotstopper",
    position: "G",
    label: "Portero remates",
    description: "Paradas/90 y % de paro.",
    focusKeys: ["saves90", "savePercentage", "conceded90", "passes90"],
  },
];

export function rolesForPosition(position: ScoutingPosition): ScoutingRoleTemplate[] {
  return SCOUTING_ROLE_TEMPLATES.filter((r) => r.position === position);
}

export function defaultRoleIdForPosition(position: ScoutingPosition): ScoutingRoleId {
  const map: Record<ScoutingPosition, ScoutingRoleId> = {
    M: "m_default",
    F: "f_default",
    D: "d_default",
    G: "g_default",
  };
  return map[position];
}

export function getRoleTemplate(
  position: ScoutingPosition,
  roleId: ScoutingRoleId
): ScoutingRoleTemplate {
  return (
    rolesForPosition(position).find((r) => r.id === roleId) ??
    rolesForPosition(position).find(
      (r) => r.id === defaultRoleIdForPosition(position)
    ) ??
    rolesForPosition(position)[0]
  );
}
