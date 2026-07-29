"use client";

import { useEffect, useState } from "react";
import { Keyboard, Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatearTiempo,
  useCrucigramaGame,
} from "@/hooks/useCrucigramaGame";
import {
  CrucigramaGrilla,
  CrucigramaPistas,
  CrucigramaTeclado,
} from "./CrucigramaUI";

export function CrucigramaGame() {
  const game = useCrucigramaGame();
  const { estado, palabraActiva } = game;
  const [popupCompleto, setPopupCompleto] = useState(false);

  useEffect(() => {
    if (estado.completado) setPopupCompleto(true);
  }, [estado.completado]);

  const jugarOtro = () => {
    setPopupCompleto(false);
    game.nuevoCrucigrama();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-sm tabular-nums text-muted-foreground">
          <span>{formatearTiempo(estado.tiempoSegundos)}</span>
          <span>·</span>
          <span>{estado.errores} errores</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => game.setTecladoVisible((v) => !v)}
          >
            <Keyboard className="mr-1.5 h-4 w-4" />
            Teclado
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!palabraActiva || estado.completado}
            onClick={game.usarPista}
          >
            <Lightbulb className="mr-1.5 h-4 w-4" />
            Pista
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={jugarOtro}
          >
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Nuevo crucigrama
          </Button>
        </div>
      </div>

      {palabraActiva && (
        <p className="rounded-lg border border-mundial-gold/25 bg-mundial-gold/5 px-3 py-2 text-sm">
          <span className="mr-1.5 font-semibold text-mundial-gold">
            {palabraActiva.numero}.
          </span>
          {palabraActiva.pista}
          <span className="ml-2 text-xs text-muted-foreground">
            ({palabraActiva.direccion === "across" ? "Horizontal" : "Vertical"} ·{" "}
            {palabraActiva.palabra.length} letras)
          </span>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,340px)] lg:items-start">
        <div className="space-y-3">
          <CrucigramaGrilla
            crucigrama={estado.crucigrama}
            respuestas={estado.respuestasUsuario}
            seleccion={estado.celdaSeleccionada}
            celdasActivas={game.celdasPalabraActiva}
            onSelect={game.seleccionarCelda}
          />
          {game.tecladoVisible && (
            <CrucigramaTeclado
              onLetter={game.ingresarLetra}
              onBackspace={game.borrarLetra}
            />
          )}
        </div>

        <CrucigramaPistas
          crucigrama={estado.crucigrama}
          activaId={palabraActiva?.id ?? null}
          onSelect={(id) => {
            const p = estado.crucigrama.palabrasUbicadas.find((x) => x.id === id);
            if (p) game.seleccionarPalabra(p);
          }}
        />
      </div>

      <Dialog open={popupCompleto} onOpenChange={setPopupCompleto}>
        <DialogContent className="max-w-sm border-mundial-gold/40 bg-background text-center sm:rounded-xl">
          <DialogHeader className="space-y-2 text-center sm:text-center">
            <DialogTitle className="text-xl">¡Crucigrama completo!</DialogTitle>
            <DialogDescription>
              Tiempo {formatearTiempo(estado.tiempoSegundos)} · {estado.errores}{" "}
              errores
            </DialogDescription>
          </DialogHeader>
          <Button className="w-full" onClick={jugarOtro}>
            Jugar otro
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
