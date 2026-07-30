import type { Posicion } from "@/data/carrera/types";
import { STATS_FIELD, STATS_GK } from "@/data/ruleta-carrera/opciones";
import type { AtributoRuleta, PasoRuleta } from "@/data/ruleta-carrera/types";

function labelStat(posicion: Posicion, atributo: AtributoRuleta): string {
  const lista = posicion === "arquero" ? STATS_GK : STATS_FIELD;
  return lista.find((s) => s.atributo === atributo)?.label ?? atributo;
}

function pushTitulosClub(
  pasos: PasoRuleta[],
  teamIndex: number,
  clubNombre: string
) {
  pasos.push({
    id: `titulo-${teamIndex}`,
    kind: "tituloNacional",
    titulo: `Títulos de liga — ${clubNombre}`,
    teamIndex,
  });
  pasos.push({
    id: `copa-${teamIndex}`,
    kind: "copaContinental",
    titulo: `Copa continental — ${clubNombre}`,
    teamIndex,
  });
}

function pushMejoraChain(
  pasos: PasoRuleta[],
  args: {
    teamIndex: number;
    clubNombre: string;
    mejoro: boolean | null | undefined;
    atributoElegido: AtributoRuleta | null | undefined;
    posicion: Posicion | null;
  }
) {
  const { teamIndex, clubNombre } = args;
  pasos.push({
    id: `mejora-${teamIndex}`,
    kind: "mejoraEnClub",
    titulo: `¿Mejoró en ${clubNombre}?`,
    teamIndex,
  });

  if (args.mejoro !== true) return;

  pasos.push({
    id: `mejora-cual-${teamIndex}`,
    kind: "mejoraStatCual",
    titulo: `¿Qué stat mejoró en ${clubNombre}?`,
    teamIndex,
  });

  if (!args.atributoElegido || !args.posicion) return;

  const label = labelStat(args.posicion, args.atributoElegido);
  pasos.push({
    id: `mejora-valor-${teamIndex}-${args.atributoElegido}`,
    kind: "mejoraStatValor",
    titulo: `Nuevo nivel — ${label}`,
    teamIndex,
    atributo: args.atributoElegido,
    labelAtributo: label,
  });
}

/** Construye la lista de pasos según posición y cantidad de equipos. */
export function construirPasos(args: {
  posicion: Posicion | null;
  cantidadEquipos: number | null;
  convocado: boolean | null;
  tieneHabilidad: boolean | null;
  nombresEquipos?: (string | undefined)[];
  mejorasEnClub?: Record<number, boolean | null | undefined>;
  mejoraAttrPorClub?: Partial<Record<number, AtributoRuleta>>;
}): PasoRuleta[] {
  const pasos: PasoRuleta[] = [
    { id: "posicion", kind: "posicion", titulo: "Posición" },
    { id: "edadDebut", kind: "edadDebut", titulo: "Edad de debut" },
    { id: "equipoDebut", kind: "equipoDebut", titulo: "Equipo de debut (BetPlay)" },
    { id: "temporadas", kind: "temporadas", titulo: "Temporadas jugadas" },
  ];

  if (args.posicion) {
    const stats =
      args.posicion === "arquero" ? STATS_GK : STATS_FIELD;
    for (const s of stats) {
      pasos.push({
        id: `stat-${s.atributo}`,
        kind: "stat",
        titulo: `Stat: ${s.label}`,
        atributo: s.atributo,
        labelAtributo: s.label,
      });
    }
  }

  pasos.push({
    id: "tieneHabilidad",
    kind: "tieneHabilidad",
    titulo: "¿Tiene habilidad especial?",
  });

  if (args.tieneHabilidad === true) {
    pasos.push({
      id: "habilidad",
      kind: "habilidad",
      titulo: "Habilidad especial",
    });
  }

  pasos.push({
    id: "cantidadEquipos",
    kind: "cantidadEquipos",
    titulo: "Cantidad de equipos",
  });

  const n = args.cantidadEquipos;
  const nombres = args.nombresEquipos ?? [];
  const mejoras = args.mejorasEnClub ?? {};
  const attrs = args.mejoraAttrPorClub ?? {};

  if (n != null && n >= 1) {
    for (let i = 1; i < n; i++) {
      const clubPrev = nombres[i - 1] ?? `club #${i}`;
      pasos.push({
        id: `region-${i}`,
        kind: "region",
        titulo: `Destino del club #${i + 1}`,
        teamIndex: i,
      });
      pasos.push({
        id: `equipo-${i}`,
        kind: "equipo",
        titulo: `Equipo #${i + 1}`,
        teamIndex: i,
      });
      pasos.push({
        id: `salida-${i - 1}`,
        kind: "motivoSalida",
        titulo: `Motivo de salida del ${clubPrev}`,
        fromTeamIndex: i - 1,
      });
      // Títulos del club que deja, luego si mejoró stats
      pushTitulosClub(pasos, i - 1, clubPrev);
      pushMejoraChain(pasos, {
        teamIndex: i - 1,
        clubNombre: clubPrev,
        mejoro: mejoras[i - 1],
        atributoElegido: attrs[i - 1],
        posicion: args.posicion,
      });
    }

    // Último club: títulos y posible mejora (sin salida)
    const clubUltimo = nombres[n - 1] ?? `club #${n}`;
    pushTitulosClub(pasos, n - 1, clubUltimo);
    pushMejoraChain(pasos, {
      teamIndex: n - 1,
      clubNombre: clubUltimo,
      mejoro: mejoras[n - 1],
      atributoElegido: attrs[n - 1],
      posicion: args.posicion,
    });
  }

  pasos.push({ id: "goles", kind: "goles", titulo: "Goles totales de carrera" });
  pasos.push({
    id: "golesExacto",
    kind: "golesExacto",
    titulo: "Goles exactos",
  });
  pasos.push({
    id: "asistencias",
    kind: "asistencias",
    titulo: "Asistencias totales de carrera",
  });
  pasos.push({
    id: "asistenciasExacto",
    kind: "asistenciasExacto",
    titulo: "Asistencias exactas",
  });

  if (
    args.posicion === "arquero" ||
    args.posicion === "defensa_central" ||
    args.posicion === "lateral"
  ) {
    pasos.push({
      id: "vallas",
      kind: "vallas",
      titulo: "Vallas invictas de carrera",
    });
    pasos.push({
      id: "vallasExacto",
      kind: "vallasExacto",
      titulo: "Vallas invictas exactas",
    });
  }

  pasos.push({
    id: "seleccionConvocado",
    kind: "seleccionConvocado",
    titulo: "¿Convocado a Selección Colombia?",
  });

  if (args.convocado === true) {
    pasos.push({
      id: "seleccionLogro",
      kind: "seleccionLogro",
      titulo: "Logro con la Selección",
    });
  }

  pasos.push({ id: "retiro", kind: "retiro", titulo: "Motivo de retiro" });

  return pasos;
}
