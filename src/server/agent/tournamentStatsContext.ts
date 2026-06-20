import type { Player } from "@/types";
import { DEFAULT_SEASON, LEAGUE_ID } from "@/lib/utils";
import { getWorldCupPlayersPage, getWorldCupTopScorers } from "@/server/footballClient";
import { translateTeamName } from "@/utils/teamNames";

interface PassLeader {
  playerId: number;
  name: string;
  team: string;
  passesTotal: number;
  passesAccuracy: number | null;
  passesKey: number;
  minutes: number;
}

function wcStatRow(player: Player) {
  return player.statistics.find(
    (s) => s.league.id === LEAGUE_ID && s.league.season === DEFAULT_SEASON
  );
}

async function loadWorldCupPlayers(maxPages = 4): Promise<Player[]> {
  const all: Player[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const { players, paging } = await getWorldCupPlayersPage(page);
    all.push(...players);
    if (page >= paging.total) break;
    if (players.length === 0) break;
  }
  return all;
}

function buildPassLeaders(players: Player[], limit = 12): PassLeader[] {
  const leaders: PassLeader[] = [];
  for (const p of players) {
    const stat = wcStatRow(p);
    if (!stat) continue;
    const passesTotal = stat.passes.total ?? 0;
    if (passesTotal <= 0) continue;
    leaders.push({
      playerId: p.player.id,
      name: p.player.name,
      team: translateTeamName(stat.team.name),
      passesTotal,
      passesAccuracy: stat.passes.accuracy,
      passesKey: stat.passes.key ?? 0,
      minutes: stat.games.minutes ?? 0,
    });
  }
  return leaders.sort((a, b) => b.passesTotal - a.passesTotal).slice(0, limit);
}

function buildAccuratePassLeaders(players: Player[], limit = 12): PassLeader[] {
  return buildPassLeaders(players, 50)
    .filter((p) => p.passesTotal >= 20)
    .sort((a, b) => {
      const accA = a.passesAccuracy ?? 0;
      const accB = b.passesAccuracy ?? 0;
      if (accB !== accA) return accB - accA;
      return b.passesTotal - a.passesTotal;
    })
    .slice(0, limit);
}

/** Estadísticas agregadas de jugadores del Mundial 2026 para el agente. */
export async function formatTournamentPlayerStatsContext(
  question: string
): Promise<string | null> {
  const q = question.toLowerCase();
  const wantsPasses = /pases?|passes|precisi[oó]n de pase|pases exitosos|pases acertados/.test(q);
  const wantsAssists = /asistencias?|assists/.test(q);
  const wantsGoals = /goleador|goleadores|goles|bota de oro|artiller/.test(q);
  const wantsGeneral = /estad[ií]stica|stats|rating|minutos|tarjetas|jugador/.test(q);

  if (!wantsPasses && !wantsAssists && !wantsGoals && !wantsGeneral) {
    return null;
  }

  const parts: string[] = ["ESTADÍSTICAS JUGADORES — MUNDIAL 2026 (API-Football):"];

  try {
    if (wantsGoals || wantsGeneral) {
      const scorers = await getWorldCupTopScorers();
      if (scorers.length > 0) {
        parts.push(
          "TOP GOLEADORES:",
          scorers
            .slice(0, 15)
            .map(
              (s, i) =>
                `${i + 1}. ${s.name} (${s.team}) — ${s.goals} goles, ${s.assists} asistencias, ${s.matches} PJ`
            )
            .join("\n")
        );
      } else {
        parts.push("TOP GOLEADORES: aún sin goles registrados en el torneo.");
      }
    }

    if (wantsAssists || wantsGeneral) {
      const scorers = await getWorldCupTopScorers();
      const byAssists = [...scorers].sort((a, b) => b.assists - a.assists).slice(0, 12);
      if (byAssists.some((s) => s.assists > 0)) {
        parts.push(
          "TOP ASISTENCIAS:",
          byAssists
            .filter((s) => s.assists > 0)
            .map(
              (s, i) =>
                `${i + 1}. ${s.name} (${s.team}) — ${s.assists} asistencias, ${s.goals} goles`
            )
            .join("\n")
        );
      }
    }

    if (wantsPasses || wantsGeneral) {
      const players = await loadWorldCupPlayers();
      if (players.length === 0) {
        parts.push(
          "PASES: no hay datos de jugadores cargados aún (torneo pre-inicio o API sin stats)."
        );
      } else {
        const byTotal = buildPassLeaders(players);
        const byAccuracy = buildAccuratePassLeaders(players);

        if (byTotal.length > 0) {
          parts.push(
            "TOP PASES TOTALES (Mundial 2026):",
            byTotal
              .map(
                (p, i) =>
                  `${i + 1}. ${p.name} (${p.team}) — ${p.passesTotal} pases${
                    p.passesAccuracy != null ? `, ${p.passesAccuracy}% precisión` : ""
                  }, ${p.passesKey} clave, ${p.minutes} min`
              )
              .join("\n")
          );
        }

        if (wantsPasses && byAccuracy.length > 0) {
          parts.push(
            "TOP PRECISIÓN DE PASE (mín. 20 pases):",
            byAccuracy
              .map(
                (p, i) =>
                  `${i + 1}. ${p.name} (${p.team}) — ${p.passesAccuracy ?? "?"}% (${p.passesTotal} pases)`
              )
              .join("\n")
          );
        }
      }
    }

    return parts.length > 1 ? parts.join("\n\n") : null;
  } catch (err) {
    return `ESTADÍSTICAS JUGADORES: no disponibles (${err instanceof Error ? err.message : "error API"}).`;
  }
}
