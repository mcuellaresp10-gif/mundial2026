"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/useThemeStore";
import { cn } from "@/lib/utils";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <div className={cn(theme === "dark" && "dark")}>{children}</div>;
}
