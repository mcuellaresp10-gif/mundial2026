export type GroupLetter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L";

export type BracketSide = "left" | "right";

export type BracketSlotRef =
  | { type: "winner"; group: GroupLetter }
  | { type: "runnerUp"; group: GroupLetter }
  | {
      type: "third";
      /** Grupos cuyo 3º puede ocupar este slot (Anexo C elige uno). */
      eligibleGroups: GroupLetter[];
      /** Clave Anexo C: ganador de grupo que recibe al 3º. */
      annexWinnerSlot: "1A" | "1B" | "1D" | "1E" | "1G" | "1I" | "1K" | "1L";
    };

export interface RoundOf32Definition {
  matchId: number;
  side: BracketSide;
  order: number;
  home: BracketSlotRef;
  away: BracketSlotRef;
}

export type BracketRound =
  | "round_of_32"
  | "round_of_16"
  | "quarterfinal"
  | "semifinal"
  | "third_place"
  | "final";

export interface BracketMatchDefinition {
  matchId: number;
  round: BracketRound;
  side?: BracketSide;
  order?: number;
  feedsFrom: [number, number];
}

/** 16avos — posiciones visuales alineadas con el cuadro oficial FIFA 2026. */
export const ROUND_OF_32: RoundOf32Definition[] = [
  {
    matchId: 74,
    side: "left",
    order: 0,
    home: { type: "winner", group: "E" },
    away: {
      type: "third",
      eligibleGroups: ["A", "B", "C", "D", "F"],
      annexWinnerSlot: "1E",
    },
  },
  {
    matchId: 77,
    side: "left",
    order: 1,
    home: { type: "winner", group: "I" },
    away: {
      type: "third",
      eligibleGroups: ["C", "D", "F", "G", "H"],
      annexWinnerSlot: "1I",
    },
  },
  {
    matchId: 73,
    side: "left",
    order: 2,
    home: { type: "runnerUp", group: "A" },
    away: { type: "runnerUp", group: "B" },
  },
  {
    matchId: 75,
    side: "left",
    order: 3,
    home: { type: "winner", group: "F" },
    away: { type: "runnerUp", group: "C" },
  },
  {
    matchId: 83,
    side: "left",
    order: 4,
    home: { type: "runnerUp", group: "K" },
    away: { type: "runnerUp", group: "L" },
  },
  {
    matchId: 84,
    side: "left",
    order: 5,
    home: { type: "winner", group: "H" },
    away: { type: "runnerUp", group: "J" },
  },
  {
    matchId: 81,
    side: "left",
    order: 6,
    home: { type: "winner", group: "D" },
    away: {
      type: "third",
      eligibleGroups: ["B", "E", "F", "I", "J"],
      annexWinnerSlot: "1D",
    },
  },
  {
    matchId: 82,
    side: "left",
    order: 7,
    home: { type: "winner", group: "G" },
    away: {
      type: "third",
      eligibleGroups: ["A", "E", "H", "I", "J"],
      annexWinnerSlot: "1G",
    },
  },
  {
    matchId: 76,
    side: "right",
    order: 0,
    home: { type: "winner", group: "C" },
    away: { type: "runnerUp", group: "F" },
  },
  {
    matchId: 78,
    side: "right",
    order: 1,
    home: { type: "runnerUp", group: "E" },
    away: { type: "runnerUp", group: "I" },
  },
  {
    matchId: 79,
    side: "right",
    order: 2,
    home: { type: "winner", group: "A" },
    away: {
      type: "third",
      eligibleGroups: ["C", "E", "F", "H", "I"],
      annexWinnerSlot: "1A",
    },
  },
  {
    matchId: 80,
    side: "right",
    order: 3,
    home: { type: "winner", group: "L" },
    away: {
      type: "third",
      eligibleGroups: ["E", "H", "I", "J", "K"],
      annexWinnerSlot: "1L",
    },
  },
  {
    matchId: 86,
    side: "right",
    order: 4,
    home: { type: "winner", group: "J" },
    away: { type: "runnerUp", group: "H" },
  },
  {
    matchId: 88,
    side: "right",
    order: 5,
    home: { type: "runnerUp", group: "D" },
    away: { type: "runnerUp", group: "G" },
  },
  {
    matchId: 85,
    side: "right",
    order: 6,
    home: { type: "winner", group: "B" },
    away: {
      type: "third",
      eligibleGroups: ["E", "F", "G", "I", "J"],
      annexWinnerSlot: "1B",
    },
  },
  {
    matchId: 87,
    side: "right",
    order: 7,
    home: { type: "winner", group: "K" },
    away: {
      type: "third",
      eligibleGroups: ["D", "E", "I", "J", "L"],
      annexWinnerSlot: "1K",
    },
  },
];

/** Octavos → final (M89–M104). */
export const KNOCKOUT_TREE: BracketMatchDefinition[] = [
  { matchId: 89, round: "round_of_16", side: "left", order: 0, feedsFrom: [74, 77] },
  { matchId: 90, round: "round_of_16", side: "left", order: 1, feedsFrom: [73, 75] },
  { matchId: 91, round: "round_of_16", side: "right", order: 0, feedsFrom: [76, 78] },
  { matchId: 92, round: "round_of_16", side: "right", order: 1, feedsFrom: [79, 80] },
  { matchId: 93, round: "round_of_16", side: "left", order: 2, feedsFrom: [83, 84] },
  { matchId: 94, round: "round_of_16", side: "left", order: 3, feedsFrom: [81, 82] },
  { matchId: 95, round: "round_of_16", side: "right", order: 2, feedsFrom: [86, 88] },
  { matchId: 96, round: "round_of_16", side: "right", order: 3, feedsFrom: [85, 87] },
  { matchId: 97, round: "quarterfinal", side: "left", order: 0, feedsFrom: [89, 90] },
  { matchId: 98, round: "quarterfinal", side: "left", order: 1, feedsFrom: [93, 94] },
  { matchId: 99, round: "quarterfinal", side: "right", order: 0, feedsFrom: [91, 92] },
  { matchId: 100, round: "quarterfinal", side: "right", order: 1, feedsFrom: [95, 96] },
  { matchId: 101, round: "semifinal", side: "left", order: 0, feedsFrom: [97, 98] },
  { matchId: 102, round: "semifinal", side: "right", order: 0, feedsFrom: [99, 100] },
  { matchId: 103, round: "third_place", feedsFrom: [101, 102] },
  { matchId: 104, round: "final", feedsFrom: [101, 102] },
];

export const GROUP_LETTERS: GroupLetter[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
];

export const ROUND_LABELS: Record<BracketRound, string> = {
  round_of_32: "16avos de final",
  round_of_16: "Octavos de final",
  quarterfinal: "Cuartos de final",
  semifinal: "Semifinal",
  third_place: "Tercer puesto",
  final: "Final",
};
