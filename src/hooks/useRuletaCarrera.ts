"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  APELLIDOS_COLOMBIA,
  LOGROS_SELECCION,
  MOTIVOS_RETIRO,
  MOTIVOS_SALIDA,
  OPCIONES_CANTIDAD_EQUIPOS,
  OPCIONES_EDAD_DEBUT,
  OPCIONES_POSICION,
  OPCIONES_TEMPORADAS,
  OPCIONES_TIENE_HABILIDAD,
  OPCIONES_MEJORA_EN_CLUB,
  atributosMejorables,
  habilidadesPara,
  opcionesRangosRedondos,
  opcionesRegion,
  opcionesStat,
  opcionesStatMejora,
  rangoAsistencias,
  rangoGoles,
  rangoVallas,
} from "@/data/ruleta-carrera/opciones";
import {
  labelCopa,
  labelTitulo,
  opcionesCopaContinental,
  opcionesEquipoDebut,
  opcionesEquipoRegion,
  opcionesTituloNacional,
  type ClubRuleta,
} from "@/data/ruleta-carrera/clubes";
import type {
  AtributoRuleta,
  CarreraGenerada,
  HabilidadEspecial,
  NivelStat,
  OpcionRuleta,
  PasoEquipo,
  PasoRuleta,
  Region,
  TituloNacional,
  CopaContinental,
} from "@/data/ruleta-carrera/types";
import type { Posicion } from "@/data/carrera/types";
import {
  aplicarHabilidadAStats,
  scoreCarreraParaSeleccion,
} from "@/utils/ruleta-carrera/narrativa";
import { construirPasos } from "@/utils/ruleta-carrera/pasos";

type Draft = {
  apellido: string;
  piernaHabil: CarreraGenerada["piernaHabil"];
  posicion: Posicion | null;
  edadDebut: number | null;
  temporadas: number | null;
  statsBase: Partial<Record<AtributoRuleta, number>>;
  statsNombres: Partial<Record<AtributoRuleta, string>>;
  tieneHabilidad: boolean | null;
  habilidad: HabilidadEspecial | null;
  mejorasEnClub: Record<number, boolean | null>;
  mejoraAttrPorClub: Partial<Record<number, AtributoRuleta>>;
  cantidadEquipos: number | null;
  equipos: Partial<PasoEquipo>[];
  regionPendiente: Region | null;
  golesRango: { min: number; max: number } | null;
  goles: number | null;
  asistenciasRango: { min: number; max: number } | null;
  asistencias: number | null;
  vallasRango: { min: number; max: number } | null;
  vallas: number | null;
  convocado: boolean | null;
  logroSeleccion: string | null;
  motivoRetiro: string | null;
};

function draftBase(): Draft {
  return {
    // Valores fijos en SSR; se sortean en el cliente tras el mount (evita hydration mismatch).
    apellido: APELLIDOS_COLOMBIA[0]!,
    piernaHabil: "derecha",
    posicion: null,
    edadDebut: null,
    temporadas: null,
    statsBase: {},
    statsNombres: {},
    tieneHabilidad: null,
    habilidad: null,
    mejorasEnClub: {},
    mejoraAttrPorClub: {},
    cantidadEquipos: null,
    equipos: [],
    regionPendiente: null,
    golesRango: null,
    goles: null,
    asistenciasRango: null,
    asistencias: null,
    vallasRango: null,
    vallas: null,
    convocado: null,
    logroSeleccion: null,
    motivoRetiro: null,
  };
}

function sortearIdentidad(): Pick<Draft, "apellido" | "piernaHabil"> {
  const apellido =
    APELLIDOS_COLOMBIA[Math.floor(Math.random() * APELLIDOS_COLOMBIA.length)]!;
  const piernas: CarreraGenerada["piernaHabil"][] = [
    "izquierda",
    "derecha",
    "ambidiestro",
  ];
  return {
    apellido,
    piernaHabil: piernas[Math.floor(Math.random() * piernas.length)]!,
  };
}

function draftInicial(): Draft {
  return { ...draftBase(), ...sortearIdentidad() };
}

