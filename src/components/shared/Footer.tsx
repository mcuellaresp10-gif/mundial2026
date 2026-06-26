"use client";

import { MessageCircleWarning } from "lucide-react";
import { FeedbackDialog } from "./FeedbackDialog";
import { APP_VERSION } from "@/lib/appVersion";

export function Footer() {
  return (
    <footer className="h-10 flex items-center justify-center gap-3 text-xs text-muted-foreground border-t mt-auto px-4">
      <span>Mundial 2026 — Análisis Táctico & Estadísticas · {APP_VERSION}</span>
      <span className="text-border">·</span>
      <FeedbackDialog
        trigger={
          <button
            type="button"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-mundial-gold transition-colors"
          >
            <MessageCircleWarning className="h-3.5 w-3.5" aria-hidden="true" />
            Reportar problema
          </button>
        }
      />
    </footer>
  );
}
