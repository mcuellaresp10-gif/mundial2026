"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { OnceIdealPlayer, FormationType } from "@/types";
import { MapaFormacion } from "./MapaFormacion";
import { OnceIdealPlayerCards } from "./OnceIdealPlayerCards";
import { OnceIdealSpotlight, OnceIdealLineList } from "./OnceIdealSpotlight";
import { SelectorFormacion } from "./SelectorFormacion";
import { countUniqueTeams, findMvp } from "@/utils/onceIdealUi";
import { cn } from "@/lib/utils";

interface OnceIdealExperienceProps {
  players: OnceIdealPlayer[];
  averageRating: number;
  formation?: FormationType;
  onFormationChange?: (f: FormationType) => void;
  showFormationSelector?: boolean;
  isPartial?: boolean;
}

function StatChip({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | number;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2 min-w-0">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      {children ?? (
        <p className="font-mono text-lg font-bold text-mundial-gold">{value}</p>
      )}
    </div>
  );
}

export function OnceIdealExperience({
  players,
  averageRating,
  formation,
  onFormationChange,
  showFormationSelector = false,
  isPartial = false,
}: OnceIdealExperienceProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const mvp = useMemo(() => findMvp(players), [players]);
  const selected = useMemo(
    () => players.find((p) => p.id === selectedId) ?? null,
    [players, selectedId]
  );

  useEffect(() => {
    if (selectedId && !players.some((p) => p.id === selectedId)) {
      setSelectedId(null);
    }
  }, [players, selectedId]);

  const handleSelect = (p: OnceIdealPlayer) => {
    setSelectedId((prev) => (prev === p.id ? null : p.id));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-3 min-w-0">
          <StatChip label="Valoración media" value={averageRating} />
          <StatChip label="Selecciones">
            <p className="font-mono text-lg font-bold">{countUniqueTeams(players)}</p>
          </StatChip>
          <StatChip label="MVP del once">
            {mvp ? (
              <div className="mt-0.5 flex items-center gap-2 min-w-0">
                <Image
                  src={mvp.photo}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-full shrink-0 border border-mundial-gold/50"
                  unoptimized
                />
                <span className="truncate text-sm font-semibold">
                  {mvp.name.split(" ").pop()}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </StatChip>
        </div>
        {showFormationSelector && formation && onFormationChange && (
          <SelectorFormacion value={formation} onChange={onFormationChange} />
        )}
      </div>

      {isPartial && (
        <p className="text-xs text-muted-foreground">
          Once parcial ({players.length}/11) — faltan posiciones con jugadores que hayan jugado
          en el torneo.
        </p>
      )}

      <div className={cn("grid gap-5", "lg:grid-cols-[1fr_280px]")}>
        <div className="space-y-4 min-w-0">
          <MapaFormacion
            players={players}
            selectedId={selectedId}
            onSelect={handleSelect}
            mvpId={mvp?.id ?? null}
          />
          <OnceIdealPlayerCards
            players={players}
            mvpId={mvp?.id ?? null}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        <div className="hidden lg:flex lg:flex-col lg:gap-4">
          <OnceIdealSpotlight
            player={selected}
            isMvp={selected?.id === mvp?.id}
            variant="panel"
          />
          <div className="rounded-xl border bg-card p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Por líneas
            </p>
            <OnceIdealLineList
              players={players}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>
        </div>
      </div>

      {selected && (
        <OnceIdealSpotlight
          player={selected}
          isMvp={selected.id === mvp?.id}
          onClose={() => setSelectedId(null)}
          variant="sheet"
        />
      )}
    </div>
  );
}
