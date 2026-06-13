"use client";

import { use } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { PerfilJugador } from "@/components/Jugadores/PerfilJugador";
import { usePlayer } from "@/hooks/useJugadores";
import { useMiXIStore } from "@/stores/useMiXIStore";
import { PLAYER_STAT_SEASON_LABEL } from "@/lib/utils";
import { formatPosition } from "@/utils/formatters";
import { getStatBundle, statSummary } from "@/utils/playerStats";
import { translateTeamName } from "@/utils/teamNames";
import { GridSkeleton } from "@/components/shared/Loading";

export default function PerfilJugadorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const playerId = Number(id);
  const { data: player, isLoading } = usePlayer(playerId);
  const addPlayer = useMiXIStore((s) => s.addPlayer);

  if (isLoading || !player) return <GridSkeleton count={4} />;

  const bundle = getStatBundle(player);
  const nat = statSummary(bundle.national);
  const club = statSummary(bundle.club);
  const dorsal = bundle.national?.games.number ?? bundle.club?.games.number;

  const handleAddToXI = () => {
    addPlayer({
      id: player.player.id,
      name: player.player.name,
      photo: player.player.photo,
      team: translateTeamName(player.nationalTeam?.name ?? nat.teamName),
      position: bundle.national?.games.position ?? bundle.club?.games.position ?? "M",
      rating: nat.rating > 0 ? nat.rating : club.rating,
      slot: useMiXIStore.getState().players.length,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-wrap items-start gap-6">
        <Image
          src={player.player.photo}
          alt={player.player.name}
          width={120}
          height={120}
          className="rounded-full border-4 border-mundial-gold"
        />
        <div className="flex-1">
          <h1 className="text-4xl font-bold">{player.player.name}</h1>
          <p className="text-muted-foreground mt-1">
            {formatPosition(bundle.national?.games.position ?? bundle.club?.games.position)}
            {player.nationalTeam && ` · ${translateTeamName(player.nationalTeam.name)}`}
            {club.teamName !== "N/D" && ` · ${club.teamName}`}
          </p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            <span>Edad: {player.player.age ?? "N/D"}</span>
            <span>Altura: {player.player.height ?? "N/D"}</span>
            <span>Peso: {player.player.weight ?? "N/D"}</span>
            <span>Dorsal: {dorsal ?? "N/D"}</span>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="rounded-lg border px-4 py-2 text-sm">
              <p className="text-xs text-muted-foreground uppercase">Selección · Temp. {PLAYER_STAT_SEASON_LABEL}</p>
              <p className="font-mono font-bold">{nat.goals}G · {nat.assists}A · Valoración {nat.rating > 0 ? nat.rating.toFixed(1) : "N/D"}</p>
            </div>
            <div className="rounded-lg border px-4 py-2 text-sm">
              <p className="text-xs text-muted-foreground uppercase">Club · Temp. {PLAYER_STAT_SEASON_LABEL}</p>
              <p className="font-mono font-bold">{club.goals}G · {club.assists}A · Valoración {club.rating > 0 ? club.rating.toFixed(1) : "N/D"}</p>
            </div>
          </div>
          <Button className="mt-4" onClick={handleAddToXI}>
            + Agregar a Mi XI
          </Button>
        </div>
      </div>

      <PerfilJugador player={player} />
    </div>
  );
}
