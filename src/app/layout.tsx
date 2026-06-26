import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { SplashScreen } from "@/components/shared/SplashScreen";
import { StyleGuard } from "@/components/shared/StyleGuard";
import { ChunkLoadRecovery } from "@/components/shared/ChunkLoadRecovery";
import { TournamentPhaseSync } from "@/components/shared/TournamentPhaseSync";
import { LiveScoreSync } from "@/components/shared/LiveScoreSync";
import { AppShell } from "@/components/shared/AppShell";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { NavigationEvents } from "@/components/shared/NavigationEvents";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Mundial 2026 — Análisis Táctico & Estadísticas",
  description: "Plataforma integral de análisis táctico y estadísticas del FIFA World Cup 2026",
  themeColor: "#0F172A",
};

const forceDarkScript = `
  document.documentElement.classList.add('dark');
  try { localStorage.removeItem('mundial-theme'); } catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: forceDarkScript }} />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <NavigationEvents />
        </Suspense>
        <Providers>
          <ChunkLoadRecovery />
          <TournamentPhaseSync />
          <LiveScoreSync />
          <StyleGuard />
          <SplashScreen />
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
