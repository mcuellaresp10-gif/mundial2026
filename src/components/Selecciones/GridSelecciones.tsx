"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GridSkeleton } from "@/components/shared/Loading";
import type { Team } from "@/types";
import { getTeamColors } from "@/utils/colors";
import { translateTeamName, teamNameMatchesQuery } from "@/utils/teamNames";

interface GridSeleccionesProps {
  teams: Team[];
  isLoading: boolean;
}

export function GridSelecciones({ teams, isLoading }: GridSeleccionesProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return teams;
    const q = search.toLowerCase();
    return teams.filter(
      (t) =>
        teamNameMatchesQuery(t.name, q) ||
        teamNameMatchesQuery(t.country, q)
    );
  }, [teams, search]);

  if (isLoading) return <GridSkeleton count={12} />;

  return (
    <div className="space-y-6">
      <Input
        placeholder="Buscar selección por país..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filtered.map((team) => {
          const displayName = translateTeamName(team.name);
          const displayCountry = translateTeamName(team.country);
          const colors = getTeamColors(team.name);
          const isColombia = team.name.toLowerCase().includes("colombia");
          return (
            <Link key={team.id} href={`/selecciones/${team.id}`}>
              <Card
                className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                  isColombia ? "border-colombia-yellow/50 bg-colombia-yellow/5" : ""
                }`}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2">
                  <Image src={team.logo} alt={displayName} width={56} height={56} />
                  <p className="font-semibold text-sm text-center" style={{ color: colors.primary }}>
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">{displayCountry}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