function finalizar(d: Draft): CarreraGenerada {
  if (
    !d.posicion ||
    d.edadDebut == null ||
    d.temporadas == null ||
    d.tieneHabilidad == null ||
    (d.tieneHabilidad && !d.habilidad) ||
    d.cantidadEquipos == null ||
    d.goles == null ||
    d.asistencias == null ||
    !d.motivoRetiro
  ) {
    throw new Error("Carrera incompleta");
  }
  const equipos = d.equipos as PasoEquipo[];
  if (equipos.length !== d.cantidadEquipos) {
    throw new Error("Equipos incompletos");
  }
  const edadRetiro = d.edadDebut + d.temporadas;
  return {
    apellido: d.apellido,
    piernaHabil: d.piernaHabil,
    posicion: d.posicion,
    edadDebut: d.edadDebut,
    temporadas: d.temporadas,
    edadRetiro,
    equipoDebut: equipos[0]!.equipo,
    clubDebutId: equipos[0]!.clubId,
    statsBase: d.statsBase,
    statsNombres: d.statsNombres,
    atributosFinales: aplicarHabilidadAStats(
      d.statsBase,
      d.habilidad,
      d.posicion
    ),
    habilidadEspecial: d.habilidad,
    cantidadEquipos: d.cantidadEquipos,
    equipos,
    golesTotales: d.goles,
    asistenciasTotales: d.asistencias,
    vallasInvictas: d.vallas,
    convocadoSeleccion: Boolean(d.convocado),
    logroSeleccion: d.convocado ? d.logroSeleccion : null,
    motivoRetiro: d.motivoRetiro,
  };
}

