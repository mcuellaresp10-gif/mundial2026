import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MiXIPlayer } from "@/types";

interface MiXIState {
  players: MiXIPlayer[];
  addPlayer: (player: MiXIPlayer) => void;
  removePlayer: (id: number) => void;
  clear: () => void;
  setPlayerSlot: (player: MiXIPlayer, slot: number) => void;
}

export const useMiXIStore = create<MiXIState>()(
  persist(
    (set) => ({
      players: [],
      addPlayer: (player) =>
        set((s) => {
          const filtered = s.players.filter((p) => p.id !== player.id && p.slot !== player.slot);
          if (filtered.length >= 11) return s;
          return { players: [...filtered, player] };
        }),
      removePlayer: (id) =>
        set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
      clear: () => set({ players: [] }),
      setPlayerSlot: (player, slot) =>
        set((s) => {
          const filtered = s.players.filter((p) => p.id !== player.id && p.slot !== slot);
          return { players: [...filtered, { ...player, slot }] };
        }),
    }),
    { name: "mundial-mi-xi" }
  )
);
