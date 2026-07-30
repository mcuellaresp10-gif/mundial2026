"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ITEMS_TIENDA } from "@/data/nueva-estrella/tienda";
import type { PartidaNuevaEstrella } from "@/data/nueva-estrella/types";

interface Props {
  partida: PartidaNuevaEstrella;
  onComprar: (itemId: string) => void;
  onVolver: () => void;
  error?: string | null;
}

export function NuevaEstrellaTienda({
  partida,
  onComprar,
  onVolver,
  error,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold">Estilo de vida</h2>
          <p className="text-sm text-muted-foreground">
            Dinero: ${partida.jugador.dinero.toLocaleString()}
          </p>
        </div>
        <Button variant="outline" onClick={onVolver}>
          Volver
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2">
        {ITEMS_TIENDA.map((item) => {
          const owned =
            item.unico && partida.itemsComprados.includes(item.id);
          const caro = partida.jugador.dinero < item.precio;
          return (
            <Card
              key={item.id}
              className={
                item.categoria === "riesgo" ? "border-rose-500/30" : undefined
              }
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.nombre}</CardTitle>
                <p className="text-xs text-muted-foreground font-normal">
                  {item.descripcion}
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  ${item.precio.toLocaleString()} · Fama {item.deltaFama >= 0 ? "+" : ""}
                  {item.deltaFama} · Moral {item.deltaMoral >= 0 ? "+" : ""}
                  {item.deltaMoral}
                </p>
                <Button
                  size="sm"
                  disabled={owned || caro}
                  onClick={() => onComprar(item.id)}
                >
                  {owned ? "Ya lo tenés" : caro ? "Sin fondos" : "Comprar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
