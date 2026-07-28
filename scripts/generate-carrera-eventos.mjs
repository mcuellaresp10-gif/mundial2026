/**
 * Genera src/data/carrera/eventos.ts con ~300 eventos.
 * Uso: node scripts/generate-carrera-eventos.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/data/carrera/eventos.ts");

/** @typedef {"cantera"|"consolidacion"|"prime"|"veteran"} Tramo */
/** @typedef {"generico"|"colombia_especifico"} Cat */

/**
 * @param {string} id
 * @param {Tramo} tramo
 * @param {Cat} cat
 * @param {string} texto
 * @param {{texto:string,efectos:object}[]} opciones
 */
function ev(id, tramo, cat, texto, opciones) {
  return { id, tramoCarrera: tramo, categoria: cat, texto, opciones };
}

const OPT = {
  trainHard: [
    { texto: "Entrenar al límite", efectos: { atributos: { fisico: 2, ritmo: 1 }, moral: -3, riesgoLesion: 0.12 } },
    { texto: "Cargar con recuperación seria", efectos: { atributos: { fisico: 2 }, moral: 2, riesgoLesion: 0.04 } },
    { texto: "Bajar la intensidad", efectos: { reputacion: -2, moral: 3 } },
  ],
  media: [
    { texto: "Hablar con respeto y bajar el perfil", efectos: { reputacion: 6, moral: 2 } },
    { texto: "Entrar al cruce y defenderte", efectos: { reputacion: -5, moral: 4 } },
    { texto: "Ignorar y responder en la cancha", efectos: { atributos: { tiro: 1, fisico: 1 }, moral: 5, reputacion: 3 } },
  ],
  leadership: [
    { texto: "Asumir el liderazgo", efectos: { reputacion: 10, moral: 6 } },
    { texto: "Apoyar sin ser el centro", efectos: { reputacion: 5, moral: 4, atributos: { pase: 1 } } },
    { texto: "Priorizar tu rendimiento individual", efectos: { atributos: { tiro: 1, regate: 1 }, reputacion: -3, moral: 2 } },
  ],
  injury: [
    { texto: "Forzar el regreso", efectos: { moral: 3, riesgoLesion: 0.28, riesgoFinCarrera: 0.04, atributos: { fisico: -2 } } },
    { texto: "Respetar los tiempos médicos", efectos: { atributos: { fisico: 2 }, moral: -2, reputacion: 4 } },
    { texto: "Usar el tiempo para video y técnica", efectos: { atributos: { pase: 2, defensa: 1 }, moral: 4 } },
  ],
  money: [
    { texto: "Negociar con cabeza fría", efectos: { reputacion: 5, moral: 3 } },
    { texto: "Presionar por más plata ya", efectos: { reputacion: -6, moral: 2 } },
    { texto: "Priorizar minutos y proyecto", efectos: { reputacion: 4, moral: 5, atributos: { fisico: 1 } } },
  ],
  family: [
    { texto: "Asumir la presión y entrenar más", efectos: { atributos: { fisico: 2 }, moral: -8, riesgoLesion: 0.08 } },
    { texto: "Hablar claro sin promesas vacías", efectos: { moral: 6, reputacion: 3 } },
    { texto: "Evadir el tema y refugiarte en el fútbol", efectos: { atributos: { regate: 1 }, moral: -3 } },
  ],
  colombiaClasico: [
    { texto: "Salir a pelear cada balón", efectos: { atributos: { fisico: 2, defensa: 1 }, reputacion: 6, riesgoLesion: 0.12 } },
    { texto: "Jugar con inteligencia", efectos: { atributos: { pase: 2 }, reputacion: 4, moral: 4 } },
    { texto: "Buscar la jugada individual", efectos: { atributos: { regate: 2, tiro: 1 }, reputacion: 4, moral: 2 } },
  ],
  selec: [
    { texto: "Priorizar la Selección", efectos: { reputacion: 12, moral: 10 } },
    { texto: "Priorizar el club", efectos: { reputacion: 3, moral: -5 } },
    { texto: "Intentar cumplir ambos calendarios", efectos: { atributos: { fisico: -2 }, riesgoLesion: 0.18, reputacion: 5, moral: 2 } },
  ],
};

/** Situaciones cantera genéricas */
const CAN_GEN = [
  ["can-estudio-vs-futbol", "Tu familia insiste en que no dejes el colegio. El técnico de la cantera quiere más dobles turnos.", [
    { texto: "Priorizar el fútbol y bajar horas de estudio", efectos: { atributos: { ritmo: 2, fisico: 2 }, moral: 5, reputacion: -3 } },
    { texto: "Equilibrar ambos y dormir menos", efectos: { atributos: { fisico: -1, pase: 1 }, moral: -5, riesgoLesion: 0.08 } },
    { texto: "Cumplir con el colegio y entrenar con cabeza", efectos: { atributos: { pase: 1 }, moral: 3, reputacion: 4 } },
  ]],
  ["can-primer-contrato", "Te ofrecen el primer contrato profesional. El representante urge firmar ya.", [
    { texto: "Firmar rápido por poco dinero", efectos: { reputacion: 5, moral: 8, atributos: { fisico: 1 } } },
    { texto: "Pedir asesoría legal antes de firmar", efectos: { reputacion: 8, moral: 2 } },
    { texto: "Rechazar y esperar una oferta mejor", efectos: { reputacion: -5, moral: -8 } },
  ]],
  ["can-presion-familiar", "En casa hacen cuentas con tu futuro. Sientes la presión de ser 'el que saque adelante'.", OPT.family],
  ["can-lesion-leve", "Sientes un pinchazo en el isquio en un partido de reserva.", OPT.injury],
  ["can-rival-cantera", "Un compañero de tu misma posición te gana el puesto en el próximo amistoso.", [
    { texto: "Trabajar el doble en silencio", efectos: { atributos: { ritmo: 2, fisico: 1 }, moral: 3 } },
    { texto: "Confrontar al técnico", efectos: { reputacion: -6, moral: -5 } },
    { texto: "Apoyar al compañero y pedir feedback", efectos: { reputacion: 5, moral: 6, atributos: { pase: 1 } } },
  ]],
  ["can-redes-sociales", "Empiezan a seguirte hinchas en redes. Un video tuyo se viraliza.", [
    { texto: "Cuidar la imagen y postear poco", efectos: { reputacion: 5, moral: 2 } },
    { texto: "Subir contenido todos los días", efectos: { reputacion: 8, moral: 4, atributos: { pase: -1 } } },
    { texto: "Ignorar redes por completo", efectos: { reputacion: -2, moral: 3 } },
  ]],
  ["can-agente-oportuno", "Un agente desconocido te aborda afuera de la sede: 'Te saco a Europa'.", [
    { texto: "Escucharlo con curiosidad", efectos: { moral: 2, reputacion: -2 } },
    { texto: "Avisar al club y rechazar el acercamiento", efectos: { reputacion: 10, moral: 1 } },
    { texto: "Dar tus datos sin consultar", efectos: { reputacion: -12, moral: 5, riesgoFinCarrera: 0.02 } },
  ]],
  ["can-doble-turno", "El preparador físico propone dobles turnos toda la semana.", OPT.trainHard],
  ["can-beca-estudios", "Te ofrecen una beca escolar condicionada a bajar minutos en el fin de semana.", [
    { texto: "Aceptar la beca y equilibrar", efectos: { reputacion: 4, moral: 3, atributos: { pase: 1 } } },
    { texto: "Rechazar: el fútbol es primero", efectos: { atributos: { ritmo: 2 }, moral: 4, reputacion: -2 } },
    { texto: "Negociar un plan mixto con el club", efectos: { reputacion: 6, moral: 5 } },
  ]],
  ["can-peso-comedor", "En el comedor de la sede te marcan que estás bajo de peso muscular.", [
    { texto: "Seguir un plan nutricional estricto", efectos: { atributos: { fisico: 3 }, moral: -2 } },
    { texto: "Comer más sin control", efectos: { atributos: { fisico: 1, ritmo: -1 }, moral: 2 } },
    { texto: "Pedir seguimiento del nutricionista", efectos: { atributos: { fisico: 2, ritmo: 1 }, moral: 3, reputacion: 2 } },
  ]],
  ["can-capitan-juvenil", "Te proponen ser capitán del equipo Sub-17.", OPT.leadership],
  ["can-novia-familia", "Tu pareja y tu familia pelean por tu tiempo libre los domingos.", OPT.family],
  ["can-viaje-largo-bus", "Viaje de 12 horas en bus a un torneo. Llegás destrozado.", [
    { texto: "Pedir titularidad igual", efectos: { reputacion: 3, moral: 2, riesgoLesion: 0.1, atributos: { fisico: -1 } } },
    { texto: "Entrar desde el banco", efectos: { moral: 4, atributos: { fisico: 1 } } },
    { texto: "Ayudar a los más chicos a adaptarse", efectos: { reputacion: 6, moral: 5 } },
  ]],
  ["can-prueba-otro-club", "Otro club BetPlay te invita a una prueba 'sin que se entere tu sede'.", [
    { texto: "Avisar a tu club y rechazar", efectos: { reputacion: 10, moral: 1 } },
    { texto: "Ir a mirar sin comprometerte", efectos: { reputacion: -4, moral: 2 } },
    { texto: "Ir a fondo por el cambio", efectos: { reputacion: -10, moral: 6 } },
  ]],
  ["can-tecnico-grita", "El técnico te retira al descanso gritando. El camerino se queda callado.", [
    { texto: "Pedir disculpas al día siguiente", efectos: { reputacion: 5, moral: 2 } },
    { texto: "Responderle de frente", efectos: { reputacion: -12, moral: -6 } },
    { texto: "Hablar en privado y pedir explicaciones", efectos: { reputacion: 4, moral: 4, atributos: { pase: 1 } } },
  ]],
  ["can-zapatos-rotos", "Se te rompen los botines antes de un partido importante. No hay recambio de tu talle.", [
    { texto: "Pedir prestados aunque duelan", efectos: { moral: 3, riesgoLesion: 0.1, reputacion: 2 } },
    { texto: "Insistir en no jugar así", efectos: { reputacion: -2, moral: -3 } },
    { texto: "Improvisar con cinta y aguantar", efectos: { atributos: { fisico: 1 }, moral: 5, riesgoLesion: 0.08 } },
  ]],
  ["can-amigo-abandona", "Tu mejor amigo de la cantera cuelga los botines. Te pide consejo.", [
    { texto: "Apoyarlo y seguir tu camino", efectos: { moral: 4, reputacion: 3 } },
    { texto: "Dudar y plantearte lo mismo", efectos: { moral: -10, atributos: { ritmo: -1 } } },
    { texto: "Convencerlo de seguir un mes más", efectos: { moral: 2, reputacion: 2 } },
  ]],
  ["can-horario-madrugada", "Te cambian el turno de entrenamiento a las 5:30 a.m.", OPT.trainHard],
  ["can-videoanalisis", "El analista te marca errores de posicionamiento en video.", [
    { texto: "Estudiar cada clip", efectos: { atributos: { defensa: 2, pase: 1 }, moral: 3 } },
    { texto: "Restarle importancia", efectos: { reputacion: -4, moral: 1 } },
    { texto: "Pedir sesiones extra uno a uno", efectos: { atributos: { defensa: 2, fisico: 1 }, reputacion: 4, moral: 4 } },
  ]],
  ["can-padre-tecnico", "Tu papá discute con el técnico en la puerta de la sede.", [
    { texto: "Separarlos y pedir que no vuelva a pasar", efectos: { reputacion: 6, moral: -2 } },
    { texto: "Quedarte callado", efectos: { reputacion: -3, moral: -4 } },
    { texto: "Hablar después solo con tu papá", efectos: { moral: 5, reputacion: 2 } },
  ]],
  ["can-prueba-fisica", "Batería de tests físicos: fallás por poco el mínimo de resistencia.", [
    { texto: "Repetir el test a muerte", efectos: { atributos: { fisico: 2, ritmo: 1 }, riesgoLesion: 0.1, moral: 2 } },
    { texto: "Pedir un plan de 4 semanas", efectos: { atributos: { fisico: 2 }, moral: 4, reputacion: 3 } },
    { texto: "Echarle la culpa al calor", efectos: { reputacion: -5, moral: -2 } },
  ]],
  ["can-internado", "Te ofrecen vivir en el internado de la cantera lejos de casa.", [
    { texto: "Aceptar para enfocarte", efectos: { atributos: { fisico: 2, ritmo: 1 }, moral: -4, reputacion: 4 } },
    { texto: "Quedarte en casa y viajar", efectos: { moral: 5, atributos: { fisico: -1 } } },
    { texto: "Probar tres meses y evaluar", efectos: { reputacion: 3, moral: 3 } },
  ]],
  ["can-apuesta-companeros", "Compañeros apuestan plata en un amistoso interno. Te invitan.", [
    { texto: "Negarte y reportarlo", efectos: { reputacion: 8, moral: -2 } },
    { texto: "Negarte en silencio", efectos: { reputacion: 3, moral: 1 } },
    { texto: "Entrar 'por no quedar mal'", efectos: { reputacion: -15, moral: 2, riesgoFinCarrera: 0.05 } },
  ]],
  ["can-dieta-abuela", "Tu abuela te manda fiambre y gaseosa 'para que crezcas'.", [
    { texto: "Agradecer y seguir el plan del club", efectos: { atributos: { fisico: 1 }, moral: 3, reputacion: 2 } },
    { texto: "Comer todo por no ofenderla", efectos: { atributos: { ritmo: -1 }, moral: 5 } },
    { texto: "Explicarle el plan nutricional", efectos: { moral: 4, reputacion: 3 } },
  ]],
  ["can-lesion-companero", "Un compañero se lesiona feo y te piden marcar al rival más duro.", OPT.trainHard],
  ["can-examen-final", "Tenés final de colegio el mismo día de la semifinal juvenil.", [
    { texto: "Rendir el final y llegar tarde al partido", efectos: { reputacion: 2, moral: 2, atributos: { pase: 1 } } },
    { texto: "Pedir aplazar el examen", efectos: { atributos: { ritmo: 1 }, moral: 3, reputacion: -1 } },
    { texto: "Priorizar el partido y ver el examen después", efectos: { atributos: { tiro: 1 }, reputacion: -3, moral: 4 } },
  ]],
  ["can-sueño-europa", "Ves un documental de un crack colombiano en Europa y no dormís.", [
    { texto: "Usar la motiva en el entrenamiento", efectos: { atributos: { ritmo: 2, fisico: 1 }, moral: 6 } },
    { texto: "Obsesionarte y ansietarte", efectos: { moral: -6, atributos: { pase: -1 } } },
    { texto: "Anotar metas realistas a 2 años", efectos: { reputacion: 3, moral: 5, atributos: { pase: 1 } } },
  ]],
  ["can-corte-plantel", "Anuncian corte de plantel: 5 se quedan afuera.", [
    { texto: "Enfocarte solo en tu rendimiento", efectos: { atributos: { fisico: 2 }, moral: 2 } },
    { texto: "Ayudar a un amigo en duda", efectos: { reputacion: 5, moral: 4 } },
    { texto: "Pedir reunión para saber tu status", efectos: { reputacion: 2, moral: -2 } },
  ]],
  ["can-entrenador-nuevo", "Llega un técnico nuevo que no te conoce de nada.", [
    { texto: "Demostrar en cada pelota", efectos: { atributos: { ritmo: 1, fisico: 1 }, moral: 4, reputacion: 3 } },
    { texto: "Esperar tu oportunidad en silencio", efectos: { moral: 1, atributos: { pase: 1 } } },
    { texto: "Quejarte con los veteranos", efectos: { reputacion: -7, moral: -3 } },
  ]],
  ["can-gol-vacio", "En un amistoso fallás solo frente al arco vacío. Se ríen.", [
    { texto: "Pedir el siguiente mano a mano", efectos: { atributos: { tiro: 2 }, moral: 5, reputacion: 2 } },
    { texto: "Bajar la cabeza el resto del partido", efectos: { moral: -10, atributos: { tiro: -1 } } },
    { texto: "Reírte y seguir", efectos: { moral: 4, reputacion: 3 } },
  ]],
];

