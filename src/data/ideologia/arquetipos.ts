import type { ArquetipoDT } from "./types";

/**
 * Vectores de referencia (−100…100) por eje:
 * resultadismoIdealismo: − Pragmático/resultadista · + Dogmático/idealista
 * ordenLibertad: − Orden · + Libertad
 * posesionVerticalidad: − Posesión · + Vertical
 * individualColectivo: − Individual · + Colectivo
 *
 * Posiciones editoriales (no dataset externo). Ajustables.
 */
export const ARQUETIPOS_DT: ArquetipoDT[] = [
  {
    id: "bielsa",
    nombre: "Marcelo Bielsa",
    apodoOFrase: "El Loco — presión y convicción sin concesiones",
    etiquetaMapa: "PREDICADOR DEL VÉRTIGO",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: 70,
      ordenLibertad: -40,
      posesionVerticalidad: 72,
      individualColectivo: 65,
    },
    descripcion:
      "Crees en un ideario que no se negocia: intensidad, verticalidad y trabajo colectivo. Prefieres ser fiel a la idea aunque el marcador duela.",
  },
  {
    id: "guardiola",
    nombre: "Pep Guardiola",
    apodoOFrase: "Control absoluto del balón y del espacio",
    etiquetaMapa: "MONJE DE LA TENENCIA",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: 58,
      ordenLibertad: -60,
      posesionVerticalidad: -82,
      individualColectivo: 45,
    },
    descripcion:
      "El partido se gana con la pelota y con estructura. Te obsesiona el control, la posición y que el equipo piense como un solo cerebro.",
  },
  {
    id: "simeone",
    nombre: "Diego Simeone",
    apodoOFrase: "Partido a partido — garra y contragolpe",
    etiquetaMapa: "FIEL AL PLAN",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: -72,
      ordenLibertad: -78,
      posesionVerticalidad: 62,
      individualColectivo: 70,
    },
    descripcion:
      "El resultado manda. Orden defensivo, actitud y transición rápida. El vestuario se gana con compromiso, no con estética.",
  },
  {
    id: "mourinho",
    nombre: "José Mourinho",
    apodoOFrase: "Pragmatismo de élite — controlar el partido",
    etiquetaMapa: "CAMALEÓN",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: -35,
      ordenLibertad: -55,
      posesionVerticalidad: 22,
      individualColectivo: 15,
    },
    descripcion:
      "Ganar es el estilo. Adaptas el plan al rival, gestionas egos y prefieres un 1-0 inteligente a un festival de goles en contra.",
  },
  {
    id: "bilardo",
    nombre: "Carlos Bilardo",
    apodoOFrase: "No importa cómo: importa ganar",
    etiquetaMapa: "RESULTADO PRIMERO",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: -88,
      ordenLibertad: -45,
      posesionVerticalidad: 40,
      individualColectivo: 55,
    },
    descripcion:
      "El fútbol es un problema a resolver. Si hay que ensuciarlo, se ensucia. La victoria justifica el método.",
  },
  {
    id: "menotti",
    nombre: "César Luis Menotti",
    apodoOFrase: "La pelota no se mancha — libertad y belleza",
    etiquetaMapa: "ESTETA LIBERTARIO",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: 85,
      ordenLibertad: 68,
      posesionVerticalidad: -18,
      individualColectivo: -35,
    },
    descripcion:
      "El juego es cultura. Defiendes la libertad del jugador, la estética y la idea de que se puede ganar sin renunciar a la identidad.",
  },
  {
    id: "ancelotti",
    nombre: "Carlo Ancelotti",
    apodoOFrase: "Gestión de estrellas y equilibrio táctico",
    etiquetaMapa: "ADMINISTRADOR DEL RITMO",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: -48,
      ordenLibertad: -35,
      posesionVerticalidad: -42,
      individualColectivo: 20,
    },
    descripcion:
      "Adaptas el sistema al plantel y al momento. Priorizas el equilibrio, la gestión del grupo y dejar que las figuras resuelvan en el tramo final.",
  },
  {
    id: "ferguson",
    nombre: "Alex Ferguson",
    apodoOFrase: "Mentalidad ganadora y verticalidad en momentos clave",
    etiquetaMapa: "EQUILIBRISTA COMPETITIVO",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: -58,
      ordenLibertad: -30,
      posesionVerticalidad: 38,
      individualColectivo: 45,
    },
    descripcion:
      "El partido se gana con carácter, ritmo alto y decisiones en los minutos decisivos. Compites siempre, con o sin la pelota.",
  },
  {
    id: "gallardo",
    nombre: "Marcelo Gallardo",
    apodoOFrase: "Presión alta y transiciones agudas",
    etiquetaMapa: "PUNZANTE ESTRATÉGICO",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: 52,
      ordenLibertad: -25,
      posesionVerticalidad: 52,
      individualColectivo: 55,
    },
    descripcion:
      "Presionas arriba, recuperas rápido y atacas con verticalidad. La idea es clara: incomodar al rival y castigar en la transición.",
  },
  {
    id: "bianchi",
    nombre: "Carlos Bianchi",
    apodoOFrase: "Pragmatismo campeón y adaptación al rival",
    etiquetaMapa: "CAMALEÓN",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: -18,
      ordenLibertad: -40,
      posesionVerticalidad: 28,
      individualColectivo: 25,
    },
    descripcion:
      "Cambias el plan según el contexto. Lo importante es competir bien, leer al rival y encontrar la fórmula que te acerque al título.",
  },
  {
    id: "klopp",
    nombre: "Jürgen Klopp",
    apodoOFrase: "Gegenpressing y fútbol de vértigo",
    etiquetaMapa: "PREDICADOR DEL VÉRTIGO",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: 62,
      ordenLibertad: 15,
      posesionVerticalidad: 68,
      individualColectivo: 72,
    },
    descripcion:
      "El fútbol es emoción y presión. Recuperas la pelota arriba, corres en bloque y conviertes cada partido en una avalancha.",
  },
  {
    id: "conte",
    nombre: "Antonio Conte",
    apodoOFrase: "Estructura, trabajo y fidelidad al esquema",
    etiquetaMapa: "FIEL AL PLAN",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: 75,
      ordenLibertad: -68,
      posesionVerticalidad: 5,
      individualColectivo: 68,
    },
    descripcion:
      "El sistema manda. Exiges a cada jugador su función, defiendes con bloque compacto y atacas con orden y convicción.",
  },
  {
    id: "cruyff",
    nombre: "Johan Cruyff",
    apodoOFrase: "Posición, toque y fútbol total",
    etiquetaMapa: "MONJE DE LA TENENCIA",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: 78,
      ordenLibertad: 55,
      posesionVerticalidad: -88,
      individualColectivo: 30,
    },
    descripcion:
      "El balón es el centro del juego. Buscas la superioridad posicional, el toque corto y una identidad que trascienda el resultado inmediato.",
  },
  {
    id: "luisenrique",
    nombre: "Luis Enrique",
    apodoOFrase: "Posesión dinámica y asociación flexible",
    etiquetaMapa: "ASOCIATIVO FLEXIBLE",
    origen: "internacional",
    vectorIdeologico: {
      resultadismoIdealismo: 12,
      ordenLibertad: 20,
      posesionVerticalidad: -38,
      individualColectivo: 42,
    },
    descripcion:
      "Combinas posesión con verticalidad según el rival. Te gusta el juego asociativo, la movilidad y adaptar el ritmo sin perder la idea.",
  },
  {
    id: "pekerman",
    nombre: "José Pékerman",
    apodoOFrase: "Proceso, orden y apuesta por la juventud",
    etiquetaMapa: "ARQUITECTO DE PROCESO",
    origen: "colombia",
    vectorIdeologico: {
      resultadismoIdealismo: 5,
      ordenLibertad: -42,
      posesionVerticalidad: -48,
      individualColectivo: 35,
    },
    descripcion:
      "Equilibrio y paciencia. Crees en procesos, en el orden táctico moderado y en dar minutos a quienes construyen el futuro del equipo.",
  },
  {
    id: "bolillo",
    nombre: 'Hernán Darío "Bolillo" Gómez',
    apodoOFrase: "Garra, actitud y pragmatismo criollo",
    etiquetaMapa: "GARRA Y OFICIO",
    origen: "colombia",
    vectorIdeologico: {
      resultadismoIdealismo: -52,
      ordenLibertad: -22,
      posesionVerticalidad: 48,
      individualColectivo: 40,
    },
    descripcion:
      "Más actitud que tablero fino. Priorizas carácter, sacrificio y soluciones simples para competir en cualquier cancha.",
  },
  {
    id: "rueda",
    nombre: "Reinaldo Rueda",
    apodoOFrase: "Disciplina, bloque bajo y colectivo",
    etiquetaMapa: "BLOQUE DISCIPLINADO",
    origen: "colombia",
    vectorIdeologico: {
      resultadismoIdealismo: 18,
      ordenLibertad: -72,
      posesionVerticalidad: 8,
      individualColectivo: 75,
    },
    descripcion:
      "El equipo por encima de la figura. Orden defensivo, bajo perfil y un plan que se sostiene con trabajo y disciplina.",
  },
  {
    id: "lfsuarez",
    nombre: "Luis Fernando Suárez",
    apodoOFrase: "Gestión de grupo y pragmatismo sereno",
    etiquetaMapa: "GESTOR SERENO",
    origen: "colombia",
    vectorIdeologico: {
      resultadismoIdealismo: -8,
      ordenLibertad: -28,
      posesionVerticalidad: -5,
      individualColectivo: 55,
    },
    descripcion:
      "Menos protagonismo táctico, más liderazgo humano. Formas el colectivo, cuidas el vestuario y buscas resultados sin dramas.",
  },
  {
    id: "gamero",
    nombre: "Alberto Gamero",
    apodoOFrase: "Orden, intensidad y competencia constante",
    etiquetaMapa: "ADMINISTRADOR DEL RITMO",
    origen: "colombia",
    vectorIdeologico: {
      resultadismoIdealismo: -55,
      ordenLibertad: -48,
      posesionVerticalidad: -58,
      individualColectivo: 50,
    },
    descripcion:
      "Te gusta un equipo intenso, ordenado y competitivo. Priorizas el ritmo de trabajo, la idea colectiva y pelear cada partido sin perder la cabeza.",
  },
  {
    id: "maturana",
    nombre: "Francisco Maturana",
    apodoOFrase: "Toque colombiano, identidad y posesión",
    etiquetaMapa: "TOQUE CON IDENTIDAD",
    origen: "colombia",
    vectorIdeologico: {
      resultadismoIdealismo: 42,
      ordenLibertad: 25,
      posesionVerticalidad: -62,
      individualColectivo: -15,
    },
    descripcion:
      "Crees en un fútbol con sello propio: asociación, talento y una idea clara de cómo debe jugarse, más allá del resultado inmediato.",
  },
  {
    id: "montoya",
    nombre: 'Luis Fernando "El Profe" Montoya',
    apodoOFrase: "Pragmatismo campeón — Once Caldas 2004",
    etiquetaMapa: "EQUILIBRISTA COMPETITIVO",
    origen: "colombia",
    vectorIdeologico: {
      resultadismoIdealismo: -65,
      ordenLibertad: -55,
      posesionVerticalidad: 15,
      individualColectivo: 60,
    },
    descripcion:
      "Ganar con un plan sólido: compacto, colectivo y sin florituras innecesarias. El resultado se construye con oficio y convicción.",
  },
];

export function getArquetipoById(id: string): ArquetipoDT | undefined {
  return ARQUETIPOS_DT.find((a) => a.id === id);
}

export function inicialesNombre(nombre: string): string {
  const limpio = nombre.replace(/["']/g, "");
  const parts = limpio.split(/\s+/).filter(Boolean);
  const skip = new Set(["de", "del", "la", "el", "los", "las", "y"]);
  const meaningful = parts.filter((p) => !skip.has(p.toLowerCase()));
  if (meaningful.length === 0) return "?";
  if (meaningful.length === 1) return meaningful[0].slice(0, 2).toUpperCase();
  return (
    meaningful[0][0] + meaningful[meaningful.length - 1][0]
  ).toUpperCase();
}
