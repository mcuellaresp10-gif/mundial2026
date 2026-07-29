"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { claveCelda } from "@/data/crucigrama/types";
import type { CrucigramaGenerado } from "@/data/crucigrama/types";
import { cn } from "@/lib/utils";

interface Props {
  crucigrama: CrucigramaGenerado;
  respuestas: Record<string, string>;
  seleccion: { fila: number; columna: number } | null;
  celdasActivas: Set<string>;
  onSelect: (fila: number, columna: number) => void;
}

export function CrucigramaGrilla({
  crucigrama,
  respuestas,
  seleccion,
  celdasActivas,
  onSelect,
}: Props) {
  const n = crucigrama.tamano.filas;

  return (
    <div
      className="mx-auto grid w-full max-w-[min(100%,420px)] gap-0.5"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
    >
      {crucigrama.celdas.flatMap((row) =>
        row.map((cell) => {
          const key = claveCelda(cell.fila, cell.columna);
          if (cell.letra == null) {
            return (
              <div
                key={key}
                className="aspect-square rounded-[2px] bg-transparent"
                aria-hidden
              />
            );
          }
          const valor = respuestas[key] ?? "";
          const isSel =
            seleccion?.fila === cell.fila && seleccion?.columna === cell.columna;
          const inWord = celdasActivas.has(key);

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(cell.fila, cell.columna)}
              className={cn(
                "relative aspect-square rounded-[2px] border text-center font-bold uppercase transition-colors",
                "border-border/80 bg-background text-sm sm:text-base",
                inWord && "bg-mundial-gold/15 border-mundial-gold/40",
                isSel && "z-[1] ring-2 ring-mundial-gold border-mundial-gold"
              )}
            >
              {cell.numero != null && (
                <span className="absolute left-0.5 top-0 text-[8px] font-semibold leading-none text-mundial-gold sm:text-[9px]">
                  {cell.numero}
                </span>
              )}
              <span className="tabular-nums">{valor}</span>
            </button>
          );
        })
      )}
    </div>
  );
}

interface PistasProps {
  crucigrama: CrucigramaGenerado;
  activaId: string | null;
  onSelect: (id: string) => void;
}

export function CrucigramaPistas({ crucigrama, activaId, onSelect }: PistasProps) {
  const across = crucigrama.palabrasUbicadas.filter((p) => p.direccion === "across");
  const down = crucigrama.palabrasUbicadas.filter((p) => p.direccion === "down");

  const Lista = ({
    titulo,
    items,
  }: {
    titulo: string;
    items: typeof across;
  }) => (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-mundial-gold">
        {titulo}
      </p>
      <ul className="space-y-1.5">
        {items.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => onSelect(p.id)}
              className={cn(
                "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                activaId === p.id
                  ? "bg-mundial-gold/15 text-foreground"
                  : "hover:bg-muted/50 text-muted-foreground"
              )}
            >
              <span className="mr-1.5 font-semibold text-mundial-gold">
                {p.numero}.
              </span>
              {p.pista}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Card className="border-border/60">
      <CardContent className="grid gap-5 p-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6">
        <Lista titulo="Horizontales" items={across} />
        <Lista titulo="Verticales" items={down} />
      </CardContent>
    </Card>
  );
}

const FILAS_TECLADO = [
  "QWERTYUIOP",
  "ASDFGHJKLÑ",
  "ZXCVBNM",
];

export function CrucigramaTeclado({
  onLetter,
  onBackspace,
}: {
  onLetter: (ch: string) => void;
  onBackspace: () => void;
}) {
  return (
    <div className="space-y-1.5 lg:hidden">
      {FILAS_TECLADO.map((fila) => (
        <div key={fila} className="flex justify-center gap-1">
          {fila.split("").map((ch) => (
            <Button
              key={ch}
              type="button"
              variant="outline"
              size="sm"
              className="h-10 min-w-[1.75rem] flex-1 px-0 text-xs font-bold"
              onClick={() => onLetter(ch)}
            >
              {ch}
            </Button>
          ))}
        </div>
      ))}
      <div className="flex justify-center">
        <Button
          type="button"
          variant="secondary"
          className="h-10 w-28"
          onClick={onBackspace}
        >
          Borrar
        </Button>
      </div>
    </div>
  );
}