const CAN_COL = [
  ["can-clasico-juvenil", "Juveniles: te toca el clásico regional. La hinchada local ya canta desde el entrenamiento.", OPT.colombiaClasico],
  ["can-prensa-local", "Un periodista deportivo local te pide una nota: '¿El próximo ídolo del club?'", [
    { texto: "Hablar con humildad y agradecer al club", efectos: { reputacion: 8, moral: 3 } },
    { texto: "Prometer títulos y goles", efectos: { reputacion: 2, moral: 5 } },
    { texto: "Negarte a declarar", efectos: { reputacion: -4, moral: -2 } },
  ]],
  ["can-viaje-interior", "Viaje largo por la cordillera para un cuadrangular juvenil.", [
    { texto: "Pedir ser titular igual", efectos: { reputacion: 3, moral: 2, riesgoLesion: 0.1, atributos: { fisico: -1 } } },
    { texto: "Descansar y entrar desde el banco", efectos: { moral: 4, atributos: { fisico: 1 } } },
    { texto: "Ayudar a los más chicos", efectos: { reputacion: 6, moral: 5 } },
  ]],
  ["can-hinchada-entrenamiento", "La barra aparece en un entrenamiento abierto y te pide foto y un gol.", [
    { texto: "Saludar con respeto y seguir entrenando", efectos: { reputacion: 6, moral: 4 } },
    { texto: "Prometerles un gol el domingo", efectos: { reputacion: 3, moral: 6 } },
    { texto: "Evitarlos por completo", efectos: { reputacion: -5, moral: -2 } },
  ]],
  ["can-himno-previa", "Antes del clásico juvenil te piden cantar el himno del club en el camerino.", [
    { texto: "Cantar a pleno", efectos: { reputacion: 5, moral: 6 } },
    { texto: "Acompañar sin forzar", efectos: { reputacion: 3, moral: 3 } },
    { texto: "Quedarte callado", efectos: { reputacion: -4, moral: -2 } },
  ]],
  ["can-derbi-barrial", "En tu barrio el derbi se vive en la esquina. Te paran a preguntar el once.", [
    { texto: "No filtrar nada del plantel", efectos: { reputacion: 7, moral: 2 } },
    { texto: "Tirar un 'soplo' inocente", efectos: { reputacion: -6, moral: 3 } },
    { texto: "Pedir que no te involucren", efectos: { moral: 2, reputacion: 2 } },
  ]],
  ["can-emisoras-am", "Una emisora AM dice que 'sos promesa o humo'. Tus tíos lo escuchan.", OPT.media],
  ["can-torneo-vereda", "Te invitan a un torneo de vereda con plata en juego el mismo fin de semana del oficial.", [
    { texto: "Rechazar y cuidar el cuerpo", efectos: { reputacion: 5, moral: 1, atributos: { fisico: 1 } } },
    { texto: "Jugar escondido", efectos: { reputacion: -12, moral: 4, riesgoLesion: 0.15, riesgoFinCarrera: 0.03 } },
    { texto: "Avisar al club y pedir permiso", efectos: { reputacion: 3, moral: 2 } },
  ]],
  ["can-seleccion-dpto", "Te citan a la selección departamental. El club duda en liberarte.", [
    { texto: "Insistir en ir", efectos: { reputacion: 8, moral: 8, atributos: { ritmo: 1 } } },
    { texto: "Quedarte con el club", efectos: { reputacion: 4, moral: -3 } },
    { texto: "Negociar fechas", efectos: { reputacion: 5, moral: 3 } },
  ]],
  ["can-cafe-cancha", "En un pueblo te invitan café y sancocho post partido con toda la junta.", [
    { texto: "Quedarte un rato y agradecer", efectos: { reputacion: 6, moral: 5 } },
    { texto: "Irte rápido a recuperar", efectos: { atributos: { fisico: 1 }, moral: 1 } },
    { texto: "Quedarte hasta tarde", efectos: { moral: 6, riesgoLesion: 0.06, atributos: { fisico: -1 } } },
  ]],
  ["can-lluvia-sintetica", "Lluvia tropical: la sintética está un lago. El árbitro pregunta si juegan.", [
    { texto: "Jugar igual", efectos: { atributos: { fisico: 1 }, moral: 4, riesgoLesion: 0.14 } },
    { texto: "Pedir suspensión", efectos: { reputacion: -2, moral: 2 } },
    { texto: "Adaptar el estilo y cuidar entradas", efectos: { atributos: { pase: 1, defensa: 1 }, moral: 3 } },
  ]],
  ["can-camiseta-10", "Te prestan la 10 del primer equipo para una foto solidaria.", [
    { texto: "Posar con humildad", efectos: { reputacion: 5, moral: 6 } },
    { texto: "Publicar como si ya fueras titular", efectos: { reputacion: -4, moral: 4 } },
    { texto: "Ceder el protagonismo a un nene de la fundación", efectos: { reputacion: 8, moral: 5 } },
  ]],
  ["can-copa-pony", "Rumores de convocatoria a un torneo nacional juvenil tipo Pony/interligas.", [
    { texto: "Enfocarte para entrar en la lista", efectos: { atributos: { ritmo: 2, tiro: 1 }, moral: 5 } },
    { texto: "No ilusionarte", efectos: { moral: 1 } },
    { texto: "Pedir feedback al técnico de si entrás", efectos: { reputacion: 2, moral: 2 } },
  ]],
  ["can-escalera-estadio", "Te mandan a cargar escaleras y cones en el estadio grande.", [
    { texto: "Hacerlo sin queja", efectos: { reputacion: 6, moral: 2, atributos: { fisico: 1 } } },
    { texto: "Quejarte: 'yo vine a jugar'", efectos: { reputacion: -8, moral: -3 } },
    { texto: "Organizar a los pibes para terminar rápido", efectos: { reputacion: 7, moral: 4 } },
  ]],
  ["can-gol-olimpico-sueno", "En la previa del clásico alguien bromea: 'hacé un olímpico'.", [
    { texto: "Tomarlo como chiste y enfocarte", efectos: { moral: 3, reputacion: 2 } },
    { texto: "Probar tiros de esquina en el entrenamiento", efectos: { atributos: { tiro: 2, pase: 1 }, moral: 4 } },
    { texto: "Prometerlo en redes", efectos: { reputacion: -3, moral: 5 } },
  ]],
  ["can-familia-roja-azul", "Tu familia está dividida entre dos grandes del país. Te piden foto con ambas camisetas.", [
    { texto: "No posar con ninguna rival", efectos: { reputacion: 5, moral: 2 } },
    { texto: "Hacer la gracia en privado", efectos: { moral: 4, reputacion: -2 } },
    { texto: "Pedir que no te metan en esa pelea", efectos: { moral: 5, reputacion: 3 } },
  ]],
  ["can-vallenato-vestuario", "En el micro ponen vallenato a todo volumen antes del partido.", [
    { texto: "Sumarte al mood", efectos: { moral: 5, reputacion: 2 } },
    { texto: "Pedí auriculares y concentrarte", efectos: { atributos: { pase: 1 }, moral: 2 } },
    { texto: "Pedir bajar el volumen", efectos: { reputacion: -3, moral: 1 } },
  ]],
  ["can-altitud-bogota", "Viaje a Bogotá: la altura te pega en el primer tiempo.", [
    { texto: "Pedir el cambio temprano", efectos: { moral: -2, atributos: { fisico: 1 } } },
    { texto: "Aguantar a muerte", efectos: { atributos: { fisico: 2 }, riesgoLesion: 0.1, moral: 4 } },
    { texto: "Gestionar esfuerzos y respiración", efectos: { atributos: { fisico: 1, pase: 1 }, moral: 3 } },
  ]],
  ["can-calor-costa", "Partido en la costa a 34°C y humedad absurda.", OPT.trainHard],
  ["can-entrevista-colegio", "El colegio quiere entrevistarte como 'ejemplo'. El club pide mensaje pro-estudios.", [
    { texto: "Hablar de esfuerzo y estudio", efectos: { reputacion: 7, moral: 3 } },
    { texto: "Hablar solo de fútbol", efectos: { reputacion: 2, moral: 4 } },
    { texto: "Cancelar por concentración", efectos: { reputacion: -2, moral: 1 } },
  ]],
];

