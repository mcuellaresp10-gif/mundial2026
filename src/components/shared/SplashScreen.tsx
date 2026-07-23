"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/useUIStore";
import { cn } from "@/lib/utils";

export function SplashScreen() {
  const splashDone = useUIStore((s) => s.splashDone);
  const setSplashDone = useUIStore((s) => s.setSplashDone);

  useEffect(() => {
    const timer = setTimeout(() => setSplashDone(true), 1500);
    return () => clearTimeout(timer);
  }, [setSplashDone]);

  if (splashDone) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-mundial-deep transition-opacity duration-500",
        splashDone ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="text-5xl font-bold text-mundial-gold tracking-wider">Fútbol</div>
      <div className="text-2xl font-semibold text-white mt-2">Américas</div>
      <div className="mt-6 h-1 w-32 bg-mundial-gold/30 rounded overflow-hidden">
        <div className="h-full bg-mundial-gold animate-pulse w-2/3" />
      </div>
    </div>
  );
}
