"use client";

import { useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useFixtures, useRefreshStandingsAndNext } from "@/hooks/usePartidos";
import { LIVE_REFRESH_MS, shouldPollFixtures } from "@/lib/liveRefresh";
import { isLiveSessionActive } from "@/services/liveSession";
import { useUIStore } from "@/stores/useUIStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: fixtures = [] } = useFixtures();
  const refresh = useRefreshStandingsAndNext();
  const setLastRefresh = useUIStore((s) => s.setLastRefresh);

  const shouldRefresh =
    isLiveSessionActive() || shouldPollFixtures(fixtures);

  useEffect(() => {
    if (!shouldRefresh) return;
    const interval = setInterval(() => {
      refresh();
      setLastRefresh(Date.now());
    }, LIVE_REFRESH_MS.standings);
    return () => clearInterval(interval);
  }, [shouldRefresh, refresh, setLastRefresh]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Sidebar />
      <main className="flex-1 pt-[70px] lg:pl-60">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 min-h-[calc(100vh-110px)]">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