/** Consolidación */
const CON_GEN = [
  ["con-titularidad", "El técnico te pone de titular por primera vez en Primera.", [
    { texto: "Jugar seguro, sin errores", efectos: { atributos: { defensa: 2, pase: 1 }, reputacion: 5 } },
    { texto: "Arriesgar para marcar diferencia", efectos: { atributos: { tiro: 2, regate: 2 }, reputacion: 8, moral: 5 } },
    { texto: "Priorizar no pelearte con los veteranos", efectos: { reputacion: 3, moral: 4 } },
  ]],
  ["con-oferta-exterior", "Rumor de interés desde el exterior. El club quiere renovarte ya.", OPT.money],
  ["con-lesion-muscular", "Te diagnostican una lesión muscular de tres semanas.", OPT.injury],
  ["con-conflicto-tecnico", "El técnico te saca al descanso y discutís en el túnel.", [
    { texto: "Pedir disculpas al día siguiente", efectos: { reputacion: 5, moral: 2 } },
    { texto: "Mantener la bronca en público", efectos: { reputacion: -15, moral: -8 } },
    { texto: "Hablar en privado y pedir explicaciones", efectos: { reputacion: 3, moral: 4, atributos: { pase: 1 } } },
  ]],
  ["con-bono-partido", "El plantel discute bono colectivo vs individuales.", [
    { texto: "Apoyar el bono colectivo", efectos: { reputacion: 8, moral: 6 } },
    { texto: "Pedir lo tuyo primero", efectos: { reputacion: -8, moral: 2 } },
    { texto: "Mediar entre las partes", efectos: { reputacion: 10, moral: 4 } },
  ]],
  ["con-cambio-sistema", "Llega un técnico nuevo con un sistema que no te favorece.", [
    { texto: "Adaptarte aunque baje tu brillo", efectos: { atributos: { defensa: 2, pase: 1 }, moral: -3, reputacion: 5 } },
    { texto: "Pedir salida en el mercado", efectos: { reputacion: -5, moral: -6 } },
    { texto: "Demostrar versatilidad", efectos: { atributos: { ritmo: 1, regate: 1, defensa: 1 }, moral: 5, reputacion: 6 } },
  ]],
  ["con-noche-salida", "Después de un triunfo el grupo quiere salir. Mañana hay entrenamiento.", [
    { texto: "Ir un rato y volver temprano", efectos: { moral: 4, riesgoLesion: 0.05 } },
    { texto: "Quedarte a dormir y recuperar", efectos: { atributos: { fisico: 1 }, moral: -2, reputacion: 3 } },
    { texto: "Cerrar el boliche con el plantel", efectos: { moral: 8, reputacion: -10, riesgoLesion: 0.12, atributos: { fisico: -2 } } },
  ]],
  ["con-mentor-veterano", "Un veterano te ofrece mentoría extra después de los entrenamientos.", [
    { texto: "Aceptar y absorber todo", efectos: { atributos: { pase: 2, defensa: 1 }, reputacion: 5, moral: 6 } },
    { texto: "Aceptar a medias", efectos: { atributos: { pase: 1 }, moral: 2 } },
    { texto: "Creer que no lo necesitás", efectos: { reputacion: -4, moral: 1 } },
  ]],
  ["con-banco-inesperado", "Después de 5 titularidades te mandan al banco sin explicación.", [
    { texto: "Trabajar y esperar", efectos: { atributos: { fisico: 1 }, moral: -3, reputacion: 3 } },
    { texto: "Pedir reunión inmediata", efectos: { reputacion: 2, moral: 1 } },
    { texto: "Filtrar bronca a la prensa", efectos: { reputacion: -14, moral: -5 } },
  ]],
  ["con-renovacion-baja", "Te ofrecen renovación por debajo de lo que esperabas.", OPT.money],
  ["con-redes-hate", "Después de un error, el hate en redes se descontrola.", OPT.media],
  ["con-representante-pelea", "Tu agente pelea con el club por una cláusula. Te piden que elijas bando.", [
    { texto: "Mediar en silencio", efectos: { reputacion: 6, moral: 2 } },
    { texto: "Bando agente", efectos: { reputacion: -5, moral: 3 } },
    { texto: "Bando club", efectos: { reputacion: 4, moral: -2 } },
  ]],
  ["con-gimnasio-extra", "El PF te pide gym extra nocturno tres veces por semana.", OPT.trainHard],
  ["con-posicion-nueva", "Te prueban en una posición distinta a la tuya.", [
    { texto: "Abrazar el cambio", efectos: { atributos: { defensa: 1, pase: 1, ritmo: 1 }, moral: 3, reputacion: 5 } },
    { texto: "Pedir volver a tu puesto natural", efectos: { reputacion: -2, moral: 2 } },
    { texto: "Hacerlo a regañadientes", efectos: { moral: -5, atributos: { tiro: -1 } } },
  ]],
  ["con-penalti-entrenamiento", "En la práctica de penales fallás tres seguidos.", [
    { texto: "Seguir pateando hasta meter", efectos: { atributos: { tiro: 2 }, moral: 3 } },
    { texto: "Parar y analizar la técnica", efectos: { atributos: { tiro: 2, pase: 1 }, moral: 2 } },
    { texto: "Dejarlo para otro día", efectos: { moral: -4, atributos: { tiro: -1 } } },
  ]],
  ["con-contrato-publicidad-chico", "Una marca local te ofrece un contrato chico pero exigente en posts.", [
    { texto: "Firmar y cumplir", efectos: { reputacion: 4, moral: 2 } },
    { texto: "Rechazar para no distraerte", efectos: { moral: 1, atributos: { fisico: 1 } } },
    { texto: "Firmar y postear a desgano", efectos: { reputacion: -4, moral: 3 } },
  ]],
  ["con-companero-celoso", "Un titular histórico te tira pases imposibles a propósito.", [
    { texto: "Hablarlo de frente", efectos: { reputacion: 4, moral: 3 } },
    { texto: "Ganarte su respeto en el campo", efectos: { atributos: { fisico: 1, defensa: 1 }, moral: 4 } },
    { texto: "Responder igual", efectos: { reputacion: -8, moral: -2 } },
  ]],
  ["con-viaje-concentrados", "Concentrados 48h antes: el hotel es un quilombo de ruido.", [
    { texto: "Pedir cambio de habitación", efectos: { moral: 3, reputacion: 1 } },
    { texto: "Aguantar y dormir con tapones", efectos: { atributos: { fisico: 1 }, moral: 1 } },
    { texto: "Quejarte en el grupo de WhatsApp", efectos: { reputacion: -5, moral: 2 } },
  ]],
  ["con-analisis-rival", "Te asignan exponer el análisis del rival en la charla técnica.", [
    { texto: "Prepararlo a fondo", efectos: { atributos: { pase: 1, defensa: 2 }, reputacion: 6, moral: 4 } },
    { texto: "Improvisar", efectos: { reputacion: -3, moral: 1 } },
    { texto: "Pedir que lo haga un veterano", efectos: { reputacion: -2, moral: -1 } },
  ]],
  ["con-tarjeta-roja", "Te echan por doble amarilla en un partido clave.", [
    { texto: "Asumir el error en conferencia", efectos: { reputacion: 5, moral: -4 } },
    { texto: "Echarle la culpa al árbitro", efectos: { reputacion: -8, moral: 1 } },
    { texto: "Trabajar la disciplina táctica", efectos: { atributos: { defensa: 2 }, moral: 3, reputacion: 4 } },
  ]],
  ["con-prestamo-posible", "El club evalúa cedarte a otro equipo para que sumes minutos.", [
    { texto: "Aceptar el préstamo", efectos: { moral: 4, atributos: { ritmo: 1, fisico: 1 }, reputacion: 2 } },
    { texto: "Pelear por quedarte", efectos: { reputacion: 3, moral: 2 } },
    { texto: "Pedir salida definitiva", efectos: { reputacion: -4, moral: 3 } },
  ]],
  ["con-sueldo-atrasado", "Corren rumores de sueldos atrasados en el plantel.", [
    { texto: "Mantener la calma y entrenar", efectos: { reputacion: 5, moral: -3 } },
    { texto: "Sumarte al reclamo colectivo", efectos: { reputacion: 2, moral: 2 } },
    { texto: "Filtrar a la prensa", efectos: { reputacion: -12, moral: 1 } },
  ]],
  ["con-dieta-estricta", "Te bajan grasa corporal con dieta muy dura.", [
    { texto: "Cumplir al 100%", efectos: { atributos: { ritmo: 2, fisico: 1 }, moral: -4 } },
    { texto: "Cumplir a medias", efectos: { atributos: { ritmo: 1 }, moral: 1 } },
    { texto: "Quejarte del hambre en público", efectos: { reputacion: -5, moral: 2 } },
  ]],
  ["con-hijos-plantel", "Varios del plantel tienen hijos; te invitan a un asado familiar.", [
    { texto: "Ir y fortalecer el grupo", efectos: { reputacion: 5, moral: 6 } },
    { texto: "Ir un rato", efectos: { moral: 3, reputacion: 2 } },
    { texto: "No ir: 'no es lo mío'", efectos: { reputacion: -3, moral: 1 } },
  ]],
  ["con-arquero-pelea", "Discusión fuerte con el arquero por una salida en falso (o al revés).", [
    { texto: "Resolverlo en el vestuario", efectos: { reputacion: 4, moral: 3 } },
    { texto: "Dejar que escale", efectos: { reputacion: -7, moral: -4 } },
    { texto: "Pedir mediación del capitán", efectos: { reputacion: 5, moral: 2 } },
  ]],
  ["con-gps-carga", "El GPS marca sobrecarga. El médico sugiere rotar.", [
    { texto: "Aceptar rotar", efectos: { atributos: { fisico: 2 }, moral: -2, reputacion: 3 } },
    { texto: "Insistir en jugar", efectos: { moral: 3, riesgoLesion: 0.16, reputacion: 2 } },
    { texto: "Pedir carga alternativa", efectos: { atributos: { fisico: 1 }, moral: 2 } },
  ]],
  ["con-entrevista-polemica", "En una entrevista te preguntan por un compañero en mala racha.", [
    { texto: "Bancarlo en público", efectos: { reputacion: 8, moral: 4 } },
    { texto: "Ser 'sincero' en exceso", efectos: { reputacion: -10, moral: 1 } },
    { texto: "Zafar con diplomacia", efectos: { reputacion: 4, moral: 2 } },
  ]],
  ["con-cambio-dorsal", "Te cambian el dorsal por uno menos mediático.", [
    { texto: "Aceptar sin drama", efectos: { reputacion: 4, moral: 2 } },
    { texto: "Pedir el número que querías", efectos: { reputacion: -3, moral: 1 } },
    { texto: "Usarlo como motiva", efectos: { atributos: { tiro: 1 }, moral: 5 } },
  ]],
  ["con-charla-motivacional", "Traen un speaker motivacional al predio. Algunos se burlan.", [
    { texto: "Tomarlo en serio", efectos: { moral: 6, reputacion: 3 } },
    { texto: "Seguir la corriente del chiste", efectos: { moral: 2, reputacion: -2 } },
    { texto: "Usar una idea concreta en tu rutina", efectos: { atributos: { fisico: 1 }, moral: 5, reputacion: 2 } },
  ]],
  ["con-revision-contrato", "Descubrís una cláusula rara en tu contrato.", [
    { texto: "Consultar abogado YA", efectos: { reputacion: 5, moral: 1 } },
    { texto: "Confiar en el agente", efectos: { moral: 2 } },
    { texto: "Confrontar al club enojado", efectos: { reputacion: -8, moral: -4 } },
  ]],
  ["con-suplente-ultimo-minuto", "Entras al 88' con el partido perdido. El técnico pide 'actitud'.", [
    { texto: "Correr cada balón", efectos: { atributos: { ritmo: 1, fisico: 1 }, reputacion: 5, moral: 3 } },
    { texto: "Hacer la mínima", efectos: { reputacion: -4, moral: -2 } },
    { texto: "Buscar una acción de calidad", efectos: { atributos: { tiro: 1, regate: 1 }, moral: 4 } },
  ]],
  ["con-vacaciones-cortas", "El fixture deja solo 5 días de receso.", OPT.trainHard],
  ["con-prueba-antidoping", "Control antidoping sorpresa a las 7 a.m.", [
    { texto: "Cumplir sin drama", efectos: { reputacion: 4, moral: 1 } },
    { texto: "Quejarte del horario", efectos: { reputacion: -3, moral: 1 } },
    { texto: "Acompañar a un compañero nervioso", efectos: { reputacion: 5, moral: 3 } },
  ]],
  ["con-gol-en-contra", "Provocás un autogol absurdo.", [
    { texto: "Levantar la mano y seguir", efectos: { moral: 4, reputacion: 5 } },
    { texto: "Desconectarte el resto del partido", efectos: { moral: -12, atributos: { defensa: -1 } } },
    { texto: "Pedir perdón a la hinchada al final", efectos: { reputacion: 7, moral: 2 } },
  ]],
  ["con-nuevo-companero-estrella", "Llega una estrella con sueldo mucho mayor al tuyo.", [
    { texto: "Aprender de él", efectos: { atributos: { pase: 1, regate: 1 }, moral: 3, reputacion: 4 } },
    { texto: "Competir de frente", efectos: { atributos: { fisico: 1, tiro: 1 }, moral: 4 } },
    { texto: "Amargarte en silencio", efectos: { moral: -8, reputacion: -2 } },
  ]],
  ["con-partido-lluvia", "Final bajo diluvio. El técnico pregunta quién quiere salir.", [
    { texto: "Quedarte sí o sí", efectos: { atributos: { fisico: 2 }, moral: 5, riesgoLesion: 0.1, reputacion: 4 } },
    { texto: "Salir si te lo piden", efectos: { moral: 1, reputacion: 1 } },
    { texto: "Pedir el cambio vos", efectos: { reputacion: -3, moral: 2 } },
  ]],
  ["con-capacitacion-finanzas", "El club ofrece taller de finanzas para jugadores jóvenes.", [
    { texto: "Asistir y aplicar", efectos: { reputacion: 4, moral: 3 } },
    { texto: "Mandar al agente", efectos: { moral: 1 } },
    { texto: "Skipearlo", efectos: { reputacion: -2, moral: 1 } },
  ]],
  ["con-lesion-leve-partido", "Te duele el tobillo pero el partido está 1-1.", OPT.injury],
  ["con-charla-capitan", "El capitán te llama aparte: 'el vestuario duda de tu compromiso'.", [
    { texto: "Escuchar y corregir", efectos: { reputacion: 6, moral: 2, atributos: { fisico: 1 } } },
    { texto: "Negar todo", efectos: { reputacion: -6, moral: -3 } },
    { texto: "Pedir ejemplos concretos", efectos: { reputacion: 3, moral: 1 } },
  ]],
  ["con-cambio-ciudad", "El club te pide mudarte cerca del predio.", [
    { texto: "Mudarte", efectos: { atributos: { fisico: 1 }, moral: -3, reputacion: 4 } },
    { texto: "Quedarte donde estás", efectos: { moral: 3, reputacion: -2 } },
    { texto: "Negociar ayuda de vivienda", efectos: { reputacion: 3, moral: 2 } },
  ]],
  ["con-partido-benefico", "Te piden jugar un benefico en día libre.", [
    { texto: "Jugar y sumar", efectos: { reputacion: 7, moral: 4, riesgoLesion: 0.06 } },
    { texto: "Ir pero pedir minutos limitados", efectos: { reputacion: 5, moral: 2 } },
    { texto: "No ir", efectos: { reputacion: -4, moral: 1 } },
  ]],
  ["con-tecnico-interino", "Echan al técnico; llega un interino amigo de otros.", [
    { texto: "Demostrar en entrenamientos", efectos: { atributos: { ritmo: 1, fisico: 1 }, moral: 3 } },
    { texto: "Esperar al definitivo", efectos: { moral: -2 } },
    { texto: "Lobby con dirigentes", efectos: { reputacion: -5, moral: 1 } },
  ]],
  ["con-meta-asistencias", "Te desafían a llegar a 10 asistencias en el semestre.", [
    { texto: "Enfocarte en el último pase", efectos: { atributos: { pase: 3, regate: 1 }, moral: 4 } },
    { texto: "Seguir natural", efectos: { moral: 2 } },
    { texto: "Forzar pases filtrados", efectos: { atributos: { pase: 1 }, reputacion: -2, moral: 2 } },
  ]],
  ["con-meta-goles", "La prensa te pone meta de 15 goles.", [
    { texto: "Usarlo como motiva", efectos: { atributos: { tiro: 2 }, moral: 5 } },
    { texto: "Ignorar la cifra", efectos: { moral: 2, reputacion: 2 } },
    { texto: "Ansiedad goleadora", efectos: { atributos: { tiro: 1, pase: -1 }, moral: -5 } },
  ]],
  ["con-rival-directo-fichaje", "Fichan a tu rival directo de posición.", [
    { texto: "Competir sano", efectos: { atributos: { fisico: 2 }, moral: 4, reputacion: 4 } },
    { texto: "Pedir transferencia", efectos: { reputacion: -3, moral: -4 } },
    { texto: "Dar la bienvenida y observar", efectos: { reputacion: 5, moral: 3 } },
  ]],
  ["con-sesion-yoga", "Incorporan yoga y mindfulness. El vestuario se parte.", [
    { texto: "Probar en serio", efectos: { moral: 5, atributos: { fisico: 1 } } },
    { texto: "Hacer lo mínimo", efectos: { moral: 1 } },
    { texto: "Burlarte del método", efectos: { reputacion: -4, moral: 2 } },
  ]],
  ["con-padre-agente", "Tu papá quiere meterse de agente 'para cuidarte'.", [
    { texto: "Mantener agente profesional", efectos: { reputacion: 4, moral: -2 } },
    { texto: "Darle un rol limitado", efectos: { moral: 3, reputacion: 1 } },
    { texto: "Dejarlo manejar todo", efectos: { reputacion: -3, moral: 4, riesgoFinCarrera: 0.02 } },
  ]],
];