function aplicarEnDraft(
  prev: Draft,
  pasoCur: PasoRuleta,
  opcion: OpcionRuleta<unknown>
): Draft {
  const next: Draft = {
    ...prev,
    statsBase: { ...prev.statsBase },
    statsNombres: { ...prev.statsNombres },
    equipos: prev.equipos.map((e) => ({ ...e })),
    mejorasEnClub: { ...prev.mejorasEnClub },
    mejoraAttrPorClub: { ...prev.mejoraAttrPorClub },
  };

  switch (pasoCur.kind) {
    case "posicion":
      next.posicion = opcion.valor as Posicion;
      break;
    case "edadDebut":
      next.edadDebut = opcion.valor as number;
      break;
    case "equipoDebut": {
      const club = opcion.valor as ClubRuleta;
      next.equipos = [
        {
          region: "colombia",
          clubId: club.id,
          equipo: club.nombre,
          ligaNombre: club.ligaNombre,
          prestigio: club.prestigio,
          tituloNacional: "ninguno",
          copaContinental: "ninguna",
          motivoSalida: null,
        },
      ];
      break;
    }
    case "temporadas":
      next.temporadas = opcion.valor as number;
      break;
    case "stat": {
      const nivel = opcion.valor as NivelStat;
      next.statsBase[pasoCur.atributo] = nivel.valor;
      next.statsNombres[pasoCur.atributo] = nivel.nombre;
      break;
    }
    case "habilidad":
      next.habilidad = opcion.valor as HabilidadEspecial;
      break;
    case "tieneHabilidad":
      next.tieneHabilidad = opcion.valor as boolean;
      if (!next.tieneHabilidad) next.habilidad = null;
      break;
    case "cantidadEquipos": {
      next.cantidadEquipos = opcion.valor as number;
      const n = next.cantidadEquipos;
      while (next.equipos.length < n) next.equipos.push({});
      next.equipos = next.equipos.slice(0, n);
      break;
    }
    case "region":
      next.regionPendiente = opcion.valor as Region;
      break;
    case "equipo": {
      const club = opcion.valor as ClubRuleta;
      const i = pasoCur.teamIndex;
      next.equipos[i] = {
        ...next.equipos[i],
        region: club.region,
        clubId: club.id,
        equipo: club.nombre,
        ligaNombre: club.ligaNombre,
        prestigio: club.prestigio,
        tituloNacional: next.equipos[i]?.tituloNacional ?? "ninguno",
        copaContinental: next.equipos[i]?.copaContinental ?? "ninguna",
        motivoSalida: next.equipos[i]?.motivoSalida ?? null,
      };
      next.regionPendiente = null;
      break;
    }
    case "motivoSalida": {
      const i = pasoCur.fromTeamIndex;
      next.equipos[i] = {
        ...next.equipos[i],
        motivoSalida: opcion.valor as string,
      };
      break;
    }
    case "mejoraEnClub": {
      const si = opcion.valor as boolean;
      const puedeMejorar =
        !!prev.posicion &&
        atributosMejorables(prev.posicion, prev.statsBase).length > 0;
      const efectivo = si && puedeMejorar;
      next.mejorasEnClub[pasoCur.teamIndex] = efectivo;
      if (!efectivo) {
        delete next.mejoraAttrPorClub[pasoCur.teamIndex];
      }
      break;
    }
    case "mejoraStatCual": {
      const attr = opcion.valor as AtributoRuleta;
      next.mejoraAttrPorClub[pasoCur.teamIndex] = attr;
      break;
    }
    case "mejoraStatValor": {
      const nivel = opcion.valor as NivelStat;
      next.statsBase[pasoCur.atributo] = nivel.valor;
      next.statsNombres[pasoCur.atributo] = nivel.nombre;
      break;
    }
    case "tituloNacional": {
      const i = pasoCur.teamIndex;
      next.equipos[i] = {
        ...next.equipos[i],
        tituloNacional: opcion.valor as TituloNacional,
      };
      break;
    }
    case "copaContinental": {
      const i = pasoCur.teamIndex;
      next.equipos[i] = {
        ...next.equipos[i],
        copaContinental: opcion.valor as CopaContinental,
      };
      break;
    }
    case "goles":
      next.golesRango = opcion.valor as { min: number; max: number };
      next.goles = null;
      break;
    case "golesExacto":
      next.goles = opcion.valor as number;
      break;
    case "asistencias":
      next.asistenciasRango = opcion.valor as { min: number; max: number };
      next.asistencias = null;
      break;
    case "asistenciasExacto":
      next.asistencias = opcion.valor as number;
      break;
    case "vallas":
      next.vallasRango = opcion.valor as { min: number; max: number };
      next.vallas = null;
      break;
    case "vallasExacto":
      next.vallas = opcion.valor as number;
      break;
    case "seleccionConvocado":
      next.convocado = opcion.valor as boolean;
      break;
    case "seleccionLogro":
      next.logroSeleccion = opcion.valor as string;
      break;
    case "retiro":
      next.motivoRetiro = opcion.valor as string;
      break;
  }
  return next;
}

function labelResultado(
  pasoCur: PasoRuleta,
  opcion: OpcionRuleta<unknown>
): string {
  if (pasoCur.kind === "tituloNacional") {
    return labelTitulo(opcion.valor as TituloNacional);
  }
  if (pasoCur.kind === "copaContinental") {
    return labelCopa(opcion.valor as CopaContinental);
  }
  if (pasoCur.kind === "stat" || pasoCur.kind === "mejoraStatValor") {
    const n = opcion.valor as NivelStat;
    return `${n.valor}/10 — ${n.nombre}`;
  }
  if (pasoCur.kind === "goles") {
    const r = opcion.valor as { min: number; max: number };
    return r.min === r.max ? `${r.min} goles` : `${r.min}–${r.max} goles`;
  }
  if (pasoCur.kind === "golesExacto") {
    return `${opcion.valor as number} goles`;
  }
  if (pasoCur.kind === "asistencias") {
    const r = opcion.valor as { min: number; max: number };
    return r.min === r.max
      ? `${r.min} asistencias`
      : `${r.min}–${r.max} asistencias`;
  }
  if (pasoCur.kind === "asistenciasExacto") {
    return `${opcion.valor as number} asistencias`;
  }
  if (pasoCur.kind === "vallas") {
    const r = opcion.valor as { min: number; max: number };
    return r.min === r.max
      ? `${r.min} vallas`
      : `${r.min}–${r.max} vallas`;
  }
  if (pasoCur.kind === "vallasExacto") {
    return `${opcion.valor as number} vallas invictas`;
  }
  if (pasoCur.kind === "habilidad") {
    const h = opcion.valor as HabilidadEspecial;
    return `${h.nombre} (${h.descripcion})`;
  }
  if (pasoCur.kind === "equipoDebut" || pasoCur.kind === "equipo") {
    return (opcion.valor as ClubRuleta).nombre;
  }
  return opcion.label;
}

