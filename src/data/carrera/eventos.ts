import type { EventoDecision } from "./types";

/**
 * Banco de eventos del simulador de carrera (~300).
 * Situación clara + opciones coherentes + etiqueta de UI.
 * Generado/actualizado por scripts/generate-carrera-eventos.mjs
 */
export const EVENTOS_CARRERA: EventoDecision[] = [
  {
    id: "can-estudio-vs-futbol",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Formación",
    texto: "Tu familia quiere que priorices el colegio. El técnico pide más dobles turnos. ¿Qué haces?",
    opciones: [
    {
      texto: "Priorizar el fútbol",
      efectos: {"atributos":{"ritmo":2,"fisico":2},"moral":5,"reputacion":-3},
    },
    {
      texto: "Equilibrar aunque duermas menos",
      efectos: {"atributos":{"fisico":-1,"pase":1},"moral":-5,"riesgoLesion":0.08},
    },
    {
      texto: "Poner el colegio primero",
      efectos: {"atributos":{"pase":1},"moral":3,"reputacion":4},
    },
    ],
  },
  {
    id: "can-primer-contrato",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te ofrecen el primer contrato profesional. El representante quiere que firmes ya. ¿Qué haces?",
    opciones: [
    {
      texto: "Firmar ya",
      efectos: {"reputacion":5,"moral":8,"atributos":{"fisico":1}},
    },
    {
      texto: "Negociar mejores condiciones",
      efectos: {"reputacion":8,"moral":2},
    },
    {
      texto: "Esperar otra oferta",
      efectos: {"moral":-4,"reputacion":-2,"atributos":{"ritmo":1}},
    },
    ],
  },
  {
    id: "can-lesion-leve",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Tienes una molestia muscular. El fisio recomienda parar. ¿Qué haces?",
    opciones: [
    {
      texto: "Parar dos semanas",
      efectos: {"riesgoLesion":-0.1,"moral":-3,"atributos":{"fisico":1}},
    },
    {
      texto: "Jugar igual",
      efectos: {"riesgoLesion":0.2,"moral":4,"atributos":{"fisico":-2}},
    },
    {
      texto: "Bajar minutos y cargar gym",
      efectos: {"atributos":{"fisico":2,"ritmo":-1},"riesgoLesion":0.05},
    },
    ],
  },
  {
    id: "can-rival-cantera",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Hay clásico de cantera y el DT te pone de titular. ¿Cómo encaras el partido?",
    opciones: [
    {
      texto: "Ir a ganar con todo",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":6,"reputacion":3},
    },
    {
      texto: "Jugar simple y seguro",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":2,"reputacion":5},
    },
    {
      texto: "Pedir ir al banco",
      efectos: {"moral":-8,"reputacion":-5},
    },
    ],
  },
  {
    id: "can-agente-temprano",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Agente",
    texto: "Un agente aparece con promesas de Europa. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Firmar con él",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Quedarte con el club",
      efectos: {"moral":2,"reputacion":2,"atributos":{"fisico":1}},
    },
    {
      texto: "Escuchar y no firmar",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "col-can-viaje-largo",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje largo en bus a un amistoso. ¿Cómo aprovechas el trayecto?",
    opciones: [
    {
      texto: "Descansar en el viaje",
      efectos: {"atributos":{"fisico":1},"moral":2,"riesgoLesion":-0.05},
    },
    {
      texto: "Estudiar al rival",
      efectos: {"atributos":{"pase":1,"defensa":1},"moral":1},
    },
    {
      texto: "Quedarte despierto con el grupo",
      efectos: {"moral":4,"atributos":{"fisico":-1},"riesgoLesion":0.05},
    },
    ],
  },
  {
    id: "col-can-prensa-local",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Prensa",
    texto: "Un periodista local pide entrevista. ¿Qué haces?",
    opciones: [
    {
      texto: "Hablar corto y profesional",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Hablar mucho y abrir el juego",
      efectos: {"reputacion":7,"moral":5,"atributos":{"tiro":-1}},
    },
    {
      texto: "No hablar",
      efectos: {"reputacion":-2,"moral":-1},
    },
    ],
  },
  {
    id: "col-can-cancha-pesada",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Cancha pesada y mucho calor. El cuerpo pesa. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Adaptarte y aguantar",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Pedir cambio temprano",
      efectos: {"moral":-2,"riesgoLesion":-0.08},
    },
    {
      texto: "Forzar los 90 minutos",
      efectos: {"atributos":{"fisico":-1},"moral":5,"riesgoLesion":0.12},
    },
    ],
  },
  {
    id: "con-rotacion",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "El DT rota y te deja en el banquillo. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Aceptar y trabajar más",
      efectos: {"atributos":{"fisico":1,"pase":1},"moral":-2,"reputacion":2},
    },
    {
      texto: "Pedir explicaciones",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"reputacion":-4,"moral":-5},
    },
    ],
  },
  {
    id: "con-oferta-prestamo",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Préstamo",
    texto: "Llega una oferta de préstamo para sumar minutos. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar el préstamo",
      efectos: {"moral":6,"reputacion":3,"atributos":{"ritmo":1,"tiro":1}},
    },
    {
      texto: "Pelear el puesto acá",
      efectos: {"moral":2,"atributos":{"fisico":2},"reputacion":1},
    },
    {
      texto: "Rechazar y negociar otra cosa",
      efectos: {"reputacion":4,"moral":-2},
    },
    ],
  },
  {
    id: "con-redes-sociales",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Imagen",
    texto: "Una pelea en redes se hace viral. ¿Cómo lo cierras?",
    opciones: [
    {
      texto: "Borrar y callar",
      efectos: {"reputacion":2,"moral":-3},
    },
    {
      texto: "Pedir disculpas",
      efectos: {"reputacion":5,"moral":1},
    },
    {
      texto: "Doblar la apuesta",
      efectos: {"reputacion":-6,"moral":4},
    },
    ],
  },
  {
    id: "col-con-clasico",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Semana de clásico y la ciudad hierve. ¿Cómo te preparas?",
    opciones: [
    {
      texto: "Enfocarte en el plan del DT",
      efectos: {"atributos":{"defensa":2,"pase":1},"moral":4,"reputacion":3},
    },
    {
      texto: "Subir la intensidad al máximo",
      efectos: {"atributos":{"ritmo":2,"tiro":1},"moral":7,"riesgoLesion":0.06},
    },
    {
      texto: "Bajar el perfil y cuidar el cuerpo",
      efectos: {"moral":-1,"reputacion":1,"riesgoLesion":-0.04},
    },
    ],
  },
  {
    id: "col-con-altura",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje a jugar en altura y las piernas no responden. ¿Qué haces?",
    opciones: [
    {
      texto: "Llegar uno o dos días antes",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":-0.05},
    },
    {
      texto: "Viajar con el grupo como siempre",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Forzar el partido igual",
      efectos: {"atributos":{"fisico":-2},"moral":3,"riesgoLesion":0.1},
    },
    ],
  },
  {
    id: "pri-liderazgo",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El vestuario te mira como referente. ¿Asumes el rol?",
    opciones: [
    {
      texto: "Asumir el brazalete",
      efectos: {"reputacion":8,"moral":6,"atributos":{"pase":1}},
    },
    {
      texto: "Liderar en silencio",
      efectos: {"reputacion":4,"moral":3,"atributos":{"defensa":1}},
    },
    {
      texto: "Evitar el rol",
      efectos: {"moral":-2,"reputacion":-3},
    },
    ],
  },
  {
    id: "pri-renovacion",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "El club ofrece una renovación larga. ¿Qué decides?",
    opciones: [
    {
      texto: "Firmar ya",
      efectos: {"moral":8,"reputacion":5},
    },
    {
      texto: "Pedir más sueldo",
      efectos: {"reputacion":2,"moral":3},
    },
    {
      texto: "Esperar el mercado",
      efectos: {"moral":-3,"reputacion":4},
    },
    ],
  },
  {
    id: "pri-lesion-seria",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Hay una molestia grave y riesgo de meses fuera. ¿Qué camino eliges?",
    opciones: [
    {
      texto: "Operarte ya",
      efectos: {"riesgoLesion":-0.15,"moral":-6,"atributos":{"fisico":-2},"riesgoFinCarrera":0.02},
    },
    {
      texto: "Tratamiento conservador",
      efectos: {"riesgoLesion":0.1,"moral":-2,"atributos":{"fisico":-1}},
    },
    {
      texto: "Acelerar el retorno",
      efectos: {"moral":5,"riesgoLesion":0.25,"atributos":{"ritmo":-1},"riesgoFinCarrera":0.05},
    },
    ],
  },
  {
    id: "col-pri-seleccion",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Te convocan a la Selección, pero el club duda. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Ir sí o sí",
      efectos: {"reputacion":10,"moral":8,"atributos":{"tiro":1}},
    },
    {
      texto: "Negociar minutos con el club",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":-4,"moral":-3,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "col-pri-sudamericana",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Noche de Sudamericana con viaje exigente. ¿Cómo llegas?",
    opciones: [
    {
      texto: "Llegar al 100%",
      efectos: {"atributos":{"fisico":1,"ritmo":1},"moral":5,"reputacion":4},
    },
    {
      texto: "Rotar y cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.08,"moral":1,"reputacion":1},
    },
    {
      texto: "Jugar aunque estés molesto",
      efectos: {"moral":6,"riesgoLesion":0.18,"atributos":{"fisico":-2}},
    },
    ],
  },
  {
    id: "vet-minutos",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "El DT baja tus minutos y llega un joven. ¿Qué haces?",
    opciones: [
    {
      texto: "Mentorear al joven",
      efectos: {"reputacion":6,"moral":2,"atributos":{"pase":1}},
    },
    {
      texto: "Pelear el puesto",
      efectos: {"moral":4,"atributos":{"fisico":1},"riesgoLesion":0.08},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-4,"reputacion":-2},
    },
    ],
  },
  {
    id: "vet-cuerpo",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Cuerpo",
    texto: "El cuerpo pide más recuperación. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Bajar la carga",
      efectos: {"riesgoLesion":-0.12,"moral":2,"atributos":{"fisico":1}},
    },
    {
      texto: "Mantener el ritmo actual",
      efectos: {"moral":3,"riesgoLesion":0.1,"atributos":{"ritmo":-1}},
    },
    {
      texto: "Cambiar hábitos y cuidar más",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":4},
    },
    ],
  },
  {
    id: "col-vet-despedida",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Retiro",
    texto: "El club habla de un partido de despedida. ¿Qué decides?",
    opciones: [
    {
      texto: "Aceptar el homenaje",
      efectos: {"moral":10,"reputacion":8},
    },
    {
      texto: "Jugar un año más",
      efectos: {"moral":4,"reputacion":3,"riesgoLesion":0.1},
    },
    {
      texto: "Irte en silencio",
      efectos: {"moral":-2,"reputacion":2},
    },
    ],
  },
  {
    id: "can-col-auto-001",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Lluvia y cancha pesada en el sur. ¿Cómo juegas?",
    opciones: [
    {
      texto: "Adaptar el cuerpo al barro",
      efectos: {"atributos":{"fisico":2},"moral":2},
    },
    {
      texto: "Jugar más simple",
      efectos: {"atributos":{"pase":2},"reputacion":2},
    },
    {
      texto: "Forzar gambetas igual",
      efectos: {"atributos":{"regate":1},"riesgoLesion":0.08},
    },
    ],
  },
  {
    id: "can-col-auto-002",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje largo a un amistoso por carretera. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Dormir en el bus",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Charlar táctica con el DT",
      efectos: {"atributos":{"pase":1},"reputacion":2},
    },
    {
      texto: "Quedarte en el celular",
      efectos: {"moral":2,"reputacion":-1},
    },
    ],
  },
  {
    id: "can-col-auto-003",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "En un amistoso la hinchada local te silba. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Ignorarlos y concentrarte",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Subir la intensidad",
      efectos: {"atributos":{"ritmo":2},"moral":4},
    },
    {
      texto: "Responder gestos",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "can-col-auto-004",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Calor fuerte en la costa. ¿Cómo dosificas?",
    opciones: [
    {
      texto: "Hidratarte y dosificar",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Ir a full los 90",
      efectos: {"moral":4,"riesgoLesion":0.1,"atributos":{"fisico":-1}},
    },
    {
      texto: "Pedir el cambio a los 60",
      efectos: {"moral":-1,"riesgoLesion":-0.08},
    },
    ],
  },
  {
    id: "can-col-auto-005",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Derbi",
    texto: "Derbi regional de juveniles. ¿Cómo lo encaras?",
    opciones: [
    {
      texto: "Jugar con cabeza fría",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Ir al choque",
      efectos: {"atributos":{"fisico":2},"moral":5,"riesgoLesion":0.07},
    },
    {
      texto: "Bajar el perfil",
      efectos: {"moral":-2,"reputacion":1},
    },
    ],
  },
  {
    id: "can-col-auto-006",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Prensa",
    texto: "Un periodista local pide una nota rápida. ¿Qué haces?",
    opciones: [
    {
      texto: "Dar una nota corta",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Hablar con calma y agradecer",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Evitar la nota",
      efectos: {"reputacion":-2},
    },
    ],
  },
  {
    id: "can-col-auto-007",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "El bus se demora horas y llegas justo. ¿Cómo llegas al partido?",
    opciones: [
    {
      texto: "Entrar concentrado igual",
      efectos: {"moral":3,"atributos":{"fisico":-1}},
    },
    {
      texto: "Avisar al DT que estás justo",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir ir al banco",
      efectos: {"moral":-3,"riesgoLesion":-0.05},
    },
    ],
  },
  {
    id: "can-col-auto-008",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Altura",
    texto: "Torneo interclubes en altura. ¿Cómo te preparas?",
    opciones: [
    {
      texto: "Llegar antes a aclimatarte",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":-0.05},
    },
    {
      texto: "Viajar con el grupo",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Forzar sin prepararte",
      efectos: {"moral":2,"riesgoLesion":0.1,"atributos":{"fisico":-2}},
    },
    ],
  },
  {
    id: "can-col-auto-009",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Lluvia y cancha pesada en el sur. ¿Cómo juegas?",
    opciones: [
    {
      texto: "Adaptar el cuerpo al barro",
      efectos: {"atributos":{"fisico":2},"moral":2},
    },
    {
      texto: "Jugar más simple",
      efectos: {"atributos":{"pase":2},"reputacion":2},
    },
    {
      texto: "Forzar gambetas igual",
      efectos: {"atributos":{"regate":1},"riesgoLesion":0.08},
    },
    ],
  },
  {
    id: "can-col-auto-010",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje largo a un amistoso por carretera. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Dormir en el bus",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Charlar táctica con el DT",
      efectos: {"atributos":{"pase":1},"reputacion":2},
    },
    {
      texto: "Quedarte en el celular",
      efectos: {"moral":2,"reputacion":-1},
    },
    ],
  },
  {
    id: "can-col-auto-011",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "En un amistoso la hinchada local te silba. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Ignorarlos y concentrarte",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Subir la intensidad",
      efectos: {"atributos":{"ritmo":2},"moral":4},
    },
    {
      texto: "Responder gestos",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "can-col-auto-012",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Calor fuerte en la costa. ¿Cómo dosificas?",
    opciones: [
    {
      texto: "Hidratarte y dosificar",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Ir a full los 90",
      efectos: {"moral":4,"riesgoLesion":0.1,"atributos":{"fisico":-1}},
    },
    {
      texto: "Pedir el cambio a los 60",
      efectos: {"moral":-1,"riesgoLesion":-0.08},
    },
    ],
  },
  {
    id: "can-col-auto-013",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Derbi",
    texto: "Derbi regional de juveniles. ¿Cómo lo encaras?",
    opciones: [
    {
      texto: "Jugar con cabeza fría",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Ir al choque",
      efectos: {"atributos":{"fisico":2},"moral":5,"riesgoLesion":0.07},
    },
    {
      texto: "Bajar el perfil",
      efectos: {"moral":-2,"reputacion":1},
    },
    ],
  },
  {
    id: "can-col-auto-014",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Prensa",
    texto: "Un periodista local pide una nota rápida. ¿Qué haces?",
    opciones: [
    {
      texto: "Dar una nota corta",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Hablar con calma y agradecer",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Evitar la nota",
      efectos: {"reputacion":-2},
    },
    ],
  },
  {
    id: "can-col-auto-015",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "El bus se demora horas y llegas justo. ¿Cómo llegas al partido?",
    opciones: [
    {
      texto: "Entrar concentrado igual",
      efectos: {"moral":3,"atributos":{"fisico":-1}},
    },
    {
      texto: "Avisar al DT que estás justo",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir ir al banco",
      efectos: {"moral":-3,"riesgoLesion":-0.05},
    },
    ],
  },
  {
    id: "can-col-auto-016",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Altura",
    texto: "Torneo interclubes en altura. ¿Cómo te preparas?",
    opciones: [
    {
      texto: "Llegar antes a aclimatarte",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":-0.05},
    },
    {
      texto: "Viajar con el grupo",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Forzar sin prepararte",
      efectos: {"moral":2,"riesgoLesion":0.1,"atributos":{"fisico":-2}},
    },
    ],
  },
  {
    id: "can-col-auto-017",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Lluvia y cancha pesada en el sur. ¿Cómo juegas?",
    opciones: [
    {
      texto: "Adaptar el cuerpo al barro",
      efectos: {"atributos":{"fisico":2},"moral":2},
    },
    {
      texto: "Jugar más simple",
      efectos: {"atributos":{"pase":2},"reputacion":2},
    },
    {
      texto: "Forzar gambetas igual",
      efectos: {"atributos":{"regate":1},"riesgoLesion":0.08},
    },
    ],
  },
  {
    id: "can-col-auto-018",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje largo a un amistoso por carretera. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Dormir en el bus",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Charlar táctica con el DT",
      efectos: {"atributos":{"pase":1},"reputacion":2},
    },
    {
      texto: "Quedarte en el celular",
      efectos: {"moral":2,"reputacion":-1},
    },
    ],
  },
  {
    id: "can-col-auto-019",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "En un amistoso la hinchada local te silba. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Ignorarlos y concentrarte",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Subir la intensidad",
      efectos: {"atributos":{"ritmo":2},"moral":4},
    },
    {
      texto: "Responder gestos",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "can-col-auto-020",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Calor fuerte en la costa. ¿Cómo dosificas?",
    opciones: [
    {
      texto: "Hidratarte y dosificar",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Ir a full los 90",
      efectos: {"moral":4,"riesgoLesion":0.1,"atributos":{"fisico":-1}},
    },
    {
      texto: "Pedir el cambio a los 60",
      efectos: {"moral":-1,"riesgoLesion":-0.08},
    },
    ],
  },
  {
    id: "can-col-auto-021",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    etiqueta: "Derbi",
    texto: "Derbi regional de juveniles. ¿Cómo lo encaras?",
    opciones: [
    {
      texto: "Jugar con cabeza fría",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Ir al choque",
      efectos: {"atributos":{"fisico":2},"moral":5,"riesgoLesion":0.07},
    },
    {
      texto: "Bajar el perfil",
      efectos: {"moral":-2,"reputacion":1},
    },
    ],
  },
  {
    id: "can-gen-auto-022",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Posición",
    texto: "El DT quiere probarte en otra posición. ¿Aceptas el cambio?",
    opciones: [
    {
      texto: "Aceptar y adaptarte",
      efectos: {"atributos":{"pase":1,"defensa":1},"moral":2},
    },
    {
      texto: "Pedir quedarte en tu puesto",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Probar solo unos partidos",
      efectos: {"atributos":{"ritmo":1},"moral":1},
    },
    ],
  },
  {
    id: "can-gen-auto-023",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Entrenamiento",
    texto: "Hay doble turno y el cuerpo pesa. ¿Cómo lo encaras?",
    opciones: [
    {
      texto: "Completar ambos turnos",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.08},
    },
    {
      texto: "Bajar intensidad el segundo",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.04},
    },
    {
      texto: "Pedir descanso al fisio",
      efectos: {"moral":-2,"riesgoLesion":-0.1},
    },
    ],
  },
  {
    id: "can-gen-auto-024",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "Un compañero te desafía en el gym delante de todos. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar el reto",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":2},
    },
    {
      texto: "Ignorarlo y seguir tu plan",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Responder de malas",
      efectos: {"moral":2,"reputacion":-4},
    },
    ],
  },
  {
    id: "can-gen-auto-025",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Ascenso",
    texto: "Te llaman a mirar al primer equipo. ¿Cómo te presentas?",
    opciones: [
    {
      texto: "Llegar puntual y atento",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Pedir que te dejen entrenar",
      efectos: {"moral":5,"reputacion":2},
    },
    {
      texto: "Ponerte nervioso y fallar",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "can-gen-auto-026",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Plantilla",
    texto: "Hay corte de plantilla en la cantera. ¿Cómo te mueves?",
    opciones: [
    {
      texto: "Entrenar más duro",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Hablar con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Bajar la cabeza",
      efectos: {"moral":-4,"reputacion":-1},
    },
    ],
  },
  {
    id: "can-gen-auto-027",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Entrenamiento",
    texto: "Te marcan muy fuerte en cada entrenamiento. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Aguantar y pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"moral":3},
    },
    {
      texto: "Pedir protección al DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    {
      texto: "Bajar el ritmo para evitar choques",
      efectos: {"riesgoLesion":-0.06,"atributos":{"ritmo":-1}},
    },
    ],
  },
  {
    id: "can-gen-auto-028",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "Una pelea en el vestuario te involucra. ¿Qué haces?",
    opciones: [
    {
      texto: "Mediar entre los dos",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Tomar partido por un lado",
      efectos: {"moral":3,"reputacion":-2},
    },
    {
      texto: "Salirte y no meterte",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "can-gen-auto-029",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Compromiso",
    texto: "El club te pregunta si estás 100% comprometido. ¿Qué respondes?",
    opciones: [
    {
      texto: "Decir que sí y demostrarlo",
      efectos: {"reputacion":4,"moral":4,"atributos":{"fisico":1}},
    },
    {
      texto: "Pedir más minutos a cambio",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Dudar en voz alta",
      efectos: {"moral":-3,"reputacion":-3},
    },
    ],
  },
  {
    id: "can-gen-auto-030",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Posición",
    texto: "El DT quiere probarte en otra posición. ¿Aceptas el cambio?",
    opciones: [
    {
      texto: "Aceptar y adaptarte",
      efectos: {"atributos":{"pase":1,"defensa":1},"moral":2},
    },
    {
      texto: "Pedir quedarte en tu puesto",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Probar solo unos partidos",
      efectos: {"atributos":{"ritmo":1},"moral":1},
    },
    ],
  },
  {
    id: "can-gen-auto-031",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Entrenamiento",
    texto: "Hay doble turno y el cuerpo pesa. ¿Cómo lo encaras?",
    opciones: [
    {
      texto: "Completar ambos turnos",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.08},
    },
    {
      texto: "Bajar intensidad el segundo",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.04},
    },
    {
      texto: "Pedir descanso al fisio",
      efectos: {"moral":-2,"riesgoLesion":-0.1},
    },
    ],
  },
  {
    id: "can-gen-auto-032",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "Un compañero te desafía en el gym delante de todos. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar el reto",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":2},
    },
    {
      texto: "Ignorarlo y seguir tu plan",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Responder de malas",
      efectos: {"moral":2,"reputacion":-4},
    },
    ],
  },
  {
    id: "can-gen-auto-033",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Ascenso",
    texto: "Te llaman a mirar al primer equipo. ¿Cómo te presentas?",
    opciones: [
    {
      texto: "Llegar puntual y atento",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Pedir que te dejen entrenar",
      efectos: {"moral":5,"reputacion":2},
    },
    {
      texto: "Ponerte nervioso y fallar",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "can-gen-auto-034",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Plantilla",
    texto: "Hay corte de plantilla en la cantera. ¿Cómo te mueves?",
    opciones: [
    {
      texto: "Entrenar más duro",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Hablar con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Bajar la cabeza",
      efectos: {"moral":-4,"reputacion":-1},
    },
    ],
  },
  {
    id: "can-gen-auto-035",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Entrenamiento",
    texto: "Te marcan muy fuerte en cada entrenamiento. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Aguantar y pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"moral":3},
    },
    {
      texto: "Pedir protección al DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    {
      texto: "Bajar el ritmo para evitar choques",
      efectos: {"riesgoLesion":-0.06,"atributos":{"ritmo":-1}},
    },
    ],
  },
  {
    id: "can-gen-auto-036",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "Una pelea en el vestuario te involucra. ¿Qué haces?",
    opciones: [
    {
      texto: "Mediar entre los dos",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Tomar partido por un lado",
      efectos: {"moral":3,"reputacion":-2},
    },
    {
      texto: "Salirte y no meterte",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "can-gen-auto-037",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Compromiso",
    texto: "El club te pregunta si estás 100% comprometido. ¿Qué respondes?",
    opciones: [
    {
      texto: "Decir que sí y demostrarlo",
      efectos: {"reputacion":4,"moral":4,"atributos":{"fisico":1}},
    },
    {
      texto: "Pedir más minutos a cambio",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Dudar en voz alta",
      efectos: {"moral":-3,"reputacion":-3},
    },
    ],
  },
  {
    id: "can-gen-auto-038",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Posición",
    texto: "El DT quiere probarte en otra posición. ¿Aceptas el cambio?",
    opciones: [
    {
      texto: "Aceptar y adaptarte",
      efectos: {"atributos":{"pase":1,"defensa":1},"moral":2},
    },
    {
      texto: "Pedir quedarte en tu puesto",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Probar solo unos partidos",
      efectos: {"atributos":{"ritmo":1},"moral":1},
    },
    ],
  },
  {
    id: "can-gen-auto-039",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Entrenamiento",
    texto: "Hay doble turno y el cuerpo pesa. ¿Cómo lo encaras?",
    opciones: [
    {
      texto: "Completar ambos turnos",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.08},
    },
    {
      texto: "Bajar intensidad el segundo",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.04},
    },
    {
      texto: "Pedir descanso al fisio",
      efectos: {"moral":-2,"riesgoLesion":-0.1},
    },
    ],
  },
  {
    id: "can-gen-auto-040",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "Un compañero te desafía en el gym delante de todos. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar el reto",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":2},
    },
    {
      texto: "Ignorarlo y seguir tu plan",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Responder de malas",
      efectos: {"moral":2,"reputacion":-4},
    },
    ],
  },
  {
    id: "can-gen-auto-041",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Ascenso",
    texto: "Te llaman a mirar al primer equipo. ¿Cómo te presentas?",
    opciones: [
    {
      texto: "Llegar puntual y atento",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Pedir que te dejen entrenar",
      efectos: {"moral":5,"reputacion":2},
    },
    {
      texto: "Ponerte nervioso y fallar",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "can-gen-auto-042",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Plantilla",
    texto: "Hay corte de plantilla en la cantera. ¿Cómo te mueves?",
    opciones: [
    {
      texto: "Entrenar más duro",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Hablar con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Bajar la cabeza",
      efectos: {"moral":-4,"reputacion":-1},
    },
    ],
  },
  {
    id: "can-gen-auto-043",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Entrenamiento",
    texto: "Te marcan muy fuerte en cada entrenamiento. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Aguantar y pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"moral":3},
    },
    {
      texto: "Pedir protección al DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    {
      texto: "Bajar el ritmo para evitar choques",
      efectos: {"riesgoLesion":-0.06,"atributos":{"ritmo":-1}},
    },
    ],
  },
  {
    id: "can-gen-auto-044",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "Una pelea en el vestuario te involucra. ¿Qué haces?",
    opciones: [
    {
      texto: "Mediar entre los dos",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Tomar partido por un lado",
      efectos: {"moral":3,"reputacion":-2},
    },
    {
      texto: "Salirte y no meterte",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "can-gen-auto-045",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Compromiso",
    texto: "El club te pregunta si estás 100% comprometido. ¿Qué respondes?",
    opciones: [
    {
      texto: "Decir que sí y demostrarlo",
      efectos: {"reputacion":4,"moral":4,"atributos":{"fisico":1}},
    },
    {
      texto: "Pedir más minutos a cambio",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Dudar en voz alta",
      efectos: {"moral":-3,"reputacion":-3},
    },
    ],
  },
  {
    id: "can-gen-auto-046",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Posición",
    texto: "El DT quiere probarte en otra posición. ¿Aceptas el cambio?",
    opciones: [
    {
      texto: "Aceptar y adaptarte",
      efectos: {"atributos":{"pase":1,"defensa":1},"moral":2},
    },
    {
      texto: "Pedir quedarte en tu puesto",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Probar solo unos partidos",
      efectos: {"atributos":{"ritmo":1},"moral":1},
    },
    ],
  },
  {
    id: "can-gen-auto-047",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Entrenamiento",
    texto: "Hay doble turno y el cuerpo pesa. ¿Cómo lo encaras?",
    opciones: [
    {
      texto: "Completar ambos turnos",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.08},
    },
    {
      texto: "Bajar intensidad el segundo",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.04},
    },
    {
      texto: "Pedir descanso al fisio",
      efectos: {"moral":-2,"riesgoLesion":-0.1},
    },
    ],
  },
  {
    id: "can-gen-auto-048",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "Un compañero te desafía en el gym delante de todos. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar el reto",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":2},
    },
    {
      texto: "Ignorarlo y seguir tu plan",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Responder de malas",
      efectos: {"moral":2,"reputacion":-4},
    },
    ],
  },
  {
    id: "can-gen-auto-049",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Ascenso",
    texto: "Te llaman a mirar al primer equipo. ¿Cómo te presentas?",
    opciones: [
    {
      texto: "Llegar puntual y atento",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Pedir que te dejen entrenar",
      efectos: {"moral":5,"reputacion":2},
    },
    {
      texto: "Ponerte nervioso y fallar",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "can-gen-auto-050",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Plantilla",
    texto: "Hay corte de plantilla en la cantera. ¿Cómo te mueves?",
    opciones: [
    {
      texto: "Entrenar más duro",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Hablar con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Bajar la cabeza",
      efectos: {"moral":-4,"reputacion":-1},
    },
    ],
  },
  {
    id: "can-gen-auto-051",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Entrenamiento",
    texto: "Te marcan muy fuerte en cada entrenamiento. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Aguantar y pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"moral":3},
    },
    {
      texto: "Pedir protección al DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    {
      texto: "Bajar el ritmo para evitar choques",
      efectos: {"riesgoLesion":-0.06,"atributos":{"ritmo":-1}},
    },
    ],
  },
  {
    id: "can-gen-auto-052",
    tramoCarrera: "cantera",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "Una pelea en el vestuario te involucra. ¿Qué haces?",
    opciones: [
    {
      texto: "Mediar entre los dos",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Tomar partido por un lado",
      efectos: {"moral":3,"reputacion":-2},
    },
    {
      texto: "Salirte y no meterte",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "con-col-auto-053",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Semana de clásico paisa o cafetero. ¿Cómo te preparas?",
    opciones: [
    {
      texto: "Cerrar la semana enfocado",
      efectos: {"atributos":{"defensa":2},"moral":4},
    },
    {
      texto: "Subir intensidad en entrenos",
      efectos: {"atributos":{"ritmo":2},"riesgoLesion":0.05},
    },
    {
      texto: "Bajar exposición mediática",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-054",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Altura",
    texto: "Viaje a Bogotá y la altura. ¿Qué haces?",
    opciones: [
    {
      texto: "Llegar antes",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":-0.05},
    },
    {
      texto: "Viajar con el plantel",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Forzar sin aclimatación",
      efectos: {"moral":2,"riesgoLesion":0.1},
    },
    ],
  },
  {
    id: "con-col-auto-055",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La barra pide más entrega. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Demostrarlo en la cancha",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":3},
    },
    {
      texto: "Hablar con humildad",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Ignorar la presión",
      efectos: {"moral":1,"reputacion":-1},
    },
    ],
  },
  {
    id: "con-col-auto-056",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Fecha FIFA y el club duda en cedarte. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Insistir en ir",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Negociar una solución",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Quedarte con el club",
      efectos: {"reputacion":-2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "con-col-auto-057",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Noche de Sudamericana en casa. ¿Cómo la encaras?",
    opciones: [
    {
      texto: "Salir a ganar sí o sí",
      efectos: {"atributos":{"tiro":1,"ritmo":1},"moral":5},
    },
    {
      texto: "Cumplir el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-058",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Cancha irregular en provincia. ¿Cómo te adaptas?",
    opciones: [
    {
      texto: "Simplificar el juego",
      efectos: {"atributos":{"pase":2,"defensa":1}},
    },
    {
      texto: "Imponer físico",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":0.05},
    },
    {
      texto: "Quejarte del terreno",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-col-auto-059",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Calor de mediodía en la costa. ¿Cómo dosificas?",
    opciones: [
    {
      texto: "Dosificar y hidratarte",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Ir a full",
      efectos: {"moral":4,"riesgoLesion":0.1},
    },
    {
      texto: "Pedir rotación",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "con-col-auto-060",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Prensa",
    texto: "La prensa local te pone nota baja. ¿Qué haces?",
    opciones: [
    {
      texto: "Responder en la cancha",
      efectos: {"atributos":{"tiro":1},"reputacion":2},
    },
    {
      texto: "Hablar con calma",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Explotar en redes",
      efectos: {"reputacion":-5,"moral":2},
    },
    ],
  },
  {
    id: "con-col-auto-061",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Semana de clásico paisa o cafetero. ¿Cómo te preparas?",
    opciones: [
    {
      texto: "Cerrar la semana enfocado",
      efectos: {"atributos":{"defensa":2},"moral":4},
    },
    {
      texto: "Subir intensidad en entrenos",
      efectos: {"atributos":{"ritmo":2},"riesgoLesion":0.05},
    },
    {
      texto: "Bajar exposición mediática",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-062",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Altura",
    texto: "Viaje a Bogotá y la altura. ¿Qué haces?",
    opciones: [
    {
      texto: "Llegar antes",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":-0.05},
    },
    {
      texto: "Viajar con el plantel",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Forzar sin aclimatación",
      efectos: {"moral":2,"riesgoLesion":0.1},
    },
    ],
  },
  {
    id: "con-col-auto-063",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La barra pide más entrega. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Demostrarlo en la cancha",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":3},
    },
    {
      texto: "Hablar con humildad",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Ignorar la presión",
      efectos: {"moral":1,"reputacion":-1},
    },
    ],
  },
  {
    id: "con-col-auto-064",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Fecha FIFA y el club duda en cedarte. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Insistir en ir",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Negociar una solución",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Quedarte con el club",
      efectos: {"reputacion":-2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "con-col-auto-065",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Noche de Sudamericana en casa. ¿Cómo la encaras?",
    opciones: [
    {
      texto: "Salir a ganar sí o sí",
      efectos: {"atributos":{"tiro":1,"ritmo":1},"moral":5},
    },
    {
      texto: "Cumplir el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-066",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Cancha irregular en provincia. ¿Cómo te adaptas?",
    opciones: [
    {
      texto: "Simplificar el juego",
      efectos: {"atributos":{"pase":2,"defensa":1}},
    },
    {
      texto: "Imponer físico",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":0.05},
    },
    {
      texto: "Quejarte del terreno",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-col-auto-067",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Calor de mediodía en la costa. ¿Cómo dosificas?",
    opciones: [
    {
      texto: "Dosificar y hidratarte",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Ir a full",
      efectos: {"moral":4,"riesgoLesion":0.1},
    },
    {
      texto: "Pedir rotación",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "con-col-auto-068",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Prensa",
    texto: "La prensa local te pone nota baja. ¿Qué haces?",
    opciones: [
    {
      texto: "Responder en la cancha",
      efectos: {"atributos":{"tiro":1},"reputacion":2},
    },
    {
      texto: "Hablar con calma",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Explotar en redes",
      efectos: {"reputacion":-5,"moral":2},
    },
    ],
  },
  {
    id: "con-col-auto-069",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Semana de clásico paisa o cafetero. ¿Cómo te preparas?",
    opciones: [
    {
      texto: "Cerrar la semana enfocado",
      efectos: {"atributos":{"defensa":2},"moral":4},
    },
    {
      texto: "Subir intensidad en entrenos",
      efectos: {"atributos":{"ritmo":2},"riesgoLesion":0.05},
    },
    {
      texto: "Bajar exposición mediática",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-070",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Altura",
    texto: "Viaje a Bogotá y la altura. ¿Qué haces?",
    opciones: [
    {
      texto: "Llegar antes",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":-0.05},
    },
    {
      texto: "Viajar con el plantel",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Forzar sin aclimatación",
      efectos: {"moral":2,"riesgoLesion":0.1},
    },
    ],
  },
  {
    id: "con-col-auto-071",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La barra pide más entrega. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Demostrarlo en la cancha",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":3},
    },
    {
      texto: "Hablar con humildad",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Ignorar la presión",
      efectos: {"moral":1,"reputacion":-1},
    },
    ],
  },
  {
    id: "con-col-auto-072",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Fecha FIFA y el club duda en cedarte. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Insistir en ir",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Negociar una solución",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Quedarte con el club",
      efectos: {"reputacion":-2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "con-col-auto-073",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Noche de Sudamericana en casa. ¿Cómo la encaras?",
    opciones: [
    {
      texto: "Salir a ganar sí o sí",
      efectos: {"atributos":{"tiro":1,"ritmo":1},"moral":5},
    },
    {
      texto: "Cumplir el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-074",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Cancha irregular en provincia. ¿Cómo te adaptas?",
    opciones: [
    {
      texto: "Simplificar el juego",
      efectos: {"atributos":{"pase":2,"defensa":1}},
    },
    {
      texto: "Imponer físico",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":0.05},
    },
    {
      texto: "Quejarte del terreno",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-col-auto-075",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Calor de mediodía en la costa. ¿Cómo dosificas?",
    opciones: [
    {
      texto: "Dosificar y hidratarte",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Ir a full",
      efectos: {"moral":4,"riesgoLesion":0.1},
    },
    {
      texto: "Pedir rotación",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "con-col-auto-076",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Prensa",
    texto: "La prensa local te pone nota baja. ¿Qué haces?",
    opciones: [
    {
      texto: "Responder en la cancha",
      efectos: {"atributos":{"tiro":1},"reputacion":2},
    },
    {
      texto: "Hablar con calma",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Explotar en redes",
      efectos: {"reputacion":-5,"moral":2},
    },
    ],
  },
  {
    id: "con-col-auto-077",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Semana de clásico paisa o cafetero. ¿Cómo te preparas?",
    opciones: [
    {
      texto: "Cerrar la semana enfocado",
      efectos: {"atributos":{"defensa":2},"moral":4},
    },
    {
      texto: "Subir intensidad en entrenos",
      efectos: {"atributos":{"ritmo":2},"riesgoLesion":0.05},
    },
    {
      texto: "Bajar exposición mediática",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-078",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Altura",
    texto: "Viaje a Bogotá y la altura. ¿Qué haces?",
    opciones: [
    {
      texto: "Llegar antes",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":-0.05},
    },
    {
      texto: "Viajar con el plantel",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Forzar sin aclimatación",
      efectos: {"moral":2,"riesgoLesion":0.1},
    },
    ],
  },
  {
    id: "con-col-auto-079",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La barra pide más entrega. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Demostrarlo en la cancha",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":3},
    },
    {
      texto: "Hablar con humildad",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Ignorar la presión",
      efectos: {"moral":1,"reputacion":-1},
    },
    ],
  },
  {
    id: "con-col-auto-080",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Fecha FIFA y el club duda en cedarte. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Insistir en ir",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Negociar una solución",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Quedarte con el club",
      efectos: {"reputacion":-2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "con-col-auto-081",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Noche de Sudamericana en casa. ¿Cómo la encaras?",
    opciones: [
    {
      texto: "Salir a ganar sí o sí",
      efectos: {"atributos":{"tiro":1,"ritmo":1},"moral":5},
    },
    {
      texto: "Cumplir el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-082",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Cancha irregular en provincia. ¿Cómo te adaptas?",
    opciones: [
    {
      texto: "Simplificar el juego",
      efectos: {"atributos":{"pase":2,"defensa":1}},
    },
    {
      texto: "Imponer físico",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":0.05},
    },
    {
      texto: "Quejarte del terreno",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-col-auto-083",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Calor de mediodía en la costa. ¿Cómo dosificas?",
    opciones: [
    {
      texto: "Dosificar y hidratarte",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Ir a full",
      efectos: {"moral":4,"riesgoLesion":0.1},
    },
    {
      texto: "Pedir rotación",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "con-col-auto-084",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Prensa",
    texto: "La prensa local te pone nota baja. ¿Qué haces?",
    opciones: [
    {
      texto: "Responder en la cancha",
      efectos: {"atributos":{"tiro":1},"reputacion":2},
    },
    {
      texto: "Hablar con calma",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Explotar en redes",
      efectos: {"reputacion":-5,"moral":2},
    },
    ],
  },
  {
    id: "con-col-auto-085",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Semana de clásico paisa o cafetero. ¿Cómo te preparas?",
    opciones: [
    {
      texto: "Cerrar la semana enfocado",
      efectos: {"atributos":{"defensa":2},"moral":4},
    },
    {
      texto: "Subir intensidad en entrenos",
      efectos: {"atributos":{"ritmo":2},"riesgoLesion":0.05},
    },
    {
      texto: "Bajar exposición mediática",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-086",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Altura",
    texto: "Viaje a Bogotá y la altura. ¿Qué haces?",
    opciones: [
    {
      texto: "Llegar antes",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":-0.05},
    },
    {
      texto: "Viajar con el plantel",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Forzar sin aclimatación",
      efectos: {"moral":2,"riesgoLesion":0.1},
    },
    ],
  },
  {
    id: "con-col-auto-087",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La barra pide más entrega. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Demostrarlo en la cancha",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":3},
    },
    {
      texto: "Hablar con humildad",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Ignorar la presión",
      efectos: {"moral":1,"reputacion":-1},
    },
    ],
  },
  {
    id: "con-col-auto-088",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Fecha FIFA y el club duda en cedarte. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Insistir en ir",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Negociar una solución",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Quedarte con el club",
      efectos: {"reputacion":-2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "con-col-auto-089",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Noche de Sudamericana en casa. ¿Cómo la encaras?",
    opciones: [
    {
      texto: "Salir a ganar sí o sí",
      efectos: {"atributos":{"tiro":1,"ritmo":1},"moral":5},
    },
    {
      texto: "Cumplir el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "con-col-auto-090",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    etiqueta: "Partido",
    texto: "Cancha irregular en provincia. ¿Cómo te adaptas?",
    opciones: [
    {
      texto: "Simplificar el juego",
      efectos: {"atributos":{"pase":2,"defensa":1}},
    },
    {
      texto: "Imponer físico",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":0.05},
    },
    {
      texto: "Quejarte del terreno",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-091",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Entran tres delanteros en el mercado. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Subir el nivel en entrenamientos",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Pedir charla con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-4,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-092",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Táctica",
    texto: "El DT cambia el esquema y tu rol cambia. ¿Qué haces?",
    opciones: [
    {
      texto: "Adaptarte al nuevo rol",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Pedir tu rol anterior",
      efectos: {"moral":2,"reputacion":-1},
    },
    {
      texto: "Quejarte en el vestuario",
      efectos: {"moral":-2,"reputacion":-4},
    },
    ],
  },
  {
    id: "con-gen-auto-093",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te ofrecen renovar barato. ¿Qué decides?",
    opciones: [
    {
      texto: "Firmar por minutos",
      efectos: {"moral":4,"reputacion":2},
    },
    {
      texto: "Pedir más sueldo",
      efectos: {"reputacion":1,"moral":1},
    },
    {
      texto: "Rechazar y esperar",
      efectos: {"moral":-2,"reputacion":3},
    },
    ],
  },
  {
    id: "con-gen-auto-094",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Una lesión corta te frena dos o tres semanas. ¿Cómo la manejas?",
    opciones: [
    {
      texto: "Cumplir la rehab al pie de la letra",
      efectos: {"riesgoLesion":-0.1,"atributos":{"fisico":1}},
    },
    {
      texto: "Acelerar el retorno",
      efectos: {"moral":3,"riesgoLesion":0.15},
    },
    {
      texto: "Usar el tiempo para estudiar rivales",
      efectos: {"atributos":{"pase":1},"moral":1},
    },
    ],
  },
  {
    id: "con-gen-auto-095",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Prensa",
    texto: "La prensa cuestiona tu nivel. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Callar y responder en la cancha",
      efectos: {"reputacion":3,"atributos":{"tiro":1}},
    },
    {
      texto: "Salir a aclarar",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Enojarte en redes",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "con-gen-auto-096",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El capitán te pide más voz en el vestuario. ¿Aceptas?",
    opciones: [
    {
      texto: "Hablar más y empujar al grupo",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Apoyar en silencio",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Decir que no es tu rol",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-097",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Hay tensión por la titularidad con un compañero. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir en silencio",
      efectos: {"atributos":{"fisico":1,"ritmo":1},"reputacion":3},
    },
    {
      texto: "Hablar claro con él",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Pedir intervención del DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-098",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un amistoso puede decidir tu rol. ¿Cómo lo juegas?",
    opciones: [
    {
      texto: "Ir a demostrar",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "Cumplir el plan del DT",
      efectos: {"atributos":{"pase":2},"reputacion":4},
    },
    {
      texto: "Cuidarte para no lesionarte",
      efectos: {"riesgoLesion":-0.08,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-099",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Entran tres delanteros en el mercado. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Subir el nivel en entrenamientos",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Pedir charla con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-4,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-100",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Táctica",
    texto: "El DT cambia el esquema y tu rol cambia. ¿Qué haces?",
    opciones: [
    {
      texto: "Adaptarte al nuevo rol",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Pedir tu rol anterior",
      efectos: {"moral":2,"reputacion":-1},
    },
    {
      texto: "Quejarte en el vestuario",
      efectos: {"moral":-2,"reputacion":-4},
    },
    ],
  },
  {
    id: "con-gen-auto-101",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te ofrecen renovar barato. ¿Qué decides?",
    opciones: [
    {
      texto: "Firmar por minutos",
      efectos: {"moral":4,"reputacion":2},
    },
    {
      texto: "Pedir más sueldo",
      efectos: {"reputacion":1,"moral":1},
    },
    {
      texto: "Rechazar y esperar",
      efectos: {"moral":-2,"reputacion":3},
    },
    ],
  },
  {
    id: "con-gen-auto-102",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Una lesión corta te frena dos o tres semanas. ¿Cómo la manejas?",
    opciones: [
    {
      texto: "Cumplir la rehab al pie de la letra",
      efectos: {"riesgoLesion":-0.1,"atributos":{"fisico":1}},
    },
    {
      texto: "Acelerar el retorno",
      efectos: {"moral":3,"riesgoLesion":0.15},
    },
    {
      texto: "Usar el tiempo para estudiar rivales",
      efectos: {"atributos":{"pase":1},"moral":1},
    },
    ],
  },
  {
    id: "con-gen-auto-103",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Prensa",
    texto: "La prensa cuestiona tu nivel. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Callar y responder en la cancha",
      efectos: {"reputacion":3,"atributos":{"tiro":1}},
    },
    {
      texto: "Salir a aclarar",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Enojarte en redes",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "con-gen-auto-104",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El capitán te pide más voz en el vestuario. ¿Aceptas?",
    opciones: [
    {
      texto: "Hablar más y empujar al grupo",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Apoyar en silencio",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Decir que no es tu rol",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-105",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Hay tensión por la titularidad con un compañero. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir en silencio",
      efectos: {"atributos":{"fisico":1,"ritmo":1},"reputacion":3},
    },
    {
      texto: "Hablar claro con él",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Pedir intervención del DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-106",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un amistoso puede decidir tu rol. ¿Cómo lo juegas?",
    opciones: [
    {
      texto: "Ir a demostrar",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "Cumplir el plan del DT",
      efectos: {"atributos":{"pase":2},"reputacion":4},
    },
    {
      texto: "Cuidarte para no lesionarte",
      efectos: {"riesgoLesion":-0.08,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-107",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Entran tres delanteros en el mercado. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Subir el nivel en entrenamientos",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Pedir charla con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-4,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-108",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Táctica",
    texto: "El DT cambia el esquema y tu rol cambia. ¿Qué haces?",
    opciones: [
    {
      texto: "Adaptarte al nuevo rol",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Pedir tu rol anterior",
      efectos: {"moral":2,"reputacion":-1},
    },
    {
      texto: "Quejarte en el vestuario",
      efectos: {"moral":-2,"reputacion":-4},
    },
    ],
  },
  {
    id: "con-gen-auto-109",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te ofrecen renovar barato. ¿Qué decides?",
    opciones: [
    {
      texto: "Firmar por minutos",
      efectos: {"moral":4,"reputacion":2},
    },
    {
      texto: "Pedir más sueldo",
      efectos: {"reputacion":1,"moral":1},
    },
    {
      texto: "Rechazar y esperar",
      efectos: {"moral":-2,"reputacion":3},
    },
    ],
  },
  {
    id: "con-gen-auto-110",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Una lesión corta te frena dos o tres semanas. ¿Cómo la manejas?",
    opciones: [
    {
      texto: "Cumplir la rehab al pie de la letra",
      efectos: {"riesgoLesion":-0.1,"atributos":{"fisico":1}},
    },
    {
      texto: "Acelerar el retorno",
      efectos: {"moral":3,"riesgoLesion":0.15},
    },
    {
      texto: "Usar el tiempo para estudiar rivales",
      efectos: {"atributos":{"pase":1},"moral":1},
    },
    ],
  },
  {
    id: "con-gen-auto-111",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Prensa",
    texto: "La prensa cuestiona tu nivel. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Callar y responder en la cancha",
      efectos: {"reputacion":3,"atributos":{"tiro":1}},
    },
    {
      texto: "Salir a aclarar",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Enojarte en redes",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "con-gen-auto-112",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El capitán te pide más voz en el vestuario. ¿Aceptas?",
    opciones: [
    {
      texto: "Hablar más y empujar al grupo",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Apoyar en silencio",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Decir que no es tu rol",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-113",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Hay tensión por la titularidad con un compañero. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir en silencio",
      efectos: {"atributos":{"fisico":1,"ritmo":1},"reputacion":3},
    },
    {
      texto: "Hablar claro con él",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Pedir intervención del DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-114",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un amistoso puede decidir tu rol. ¿Cómo lo juegas?",
    opciones: [
    {
      texto: "Ir a demostrar",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "Cumplir el plan del DT",
      efectos: {"atributos":{"pase":2},"reputacion":4},
    },
    {
      texto: "Cuidarte para no lesionarte",
      efectos: {"riesgoLesion":-0.08,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-115",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Entran tres delanteros en el mercado. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Subir el nivel en entrenamientos",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Pedir charla con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-4,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-116",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Táctica",
    texto: "El DT cambia el esquema y tu rol cambia. ¿Qué haces?",
    opciones: [
    {
      texto: "Adaptarte al nuevo rol",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Pedir tu rol anterior",
      efectos: {"moral":2,"reputacion":-1},
    },
    {
      texto: "Quejarte en el vestuario",
      efectos: {"moral":-2,"reputacion":-4},
    },
    ],
  },
  {
    id: "con-gen-auto-117",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te ofrecen renovar barato. ¿Qué decides?",
    opciones: [
    {
      texto: "Firmar por minutos",
      efectos: {"moral":4,"reputacion":2},
    },
    {
      texto: "Pedir más sueldo",
      efectos: {"reputacion":1,"moral":1},
    },
    {
      texto: "Rechazar y esperar",
      efectos: {"moral":-2,"reputacion":3},
    },
    ],
  },
  {
    id: "con-gen-auto-118",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Una lesión corta te frena dos o tres semanas. ¿Cómo la manejas?",
    opciones: [
    {
      texto: "Cumplir la rehab al pie de la letra",
      efectos: {"riesgoLesion":-0.1,"atributos":{"fisico":1}},
    },
    {
      texto: "Acelerar el retorno",
      efectos: {"moral":3,"riesgoLesion":0.15},
    },
    {
      texto: "Usar el tiempo para estudiar rivales",
      efectos: {"atributos":{"pase":1},"moral":1},
    },
    ],
  },
  {
    id: "con-gen-auto-119",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Prensa",
    texto: "La prensa cuestiona tu nivel. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Callar y responder en la cancha",
      efectos: {"reputacion":3,"atributos":{"tiro":1}},
    },
    {
      texto: "Salir a aclarar",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Enojarte en redes",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "con-gen-auto-120",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El capitán te pide más voz en el vestuario. ¿Aceptas?",
    opciones: [
    {
      texto: "Hablar más y empujar al grupo",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Apoyar en silencio",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Decir que no es tu rol",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-121",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Hay tensión por la titularidad con un compañero. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir en silencio",
      efectos: {"atributos":{"fisico":1,"ritmo":1},"reputacion":3},
    },
    {
      texto: "Hablar claro con él",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Pedir intervención del DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-122",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un amistoso puede decidir tu rol. ¿Cómo lo juegas?",
    opciones: [
    {
      texto: "Ir a demostrar",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "Cumplir el plan del DT",
      efectos: {"atributos":{"pase":2},"reputacion":4},
    },
    {
      texto: "Cuidarte para no lesionarte",
      efectos: {"riesgoLesion":-0.08,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-123",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Entran tres delanteros en el mercado. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Subir el nivel en entrenamientos",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Pedir charla con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-4,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-124",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Táctica",
    texto: "El DT cambia el esquema y tu rol cambia. ¿Qué haces?",
    opciones: [
    {
      texto: "Adaptarte al nuevo rol",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Pedir tu rol anterior",
      efectos: {"moral":2,"reputacion":-1},
    },
    {
      texto: "Quejarte en el vestuario",
      efectos: {"moral":-2,"reputacion":-4},
    },
    ],
  },
  {
    id: "con-gen-auto-125",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te ofrecen renovar barato. ¿Qué decides?",
    opciones: [
    {
      texto: "Firmar por minutos",
      efectos: {"moral":4,"reputacion":2},
    },
    {
      texto: "Pedir más sueldo",
      efectos: {"reputacion":1,"moral":1},
    },
    {
      texto: "Rechazar y esperar",
      efectos: {"moral":-2,"reputacion":3},
    },
    ],
  },
  {
    id: "con-gen-auto-126",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Una lesión corta te frena dos o tres semanas. ¿Cómo la manejas?",
    opciones: [
    {
      texto: "Cumplir la rehab al pie de la letra",
      efectos: {"riesgoLesion":-0.1,"atributos":{"fisico":1}},
    },
    {
      texto: "Acelerar el retorno",
      efectos: {"moral":3,"riesgoLesion":0.15},
    },
    {
      texto: "Usar el tiempo para estudiar rivales",
      efectos: {"atributos":{"pase":1},"moral":1},
    },
    ],
  },
  {
    id: "con-gen-auto-127",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Prensa",
    texto: "La prensa cuestiona tu nivel. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Callar y responder en la cancha",
      efectos: {"reputacion":3,"atributos":{"tiro":1}},
    },
    {
      texto: "Salir a aclarar",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Enojarte en redes",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "con-gen-auto-128",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El capitán te pide más voz en el vestuario. ¿Aceptas?",
    opciones: [
    {
      texto: "Hablar más y empujar al grupo",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Apoyar en silencio",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Decir que no es tu rol",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-129",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Hay tensión por la titularidad con un compañero. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir en silencio",
      efectos: {"atributos":{"fisico":1,"ritmo":1},"reputacion":3},
    },
    {
      texto: "Hablar claro con él",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Pedir intervención del DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-130",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un amistoso puede decidir tu rol. ¿Cómo lo juegas?",
    opciones: [
    {
      texto: "Ir a demostrar",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "Cumplir el plan del DT",
      efectos: {"atributos":{"pase":2},"reputacion":4},
    },
    {
      texto: "Cuidarte para no lesionarte",
      efectos: {"riesgoLesion":-0.08,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-131",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Entran tres delanteros en el mercado. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Subir el nivel en entrenamientos",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Pedir charla con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-4,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-132",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Táctica",
    texto: "El DT cambia el esquema y tu rol cambia. ¿Qué haces?",
    opciones: [
    {
      texto: "Adaptarte al nuevo rol",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Pedir tu rol anterior",
      efectos: {"moral":2,"reputacion":-1},
    },
    {
      texto: "Quejarte en el vestuario",
      efectos: {"moral":-2,"reputacion":-4},
    },
    ],
  },
  {
    id: "con-gen-auto-133",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te ofrecen renovar barato. ¿Qué decides?",
    opciones: [
    {
      texto: "Firmar por minutos",
      efectos: {"moral":4,"reputacion":2},
    },
    {
      texto: "Pedir más sueldo",
      efectos: {"reputacion":1,"moral":1},
    },
    {
      texto: "Rechazar y esperar",
      efectos: {"moral":-2,"reputacion":3},
    },
    ],
  },
  {
    id: "con-gen-auto-134",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Una lesión corta te frena dos o tres semanas. ¿Cómo la manejas?",
    opciones: [
    {
      texto: "Cumplir la rehab al pie de la letra",
      efectos: {"riesgoLesion":-0.1,"atributos":{"fisico":1}},
    },
    {
      texto: "Acelerar el retorno",
      efectos: {"moral":3,"riesgoLesion":0.15},
    },
    {
      texto: "Usar el tiempo para estudiar rivales",
      efectos: {"atributos":{"pase":1},"moral":1},
    },
    ],
  },
  {
    id: "con-gen-auto-135",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Prensa",
    texto: "La prensa cuestiona tu nivel. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Callar y responder en la cancha",
      efectos: {"reputacion":3,"atributos":{"tiro":1}},
    },
    {
      texto: "Salir a aclarar",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Enojarte en redes",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "con-gen-auto-136",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El capitán te pide más voz en el vestuario. ¿Aceptas?",
    opciones: [
    {
      texto: "Hablar más y empujar al grupo",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Apoyar en silencio",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Decir que no es tu rol",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-137",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Hay tensión por la titularidad con un compañero. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir en silencio",
      efectos: {"atributos":{"fisico":1,"ritmo":1},"reputacion":3},
    },
    {
      texto: "Hablar claro con él",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Pedir intervención del DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-138",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un amistoso puede decidir tu rol. ¿Cómo lo juegas?",
    opciones: [
    {
      texto: "Ir a demostrar",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "Cumplir el plan del DT",
      efectos: {"atributos":{"pase":2},"reputacion":4},
    },
    {
      texto: "Cuidarte para no lesionarte",
      efectos: {"riesgoLesion":-0.08,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-139",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Entran tres delanteros en el mercado. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Subir el nivel en entrenamientos",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Pedir charla con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-4,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-140",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Táctica",
    texto: "El DT cambia el esquema y tu rol cambia. ¿Qué haces?",
    opciones: [
    {
      texto: "Adaptarte al nuevo rol",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":3},
    },
    {
      texto: "Pedir tu rol anterior",
      efectos: {"moral":2,"reputacion":-1},
    },
    {
      texto: "Quejarte en el vestuario",
      efectos: {"moral":-2,"reputacion":-4},
    },
    ],
  },
  {
    id: "con-gen-auto-141",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te ofrecen renovar barato. ¿Qué decides?",
    opciones: [
    {
      texto: "Firmar por minutos",
      efectos: {"moral":4,"reputacion":2},
    },
    {
      texto: "Pedir más sueldo",
      efectos: {"reputacion":1,"moral":1},
    },
    {
      texto: "Rechazar y esperar",
      efectos: {"moral":-2,"reputacion":3},
    },
    ],
  },
  {
    id: "con-gen-auto-142",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Una lesión corta te frena dos o tres semanas. ¿Cómo la manejas?",
    opciones: [
    {
      texto: "Cumplir la rehab al pie de la letra",
      efectos: {"riesgoLesion":-0.1,"atributos":{"fisico":1}},
    },
    {
      texto: "Acelerar el retorno",
      efectos: {"moral":3,"riesgoLesion":0.15},
    },
    {
      texto: "Usar el tiempo para estudiar rivales",
      efectos: {"atributos":{"pase":1},"moral":1},
    },
    ],
  },
  {
    id: "con-gen-auto-143",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Prensa",
    texto: "La prensa cuestiona tu nivel. ¿Cómo respondes?",
    opciones: [
    {
      texto: "Callar y responder en la cancha",
      efectos: {"reputacion":3,"atributos":{"tiro":1}},
    },
    {
      texto: "Salir a aclarar",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Enojarte en redes",
      efectos: {"reputacion":-5,"moral":3},
    },
    ],
  },
  {
    id: "con-gen-auto-144",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El capitán te pide más voz en el vestuario. ¿Aceptas?",
    opciones: [
    {
      texto: "Hablar más y empujar al grupo",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Apoyar en silencio",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Decir que no es tu rol",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-gen-auto-145",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Hay tensión por la titularidad con un compañero. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir en silencio",
      efectos: {"atributos":{"fisico":1,"ritmo":1},"reputacion":3},
    },
    {
      texto: "Hablar claro con él",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Pedir intervención del DT",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-146",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un amistoso puede decidir tu rol. ¿Cómo lo juegas?",
    opciones: [
    {
      texto: "Ir a demostrar",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "Cumplir el plan del DT",
      efectos: {"atributos":{"pase":2},"reputacion":4},
    },
    {
      texto: "Cuidarte para no lesionarte",
      efectos: {"riesgoLesion":-0.08,"moral":-1},
    },
    ],
  },
  {
    id: "con-gen-auto-147",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Entran tres delanteros en el mercado. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Subir el nivel en entrenamientos",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":3},
    },
    {
      texto: "Pedir charla con el DT",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-4,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-148",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Hay convocatoria a la Selección. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Ir sí o sí",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Negociar con el club",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Quedarte a recuperar",
      efectos: {"atributos":{"fisico":1},"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-149",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Libertadores",
    texto: "Libertadores: visita pesada de visitante. ¿Cómo llegas?",
    opciones: [
    {
      texto: "Prepararte al detalle",
      efectos: {"atributos":{"defensa":2,"fisico":1},"reputacion":3},
    },
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2},"moral":5},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-150",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Clásico y la ciudad se para. ¿Cómo lo vives?",
    opciones: [
    {
      texto: "Concentrarte en el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Buscar ser figura",
      efectos: {"atributos":{"tiro":2},"moral":5},
    },
    {
      texto: "Bajar exposición previa",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-151",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Sudamericana a eliminatoria. ¿Qué actitud tomas?",
    opciones: [
    {
      texto: "Ir a definir la serie",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "No arriesgar en exceso",
      efectos: {"atributos":{"defensa":2},"riesgoLesion":-0.04},
    },
    {
      texto: "Pedir rotación parcial",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-col-auto-152",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "La Federación pide tu cesión. ¿Qué decides?",
    opciones: [
    {
      texto: "Apoyar la convocatoria",
      efectos: {"reputacion":7,"moral":5},
    },
    {
      texto: "Negociar fechas",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":-3,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "pri-col-auto-153",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje largo por Copa. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Descansar y recuperar",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Mantener rutina normal",
      efectos: {"moral":2,"atributos":{"ritmo":1}},
    },
    {
      texto: "Forzar sesiones extras",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":0.08},
    },
    ],
  },
  {
    id: "pri-col-auto-154",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La hinchada te nombra ídolo. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Agradecer y seguir trabajando",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Subir el perfil mediático",
      efectos: {"reputacion":6,"moral":3},
    },
    {
      texto: "Bajar exposición",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-155",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Pretemporada",
    texto: "Pretemporada en altura. ¿Cómo la encaras?",
    opciones: [
    {
      texto: "Cumplir toda la carga",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"riesgoLesion":0.05},
    },
    {
      texto: "Dosificar con el fisio",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.06},
    },
    {
      texto: "Quejarte de la exigencia",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-156",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Hay convocatoria a la Selección. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Ir sí o sí",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Negociar con el club",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Quedarte a recuperar",
      efectos: {"atributos":{"fisico":1},"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-157",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Libertadores",
    texto: "Libertadores: visita pesada de visitante. ¿Cómo llegas?",
    opciones: [
    {
      texto: "Prepararte al detalle",
      efectos: {"atributos":{"defensa":2,"fisico":1},"reputacion":3},
    },
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2},"moral":5},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-158",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Clásico y la ciudad se para. ¿Cómo lo vives?",
    opciones: [
    {
      texto: "Concentrarte en el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Buscar ser figura",
      efectos: {"atributos":{"tiro":2},"moral":5},
    },
    {
      texto: "Bajar exposición previa",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-159",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Sudamericana a eliminatoria. ¿Qué actitud tomas?",
    opciones: [
    {
      texto: "Ir a definir la serie",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "No arriesgar en exceso",
      efectos: {"atributos":{"defensa":2},"riesgoLesion":-0.04},
    },
    {
      texto: "Pedir rotación parcial",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-col-auto-160",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "La Federación pide tu cesión. ¿Qué decides?",
    opciones: [
    {
      texto: "Apoyar la convocatoria",
      efectos: {"reputacion":7,"moral":5},
    },
    {
      texto: "Negociar fechas",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":-3,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "pri-col-auto-161",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje largo por Copa. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Descansar y recuperar",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Mantener rutina normal",
      efectos: {"moral":2,"atributos":{"ritmo":1}},
    },
    {
      texto: "Forzar sesiones extras",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":0.08},
    },
    ],
  },
  {
    id: "pri-col-auto-162",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La hinchada te nombra ídolo. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Agradecer y seguir trabajando",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Subir el perfil mediático",
      efectos: {"reputacion":6,"moral":3},
    },
    {
      texto: "Bajar exposición",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-163",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Pretemporada",
    texto: "Pretemporada en altura. ¿Cómo la encaras?",
    opciones: [
    {
      texto: "Cumplir toda la carga",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"riesgoLesion":0.05},
    },
    {
      texto: "Dosificar con el fisio",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.06},
    },
    {
      texto: "Quejarte de la exigencia",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-164",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Hay convocatoria a la Selección. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Ir sí o sí",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Negociar con el club",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Quedarte a recuperar",
      efectos: {"atributos":{"fisico":1},"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-165",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Libertadores",
    texto: "Libertadores: visita pesada de visitante. ¿Cómo llegas?",
    opciones: [
    {
      texto: "Prepararte al detalle",
      efectos: {"atributos":{"defensa":2,"fisico":1},"reputacion":3},
    },
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2},"moral":5},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-166",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Clásico y la ciudad se para. ¿Cómo lo vives?",
    opciones: [
    {
      texto: "Concentrarte en el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Buscar ser figura",
      efectos: {"atributos":{"tiro":2},"moral":5},
    },
    {
      texto: "Bajar exposición previa",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-167",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Sudamericana a eliminatoria. ¿Qué actitud tomas?",
    opciones: [
    {
      texto: "Ir a definir la serie",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "No arriesgar en exceso",
      efectos: {"atributos":{"defensa":2},"riesgoLesion":-0.04},
    },
    {
      texto: "Pedir rotación parcial",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-col-auto-168",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "La Federación pide tu cesión. ¿Qué decides?",
    opciones: [
    {
      texto: "Apoyar la convocatoria",
      efectos: {"reputacion":7,"moral":5},
    },
    {
      texto: "Negociar fechas",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":-3,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "pri-col-auto-169",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje largo por Copa. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Descansar y recuperar",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Mantener rutina normal",
      efectos: {"moral":2,"atributos":{"ritmo":1}},
    },
    {
      texto: "Forzar sesiones extras",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":0.08},
    },
    ],
  },
  {
    id: "pri-col-auto-170",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La hinchada te nombra ídolo. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Agradecer y seguir trabajando",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Subir el perfil mediático",
      efectos: {"reputacion":6,"moral":3},
    },
    {
      texto: "Bajar exposición",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-171",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Pretemporada",
    texto: "Pretemporada en altura. ¿Cómo la encaras?",
    opciones: [
    {
      texto: "Cumplir toda la carga",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"riesgoLesion":0.05},
    },
    {
      texto: "Dosificar con el fisio",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.06},
    },
    {
      texto: "Quejarte de la exigencia",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-172",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Hay convocatoria a la Selección. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Ir sí o sí",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Negociar con el club",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Quedarte a recuperar",
      efectos: {"atributos":{"fisico":1},"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-173",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Libertadores",
    texto: "Libertadores: visita pesada de visitante. ¿Cómo llegas?",
    opciones: [
    {
      texto: "Prepararte al detalle",
      efectos: {"atributos":{"defensa":2,"fisico":1},"reputacion":3},
    },
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2},"moral":5},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-174",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Clásico y la ciudad se para. ¿Cómo lo vives?",
    opciones: [
    {
      texto: "Concentrarte en el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Buscar ser figura",
      efectos: {"atributos":{"tiro":2},"moral":5},
    },
    {
      texto: "Bajar exposición previa",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-175",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Sudamericana a eliminatoria. ¿Qué actitud tomas?",
    opciones: [
    {
      texto: "Ir a definir la serie",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "No arriesgar en exceso",
      efectos: {"atributos":{"defensa":2},"riesgoLesion":-0.04},
    },
    {
      texto: "Pedir rotación parcial",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-col-auto-176",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "La Federación pide tu cesión. ¿Qué decides?",
    opciones: [
    {
      texto: "Apoyar la convocatoria",
      efectos: {"reputacion":7,"moral":5},
    },
    {
      texto: "Negociar fechas",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":-3,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "pri-col-auto-177",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje largo por Copa. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Descansar y recuperar",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Mantener rutina normal",
      efectos: {"moral":2,"atributos":{"ritmo":1}},
    },
    {
      texto: "Forzar sesiones extras",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":0.08},
    },
    ],
  },
  {
    id: "pri-col-auto-178",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La hinchada te nombra ídolo. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Agradecer y seguir trabajando",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Subir el perfil mediático",
      efectos: {"reputacion":6,"moral":3},
    },
    {
      texto: "Bajar exposición",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-179",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Pretemporada",
    texto: "Pretemporada en altura. ¿Cómo la encaras?",
    opciones: [
    {
      texto: "Cumplir toda la carga",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"riesgoLesion":0.05},
    },
    {
      texto: "Dosificar con el fisio",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.06},
    },
    {
      texto: "Quejarte de la exigencia",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-180",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "Hay convocatoria a la Selección. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Ir sí o sí",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Negociar con el club",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Quedarte a recuperar",
      efectos: {"atributos":{"fisico":1},"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-col-auto-181",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Libertadores",
    texto: "Libertadores: visita pesada de visitante. ¿Cómo llegas?",
    opciones: [
    {
      texto: "Prepararte al detalle",
      efectos: {"atributos":{"defensa":2,"fisico":1},"reputacion":3},
    },
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2},"moral":5},
    },
    {
      texto: "Cuidar el cuerpo",
      efectos: {"riesgoLesion":-0.06,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-182",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Clásico y la ciudad se para. ¿Cómo lo vives?",
    opciones: [
    {
      texto: "Concentrarte en el plan",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Buscar ser figura",
      efectos: {"atributos":{"tiro":2},"moral":5},
    },
    {
      texto: "Bajar exposición previa",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "pri-col-auto-183",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Copa",
    texto: "Sudamericana a eliminatoria. ¿Qué actitud tomas?",
    opciones: [
    {
      texto: "Ir a definir la serie",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":3},
    },
    {
      texto: "No arriesgar en exceso",
      efectos: {"atributos":{"defensa":2},"riesgoLesion":-0.04},
    },
    {
      texto: "Pedir rotación parcial",
      efectos: {"moral":-1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-col-auto-184",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Selección",
    texto: "La Federación pide tu cesión. ¿Qué decides?",
    opciones: [
    {
      texto: "Apoyar la convocatoria",
      efectos: {"reputacion":7,"moral":5},
    },
    {
      texto: "Negociar fechas",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":-3,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "pri-col-auto-185",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    etiqueta: "Viaje",
    texto: "Viaje largo por Copa. ¿Cómo lo manejas?",
    opciones: [
    {
      texto: "Descansar y recuperar",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":-0.05},
    },
    {
      texto: "Mantener rutina normal",
      efectos: {"moral":2,"atributos":{"ritmo":1}},
    },
    {
      texto: "Forzar sesiones extras",
      efectos: {"atributos":{"fisico":1},"riesgoLesion":0.08},
    },
    ],
  },
  {
    id: "pri-gen-auto-186",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Transferencia",
    texto: "El club quiere venderte. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y buscar destino",
      efectos: {"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir quedarte",
      efectos: {"moral":2,"reputacion":1},
    },
    {
      texto: "Exigir una cláusula mejor",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-187",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "Te ofrecen la capitanía. ¿La Aceptas?",
    opciones: [
    {
      texto: "Aceptar el brazalete",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Aceptar sin hacer ruido",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Rechazar el cargo",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-188",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Llega un 9 estrella a tu puesto. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir de frente",
      efectos: {"atributos":{"tiro":2,"fisico":1},"moral":4},
    },
    {
      texto: "Aprender de él",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-189",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Asoma una lesión seria. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Parar y tratarte bien",
      efectos: {"riesgoLesion":-0.12,"moral":-3},
    },
    {
      texto: "Seguir con carga controlada",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Jugar el partido clave igual",
      efectos: {"moral":5,"riesgoLesion":0.2},
    },
    ],
  },
  {
    id: "pri-gen-auto-190",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "El DT te pide liderar el vestuario. ¿Cómo lo haces?",
    opciones: [
    {
      texto: "Hablar claro y exigir",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Liderar con el ejemplo",
      efectos: {"reputacion":5,"atributos":{"fisico":1}},
    },
    {
      texto: "Delegar en otros",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-191",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Hay pelea por tu cláusula. ¿Qué postura tomas?",
    opciones: [
    {
      texto: "Bajarla para facilitar la salida",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Mantenerla firme",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Dejar todo en manos del agente",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-192",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un rival te marca muy duro. ¿Cómo respondes?",
    opciones: [
    {
      texto: "No entrar al juego y jugar limpio",
      efectos: {"reputacion":4,"atributos":{"pase":1}},
    },
    {
      texto: "Devolver con intensidad",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.06},
    },
    {
      texto: "Pedir protección al árbitro",
      efectos: {"moral":1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-gen-auto-193",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te piden bajar el sueldo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar por el proyecto",
      efectos: {"moral":2,"reputacion":4},
    },
    {
      texto: "Negociar a mitad de camino",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Rechazar y pedir salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-194",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Transferencia",
    texto: "El club quiere venderte. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y buscar destino",
      efectos: {"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir quedarte",
      efectos: {"moral":2,"reputacion":1},
    },
    {
      texto: "Exigir una cláusula mejor",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-195",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "Te ofrecen la capitanía. ¿La Aceptas?",
    opciones: [
    {
      texto: "Aceptar el brazalete",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Aceptar sin hacer ruido",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Rechazar el cargo",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-196",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Llega un 9 estrella a tu puesto. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir de frente",
      efectos: {"atributos":{"tiro":2,"fisico":1},"moral":4},
    },
    {
      texto: "Aprender de él",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-197",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Asoma una lesión seria. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Parar y tratarte bien",
      efectos: {"riesgoLesion":-0.12,"moral":-3},
    },
    {
      texto: "Seguir con carga controlada",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Jugar el partido clave igual",
      efectos: {"moral":5,"riesgoLesion":0.2},
    },
    ],
  },
  {
    id: "pri-gen-auto-198",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "El DT te pide liderar el vestuario. ¿Cómo lo haces?",
    opciones: [
    {
      texto: "Hablar claro y exigir",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Liderar con el ejemplo",
      efectos: {"reputacion":5,"atributos":{"fisico":1}},
    },
    {
      texto: "Delegar en otros",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-199",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Hay pelea por tu cláusula. ¿Qué postura tomas?",
    opciones: [
    {
      texto: "Bajarla para facilitar la salida",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Mantenerla firme",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Dejar todo en manos del agente",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-200",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un rival te marca muy duro. ¿Cómo respondes?",
    opciones: [
    {
      texto: "No entrar al juego y jugar limpio",
      efectos: {"reputacion":4,"atributos":{"pase":1}},
    },
    {
      texto: "Devolver con intensidad",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.06},
    },
    {
      texto: "Pedir protección al árbitro",
      efectos: {"moral":1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-gen-auto-201",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te piden bajar el sueldo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar por el proyecto",
      efectos: {"moral":2,"reputacion":4},
    },
    {
      texto: "Negociar a mitad de camino",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Rechazar y pedir salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-202",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Transferencia",
    texto: "El club quiere venderte. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y buscar destino",
      efectos: {"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir quedarte",
      efectos: {"moral":2,"reputacion":1},
    },
    {
      texto: "Exigir una cláusula mejor",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-203",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "Te ofrecen la capitanía. ¿La Aceptas?",
    opciones: [
    {
      texto: "Aceptar el brazalete",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Aceptar sin hacer ruido",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Rechazar el cargo",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-204",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Llega un 9 estrella a tu puesto. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir de frente",
      efectos: {"atributos":{"tiro":2,"fisico":1},"moral":4},
    },
    {
      texto: "Aprender de él",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-205",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Asoma una lesión seria. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Parar y tratarte bien",
      efectos: {"riesgoLesion":-0.12,"moral":-3},
    },
    {
      texto: "Seguir con carga controlada",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Jugar el partido clave igual",
      efectos: {"moral":5,"riesgoLesion":0.2},
    },
    ],
  },
  {
    id: "pri-gen-auto-206",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "El DT te pide liderar el vestuario. ¿Cómo lo haces?",
    opciones: [
    {
      texto: "Hablar claro y exigir",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Liderar con el ejemplo",
      efectos: {"reputacion":5,"atributos":{"fisico":1}},
    },
    {
      texto: "Delegar en otros",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-207",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Hay pelea por tu cláusula. ¿Qué postura tomas?",
    opciones: [
    {
      texto: "Bajarla para facilitar la salida",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Mantenerla firme",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Dejar todo en manos del agente",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-208",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un rival te marca muy duro. ¿Cómo respondes?",
    opciones: [
    {
      texto: "No entrar al juego y jugar limpio",
      efectos: {"reputacion":4,"atributos":{"pase":1}},
    },
    {
      texto: "Devolver con intensidad",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.06},
    },
    {
      texto: "Pedir protección al árbitro",
      efectos: {"moral":1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-gen-auto-209",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te piden bajar el sueldo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar por el proyecto",
      efectos: {"moral":2,"reputacion":4},
    },
    {
      texto: "Negociar a mitad de camino",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Rechazar y pedir salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-210",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Transferencia",
    texto: "El club quiere venderte. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y buscar destino",
      efectos: {"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir quedarte",
      efectos: {"moral":2,"reputacion":1},
    },
    {
      texto: "Exigir una cláusula mejor",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-211",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "Te ofrecen la capitanía. ¿La Aceptas?",
    opciones: [
    {
      texto: "Aceptar el brazalete",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Aceptar sin hacer ruido",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Rechazar el cargo",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-212",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Llega un 9 estrella a tu puesto. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir de frente",
      efectos: {"atributos":{"tiro":2,"fisico":1},"moral":4},
    },
    {
      texto: "Aprender de él",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-213",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Asoma una lesión seria. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Parar y tratarte bien",
      efectos: {"riesgoLesion":-0.12,"moral":-3},
    },
    {
      texto: "Seguir con carga controlada",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Jugar el partido clave igual",
      efectos: {"moral":5,"riesgoLesion":0.2},
    },
    ],
  },
  {
    id: "pri-gen-auto-214",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "El DT te pide liderar el vestuario. ¿Cómo lo haces?",
    opciones: [
    {
      texto: "Hablar claro y exigir",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Liderar con el ejemplo",
      efectos: {"reputacion":5,"atributos":{"fisico":1}},
    },
    {
      texto: "Delegar en otros",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-215",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Hay pelea por tu cláusula. ¿Qué postura tomas?",
    opciones: [
    {
      texto: "Bajarla para facilitar la salida",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Mantenerla firme",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Dejar todo en manos del agente",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-216",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un rival te marca muy duro. ¿Cómo respondes?",
    opciones: [
    {
      texto: "No entrar al juego y jugar limpio",
      efectos: {"reputacion":4,"atributos":{"pase":1}},
    },
    {
      texto: "Devolver con intensidad",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.06},
    },
    {
      texto: "Pedir protección al árbitro",
      efectos: {"moral":1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-gen-auto-217",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te piden bajar el sueldo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar por el proyecto",
      efectos: {"moral":2,"reputacion":4},
    },
    {
      texto: "Negociar a mitad de camino",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Rechazar y pedir salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-218",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Transferencia",
    texto: "El club quiere venderte. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y buscar destino",
      efectos: {"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir quedarte",
      efectos: {"moral":2,"reputacion":1},
    },
    {
      texto: "Exigir una cláusula mejor",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-219",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "Te ofrecen la capitanía. ¿La Aceptas?",
    opciones: [
    {
      texto: "Aceptar el brazalete",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Aceptar sin hacer ruido",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Rechazar el cargo",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-220",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Llega un 9 estrella a tu puesto. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir de frente",
      efectos: {"atributos":{"tiro":2,"fisico":1},"moral":4},
    },
    {
      texto: "Aprender de él",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-221",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Asoma una lesión seria. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Parar y tratarte bien",
      efectos: {"riesgoLesion":-0.12,"moral":-3},
    },
    {
      texto: "Seguir con carga controlada",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Jugar el partido clave igual",
      efectos: {"moral":5,"riesgoLesion":0.2},
    },
    ],
  },
  {
    id: "pri-gen-auto-222",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "El DT te pide liderar el vestuario. ¿Cómo lo haces?",
    opciones: [
    {
      texto: "Hablar claro y exigir",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Liderar con el ejemplo",
      efectos: {"reputacion":5,"atributos":{"fisico":1}},
    },
    {
      texto: "Delegar en otros",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-223",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Hay pelea por tu cláusula. ¿Qué postura tomas?",
    opciones: [
    {
      texto: "Bajarla para facilitar la salida",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Mantenerla firme",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Dejar todo en manos del agente",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-224",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un rival te marca muy duro. ¿Cómo respondes?",
    opciones: [
    {
      texto: "No entrar al juego y jugar limpio",
      efectos: {"reputacion":4,"atributos":{"pase":1}},
    },
    {
      texto: "Devolver con intensidad",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.06},
    },
    {
      texto: "Pedir protección al árbitro",
      efectos: {"moral":1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-gen-auto-225",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te piden bajar el sueldo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar por el proyecto",
      efectos: {"moral":2,"reputacion":4},
    },
    {
      texto: "Negociar a mitad de camino",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Rechazar y pedir salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-226",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Transferencia",
    texto: "El club quiere venderte. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y buscar destino",
      efectos: {"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir quedarte",
      efectos: {"moral":2,"reputacion":1},
    },
    {
      texto: "Exigir una cláusula mejor",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-227",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "Te ofrecen la capitanía. ¿La Aceptas?",
    opciones: [
    {
      texto: "Aceptar el brazalete",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Aceptar sin hacer ruido",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Rechazar el cargo",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-228",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Llega un 9 estrella a tu puesto. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir de frente",
      efectos: {"atributos":{"tiro":2,"fisico":1},"moral":4},
    },
    {
      texto: "Aprender de él",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-229",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Asoma una lesión seria. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Parar y tratarte bien",
      efectos: {"riesgoLesion":-0.12,"moral":-3},
    },
    {
      texto: "Seguir con carga controlada",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Jugar el partido clave igual",
      efectos: {"moral":5,"riesgoLesion":0.2},
    },
    ],
  },
  {
    id: "pri-gen-auto-230",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "El DT te pide liderar el vestuario. ¿Cómo lo haces?",
    opciones: [
    {
      texto: "Hablar claro y exigir",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Liderar con el ejemplo",
      efectos: {"reputacion":5,"atributos":{"fisico":1}},
    },
    {
      texto: "Delegar en otros",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-231",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Hay pelea por tu cláusula. ¿Qué postura tomas?",
    opciones: [
    {
      texto: "Bajarla para facilitar la salida",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Mantenerla firme",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Dejar todo en manos del agente",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-232",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un rival te marca muy duro. ¿Cómo respondes?",
    opciones: [
    {
      texto: "No entrar al juego y jugar limpio",
      efectos: {"reputacion":4,"atributos":{"pase":1}},
    },
    {
      texto: "Devolver con intensidad",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.06},
    },
    {
      texto: "Pedir protección al árbitro",
      efectos: {"moral":1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-gen-auto-233",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te piden bajar el sueldo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar por el proyecto",
      efectos: {"moral":2,"reputacion":4},
    },
    {
      texto: "Negociar a mitad de camino",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Rechazar y pedir salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-234",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Transferencia",
    texto: "El club quiere venderte. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y buscar destino",
      efectos: {"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir quedarte",
      efectos: {"moral":2,"reputacion":1},
    },
    {
      texto: "Exigir una cláusula mejor",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-235",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "Te ofrecen la capitanía. ¿La Aceptas?",
    opciones: [
    {
      texto: "Aceptar el brazalete",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Aceptar sin hacer ruido",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Rechazar el cargo",
      efectos: {"moral":-2,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-236",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Llega un 9 estrella a tu puesto. ¿Qué haces?",
    opciones: [
    {
      texto: "Competir de frente",
      efectos: {"atributos":{"tiro":2,"fisico":1},"moral":4},
    },
    {
      texto: "Aprender de él",
      efectos: {"atributos":{"pase":2},"reputacion":3},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-237",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Asoma una lesión seria. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Parar y tratarte bien",
      efectos: {"riesgoLesion":-0.12,"moral":-3},
    },
    {
      texto: "Seguir con carga controlada",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Jugar el partido clave igual",
      efectos: {"moral":5,"riesgoLesion":0.2},
    },
    ],
  },
  {
    id: "pri-gen-auto-238",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Vestuario",
    texto: "El DT te pide liderar el vestuario. ¿Cómo lo haces?",
    opciones: [
    {
      texto: "Hablar claro y exigir",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Liderar con el ejemplo",
      efectos: {"reputacion":5,"atributos":{"fisico":1}},
    },
    {
      texto: "Delegar en otros",
      efectos: {"moral":-1,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-239",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Hay pelea por tu cláusula. ¿Qué postura tomas?",
    opciones: [
    {
      texto: "Bajarla para facilitar la salida",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Mantenerla firme",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Dejar todo en manos del agente",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "pri-gen-auto-240",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Partido",
    texto: "Un rival te marca muy duro. ¿Cómo respondes?",
    opciones: [
    {
      texto: "No entrar al juego y jugar limpio",
      efectos: {"reputacion":4,"atributos":{"pase":1}},
    },
    {
      texto: "Devolver con intensidad",
      efectos: {"atributos":{"fisico":2},"moral":3,"riesgoLesion":0.06},
    },
    {
      texto: "Pedir protección al árbitro",
      efectos: {"moral":1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-gen-auto-241",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te piden bajar el sueldo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar por el proyecto",
      efectos: {"moral":2,"reputacion":4},
    },
    {
      texto: "Negociar a mitad de camino",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Rechazar y pedir salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-gen-auto-242",
    tramoCarrera: "prime",
    categoria: "generico",
    etiqueta: "Transferencia",
    texto: "El club quiere venderte. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y buscar destino",
      efectos: {"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir quedarte",
      efectos: {"moral":2,"reputacion":1},
    },
    {
      texto: "Exigir una cláusula mejor",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "vet-col-auto-243",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Retiro",
    texto: "Hablan de partido de despedida. ¿Qué decides?",
    opciones: [
    {
      texto: "Aceptar el homenaje",
      efectos: {"moral":8,"reputacion":6},
    },
    {
      texto: "Jugar una temporada más",
      efectos: {"moral":3,"riesgoLesion":0.08},
    },
    {
      texto: "Irte sin ruido",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "vet-col-auto-244",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La hinchada pide tu retiro en casa. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y despedirte ahí",
      efectos: {"moral":7,"reputacion":5},
    },
    {
      texto: "Pedir un año más",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Ignorar la presión",
      efectos: {"moral":1,"reputacion":-2},
    },
    ],
  },
  {
    id: "vet-col-auto-245",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Oferta",
    texto: "Te ofrecen ir a un Ascenso. ¿Lo consideras?",
    opciones: [
    {
      texto: "Aceptar por minutos",
      efectos: {"moral":4,"reputacion":1},
    },
    {
      texto: "Rechazar y buscar Primera",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Usarlo para negociar acá",
      efectos: {"reputacion":3},
    },
    ],
  },
  {
    id: "vet-col-auto-246",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Un clásico puede ser el último. ¿Cómo lo vives?",
    opciones: [
    {
      texto: "Salir a disfrutar y competir",
      efectos: {"moral":6,"reputacion":4},
    },
    {
      texto: "Cumplir el plan",
      efectos: {"atributos":{"defensa":1},"reputacion":2},
    },
    {
      texto: "Pedir no arriesgar el cuerpo",
      efectos: {"riesgoLesion":-0.08,"moral":-1},
    },
    ],
  },
  {
    id: "vet-col-auto-247",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Prensa",
    texto: "La prensa recapitula tu carrera. ¿Cómo apareces?",
    opciones: [
    {
      texto: "Hablar con humildad",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "Destacar tus logros",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Evitar entrevistas",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "vet-col-auto-248",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Club",
    texto: "El club quiere tu camiseta en el museo. ¿Aceptas?",
    opciones: [
    {
      texto: "Aceptar emocionado",
      efectos: {"moral":8,"reputacion":6},
    },
    {
      texto: "Aceptar en privado",
      efectos: {"moral":4,"reputacion":3},
    },
    {
      texto: "Pedir esperar un año",
      efectos: {"moral":2,"reputacion":1},
    },
    ],
  },
  {
    id: "vet-col-auto-249",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Cuerpo",
    texto: "Viaje corto, pero el cuerpo va lento. ¿Qué haces?",
    opciones: [
    {
      texto: "Pedir rotación",
      efectos: {"riesgoLesion":-0.08,"reputacion":1},
    },
    {
      texto: "Jugar igual",
      efectos: {"moral":3,"riesgoLesion":0.1},
    },
    {
      texto: "Entrar desde el banco",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "vet-col-auto-250",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Cantera",
    texto: "Te invitan a la cantera como formador. ¿Te interesa?",
    opciones: [
    {
      texto: "Aceptar al terminar la temporada",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Combinar con minutos",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Rechazar por ahora",
      efectos: {"moral":1,"reputacion":-1},
    },
    ],
  },
  {
    id: "vet-col-auto-251",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Retiro",
    texto: "Hablan de partido de despedida. ¿Qué decides?",
    opciones: [
    {
      texto: "Aceptar el homenaje",
      efectos: {"moral":8,"reputacion":6},
    },
    {
      texto: "Jugar una temporada más",
      efectos: {"moral":3,"riesgoLesion":0.08},
    },
    {
      texto: "Irte sin ruido",
      efectos: {"reputacion":2,"moral":-1},
    },
    ],
  },
  {
    id: "vet-col-auto-252",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Hinchada",
    texto: "La hinchada pide tu retiro en casa. ¿Cómo lo tomas?",
    opciones: [
    {
      texto: "Aceptar y despedirte ahí",
      efectos: {"moral":7,"reputacion":5},
    },
    {
      texto: "Pedir un año más",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Ignorar la presión",
      efectos: {"moral":1,"reputacion":-2},
    },
    ],
  },
  {
    id: "vet-col-auto-253",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Oferta",
    texto: "Te ofrecen ir a un Ascenso. ¿Lo consideras?",
    opciones: [
    {
      texto: "Aceptar por minutos",
      efectos: {"moral":4,"reputacion":1},
    },
    {
      texto: "Rechazar y buscar Primera",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Usarlo para negociar acá",
      efectos: {"reputacion":3},
    },
    ],
  },
  {
    id: "vet-col-auto-254",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Clásico",
    texto: "Un clásico puede ser el último. ¿Cómo lo vives?",
    opciones: [
    {
      texto: "Salir a disfrutar y competir",
      efectos: {"moral":6,"reputacion":4},
    },
    {
      texto: "Cumplir el plan",
      efectos: {"atributos":{"defensa":1},"reputacion":2},
    },
    {
      texto: "Pedir no arriesgar el cuerpo",
      efectos: {"riesgoLesion":-0.08,"moral":-1},
    },
    ],
  },
  {
    id: "vet-col-auto-255",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Prensa",
    texto: "La prensa recapitula tu carrera. ¿Cómo apareces?",
    opciones: [
    {
      texto: "Hablar con humildad",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "Destacar tus logros",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Evitar entrevistas",
      efectos: {"reputacion":1,"moral":-1},
    },
    ],
  },
  {
    id: "vet-col-auto-256",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Club",
    texto: "El club quiere tu camiseta en el museo. ¿Aceptas?",
    opciones: [
    {
      texto: "Aceptar emocionado",
      efectos: {"moral":8,"reputacion":6},
    },
    {
      texto: "Aceptar en privado",
      efectos: {"moral":4,"reputacion":3},
    },
    {
      texto: "Pedir esperar un año",
      efectos: {"moral":2,"reputacion":1},
    },
    ],
  },
  {
    id: "vet-col-auto-257",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    etiqueta: "Cuerpo",
    texto: "Viaje corto, pero el cuerpo va lento. ¿Qué haces?",
    opciones: [
    {
      texto: "Pedir rotación",
      efectos: {"riesgoLesion":-0.08,"reputacion":1},
    },
    {
      texto: "Jugar igual",
      efectos: {"moral":3,"riesgoLesion":0.1},
    },
    {
      texto: "Entrar desde el banco",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "vet-gen-auto-258",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Te bajan a suplente fijo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar y aportar desde el banco",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Pedir minutos al DT",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "vet-gen-auto-259",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Cuerpo",
    texto: "El cuerpo pide más descanso. ¿Cómo lo atiendes?",
    opciones: [
    {
      texto: "Bajar carga",
      efectos: {"riesgoLesion":-0.12,"atributos":{"fisico":1}},
    },
    {
      texto: "Mantener rutina",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Cambiar recuperación y sueño",
      efectos: {"atributos":{"fisico":2},"moral":3},
    },
    ],
  },
  {
    id: "vet-gen-auto-260",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Un joven te gana el puesto. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Mentorearlo",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Pelear el puesto",
      efectos: {"atributos":{"fisico":1},"moral":3},
    },
    {
      texto: "Pedir salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "vet-gen-auto-261",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Oferta",
    texto: "Llega oferta de un club menor. ¿La tomas?",
    opciones: [
    {
      texto: "Aceptar por minutos",
      efectos: {"moral":4,"reputacion":1},
    },
    {
      texto: "Rechazar y pelear acá",
      efectos: {"moral":2,"reputacion":2},
    },
    {
      texto: "Usarla para negociar",
      efectos: {"reputacion":3,"moral":1},
    },
    ],
  },
  {
    id: "vet-gen-auto-262",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El DT te pide rol de mentor. ¿Aceptas?",
    opciones: [
    {
      texto: "Aceptar y formar jóvenes",
      efectos: {"reputacion":6,"moral":3},
    },
    {
      texto: "Aceptar a medias",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Preferir solo jugar",
      efectos: {"moral":2,"reputacion":-2},
    },
    ],
  },
  {
    id: "vet-gen-auto-263",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te renuevan por un año. ¿Firmas?",
    opciones: [
    {
      texto: "Firmar ya",
      efectos: {"moral":5,"reputacion":3},
    },
    {
      texto: "Pedir dos años",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Esperar otra oferta",
      efectos: {"moral":-2,"reputacion":2},
    },
    ],
  },
  {
    id: "vet-gen-auto-264",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Hay dudas por una molestia crónica. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Tratarte con calma",
      efectos: {"riesgoLesion":-0.1,"moral":-1},
    },
    {
      texto: "Jugar con manejo de dolor",
      efectos: {"moral":3,"riesgoLesion":0.12},
    },
    {
      texto: "Bajar minutos a propósito",
      efectos: {"riesgoLesion":-0.08,"reputacion":1},
    },
    ],
  },
  {
    id: "vet-gen-auto-265",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Futuro",
    texto: "Te ofrecen ser asistente técnico. ¿Lo piensas?",
    opciones: [
    {
      texto: "Aceptar el camino de DT",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Seguir jugando un tiempo",
      efectos: {"moral":3,"reputacion":1},
    },
    {
      texto: "Rechazar por ahora",
      efectos: {"moral":1,"reputacion":-1},
    },
    ],
  },
  {
    id: "vet-gen-auto-266",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Te bajan a suplente fijo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar y aportar desde el banco",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Pedir minutos al DT",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "vet-gen-auto-267",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Cuerpo",
    texto: "El cuerpo pide más descanso. ¿Cómo lo atiendes?",
    opciones: [
    {
      texto: "Bajar carga",
      efectos: {"riesgoLesion":-0.12,"atributos":{"fisico":1}},
    },
    {
      texto: "Mantener rutina",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Cambiar recuperación y sueño",
      efectos: {"atributos":{"fisico":2},"moral":3},
    },
    ],
  },
  {
    id: "vet-gen-auto-268",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Un joven te gana el puesto. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Mentorearlo",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Pelear el puesto",
      efectos: {"atributos":{"fisico":1},"moral":3},
    },
    {
      texto: "Pedir salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "vet-gen-auto-269",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Oferta",
    texto: "Llega oferta de un club menor. ¿La tomas?",
    opciones: [
    {
      texto: "Aceptar por minutos",
      efectos: {"moral":4,"reputacion":1},
    },
    {
      texto: "Rechazar y pelear acá",
      efectos: {"moral":2,"reputacion":2},
    },
    {
      texto: "Usarla para negociar",
      efectos: {"reputacion":3,"moral":1},
    },
    ],
  },
  {
    id: "vet-gen-auto-270",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El DT te pide rol de mentor. ¿Aceptas?",
    opciones: [
    {
      texto: "Aceptar y formar jóvenes",
      efectos: {"reputacion":6,"moral":3},
    },
    {
      texto: "Aceptar a medias",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Preferir solo jugar",
      efectos: {"moral":2,"reputacion":-2},
    },
    ],
  },
  {
    id: "vet-gen-auto-271",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te renuevan por un año. ¿Firmas?",
    opciones: [
    {
      texto: "Firmar ya",
      efectos: {"moral":5,"reputacion":3},
    },
    {
      texto: "Pedir dos años",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Esperar otra oferta",
      efectos: {"moral":-2,"reputacion":2},
    },
    ],
  },
  {
    id: "vet-gen-auto-272",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Lesión",
    texto: "Hay dudas por una molestia crónica. ¿Qué priorizas?",
    opciones: [
    {
      texto: "Tratarte con calma",
      efectos: {"riesgoLesion":-0.1,"moral":-1},
    },
    {
      texto: "Jugar con manejo de dolor",
      efectos: {"moral":3,"riesgoLesion":0.12},
    },
    {
      texto: "Bajar minutos a propósito",
      efectos: {"riesgoLesion":-0.08,"reputacion":1},
    },
    ],
  },
  {
    id: "vet-gen-auto-273",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Futuro",
    texto: "Te ofrecen ser asistente técnico. ¿Lo piensas?",
    opciones: [
    {
      texto: "Aceptar el camino de DT",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Seguir jugando un tiempo",
      efectos: {"moral":3,"reputacion":1},
    },
    {
      texto: "Rechazar por ahora",
      efectos: {"moral":1,"reputacion":-1},
    },
    ],
  },
  {
    id: "vet-gen-auto-274",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Titularidad",
    texto: "Te bajan a suplente fijo. ¿Qué haces?",
    opciones: [
    {
      texto: "Aceptar y aportar desde el banco",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Pedir minutos al DT",
      efectos: {"moral":3,"reputacion":-1},
    },
    {
      texto: "Pedir la salida",
      efectos: {"moral":-3,"reputacion":-2},
    },
    ],
  },
  {
    id: "vet-gen-auto-275",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Cuerpo",
    texto: "El cuerpo pide más descanso. ¿Cómo lo atiendes?",
    opciones: [
    {
      texto: "Bajar carga",
      efectos: {"riesgoLesion":-0.12,"atributos":{"fisico":1}},
    },
    {
      texto: "Mantener rutina",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Cambiar recuperación y sueño",
      efectos: {"atributos":{"fisico":2},"moral":3},
    },
    ],
  },
  {
    id: "vet-gen-auto-276",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Competencia",
    texto: "Un joven te gana el puesto. ¿Cómo reaccionas?",
    opciones: [
    {
      texto: "Mentorearlo",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Pelear el puesto",
      efectos: {"atributos":{"fisico":1},"moral":3},
    },
    {
      texto: "Pedir salida",
      efectos: {"moral":-3,"reputacion":-1},
    },
    ],
  },
  {
    id: "vet-gen-auto-277",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Oferta",
    texto: "Llega oferta de un club menor. ¿La tomas?",
    opciones: [
    {
      texto: "Aceptar por minutos",
      efectos: {"moral":4,"reputacion":1},
    },
    {
      texto: "Rechazar y pelear acá",
      efectos: {"moral":2,"reputacion":2},
    },
    {
      texto: "Usarla para negociar",
      efectos: {"reputacion":3,"moral":1},
    },
    ],
  },
  {
    id: "vet-gen-auto-278",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Liderazgo",
    texto: "El DT te pide rol de mentor. ¿Aceptas?",
    opciones: [
    {
      texto: "Aceptar y formar jóvenes",
      efectos: {"reputacion":6,"moral":3},
    },
    {
      texto: "Aceptar a medias",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Preferir solo jugar",
      efectos: {"moral":2,"reputacion":-2},
    },
    ],
  },
  {
    id: "vet-gen-auto-279",
    tramoCarrera: "veteran",
    categoria: "generico",
    etiqueta: "Contrato",
    texto: "Te renuevan por un año. ¿Firmas?",
    opciones: [
    {
      texto: "Firmar ya",
      efectos: {"moral":5,"reputacion":3},
    },
    {
      texto: "Pedir dos años",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Esperar otra oferta",
      efectos: {"moral":-2,"reputacion":2},
    },
    ],
  },
];

export function getEventosByTramo(tramo: EventoDecision["tramoCarrera"]): EventoDecision[] {
  return EVENTOS_CARRERA.filter((e) => e.tramoCarrera === tramo);
}
