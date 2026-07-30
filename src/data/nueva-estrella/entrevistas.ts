import type { PreguntaEntrevista } from "./types";

export const ENTREVISTAS: PreguntaEntrevista[] = [
  {
    id: "post-partido",
    pregunta: "¿Cómo analizás el partido de hoy?",
    opciones: [
      {
        id: "dip1",
        texto: "Respetamos al rival y seguimos trabajando.",
        deltaFama: 3,
        deltaMoral: 2,
        tono: "diplomatica",
      },
      {
        id: "pol1",
        texto: "El árbitro nos robó. Así no se puede.",
        deltaFama: 8,
        deltaMoral: -4,
        tono: "polemica",
      },
      {
        id: "gra1",
        texto: "Dimos el 110%. El fútbol es así, ¿viste?",
        deltaFama: 5,
        deltaMoral: 3,
        tono: "graciosa",
      },
    ],
  },
  {
    id: "seleccion",
    pregunta: "¿Te imaginás en la Selección pronto?",
    opciones: [
      {
        id: "dip2",
        texto: "Si llego, será por el trabajo del club.",
        deltaFama: 4,
        deltaMoral: 3,
        tono: "diplomatica",
      },
      {
        id: "pol2",
        texto: "Ya estoy listo. Que me convoquen ya.",
        deltaFama: 6,
        deltaMoral: -2,
        tono: "polemica",
      },
      {
        id: "gra2",
        texto: "Primero el asado del domingo, después vemos.",
        deltaFama: 7,
        deltaMoral: 4,
        tono: "graciosa",
      },
    ],
  },
  {
    id: "companeros",
    pregunta: "Hay rumores de roce en el vestuario…",
    opciones: [
      {
        id: "dip3",
        texto: "Somos un grupo unido. No hay drama.",
        deltaFama: 2,
        deltaMoral: 4,
        tono: "diplomatica",
      },
      {
        id: "pol3",
        texto: "Algunos no están al nivel. Punto.",
        deltaFama: 9,
        deltaMoral: -6,
        tono: "polemica",
      },
      {
        id: "gra3",
        texto: "El único roce es el del champú compartido.",
        deltaFama: 6,
        deltaMoral: 5,
        tono: "graciosa",
      },
    ],
  },
  {
    id: "patrocinio",
    pregunta: "Una marca quiere que digas que su bebida te da energía. ¿Qué decís?",
    opciones: [
      {
        id: "dip4",
        texto: "Entreno duro; la bebida es solo un plus.",
        deltaFama: 4,
        deltaMoral: 1,
        tono: "diplomatica",
      },
      {
        id: "pol4",
        texto: "Sin esa lata no corro. Compren, compren.",
        deltaFama: 10,
        deltaMoral: -3,
        tono: "polemica",
      },
      {
        id: "gra4",
        texto: "Me gusta más el jugo de mi mamá, pero ok.",
        deltaFama: 5,
        deltaMoral: 4,
        tono: "graciosa",
      },
    ],
  },
];

export function pickEntrevista(seed: number): PreguntaEntrevista {
  return ENTREVISTAS[Math.abs(seed) % ENTREVISTAS.length]!;
}