export function useRuletaCarrera() {
  const [draft, setDraft] = useState<Draft>(() => draftBase());
  const [pasoIndex, setPasoIndex] = useState(0);
  const [resultadoActual, setResultadoActual] = useState<string | null>(null);
  const [bloqueoGiro, setBloqueoGiro] = useState(false);
  const [carrera, setCarrera] = useState<CarreraGenerada | null>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const identidadLista = useRef(false);

  useEffect(() => {
    if (identidadLista.current) return;
    identidadLista.current = true;
    const id = sortearIdentidad();
    setDraft((prev) => {
      const next = { ...prev, ...id };
      draftRef.current = next;
      return next;
    });
  }, []);

  const pasos = useMemo(
    () =>
      construirPasos({
        posicion: draft.posicion,
        cantidadEquipos: draft.cantidadEquipos,
        convocado: draft.convocado,
        tieneHabilidad: draft.tieneHabilidad,
        nombresEquipos: draft.equipos.map((e) => e.equipo),
        mejorasEnClub: draft.mejorasEnClub,
        mejoraAttrPorClub: draft.mejoraAttrPorClub,
      }),
    [
      draft.posicion,
      draft.cantidadEquipos,
      draft.convocado,
      draft.tieneHabilidad,
      draft.equipos,
      draft.mejorasEnClub,
      draft.mejoraAttrPorClub,
    ]
  );

  const paso: PasoRuleta | null = pasos[pasoIndex] ?? null;
  const terminado = carrera != null;

  const opciones = useMemo((): OpcionRuleta<unknown>[] => {
    if (!paso) return [];
    try {
      switch (paso.kind) {
      case "posicion":
        return OPCIONES_POSICION;
      case "edadDebut":
        return OPCIONES_EDAD_DEBUT;
      case "equipoDebut":
        return opcionesEquipoDebut();
      case "temporadas":
        return OPCIONES_TEMPORADAS;
      case "stat":
        return opcionesStat(paso.atributo);
      case "tieneHabilidad":
        return OPCIONES_TIENE_HABILIDAD ?? [];
      case "habilidad": {
        if (!draft.posicion) return [];
        return habilidadesPara(draft.posicion).map((h) => ({
          id: h.id,
          label: `${h.nombre} (${h.descripcion})`,
          valor: h,
        }));
      }
      case "cantidadEquipos":
        return OPCIONES_CANTIDAD_EQUIPOS;
      case "region":
        return opcionesRegion(paso.teamIndex - 1);
      case "equipo": {
        const region =
          draft.regionPendiente ??
          draft.equipos[paso.teamIndex]?.region ??
          null;
        if (!region) return [];
        const used = draft.equipos
          .map((e, idx) => (idx === paso.teamIndex ? undefined : e.clubId))
          .filter(Boolean) as string[];
        return opcionesEquipoRegion(region, used);
      }
      case "motivoSalida":
        return MOTIVOS_SALIDA;
      case "mejoraEnClub": {
        if (!draft.posicion) return OPCIONES_MEJORA_EN_CLUB ?? [];
        const puede =
          atributosMejorables(draft.posicion, draft.statsBase).length > 0;
        if (!puede) {
          return [
            {
              id: "mej-max",
              label: "No (stats al máximo)",
              valor: false,
              peso: 1,
            },
          ];
        }
        return OPCIONES_MEJORA_EN_CLUB ?? [];
      }
      case "mejoraStatCual": {
        if (!draft.posicion) return [];
        return atributosMejorables(draft.posicion, draft.statsBase).map((s) => ({
          id: s.atributo,
          label: `${s.label} (${draft.statsBase[s.atributo] ?? "?"}/10)`,
          valor: s.atributo,
        }));
      }
      case "mejoraStatValor": {
        const actual = draft.statsBase[paso.atributo] ?? 1;
        return opcionesStatMejora(paso.atributo, actual);
      }
      case "tituloNacional": {
        const eq = draft.equipos[paso.teamIndex];
        return opcionesTituloNacional(eq?.prestigio ?? 2);
      }
      case "copaContinental": {
        const eq = draft.equipos[paso.teamIndex];
        if (!eq?.region) return [];
        return opcionesCopaContinental(eq.region, eq.prestigio ?? 2);
      }
      case "goles": {
        if (!draft.posicion) return [];
        const r = rangoGoles(draft.posicion);
        return opcionesRangosRedondos(r.min, r.max);
      }
      case "golesExacto":
        return [];
      case "asistencias": {
        if (!draft.posicion) return [];
        const r = rangoAsistencias(draft.posicion);
        return opcionesRangosRedondos(r.min, r.max);
      }
      case "asistenciasExacto":
        return [];
      case "vallas": {
        if (!draft.posicion) return [];
        const r = rangoVallas(draft.posicion);
        if (!r) return [];
        return opcionesRangosRedondos(r.min, r.max);
      }
      case "vallasExacto":
        return [];
      case "seleccionConvocado": {
        const score = scoreCarreraParaSeleccion({
          golesTotales: draft.goles ?? 0,
          asistenciasTotales: draft.asistencias ?? 0,
          equipos: draft.equipos as PasoEquipo[],
        });
        const pSi = Math.min(0.85, 0.25 + score * 0.08);
        return [
          {
            id: "si",
            label: "Convocado",
            valor: true,
            peso: Math.round(pSi * 100),
          },
          {
            id: "no",
            label: "Nunca convocado",
            valor: false,
            peso: Math.round((1 - pSi) * 100),
          },
        ];
      }
      case "seleccionLogro":
        return LOGROS_SELECCION;
      case "retiro":
        return MOTIVOS_RETIRO;
      default:
        return [];
      }
    } catch {
      return [];
    }
  }, [paso, draft]);

  const onResultadoRuleta = useCallback(
    (opcion: OpcionRuleta<unknown>) => {
      const pasoCur = paso;
      if (!pasoCur || bloqueoGiro) return;
      const next = aplicarEnDraft(draftRef.current, pasoCur, opcion);
      draftRef.current = next;
      setDraft(next);
      setResultadoActual(labelResultado(pasoCur, opcion));
      setBloqueoGiro(true);
    },
    [paso, bloqueoGiro]
  );

  const siguiente = useCallback(() => {
    if (!bloqueoGiro) return;
    const d = draftRef.current;
    const nextIndex = pasoIndex + 1;
    const nextPasos = construirPasos({
      posicion: d.posicion,
      cantidadEquipos: d.cantidadEquipos,
      convocado: d.convocado,
      tieneHabilidad: d.tieneHabilidad,
      nombresEquipos: d.equipos.map((e) => e.equipo),
      mejorasEnClub: d.mejorasEnClub,
      mejoraAttrPorClub: d.mejoraAttrPorClub,
    });

    setResultadoActual(null);
    setBloqueoGiro(false);

    if (nextIndex >= nextPasos.length) {
      try {
        const full = finalizar(d);
        setCarrera(full);
      } catch {
        setPasoIndex(Math.max(0, nextPasos.length - 1));
      }
      return;
    }
    setPasoIndex(nextIndex);
  }, [bloqueoGiro, pasoIndex]);

  const reiniciar = useCallback(() => {
    const fresh = draftInicial();
    draftRef.current = fresh;
    setDraft(fresh);
    setPasoIndex(0);
    setResultadoActual(null);
    setBloqueoGiro(false);
    setCarrera(null);
  }, []);

  return {
    draft,
    paso,
    pasoIndex,
    totalPasos: pasos.length,
    opciones,
    resultadoActual,
    bloqueoGiro,
    terminado,
    carrera,
    onResultadoRuleta,
    siguiente,
    reiniciar,
  };
}
