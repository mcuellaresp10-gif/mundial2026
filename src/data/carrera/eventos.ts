import type { EventoDecision } from "./types";

/**
 * Banco de eventos del simulador de carrera (~300).
 * Distribución: cantera 60, consolidación 100, prime 100, veteranía 40.
 * Categorías: genérico 180, colombia_especifico 120.
 * Generado/actualizado por scripts/generate-carrera-eventos.mjs
 */
export const EVENTOS_CARRERA: EventoDecision[] = [
  {
    id: "can-estudio-vs-futbol",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Tu familia insiste en que no dejes el colegio. El técnico de la cantera quiere más dobles turnos.",
    opciones: [
    {
      texto: "Priorizar el fútbol y bajar horas de estudio",
      efectos: {"atributos":{"ritmo":2,"fisico":2},"moral":5,"reputacion":-3},
    },
    {
      texto: "Equilibrar ambos y dormir menos",
      efectos: {"atributos":{"fisico":-1,"pase":1},"moral":-5,"riesgoLesion":0.08},
    },
    {
      texto: "Cumplir con el colegio y entrenar con cabeza",
      efectos: {"atributos":{"pase":1},"moral":3,"reputacion":4},
    },
    ],
  },
  {
    id: "can-primer-contrato",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Te ofrecen el primer contrato profesional. El representante urge firmar ya.",
    opciones: [
    {
      texto: "Firmar rápido por poco dinero",
      efectos: {"reputacion":5,"moral":8,"atributos":{"fisico":1}},
    },
    {
      texto: "Pedir asesoría legal antes de firmar",
      efectos: {"reputacion":8,"moral":2},
    },
    {
      texto: "Rechazar y esperar una oferta mejor",
      efectos: {"reputacion":-5,"moral":-8},
    },
    ],
  },
  {
    id: "can-presion-familiar",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "En casa hacen cuentas con tu futuro. Sientes la presión de ser 'el que saque adelante'.",
    opciones: [
    {
      texto: "Asumir la presión y entrenar más",
      efectos: {"atributos":{"fisico":2},"moral":-8,"riesgoLesion":0.08},
    },
    {
      texto: "Hablar claro sin promesas vacías",
      efectos: {"moral":6,"reputacion":3},
    },
    {
      texto: "Evadir el tema y refugiarte en el fútbol",
      efectos: {"atributos":{"regate":1},"moral":-3},
    },
    ],
  },
  {
    id: "can-lesion-leve",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Sientes un pinchazo en el isquio en un partido de reserva.",
    opciones: [
    {
      texto: "Forzar el regreso",
      efectos: {"moral":3,"riesgoLesion":0.28,"riesgoFinCarrera":0.04,"atributos":{"fisico":-2}},
    },
    {
      texto: "Respetar los tiempos médicos",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":4},
    },
    {
      texto: "Usar el tiempo para video y técnica",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":4},
    },
    ],
  },
  {
    id: "can-rival-cantera",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Un compañero de tu misma posición te gana el puesto en el próximo amistoso.",
    opciones: [
    {
      texto: "Trabajar el doble en silencio",
      efectos: {"atributos":{"ritmo":2,"fisico":1},"moral":3},
    },
    {
      texto: "Confrontar al técnico",
      efectos: {"reputacion":-6,"moral":-5},
    },
    {
      texto: "Apoyar al compañero y pedir feedback",
      efectos: {"reputacion":5,"moral":6,"atributos":{"pase":1}},
    },
    ],
  },
  {
    id: "can-redes-sociales",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Empiezan a seguirte hinchas en redes. Un video tuyo se viraliza.",
    opciones: [
    {
      texto: "Cuidar la imagen y postear poco",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Subir contenido todos los días",
      efectos: {"reputacion":8,"moral":4,"atributos":{"pase":-1}},
    },
    {
      texto: "Ignorar redes por completo",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "can-agente-oportuno",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Un agente desconocido te aborda afuera de la sede: 'Te saco a Europa'.",
    opciones: [
    {
      texto: "Avisar al club y rechazar el acercamiento",
      efectos: {"reputacion":10,"moral":1},
    },
    {
      texto: "Pedir que te lleve a una prueba seria en el exterior",
      efectos: {"reputacion":4,"moral":8,"transferencia":"intermedia"},
    },
    {
      texto: "Dar tus datos sin consultar",
      efectos: {"reputacion":-12,"moral":5,"riesgoFinCarrera":0.02},
    },
    ],
  },
  {
    id: "can-doble-turno",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "El preparador físico propone dobles turnos toda la semana.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "can-beca-estudios",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Te ofrecen una beca escolar condicionada a bajar minutos en el fin de semana.",
    opciones: [
    {
      texto: "Aceptar la beca y equilibrar",
      efectos: {"reputacion":4,"moral":3,"atributos":{"pase":1}},
    },
    {
      texto: "Rechazar: el fútbol es primero",
      efectos: {"atributos":{"ritmo":2},"moral":4,"reputacion":-2},
    },
    {
      texto: "Negociar un plan mixto con el club",
      efectos: {"reputacion":6,"moral":5},
    },
    ],
  },
  {
    id: "can-peso-comedor",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "En el comedor de la sede te marcan que estás bajo de peso muscular.",
    opciones: [
    {
      texto: "Seguir un plan nutricional estricto",
      efectos: {"atributos":{"fisico":3},"moral":-2},
    },
    {
      texto: "Comer más sin control",
      efectos: {"atributos":{"fisico":1,"ritmo":-1},"moral":2},
    },
    {
      texto: "Pedir seguimiento del nutricionista",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":3,"reputacion":2},
    },
    ],
  },
  {
    id: "can-capitan-juvenil",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Te proponen ser capitán del equipo Sub-17.",
    opciones: [
    {
      texto: "Asumir el liderazgo",
      efectos: {"reputacion":10,"moral":6},
    },
    {
      texto: "Apoyar sin ser el centro",
      efectos: {"reputacion":5,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Priorizar tu rendimiento individual",
      efectos: {"atributos":{"tiro":1,"regate":1},"reputacion":-3,"moral":2},
    },
    ],
  },
  {
    id: "can-novia-familia",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Tu pareja y tu familia pelean por tu tiempo libre los domingos.",
    opciones: [
    {
      texto: "Asumir la presión y entrenar más",
      efectos: {"atributos":{"fisico":2},"moral":-8,"riesgoLesion":0.08},
    },
    {
      texto: "Hablar claro sin promesas vacías",
      efectos: {"moral":6,"reputacion":3},
    },
    {
      texto: "Evadir el tema y refugiarte en el fútbol",
      efectos: {"atributos":{"regate":1},"moral":-3},
    },
    ],
  },
  {
    id: "can-viaje-largo-bus",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Viaje de 12 horas en bus a un torneo. Llegás destrozado.",
    opciones: [
    {
      texto: "Pedir titularidad igual",
      efectos: {"reputacion":3,"moral":2,"riesgoLesion":0.1,"atributos":{"fisico":-1}},
    },
    {
      texto: "Entrar desde el banco",
      efectos: {"moral":4,"atributos":{"fisico":1}},
    },
    {
      texto: "Ayudar a los más chicos a adaptarse",
      efectos: {"reputacion":6,"moral":5},
    },
    ],
  },
  {
    id: "can-prueba-otro-club",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Otro club BetPlay te invita a una prueba 'sin que se entere tu sede'.",
    opciones: [
    {
      texto: "Avisar a tu club y rechazar",
      efectos: {"reputacion":10,"moral":1},
    },
    {
      texto: "Ir a mirar sin comprometerte",
      efectos: {"reputacion":-4,"moral":2},
    },
    {
      texto: "Ir a fondo por el cambio",
      efectos: {"reputacion":-10,"moral":6,"transferencia":"colombia_primera"},
    },
    ],
  },
  {
    id: "can-tecnico-grita",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "El técnico te retira al descanso gritando. El camerino se queda callado.",
    opciones: [
    {
      texto: "Pedir disculpas al día siguiente",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Responderle de frente",
      efectos: {"reputacion":-12,"moral":-6},
    },
    {
      texto: "Hablar en privado y pedir explicaciones",
      efectos: {"reputacion":4,"moral":4,"atributos":{"pase":1}},
    },
    ],
  },
  {
    id: "can-zapatos-rotos",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Se te rompen los botines antes de un partido importante. No hay recambio de tu talle.",
    opciones: [
    {
      texto: "Pedir prestados aunque duelan",
      efectos: {"moral":3,"riesgoLesion":0.1,"reputacion":2},
    },
    {
      texto: "Insistir en no jugar así",
      efectos: {"reputacion":-2,"moral":-3},
    },
    {
      texto: "Improvisar con cinta y aguantar",
      efectos: {"atributos":{"fisico":1},"moral":5,"riesgoLesion":0.08},
    },
    ],
  },
  {
    id: "can-amigo-abandona",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Tu mejor amigo de la cantera cuelga los botines. Te pide consejo.",
    opciones: [
    {
      texto: "Apoyarlo y seguir tu camino",
      efectos: {"moral":4,"reputacion":3},
    },
    {
      texto: "Dudar y plantearte lo mismo",
      efectos: {"moral":-10,"atributos":{"ritmo":-1}},
    },
    {
      texto: "Convencerlo de seguir un mes más",
      efectos: {"moral":2,"reputacion":2},
    },
    ],
  },
  {
    id: "can-horario-madrugada",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Te cambian el turno de entrenamiento a las 5:30 a.m.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "can-videoanalisis",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "El analista te marca errores de posicionamiento en video.",
    opciones: [
    {
      texto: "Estudiar cada clip",
      efectos: {"atributos":{"defensa":2,"pase":1},"moral":3},
    },
    {
      texto: "Restarle importancia",
      efectos: {"reputacion":-4,"moral":1},
    },
    {
      texto: "Pedir sesiones extra uno a uno",
      efectos: {"atributos":{"defensa":2,"fisico":1},"reputacion":4,"moral":4},
    },
    ],
  },
  {
    id: "can-padre-tecnico",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Tu papá discute con el técnico en la puerta de la sede.",
    opciones: [
    {
      texto: "Separarlos y pedir que no vuelva a pasar",
      efectos: {"reputacion":6,"moral":-2},
    },
    {
      texto: "Quedarte callado",
      efectos: {"reputacion":-3,"moral":-4},
    },
    {
      texto: "Hablar después solo con tu papá",
      efectos: {"moral":5,"reputacion":2},
    },
    ],
  },
  {
    id: "can-prueba-fisica",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Batería de tests físicos: fallás por poco el mínimo de resistencia.",
    opciones: [
    {
      texto: "Repetir el test a muerte",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"riesgoLesion":0.1,"moral":2},
    },
    {
      texto: "Pedir un plan de 4 semanas",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":3},
    },
    {
      texto: "Echarle la culpa al calor",
      efectos: {"reputacion":-5,"moral":-2},
    },
    ],
  },
  {
    id: "can-internado",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Te ofrecen vivir en el internado de la cantera lejos de casa.",
    opciones: [
    {
      texto: "Aceptar para enfocarte",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-4,"reputacion":4},
    },
    {
      texto: "Quedarte en casa y viajar",
      efectos: {"moral":5,"atributos":{"fisico":-1}},
    },
    {
      texto: "Probar tres meses y evaluar",
      efectos: {"reputacion":3,"moral":3},
    },
    ],
  },
  {
    id: "can-apuesta-companeros",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Compañeros apuestan plata en un amistoso interno. Te invitan.",
    opciones: [
    {
      texto: "Negarte y reportarlo",
      efectos: {"reputacion":8,"moral":-2},
    },
    {
      texto: "Negarte en silencio",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Entrar 'por no quedar mal'",
      efectos: {"reputacion":-15,"moral":2,"riesgoFinCarrera":0.05},
    },
    ],
  },
  {
    id: "can-dieta-abuela",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Tu abuela te manda fiambre y gaseosa 'para que crezcas'.",
    opciones: [
    {
      texto: "Agradecer y seguir el plan del club",
      efectos: {"atributos":{"fisico":1},"moral":3,"reputacion":2},
    },
    {
      texto: "Comer todo por no ofenderla",
      efectos: {"atributos":{"ritmo":-1},"moral":5},
    },
    {
      texto: "Explicarle el plan nutricional",
      efectos: {"moral":4,"reputacion":3},
    },
    ],
  },
  {
    id: "can-lesion-companero",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Un compañero se lesiona feo y te piden marcar al rival más duro.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "can-examen-final",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Tenés final de colegio el mismo día de la semifinal juvenil.",
    opciones: [
    {
      texto: "Rendir el final y llegar tarde al partido",
      efectos: {"reputacion":2,"moral":2,"atributos":{"pase":1}},
    },
    {
      texto: "Pedir aplazar el examen",
      efectos: {"atributos":{"ritmo":1},"moral":3,"reputacion":-1},
    },
    {
      texto: "Priorizar el partido y ver el examen después",
      efectos: {"atributos":{"tiro":1},"reputacion":-3,"moral":4},
    },
    ],
  },
  {
    id: "can-sueño-europa",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Ves un documental de un crack colombiano en Europa y no dormís.",
    opciones: [
    {
      texto: "Usar la motiva en el entrenamiento",
      efectos: {"atributos":{"ritmo":2,"fisico":1},"moral":6},
    },
    {
      texto: "Obsesionarte y ansietarte",
      efectos: {"moral":-6,"atributos":{"pase":-1}},
    },
    {
      texto: "Anotar metas realistas a 2 años",
      efectos: {"reputacion":3,"moral":5,"atributos":{"pase":1}},
    },
    ],
  },
  {
    id: "can-corte-plantel",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Anuncian corte de plantel: 5 se quedan afuera.",
    opciones: [
    {
      texto: "Enfocarte solo en tu rendimiento",
      efectos: {"atributos":{"fisico":2},"moral":2},
    },
    {
      texto: "Ayudar a un amigo en duda",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Pedir reunión para saber tu status",
      efectos: {"reputacion":2,"moral":-2},
    },
    ],
  },
  {
    id: "can-entrenador-nuevo",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Llega un técnico nuevo que no te conoce de nada.",
    opciones: [
    {
      texto: "Demostrar en cada pelota",
      efectos: {"atributos":{"ritmo":1,"fisico":1},"moral":4,"reputacion":3},
    },
    {
      texto: "Esperar tu oportunidad en silencio",
      efectos: {"moral":1,"atributos":{"pase":1}},
    },
    {
      texto: "Quejarte con los veteranos",
      efectos: {"reputacion":-7,"moral":-3},
    },
    ],
  },
  {
    id: "can-gol-vacio",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "En un amistoso fallás solo frente al arco vacío. Se ríen.",
    opciones: [
    {
      texto: "Pedir el siguiente mano a mano",
      efectos: {"atributos":{"tiro":2},"moral":5,"reputacion":2},
    },
    {
      texto: "Bajar la cabeza el resto del partido",
      efectos: {"moral":-10,"atributos":{"tiro":-1}},
    },
    {
      texto: "Reírte y seguir",
      efectos: {"moral":4,"reputacion":3},
    },
    ],
  },
  {
    id: "can-clasico-juvenil",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Juveniles: te toca el clásico regional. La hinchada local ya canta desde el entrenamiento.",
    opciones: [
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"reputacion":6,"riesgoLesion":0.12},
    },
    {
      texto: "Jugar con inteligencia",
      efectos: {"atributos":{"pase":2},"reputacion":4,"moral":4},
    },
    {
      texto: "Buscar la jugada individual",
      efectos: {"atributos":{"regate":2,"tiro":1},"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "can-prensa-local",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Un periodista deportivo local te pide una nota: '¿El próximo ídolo del club?'",
    opciones: [
    {
      texto: "Hablar con humildad y agradecer al club",
      efectos: {"reputacion":8,"moral":3},
    },
    {
      texto: "Prometer títulos y goles",
      efectos: {"reputacion":2,"moral":5},
    },
    {
      texto: "Negarte a declarar",
      efectos: {"reputacion":-4,"moral":-2},
    },
    ],
  },
  {
    id: "can-viaje-interior",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Viaje largo por la cordillera para un cuadrangular juvenil.",
    opciones: [
    {
      texto: "Pedir ser titular igual",
      efectos: {"reputacion":3,"moral":2,"riesgoLesion":0.1,"atributos":{"fisico":-1}},
    },
    {
      texto: "Descansar y entrar desde el banco",
      efectos: {"moral":4,"atributos":{"fisico":1}},
    },
    {
      texto: "Ayudar a los más chicos",
      efectos: {"reputacion":6,"moral":5},
    },
    ],
  },
  {
    id: "can-hinchada-entrenamiento",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "La barra aparece en un entrenamiento abierto y te pide foto y un gol.",
    opciones: [
    {
      texto: "Saludar con respeto y seguir entrenando",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Prometerles un gol el domingo",
      efectos: {"reputacion":3,"moral":6},
    },
    {
      texto: "Evitarlos por completo",
      efectos: {"reputacion":-5,"moral":-2},
    },
    ],
  },
  {
    id: "can-himno-previa",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Antes del clásico juvenil te piden cantar el himno del club en el camerino.",
    opciones: [
    {
      texto: "Cantar a pleno",
      efectos: {"reputacion":5,"moral":6},
    },
    {
      texto: "Acompañar sin forzar",
      efectos: {"reputacion":3,"moral":3},
    },
    {
      texto: "Quedarte callado",
      efectos: {"reputacion":-4,"moral":-2},
    },
    ],
  },
  {
    id: "can-derbi-barrial",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "En tu barrio el derbi se vive en la esquina. Te paran a preguntar el once.",
    opciones: [
    {
      texto: "No filtrar nada del plantel",
      efectos: {"reputacion":7,"moral":2},
    },
    {
      texto: "Tirar un 'soplo' inocente",
      efectos: {"reputacion":-6,"moral":3},
    },
    {
      texto: "Pedir que no te involucren",
      efectos: {"moral":2,"reputacion":2},
    },
    ],
  },
  {
    id: "can-emisoras-am",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Una emisora AM dice que 'sos promesa o humo'. Tus tíos lo escuchan.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "can-torneo-vereda",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Te invitan a un torneo de vereda con plata en juego el mismo fin de semana del oficial.",
    opciones: [
    {
      texto: "Rechazar y cuidar el cuerpo",
      efectos: {"reputacion":5,"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Jugar escondido",
      efectos: {"reputacion":-12,"moral":4,"riesgoLesion":0.15,"riesgoFinCarrera":0.03},
    },
    {
      texto: "Avisar al club y pedir permiso",
      efectos: {"reputacion":3,"moral":2},
    },
    ],
  },
  {
    id: "can-seleccion-dpto",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Te citan a la selección departamental. El club duda en liberarte.",
    opciones: [
    {
      texto: "Insistir en ir",
      efectos: {"reputacion":8,"moral":8,"atributos":{"ritmo":1}},
    },
    {
      texto: "Quedarte con el club",
      efectos: {"reputacion":4,"moral":-3},
    },
    {
      texto: "Negociar fechas",
      efectos: {"reputacion":5,"moral":3},
    },
    ],
  },
  {
    id: "can-cafe-cancha",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "En un pueblo te invitan café y sancocho post partido con toda la junta.",
    opciones: [
    {
      texto: "Quedarte un rato y agradecer",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Irte rápido a recuperar",
      efectos: {"atributos":{"fisico":1},"moral":1},
    },
    {
      texto: "Quedarte hasta tarde",
      efectos: {"moral":6,"riesgoLesion":0.06,"atributos":{"fisico":-1}},
    },
    ],
  },
  {
    id: "can-lluvia-sintetica",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Lluvia tropical: la sintética está un lago. El árbitro pregunta si juegan.",
    opciones: [
    {
      texto: "Jugar igual",
      efectos: {"atributos":{"fisico":1},"moral":4,"riesgoLesion":0.14},
    },
    {
      texto: "Pedir suspensión",
      efectos: {"reputacion":-2,"moral":2},
    },
    {
      texto: "Adaptar el estilo y cuidar entradas",
      efectos: {"atributos":{"pase":1,"defensa":1},"moral":3},
    },
    ],
  },
  {
    id: "can-camiseta-10",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Te prestan la 10 del primer equipo para una foto solidaria.",
    opciones: [
    {
      texto: "Posar con humildad",
      efectos: {"reputacion":5,"moral":6},
    },
    {
      texto: "Publicar como si ya fueras titular",
      efectos: {"reputacion":-4,"moral":4},
    },
    {
      texto: "Ceder el protagonismo a un nene de la fundación",
      efectos: {"reputacion":8,"moral":5},
    },
    ],
  },
  {
    id: "can-copa-pony",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Rumores de convocatoria a un torneo nacional juvenil tipo Pony/interligas.",
    opciones: [
    {
      texto: "Enfocarte para entrar en la lista",
      efectos: {"atributos":{"ritmo":2,"tiro":1},"moral":5},
    },
    {
      texto: "No ilusionarte",
      efectos: {"moral":1},
    },
    {
      texto: "Pedir feedback al técnico de si entrás",
      efectos: {"reputacion":2,"moral":2},
    },
    ],
  },
  {
    id: "can-escalera-estadio",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Te mandan a cargar escaleras y cones en el estadio grande.",
    opciones: [
    {
      texto: "Hacerlo sin queja",
      efectos: {"reputacion":6,"moral":2,"atributos":{"fisico":1}},
    },
    {
      texto: "Quejarte: 'yo vine a jugar'",
      efectos: {"reputacion":-8,"moral":-3},
    },
    {
      texto: "Organizar a los pibes para terminar rápido",
      efectos: {"reputacion":7,"moral":4},
    },
    ],
  },
  {
    id: "can-gol-olimpico-sueno",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "En la previa del clásico alguien bromea: 'hacé un olímpico'.",
    opciones: [
    {
      texto: "Tomarlo como chiste y enfocarte",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "Probar tiros de esquina en el entrenamiento",
      efectos: {"atributos":{"tiro":2,"pase":1},"moral":4},
    },
    {
      texto: "Prometerlo en redes",
      efectos: {"reputacion":-3,"moral":5},
    },
    ],
  },
  {
    id: "can-familia-roja-azul",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Tu familia está dividida entre dos grandes del país. Te piden foto con ambas camisetas.",
    opciones: [
    {
      texto: "No posar con ninguna rival",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Hacer la gracia en privado",
      efectos: {"moral":4,"reputacion":-2},
    },
    {
      texto: "Pedir que no te metan en esa pelea",
      efectos: {"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "can-vallenato-vestuario",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "En el micro ponen vallenato a todo volumen antes del partido.",
    opciones: [
    {
      texto: "Sumarte al mood",
      efectos: {"moral":5,"reputacion":2},
    },
    {
      texto: "Pedí auriculares y concentrarte",
      efectos: {"atributos":{"pase":1},"moral":2},
    },
    {
      texto: "Pedir bajar el volumen",
      efectos: {"reputacion":-3,"moral":1},
    },
    ],
  },
  {
    id: "can-altitud-bogota",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Viaje a Bogotá: la altura te pega en el primer tiempo.",
    opciones: [
    {
      texto: "Pedir el cambio temprano",
      efectos: {"moral":-2,"atributos":{"fisico":1}},
    },
    {
      texto: "Aguantar a muerte",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":0.1,"moral":4},
    },
    {
      texto: "Gestionar esfuerzos y respiración",
      efectos: {"atributos":{"fisico":1,"pase":1},"moral":3},
    },
    ],
  },
  {
    id: "can-calor-costa",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Partido en la costa a 34°C y humedad absurda.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "can-entrevista-colegio",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "El colegio quiere entrevistarte como 'ejemplo'. El club pide mensaje pro-estudios.",
    opciones: [
    {
      texto: "Hablar de esfuerzo y estudio",
      efectos: {"reputacion":7,"moral":3},
    },
    {
      texto: "Hablar solo de fútbol",
      efectos: {"reputacion":2,"moral":4},
    },
    {
      texto: "Cancelar por concentración",
      efectos: {"reputacion":-2,"moral":1},
    },
    ],
  },
  {
    id: "can-extra-001",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Esta semana cambia el panorama: te ofrecen el primer contrato profesional. El representante urge firmar ya.",
    opciones: [
    {
      texto: "Firmar rápido por poco dinero",
      efectos: {"reputacion":5,"moral":8,"atributos":{"fisico":1}},
    },
    {
      texto: "Pedir asesoría legal antes de firmar",
      efectos: {"reputacion":8,"moral":2},
    },
    {
      texto: "Rechazar y esperar una oferta mejor",
      efectos: {"reputacion":-5,"moral":-8},
    },
    ],
  },
  {
    id: "can-extra-002",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Sin esperarlo, viaje largo por la cordillera para un cuadrangular juvenil.",
    opciones: [
    {
      texto: "Pedir ser titular igual",
      efectos: {"reputacion":3,"moral":2,"riesgoLesion":0.1,"atributos":{"fisico":-1}},
    },
    {
      texto: "Descansar y entrar desde el banco",
      efectos: {"moral":4,"atributos":{"fisico":1}},
    },
    {
      texto: "Ayudar a los más chicos",
      efectos: {"reputacion":6,"moral":5},
    },
    ],
  },
  {
    id: "can-extra-003",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "En la interna del club, sientes un pinchazo en el isquio en un partido de reserva.",
    opciones: [
    {
      texto: "Forzar el regreso",
      efectos: {"moral":3,"riesgoLesion":0.28,"riesgoFinCarrera":0.04,"atributos":{"fisico":-2}},
    },
    {
      texto: "Respetar los tiempos médicos",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":4},
    },
    {
      texto: "Usar el tiempo para video y técnica",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":4},
    },
    ],
  },
  {
    id: "can-extra-004",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "De un día para otro, antes del clásico juvenil te piden cantar el himno del club en el camerino.",
    opciones: [
    {
      texto: "Cantar a pleno",
      efectos: {"reputacion":5,"moral":6},
    },
    {
      texto: "Acompañar sin forzar",
      efectos: {"reputacion":3,"moral":3},
    },
    {
      texto: "Quedarte callado",
      efectos: {"reputacion":-4,"moral":-2},
    },
    ],
  },
  {
    id: "can-extra-005",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "En medio de la pretemporada, empiezan a seguirte hinchas en redes. Un video tuyo se viraliza.",
    opciones: [
    {
      texto: "Cuidar la imagen y postear poco",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Subir contenido todos los días",
      efectos: {"reputacion":8,"moral":4,"atributos":{"pase":-1}},
    },
    {
      texto: "Ignorar redes por completo",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "can-extra-006",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Con el calendario encima, un agente desconocido te aborda afuera de la sede: 'Te saco a Europa'.",
    opciones: [
    {
      texto: "Avisar al club y rechazar el acercamiento",
      efectos: {"reputacion":10,"moral":1},
    },
    {
      texto: "Pedir que te lleve a una prueba seria en el exterior",
      efectos: {"reputacion":4,"moral":8,"transferencia":"intermedia"},
    },
    {
      texto: "Dar tus datos sin consultar",
      efectos: {"reputacion":-12,"moral":5,"riesgoFinCarrera":0.02},
    },
    ],
  },
  {
    id: "can-extra-007",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Cuando más necesitabas foco, te invitan a un torneo de vereda con plata en juego el mismo fin de semana del oficial.",
    opciones: [
    {
      texto: "Rechazar y cuidar el cuerpo",
      efectos: {"reputacion":5,"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Jugar escondido",
      efectos: {"reputacion":-12,"moral":4,"riesgoLesion":0.15,"riesgoFinCarrera":0.03},
    },
    {
      texto: "Avisar al club y pedir permiso",
      efectos: {"reputacion":3,"moral":2},
    },
    ],
  },
  {
    id: "can-extra-008",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Te ofrecen una beca escolar condicionada a bajar minutos en el fin de semana.",
    opciones: [
    {
      texto: "Aceptar la beca y equilibrar",
      efectos: {"reputacion":4,"moral":3,"atributos":{"pase":1}},
    },
    {
      texto: "Rechazar: el fútbol es primero",
      efectos: {"atributos":{"ritmo":2},"moral":4,"reputacion":-2},
    },
    {
      texto: "Negociar un plan mixto con el club",
      efectos: {"reputacion":6,"moral":5},
    },
    ],
  },
  {
    id: "can-extra-009",
    tramoCarrera: "cantera",
    categoria: "colombia_especifico",
    texto: "Esta semana cambia el panorama: en un pueblo te invitan café y sancocho post partido con toda la junta.",
    opciones: [
    {
      texto: "Quedarte un rato y agradecer",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Irte rápido a recuperar",
      efectos: {"atributos":{"fisico":1},"moral":1},
    },
    {
      texto: "Quedarte hasta tarde",
      efectos: {"moral":6,"riesgoLesion":0.06,"atributos":{"fisico":-1}},
    },
    ],
  },
  {
    id: "can-extra-010",
    tramoCarrera: "cantera",
    categoria: "generico",
    texto: "Sin esperarlo, te proponen ser capitán del equipo Sub-17.",
    opciones: [
    {
      texto: "Asumir el liderazgo",
      efectos: {"reputacion":10,"moral":6},
    },
    {
      texto: "Apoyar sin ser el centro",
      efectos: {"reputacion":5,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Priorizar tu rendimiento individual",
      efectos: {"atributos":{"tiro":1,"regate":1},"reputacion":-3,"moral":2},
    },
    ],
  },
  {
    id: "con-titularidad",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El técnico te pone de titular por primera vez en Primera.",
    opciones: [
    {
      texto: "Jugar seguro, sin errores",
      efectos: {"atributos":{"defensa":2,"pase":1},"reputacion":5},
    },
    {
      texto: "Arriesgar para marcar diferencia",
      efectos: {"atributos":{"tiro":2,"regate":2},"reputacion":8,"moral":5},
    },
    {
      texto: "Priorizar no pelearte con los veteranos",
      efectos: {"reputacion":3,"moral":4},
    },
    ],
  },
  {
    id: "con-oferta-exterior",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Rumor de interés desde el exterior. El club quiere renovarte ya.",
    opciones: [
    {
      texto: "Aceptar irte al exterior",
      efectos: {"reputacion":8,"moral":10,"transferencia":"ascenso"},
    },
    {
      texto: "Renovar y quedarte un año más",
      efectos: {"reputacion":6,"moral":4,"atributos":{"fisico":1}},
    },
    {
      texto: "Usar el rumor solo para mejorar contrato",
      efectos: {"reputacion":-2,"moral":5},
    },
    ],
  },
  {
    id: "con-lesion-muscular",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te diagnostican una lesión muscular de tres semanas.",
    opciones: [
    {
      texto: "Forzar el regreso",
      efectos: {"moral":3,"riesgoLesion":0.28,"riesgoFinCarrera":0.04,"atributos":{"fisico":-2}},
    },
    {
      texto: "Respetar los tiempos médicos",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":4},
    },
    {
      texto: "Usar el tiempo para video y técnica",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":4},
    },
    ],
  },
  {
    id: "con-conflicto-tecnico",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El técnico te saca al descanso y discutís en el túnel.",
    opciones: [
    {
      texto: "Pedir disculpas al día siguiente",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Mantener la bronca en público",
      efectos: {"reputacion":-15,"moral":-8},
    },
    {
      texto: "Hablar en privado y pedir explicaciones",
      efectos: {"reputacion":3,"moral":4,"atributos":{"pase":1}},
    },
    ],
  },
  {
    id: "con-bono-partido",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El plantel discute bono colectivo vs individuales.",
    opciones: [
    {
      texto: "Apoyar el bono colectivo",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Pedir lo tuyo primero",
      efectos: {"reputacion":-8,"moral":2},
    },
    {
      texto: "Mediar entre las partes",
      efectos: {"reputacion":10,"moral":4},
    },
    ],
  },
  {
    id: "con-cambio-sistema",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Llega un técnico nuevo con un sistema que no te favorece.",
    opciones: [
    {
      texto: "Adaptarte aunque baje tu brillo",
      efectos: {"atributos":{"defensa":2,"pase":1},"moral":-3,"reputacion":5},
    },
    {
      texto: "Pedir salida en el mercado",
      efectos: {"reputacion":-5,"moral":-6},
    },
    {
      texto: "Demostrar versatilidad",
      efectos: {"atributos":{"ritmo":1,"regate":1,"defensa":1},"moral":5,"reputacion":6},
    },
    ],
  },
  {
    id: "con-noche-salida",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Después de un triunfo el grupo quiere salir. Mañana hay entrenamiento.",
    opciones: [
    {
      texto: "Ir un rato y volver temprano",
      efectos: {"moral":4,"riesgoLesion":0.05},
    },
    {
      texto: "Quedarte a dormir y recuperar",
      efectos: {"atributos":{"fisico":1},"moral":-2,"reputacion":3},
    },
    {
      texto: "Cerrar el boliche con el plantel",
      efectos: {"moral":8,"reputacion":-10,"riesgoLesion":0.12,"atributos":{"fisico":-2}},
    },
    ],
  },
  {
    id: "con-mentor-veterano",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Un veterano te ofrece mentoría extra después de los entrenamientos.",
    opciones: [
    {
      texto: "Aceptar y absorber todo",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":5,"moral":6},
    },
    {
      texto: "Aceptar a medias",
      efectos: {"atributos":{"pase":1},"moral":2},
    },
    {
      texto: "Creer que no lo necesitás",
      efectos: {"reputacion":-4,"moral":1},
    },
    ],
  },
  {
    id: "con-banco-inesperado",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Después de 5 titularidades te mandan al banco sin explicación.",
    opciones: [
    {
      texto: "Trabajar y esperar",
      efectos: {"atributos":{"fisico":1},"moral":-3,"reputacion":3},
    },
    {
      texto: "Pedir reunión inmediata",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Filtrar bronca a la prensa",
      efectos: {"reputacion":-14,"moral":-5},
    },
    ],
  },
  {
    id: "con-renovacion-baja",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te ofrecen renovación por debajo de lo que esperabas.",
    opciones: [
    {
      texto: "Negociar con cabeza fría",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "Presionar por más plata ya",
      efectos: {"reputacion":-6,"moral":2},
    },
    {
      texto: "Priorizar minutos y proyecto",
      efectos: {"reputacion":4,"moral":5,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "con-redes-hate",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Después de un error, el hate en redes se descontrola.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "con-representante-pelea",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Tu agente pelea con el club por una cláusula. Te piden que elijas bando.",
    opciones: [
    {
      texto: "Mediar en silencio",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Bando agente",
      efectos: {"reputacion":-5,"moral":3},
    },
    {
      texto: "Bando club",
      efectos: {"reputacion":4,"moral":-2},
    },
    ],
  },
  {
    id: "con-gimnasio-extra",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El PF te pide gym extra nocturno tres veces por semana.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "con-posicion-nueva",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te prueban en una posición distinta a la tuya.",
    opciones: [
    {
      texto: "Abrazar el cambio",
      efectos: {"atributos":{"defensa":1,"pase":1,"ritmo":1},"moral":3,"reputacion":5},
    },
    {
      texto: "Pedir volver a tu puesto natural",
      efectos: {"reputacion":-2,"moral":2},
    },
    {
      texto: "Hacerlo a regañadientes",
      efectos: {"moral":-5,"atributos":{"tiro":-1}},
    },
    ],
  },
  {
    id: "con-penalti-entrenamiento",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "En la práctica de penales fallás tres seguidos.",
    opciones: [
    {
      texto: "Seguir pateando hasta meter",
      efectos: {"atributos":{"tiro":2},"moral":3},
    },
    {
      texto: "Parar y analizar la técnica",
      efectos: {"atributos":{"tiro":2,"pase":1},"moral":2},
    },
    {
      texto: "Dejarlo para otro día",
      efectos: {"moral":-4,"atributos":{"tiro":-1}},
    },
    ],
  },
  {
    id: "con-contrato-publicidad-chico",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Una marca local te ofrece un contrato chico pero exigente en posts.",
    opciones: [
    {
      texto: "Firmar y cumplir",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Rechazar para no distraerte",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Firmar y postear a desgano",
      efectos: {"reputacion":-4,"moral":3},
    },
    ],
  },
  {
    id: "con-companero-celoso",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Un titular histórico te tira pases imposibles a propósito.",
    opciones: [
    {
      texto: "Hablarlo de frente",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Ganarte su respeto en el campo",
      efectos: {"atributos":{"fisico":1,"defensa":1},"moral":4},
    },
    {
      texto: "Responder igual",
      efectos: {"reputacion":-8,"moral":-2},
    },
    ],
  },
  {
    id: "con-viaje-concentrados",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Concentrados 48h antes: el hotel es un quilombo de ruido.",
    opciones: [
    {
      texto: "Pedir cambio de habitación",
      efectos: {"moral":3,"reputacion":1},
    },
    {
      texto: "Aguantar y dormir con tapones",
      efectos: {"atributos":{"fisico":1},"moral":1},
    },
    {
      texto: "Quejarte en el grupo de WhatsApp",
      efectos: {"reputacion":-5,"moral":2},
    },
    ],
  },
  {
    id: "con-analisis-rival",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te asignan exponer el análisis del rival en la charla técnica.",
    opciones: [
    {
      texto: "Prepararlo a fondo",
      efectos: {"atributos":{"pase":1,"defensa":2},"reputacion":6,"moral":4},
    },
    {
      texto: "Improvisar",
      efectos: {"reputacion":-3,"moral":1},
    },
    {
      texto: "Pedir que lo haga un veterano",
      efectos: {"reputacion":-2,"moral":-1},
    },
    ],
  },
  {
    id: "con-tarjeta-roja",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te echan por doble amarilla en un partido clave.",
    opciones: [
    {
      texto: "Asumir el error en conferencia",
      efectos: {"reputacion":5,"moral":-4},
    },
    {
      texto: "Echarle la culpa al árbitro",
      efectos: {"reputacion":-8,"moral":1},
    },
    {
      texto: "Trabajar la disciplina táctica",
      efectos: {"atributos":{"defensa":2},"moral":3,"reputacion":4},
    },
    ],
  },
  {
    id: "con-prestamo-posible",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El club evalúa cedarte a otro equipo para que sumes minutos.",
    opciones: [
    {
      texto: "Aceptar el préstamo",
      efectos: {"moral":4,"atributos":{"ritmo":1,"fisico":1},"reputacion":2},
    },
    {
      texto: "Pelear por quedarte",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Pedir salida definitiva",
      efectos: {"reputacion":-4,"moral":3},
    },
    ],
  },
  {
    id: "con-sueldo-atrasado",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Corren rumores de sueldos atrasados en el plantel.",
    opciones: [
    {
      texto: "Mantener la calma y entrenar",
      efectos: {"reputacion":5,"moral":-3},
    },
    {
      texto: "Sumarte al reclamo colectivo",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Filtrar a la prensa",
      efectos: {"reputacion":-12,"moral":1},
    },
    ],
  },
  {
    id: "con-dieta-estricta",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te bajan grasa corporal con dieta muy dura.",
    opciones: [
    {
      texto: "Cumplir al 100%",
      efectos: {"atributos":{"ritmo":2,"fisico":1},"moral":-4},
    },
    {
      texto: "Cumplir a medias",
      efectos: {"atributos":{"ritmo":1},"moral":1},
    },
    {
      texto: "Quejarte del hambre en público",
      efectos: {"reputacion":-5,"moral":2},
    },
    ],
  },
  {
    id: "con-hijos-plantel",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Varios del plantel tienen hijos; te invitan a un asado familiar.",
    opciones: [
    {
      texto: "Ir y fortalecer el grupo",
      efectos: {"reputacion":5,"moral":6},
    },
    {
      texto: "Ir un rato",
      efectos: {"moral":3,"reputacion":2},
    },
    {
      texto: "No ir: 'no es lo mío'",
      efectos: {"reputacion":-3,"moral":1},
    },
    ],
  },
  {
    id: "con-arquero-pelea",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Discusión fuerte con el arquero por una salida en falso (o al revés).",
    opciones: [
    {
      texto: "Resolverlo en el vestuario",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Dejar que escale",
      efectos: {"reputacion":-7,"moral":-4},
    },
    {
      texto: "Pedir mediación del capitán",
      efectos: {"reputacion":5,"moral":2},
    },
    ],
  },
  {
    id: "con-gps-carga",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El GPS marca sobrecarga. El médico sugiere rotar.",
    opciones: [
    {
      texto: "Aceptar rotar",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":3},
    },
    {
      texto: "Insistir en jugar",
      efectos: {"moral":3,"riesgoLesion":0.16,"reputacion":2},
    },
    {
      texto: "Pedir carga alternativa",
      efectos: {"atributos":{"fisico":1},"moral":2},
    },
    ],
  },
  {
    id: "con-entrevista-polemica",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "En una entrevista te preguntan por un compañero en mala racha.",
    opciones: [
    {
      texto: "Bancarlo en público",
      efectos: {"reputacion":8,"moral":4},
    },
    {
      texto: "Ser 'sincero' en exceso",
      efectos: {"reputacion":-10,"moral":1},
    },
    {
      texto: "Zafar con diplomacia",
      efectos: {"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "con-cambio-dorsal",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te cambian el dorsal por uno menos mediático.",
    opciones: [
    {
      texto: "Aceptar sin drama",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Pedir el número que querías",
      efectos: {"reputacion":-3,"moral":1},
    },
    {
      texto: "Usarlo como motiva",
      efectos: {"atributos":{"tiro":1},"moral":5},
    },
    ],
  },
  {
    id: "con-charla-motivacional",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Traen un speaker motivacional al predio. Algunos se burlan.",
    opciones: [
    {
      texto: "Tomarlo en serio",
      efectos: {"moral":6,"reputacion":3},
    },
    {
      texto: "Seguir la corriente del chiste",
      efectos: {"moral":2,"reputacion":-2},
    },
    {
      texto: "Usar una idea concreta en tu rutina",
      efectos: {"atributos":{"fisico":1},"moral":5,"reputacion":2},
    },
    ],
  },
  {
    id: "con-revision-contrato",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Descubrís una cláusula rara en tu contrato.",
    opciones: [
    {
      texto: "Consultar abogado YA",
      efectos: {"reputacion":5,"moral":1},
    },
    {
      texto: "Confiar en el agente",
      efectos: {"moral":2},
    },
    {
      texto: "Confrontar al club enojado",
      efectos: {"reputacion":-8,"moral":-4},
    },
    ],
  },
  {
    id: "con-suplente-ultimo-minuto",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Entras al 88' con el partido perdido. El técnico pide 'actitud'.",
    opciones: [
    {
      texto: "Correr cada balón",
      efectos: {"atributos":{"ritmo":1,"fisico":1},"reputacion":5,"moral":3},
    },
    {
      texto: "Hacer la mínima",
      efectos: {"reputacion":-4,"moral":-2},
    },
    {
      texto: "Buscar una acción de calidad",
      efectos: {"atributos":{"tiro":1,"regate":1},"moral":4},
    },
    ],
  },
  {
    id: "con-vacaciones-cortas",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El fixture deja solo 5 días de receso.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "con-prueba-antidoping",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Control antidoping sorpresa a las 7 a.m.",
    opciones: [
    {
      texto: "Cumplir sin drama",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Quejarte del horario",
      efectos: {"reputacion":-3,"moral":1},
    },
    {
      texto: "Acompañar a un compañero nervioso",
      efectos: {"reputacion":5,"moral":3},
    },
    ],
  },
  {
    id: "con-gol-en-contra",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Provocás un autogol absurdo.",
    opciones: [
    {
      texto: "Levantar la mano y seguir",
      efectos: {"moral":4,"reputacion":5},
    },
    {
      texto: "Desconectarte el resto del partido",
      efectos: {"moral":-12,"atributos":{"defensa":-1}},
    },
    {
      texto: "Pedir perdón a la hinchada al final",
      efectos: {"reputacion":7,"moral":2},
    },
    ],
  },
  {
    id: "con-nuevo-companero-estrella",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Llega una estrella con sueldo mucho mayor al tuyo.",
    opciones: [
    {
      texto: "Aprender de él",
      efectos: {"atributos":{"pase":1,"regate":1},"moral":3,"reputacion":4},
    },
    {
      texto: "Competir de frente",
      efectos: {"atributos":{"fisico":1,"tiro":1},"moral":4},
    },
    {
      texto: "Amargarte en silencio",
      efectos: {"moral":-8,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-partido-lluvia",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Final bajo diluvio. El técnico pregunta quién quiere salir.",
    opciones: [
    {
      texto: "Quedarte sí o sí",
      efectos: {"atributos":{"fisico":2},"moral":5,"riesgoLesion":0.1,"reputacion":4},
    },
    {
      texto: "Salir si te lo piden",
      efectos: {"moral":1,"reputacion":1},
    },
    {
      texto: "Pedir el cambio vos",
      efectos: {"reputacion":-3,"moral":2},
    },
    ],
  },
  {
    id: "con-capacitacion-finanzas",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El club ofrece taller de finanzas para jugadores jóvenes.",
    opciones: [
    {
      texto: "Asistir y aplicar",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Mandar al agente",
      efectos: {"moral":1},
    },
    {
      texto: "Skipearlo",
      efectos: {"reputacion":-2,"moral":1},
    },
    ],
  },
  {
    id: "con-lesion-leve-partido",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te duele el tobillo pero el partido está 1-1.",
    opciones: [
    {
      texto: "Forzar el regreso",
      efectos: {"moral":3,"riesgoLesion":0.28,"riesgoFinCarrera":0.04,"atributos":{"fisico":-2}},
    },
    {
      texto: "Respetar los tiempos médicos",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":4},
    },
    {
      texto: "Usar el tiempo para video y técnica",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":4},
    },
    ],
  },
  {
    id: "con-charla-capitan",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El capitán te llama aparte: 'el vestuario duda de tu compromiso'.",
    opciones: [
    {
      texto: "Escuchar y corregir",
      efectos: {"reputacion":6,"moral":2,"atributos":{"fisico":1}},
    },
    {
      texto: "Negar todo",
      efectos: {"reputacion":-6,"moral":-3},
    },
    {
      texto: "Pedir ejemplos concretos",
      efectos: {"reputacion":3,"moral":1},
    },
    ],
  },
  {
    id: "con-cambio-ciudad",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "El club te pide mudarte cerca del predio.",
    opciones: [
    {
      texto: "Mudarte",
      efectos: {"atributos":{"fisico":1},"moral":-3,"reputacion":4},
    },
    {
      texto: "Quedarte donde estás",
      efectos: {"moral":3,"reputacion":-2},
    },
    {
      texto: "Negociar ayuda de vivienda",
      efectos: {"reputacion":3,"moral":2},
    },
    ],
  },
  {
    id: "con-partido-benefico",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te piden jugar un benefico en día libre.",
    opciones: [
    {
      texto: "Jugar y sumar",
      efectos: {"reputacion":7,"moral":4,"riesgoLesion":0.06},
    },
    {
      texto: "Ir pero pedir minutos limitados",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "No ir",
      efectos: {"reputacion":-4,"moral":1},
    },
    ],
  },
  {
    id: "con-tecnico-interino",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Echan al técnico; llega un interino amigo de otros.",
    opciones: [
    {
      texto: "Demostrar en entrenamientos",
      efectos: {"atributos":{"ritmo":1,"fisico":1},"moral":3},
    },
    {
      texto: "Esperar al definitivo",
      efectos: {"moral":-2},
    },
    {
      texto: "Lobby con dirigentes",
      efectos: {"reputacion":-5,"moral":1},
    },
    ],
  },
  {
    id: "con-meta-asistencias",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Te desafían a llegar a 10 asistencias en el semestre.",
    opciones: [
    {
      texto: "Enfocarte en el último pase",
      efectos: {"atributos":{"pase":3,"regate":1},"moral":4},
    },
    {
      texto: "Seguir natural",
      efectos: {"moral":2},
    },
    {
      texto: "Forzar pases filtrados",
      efectos: {"atributos":{"pase":1},"reputacion":-2,"moral":2},
    },
    ],
  },
  {
    id: "con-meta-goles",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "La prensa te pone meta de 15 goles.",
    opciones: [
    {
      texto: "Usarlo como motiva",
      efectos: {"atributos":{"tiro":2},"moral":5},
    },
    {
      texto: "Ignorar la cifra",
      efectos: {"moral":2,"reputacion":2},
    },
    {
      texto: "Ansiedad goleadora",
      efectos: {"atributos":{"tiro":1,"pase":-1},"moral":-5},
    },
    ],
  },
  {
    id: "con-rival-directo-fichaje",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Fichan a tu rival directo de posición.",
    opciones: [
    {
      texto: "Competir sano",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":4},
    },
    {
      texto: "Pedir transferencia",
      efectos: {"reputacion":-3,"moral":-4,"transferencia":"mismo_nivel"},
    },
    {
      texto: "Dar la bienvenida y observar",
      efectos: {"reputacion":5,"moral":3},
    },
    ],
  },
  {
    id: "con-sesion-yoga",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Incorporan yoga y mindfulness. El vestuario se parte.",
    opciones: [
    {
      texto: "Probar en serio",
      efectos: {"moral":5,"atributos":{"fisico":1}},
    },
    {
      texto: "Hacer lo mínimo",
      efectos: {"moral":1},
    },
    {
      texto: "Burlarte del método",
      efectos: {"reputacion":-4,"moral":2},
    },
    ],
  },
  {
    id: "con-padre-agente",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Tu papá quiere meterse de agente 'para cuidarte'.",
    opciones: [
    {
      texto: "Mantener agente profesional",
      efectos: {"reputacion":4,"moral":-2},
    },
    {
      texto: "Darle un rol limitado",
      efectos: {"moral":3,"reputacion":1},
    },
    {
      texto: "Dejarlo manejar todo",
      efectos: {"reputacion":-3,"moral":4,"riesgoFinCarrera":0.02},
    },
    ],
  },
  {
    id: "con-convocatoria-sub20",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Suena tu nombre para la Sub-20 de Colombia. El club duda en liberarte.",
    opciones: [
    {
      texto: "Insistir en ir con la Selección",
      efectos: {"reputacion":10,"moral":10,"atributos":{"ritmo":1}},
    },
    {
      texto: "Priorizar el club esta vez",
      efectos: {"reputacion":4,"moral":-4},
    },
    {
      texto: "Negociar un acuerdo intermedio",
      efectos: {"reputacion":6,"moral":3},
    },
    ],
  },
  {
    id: "con-clasico-paisa",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Semana de clásico. La ciudad se parte en dos.",
    opciones: [
    {
      texto: "Solo hablar de fútbol",
      efectos: {"reputacion":7,"moral":3},
    },
    {
      texto: "Calentar el ambiente en redes",
      efectos: {"reputacion":4,"moral":6},
    },
    {
      texto: "Bajar el perfil",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "con-prensa-critica",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Un columnista dice que 'todavía no estás para grandes noches'.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "con-penal-fallado",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Fallás un penal decisivo frente a la hinchada local.",
    opciones: [
    {
      texto: "Pedir la pelota en el próximo",
      efectos: {"moral":6,"reputacion":5,"atributos":{"tiro":2}},
    },
    {
      texto: "Pedís disculpas públicas",
      efectos: {"reputacion":8,"moral":-2},
    },
    {
      texto: "Encerrarte y no hablar",
      efectos: {"moral":-12,"reputacion":-3},
    },
    ],
  },
  {
    id: "con-derby-capital",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Te toca el clásico de la capital. Ambientazo.",
    opciones: [
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"reputacion":6,"riesgoLesion":0.12},
    },
    {
      texto: "Jugar con inteligencia",
      efectos: {"atributos":{"pase":2},"reputacion":4,"moral":4},
    },
    {
      texto: "Buscar la jugada individual",
      efectos: {"atributos":{"regate":2,"tiro":1},"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "con-emisora-opinologo",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "En una emisora un opinólogo dice que 'te falta huevos'.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "con-barra-visita",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "La barra visitante te apunta todo el partido.",
    opciones: [
    {
      texto: "Concentrarte en la pelota",
      efectos: {"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Responder gestos",
      efectos: {"reputacion":-6,"moral":3},
    },
    {
      texto: "Usar la bronca para rendir",
      efectos: {"atributos":{"fisico":2},"moral":5,"reputacion":2},
    },
    ],
  },
  {
    id: "con-viaje-llanos",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Gira por los Llanos: calor, viaje y cancha dura.",
    opciones: [
    {
      texto: "Cuidar el cuerpo y gestionar",
      efectos: {"atributos":{"fisico":1},"moral":2,"riesgoLesion":0.05},
    },
    {
      texto: "Ir a muerte igual",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":0.14,"moral":4},
    },
    {
      texto: "Quejarte del fixture",
      efectos: {"reputacion":-4,"moral":1},
    },
    ],
  },
  {
    id: "con-entrevista-win",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Te invitan a un programa deportivo de TV nacional.",
    opciones: [
    {
      texto: "Ir preparado y sobrio",
      efectos: {"reputacion":8,"moral":3},
    },
    {
      texto: "Ir a generar polémica",
      efectos: {"reputacion":-5,"moral":5},
    },
    {
      texto: "Rechazar por concentración",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "con-copa-colombia",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Copa Colombia un miércoles y liga el domingo.",
    opciones: [
    {
      texto: "Priorizar la Selección",
      efectos: {"reputacion":12,"moral":10},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":3,"moral":-5},
    },
    {
      texto: "Intentar cumplir ambos calendarios",
      efectos: {"atributos":{"fisico":-2},"riesgoLesion":0.18,"reputacion":5,"moral":2},
    },
    ],
  },
  {
    id: "con-hinchada-aeropuerto",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Te reciben con cantos en el aeropuerto tras un buen partido.",
    opciones: [
    {
      texto: "Saludar y firmar",
      efectos: {"reputacion":6,"moral":7},
    },
    {
      texto: "Pasar rápido a recuperar",
      efectos: {"atributos":{"fisico":1},"moral":2},
    },
    {
      texto: "Prometer la estrella",
      efectos: {"reputacion":3,"moral":5},
    },
    ],
  },
  {
    id: "con-tecnico-extranjero",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Llega un DT extranjero que no conoce la Liga BetPlay.",
    opciones: [
    {
      texto: "Ayudarlo a adaptarse",
      efectos: {"reputacion":7,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Esperar a ver",
      efectos: {"moral":1},
    },
    {
      texto: "Dudar en voz alta",
      efectos: {"reputacion":-6,"moral":-2},
    },
    ],
  },
  {
    id: "con-claustro-prensa",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Rueda de prensa post derrota: te apuntan a vos.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "con-tormenta-cali",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Partido suspendido por tormenta. Reprograman a las 10 a.m. del día siguiente.",
    opciones: [
    {
      texto: "Recuperar bien esa noche",
      efectos: {"atributos":{"fisico":2},"moral":2},
    },
    {
      texto: "Salir igual 'a despejar'",
      efectos: {"moral":3,"riesgoLesion":0.08,"atributos":{"fisico":-1}},
    },
    {
      texto: "Quejarte del horario",
      efectos: {"reputacion":-3,"moral":1},
    },
    ],
  },
  {
    id: "con-junior-visita",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Jugar de visitante en un estadio caliente de la costa.",
    opciones: [
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"reputacion":6,"riesgoLesion":0.12},
    },
    {
      texto: "Jugar con inteligencia",
      efectos: {"atributos":{"pase":2},"reputacion":4,"moral":4},
    },
    {
      texto: "Buscar la jugada individual",
      efectos: {"atributos":{"regate":2,"tiro":1},"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "con-nacional-previa",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Previa de un grande: te comparan con ídolos históricos del club.",
    opciones: [
    {
      texto: "Bajar expectativas con humildad",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Aceptar el desafío",
      efectos: {"moral":6,"atributos":{"tiro":1}},
    },
    {
      texto: "Evitar declaraciones",
      efectos: {"reputacion":3,"moral":1},
    },
    ],
  },
  {
    id: "con-dimayor-fixture",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "La Dimayor aprieta el calendario: 3 partidos en 8 días.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "con-ascenso-rival",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Un rival recién ascendido te gana y se burla.",
    opciones: [
    {
      texto: "Responder en el próximo cruce",
      efectos: {"atributos":{"fisico":1,"tiro":1},"moral":4},
    },
    {
      texto: "Ignorar provocaciones",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Entrar al cruce en redes",
      efectos: {"reputacion":-8,"moral":3},
    },
    ],
  },
  {
    id: "con-feriado-partido",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Juegan un feriado a horario imposible para la familia.",
    opciones: [
    {
      texto: "Concentrarte igual",
      efectos: {"moral":3,"atributos":{"pase":1}},
    },
    {
      texto: "Pedir entradas para la familia",
      efectos: {"moral":5,"reputacion":2},
    },
    {
      texto: "Quejarte del horario",
      efectos: {"reputacion":-3,"moral":1},
    },
    ],
  },
  {
    id: "con-cancha-sintetica",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Cancha sintética nueva: pelota rara y piernas cargadas.",
    opciones: [
    {
      texto: "Adaptar el toque",
      efectos: {"atributos":{"pase":2,"regate":1},"moral":2},
    },
    {
      texto: "Quejarte del piso",
      efectos: {"reputacion":-3,"moral":1},
    },
    {
      texto: "Cuidar entradas",
      efectos: {"atributos":{"defensa":1},"riesgoLesion":0.04},
    },
    ],
  },
  {
    id: "con-gol-clasico",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Convertís en el clásico. Te piden declaración 'para la historia'.",
    opciones: [
    {
      texto: "Dedicar al plantel",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Dedicar a la hinchada",
      efectos: {"reputacion":7,"moral":8},
    },
    {
      texto: "Hacer gestos polémicos",
      efectos: {"reputacion":-6,"moral":5},
    },
    ],
  },
  {
    id: "con-expulsion-rival-amigo",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Echan a un amigo del otro equipo y te piden 'no aflojar'.",
    opciones: [
    {
      texto: "Seguir profesional",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Bajar un cambio por respeto",
      efectos: {"moral":3,"reputacion":-2},
    },
    {
      texto: "Apretar más",
      efectos: {"atributos":{"fisico":1},"reputacion":2,"riesgoLesion":0.06},
    },
    ],
  },
  {
    id: "con-noche-bogota",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Noche fría en Bogotá + final de mes: piernas pesadas.",
    opciones: [
    {
      texto: "Entrada en calor extra",
      efectos: {"atributos":{"ritmo":1},"moral":2},
    },
    {
      texto: "Pedir relevo temprano",
      efectos: {"moral":-1,"atributos":{"fisico":1}},
    },
    {
      texto: "Aguantar enteros",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":0.09,"moral":3},
    },
    ],
  },
  {
    id: "con-periodista-camaral",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Un periodista te espera en la salida de la concentración.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "con-camiseta-tribute",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Te piden usar una cinta de luto / causa social en el clásico.",
    opciones: [
    {
      texto: "Usarla con respeto",
      efectos: {"reputacion":7,"moral":4},
    },
    {
      texto: "Consultar al club primero",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Evitar temas 'no futboleros'",
      efectos: {"reputacion":-2,"moral":1},
    },
    ],
  },
  {
    id: "con-sub21-alternativa",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Si no vas a Sub-20, te ofrecen un microciclo Sub-21/aspirantes.",
    opciones: [
    {
      texto: "Ir igual",
      efectos: {"reputacion":6,"moral":5,"atributos":{"ritmo":1}},
    },
    {
      texto: "Quedarte a sumar en el club",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Tomártelo como desaire",
      efectos: {"moral":-6,"reputacion":-2},
    },
    ],
  },
  {
    id: "con-final-regional",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Final de un torneo regional: presión de toda la ciudad.",
    opciones: [
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"reputacion":6,"riesgoLesion":0.12},
    },
    {
      texto: "Jugar con inteligencia",
      efectos: {"atributos":{"pase":2},"reputacion":4,"moral":4},
    },
    {
      texto: "Buscar la jugada individual",
      efectos: {"atributos":{"regate":2,"tiro":1},"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "con-meme-fallo",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Se vuelve meme un fallo tuyo. Hasta en el barrio lo miran.",
    opciones: [
    {
      texto: "Reírte y superar",
      efectos: {"moral":5,"reputacion":3},
    },
    {
      texto: "Enojarte y responder",
      efectos: {"reputacion":-7,"moral":-2},
    },
    {
      texto: "Desactivar comentarios y trabajar",
      efectos: {"atributos":{"tiro":1},"moral":3,"reputacion":4},
    },
    ],
  },
  {
    id: "con-dt-seleccion-mira",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Dicen que un ayudante de la Selección mayor te miró en la platea.",
    opciones: [
    {
      texto: "Usarlo de motiva",
      efectos: {"atributos":{"ritmo":1,"tiro":1},"moral":6},
    },
    {
      texto: "No creerte el cuento",
      efectos: {"moral":2,"reputacion":2},
    },
    {
      texto: "Ansiedad por la convocatoria",
      efectos: {"moral":-5,"atributos":{"pase":-1}},
    },
    ],
  },
  {
    id: "con-traslado-avion",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Vuelo demorado: llegan 3 a.m. y juegan a las 4 p.m.",
    opciones: [
    {
      texto: "Dormir sí o sí",
      efectos: {"atributos":{"fisico":1},"moral":2},
    },
    {
      texto: "Quejarte en redes",
      efectos: {"reputacion":-6,"moral":1},
    },
    {
      texto: "Siesta y activación corta",
      efectos: {"atributos":{"ritmo":1},"moral":3},
    },
    ],
  },
  {
    id: "con-gol-olimpico-intento",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "De córner casi convertís un olímpico; la tribuna lo pide de nuevo.",
    opciones: [
    {
      texto: "Intentarlo con cabeza",
      efectos: {"atributos":{"tiro":2,"pase":1},"moral":4},
    },
    {
      texto: "Jugar simple",
      efectos: {"atributos":{"pase":1},"reputacion":2},
    },
    {
      texto: "Forzar la jugada",
      efectos: {"atributos":{"tiro":1},"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "con-extra-001",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Esta semana cambia el panorama: semana de clásico. La ciudad se parte en dos.",
    opciones: [
    {
      texto: "Solo hablar de fútbol",
      efectos: {"reputacion":7,"moral":3},
    },
    {
      texto: "Calentar el ambiente en redes",
      efectos: {"reputacion":4,"moral":6},
    },
    {
      texto: "Bajar el perfil",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "con-extra-002",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Sin esperarlo, te diagnostican una lesión muscular de tres semanas.",
    opciones: [
    {
      texto: "Forzar el regreso",
      efectos: {"moral":3,"riesgoLesion":0.28,"riesgoFinCarrera":0.04,"atributos":{"fisico":-2}},
    },
    {
      texto: "Respetar los tiempos médicos",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":4},
    },
    {
      texto: "Usar el tiempo para video y técnica",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":4},
    },
    ],
  },
  {
    id: "con-extra-003",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "En la interna del club, el técnico te saca al descanso y discutís en el túnel.",
    opciones: [
    {
      texto: "Pedir disculpas al día siguiente",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Mantener la bronca en público",
      efectos: {"reputacion":-15,"moral":-8},
    },
    {
      texto: "Hablar en privado y pedir explicaciones",
      efectos: {"reputacion":3,"moral":4,"atributos":{"pase":1}},
    },
    ],
  },
  {
    id: "con-extra-004",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "De un día para otro, te toca el clásico de la capital. Ambientazo.",
    opciones: [
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"reputacion":6,"riesgoLesion":0.12},
    },
    {
      texto: "Jugar con inteligencia",
      efectos: {"atributos":{"pase":2},"reputacion":4,"moral":4},
    },
    {
      texto: "Buscar la jugada individual",
      efectos: {"atributos":{"regate":2,"tiro":1},"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "con-extra-005",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "En medio de la pretemporada, llega un técnico nuevo con un sistema que no te favorece.",
    opciones: [
    {
      texto: "Adaptarte aunque baje tu brillo",
      efectos: {"atributos":{"defensa":2,"pase":1},"moral":-3,"reputacion":5},
    },
    {
      texto: "Pedir salida en el mercado",
      efectos: {"reputacion":-5,"moral":-6},
    },
    {
      texto: "Demostrar versatilidad",
      efectos: {"atributos":{"ritmo":1,"regate":1,"defensa":1},"moral":5,"reputacion":6},
    },
    ],
  },
  {
    id: "con-extra-006",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Con el calendario encima, la barra visitante te apunta todo el partido.",
    opciones: [
    {
      texto: "Concentrarte en la pelota",
      efectos: {"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Responder gestos",
      efectos: {"reputacion":-6,"moral":3},
    },
    {
      texto: "Usar la bronca para rendir",
      efectos: {"atributos":{"fisico":2},"moral":5,"reputacion":2},
    },
    ],
  },
  {
    id: "con-extra-007",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Cuando más necesitabas foco, un veterano te ofrece mentoría extra después de los entrenamientos.",
    opciones: [
    {
      texto: "Aceptar y absorber todo",
      efectos: {"atributos":{"pase":2,"defensa":1},"reputacion":5,"moral":6},
    },
    {
      texto: "Aceptar a medias",
      efectos: {"atributos":{"pase":1},"moral":2},
    },
    {
      texto: "Creer que no lo necesitás",
      efectos: {"reputacion":-4,"moral":1},
    },
    ],
  },
  {
    id: "con-extra-008",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Después de 5 titularidades te mandan al banco sin explicación.",
    opciones: [
    {
      texto: "Trabajar y esperar",
      efectos: {"atributos":{"fisico":1},"moral":-3,"reputacion":3},
    },
    {
      texto: "Pedir reunión inmediata",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Filtrar bronca a la prensa",
      efectos: {"reputacion":-14,"moral":-5},
    },
    ],
  },
  {
    id: "con-extra-009",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Esta semana cambia el panorama: copa Colombia un miércoles y liga el domingo.",
    opciones: [
    {
      texto: "Priorizar la Selección",
      efectos: {"reputacion":12,"moral":10},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":3,"moral":-5},
    },
    {
      texto: "Intentar cumplir ambos calendarios",
      efectos: {"atributos":{"fisico":-2},"riesgoLesion":0.18,"reputacion":5,"moral":2},
    },
    ],
  },
  {
    id: "con-extra-010",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Sin esperarlo, después de un error, el hate en redes se descontrola.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "con-extra-011",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "En la interna del club, llega un DT extranjero que no conoce la Liga BetPlay.",
    opciones: [
    {
      texto: "Ayudarlo a adaptarse",
      efectos: {"reputacion":7,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Esperar a ver",
      efectos: {"moral":1},
    },
    {
      texto: "Dudar en voz alta",
      efectos: {"reputacion":-6,"moral":-2},
    },
    ],
  },
  {
    id: "con-extra-012",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "De un día para otro, el PF te pide gym extra nocturno tres veces por semana.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "con-extra-013",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "En medio de la pretemporada, te prueban en una posición distinta a la tuya.",
    opciones: [
    {
      texto: "Abrazar el cambio",
      efectos: {"atributos":{"defensa":1,"pase":1,"ritmo":1},"moral":3,"reputacion":5},
    },
    {
      texto: "Pedir volver a tu puesto natural",
      efectos: {"reputacion":-2,"moral":2},
    },
    {
      texto: "Hacerlo a regañadientes",
      efectos: {"moral":-5,"atributos":{"tiro":-1}},
    },
    ],
  },
  {
    id: "con-extra-014",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "Con el calendario encima, jugar de visitante en un estadio caliente de la costa.",
    opciones: [
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"reputacion":6,"riesgoLesion":0.12},
    },
    {
      texto: "Jugar con inteligencia",
      efectos: {"atributos":{"pase":2},"reputacion":4,"moral":4},
    },
    {
      texto: "Buscar la jugada individual",
      efectos: {"atributos":{"regate":2,"tiro":1},"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "con-extra-015",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Cuando más necesitabas foco, una marca local te ofrece un contrato chico pero exigente en posts.",
    opciones: [
    {
      texto: "Firmar y cumplir",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Rechazar para no distraerte",
      efectos: {"moral":1,"atributos":{"fisico":1}},
    },
    {
      texto: "Firmar y postear a desgano",
      efectos: {"reputacion":-4,"moral":3},
    },
    ],
  },
  {
    id: "con-extra-016",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "La Dimayor aprieta el calendario: 3 partidos en 8 días.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "con-extra-017",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Esta semana cambia el panorama: concentrados 48h antes: el hotel es un quilombo de ruido.",
    opciones: [
    {
      texto: "Pedir cambio de habitación",
      efectos: {"moral":3,"reputacion":1},
    },
    {
      texto: "Aguantar y dormir con tapones",
      efectos: {"atributos":{"fisico":1},"moral":1},
    },
    {
      texto: "Quejarte en el grupo de WhatsApp",
      efectos: {"reputacion":-5,"moral":2},
    },
    ],
  },
  {
    id: "con-extra-018",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Sin esperarlo, te asignan exponer el análisis del rival en la charla técnica.",
    opciones: [
    {
      texto: "Prepararlo a fondo",
      efectos: {"atributos":{"pase":1,"defensa":2},"reputacion":6,"moral":4},
    },
    {
      texto: "Improvisar",
      efectos: {"reputacion":-3,"moral":1},
    },
    {
      texto: "Pedir que lo haga un veterano",
      efectos: {"reputacion":-2,"moral":-1},
    },
    ],
  },
  {
    id: "con-extra-019",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "En la interna del club, cancha sintética nueva: pelota rara y piernas cargadas.",
    opciones: [
    {
      texto: "Adaptar el toque",
      efectos: {"atributos":{"pase":2,"regate":1},"moral":2},
    },
    {
      texto: "Quejarte del piso",
      efectos: {"reputacion":-3,"moral":1},
    },
    {
      texto: "Cuidar entradas",
      efectos: {"atributos":{"defensa":1},"riesgoLesion":0.04},
    },
    ],
  },
  {
    id: "con-extra-020",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "De un día para otro, el club evalúa cedarte a otro equipo para que sumes minutos.",
    opciones: [
    {
      texto: "Aceptar el préstamo",
      efectos: {"moral":4,"atributos":{"ritmo":1,"fisico":1},"reputacion":2},
    },
    {
      texto: "Pelear por quedarte",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Pedir salida definitiva",
      efectos: {"reputacion":-4,"moral":3},
    },
    ],
  },
  {
    id: "con-extra-021",
    tramoCarrera: "consolidacion",
    categoria: "colombia_especifico",
    texto: "En medio de la pretemporada, echan a un amigo del otro equipo y te piden 'no aflojar'.",
    opciones: [
    {
      texto: "Seguir profesional",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Bajar un cambio por respeto",
      efectos: {"moral":3,"reputacion":-2},
    },
    {
      texto: "Apretar más",
      efectos: {"atributos":{"fisico":1},"reputacion":2,"riesgoLesion":0.06},
    },
    ],
  },
  {
    id: "con-extra-022",
    tramoCarrera: "consolidacion",
    categoria: "generico",
    texto: "Con el calendario encima, te bajan grasa corporal con dieta muy dura.",
    opciones: [
    {
      texto: "Cumplir al 100%",
      efectos: {"atributos":{"ritmo":2,"fisico":1},"moral":-4},
    },
    {
      texto: "Cumplir a medias",
      efectos: {"atributos":{"ritmo":1},"moral":1},
    },
    {
      texto: "Quejarte del hambre en público",
      efectos: {"reputacion":-5,"moral":2},
    },
    ],
  },
  {
    id: "prime-oferta-grande",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Una oferta grande está sobre la mesa. El club quiere retenerte.",
    opciones: [
    {
      texto: "Aceptar la oferta y cambiar de club",
      efectos: {"reputacion":10,"moral":12,"transferencia":"ascenso"},
    },
    {
      texto: "Quedarte y renegociar a lo grande",
      efectos: {"reputacion":6,"moral":5,"atributos":{"fisico":1}},
    },
    {
      texto: "Rechazar y seguir el proyecto actual",
      efectos: {"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "prime-brazalete",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Te ofrecen el brazalete de capitán.",
    opciones: [
    {
      texto: "Asumir el liderazgo",
      efectos: {"reputacion":10,"moral":6},
    },
    {
      texto: "Apoyar sin ser el centro",
      efectos: {"reputacion":5,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Priorizar tu rendimiento individual",
      efectos: {"atributos":{"tiro":1,"regate":1},"reputacion":-3,"moral":2},
    },
    ],
  },
  {
    id: "prime-rivalidad",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Un rival mediático te apunta como 'sobrevalorado'.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "prime-contrato-publicidad",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Marca grande con cláusulas de imagen estrictas.",
    opciones: [
    {
      texto: "Firmar y cuidar cada aparición",
      efectos: {"reputacion":8,"moral":3},
    },
    {
      texto: "Firmar pero vivir igual",
      efectos: {"reputacion":-5,"moral":6},
    },
    {
      texto: "Rechazar para no distraerte",
      efectos: {"reputacion":3,"moral":1,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "prime-lesion-seria",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Sospecha de lesión de rodilla. El médico sugiere estudios.",
    opciones: [
    {
      texto: "Forzar el regreso",
      efectos: {"moral":3,"riesgoLesion":0.28,"riesgoFinCarrera":0.04,"atributos":{"fisico":-2}},
    },
    {
      texto: "Respetar los tiempos médicos",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":4},
    },
    {
      texto: "Usar el tiempo para video y técnica",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":4},
    },
    ],
  },
  {
    id: "prime-cambio-agente",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Tu agente pelea con un mega-agente por tu representación.",
    opciones: [
    {
      texto: "Mantener lealtad al que te descubrió",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Cambiar al grande",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Quedarte sin agente un tiempo",
      efectos: {"reputacion":-3,"moral":-2},
    },
    ],
  },
  {
    id: "prime-disciplina",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "El cuerpo técnico detecta que bajaste el nivel en entrenamientos.",
    opciones: [
    {
      texto: "Resetear hábitos y carga",
      efectos: {"atributos":{"fisico":3,"ritmo":2},"moral":4,"reputacion":5},
    },
    {
      texto: "Negar el problema",
      efectos: {"reputacion":-10,"moral":-5,"atributos":{"fisico":-2}},
    },
    {
      texto: "Pedir un plan personalizado",
      efectos: {"atributos":{"fisico":2},"moral":6,"reputacion":4},
    },
    ],
  },
  {
    id: "prime-rol-tactico",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Te piden sacrificar brillo por un rol más táctico.",
    opciones: [
    {
      texto: "Aceptar el sacrificio",
      efectos: {"atributos":{"defensa":3,"pase":2,"tiro":-1},"reputacion":8,"moral":-2},
    },
    {
      texto: "Negociar un rol mixto",
      efectos: {"atributos":{"pase":1,"tiro":1},"reputacion":4,"moral":3},
    },
    {
      texto: "Plantarte",
      efectos: {"reputacion":-8,"moral":2},
    },
    ],
  },
  {
    id: "prime-renovacion-tope",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "El club ofrece renovación a tope salarial... o salida.",
    opciones: [
    {
      texto: "Negociar con cabeza fría",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "Presionar por más plata ya",
      efectos: {"reputacion":-6,"moral":2},
    },
    {
      texto: "Priorizar minutos y proyecto",
      efectos: {"reputacion":4,"moral":5,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "prime-liderazgo-vestuario",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Hay grieta en el vestuario. Te piden que unifiques.",
    opciones: [
    {
      texto: "Asumir el liderazgo",
      efectos: {"reputacion":10,"moral":6},
    },
    {
      texto: "Apoyar sin ser el centro",
      efectos: {"reputacion":5,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Priorizar tu rendimiento individual",
      efectos: {"atributos":{"tiro":1,"regate":1},"reputacion":-3,"moral":2},
    },
    ],
  },
  {
    id: "prime-padre-empresario",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Tu entorno familiar arma un 'clan' que habla por vos.",
    opciones: [
    {
      texto: "Poner límites claros",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Dejarlos manejar la imagen",
      efectos: {"reputacion":-4,"moral":3},
    },
    {
      texto: "Delegar todo al agente",
      efectos: {"reputacion":3,"moral":1},
    },
    ],
  },
  {
    id: "prime-carga-partidos",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "50 partidos en la temporada: el cuerpo pide tregua.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "prime-error-champions",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Error grave en un partido grande de Europa / copa.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "prime-companero-joven",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Un pibe de 19 te come el puesto en rachas.",
    opciones: [
    {
      texto: "Mentorearlo y competir",
      efectos: {"reputacion":10,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Pedir no rotar",
      efectos: {"reputacion":-5,"moral":1},
    },
    {
      texto: "Aceptar minutos compartidos",
      efectos: {"reputacion":5,"moral":2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "prime-inversion-dudosa",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Te ofrecen un negocio 'seguro' con un amigo del ambiente.",
    opciones: [
    {
      texto: "Rechazar sin asesores",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Revisar con profesionales",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Meter plata fuerte",
      efectos: {"moral":-8,"reputacion":-4,"riesgoFinCarrera":0.04},
    },
    ],
  },
  {
    id: "prime-entrevista-espn",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Entrevista internacional: preguntan por tu legado.",
    opciones: [
    {
      texto: "Hablar de trabajo y equipo",
      efectos: {"reputacion":8,"moral":4},
    },
    {
      texto: "Hablar de tu yo individual",
      efectos: {"reputacion":2,"moral":3},
    },
    {
      texto: "Evitar la entrevista",
      efectos: {"reputacion":-2,"moral":1},
    },
    ],
  },
  {
    id: "prime-cambio-dt",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Echan al DT que te bancaba. Entra uno frío con vos.",
    opciones: [
    {
      texto: "Ganarte al nuevo",
      efectos: {"atributos":{"fisico":2,"defensa":1},"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir salida",
      efectos: {"reputacion":-3,"moral":-4},
    },
    {
      texto: "Esperar el mercado",
      efectos: {"moral":-2,"reputacion":1},
    },
    ],
  },
  {
    id: "prime-clausula-rescision",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Activan tu cláusula. Tenés 48h para decidir el destino.",
    opciones: [
    {
      texto: "Elegir el proyecto deportivo",
      efectos: {"moral":6,"reputacion":5,"atributos":{"ritmo":1}},
    },
    {
      texto: "Elegir la mejor plata",
      efectos: {"moral":4,"reputacion":1},
    },
    {
      texto: "Quedarte y pelear la cláusula",
      efectos: {"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "prime-dopaje-rumor",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Corre un rumor infame sobre sustancias. Es falso.",
    opciones: [
    {
      texto: "Demandar / responder legal",
      efectos: {"reputacion":5,"moral":-3},
    },
    {
      texto: "Ignorar y rendir",
      efectos: {"atributos":{"tiro":1},"moral":4,"reputacion":3},
    },
    {
      texto: "Estallar en redes",
      efectos: {"reputacion":-8,"moral":2},
    },
    ],
  },
  {
    id: "prime-capitan-alternativa",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "No te dan el brazalete; se lo dan a otro.",
    opciones: [
    {
      texto: "Bancarlo igual",
      efectos: {"reputacion":8,"moral":3},
    },
    {
      texto: "Tomarlo personal",
      efectos: {"moral":-8,"reputacion":-4},
    },
    {
      texto: "Liderar sin brazalete",
      efectos: {"reputacion":6,"moral":5,"atributos":{"pase":1}},
    },
    ],
  },
  {
    id: "prime-pretemporada-extrema",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Pretemporada de infierno en altura / calor.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "prime-divorcio-entorno",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Crisis personal fuerte fuera de la cancha.",
    opciones: [
    {
      texto: "Pedir ayuda profesional",
      efectos: {"moral":4,"reputacion":3},
    },
    {
      texto: "Encerrarte en el fútbol",
      efectos: {"atributos":{"tiro":1},"moral":-6},
    },
    {
      texto: "Pedir tiempo al club",
      efectos: {"moral":2,"reputacion":2,"atributos":{"fisico":-1}},
    },
    ],
  },
  {
    id: "prime-extension-contrato",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Te ofrecen 1 año más con rol de rotación.",
    opciones: [
    {
      texto: "Aceptar y ser útil",
      efectos: {"reputacion":6,"moral":2,"atributos":{"defensa":1}},
    },
    {
      texto: "Buscar titularidad afuera",
      efectos: {"moral":4,"reputacion":2},
    },
    {
      texto: "Retirarte del club enojado",
      efectos: {"reputacion":-6,"moral":-4},
    },
    ],
  },
  {
    id: "prime-partido-800",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Llegás a un hito de partidos en tu carrera.",
    opciones: [
    {
      texto: "Celebrar con humildad",
      efectos: {"reputacion":8,"moral":6},
    },
    {
      texto: "Usarlo de marketing fuerte",
      efectos: {"reputacion":4,"moral":4},
    },
    {
      texto: "Restarle importancia",
      efectos: {"reputacion":2,"moral":2},
    },
    ],
  },
  {
    id: "prime-tecnico-te-apunta",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "El DT te hace el chivo expiatorio en conferencia.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "prime-oferta-mls-final",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Llega una oferta MLS muy alta a tu edad prime tardío.",
    opciones: [
    {
      texto: "Aceptar y cruzar a la MLS",
      efectos: {"reputacion":6,"moral":10,"transferencia":"mls"},
    },
    {
      texto: "Quedarte en tu liga actual",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Usar la oferta solo para subir sueldo",
      efectos: {"reputacion":-2,"moral":4},
    },
    ],
  },
  {
    id: "prime-recuperacion-quirurgica",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Post operatorio: te tienta volver antes de tiempo.",
    opciones: [
    {
      texto: "Forzar el regreso",
      efectos: {"moral":3,"riesgoLesion":0.28,"riesgoFinCarrera":0.04,"atributos":{"fisico":-2}},
    },
    {
      texto: "Respetar los tiempos médicos",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":4},
    },
    {
      texto: "Usar el tiempo para video y técnica",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":4},
    },
    ],
  },
  {
    id: "prime-rol-pressing",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "El sistema nuevo te exige pressing extremo 90 minutos.",
    opciones: [
    {
      texto: "Adaptar el físico",
      efectos: {"atributos":{"ritmo":2,"fisico":2},"moral":-2,"riesgoLesion":0.1},
    },
    {
      texto: "Pedir rol más posicional",
      efectos: {"reputacion":-2,"moral":2,"atributos":{"pase":1}},
    },
    {
      texto: "Hacerlo a medias",
      efectos: {"reputacion":-5,"atributos":{"fisico":-1}},
    },
    ],
  },
  {
    id: "prime-multa-interna",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Te multan por llegar tarde a una concentración.",
    opciones: [
    {
      texto: "Aceptar y disculparte",
      efectos: {"reputacion":4,"moral":-2},
    },
    {
      texto: "Discutir la multa",
      efectos: {"reputacion":-6,"moral":1},
    },
    {
      texto: "Pagar y endurecer hábitos",
      efectos: {"reputacion":5,"moral":2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "prime-entrevista-sueldo",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Filtran tu sueldo. El vestuario se tensa.",
    opciones: [
    {
      texto: "Bajar el perfil",
      efectos: {"reputacion":5,"moral":1},
    },
    {
      texto: "Hablar claro con el grupo",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Flexear",
      efectos: {"reputacion":-10,"moral":2},
    },
    ],
  },
  {
    id: "prime-cesion-estrella",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "El club quiere cedarte para acomodar fair play financiero.",
    opciones: [
    {
      texto: "Aceptar si hay proyecto",
      efectos: {"moral":3,"atributos":{"ritmo":1}},
    },
    {
      texto: "Negarte",
      efectos: {"reputacion":2,"moral":1},
    },
    {
      texto: "Forzar venta",
      efectos: {"reputacion":-4,"moral":2},
    },
    ],
  },
  {
    id: "prime-final-perdida",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Pierden una final. El plantel se culpa.",
    opciones: [
    {
      texto: "Asumir el liderazgo",
      efectos: {"reputacion":10,"moral":6},
    },
    {
      texto: "Apoyar sin ser el centro",
      efectos: {"reputacion":5,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Priorizar tu rendimiento individual",
      efectos: {"atributos":{"tiro":1,"regate":1},"reputacion":-3,"moral":2},
    },
    ],
  },
  {
    id: "prime-final-ganada",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Ganan una final. Te ofrecen ser la cara de la celebración.",
    opciones: [
    {
      texto: "Compartir protagonismo",
      efectos: {"reputacion":10,"moral":8},
    },
    {
      texto: "Tomar el centro",
      efectos: {"reputacion":4,"moral":7},
    },
    {
      texto: "Descansar y cuidar el cuerpo",
      efectos: {"atributos":{"fisico":1},"moral":3},
    },
    ],
  },
  {
    id: "prime-sponsor-conflicto",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Dos sponsors se pisan; tenés que elegir.",
    opciones: [
    {
      texto: "Elegir con abogados",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Elegir por feeling",
      efectos: {"moral":3,"reputacion":1},
    },
    {
      texto: "Quedar mal con ambos",
      efectos: {"reputacion":-6,"moral":-2},
    },
    ],
  },
  {
    id: "prime-migracion-familia",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Tu familia quiere mudarse con vos al extranjero.",
    opciones: [
    {
      texto: "Llevarlos y armar red de apoyo",
      efectos: {"moral":6,"reputacion":2},
    },
    {
      texto: "Ir solo un año",
      efectos: {"moral":-3,"atributos":{"fisico":1}},
    },
    {
      texto: "Posponer la decisión",
      efectos: {"moral":1},
    },
    ],
  },
  {
    id: "prime-critica-estadistica",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Un portal dice que tus stats 'no justifican el sueldo'.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "prime-partido-seleccion-club",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Misma semana: club grande + convocatoria.",
    opciones: [
    {
      texto: "Priorizar la Selección",
      efectos: {"reputacion":12,"moral":10},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":3,"moral":-5},
    },
    {
      texto: "Intentar cumplir ambos calendarios",
      efectos: {"atributos":{"fisico":-2},"riesgoLesion":0.18,"reputacion":5,"moral":2},
    },
    ],
  },
  {
    id: "prime-nueva-posicion-dt",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "El DT te transforma en otra posición a los 28.",
    opciones: [
    {
      texto: "Reinventarte",
      efectos: {"atributos":{"pase":2,"defensa":2,"tiro":-1},"moral":4,"reputacion":6},
    },
    {
      texto: "Resistirte",
      efectos: {"reputacion":-5,"moral":-3},
    },
    {
      texto: "Aceptar a prueba 10 partidos",
      efectos: {"reputacion":3,"moral":3,"atributos":{"defensa":1}},
    },
    ],
  },
  {
    id: "prime-huelga-entrenamiento",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Parte del plantel quiere 'entrenar flojo' por un conflicto.",
    opciones: [
    {
      texto: "No adherir y entrenar normal",
      efectos: {"reputacion":5,"moral":-2},
    },
    {
      texto: "Adherir solidario",
      efectos: {"reputacion":2,"moral":3},
    },
    {
      texto: "Mediar con dirigentes",
      efectos: {"reputacion":8,"moral":2},
    },
    ],
  },
  {
    id: "prime-revision-medica",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "La revisión médica de un club grande te marca una alerta menor.",
    opciones: [
    {
      texto: "Tratarlo a fondo y firmar igual",
      efectos: {"atributos":{"fisico":2},"moral":4,"reputacion":5,"transferencia":"ascenso"},
    },
    {
      texto: "Minimizarlo y cancelar el pase",
      efectos: {"moral":-2,"reputacion":2},
    },
    {
      texto: "Segunda opinión top y decidir después",
      efectos: {"reputacion":2,"moral":3},
    },
    ],
  },
  {
    id: "prime-libro-biografia",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Te proponen una biografía prematura.",
    opciones: [
    {
      texto: "Esperar al retiro",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Hacerla ahora",
      efectos: {"reputacion":3,"moral":4},
    },
    {
      texto: "Rechazar",
      efectos: {"moral":1},
    },
    ],
  },
  {
    id: "prime-twitch-stream",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Te proponen streamear tu vida de crack.",
    opciones: [
    {
      texto: "Solo contenido controlado",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "Abrir tu intimidad",
      efectos: {"reputacion":-3,"moral":5},
    },
    {
      texto: "No",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "prime-rival-historico",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Un ex compañero ahora rival te provoca en la previa.",
    opciones: [
    {
      texto: "Saludar y jugar",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "No mirarlo",
      efectos: {"moral":2},
    },
    {
      texto: "Entrar al game",
      efectos: {"reputacion":-4,"moral":4,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "prime-cambio-alimentacion",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Nuevo chef: dieta antiinflamatoria estricta.",
    opciones: [
    {
      texto: "Cumplir",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-2},
    },
    {
      texto: "Trucar comidas",
      efectos: {"atributos":{"fisico":-1},"moral":3,"reputacion":-2},
    },
    {
      texto: "Pedir excepciones sociales",
      efectos: {"moral":2,"reputacion":1},
    },
    ],
  },
  {
    id: "prime-penales-final",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Final a penales: ¿pateás el tercero?",
    opciones: [
    {
      texto: "Pedir el balón",
      efectos: {"atributos":{"tiro":2},"moral":6,"reputacion":5},
    },
    {
      texto: "Dejarlo a un especialista",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Esconderte",
      efectos: {"reputacion":-8,"moral":-4},
    },
    ],
  },
  {
    id: "prime-redes-familia",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Un familiar opina de tu DT en redes con tu apellido.",
    opciones: [
    {
      texto: "Desmentir y pedir que pare",
      efectos: {"reputacion":6,"moral":-2},
    },
    {
      texto: "Ignorar",
      efectos: {"reputacion":-3,"moral":1},
    },
    {
      texto: "Bloquear y hablar en privado",
      efectos: {"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "prime-carga-internacional",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Jet lag + partido midweek en otra continente.",
    opciones: [
    {
      texto: "Protocolo de sueño estricto",
      efectos: {"atributos":{"fisico":2},"moral":2},
    },
    {
      texto: "Improvisar",
      efectos: {"riesgoLesion":0.1,"moral":1,"atributos":{"ritmo":-1}},
    },
    {
      texto: "Pedir no ser titular",
      efectos: {"reputacion":-2,"moral":2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "prime-masterclass-pibes",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Te piden dar una clinic a juveniles del club.",
    opciones: [
    {
      texto: "Prepararla en serio",
      efectos: {"reputacion":8,"moral":5},
    },
    {
      texto: "Ir a cumplir",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Delegar en el 2do capitán",
      efectos: {"reputacion":-2,"moral":1},
    },
    ],
  },
  {
    id: "prime-oferta-china-arabia",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Oferta millonaria de una liga emergente.",
    opciones: [
    {
      texto: "Aceptar el salto económico (MLS / liga puente)",
      efectos: {"reputacion":2,"moral":8,"transferencia":"mls"},
    },
    {
      texto: "Rechazar y cuidar el prestigio",
      efectos: {"reputacion":8,"moral":3},
    },
    {
      texto: "Pedir más plata sin comprometerte",
      efectos: {"reputacion":-3,"moral":4},
    },
    ],
  },
  {
    id: "prime-control-peso",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Te marcan +2kg en el control semanal.",
    opciones: [
    {
      texto: "Corregir ya",
      efectos: {"atributos":{"ritmo":1,"fisico":1},"moral":-1},
    },
    {
      texto: "Discutir la balanza",
      efectos: {"reputacion":-3,"moral":1},
    },
    {
      texto: "Plan con nutricionista",
      efectos: {"atributos":{"fisico":2},"moral":2,"reputacion":2},
    },
    ],
  },
  {
    id: "prime-eliminatoria",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Fecha de Eliminatoria vs partido clave de club.",
    opciones: [
    {
      texto: "Priorizar la Selección",
      efectos: {"reputacion":12,"moral":10},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":3,"moral":-5},
    },
    {
      texto: "Intentar cumplir ambos calendarios",
      efectos: {"atributos":{"fisico":-2},"riesgoLesion":0.18,"reputacion":5,"moral":2},
    },
    ],
  },
  {
    id: "prime-hinchada-colombia",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "En Selección la hinchada te corea el apellido.",
    opciones: [
    {
      texto: "Asumir el protagonismo",
      efectos: {"atributos":{"tiro":2,"regate":1},"moral":12,"reputacion":10},
    },
    {
      texto: "Repartir juego",
      efectos: {"atributos":{"pase":3},"moral":8,"reputacion":12},
    },
    {
      texto: "Te trabás por la presión",
      efectos: {"moral":-8,"reputacion":-4},
    },
    ],
  },
  {
    id: "prime-clasico-capital",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Te invitan a opinar del clásico de la capital en vivo.",
    opciones: [
    {
      texto: "Hablar con respeto de ambos",
      efectos: {"reputacion":8,"moral":3},
    },
    {
      texto: "Picar la controversia",
      efectos: {"reputacion":-6,"moral":5},
    },
    {
      texto: "Cancelar a último momento",
      efectos: {"reputacion":-2,"moral":1},
    },
    ],
  },
  {
    id: "prime-filantropia",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Te proponen una fundación en tu barrio de origen.",
    opciones: [
    {
      texto: "Meterle tiempo y plata de verdad",
      efectos: {"reputacion":15,"moral":10},
    },
    {
      texto: "Poner el nombre y delegar",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Posponerlo",
      efectos: {"reputacion":-3,"moral":-2},
    },
    ],
  },
  {
    id: "prime-convocado-mayor",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Lista de la mayor: estás en el límite del corte.",
    opciones: [
    {
      texto: "Hablar con el DT de Selección",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Rendir en el club y esperar",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":4},
    },
    {
      texto: "Ansiedad mediática",
      efectos: {"moral":-6,"reputacion":-2},
    },
    ],
  },
  {
    id: "prime-barras-bravas",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Una barra te 'pide' gestos en el próximo clásico.",
    opciones: [
    {
      texto: "Negarte con respeto",
      efectos: {"reputacion":6,"moral":1},
    },
    {
      texto: "Ignorar el mensaje",
      efectos: {"reputacion":3,"moral":1},
    },
    {
      texto: "Comprometerte",
      efectos: {"reputacion":-12,"moral":3,"riesgoFinCarrera":0.03},
    },
    ],
  },
  {
    id: "prime-periodismo-deportivo",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Te hacen nota de tapa en un diario grande del país.",
    opciones: [
    {
      texto: "Hablar de colectivo",
      efectos: {"reputacion":7,"moral":4},
    },
    {
      texto: "Vender tu historia dura",
      efectos: {"reputacion":5,"moral":5},
    },
    {
      texto: "Evitar detalles íntimos",
      efectos: {"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "prime-amistoso-fecha-fifa",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Amistoso de Selección vs recuperación de club.",
    opciones: [
    {
      texto: "Priorizar la Selección",
      efectos: {"reputacion":12,"moral":10},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":3,"moral":-5},
    },
    {
      texto: "Intentar cumplir ambos calendarios",
      efectos: {"atributos":{"fisico":-2},"riesgoLesion":0.18,"reputacion":5,"moral":2},
    },
    ],
  },
  {
    id: "prime-critica-excrack",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Un ex crack colombiano dice que 'te falta personalidad'.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "prime-gol-eliminatoria",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Convertís en Eliminatoria. El país explota.",
    opciones: [
    {
      texto: "Celebrar con el grupo",
      efectos: {"reputacion":12,"moral":12},
    },
    {
      texto: "Celebración individual icónica",
      efectos: {"reputacion":8,"moral":10},
    },
    {
      texto: "Dedicatoria polémica",
      efectos: {"reputacion":-4,"moral":8},
    },
    ],
  },
  {
    id: "prime-regreso-betplay-rumor",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Suena tu regreso a BetPlay 'por un año'.",
    opciones: [
    {
      texto: "Cerrar el círculo",
      efectos: {"reputacion":8,"moral":8,"transferencia":"club_origen"},
    },
    {
      texto: "Seguir afuera",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Usar el rumor para renegociar",
      efectos: {"reputacion":-3,"moral":3},
    },
    ],
  },
  {
    id: "prime-dt-colombia",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Cambio de DT en la Selección: no sabés si te cuenta.",
    opciones: [
    {
      texto: "Pedir reunión",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Imponer rendimiento",
      efectos: {"atributos":{"fisico":1,"tiro":1},"moral":4},
    },
    {
      texto: "Bajar los brazos",
      efectos: {"moral":-8,"atributos":{"ritmo":-1}},
    },
    ],
  },
  {
    id: "prime-noche-barranquilla",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Jugar Eliminatoria en Barranquilla: calor y presión.",
    opciones: [
    {
      texto: "Protocolo de hidratación y foco",
      efectos: {"atributos":{"fisico":2},"moral":5,"reputacion":4},
    },
    {
      texto: "Dejarte llevar por el ambiente",
      efectos: {"moral":8,"riesgoLesion":0.08},
    },
    {
      texto: "Pedir relevo si aflojás",
      efectos: {"moral":1,"reputacion":1},
    },
    ],
  },
  {
    id: "prime-copa-america-ciclo",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Arranca ciclo de Copa América. Te piden punta de lanza.",
    opciones: [
    {
      texto: "Asumir el liderazgo",
      efectos: {"reputacion":10,"moral":6},
    },
    {
      texto: "Apoyar sin ser el centro",
      efectos: {"reputacion":5,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Priorizar tu rendimiento individual",
      efectos: {"atributos":{"tiro":1,"regate":1},"reputacion":-3,"moral":2},
    },
    ],
  },
  {
    id: "prime-comparacion-idolo",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Te comparan con un ídolo histórico de tu club de origen.",
    opciones: [
    {
      texto: "Agradecer y bajar expectativas",
      efectos: {"reputacion":7,"moral":3},
    },
    {
      texto: "Aceptar la comparación",
      efectos: {"moral":6,"atributos":{"tiro":1}},
    },
    {
      texto: "Pedír que no comparen",
      efectos: {"reputacion":3,"moral":1},
    },
    ],
  },
  {
    id: "prime-tweet-politico",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Te piden posicionarte en un debate político del país.",
    opciones: [
    {
      texto: "No opinar",
      efectos: {"reputacion":4,"moral":1},
    },
    {
      texto: "Opinar con cuidado",
      efectos: {"reputacion":1,"moral":2},
    },
    {
      texto: "Opinar fuerte",
      efectos: {"reputacion":-10,"moral":3},
    },
    ],
  },
  {
    id: "prime-docuserie",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Netflix/local: docuserie sobre tu vida.",
    opciones: [
    {
      texto: "Controlar el relato",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "Abrir archivos sensibles",
      efectos: {"reputacion":2,"moral":3},
    },
    {
      texto: "Rechazar",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "prime-clasico-paisa-veterano",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Volvés a un clásico paisa años después.",
    opciones: [
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"reputacion":6,"riesgoLesion":0.12},
    },
    {
      texto: "Jugar con inteligencia",
      efectos: {"atributos":{"pase":2},"reputacion":4,"moral":4},
    },
    {
      texto: "Buscar la jugada individual",
      efectos: {"atributos":{"regate":2,"tiro":1},"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "prime-federacion-bonus",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "La Federación ofrece bono por clasificar.",
    opciones: [
    {
      texto: "Enfocarte en el juego",
      efectos: {"atributos":{"tiro":1,"pase":1},"moral":4},
    },
    {
      texto: "Hablar del bono en medios",
      efectos: {"reputacion":-4,"moral":2},
    },
    {
      texto: "Pedir claridad al grupo",
      efectos: {"reputacion":3,"moral":2},
    },
    ],
  },
  {
    id: "prime-lesion-seleccion",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Te lesionás en un microciclo de Selección; el club se enoja.",
    opciones: [
    {
      texto: "Transparencia total",
      efectos: {"reputacion":5,"moral":-3},
    },
    {
      texto: "Acelerar vuelta al club",
      efectos: {"riesgoLesion":0.22,"moral":2,"atributos":{"fisico":-2}},
    },
    {
      texto: "Priorizar recuperación larga",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":3},
    },
    ],
  },
  {
    id: "prime-homenaje-estadio",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Tu club de origen te invita a un homenaje a mitad de temporada.",
    opciones: [
    {
      texto: "Ir y agradecer",
      efectos: {"reputacion":8,"moral":7},
    },
    {
      texto: "Mandar video",
      efectos: {"reputacion":4,"moral":3},
    },
    {
      texto: "No ir por calendario",
      efectos: {"reputacion":-2,"moral":1},
    },
    ],
  },
  {
    id: "prime-cancha-altitud",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Eliminatoria en altura: te cuesta el primer tiempo.",
    opciones: [
    {
      texto: "Gestionar esfuerzos",
      efectos: {"atributos":{"fisico":1,"pase":1},"moral":3},
    },
    {
      texto: "Ir a muerte",
      efectos: {"atributos":{"fisico":2},"riesgoLesion":0.12,"moral":4},
    },
    {
      texto: "Pedir cambio temprano",
      efectos: {"reputacion":-3,"moral":1},
    },
    ],
  },
  {
    id: "prime-prensa-transferencia",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "En Colombia dan por hecho tu pase. Todavía no hay nada.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "prime-cierre-eliminatorias",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Última fecha: clasifican o no. El vestuario está mudo.",
    opciones: [
    {
      texto: "Asumir el liderazgo",
      efectos: {"reputacion":10,"moral":6},
    },
    {
      texto: "Apoyar sin ser el centro",
      efectos: {"reputacion":5,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Priorizar tu rendimiento individual",
      efectos: {"atributos":{"tiro":1,"regate":1},"reputacion":-3,"moral":2},
    },
    ],
  },
  {
    id: "prime-amigo-ascenso",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Un amigo de cantera asciende en BetPlay y te pide un saludo viral.",
    opciones: [
    {
      texto: "Bancarlo en público",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Saludo privado",
      efectos: {"moral":3},
    },
    {
      texto: "No contestar",
      efectos: {"reputacion":-2,"moral":-1},
    },
    ],
  },
  {
    id: "prime-tecnico-club-colombia",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Te ofrecen dirigir juveniles 'el día que te retires' en tu club de origen.",
    opciones: [
    {
      texto: "Ilusionarte con ese futuro",
      efectos: {"moral":5,"reputacion":4},
    },
    {
      texto: "Enfocarte solo en jugar",
      efectos: {"atributos":{"tiro":1},"moral":2},
    },
    {
      texto: "Pedir un rol ya de mentor",
      efectos: {"reputacion":5,"moral":3},
    },
    ],
  },
  {
    id: "prime-gol-contra-argentina-br",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Noche grande vs un grande sudamericano con Selección.",
    opciones: [
    {
      texto: "Buscar el protagonismo",
      efectos: {"atributos":{"tiro":2,"ritmo":1},"moral":8,"reputacion":8},
    },
    {
      texto: "Jugar para el equipo",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":6,"reputacion":9},
    },
    {
      texto: "Evitar riesgos",
      efectos: {"moral":2,"reputacion":2},
    },
    ],
  },
  {
    id: "prime-critica-rendimiento-copa",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Tras una Copa floja, piden tu retiro de la Selección.",
    opciones: [
    {
      texto: "Hablar con respeto y bajar el perfil",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Entrar al cruce y defenderte",
      efectos: {"reputacion":-5,"moral":4},
    },
    {
      texto: "Ignorar y responder en la cancha",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":5,"reputacion":3},
    },
    ],
  },
  {
    id: "prime-visita-barrio",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Volvés al barrio y armás un picado con pibes.",
    opciones: [
    {
      texto: "Ir y quedarte un buen rato",
      efectos: {"reputacion":10,"moral":8},
    },
    {
      texto: "Ir 20 minutos",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Solo donar materiales",
      efectos: {"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "prime-camiseta-seleccion-subasta",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Subastan tu camiseta de Selección por una causa.",
    opciones: [
    {
      texto: "Donar y difundir",
      efectos: {"reputacion":9,"moral":6},
    },
    {
      texto: "Donar en silencio",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Pedir porcentaje",
      efectos: {"reputacion":-6,"moral":1},
    },
    ],
  },
  {
    id: "pri-extra-001",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Esta semana cambia el panorama: en Selección la hinchada te corea el apellido.",
    opciones: [
    {
      texto: "Asumir el protagonismo",
      efectos: {"atributos":{"tiro":2,"regate":1},"moral":12,"reputacion":10},
    },
    {
      texto: "Repartir juego",
      efectos: {"atributos":{"pase":3},"moral":8,"reputacion":12},
    },
    {
      texto: "Te trabás por la presión",
      efectos: {"moral":-8,"reputacion":-4},
    },
    ],
  },
  {
    id: "pri-extra-002",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Sin esperarlo, te invitan a opinar del clásico de la capital en vivo.",
    opciones: [
    {
      texto: "Hablar con respeto de ambos",
      efectos: {"reputacion":8,"moral":3},
    },
    {
      texto: "Picar la controversia",
      efectos: {"reputacion":-6,"moral":5},
    },
    {
      texto: "Cancelar a último momento",
      efectos: {"reputacion":-2,"moral":1},
    },
    ],
  },
  {
    id: "pri-extra-003",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "En la interna del club, te proponen una fundación en tu barrio de origen.",
    opciones: [
    {
      texto: "Meterle tiempo y plata de verdad",
      efectos: {"reputacion":15,"moral":10},
    },
    {
      texto: "Poner el nombre y delegar",
      efectos: {"reputacion":5,"moral":2},
    },
    {
      texto: "Posponerlo",
      efectos: {"reputacion":-3,"moral":-2},
    },
    ],
  },
  {
    id: "pri-extra-004",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "De un día para otro, lista de la mayor: estás en el límite del corte.",
    opciones: [
    {
      texto: "Hablar con el DT de Selección",
      efectos: {"reputacion":3,"moral":2},
    },
    {
      texto: "Rendir en el club y esperar",
      efectos: {"atributos":{"tiro":1,"fisico":1},"moral":4},
    },
    {
      texto: "Ansiedad mediática",
      efectos: {"moral":-6,"reputacion":-2},
    },
    ],
  },
  {
    id: "pri-extra-005",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "En medio de la pretemporada, tu agente pelea con un mega-agente por tu representación.",
    opciones: [
    {
      texto: "Mantener lealtad al que te descubrió",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Cambiar al grande",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Quedarte sin agente un tiempo",
      efectos: {"reputacion":-3,"moral":-2},
    },
    ],
  },
  {
    id: "pri-extra-006",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Con el calendario encima, el cuerpo técnico detecta que bajaste el nivel en entrenamientos.",
    opciones: [
    {
      texto: "Resetear hábitos y carga",
      efectos: {"atributos":{"fisico":3,"ritmo":2},"moral":4,"reputacion":5},
    },
    {
      texto: "Negar el problema",
      efectos: {"reputacion":-10,"moral":-5,"atributos":{"fisico":-2}},
    },
    {
      texto: "Pedir un plan personalizado",
      efectos: {"atributos":{"fisico":2},"moral":6,"reputacion":4},
    },
    ],
  },
  {
    id: "pri-extra-007",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Cuando más necesitabas foco, amistoso de Selección vs recuperación de club.",
    opciones: [
    {
      texto: "Priorizar la Selección",
      efectos: {"reputacion":12,"moral":10},
    },
    {
      texto: "Priorizar el club",
      efectos: {"reputacion":3,"moral":-5},
    },
    {
      texto: "Intentar cumplir ambos calendarios",
      efectos: {"atributos":{"fisico":-2},"riesgoLesion":0.18,"reputacion":5,"moral":2},
    },
    ],
  },
  {
    id: "pri-extra-008",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "El club ofrece renovación a tope salarial... o salida.",
    opciones: [
    {
      texto: "Negociar con cabeza fría",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "Presionar por más plata ya",
      efectos: {"reputacion":-6,"moral":2},
    },
    {
      texto: "Priorizar minutos y proyecto",
      efectos: {"reputacion":4,"moral":5,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "pri-extra-009",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Esta semana cambia el panorama: convertís en Eliminatoria. El país explota.",
    opciones: [
    {
      texto: "Celebrar con el grupo",
      efectos: {"reputacion":12,"moral":12},
    },
    {
      texto: "Celebración individual icónica",
      efectos: {"reputacion":8,"moral":10},
    },
    {
      texto: "Dedicatoria polémica",
      efectos: {"reputacion":-4,"moral":8},
    },
    ],
  },
  {
    id: "pri-extra-010",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Sin esperarlo, tu entorno familiar arma un 'clan' que habla por vos.",
    opciones: [
    {
      texto: "Poner límites claros",
      efectos: {"reputacion":6,"moral":2},
    },
    {
      texto: "Dejarlos manejar la imagen",
      efectos: {"reputacion":-4,"moral":3},
    },
    {
      texto: "Delegar todo al agente",
      efectos: {"reputacion":3,"moral":1},
    },
    ],
  },
  {
    id: "pri-extra-011",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "En la interna del club, 50 partidos en la temporada: el cuerpo pide tregua.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "pri-extra-012",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "De un día para otro, jugar Eliminatoria en Barranquilla: calor y presión.",
    opciones: [
    {
      texto: "Protocolo de hidratación y foco",
      efectos: {"atributos":{"fisico":2},"moral":5,"reputacion":4},
    },
    {
      texto: "Dejarte llevar por el ambiente",
      efectos: {"moral":8,"riesgoLesion":0.08},
    },
    {
      texto: "Pedir relevo si aflojás",
      efectos: {"moral":1,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-extra-013",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "En medio de la pretemporada, un pibe de 19 te come el puesto en rachas.",
    opciones: [
    {
      texto: "Mentorearlo y competir",
      efectos: {"reputacion":10,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Pedir no rotar",
      efectos: {"reputacion":-5,"moral":1},
    },
    {
      texto: "Aceptar minutos compartidos",
      efectos: {"reputacion":5,"moral":2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "pri-extra-014",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Con el calendario encima, te comparan con un ídolo histórico de tu club de origen.",
    opciones: [
    {
      texto: "Agradecer y bajar expectativas",
      efectos: {"reputacion":7,"moral":3},
    },
    {
      texto: "Aceptar la comparación",
      efectos: {"moral":6,"atributos":{"tiro":1}},
    },
    {
      texto: "Pedír que no comparen",
      efectos: {"reputacion":3,"moral":1},
    },
    ],
  },
  {
    id: "pri-extra-015",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Cuando más necesitabas foco, entrevista internacional: preguntan por tu legado.",
    opciones: [
    {
      texto: "Hablar de trabajo y equipo",
      efectos: {"reputacion":8,"moral":4},
    },
    {
      texto: "Hablar de tu yo individual",
      efectos: {"reputacion":2,"moral":3},
    },
    {
      texto: "Evitar la entrevista",
      efectos: {"reputacion":-2,"moral":1},
    },
    ],
  },
  {
    id: "pri-extra-016",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Echan al DT que te bancaba. Entra uno frío con vos.",
    opciones: [
    {
      texto: "Ganarte al nuevo",
      efectos: {"atributos":{"fisico":2,"defensa":1},"moral":3,"reputacion":4},
    },
    {
      texto: "Pedir salida",
      efectos: {"reputacion":-3,"moral":-4},
    },
    {
      texto: "Esperar el mercado",
      efectos: {"moral":-2,"reputacion":1},
    },
    ],
  },
  {
    id: "pri-extra-017",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "Esta semana cambia el panorama: volvés a un clásico paisa años después.",
    opciones: [
    {
      texto: "Salir a pelear cada balón",
      efectos: {"atributos":{"fisico":2,"defensa":1},"reputacion":6,"riesgoLesion":0.12},
    },
    {
      texto: "Jugar con inteligencia",
      efectos: {"atributos":{"pase":2},"reputacion":4,"moral":4},
    },
    {
      texto: "Buscar la jugada individual",
      efectos: {"atributos":{"regate":2,"tiro":1},"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "pri-extra-018",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "Sin esperarlo, corre un rumor infame sobre sustancias. Es falso.",
    opciones: [
    {
      texto: "Demandar / responder legal",
      efectos: {"reputacion":5,"moral":-3},
    },
    {
      texto: "Ignorar y rendir",
      efectos: {"atributos":{"tiro":1},"moral":4,"reputacion":3},
    },
    {
      texto: "Estallar en redes",
      efectos: {"reputacion":-8,"moral":2},
    },
    ],
  },
  {
    id: "pri-extra-019",
    tramoCarrera: "prime",
    categoria: "colombia_especifico",
    texto: "En la interna del club, te lesionás en un microciclo de Selección; el club se enoja.",
    opciones: [
    {
      texto: "Transparencia total",
      efectos: {"reputacion":5,"moral":-3},
    },
    {
      texto: "Acelerar vuelta al club",
      efectos: {"riesgoLesion":0.22,"moral":2,"atributos":{"fisico":-2}},
    },
    {
      texto: "Priorizar recuperación larga",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":3},
    },
    ],
  },
  {
    id: "pri-extra-020",
    tramoCarrera: "prime",
    categoria: "generico",
    texto: "De un día para otro, pretemporada de infierno en altura / calor.",
    opciones: [
    {
      texto: "Entrenar al límite",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":-3,"riesgoLesion":0.12},
    },
    {
      texto: "Cargar con recuperación seria",
      efectos: {"atributos":{"fisico":2},"moral":2,"riesgoLesion":0.04},
    },
    {
      texto: "Bajar la intensidad",
      efectos: {"reputacion":-2,"moral":3},
    },
    ],
  },
  {
    id: "vet-banco",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Pasás más tiempo en el banco. El técnico prioriza juventud.",
    opciones: [
    {
      texto: "Aceptar el rol y empujar desde adentro",
      efectos: {"reputacion":8,"moral":2,"atributos":{"pase":1}},
    },
    {
      texto: "Pedir transferencia ya",
      efectos: {"reputacion":-4,"moral":-6,"transferencia":"mismo_nivel"},
    },
    {
      texto: "Pelear el puesto en cada entrenamiento",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":4,"riesgoLesion":0.12},
    },
    ],
  },
  {
    id: "vet-mentoria",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Te piden mentoría formal para los juveniles.",
    opciones: [
    {
      texto: "Dedicarle tiempo serio",
      efectos: {"reputacion":12,"moral":8},
    },
    {
      texto: "Ayudar solo cuando sobra energía",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Rechazar: todavía te sentís titular",
      efectos: {"reputacion":-5,"moral":1},
    },
    ],
  },
  {
    id: "vet-retiro-oferta",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "El club sugiere retiro con homenaje a fin de temporada.",
    opciones: [
    {
      texto: "Aceptar y planear la despedida",
      efectos: {"reputacion":10,"moral":5,"riesgoFinCarrera":0.4},
    },
    {
      texto: "Pedir un año más",
      efectos: {"moral":6,"atributos":{"fisico":-1},"riesgoLesion":0.1},
    },
    {
      texto: "Buscar otro club",
      efectos: {"reputacion":2,"moral":3,"transferencia":"mismo_nivel"},
    },
    ],
  },
  {
    id: "vet-lesion-cronica",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "El dolor crónico ya no se va con hielo.",
    opciones: [
    {
      texto: "Forzar el regreso",
      efectos: {"moral":3,"riesgoLesion":0.28,"riesgoFinCarrera":0.04,"atributos":{"fisico":-2}},
    },
    {
      texto: "Respetar los tiempos médicos",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":4},
    },
    {
      texto: "Usar el tiempo para video y técnica",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":4},
    },
    ],
  },
  {
    id: "vet-peso-forma",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Te cuesta mantener peso y velocidad.",
    opciones: [
    {
      texto: "Nutricionista y doble gym",
      efectos: {"atributos":{"fisico":2,"ritmo":1},"moral":3,"riesgoLesion":0.08},
    },
    {
      texto: "Aceptar declive y ajustar estilo",
      efectos: {"atributos":{"pase":2,"tiro":1,"ritmo":-2},"moral":2},
    },
    {
      texto: "Ignorar alertas",
      efectos: {"atributos":{"fisico":-3,"ritmo":-2},"moral":-4,"riesgoLesion":0.2},
    },
    ],
  },
  {
    id: "vet-inversion",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Socio te propone negocio fuera del fútbol.",
    opciones: [
    {
      texto: "Diversificar con asesores",
      efectos: {"reputacion":4,"moral":5},
    },
    {
      texto: "Meter plata sin revisar",
      efectos: {"reputacion":-6,"moral":-8,"riesgoFinCarrera":0.05},
    },
    {
      texto: "Foco en el campo",
      efectos: {"moral":2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "vet-contrato-corto",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Solo te ofrecen 6 meses.",
    opciones: [
    {
      texto: "Negociar con cabeza fría",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "Presionar por más plata ya",
      efectos: {"reputacion":-6,"moral":2},
    },
    {
      texto: "Priorizar minutos y proyecto",
      efectos: {"reputacion":4,"moral":5,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "vet-rol-entrenador-asistente",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Te ofrecen ser ayudante-jugador.",
    opciones: [
    {
      texto: "Aceptar el doble rol",
      efectos: {"reputacion":8,"moral":4,"atributos":{"pase":1}},
    },
    {
      texto: "Solo jugador",
      efectos: {"moral":2,"atributos":{"tiro":1}},
    },
    {
      texto: "Pasar a cuerpo técnico ya",
      efectos: {"reputacion":5,"moral":3,"riesgoFinCarrera":0.25},
    },
    ],
  },
  {
    id: "vet-pibe-te-reemplaza",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "El 9/8/10 joven te reemplaza y rinde.",
    opciones: [
    {
      texto: "Acompañarlo",
      efectos: {"reputacion":10,"moral":4},
    },
    {
      texto: "Competir seco",
      efectos: {"atributos":{"fisico":1},"moral":3,"reputacion":2},
    },
    {
      texto: "Amargarte",
      efectos: {"moral":-10,"reputacion":-4},
    },
    ],
  },
  {
    id: "vet-partido-despedida-otro",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Te invitan a la despedida de un ídolo rival.",
    opciones: [
    {
      texto: "Ir por respeto",
      efectos: {"reputacion":6,"moral":4},
    },
    {
      texto: "No ir",
      efectos: {"reputacion":-2,"moral":1},
    },
    {
      texto: "Mandar saludo",
      efectos: {"reputacion":3,"moral":2},
    },
    ],
  },
  {
    id: "vet-reduccion-sueldo",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Te proponen renovar a mitad de sueldo.",
    opciones: [
    {
      texto: "Negociar con cabeza fría",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "Presionar por más plata ya",
      efectos: {"reputacion":-6,"moral":2},
    },
    {
      texto: "Priorizar minutos y proyecto",
      efectos: {"reputacion":4,"moral":5,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "vet-viaje-suplente",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Viajás de suplente eterno en el banco.",
    opciones: [
    {
      texto: "Ser profesional igual",
      efectos: {"reputacion":7,"moral":2},
    },
    {
      texto: "Pedir no viajar",
      efectos: {"reputacion":-4,"moral":2},
    },
    {
      texto: "Usar viajes para mentoría",
      efectos: {"reputacion":8,"moral":5},
    },
    ],
  },
  {
    id: "vet-charla-retiro",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Tu familia te pregunta cuándo colgás.",
    opciones: [
    {
      texto: "Definir una fecha mental",
      efectos: {"moral":4,"reputacion":2},
    },
    {
      texto: "Seguir sin fecha",
      efectos: {"moral":2,"riesgoLesion":0.08},
    },
    {
      texto: "Enojarte por la pregunta",
      efectos: {"moral":-5,"reputacion":-1},
    },
    ],
  },
  {
    id: "vet-lesion-ultima",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "El médico dice: 'otra igual y se complica la vida post fútbol'.",
    opciones: [
    {
      texto: "Retirarte",
      efectos: {"reputacion":6,"moral":-3,"riesgoFinCarrera":0.55},
    },
    {
      texto: "Arriesgar una temporada más",
      efectos: {"moral":4,"riesgoLesion":0.25,"riesgoFinCarrera":0.12},
    },
    {
      texto: "Bajar carga radicalmente",
      efectos: {"atributos":{"fisico":1,"ritmo":-2},"moral":2,"reputacion":3},
    },
    ],
  },
  {
    id: "vet-podcast",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Te ofrecen un podcast de leyendas.",
    opciones: [
    {
      texto: "Empezar a construir marca",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Esperar al retiro",
      efectos: {"moral":2},
    },
    {
      texto: "Rechazar",
      efectos: {"moral":1},
    },
    ],
  },
  {
    id: "vet-amistoso-masters",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Torneo masters / celebridades te tienta.",
    opciones: [
    {
      texto: "Jugar priorizando salud",
      efectos: {"reputacion":4,"moral":4,"riesgoLesion":0.08},
    },
    {
      texto: "No jugar",
      efectos: {"atributos":{"fisico":1},"moral":1},
    },
    {
      texto: "Ir a muerte",
      efectos: {"moral":5,"riesgoLesion":0.2,"riesgoFinCarrera":0.06},
    },
    ],
  },
  {
    id: "vet-staff-medico",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "El staff sugiere que ya no aguantás 2 partidos por semana.",
    opciones: [
    {
      texto: "Aceptar planificación",
      efectos: {"atributos":{"fisico":1},"reputacion":4,"moral":2},
    },
    {
      texto: "Pedir igual los 90'",
      efectos: {"moral":3,"riesgoLesion":0.15},
    },
    {
      texto: "Buscar liga menos exigente",
      efectos: {"moral":3,"reputacion":2,"transferencia":"liga_menos_exigente"},
    },
    ],
  },
  {
    id: "vet-homenaje-silencioso",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "El club no planea homenaje. Te duele.",
    opciones: [
    {
      texto: "No pedirlo",
      efectos: {"reputacion":5,"moral":-3},
    },
    {
      texto: "Pedírlo con elegancia",
      efectos: {"reputacion":2,"moral":2},
    },
    {
      texto: "Filtrar el enojo",
      efectos: {"reputacion":-8,"moral":-2},
    },
    ],
  },
  {
    id: "vet-regreso-colombia",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Suena un regreso a la Liga BetPlay 'para cerrar el círculo'.",
    opciones: [
    {
      texto: "Volver al club de origen",
      efectos: {"reputacion":14,"moral":12,"transferencia":"club_origen"},
    },
    {
      texto: "Volver a un rival histórico",
      efectos: {"reputacion":-8,"moral":4,"transferencia":"colombia_rival"},
    },
    {
      texto: "Seguir afuera un año más",
      efectos: {"reputacion":2,"moral":1},
    },
    ],
  },
  {
    id: "vet-prensa-legado",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "En TV te preguntan cómo querés que te recuerden.",
    opciones: [
    {
      texto: "Como un profesional serio",
      efectos: {"reputacion":8,"moral":4},
    },
    {
      texto: "Como un ídolo de hinchada",
      efectos: {"reputacion":6,"moral":8},
    },
    {
      texto: "Como alguien que dio todo por la Selección",
      efectos: {"reputacion":10,"moral":6},
    },
    ],
  },
  {
    id: "vet-despedida-seleccion",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "La Federación sugiere una despedida simbólica con la Selección.",
    opciones: [
    {
      texto: "Aceptar el homenaje",
      efectos: {"reputacion":12,"moral":10},
    },
    {
      texto: "Irte sin ruido",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Pedir una última Eliminatoria",
      efectos: {"moral":6,"atributos":{"fisico":-1},"riesgoLesion":0.1},
    },
    ],
  },
  {
    id: "vet-ultimo-clasico",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Puede ser tu último clásico en Colombia.",
    opciones: [
    {
      texto: "A morir, como una final",
      efectos: {"moral":10,"reputacion":8,"riesgoLesion":0.18,"atributos":{"fisico":-1}},
    },
    {
      texto: "Con inteligencia y liderazgo",
      efectos: {"atributos":{"pase":2},"reputacion":10,"moral":6},
    },
    {
      texto: "Dejar minutos a un joven",
      efectos: {"reputacion":12,"moral":4},
    },
    ],
  },
  {
    id: "vet-dt-betplay",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Te ofrecen dirigir en BetPlay apenas te retires.",
    opciones: [
    {
      texto: "Aceptar el plan",
      efectos: {"reputacion":7,"moral":6},
    },
    {
      texto: "Estudiar primero licencia",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "No te interesa dirigir",
      efectos: {"moral":2},
    },
    ],
  },
  {
    id: "vet-comentario-emisoras",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Te ofrecen ser panelista en emisoras colombianas.",
    opciones: [
    {
      texto: "Empezar de a poco",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "Esperar al retiro",
      efectos: {"moral":2},
    },
    {
      texto: "Rechazar",
      efectos: {"moral":1},
    },
    ],
  },
  {
    id: "vet-camiseta-origen",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "El club de origen retira tu dorsal simbólicamente.",
    opciones: [
    {
      texto: "Aceptar emocionado",
      efectos: {"reputacion":12,"moral":10},
    },
    {
      texto: "Pedir que lo usen juveniles",
      efectos: {"reputacion":14,"moral":8},
    },
    {
      texto: "Restarle importancia",
      efectos: {"reputacion":4,"moral":2},
    },
    ],
  },
  {
    id: "vet-picado-barrio-final",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Último picado en el barrio antes de decidir el retiro.",
    opciones: [
    {
      texto: "Disfrutar y cuidar el cuerpo",
      efectos: {"moral":8,"riesgoLesion":0.05},
    },
    {
      texto: "No ir",
      efectos: {"moral":1},
    },
    {
      texto: "Jugar como a los 18",
      efectos: {"moral":6,"riesgoLesion":0.2,"riesgoFinCarrera":0.08},
    },
    ],
  },
  {
    id: "vet-seleccion-emergencia",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Lesiones en la mayor: te tientan a una convocatoria exprés.",
    opciones: [
    {
      texto: "Ir si el cuerpo aguanta",
      efectos: {"reputacion":10,"moral":8,"riesgoLesion":0.12},
    },
    {
      texto: "Ceder el lugar a un joven",
      efectos: {"reputacion":12,"moral":5},
    },
    {
      texto: "Retirarte de la Selección ahora",
      efectos: {"reputacion":6,"moral":2,"riesgoFinCarrera":0.15},
    },
    ],
  },
  {
    id: "vet-libro-colombia",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Una editorial colombiana quiere tu biografía completa.",
    opciones: [
    {
      texto: "Hacerla con rigor",
      efectos: {"reputacion":7,"moral":5},
    },
    {
      texto: "Hacerla light",
      efectos: {"reputacion":3,"moral":3},
    },
    {
      texto: "Esperar",
      efectos: {"moral":2},
    },
    ],
  },
  {
    id: "vet-clásico-banca",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "En el clásico te dejan en la banca y la hinchada pide tu entrada.",
    opciones: [
    {
      texto: "Entrar y aportar 20 minutos",
      efectos: {"reputacion":6,"moral":5,"atributos":{"pase":1}},
    },
    {
      texto: "Aceptar el plan del DT",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Molestarte en el banco",
      efectos: {"reputacion":-5,"moral":-4},
    },
    ],
  },
  {
    id: "vet-despedida-betplay",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Arman tu despedida en un estadio BetPlay.",
    opciones: [
    {
      texto: "Vivir el momento",
      efectos: {"reputacion":12,"moral":12,"riesgoFinCarrera":0.35},
    },
    {
      texto: "Pedir partido simple sin circus",
      efectos: {"reputacion":6,"moral":5},
    },
    {
      texto: "Posponer",
      efectos: {"moral":2},
    },
    ],
  },
  {
    id: "vet-extra-001",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Esta semana cambia el panorama: te piden mentoría formal para los juveniles.",
    opciones: [
    {
      texto: "Dedicarle tiempo serio",
      efectos: {"reputacion":12,"moral":8},
    },
    {
      texto: "Ayudar solo cuando sobra energía",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Rechazar: todavía te sentís titular",
      efectos: {"reputacion":-5,"moral":1},
    },
    ],
  },
  {
    id: "vet-extra-002",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Sin esperarlo, la Federación sugiere una despedida simbólica con la Selección.",
    opciones: [
    {
      texto: "Aceptar el homenaje",
      efectos: {"reputacion":12,"moral":10},
    },
    {
      texto: "Irte sin ruido",
      efectos: {"reputacion":4,"moral":2},
    },
    {
      texto: "Pedir una última Eliminatoria",
      efectos: {"moral":6,"atributos":{"fisico":-1},"riesgoLesion":0.1},
    },
    ],
  },
  {
    id: "vet-extra-003",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "En la interna del club, el dolor crónico ya no se va con hielo.",
    opciones: [
    {
      texto: "Forzar el regreso",
      efectos: {"moral":3,"riesgoLesion":0.28,"riesgoFinCarrera":0.04,"atributos":{"fisico":-2}},
    },
    {
      texto: "Respetar los tiempos médicos",
      efectos: {"atributos":{"fisico":2},"moral":-2,"reputacion":4},
    },
    {
      texto: "Usar el tiempo para video y técnica",
      efectos: {"atributos":{"pase":2,"defensa":1},"moral":4},
    },
    ],
  },
  {
    id: "vet-extra-004",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "De un día para otro, te ofrecen dirigir en BetPlay apenas te retires.",
    opciones: [
    {
      texto: "Aceptar el plan",
      efectos: {"reputacion":7,"moral":6},
    },
    {
      texto: "Estudiar primero licencia",
      efectos: {"reputacion":5,"moral":4},
    },
    {
      texto: "No te interesa dirigir",
      efectos: {"moral":2},
    },
    ],
  },
  {
    id: "vet-extra-005",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "En medio de la pretemporada, socio te propone negocio fuera del fútbol.",
    opciones: [
    {
      texto: "Diversificar con asesores",
      efectos: {"reputacion":4,"moral":5},
    },
    {
      texto: "Meter plata sin revisar",
      efectos: {"reputacion":-6,"moral":-8,"riesgoFinCarrera":0.05},
    },
    {
      texto: "Foco en el campo",
      efectos: {"moral":2,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "vet-extra-006",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Con el calendario encima, solo te ofrecen 6 meses.",
    opciones: [
    {
      texto: "Negociar con cabeza fría",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "Presionar por más plata ya",
      efectos: {"reputacion":-6,"moral":2},
    },
    {
      texto: "Priorizar minutos y proyecto",
      efectos: {"reputacion":4,"moral":5,"atributos":{"fisico":1}},
    },
    ],
  },
  {
    id: "vet-extra-007",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Cuando más necesitabas foco, último picado en el barrio antes de decidir el retiro.",
    opciones: [
    {
      texto: "Disfrutar y cuidar el cuerpo",
      efectos: {"moral":8,"riesgoLesion":0.05},
    },
    {
      texto: "No ir",
      efectos: {"moral":1},
    },
    {
      texto: "Jugar como a los 18",
      efectos: {"moral":6,"riesgoLesion":0.2,"riesgoFinCarrera":0.08},
    },
    ],
  },
  {
    id: "vet-extra-008",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "El 9/8/10 joven te reemplaza y rinde.",
    opciones: [
    {
      texto: "Acompañarlo",
      efectos: {"reputacion":10,"moral":4},
    },
    {
      texto: "Competir seco",
      efectos: {"atributos":{"fisico":1},"moral":3,"reputacion":2},
    },
    {
      texto: "Amargarte",
      efectos: {"moral":-10,"reputacion":-4},
    },
    ],
  },
  {
    id: "vet-extra-009",
    tramoCarrera: "veteran",
    categoria: "colombia_especifico",
    texto: "Esta semana cambia el panorama: una editorial colombiana quiere tu biografía completa.",
    opciones: [
    {
      texto: "Hacerla con rigor",
      efectos: {"reputacion":7,"moral":5},
    },
    {
      texto: "Hacerla light",
      efectos: {"reputacion":3,"moral":3},
    },
    {
      texto: "Esperar",
      efectos: {"moral":2},
    },
    ],
  },
  {
    id: "vet-extra-010",
    tramoCarrera: "veteran",
    categoria: "generico",
    texto: "Sin esperarlo, te proponen renovar a mitad de sueldo.",
    opciones: [
    {
      texto: "Negociar con cabeza fría",
      efectos: {"reputacion":5,"moral":3},
    },
    {
      texto: "Presionar por más plata ya",
      efectos: {"reputacion":-6,"moral":2},
    },
    {
      texto: "Priorizar minutos y proyecto",
      efectos: {"reputacion":4,"moral":5,"atributos":{"fisico":1}},
    },
    ],
  },
];

export function getEventosByTramo(tramo: EventoDecision["tramoCarrera"]): EventoDecision[] {
  return EVENTOS_CARRERA.filter((e) => e.tramoCarrera === tramo);
}
