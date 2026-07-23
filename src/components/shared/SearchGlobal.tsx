"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTeams, useFixtures } from "@/hooks/usePartidos";
import type { SearchResult } from "@/types";
import { cn } from "@/lib/utils";
import { translateTeamName, teamNameMatchesQuery, formatFixtureTeamsLabel } from "@/utils/teamNames";
import { formatRoundLabel } from "@/utils/formatters";

export function SearchGlobal() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: teams = [] } = useTeams();
  const { data: fixtures = [] } = useFixtures();

  const search = useCallback(
    (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      const lower = q.toLowerCase();
      const found: SearchResult[] = [];

      for (const team of teams) {
        if (teamNameMatchesQuery(team.name, q)) {
          found.push({
            type: "team",
            id: team.id,
            label: translateTeamName(team.name),
            subtitle: translateTeamName(team.country),
            href: `/selecciones/${team.id}`,
          });
        }
      }

      for (const f of fixtures) {
        const label = formatFixtureTeamsLabel(f.teams.home.name, f.teams.away.name);
        if (
          label.toLowerCase().includes(lower) ||
          `${f.teams.home.name} vs ${f.teams.away.name}`.toLowerCase().includes(lower)
        ) {
          found.push({
            type: "fixture",
            id: f.fixture.id,
            label,
            subtitle: formatRoundLabel(f.league.round),
            href: `/partidos/${f.fixture.id}`,
          });
        }
      }

      setResults(found.slice(0, 8));
    },
    [teams, fixtures]
  );

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (result: SearchResult) => {
    router.push(result.href);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
        <Input
          placeholder="Buscar equipo, partido..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl border z-50 overflow-hidden">
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}`}
              onClick={() => handleSelect(r)}
              className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-3"
            >
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                r.type === "team" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
              )}>
                {r.type === "team" ? "SEL" : "PART"}
              </span>
              <div>
                <p className="text-sm font-medium">{r.label}</p>
                {r.subtitle && <p className="text-xs text-muted-foreground">{r.subtitle}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
