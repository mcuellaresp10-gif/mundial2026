import type {
  EventoDecision,
  NivelSeleccion,
  OpcionEvento,
} from "./types";

interface EventoSeleccionDef {
  id: string;
  niveles: NivelSeleccion[];
  etiqueta?: string;
  texto: string;
  opciones: OpcionEvento[];
}

const DEFS: EventoSeleccionDef[] = [
  {
    id: "sel-debut-sub20",
    niveles: ["sub20"],
    etiqueta: "Debut",
    texto: "Primera concentración Sub-20. El DT duda si darte minutos ya.",
    opciones: [
      {
        texto: "Pedir debut sí o sí",
        efectos: {
          moral: 5,
          reputacion: 3,
          rendimientoSeleccion: "correcto",
        },
      },
      {
        texto: "Esperar tu momento",
        efectos: { reputacion: 4, moral: 1, rendimientoSeleccion: "gris" },
      },
      {
        texto: "Imponerte en entrenos",
        efectos: {
          atributos: { ritmo: 1, fisico: 1 },
          moral: 4,
          rendimientoSeleccion: "figura",
        },
      },
    ],
  },
  {
    id: "sel-titularidad-juvenil",
    niveles: ["sub20", "sub23"],
    etiqueta: "Titularidad",
    texto: "Hay pelea por tu puesto en el once inicial de la fecha.",
    opciones: [
      {
        texto: "Pelear la titularidad",
        efectos: {
          moral: 4,
          reputacion: 2,
          atributos: { fisico: 1 },
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Aceptar rotar",
        efectos: { reputacion: 3, moral: 1, rendimientoSeleccion: "correcto" },
      },
      {
        texto: "Quejarte en el camarín",
        efectos: { moral: -2, reputacion: -3, rendimientoSeleccion: "gris" },
      },
    ],
  },
  {
    id: "sel-amistoso-vs-oficial",
    niveles: ["sub20", "sub23", "mayor"],
    etiqueta: "Calendario",
    texto: "El cuerpo técnico te ofrece amistoso completo o banco en el oficial.",
    opciones: [
      {
        texto: "Jugar el amistoso completo",
        efectos: {
          moral: 3,
          atributos: { ritmo: 1 },
          rendimientoSeleccion: "correcto",
        },
      },
      {
        texto: "Apostar al partido oficial",
        efectos: {
          reputacion: 4,
          moral: 2,
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Cuidar el cuerpo",
        efectos: {
          riesgoLesion: -0.08,
          moral: -1,
          rendimientoSeleccion: "gris",
        },
      },
    ],
  },
  {
    id: "sel-lesion-fecha",
    niveles: ["sub20", "sub23", "mayor"],
    etiqueta: "Lesión",
    texto: "Llegás con molestia y el fisio de Selección te frena. ¿Qué hacés?",
    opciones: [
      {
        texto: "Parar y recuperar",
        efectos: {
          riesgoLesion: -0.12,
          moral: -3,
          rendimientoSeleccion: "gris",
        },
      },
      {
        texto: "Jugar lesionado",
        efectos: {
          forzarLesion: "leve",
          moral: 5,
          reputacion: 3,
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Pedir solo 20 minutos",
        efectos: {
          moral: 1,
          reputacion: 2,
          riesgoLesion: 0.05,
          rendimientoSeleccion: "correcto",
        },
      },
    ],
  },
  {
    id: "sel-liderazgo-camarín",
    niveles: ["sub23", "mayor"],
    etiqueta: "Liderazgo",
    texto: "El capitán te pide voz en el camarín antes del partido clave.",
    opciones: [
      {
        texto: "Hablar claro al grupo",
        efectos: {
          reputacion: 6,
          moral: 4,
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Liderar en silencio",
        efectos: {
          reputacion: 3,
          atributos: { defensa: 1 },
          rendimientoSeleccion: "correcto",
        },
      },
      {
        texto: "Evitar el rol",
        efectos: { moral: -1, reputacion: -2, rendimientoSeleccion: "gris" },
      },
    ],
  },
  {
    id: "sel-eliminatorias",
    niveles: ["mayor"],
    etiqueta: "Eliminatorias",
    texto: "Noche de Eliminatorias: el DT te da la banda o un rol más corto.",
    opciones: [
      {
        texto: "Pedir los 90 minutos",
        efectos: {
          moral: 5,
          reputacion: 4,
          riesgoLesion: 0.08,
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Cumplir el plan del DT",
        efectos: {
          reputacion: 5,
          moral: 2,
          rendimientoSeleccion: "correcto",
        },
      },
      {
        texto: "Pedir no arriesgar",
        efectos: {
          riesgoLesion: -0.06,
          moral: -2,
          rendimientoSeleccion: "gris",
        },
      },
    ],
  },
  {
    id: "sel-clasico-sudaca",
    niveles: ["mayor", "sub23"],
    etiqueta: "Clásico",
    texto: "Clásico sudamericano y la presión es máxima. ¿Cómo lo encarás?",
    opciones: [
      {
        texto: "Buscar ser figura",
        efectos: {
          atributos: { tiro: 1, ritmo: 1 },
          moral: 6,
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Jugar simple y seguro",
        efectos: {
          atributos: { pase: 1 },
          reputacion: 4,
          rendimientoSeleccion: "correcto",
        },
      },
      {
        texto: "Bajar el perfil",
        efectos: { moral: -1, reputacion: 1, rendimientoSeleccion: "gris" },
      },
    ],
  },
  {
    id: "sel-prensa-concentracion",
    niveles: ["sub20", "sub23", "mayor"],
    etiqueta: "Prensa",
    texto: "En concentración la prensa te pregunta por el club vs la Selección.",
    opciones: [
      {
        texto: "Priorizar la camiseta tricolor",
        efectos: {
          reputacion: 5,
          moral: 3,
          rendimientoSeleccion: "correcto",
        },
      },
      {
        texto: "Hablar equilibrado",
        efectos: { reputacion: 3, moral: 2, rendimientoSeleccion: "correcto" },
      },
      {
        texto: "Evitar la nota",
        efectos: { reputacion: -1, moral: 1, rendimientoSeleccion: "gris" },
      },
    ],
  },
  {
    id: "sel-banco-frustracion",
    niveles: ["sub20", "sub23", "mayor"],
    etiqueta: "Banco",
    texto: "Te dejan en el banco el primer partido de la fecha. ¿Reaccionás?",
    opciones: [
      {
        texto: "Entrar a matar cuando te toque",
        efectos: {
          moral: 4,
          atributos: { ritmo: 1 },
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Hablar con el DT",
        efectos: { reputacion: 2, moral: 2, rendimientoSeleccion: "correcto" },
      },
      {
        texto: "Empezar a dudar de la convocatoria",
        efectos: { moral: -4, reputacion: -2, rendimientoSeleccion: "gris" },
      },
    ],
  },
  {
    id: "sel-rival-directo",
    niveles: ["sub20", "sub23", "mayor"],
    etiqueta: "Competencia",
    texto: "Otro colombiano en tu puesto llega en gran forma. ¿Qué hacés?",
    opciones: [
      {
        texto: "Competir de frente",
        efectos: {
          atributos: { fisico: 1, tiro: 1 },
          moral: 4,
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Aprender de él",
        efectos: {
          atributos: { pase: 1 },
          reputacion: 3,
          rendimientoSeleccion: "correcto",
        },
      },
      {
        texto: "Bajar los brazos",
        efectos: { moral: -3, reputacion: -2, rendimientoSeleccion: "gris" },
      },
    ],
  },
  {
    id: "sel-gol-esperado",
    niveles: ["mayor", "sub23"],
    etiqueta: "Partido",
    texto: "El DT te pide ser más agresivo de cara al arco en esta fecha.",
    opciones: [
      {
        texto: "Ir a buscar el gol",
        efectos: {
          atributos: { tiro: 2 },
          moral: 5,
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Priorizar el colectivo",
        efectos: {
          atributos: { pase: 1 },
          reputacion: 4,
          rendimientoSeleccion: "correcto",
        },
      },
      {
        texto: "No forzar la máquina",
        efectos: {
          riesgoLesion: -0.05,
          moral: 1,
          rendimientoSeleccion: "gris",
        },
      },
    ],
  },
  {
    id: "sel-viaje-largo",
    niveles: ["sub20", "sub23", "mayor"],
    etiqueta: "Viaje",
    texto: "Viaje largo a la concentración y el cuerpo llega justo. ¿Cómo llegás?",
    opciones: [
      {
        texto: "Recuperar y dormir",
        efectos: {
          atributos: { fisico: 1 },
          riesgoLesion: -0.06,
          rendimientoSeleccion: "correcto",
        },
      },
      {
        texto: "Forzar sesiones extras",
        efectos: {
          atributos: { fisico: 1 },
          riesgoLesion: 0.1,
          moral: 3,
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Avisar que estás justo",
        efectos: { reputacion: 2, moral: -1, rendimientoSeleccion: "gris" },
      },
    ],
  },
  {
    id: "sel-primera-mayor",
    niveles: ["mayor"],
    etiqueta: "Debut",
    texto: "Primera lista de la mayor. El vestuario te mira como al nuevo.",
    opciones: [
      {
        texto: "Presentarte con humildad y hambre",
        efectos: {
          reputacion: 6,
          moral: 6,
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Observar y no forzar",
        efectos: { reputacion: 3, moral: 2, rendimientoSeleccion: "correcto" },
      },
      {
        texto: "Querer imponerte ya",
        efectos: {
          moral: 3,
          reputacion: -1,
          rendimientoSeleccion: "correcto",
        },
      },
    ],
  },
  {
    id: "sel-olimpico-sub23",
    niveles: ["sub23"],
    etiqueta: "Ciclo",
    texto: "El cuerpo técnico habla del ciclo olímpico y tu rol a largo plazo.",
    opciones: [
      {
        texto: "Comprometerte al 100%",
        efectos: {
          reputacion: 5,
          moral: 5,
          atributos: { fisico: 1 },
          rendimientoSeleccion: "figura",
        },
      },
      {
        texto: "Priorizar el club también",
        efectos: { reputacion: 2, moral: 1, rendimientoSeleccion: "correcto" },
      },
      {
        texto: "Dudar en voz alta",
        efectos: { moral: -3, reputacion: -2, rendimientoSeleccion: "gris" },
      },
    ],
  },
];

function toEvento(def: EventoSeleccionDef): EventoDecision {
  return {
    id: def.id,
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: def.etiqueta ?? "Selección",
    texto: def.texto,
    opciones: def.opciones,
  };
}

export const EVENTOS_SELECCION: EventoDecision[] = DEFS.map(toEvento);

export function getEventosSeleccionByNivel(
  nivel: NivelSeleccion
): EventoDecision[] {
  return DEFS.filter((d) => d.niveles.includes(nivel)).map(toEvento);
}

/** 1–2 dilemas de Selección para el nivel dado. */
export function seleccionarEventosSeleccion(
  nivel: NivelSeleccion,
  vistos: string[],
  count: number,
  rng: () => number = Math.random
): EventoDecision[] {
  const pool = getEventosSeleccionByNivel(nivel).filter(
    (e) => !vistos.includes(e.id)
  );
  const source =
    pool.length >= 1 ? pool : getEventosSeleccionByNivel(nivel);
  const shuffled = [...source];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const n = Math.min(Math.max(1, count), shuffled.length, 2);
  return shuffled.slice(0, n);
}