const CON_COL = [
  ["con-convocatoria-sub20", "Suena tu nombre para la Sub-20 de Colombia. El club duda en liberarte.", [
    { texto: "Insistir en ir con la Selección", efectos: { reputacion: 10, moral: 10, atributos: { ritmo: 1 } } },
    { texto: "Priorizar el club esta vez", efectos: { reputacion: 4, moral: -4 } },
    { texto: "Negociar un acuerdo intermedio", efectos: { reputacion: 6, moral: 3 } },
  ]],
  ["con-clasico-paisa", "Semana de clásico. La ciudad se parte en dos.", [
    { texto: "Solo hablar de fútbol", efectos: { reputacion: 7, moral: 3 } },
    { texto: "Calentar el ambiente en redes", efectos: { reputacion: 4, moral: 6 } },
    { texto: "Bajar el perfil", efectos: { reputacion: 2, moral: 1 } },
  ]],
  ["con-prensa-critica", "Un columnista dice que 'todavía no estás para grandes noches'.", OPT.media],
  ["con-penal-fallado", "Fallás un penal decisivo frente a la hinchada local.", [
    { texto: "Pedir la pelota en el próximo", efectos: { moral: 6, reputacion: 5, atributos: { tiro: 2 } } },
    { texto: "Pedís disculpas públicas", efectos: { reputacion: 8, moral: -2 } },
    { texto: "Encerrarte y no hablar", efectos: { moral: -12, reputacion: -3 } },
  ]],
  ["con-derby-capital", "Te toca el clásico de la capital. Ambientazo.", OPT.colombiaClasico],
  ["con-emisora-opinologo", "En una emisora un opinólogo dice que 'te falta huevos'.", OPT.media],
  ["con-barra-visita", "La barra visitante te apunta todo el partido.", [
    { texto: "Concentrarte en la pelota", efectos: { moral: 4, atributos: { pase: 1 } } },
    { texto: "Responder gestos", efectos: { reputacion: -6, moral: 3 } },
    { texto: "Usar la bronca para rendir", efectos: { atributos: { fisico: 2 }, moral: 5, reputacion: 2 } },
  ]],
  ["con-viaje-llanos", "Gira por los Llanos: calor, viaje y cancha dura.", [
    { texto: "Cuidar el cuerpo y gestionar", efectos: { atributos: { fisico: 1 }, moral: 2, riesgoLesion: 0.05 } },
    { texto: "Ir a muerte igual", efectos: { atributos: { fisico: 2 }, riesgoLesion: 0.14, moral: 4 } },
    { texto: "Quejarte del fixture", efectos: { reputacion: -4, moral: 1 } },
  ]],
  ["con-entrevista-win", "Te invitan a un programa deportivo de TV nacional.", [
    { texto: "Ir preparado y sobrio", efectos: { reputacion: 8, moral: 3 } },
    { texto: "Ir a generar polémica", efectos: { reputacion: -5, moral: 5 } },
    { texto: "Rechazar por concentración", efectos: { reputacion: 2, moral: 1 } },
  ]],
  ["con-copa-colombia", "Copa Colombia un miércoles y liga el domingo.", OPT.selec],
  ["con-hinchada-aeropuerto", "Te reciben con cantos en el aeropuerto tras un buen partido.", [
    { texto: "Saludar y firmar", efectos: { reputacion: 6, moral: 7 } },
    { texto: "Pasar rápido a recuperar", efectos: { atributos: { fisico: 1 }, moral: 2 } },
    { texto: "Prometer la estrella", efectos: { reputacion: 3, moral: 5 } },
  ]],
  ["con-tecnico-extranjero", "Llega un DT extranjero que no conoce la Liga BetPlay.", [
    { texto: "Ayudarlo a adaptarse", efectos: { reputacion: 7, moral: 4, atributos: { pase: 1 } } },
    { texto: "Esperar a ver", efectos: { moral: 1 } },
    { texto: "Dudar en voz alta", efectos: { reputacion: -6, moral: -2 } },
  ]],
  ["con-claustro-prensa", "Rueda de prensa post derrota: te apuntan a vos.", OPT.media],
  ["con-tormenta-cali", "Partido suspendido por tormenta. Reprograman a las 10 a.m. del día siguiente.", [
    { texto: "Recuperar bien esa noche", efectos: { atributos: { fisico: 2 }, moral: 2 } },
    { texto: "Salir igual 'a despejar'", efectos: { moral: 3, riesgoLesion: 0.08, atributos: { fisico: -1 } } },
    { texto: "Quejarte del horario", efectos: { reputacion: -3, moral: 1 } },
  ]],
  ["con-junior-visita", "Jugar de visitante en un estadio caliente de la costa.", OPT.colombiaClasico],
  ["con-nacional-previa", "Previa de un grande: te comparan con ídolos históricos del club.", [
    { texto: "Bajar expectativas con humildad", efectos: { reputacion: 6, moral: 2 } },
    { texto: "Aceptar el desafío", efectos: { moral: 6, atributos: { tiro: 1 } } },
    { texto: "Evitar declaraciones", efectos: { reputacion: 3, moral: 1 } },
  ]],
  ["con-dimayor-fixture", "La Dimayor aprieta el calendario: 3 partidos en 8 días.", OPT.trainHard],
  ["con-ascenso-rival", "Un rival recién ascendido te gana y se burla.", [
    { texto: "Responder en el próximo cruce", efectos: { atributos: { fisico: 1, tiro: 1 }, moral: 4 } },
    { texto: "Ignorar provocaciones", efectos: { reputacion: 5, moral: 2 } },
    { texto: "Entrar al cruce en redes", efectos: { reputacion: -8, moral: 3 } },
  ]],
  ["con-feriado-partido", "Juegan un feriado a horario imposible para la familia.", [
    { texto: "Concentrarte igual", efectos: { moral: 3, atributos: { pase: 1 } } },
    { texto: "Pedir entradas para la familia", efectos: { moral: 5, reputacion: 2 } },
    { texto: "Quejarte del horario", efectos: { reputacion: -3, moral: 1 } },
  ]],
  ["con-cancha-sintetica", "Cancha sintética nueva: pelota rara y piernas cargadas.", [
    { texto: "Adaptar el toque", efectos: { atributos: { pase: 2, regate: 1 }, moral: 2 } },
    { texto: "Quejarte del piso", efectos: { reputacion: -3, moral: 1 } },
    { texto: "Cuidar entradas", efectos: { atributos: { defensa: 1 }, riesgoLesion: 0.04 } },
  ]],
  ["con-gol-clasico", "Convertís en el clásico. Te piden declaración 'para la historia'.", [
    { texto: "Dedicar al plantel", efectos: { reputacion: 8, moral: 6 } },
    { texto: "Dedicar a la hinchada", efectos: { reputacion: 7, moral: 8 } },
    { texto: "Hacer gestos polémicos", efectos: { reputacion: -6, moral: 5 } },
  ]],
  ["con-expulsion-rival-amigo", "Echan a un amigo del otro equipo y te piden 'no aflojar'.", [
    { texto: "Seguir profesional", efectos: { reputacion: 5, moral: 2 } },
    { texto: "Bajar un cambio por respeto", efectos: { moral: 3, reputacion: -2 } },
    { texto: "Apretar más", efectos: { atributos: { fisico: 1 }, reputacion: 2, riesgoLesion: 0.06 } },
  ]],
  ["con-noche-bogota", "Noche fría en Bogotá + final de mes: piernas pesadas.", [
    { texto: "Entrada en calor extra", efectos: { atributos: { ritmo: 1 }, moral: 2 } },
    { texto: "Pedir relevo temprano", efectos: { moral: -1, atributos: { fisico: 1 } } },
    { texto: "Aguantar enteros", efectos: { atributos: { fisico: 2 }, riesgoLesion: 0.09, moral: 3 } },
  ]],
  ["con-periodista-camaral", "Un periodista te espera en la salida de la concentración.", OPT.media],
  ["con-camiseta-tribute", "Te piden usar una cinta de luto / causa social en el clásico.", [
    { texto: "Usarla con respeto", efectos: { reputacion: 7, moral: 4 } },
    { texto: "Consultar al club primero", efectos: { reputacion: 4, moral: 2 } },
    { texto: "Evitar temas 'no futboleros'", efectos: { reputacion: -2, moral: 1 } },
  ]],
  ["con-sub21-alternativa", "Si no vas a Sub-20, te ofrecen un microciclo Sub-21/aspirantes.", [
    { texto: "Ir igual", efectos: { reputacion: 6, moral: 5, atributos: { ritmo: 1 } } },
    { texto: "Quedarte a sumar en el club", efectos: { reputacion: 3, moral: 2 } },
    { texto: "Tomártelo como desaire", efectos: { moral: -6, reputacion: -2 } },
  ]],
  ["con-final-regional", "Final de un torneo regional: presión de toda la ciudad.", OPT.colombiaClasico],
  ["con-meme-fallo", "Se vuelve meme un fallo tuyo. Hasta en el barrio lo miran.", [
    { texto: "Reírte y superar", efectos: { moral: 5, reputacion: 3 } },
    { texto: "Enojarte y responder", efectos: { reputacion: -7, moral: -2 } },
    { texto: "Desactivar comentarios y trabajar", efectos: { atributos: { tiro: 1 }, moral: 3, reputacion: 4 } },
  ]],
  ["con-dt-seleccion-mira", "Dicen que un ayudante de la Selección mayor te miró en la platea.", [
    { texto: "Usarlo de motiva", efectos: { atributos: { ritmo: 1, tiro: 1 }, moral: 6 } },
    { texto: "No creerte el cuento", efectos: { moral: 2, reputacion: 2 } },
    { texto: "Ansiedad por la convocatoria", efectos: { moral: -5, atributos: { pase: -1 } } },
  ]],
  ["con-traslado-avion", "Vuelo demorado: llegan 3 a.m. y juegan a las 4 p.m.", [
    { texto: "Dormir sí o sí", efectos: { atributos: { fisico: 1 }, moral: 2 } },
    { texto: "Quejarte en redes", efectos: { reputacion: -6, moral: 1 } },
    { texto: "Siesta y activación corta", efectos: { atributos: { ritmo: 1 }, moral: 3 } },
  ]],
  ["con-gol-olimpico-intento", "De córner casi convertís un olímpico; la tribuna lo pide de nuevo.", [
    { texto: "Intentarlo con cabeza", efectos: { atributos: { tiro: 2, pase: 1 }, moral: 4 } },
    { texto: "Jugar simple", efectos: { atributos: { pase: 1 }, reputacion: 2 } },
    { texto: "Forzar la jugada", efectos: { atributos: { tiro: 1 }, reputacion: -2, moral: 3 } },
  ]],
];

