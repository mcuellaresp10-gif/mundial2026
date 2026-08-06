"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ShortlistTag = "watch" | "target" | "discard";

export interface ShortlistEntry {
  playerId: number;
  name: string;
  team: string;
  photo: string;
  position: string;
  tag: ShortlistTag;
  note: string;
  addedAt: number;
}

interface ShortlistState {
  entries: ShortlistEntry[];
  add: (entry: Omit<ShortlistEntry, "addedAt" | "tag" | "note"> & Partial<Pick<ShortlistEntry, "tag" | "note">>) => void;
  remove: (playerId: number) => void;
  setTag: (playerId: number, tag: ShortlistTag) => void;
  setNote: (playerId: number, note: string) => void;
  has: (playerId: number) => boolean;
}

export const useScoutingShortlistStore = create<ShortlistState>()(
  persist(
    (set, get) => ({
      entries: [],
      add: (entry) => {
        const existing = get().entries.find((e) => e.playerId === entry.playerId);
        if (existing) return;
        set({
          entries: [
            {
              ...entry,
              tag: entry.tag ?? "watch",
              note: entry.note ?? "",
              addedAt: Date.now(),
            },
            ...get().entries,
          ].slice(0, 100),
        });
      },
      remove: (playerId) =>
        set({ entries: get().entries.filter((e) => e.playerId !== playerId) }),
      setTag: (playerId, tag) =>
        set({
          entries: get().entries.map((e) =>
            e.playerId === playerId ? { ...e, tag } : e
          ),
        }),
      setNote: (playerId, note) =>
        set({
          entries: get().entries.map((e) =>
            e.playerId === playerId ? { ...e, note } : e
          ),
        }),
      has: (playerId) => get().entries.some((e) => e.playerId === playerId),
    }),
    { name: "futbol-americas-scouting-shortlist-v1" }
  )
);
