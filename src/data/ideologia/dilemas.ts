import type { PreguntaDilema } from "./types";

/**
 * 20 dilemas A/B. Ejes: − = polo izquierdo, + = polo derecho
 * (Resultadismo/Idealismo, Orden/Libertad, Posesión/Verticalidad, Individual/Colectivo).
 */
export const DILEMAS: PreguntaDilema[] = [
  {
    id: "d01",
    texto: "Vas ganando 1-0 en el minuto 80. ¿Qué haces?",
    opcionA: {
      texto: "Ingresas a un jugador defensivo y cierras el equipo atrás",
      efectos: { resultadismoIdealismo: -18, ordenLibertad: -12, posesionVerticalidad: 6 },
    },
    opcionB: {
      texto: "Sigues atacando para liquidarlo",
      efectos: { resultadismoIdealismo: 14, ordenLibertad: 8, posesionVerticalidad: 8 },
    },
  },
  {
    id: "d02",
    texto: "¿Prefieres ganar 1-0 sufriendo o perder 3-2 jugando bien?",
    opcionA: {
      texto: "Ganar 1-0 sufriendo: el resultado es sagrado",
      efectos: { resultadismoIdealismo: -22, ordenLibertad: -8 },
    },
    opcionB: {
      texto: "Perder 3-2 jugando bien: la idea no se negocia",
      efectos: { resultadismoIdealismo: 22, ordenLibertad: 10 },
    },
  },
  {
    id: "d03",
    texto: "Tienes un 10 genial pero irregular. ¿Cómo lo usas?",
    opcionA: {
      texto: "Libertad total: que invente y desequilibre",
      efectos: { ordenLibertad: 18, individualColectivo: -16, resultadismoIdealismo: 8 },
    },
    opcionB: {
      texto: "Roles claros: que se ajuste al sistema del equipo",
      efectos: { ordenLibertad: -18, individualColectivo: 16, resultadismoIdealismo: -6 },
    },
  },
  {
    id: "d04",
    texto: "¿Cómo prefieres construir el ataque?",
    opcionA: {
      texto: "Pases cortos, paciencia y control del ritmo",
      efectos: { posesionVerticalidad: -20, ordenLibertad: -8, resultadismoIdealismo: 6 },
    },
    opcionB: {
      texto: "Pase largo, espacio a espaldas y transición rápida",
      efectos: { posesionVerticalidad: 20, ordenLibertad: 6, resultadismoIdealismo: -6 },
    },
  },
  {
    id: "d05",
    texto: "El rival te aplasta en el mediocampo. ¿Cuál es tu reacción?",
    opcionA: {
      texto: "Bajar líneas, compactar y salir de contragolpe",
      efectos: { resultadismoIdealismo: -14, ordenLibertad: -14, posesionVerticalidad: 14 },
    },
    opcionB: {
      texto: "Subir la presión y pelear la pelota arriba",
      efectos: { resultadismoIdealismo: 10, ordenLibertad: -6, posesionVerticalidad: -8, individualColectivo: 8 },
    },
  },
  {
    id: "d06",
    texto: "¿Qué valoras más en un plantel?",
    opcionA: {
      texto: "Una figura estrella que resuelva partidos",
      efectos: { individualColectivo: -20, resultadismoIdealismo: -4, ordenLibertad: 8 },
    },
    opcionB: {
      texto: "Once nombres que se entienden sin mirarse",
      efectos: { individualColectivo: 20, ordenLibertad: -8, resultadismoIdealismo: 4 },
    },
  },
  {
    id: "d07",
    texto: "Final de torneo: te ofrecen un empate que te clasifica o arriesgar a ganar el grupo.",
    opcionA: {
      texto: "Aseguro la clasificación y quedo tranquilo",
      efectos: { resultadismoIdealismo: -20, ordenLibertad: -6 },
    },
    opcionB: {
      texto: "Salgo a ganar: no juego a no perder",
      efectos: { resultadismoIdealismo: 18, ordenLibertad: 8, posesionVerticalidad: 6 },
    },
  },
  {
    id: "d08",
    texto: "Entrenamiento: ¿más automatismos o más juegos libres?",
    opcionA: {
      texto: "Automatismos y repetición hasta el cansancio",
      efectos: { ordenLibertad: -20, individualColectivo: 10 },
    },
    opcionB: {
      texto: "Situaciones abiertas para que piensen y creen",
      efectos: { ordenLibertad: 20, individualColectivo: -8, resultadismoIdealismo: 6 },
    },
  },
  {
    id: "d09",
    texto: "Vas 0-0 y la hinchada silba. ¿Qué priorizas?",
    opcionA: {
      texto: "Mantener el plan aunque no guste en la tribuna",
      efectos: { ordenLibertad: -12, resultadismoIdealismo: -8, individualColectivo: 8 },
    },
    opcionB: {
      texto: "Ingresar a un creativo y buscar el gol ya",
      efectos: { ordenLibertad: 10, resultadismoIdealismo: 8, individualColectivo: -10, posesionVerticalidad: 6 },
    },
  },
  {
    id: "d10",
    texto: "¿Cómo defiendes un córner a favor del rival en el 90'?",
    opcionA: {
      texto: "Todos atrás, zona marcada, cero riesgos",
      efectos: { resultadismoIdealismo: -16, ordenLibertad: -14, posesionVerticalidad: 4 },
    },
    opcionB: {
      texto: "Dejo a uno arriba para la salida rápida",
      efectos: { resultadismoIdealismo: 8, posesionVerticalidad: 12, ordenLibertad: 6 },
    },
  },
  {
    id: "d11",
    texto: "Fichaje clave: ¿figura costosa o tres piezas de sistema?",
    opcionA: {
      texto: "La figura: un partido lo define él",
      efectos: { individualColectivo: -18, resultadismoIdealismo: -6 },
    },
    opcionB: {
      texto: "Tres piezas: el sistema gana partidos",
      efectos: { individualColectivo: 18, ordenLibertad: -8, resultadismoIdealismo: 4 },
    },
  },
  {
    id: "d12",
    texto: "¿Cuál es tu idea de 'buen partido'?",
    opcionA: {
      texto: "80% de posesión y el rival sin oler el área",
      efectos: { posesionVerticalidad: -22, resultadismoIdealismo: 10, ordenLibertad: -10 },
    },
    opcionB: {
      texto: "Tres contras letales y el arco en fiesta",
      efectos: { posesionVerticalidad: 22, resultadismoIdealismo: -8, ordenLibertad: 6 },
    },
  },
  {
    id: "d13",
    texto: "El capitán cuestiona tu once en el vestuario. ¿Qué haces?",
    opcionA: {
      texto: "Impones la línea: el tablero no se discute",
      efectos: { ordenLibertad: -16, individualColectivo: 8, resultadismoIdealismo: -6 },
    },
    opcionB: {
      texto: "Abres el debate y ajustas con el grupo",
      efectos: { ordenLibertad: 12, individualColectivo: 12, resultadismoIdealismo: 4 },
    },
  },
  {
    id: "d14",
    texto: "¿Cómo atacas un bloque bajo de 10 atrás?",
    opcionA: {
      texto: "Paciencia, circulación y movimiento constante",
      efectos: { posesionVerticalidad: -16, ordenLibertad: -6, resultadismoIdealismo: 8 },
    },
    opcionB: {
      texto: "Centros, duelos y un 9 que gane de arriba",
      efectos: { posesionVerticalidad: 14, individualColectivo: -8, resultadismoIdealismo: -8 },
    },
  },
  {
    id: "d15",
    texto: "Un juvenil se pasa de la raya pero rinde. ¿Qué priorizas?",
    opcionA: {
      texto: "Normas para todos: nadie por encima del colectivo",
      efectos: { individualColectivo: 16, ordenLibertad: -12, resultadismoIdealismo: -4 },
    },
    opcionB: {
      texto: "Talento primero: le das margen si marca la diferencia",
      efectos: { individualColectivo: -16, ordenLibertad: 14, resultadismoIdealismo: 4 },
    },
  },
  {
    id: "d16",
    texto: "Clásico: ¿planteo para no perder o para ganar?",
    opcionA: {
      texto: "No perder: empatar de visitante es un gran resultado",
      efectos: { resultadismoIdealismo: -18, ordenLibertad: -10, posesionVerticalidad: 8 },
    },
    opcionB: {
      texto: "Salir a ganar: el clásico se juega de frente",
      efectos: { resultadismoIdealismo: 16, ordenLibertad: 8, posesionVerticalidad: -4 },
    },
  },
  {
    id: "d17",
    texto: "¿Quién manda más en tu modelo?",
    opcionA: {
      texto: "El esquema y las distancias entre líneas",
      efectos: { ordenLibertad: -18, individualColectivo: 12, posesionVerticalidad: -6 },
    },
    opcionB: {
      texto: "La lectura del jugador en el momento",
      efectos: { ordenLibertad: 18, individualColectivo: -10, resultadismoIdealismo: 6 },
    },
  },
  {
    id: "d18",
    texto: "Vas perdiendo 0-1. ¿Cambio de sistema o más agresividad?",
    opcionA: {
      texto: "Cambio de dibujo y control del medio",
      efectos: { ordenLibertad: -10, posesionVerticalidad: -12, resultadismoIdealismo: 4 },
    },
    opcionB: {
      texto: "Ingreso delanteros y voy a buscar el empate ya",
      efectos: { posesionVerticalidad: 14, ordenLibertad: 8, resultadismoIdealismo: -6, individualColectivo: -6 },
    },
  },
  {
    id: "d19",
    texto: "Selección / club: ¿identidad de juego fija o adaptación al rival?",
    opcionA: {
      texto: "Identidad fija: que el rival se adapte a nosotros",
      efectos: { resultadismoIdealismo: 14, ordenLibertad: -8, posesionVerticalidad: -8 },
    },
    opcionB: {
      texto: "Adaptación: cada rival pide un plan distinto",
      efectos: { resultadismoIdealismo: -14, ordenLibertad: -12, posesionVerticalidad: 6 },
    },
  },
  {
    id: "d20",
    texto: "Última pregunta: ¿qué frase te representa más?",
    opcionA: {
      texto: "\"El resultado justifica el camino\"",
      efectos: { resultadismoIdealismo: -20, ordenLibertad: -8, individualColectivo: 6 },
    },
    opcionB: {
      texto: "\"Jugar bien es la única forma honesta de ganar\"",
      efectos: { resultadismoIdealismo: 20, ordenLibertad: 10, individualColectivo: -4 },
    },
  },
];

export function getDilemaById(id: string): PreguntaDilema | undefined {
  return DILEMAS.find((d) => d.id === id);
}