const PRIME_GEN = [
  ["prime-oferta-grande", "Una oferta grande está sobre la mesa. El club quiere retenerte.", OPT.money],
  ["prime-brazalete", "Te ofrecen el brazalete de capitán.", OPT.leadership],
  ["prime-rivalidad", "Un rival mediático te apunta como 'sobrevalorado'.", OPT.media],
  ["prime-contrato-publicidad", "Marca grande con cláusulas de imagen estrictas.", [
    { texto: "Firmar y cuidar cada aparición", efectos: { reputacion: 8, moral: 3 } },
    { texto: "Firmar pero vivir igual", efectos: { reputacion: -5, moral: 6 } },
    { texto: "Rechazar para no distraerte", efectos: { reputacion: 3, moral: 1, atributos: { fisico: 1 } } },
  ]],
  ["prime-lesion-seria", "Sospecha de lesión de rodilla. El médico sugiere estudios.", OPT.injury],
  ["prime-cambio-agente", "Tu agente pelea con un mega-agente por tu representación.", [
    { texto: "Mantener lealtad al que te descubrió", efectos: { reputacion: 6, moral: 5 } },
    { texto: "Cambiar al grande", efectos: { reputacion: 2, moral: 2 } },
    { texto: "Quedarte sin agente un tiempo", efectos: { reputacion: -3, moral: -2 } },
  ]],
  ["prime-disciplina", "El cuerpo técnico detecta que bajaste el nivel en entrenamientos.", [
    { texto: "Resetear hábitos y carga", efectos: { atributos: { fisico: 3, ritmo: 2 }, moral: 4, reputacion: 5 } },
    { texto: "Negar el problema", efectos: { reputacion: -10, moral: -5, atributos: { fisico: -2 } } },
    { texto: "Pedir un plan personalizado", efectos: { atributos: { fisico: 2 }, moral: 6, reputacion: 4 } },
  ]],
  ["prime-rol-tactico", "Te piden sacrificar brillo por un rol más táctico.", [
    { texto: "Aceptar el sacrificio", efectos: { atributos: { defensa: 3, pase: 2, tiro: -1 }, reputacion: 8, moral: -2 } },
    { texto: "Negociar un rol mixto", efectos: { atributos: { pase: 1, tiro: 1 }, reputacion: 4, moral: 3 } },
    { texto: "Plantarte", efectos: { reputacion: -8, moral: 2 } },
  ]],
  ["prime-renovacion-tope", "El club ofrece renovación a tope salarial... o salida.", OPT.money],
  ["prime-liderazgo-vestuario", "Hay grieta en el vestuario. Te piden que unifiques.", OPT.leadership],
  ["prime-padre-empresario", "Tu entorno familiar arma un 'clan' que habla por vos.", [
    { texto: "Poner límites claros", efectos: { reputacion: 6, moral: 2 } },
    { texto: "Dejarlos manejar la imagen", efectos: { reputacion: -4, moral: 3 } },
    { texto: "Delegar todo al agente", efectos: { reputacion: 3, moral: 1 } },
  ]],
  ["prime-carga-partidos", "50 partidos en la temporada: el cuerpo pide tregua.", OPT.trainHard],
  ["prime-error-champions", "Error grave en un partido grande de Europa / copa.", OPT.media],
  ["prime-companero-joven", "Un pibe de 19 te come el puesto en rachas.", [
    { texto: "Mentorearlo y competir", efectos: { reputacion: 10, moral: 4, atributos: { pase: 1 } } },
    { texto: "Pedir no rotar", efectos: { reputacion: -5, moral: 1 } },
    { texto: "Aceptar minutos compartidos", efectos: { reputacion: 5, moral: 2, atributos: { fisico: 1 } } },
  ]],
  ["prime-inversion-dudosa", "Te ofrecen un negocio 'seguro' con un amigo del ambiente.", [
    { texto: "Rechazar sin asesores", efectos: { reputacion: 3, moral: 2 } },
    { texto: "Revisar con profesionales", efectos: { reputacion: 4, moral: 3 } },
    { texto: "Meter plata fuerte", efectos: { moral: -8, reputacion: -4, riesgoFinCarrera: 0.04 } },
  ]],
  ["prime-entrevista-espn", "Entrevista internacional: preguntan por tu legado.", [
    { texto: "Hablar de trabajo y equipo", efectos: { reputacion: 8, moral: 4 } },
    { texto: "Hablar de tu yo individual", efectos: { reputacion: 2, moral: 3 } },
    { texto: "Evitar la entrevista", efectos: { reputacion: -2, moral: 1 } },
  ]],
  ["prime-cambio-dt", "Echan al DT que te bancaba. Entra uno frío con vos.", [
    { texto: "Ganarte al nuevo", efectos: { atributos: { fisico: 2, defensa: 1 }, moral: 3, reputacion: 4 } },
    { texto: "Pedir salida", efectos: { reputacion: -3, moral: -4 } },
    { texto: "Esperar el mercado", efectos: { moral: -2, reputacion: 1 } },
  ]],
  ["prime-clausula-rescision", "Activan tu cláusula. Tenés 48h para decidir el destino.", [
    { texto: "Elegir el proyecto deportivo", efectos: { moral: 6, reputacion: 5, atributos: { ritmo: 1 } } },
    { texto: "Elegir la mejor plata", efectos: { moral: 4, reputacion: 1 } },
    { texto: "Quedarte y pelear la cláusula", efectos: { reputacion: 4, moral: 2 } },
  ]],
  ["prime-dopaje-rumor", "Corre un rumor infame sobre sustancias. Es falso.", [
    { texto: "Demandar / responder legal", efectos: { reputacion: 5, moral: -3 } },
    { texto: "Ignorar y rendir", efectos: { atributos: { tiro: 1 }, moral: 4, reputacion: 3 } },
    { texto: "Estallar en redes", efectos: { reputacion: -8, moral: 2 } },
  ]],
  ["prime-capitan-alternativa", "No te dan el brazalete; se lo dan a otro.", [
    { texto: "Bancarlo igual", efectos: { reputacion: 8, moral: 3 } },
    { texto: "Tomarlo personal", efectos: { moral: -8, reputacion: -4 } },
    { texto: "Liderar sin brazalete", efectos: { reputacion: 6, moral: 5, atributos: { pase: 1 } } },
  ]],
  ["prime-pretemporada-extrema", "Pretemporada de infierno en altura / calor.", OPT.trainHard],
  ["prime-divorcio-entorno", "Crisis personal fuerte fuera de la cancha.", [
    { texto: "Pedir ayuda profesional", efectos: { moral: 4, reputacion: 3 } },
    { texto: "Encerrarte en el fútbol", efectos: { atributos: { tiro: 1 }, moral: -6 } },
    { texto: "Pedir tiempo al club", efectos: { moral: 2, reputacion: 2, atributos: { fisico: -1 } } },
  ]],
  ["prime-extension-contrato", "Te ofrecen 1 año más con rol de rotación.", [
    { texto: "Aceptar y ser útil", efectos: { reputacion: 6, moral: 2, atributos: { defensa: 1 } } },
    { texto: "Buscar titularidad afuera", efectos: { moral: 4, reputacion: 2 } },
    { texto: "Retirarte del club enojado", efectos: { reputacion: -6, moral: -4 } },
  ]],
  ["prime-partido-800", "Llegás a un hito de partidos en tu carrera.", [
    { texto: "Celebrar con humildad", efectos: { reputacion: 8, moral: 6 } },
    { texto: "Usarlo de marketing fuerte", efectos: { reputacion: 4, moral: 4 } },
    { texto: "Restarle importancia", efectos: { reputacion: 2, moral: 2 } },
  ]],
  ["prime-tecnico-te-apunta", "El DT te hace el chivo expiatorio en conferencia.", OPT.media],
  ["prime-oferta-mls-final", "Llega una oferta MLS muy alta a tu edad prime tardío.", OPT.money],
  ["prime-recuperacion-quirurgica", "Post operatorio: te tienta volver antes de tiempo.", OPT.injury],
  ["prime-rol-pressing", "El sistema nuevo te exige pressing extremo 90 minutos.", [
    { texto: "Adaptar el físico", efectos: { atributos: { ritmo: 2, fisico: 2 }, moral: -2, riesgoLesion: 0.1 } },
    { texto: "Pedir rol más posicional", efectos: { reputacion: -2, moral: 2, atributos: { pase: 1 } } },
    { texto: "Hacerlo a medias", efectos: { reputacion: -5, atributos: { fisico: -1 } } },
  ]],
  ["prime-multa-interna", "Te multan por llegar tarde a una concentración.", [
    { texto: "Aceptar y disculparte", efectos: { reputacion: 4, moral: -2 } },
    { texto: "Discutir la multa", efectos: { reputacion: -6, moral: 1 } },
    { texto: "Pagar y endurecer hábitos", efectos: { reputacion: 5, moral: 2, atributos: { fisico: 1 } } },
  ]],
  ["prime-entrevista-sueldo", "Filtran tu sueldo. El vestuario se tensa.", [
    { texto: "Bajar el perfil", efectos: { reputacion: 5, moral: 1 } },
    { texto: "Hablar claro con el grupo", efectos: { reputacion: 4, moral: 3 } },
    { texto: "Flexear", efectos: { reputacion: -10, moral: 2 } },
  ]],
  ["prime-cesion-estrella", "El club quiere cedarte para acomodar fair play financiero.", [
    { texto: "Aceptar si hay proyecto", efectos: { moral: 3, atributos: { ritmo: 1 } } },
    { texto: "Negarte", efectos: { reputacion: 2, moral: 1 } },
    { texto: "Forzar venta", efectos: { reputacion: -4, moral: 2 } },
  ]],
  ["prime-final-perdida", "Pierden una final. El plantel se culpa.", OPT.leadership],
  ["prime-final-ganada", "Ganan una final. Te ofrecen ser la cara de la celebración.", [
    { texto: "Compartir protagonismo", efectos: { reputacion: 10, moral: 8 } },
    { texto: "Tomar el centro", efectos: { reputacion: 4, moral: 7 } },
    { texto: "Descansar y cuidar el cuerpo", efectos: { atributos: { fisico: 1 }, moral: 3 } },
  ]],
  ["prime-sponsor-conflicto", "Dos sponsors se pisan; tenés que elegir.", [
    { texto: "Elegir con abogados", efectos: { reputacion: 4, moral: 2 } },
    { texto: "Elegir por feeling", efectos: { moral: 3, reputacion: 1 } },
    { texto: "Quedar mal con ambos", efectos: { reputacion: -6, moral: -2 } },
  ]],
  ["prime-migracion-familia", "Tu familia quiere mudarse con vos al extranjero.", [
    { texto: "Llevarlos y armar red de apoyo", efectos: { moral: 6, reputacion: 2 } },
    { texto: "Ir solo un año", efectos: { moral: -3, atributos: { fisico: 1 } } },
    { texto: "Posponer la decisión", efectos: { moral: 1 } },
  ]],
  ["prime-critica-estadistica", "Un portal dice que tus stats 'no justifican el sueldo'.", OPT.media],
  ["prime-partido-seleccion-club", "Misma semana: club grande + convocatoria.", OPT.selec],
  ["prime-nueva-posicion-dt", "El DT te transforma en otra posición a los 28.", [
    { texto: "Reinventarte", efectos: { atributos: { pase: 2, defensa: 2, tiro: -1 }, moral: 4, reputacion: 6 } },
    { texto: "Resistirte", efectos: { reputacion: -5, moral: -3 } },
    { texto: "Aceptar a prueba 10 partidos", efectos: { reputacion: 3, moral: 3, atributos: { defensa: 1 } } },
  ]],
  ["prime-huelga-entrenamiento", "Parte del plantel quiere 'entrenar flojo' por un conflicto.", [
    { texto: "No adherir y entrenar normal", efectos: { reputacion: 5, moral: -2 } },
    { texto: "Adherir solidario", efectos: { reputacion: 2, moral: 3 } },
    { texto: "Mediar con dirigentes", efectos: { reputacion: 8, moral: 2 } },
  ]],
  ["prime-revision-medica", "La revisión médica de un club grande te marca una alerta menor.", [
    { texto: "Tratarlo a fondo", efectos: { atributos: { fisico: 2 }, moral: 2, reputacion: 3 } },
    { texto: "Minimizarlo", efectos: { moral: 3, riesgoLesion: 0.12 } },
    { texto: "Segunda opinión top", efectos: { reputacion: 2, moral: 3 } },
  ]],
  ["prime-libro-biografia", "Te proponen una biografía prematura.", [
    { texto: "Esperar al retiro", efectos: { reputacion: 4, moral: 2 } },
    { texto: "Hacerla ahora", efectos: { reputacion: 3, moral: 4 } },
    { texto: "Rechazar", efectos: { moral: 1 } },
  ]],
  ["prime-twitch-stream", "Te proponen streamear tu vida de crack.", [
    { texto: "Solo contenido controlado", efectos: { reputacion: 4, moral: 3 } },
    { texto: "Abrir tu intimidad", efectos: { reputacion: -3, moral: 5 } },
    { texto: "No", efectos: { reputacion: 2, moral: 1 } },
  ]],
  ["prime-rival-historico", "Un ex compañero ahora rival te provoca en la previa.", [
    { texto: "Saludar y jugar", efectos: { reputacion: 5, moral: 3 } },
    { texto: "No mirarlo", efectos: { moral: 2 } },
    { texto: "Entrar al game", efectos: { reputacion: -4, moral: 4, atributos: { fisico: 1 } } },
  ]],
  ["prime-cambio-alimentacion", "Nuevo chef: dieta antiinflamatoria estricta.", [
    { texto: "Cumplir", efectos: { atributos: { fisico: 2, ritmo: 1 }, moral: -2 } },
    { texto: "Trucar comidas", efectos: { atributos: { fisico: -1 }, moral: 3, reputacion: -2 } },
    { texto: "Pedir excepciones sociales", efectos: { moral: 2, reputacion: 1 } },
  ]],
  ["prime-penales-final", "Final a penales: ¿pateás el tercero?", [
    { texto: "Pedir el balón", efectos: { atributos: { tiro: 2 }, moral: 6, reputacion: 5 } },
    { texto: "Dejarlo a un especialista", efectos: { reputacion: 3, moral: 2 } },
    { texto: "Esconderte", efectos: { reputacion: -8, moral: -4 } },
  ]],
  ["prime-redes-familia", "Un familiar opina de tu DT en redes con tu apellido.", [
    { texto: "Desmentir y pedir que pare", efectos: { reputacion: 6, moral: -2 } },
    { texto: "Ignorar", efectos: { reputacion: -3, moral: 1 } },
    { texto: "Bloquear y hablar en privado", efectos: { reputacion: 4, moral: 2 } },
  ]],
  ["prime-carga-internacional", "Jet lag + partido midweek en otra continente.", [
    { texto: "Protocolo de sueño estricto", efectos: { atributos: { fisico: 2 }, moral: 2 } },
    { texto: "Improvisar", efectos: { riesgoLesion: 0.1, moral: 1, atributos: { ritmo: -1 } } },
    { texto: "Pedir no ser titular", efectos: { reputacion: -2, moral: 2, atributos: { fisico: 1 } } },
  ]],
  ["prime-masterclass-pibes", "Te piden dar una clinic a juveniles del club.", [
    { texto: "Prepararla en serio", efectos: { reputacion: 8, moral: 5 } },
    { texto: "Ir a cumplir", efectos: { reputacion: 3, moral: 2 } },
    { texto: "Delegar en el 2do capitán", efectos: { reputacion: -2, moral: 1 } },
  ]],
  ["prime-oferta-china-arabia", "Oferta millonaria de una liga emergente.", OPT.money],
  ["prime-control-peso", "Te marcan +2kg en el control semanal.", [
    { texto: "Corregir ya", efectos: { atributos: { ritmo: 1, fisico: 1 }, moral: -1 } },
    { texto: "Discutir la balanza", efectos: { reputacion: -3, moral: 1 } },
    { texto: "Plan con nutricionista", efectos: { atributos: { fisico: 2 }, moral: 2, reputacion: 2 } },
  ]],
];

