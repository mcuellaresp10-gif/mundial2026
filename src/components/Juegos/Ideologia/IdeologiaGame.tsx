"use client";

import { IdeologiaIntro } from "./IdeologiaIntro";
import { IdeologiaPregunta } from "./IdeologiaPregunta";
import { IdeologiaResultado } from "./IdeologiaResultado";
import { useIdeologiaTest } from "@/hooks/useIdeologiaTest";

export function IdeologiaGame() {
  const game = useIdeologiaTest();

  if (game.view === "intro") {
    return <IdeologiaIntro onStart={game.start} />;
  }

  if (game.view === "pregunta" && game.dilemaActual) {
    return (
      <IdeologiaPregunta
        dilema={game.dilemaActual}
        actual={game.progreso.actual}
        total={game.progreso.total}
        onElegir={game.elegir}
      />
    );
  }

  if (game.view === "resultado" && game.resultado) {
    return (
      <IdeologiaResultado resultado={game.resultado} onReiniciar={game.reiniciar} />
    );
  }

  return <IdeologiaIntro onStart={game.start} />;
}
