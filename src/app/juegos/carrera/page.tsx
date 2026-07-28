"use client";

import Link from "next/link";
import { CarreraGame } from "@/components/Juegos/Carrera/CarreraGame";

export default function CarreraPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            <Link href="/juegos" className="hover:text-mundial-gold">
              Juegos
            </Link>
            {" · "}Carrera
          </p>
          <h1 className="text-3xl font-bold mt-1">Simulador de carrera</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
            Elige tu propia aventura: de la cantera a las grandes ligas. Cada periodo
            suma 2 años de goles, títulos y decisiones. Ficción con anclaje al fútbol
            colombiano.
          </p>
        </div>
      </div>

      <CarreraGame />
    </div>
  );
}
