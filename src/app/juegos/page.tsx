"use client";

import Link from "next/link";
import { Compass, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function JuegosPage() {
  return (
    <div className="space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Juegos</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">
          Mini-juegos y desafíos de Fútbol Américas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-mundial-gold/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserRound className="h-5 w-5 text-mundial-gold" />
              Simulador de carrera
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Crea un futbolista en la cantera BetPlay, toma decisiones por periodos de
              2 años y busca llegar a Europa.
            </p>
            <Button asChild>
              <Link href="/juegos/carrera">Jugar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-mundial-gold/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Compass className="h-5 w-5 text-mundial-gold" />
              Ideología futbolística
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              20 dilemas A o B. Descubre qué DT (Pep, Cholo, Bielsa, Pékerman…) se
              parece más a tu forma de ver el fútbol.
            </p>
            <Button asChild>
              <Link href="/juegos/ideologia">Hacer el test</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
