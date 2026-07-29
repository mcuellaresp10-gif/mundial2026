"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const PRESI_URL = "https://presi.onrender.com/";

export default function PresiPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 animate-in fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            <Link href="/juegos" className="hover:text-mundial-gold">
              Juegos
            </Link>
            {" · "}Presi
          </p>
          <h1 className="mt-1 text-3xl font-bold">Presi</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Fantasy de la Liga BetPlay — armá tu equipo, tu sede y compite jornada
            a jornada.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="shrink-0 self-start">
          <a href={PRESI_URL} target="_blank" rel="noopener noreferrer">
            Abrir en otra pestaña
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
      </div>

      <div className="relative min-h-[70vh] flex-1 overflow-hidden rounded-xl border border-border/60 bg-muted/20">
        <iframe
          title="Presi — Fantasy Liga BetPlay"
          src={PRESI_URL}
          className="absolute inset-0 h-full w-full border-0"
          allow="clipboard-write; fullscreen"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Si la pantalla queda en blanco, es posible que Presi bloquee el embeber.
        Usá{" "}
        <a
          href={PRESI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mundial-gold hover:underline"
        >
          Abrir en otra pestaña
        </a>
        .
      </p>
    </div>
  );
}
