import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  splashDone: boolean;
  lastRefresh: number | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSplashDone: (done: boolean) => void;
  setLastRefresh: (time: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  splashDone: false,
  lastRefresh: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSplashDone: (done) => set({ splashDone: done }),
  setLastRefresh: (time) => set({ lastRefresh: time }),
}));
