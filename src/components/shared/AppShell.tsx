"use client";

import { useEffect } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import { useFixtures, useRefreshAll } from "@/hooks/usePartidos";
import { useUIStore } from "@/stores/useUIStore";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: fixtures = [] } = useFixtures();
  const refresh = useRefreshAll();
  const setLastRefresh = useUIStore((s) => s.setLastRefresh);

  const hasActive = fixtures.some(
    (f) => ["LIVE", "1H", "2H", "HT"].includes(f.fixture.status.short)
  );

  useEffect(() => {
    if (!hasActive) return;
    const interval = setInterval(() => {
      refresh();
      setLastRefresh(Date.now());
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [hasActive, refresh, setLastRefresh]);

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
