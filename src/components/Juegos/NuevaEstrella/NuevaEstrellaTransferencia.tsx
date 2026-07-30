"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OfertaTransferencia } from "@/data/nueva-estrella/types";

interface Props {
  oferta: OfertaTransferencia;
  onAceptar: () => void;
  onRechazar: () => void;
}

export function NuevaEstrellaTransferencia({
  oferta,
  onAceptar,
  onRechazar,
}: Props) {
  return (
    <Card className="max-w-md mx-auto border-mundial-gold/40">
      <CardHeader>
        <CardTitle>Oferta de transferencia</CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Tu agente negoció un movimiento.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold">{oferta.clubNombre}</p>
          <p className="text-sm text-muted-foreground capitalize">
            Nivel {oferta.nivel.replace("_", " ")}
          </p>
          <p className="mt-2 text-lg">
            Salario ${oferta.salarioSemanal.toLocaleString()}/sem
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={onAceptar}>
            Aceptar
          </Button>
          <Button className="flex-1" variant="outline" onClick={onRechazar}>
            Rechazar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