const PRIME_COL = [
  ["prime-eliminatoria", "Fecha de Eliminatoria vs partido clave de club.", OPT.selec],
  ["prime-hinchada-colombia", "En Selección la hinchada te corea el apellido.", [
    { texto: "Asumir el protagonismo", efectos: { atributos: { tiro: 2, regate: 1 }, moral: 12, reputacion: 10 } },
    { texto: "Repartir juego", efectos: { atributos: { pase: 3 }, moral: 8, reputacion: 12 } },
    { texto: "Te trabás por la presión", efectos: { moral: -8, reputacion: -4 } },
  ]],
  ["prime-clasico-capital", "Te invitan a opinar del clásico de la capital en vivo.", [
    { texto: "Hablar con respeto de ambos", efectos: { reputacion: 8, moral: 3 } },
    { texto: "Picar la controversia", efectos: { reputacion: -6, moral: 5 } },
    { texto: "Cancelar a último momento", efectos: { reputacion: -2, moral: 1 } },
  ]],
  ["prime-filantropia", "Te proponen una fundación en tu barrio de origen.", [
    { texto: "Meterle tiempo y plata de verdad", efectos: { reputacion: 15, moral: 10 } },
    { texto: "Poner el nombre y delegar", efectos: { reputacion: 5, moral: 2 } },
    { texto: "Posponerlo", efectos: { reputacion: -3, moral: -2 } },
  ]],
  ["prime-convocado-mayor", "Lista de la mayor: estás en el límite del corte.", [
    { texto: "Hablar con el DT de Selección", efectos: { reputacion: 3, moral: 2 } },
    { texto: "Rendir en el club y esperar", efectos: { atributos: { tiro: 1, fisico: 1 }, moral: 4 } },
    { texto: "Ansiedad mediática", efectos: { moral: -6, reputacion: -2 } },
  ]],
  ["prime-barras-bravas", "Una barra te 'pide' gestos en el próximo clásico.", [
    { texto: "Negarte con respeto", efectos: { reputacion: 6, moral: 1 } },
    { texto: "Ignorar el mensaje", efectos: { reputacion: 3, moral: 1 } },
    { texto: "Comprometerte", efectos: { reputacion: -12, moral: 3, riesgoFinCarrera: 0.03 } },
  ]],
  ["prime-periodismo-deportivo", "Te hacen nota de tapa en un diario grande del país.", [
    { texto: "Hablar de colectivo", efectos: { reputacion: 7, moral: 4 } },
    { texto: "Vender tu historia dura", efectos: { reputacion: 5, moral: 5 } },
    { texto: "Evitar detalles íntimos", efectos: { reputacion: 4, moral: 2 } },
  ]],
  ["prime-amistoso-fecha-fifa", "Amistoso de Selección vs recuperación de club.", OPT.selec],
  ["prime-critica-excrack", "Un ex crack colombiano dice que 'te falta personalidad'.", OPT.media],
  ["prime-gol-eliminatoria", "Convertís en Eliminatoria. El país explota.", [
    { texto: "Celebrar con el grupo", efectos: { reputacion: 12, moral: 12 } },
    { texto: "Celebración individual icónica", efectos: { reputacion: 8, moral: 10 } },
    { texto: "Dedicatoria polémica", efectos: { reputacion: -4, moral: 8 } },
  ]],
  ["prime-regreso-betplay-rumor", "Suena tu regreso a BetPlay 'por un año'.", [
    { texto: "Cerrar el círculo", efectos: { reputacion: 8, moral: 8 } },
    { texto: "Seguir afuera", efectos: { reputacion: 2, moral: 2 } },
    { texto: "Usar el rumor para renegociar", efectos: { reputacion: -3, moral: 3 } },
  ]],
  ["prime-dt-colombia", "Cambio de DT en la Selección: no sabés si te cuenta.", [
    { texto: "Pedir reunión", efectos: { reputacion: 3, moral: 2 } },
    { texto: "Imponer rendimiento", efectos: { atributos: { fisico: 1, tiro: 1 }, moral: 4 } },
    { texto: "Bajar los brazos", efectos: { moral: -8, atributos: { ritmo: -1 } } },
  ]],
  ["prime-noche-barranquilla", "Jugar Eliminatoria en Barranquilla: calor y presión.", [
    { texto: "Protocolo de hidratación y foco", efectos: { atributos: { fisico: 2 }, moral: 5, reputacion: 4 } },
    { texto: "Dejarte llevar por el ambiente", efectos: { moral: 8, riesgoLesion: 0.08 } },
    { texto: "Pedir relevo si aflojás", efectos: { moral: 1, reputacion: 1 } },
  ]],
  ["prime-copa-america-ciclo", "Arranca ciclo de Copa América. Te piden punta de lanza.", OPT.leadership],
  ["prime-comparacion-idolo", "Te comparan con un ídolo histórico de tu club de origen.", [
    { texto: "Agradecer y bajar expectativas", efectos: { reputacion: 7, moral: 3 } },
    { texto: "Aceptar la comparación", efectos: { moral: 6, atributos: { tiro: 1 } } },
    { texto: "Pedír que no comparen", efectos: { reputacion: 3, moral: 1 } },
  ]],
  ["prime-tweet-politico", "Te piden posicionarte en un debate político del país.", [
    { texto: "No opinar", efectos: { reputacion: 4, moral: 1 } },
    { texto: "Opinar con cuidado", efectos: { reputacion: 1, moral: 2 } },
    { texto: "Opinar fuerte", efectos: { reputacion: -10, moral: 3 } },
  ]],
  ["prime-docuserie", "Netflix/local: docuserie sobre tu vida.", [
    { texto: "Controlar el relato", efectos: { reputacion: 6, moral: 4 } },
    { texto: "Abrir archivos sensibles", efectos: { reputacion: 2, moral: 3 } },
    { texto: "Rechazar", efectos: { reputacion: 2, moral: 1 } },
  ]],
  ["prime-clasico-paisa-veterano", "Volvés a un clásico paisa años después.", OPT.colombiaClasico],
  ["prime-federacion-bonus", "La Federación ofrece bono por clasificar.", [
    { texto: "Enfocarte en el juego", efectos: { atributos: { tiro: 1, pase: 1 }, moral: 4 } },
    { texto: "Hablar del bono en medios", efectos: { reputacion: -4, moral: 2 } },
    { texto: "Pedir claridad al grupo", efectos: { reputacion: 3, moral: 2 } },
  ]],
  ["prime-lesion-seleccion", "Te lesionás en un microciclo de Selección; el club se enoja.", [
    { texto: "Transparencia total", efectos: { reputacion: 5, moral: -3 } },
    { texto: "Acelerar vuelta al club", efectos: { riesgoLesion: 0.22, moral: 2, atributos: { fisico: -2 } } },
    { texto: "Priorizar recuperación larga", efectos: { atributos: { fisico: 2 }, moral: -2, reputacion: 3 } },
  ]],
  ["prime-homenaje-estadio", "Tu club de origen te invita a un homenaje a mitad de temporada.", [
    { texto: "Ir y agradecer", efectos: { reputacion: 8, moral: 7 } },
    { texto: "Mandar video", efectos: { reputacion: 4, moral: 3 } },
    { texto: "No ir por calendario", efectos: { reputacion: -2, moral: 1 } },
  ]],
  ["prime-cancha-altitud", "Eliminatoria en altura: te cuesta el primer tiempo.", [
    { texto: "Gestionar esfuerzos", efectos: { atributos: { fisico: 1, pase: 1 }, moral: 3 } },
    { texto: "Ir a muerte", efectos: { atributos: { fisico: 2 }, riesgoLesion: 0.12, moral: 4 } },
    { texto: "Pedir cambio temprano", efectos: { reputacion: -3, moral: 1 } },
  ]],
  ["prime-prensa-transferencia", "En Colombia dan por hecho tu pase. Todavía no hay nada.", OPT.media],
  ["prime-cierre-eliminatorias", "Última fecha: clasifican o no. El vestuario está mudo.", OPT.leadership],
  ["prime-amigo-ascenso", "Un amigo de cantera asciende en BetPlay y te pide un saludo viral.", [
    { texto: "Bancarlo en público", efectos: { reputacion: 6, moral: 5 } },
    { texto: "Saludo privado", efectos: { moral: 3 } },
    { texto: "No contestar", efectos: { reputacion: -2, moral: -1 } },
  ]],
  ["prime-tecnico-club-colombia", "Te ofrecen dirigir juveniles 'el día que te retires' en tu club de origen.", [
    { texto: "Ilusionarte con ese futuro", efectos: { moral: 5, reputacion: 4 } },
    { texto: "Enfocarte solo en jugar", efectos: { atributos: { tiro: 1 }, moral: 2 } },
    { texto: "Pedir un rol ya de mentor", efectos: { reputacion: 5, moral: 3 } },
  ]],
  ["prime-gol-contra-argentina-br", "Noche grande vs un grande sudamericano con Selección.", [
    { texto: "Buscar el protagonismo", efectos: { atributos: { tiro: 2, ritmo: 1 }, moral: 8, reputacion: 8 } },
    { texto: "Jugar para el equipo", efectos: { atributos: { pase: 2, defensa: 1 }, moral: 6, reputacion: 9 } },
    { texto: "Evitar riesgos", efectos: { moral: 2, reputacion: 2 } },
  ]],
  ["prime-critica-rendimiento-copa", "Tras una Copa floja, piden tu retiro de la Selección.", OPT.media],
  ["prime-visita-barrio", "Volvés al barrio y armás un picado con pibes.", [
    { texto: "Ir y quedarte un buen rato", efectos: { reputacion: 10, moral: 8 } },
    { texto: "Ir 20 minutos", efectos: { reputacion: 5, moral: 4 } },
    { texto: "Solo donar materiales", efectos: { reputacion: 4, moral: 2 } },
  ]],
  ["prime-camiseta-seleccion-subasta", "Subastan tu camiseta de Selección por una causa.", [
    { texto: "Donar y difundir", efectos: { reputacion: 9, moral: 6 } },
    { texto: "Donar en silencio", efectos: { reputacion: 5, moral: 4 } },
    { texto: "Pedir porcentaje", efectos: { reputacion: -6, moral: 1 } },
  ]],
];

