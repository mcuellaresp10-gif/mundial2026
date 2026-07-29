"use client";

import Link from "next/link";
import { RuletaCarreraGame } from "@/components/Juegos/RuletaCarrera/RuletaCarreraGame";

export default function RuletaCarreraPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          <Link href="/juegos" className="hover:text-mundial-gold">
            Juegos
          </Link>
          {" · "}Ruleta de carrera
        </p>
        <h1 className="mt-1 text-3xl font-bold">Ruleta de carrera</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Girá la rueda por cada categoría, sin reintentos. Arrancás en BetPlay y
          la ruleta arma tu leyenda hasta el retiro.
        </p>
      </div>

      <RuletaCarreraGame />
    </div>
  );
}
