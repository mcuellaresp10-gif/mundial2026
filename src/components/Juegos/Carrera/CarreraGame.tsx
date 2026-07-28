"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CarreraSetup } from "./CarreraSetup";
import { CarreraEventos } from "./CarreraEventos";
import { CarreraResultadoTemporada } from "./CarreraResultadoTemporada";
import { CarreraResumen } from "./CarreraResumen";
import { useCarreraGame } from "@/hooks/useCarreraGame";

export function CarreraGame() {
  const game = useCarreraGame();

  if (game.view === "setup" || !game.estado) {
    return <CarreraSetup onStart={game.start} />;
  }

  if (game.view === "eventos" && game.eventoActual) {
    return (
      <CarreraEventos
        estado={game.estado}
        evento={game.eventoActual}
        eventoIndex={game.eventoIndex}
        totalEventos={game.estado.eventosPendientes.length}
        onElegir={game.elegirOpcion}
      />
    );
  }

  if (game.view === "resultado") {
    return (
      <CarreraResultadoTemporada
        estado={game.estado}
        onResolverOferta={game.resolverOferta}
        onContinuar={() => game.continuarSiguienteAnio(false)}
      />
    );
  }

  if (game.view === "retiro_prompt") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>¿Cuelgas los botines?</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Tienes {game.estado.jugador.edad} años y el rendimiento viene en baja. Puedes
            retirarte ahora o pelear un periodo más (el retiro forzado llega a los 42).
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => game.continuarSiguienteAnio(true)}>Retirarme</Button>
          <Button variant="outline" onClick={() => game.continuarSiguienteAnio(false)}>
            Seguir un periodo más
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (game.view === "resumen" && game.resumen) {
    return (
      <CarreraResumen
        estado={game.estado}
        resumen={game.resumen}
        onReiniciar={game.reset}
      />
    );
  }

  return (
    <Card>
      <CardContent className="py-8 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Algo salió mal en la partida.</p>
        <Button onClick={game.reset}>Volver al inicio</Button>
      </CardContent>
    </Card>
  );
}
