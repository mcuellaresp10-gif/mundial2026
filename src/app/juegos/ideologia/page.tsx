"use client";

import Link from "next/link";
import { IdeologiaGame } from "@/components/Juegos/Ideologia/IdeologiaGame";

export default function IdeologiaPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          <Link href="/juegos" className="hover:text-mundial-gold">
            Juegos
          </Link>
          {" · "}Ideología
        </p>
        <h1 className="text-3xl font-bold mt-1">Test de ideología futbolística</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
          Dilemas A o B. Descubre con qué director técnico se parece tu forma de
          entender el juego. Contenido pre-escrito, sin IA en tiempo real.
        </p>
      </div>

      <IdeologiaGame />
    </div>
  );
}