const VET_GEN = [
  ["vet-banco", "Pasás más tiempo en el banco. El técnico prioriza juventud.", [
    { texto: "Aceptar el rol y empujar desde adentro", efectos: { reputacion: 8, moral: 2, atributos: { pase: 1 } } },
    { texto: "Pedir transferencia ya", efectos: { reputacion: -4, moral: -6 } },
    { texto: "Pelear el puesto en cada entrenamiento", efectos: { atributos: { fisico: 2, ritmo: 1 }, moral: 4, riesgoLesion: 0.12 } },
  ]],
  ["vet-mentoria", "Te piden mentoría formal para los juveniles.", [
    { texto: "Dedicarle tiempo serio", efectos: { reputacion: 12, moral: 8 } },
    { texto: "Ayudar solo cuando sobra energía", efectos: { reputacion: 4, moral: 2 } },
    { texto: "Rechazar: todavía te sentís titular", efectos: { reputacion: -5, moral: 1 } },
  ]],
  ["vet-retiro-oferta", "El club sugiere retiro con homenaje a fin de temporada.", [
    { texto: "Aceptar y planear la despedida", efectos: { reputacion: 10, moral: 5, riesgoFinCarrera: 0.4 } },
    { texto: "Pedir un año más", efectos: { moral: 6, atributos: { fisico: -1 }, riesgoLesion: 0.1 } },
    { texto: "Buscar otro club", efectos: { reputacion: 2, moral: 3 } },
  ]],
  ["vet-lesion-cronica", "El dolor crónico ya no se va con hielo.", OPT.injury],
  ["vet-peso-forma", "Te cuesta mantener peso y velocidad.", [
    { texto: "Nutricionista y doble gym", efectos: { atributos: { fisico: 2, ritmo: 1 }, moral: 3, riesgoLesion: 0.08 } },
    { texto: "Aceptar declive y ajustar estilo", efectos: { atributos: { pase: 2, tiro: 1, ritmo: -2 }, moral: 2 } },
    { texto: "Ignorar alertas", efectos: { atributos: { fisico: -3, ritmo: -2 }, moral: -4, riesgoLesion: 0.2 } },
  ]],
  ["vet-inversion", "Socio te propone negocio fuera del fútbol.", [
    { texto: "Diversificar con asesores", efectos: { reputacion: 4, moral: 5 } },
    { texto: "Meter plata sin revisar", efectos: { reputacion: -6, moral: -8, riesgoFinCarrera: 0.05 } },
    { texto: "Foco en el campo", efectos: { moral: 2, atributos: { fisico: 1 } } },
  ]],
  ["vet-contrato-corto", "Solo te ofrecen 6 meses.", OPT.money],
  ["vet-rol-entrenador-asistente", "Te ofrecen ser ayudante-jugador.", [
    { texto: "Aceptar el doble rol", efectos: { reputacion: 8, moral: 4, atributos: { pase: 1 } } },
    { texto: "Solo jugador", efectos: { moral: 2, atributos: { tiro: 1 } } },
    { texto: "Pasar a cuerpo técnico ya", efectos: { reputacion: 5, moral: 3, riesgoFinCarrera: 0.25 } },
  ]],
  ["vet-pibe-te-reemplaza", "El 9/8/10 joven te reemplaza y rinde.", [
    { texto: "Acompañarlo", efectos: { reputacion: 10, moral: 4 } },
    { texto: "Competir seco", efectos: { atributos: { fisico: 1 }, moral: 3, reputacion: 2 } },
    { texto: "Amargarte", efectos: { moral: -10, reputacion: -4 } },
  ]],
  ["vet-partido-despedida-otro", "Te invitan a la despedida de un ídolo rival.", [
    { texto: "Ir por respeto", efectos: { reputacion: 6, moral: 4 } },
    { texto: "No ir", efectos: { reputacion: -2, moral: 1 } },
    { texto: "Mandar saludo", efectos: { reputacion: 3, moral: 2 } },
  ]],
  ["vet-reduccion-sueldo", "Te proponen renovar a mitad de sueldo.", OPT.money],
  ["vet-viaje-suplente", "Viajás de suplente eterno en el banco.", [
    { texto: "Ser profesional igual", efectos: { reputacion: 7, moral: 2 } },
    { texto: "Pedir no viajar", efectos: { reputacion: -4, moral: 2 } },
    { texto: "Usar viajes para mentoría", efectos: { reputacion: 8, moral: 5 } },
  ]],
  ["vet-charla-retiro", "Tu familia te pregunta cuándo colgás.", [
    { texto: "Definir una fecha mental", efectos: { moral: 4, reputacion: 2 } },
    { texto: "Seguir sin fecha", efectos: { moral: 2, riesgoLesion: 0.08 } },
    { texto: "Enojarte por la pregunta", efectos: { moral: -5, reputacion: -1 } },
  ]],
  ["vet-lesion-ultima", "El médico dice: 'otra igual y se complica la vida post fútbol'.", [
    { texto: "Retirarte", efectos: { reputacion: 6, moral: -3, riesgoFinCarrera: 0.55 } },
    { texto: "Arriesgar una temporada más", efectos: { moral: 4, riesgoLesion: 0.25, riesgoFinCarrera: 0.12 } },
    { texto: "Bajar carga radicalmente", efectos: { atributos: { fisico: 1, ritmo: -2 }, moral: 2, reputacion: 3 } },
  ]],
  ["vet-podcast", "Te ofrecen un podcast de leyendas.", [
    { texto: "Empezar a construir marca", efectos: { reputacion: 5, moral: 4 } },
    { texto: "Esperar al retiro", efectos: { moral: 2 } },
    { texto: "Rechazar", efectos: { moral: 1 } },
  ]],
  ["vet-amistoso-masters", "Torneo masters / celebridades te tienta.", [
    { texto: "Jugar priorizando salud", efectos: { reputacion: 4, moral: 4, riesgoLesion: 0.08 } },
    { texto: "No jugar", efectos: { atributos: { fisico: 1 }, moral: 1 } },
    { texto: "Ir a muerte", efectos: { moral: 5, riesgoLesion: 0.2, riesgoFinCarrera: 0.06 } },
  ]],
  ["vet-staff-medico", "El staff sugiere que ya no aguantás 2 partidos por semana.", [
    { texto: "Aceptar planificación", efectos: { atributos: { fisico: 1 }, reputacion: 4, moral: 2 } },
    { texto: "Pedir igual los 90'", efectos: { moral: 3, riesgoLesion: 0.15 } },
    { texto: "Buscar liga menos exigente", efectos: { moral: 3, reputacion: 2 } },
  ]],
  ["vet-homenaje-silencioso", "El club no planea homenaje. Te duele.", [
    { texto: "No pedirlo", efectos: { reputacion: 5, moral: -3 } },
    { texto: "Pedírlo con elegancia", efectos: { reputacion: 2, moral: 2 } },
    { texto: "Filtrar el enojo", efectos: { reputacion: -8, moral: -2 } },
  ]],
];

