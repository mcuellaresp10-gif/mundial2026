"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  useScoutingShortlistStore,
  type ShortlistTag,
} from "@/stores/useScoutingShortlistStore";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";

const TAG_LABEL: Record<ShortlistTag, string> = {
  watch: "Watch",
  target: "Target",
  discard: "Descartado",
};

export function ScoutingShortlistPanel({ onSelect }: { onSelect: (id: number) => void }) {
  const entries = useScoutingShortlistStore((s) => s.entries);
  const remove = useScoutingShortlistStore((s) => s.remove);
  const setTag = useScoutingShortlistStore((s) => s.setTag);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Shortlist ({entries.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="max-h-[280px] overflow-y-auto divide-y text-sm">
          {entries.map((e) => (
            <li key={e.playerId} className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                className="min-w-0 flex-1 truncate text-left font-medium hover:underline"
                onClick={() => onSelect(e.playerId)}
              >
                {e.name}
              </button>
              <Select
                className="h-7 w-[110px] text-xs"
                value={e.tag}
                onChange={(ev) =>
                  setTag(e.playerId, ev.target.value as ShortlistTag)
                }
              >
                {(Object.keys(TAG_LABEL) as ShortlistTag[]).map((tag) => (
                  <option key={tag} value={tag}>
                    {TAG_LABEL[tag]}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => remove(e.playerId)}
              >
                Quitar
              </Button>
            </li>
          ))}
          {entries.length === 0 && (
            <li className="px-3 py-3 text-xs text-muted-foreground">
              Guarda jugadores desde la ficha para armar tu lista.
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

export function ScoutingShortlistToggle({ profile }: { profile: ScoutingProfile }) {
  const has = useScoutingShortlistStore((s) => s.has(profile.playerId));
  const add = useScoutingShortlistStore((s) => s.add);
  const remove = useScoutingShortlistStore((s) => s.remove);

  return (
    <Button
      type="button"
      size="sm"
      variant={has ? "secondary" : "outline"}
      onClick={() => {
        if (has) remove(profile.playerId);
        else
          add({
            playerId: profile.playerId,
            name: profile.name,
            team: profile.team,
            photo: profile.photo,
            position: profile.position,
          });
      }}
    >
      {has ? "En shortlist" : "Añadir a shortlist"}
    </Button>
  );
}
