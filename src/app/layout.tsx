import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SplashScreen } from "@/components/shared/SplashScreen";
import { StyleGuard } from "@/components/shared/StyleGuard";
import { AppShell } from "@/components/shared/AppShell";

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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans`}>
        <Providers>
          <ThemeProvider>
            <StyleGuard />
            <SplashScreen />
            <AppShell>{children}</AppShell>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