const VET_COL = [
  ["vet-regreso-colombia", "Suena un regreso a la Liga BetPlay 'para cerrar el círculo'.", [
    { texto: "Volver al club de origen", efectos: { reputacion: 14, moral: 12 } },
    { texto: "Volver a un rival histórico", efectos: { reputacion: -8, moral: 4 } },
    { texto: "Seguir afuera un año más", efectos: { reputacion: 2, moral: 1 } },
  ]],
  ["vet-prensa-legado", "En TV te preguntan cómo querés que te recuerden.", [
    { texto: "Como un profesional serio", efectos: { reputacion: 8, moral: 4 } },
    { texto: "Como un ídolo de hinchada", efectos: { reputacion: 6, moral: 8 } },
    { texto: "Como alguien que dio todo por la Selección", efectos: { reputacion: 10, moral: 6 } },
  ]],
  ["vet-despedida-seleccion", "La Federación sugiere una despedida simbólica con la Selección.", [
    { texto: "Aceptar el homenaje", efectos: { reputacion: 12, moral: 10 } },
    { texto: "Irte sin ruido", efectos: { reputacion: 4, moral: 2 } },
    { texto: "Pedir una última Eliminatoria", efectos: { moral: 6, atributos: { fisico: -1 }, riesgoLesion: 0.1 } },
  ]],
  ["vet-ultimo-clasico", "Puede ser tu último clásico en Colombia.", [
    { texto: "A morir, como una final", efectos: { moral: 10, reputacion: 8, riesgoLesion: 0.18, atributos: { fisico: -1 } } },
    { texto: "Con inteligencia y liderazgo", efectos: { atributos: { pase: 2 }, reputacion: 10, moral: 6 } },
    { texto: "Dejar minutos a un joven", efectos: { reputacion: 12, moral: 4 } },
  ]],
  ["vet-dt-betplay", "Te ofrecen dirigir en BetPlay apenas te retires.", [
    { texto: "Aceptar el plan", efectos: { reputacion: 7, moral: 6 } },
    { texto: "Estudiar primero licencia", efectos: { reputacion: 5, moral: 4 } },
    { texto: "No te interesa dirigir", efectos: { moral: 2 } },
  ]],
  ["vet-comentario-emisoras", "Te ofrecen ser panelista en emisoras colombianas.", [
    { texto: "Empezar de a poco", efectos: { reputacion: 5, moral: 4 } },
    { texto: "Esperar al retiro", efectos: { moral: 2 } },
    { texto: "Rechazar", efectos: { moral: 1 } },
  ]],
  ["vet-camiseta-origen", "El club de origen retira tu dorsal simbólicamente.", [
    { texto: "Aceptar emocionado", efectos: { reputacion: 12, moral: 10 } },
    { texto: "Pedir que lo usen juveniles", efectos: { reputacion: 14, moral: 8 } },
    { texto: "Restarle importancia", efectos: { reputacion: 4, moral: 2 } },
  ]],
  ["vet-picado-barrio-final", "Último picado en el barrio antes de decidir el retiro.", [
    { texto: "Disfrutar y cuidar el cuerpo", efectos: { moral: 8, riesgoLesion: 0.05 } },
    { texto: "No ir", efectos: { moral: 1 } },
    { texto: "Jugar como a los 18", efectos: { moral: 6, riesgoLesion: 0.2, riesgoFinCarrera: 0.08 } },
  ]],
  ["vet-seleccion-emergencia", "Lesiones en la mayor: te tientan a una convocatoria exprés.", [
    { texto: "Ir si el cuerpo aguanta", efectos: { reputacion: 10, moral: 8, riesgoLesion: 0.12 } },
    { texto: "Ceder el lugar a un joven", efectos: { reputacion: 12, moral: 5 } },
    { texto: "Retirarte de la Selección ahora", efectos: { reputacion: 6, moral: 2, riesgoFinCarrera: 0.15 } },
  ]],
  ["vet-libro-colombia", "Una editorial colombiana quiere tu biografía completa.", [
    { texto: "Hacerla con rigor", efectos: { reputacion: 7, moral: 5 } },
    { texto: "Hacerla light", efectos: { reputacion: 3, moral: 3 } },
    { texto: "Esperar", efectos: { moral: 2 } },
  ]],
  ["vet-clásico-banca", "En el clásico te dejan en la banca y la hinchada pide tu entrada.", [
    { texto: "Entrar y aportar 20 minutos", efectos: { reputacion: 6, moral: 5, atributos: { pase: 1 } } },
    { texto: "Aceptar el plan del DT", efectos: { reputacion: 4, moral: 2 } },
    { texto: "Molestarte en el banco", efectos: { reputacion: -5, moral: -4 } },
  ]],
  ["vet-despedida-betplay", "Arman tu despedida en un estadio BetPlay.", [
    { texto: "Vivir el momento", efectos: { reputacion: 12, moral: 12, riesgoFinCarrera: 0.35 } },
    { texto: "Pedir partido simple sin circus", efectos: { reputacion: 6, moral: 5 } },
    { texto: "Posponer", efectos: { moral: 2 } },
  ]],
];

/**
 * @param {[string,string,any][]} list
 * @param {Tramo} tramo
 * @param {Cat} cat
 */
function mapList(list, tramo, cat) {
  return list.map(([id, texto, opciones]) => ev(id, tramo, cat, texto, opciones));
}

function buildAll() {
  /** @type {ReturnType<typeof ev>[]} */
  const all = [
    ...mapList(CAN_GEN, "cantera", "generico"),
    ...mapList(CAN_COL, "cantera", "colombia_especifico"),
    ...mapList(CON_GEN, "consolidacion", "generico"),
    ...mapList(CON_COL, "consolidacion", "colombia_especifico"),
    ...mapList(PRIME_GEN, "prime", "generico"),
    ...mapList(PRIME_COL, "prime", "colombia_especifico"),
    ...mapList(VET_GEN, "veteran", "generico"),
    ...mapList(VET_COL, "veteran", "colombia_especifico"),
  ];

  // Deduplicate by id
  const seen = new Set();
  const unique = [];
  for (const e of all) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    unique.push(e);
  }
  return unique;
}

function varySituationText(baseText, i) {
  const intros = [
    null,
    "Esta semana cambia el panorama: ",
    "Sin esperarlo, ",
    "En la interna del club, ",
    "De un día para otro, ",
    "En medio de la pretemporada, ",
    "Con el calendario encima, ",
    "Cuando más necesitabas foco, ",
  ];
  const intro = intros[i % intros.length];
  if (!intro) return baseText;
  const rest = baseText.charAt(0).toLowerCase() + baseText.slice(1);
  return `${intro}${rest}`;
}

function expandToTarget(events) {
  const targets = { cantera: 60, consolidacion: 100, prime: 100, veteran: 40 };
  const by = { cantera: [], consolidacion: [], prime: [], veteran: [] };
  for (const e of events) by[e.tramoCarrera].push(e);

  const fillers = {
    cantera: { gen: CAN_GEN, col: CAN_COL },
    consolidacion: { gen: CON_GEN, col: CON_COL },
    prime: { gen: PRIME_GEN, col: PRIME_COL },
    veteran: { gen: VET_GEN, col: VET_COL },
  };

  for (const tramo of Object.keys(targets)) {
    let i = 0;
    let guard = 0;
    while (by[tramo].length < targets[tramo] && guard < 500) {
      i += 1;
      guard += 1;
      const wantCol =
        by[tramo].filter((e) => e.categoria === "colombia_especifico").length /
          Math.max(1, by[tramo].length) <
        0.4;
      const pool = wantCol ? fillers[tramo].col : fillers[tramo].gen;
      const base = pool[i % pool.length];
      const id = `${tramo.slice(0, 3)}-extra-${String(i).padStart(3, "0")}`;
      if (by[tramo].some((e) => e.id === id)) continue;
      // Reusa la situación y SUS opciones (no mezclar OPT ajenos).
      const texto = varySituationText(base[1], i);
      const opciones = base[2].map((o) => ({
        texto: o.texto,
        efectos: structuredClone(o.efectos),
      }));
      by[tramo].push(
        ev(
          id,
          /** @type {Tramo} */ (tramo),
          wantCol ? "colombia_especifico" : "generico",
          texto,
          opciones
        )
      );
    }
  }

  return [...by.cantera, ...by.consolidacion, ...by.prime, ...by.veteran];
}

function toTs(events) {
  const counts = {};
  const cats = {};
  for (const e of events) {
    counts[e.tramoCarrera] = (counts[e.tramoCarrera] || 0) + 1;
    cats[e.categoria] = (cats[e.categoria] || 0) + 1;
  }

  const body = events
    .map((e) => {
      const ops = e.opciones
        .map(
          (o) =>
            `    {\n      texto: ${JSON.stringify(o.texto)},\n      efectos: ${JSON.stringify(o.efectos)},\n    }`
        )
        .join(",\n");
      return `  {\n    id: ${JSON.stringify(e.id)},\n    tramoCarrera: ${JSON.stringify(e.tramoCarrera)},\n    categoria: ${JSON.stringify(e.categoria)},\n    texto: ${JSON.stringify(e.texto)},\n    opciones: [\n${ops},\n    ],\n  }`;
    })
    .join(",\n");

  return `import type { EventoDecision } from "./types";

/**
 * Banco de eventos del simulador de carrera (~300).
 * Distribución: cantera ${counts.cantera}, consolidación ${counts.consolidacion}, prime ${counts.prime}, veteranía ${counts.veteran}.
 * Categorías: genérico ${cats.generico}, colombia_especifico ${cats.colombia_especifico}.
 * Generado/actualizado por scripts/generate-carrera-eventos.mjs
 */
export const EVENTOS_CARRERA: EventoDecision[] = [
${body},
];

export function getEventosByTramo(tramo: EventoDecision["tramoCarrera"]): EventoDecision[] {
  return EVENTOS_CARRERA.filter((e) => e.tramoCarrera === tramo);
}
`;
}

const base = buildAll();
const full = expandToTarget(base);
writeFileSync(OUT, toTs(full), "utf8");

const counts = {};
for (const e of full) counts[e.tramoCarrera] = (counts[e.tramoCarrera] || 0) + 1;
console.log("Wrote", full.length, "events →", OUT);
console.log(counts);
