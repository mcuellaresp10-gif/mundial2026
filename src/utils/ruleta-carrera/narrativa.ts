import { clipAtributo } from "@/data/carrera/atributos";
import type { Atributos, Posicion } from "@/data/carrera/types";
import { POSICION_LABELS } from "@/data/carrera/atributos";
import { labelCopa, labelTitulo } from "@/data/ruleta-carrera/clubes";
import type {
  AtributoRuleta,
  CarreraGenerada,
  HabilidadEspecial,
  PasoEquipo,
} from "@/data/ruleta-carrera/types";

export function aplicarHabilidadAStats(
  statsBase: Partial<Record<AtributoRuleta, number>>,
  habilidad: HabilidadEspecial | null,
  posicion: Posicion
): Atributos {
  const get = (k: AtributoRuleta, fallback: number) =>
    Math.min(
      10,
      (statsBase[k] ?? fallback) +
        (habilidad && habilidad.efecto.atributo === k
          ? habilidad.efecto.bono
          : 0)
    );

  if (posicion === "arquero") {
    return {
      ritmo: clipAtributo(get("ritmo", 5) * 10),
      tiro: clipAtributo(20),
      pase: clipAtributo(get("pase", 5) * 10),
      regate: clipAtributo(25),
      defensa: clipAtributo(get("defensa", 5) * 10),
      fisico: clipAtributo(get("fisico", 5) * 10),
      atajadas: clipAtributo(get("atajadas", 5) * 10),
      reflejos: clipAtributo(get("reflejos", 5) * 10),
    };
  }

  return {
    ritmo: clipAtributo(get("ritmo", 5) * 10),
    tiro: clipAtributo(get("tiro", 5) * 10),
    pase: clipAtributo(get("pase", 5) * 10),
    regate: clipAtributo(get("regate", 5) * 10),
    defensa: clipAtributo(get("defensa", 5) * 10),
    fisico: clipAtributo(get("fisico", 5) * 10),
  };
}

function fraseTitulos(equipos: PasoEquipo[]): string {
  const conLiga = equipos.filter((e) => e.tituloNacional !== "ninguno");
  const continentales = equipos.filter((e) =>
    e.copaContinental.includes("campeon")
  );
  const parts: string[] = [];
  if (conLiga.length === 0 && continentales.length === 0) {
    return "Sin grandes títulos de club en la vitrina, pero con una carrera llena de caminos.";
  }
  if (conLiga.length) {
    parts.push(
      conLiga
        .map((e) => `${labelTitulo(e.tituloNacional)} con ${e.equipo}`)
        .join("; ")
    );
  }
  if (continentales.length) {
    parts.push(
      continentales
        .map((e) => `${labelCopa(e.copaContinental)} con ${e.equipo}`)
        .join("; ")
    );
  }
  return parts.join(". ") + ".";
}

/** Narrativa pura a partir de la carrera generada. */
export function generarNarrativa(c: CarreraGenerada): string {
  const pos = POSICION_LABELS[c.posicion];
  const lineas: string[] = [];

  lineas.push(
    `${c.apellido} debutó a los ${c.edadDebut} años como ${pos} en ${c.equipoDebut}.`
  );

  if (c.habilidadEspecial) {
    lineas.push(
      `Su perfil inicial brilló con la habilidad especial «${c.habilidadEspecial.nombre}» (${c.habilidadEspecial.descripcion}).`
    );
  } else {
    lineas.push("No desarrolló una habilidad especial distintiva.");
  }

  if (c.equipos.length === 1) {
    lineas.push(
      `Fue un verdadero one-club man: toda su carrera la vivió en ${c.equipos[0]!.equipo}.`
    );
  } else {
    for (let i = 1; i < c.equipos.length; i++) {
      const prev = c.equipos[i - 1]!;
      const curr = c.equipos[i]!;
      const motivo = prev.motivoSalida ?? "buscaba un nuevo desafío";
      const anioAprox = 2000 + c.edadDebut + Math.floor((c.temporadas * i) / c.equipos.length);
      lineas.push(
        `En ${anioAprox} fichó por ${curr.equipo} (${curr.ligaNombre}) por ${motivo}.`
      );
    }
  }

  for (const eq of c.equipos) {
    lineas.push(
      `En ${eq.equipo} ${labelTitulo(eq.tituloNacional)} y ${labelCopa(eq.copaContinental)}.`
    );
  }

  const statsBit =
    c.vallasInvictas != null
      ? `dejó ${c.golesTotales} goles, ${c.asistenciasTotales} asistencias y ${c.vallasInvictas} vallas invictas`
      : `dejó ${c.golesTotales} goles y ${c.asistenciasTotales} asistencias`;

  if (c.convocadoSeleccion) {
    lineas.push(
      `Fue convocado a la Selección Colombia: ${c.logroSeleccion ?? "defendió la tricolor"}.`
    );
  } else {
    lineas.push("Nunca fue convocado a la Selección Colombia.");
  }

  lineas.push(
    `Se retiró a los ${c.edadRetiro} años porque ${c.motivoRetiro}, ${statsBit}.`
  );

  lineas.push(fraseTitulos(c.equipos));

  return lineas.join(" ");
}

export function scoreCarreraParaSeleccion(c: Partial<CarreraGenerada>): number {
  let score = 0;
  score += (c.golesTotales ?? 0) / 100;
  score += (c.asistenciasTotales ?? 0) / 120;
  for (const eq of c.equipos ?? []) {
    if (eq.tituloNacional === "campeon") score += 1;
    if (eq.tituloNacional === "bicampeon_o_mas") score += 2;
    if (eq.copaContinental.includes("campeon")) score += 2;
    if (eq.region === "europa") score += 1.5;
  }
  return score;
}
