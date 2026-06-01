import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ColombiaModeState {
  colombiaMode: boolean;
  toggleColombiaMode: () => void;
}

export const useColombiaModeStore = create<ColombiaModeState>()(
  persist(
    (set) => ({
      colombiaMode: true,
      toggleColombiaMode: () => set((s) => ({ colombiaMode: !s.colombiaMode })),
    }),
    { name: "mundial-colombia-mode" }
  )
);
