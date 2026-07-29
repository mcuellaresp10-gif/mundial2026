"use client";

import Link from "next/link";
import { CrucigramaGame } from "@/components/Juegos/Crucigrama/CrucigramaGame";

export default function CrucigramaPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          <Link href="/juegos" className="hover:text-mundial-gold">
            Juegos
          </Link>
          {" · "}Crucigrama
        </p>
        <h1 className="mt-1 text-3xl font-bold">Crucigrama</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Fútbol colombiano, sudamericano y Mundiales. Tocá una celda, leé la pista y
          completá la palabra. Cada partida arma una grilla nueva.
        </p>
      </div>

      <CrucigramaGame />
    </div>
  );
}
