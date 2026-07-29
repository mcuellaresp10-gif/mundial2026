import type { CategoriaCrucigrama, PalabraPista } from "./types";

function p(
  id: string,
  palabra: string,
  pista: string,
  categoria: CategoriaCrucigrama
): PalabraPista {
  const w = palabra
    .toUpperCase()
    .replace(/Ñ/g, "#")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/#/g, "Ñ")
    .replace(/[^A-ZÑ]/g, "");
  return { id, palabra: w, longitud: w.length, pista, categoria };
}

const RAW: PalabraPista[] = [
  // Colombia — cortas
  p("c01", "GOL", "Anotación en el arco rival", "colombia"),
  p("c02", "VAR", "Ayuda arbitral por video", "colombia"),
  p("c03", "FCF", "Siglas de la Federación colombiana", "colombia"),
  p("c04", "TEO", "Apodo de Gutiérrez, goleador", "colombia"),
  p("c05", "ARCO", "Meta que defiende el arquero", "colombia"),
  p("c06", "COPA", "Torneo de eliminación nacional", "colombia"),
  p("c07", "LIGA", "Campeonato por fechas", "colombia"),
  p("c08", "CALI", "Ciudad de América y Deportivo Cali", "colombia"),
  p("c09", "DIAZ", "Apellido de Luis, extremo", "colombia"),
  p("c10", "MINA", "Central Yerry", "colombia"),
  p("c11", "JAMES", "Diez creativo de Cúcuta", "colombia"),
  p("c12", "BACCA", "Delantero costeño", "colombia"),
  p("c13", "BORJA", "Delantero Miguel Ángel", "colombia"),
  p("c14", "PASTO", "Club del Galeras", "colombia"),
  p("c15", "HUILA", "Equipo del sur andino", "colombia"),
  p("c16", "CHICO", "Boyacá Chicó", "colombia"),
  p("c17", "PENAL", "Tiro desde los once metros", "colombia"),
  p("c18", "HINCHA", "Seguidor de un club", "colombia"),
  p("c19", "CANCHA", "Terreno de juego", "colombia"),
  p("c20", "CORNER", "Saque de esquina", "colombia"),
  p("c21", "JUNIOR", "Tiburón de Barranquilla", "colombia"),
  p("c22", "TOLIMA", "Vinotinto de Ibagué", "colombia"),
  p("c23", "FALCAO", "El Tigre, goleador", "colombia"),
  p("c24", "OSPINA", "Arquero con carrera en Europa", "colombia"),
  p("c25", "YEPES", "Central histórico tricolor", "colombia"),
  p("c26", "IBAGUE", "Sede del Deportes Tolima", "colombia"),
  p("c27", "CUCUTA", "Ciudad fronteriza con club histórico", "colombia"),
  p("c28", "PAISA", "Clásico Nacional–Medellín", "colombia"),
  p("c29", "LUCHO", "Apodo popular de Luis Díaz", "colombia"),
  p("c30", "ZAPATA", "Duván, delantero potente", "colombia"),
  p("c31", "GUARIN", "Volante Fredy", "colombia"),
  p("c32", "HIGUITA", "Arquero del escorpión", "colombia"),
  p("c33", "AMERICA", "Escarlata de Cali", "colombia"),
  p("c34", "BOGOTA", "Capital de Millos y Santa Fe", "colombia"),
  p("c35", "SANTAFE", "León cardenal de Bogotá", "colombia"),
  p("c36", "ASCENSO", "Subir de categoría", "colombia"),
  p("c37", "TRIBUNA", "Sector de graderías", "colombia"),
  p("c38", "OFFSIDE", "Posición adelantada", "colombia"),
  p("c39", "BETPLAY", "Nombre comercial de la primera división", "colombia"),
  p("c40", "DIMAYOR", "Organiza el fútbol profesional", "colombia"),
  p("c41", "CLASICO", "Derbi entre rivales históricos", "colombia"),
  p("c42", "CAMPIN", "Estadio Nemesio Camacho", "colombia"),
  p("c43", "NACIONAL", "Verdolaga de Medellín", "colombia"),
  p("c44", "MEDELLIN", "Ciudad de Nacional e Independiente", "colombia"),
  p("c45", "ENVIGADO", "Cantera antioqueña", "colombia"),
  p("c46", "EQUIDAD", "Club bogotano", "colombia"),
  p("c47", "ALIANZA", "Petrolera / club costeño", "colombia"),
  p("c48", "AGUILAR", "Abel, mediocentro", "colombia"),
  p("c49", "CORDOBA", "Iván el Terrible", "colombia"),
  p("c50", "ASPRILLA", "Faustino, extremo", "colombia"),
  p("c51", "RENTERIA", "Goleador histórico selección", "colombia"),
  p("c52", "QUINTERO", "Juan Fernando, enganche", "colombia"),
  p("c53", "CUADRADO", "Extremo de la Selección", "colombia"),
  p("c54", "MATURANA", "DT de Colombia en USA 94", "colombia"),
  p("c55", "PEKERMAN", "DT de la tricolor en Brasil 2014", "colombia"),
  p("c56", "TIBURON", "Apodo de Junior", "colombia"),
  p("c57", "CARDENAL", "Apodo de Santa Fe", "colombia"),
  p("c58", "VERDOLAGA", "Apodo de Atlético Nacional", "colombia"),
  p("c59", "ESCARLATA", "Apodo de América de Cali", "colombia"),
  p("c60", "ATANALIO", "Estadio de Barranquilla", "colombia"),
  p("c61", "ONCECALDAS", "Blanco de Manizales", "colombia"),
  p("c62", "MILLONARIOS", "Azul histórico de Bogotá", "colombia"),
  p("c63", "VALDERRAMA", "El Pibe", "colombia"),
  p("c64", "AZUCARERO", "Apodo de Deportivo Cali", "colombia"),
  p("c65", "CAPITALINO", "Relativo al clásico de Bogotá", "colombia"),
  p("c66", "ANTIOQUENO", "Clásico paisa (sin tilde)", "colombia"),
  p("c67", "GOLEADOR", "Máximo anotador de un torneo", "colombia"),
  p("c68", "ARQUERO", "Portero", "colombia"),
  p("c69", "LATERAL", "Defensor de banda", "colombia"),
  p("c70", "VOLANTE", "Mediocampista", "colombia"),

  // Sudamérica
  p("s01", "PELE", "O Rei de Brasil", "sudamerica"),
  p("s02", "BOCA", "Xeneize de La Bombonera", "sudamerica"),
  p("s03", "LDU", "Liga de Quito", "sudamerica"),
  p("s04", "MESSI", "Astro rosarino", "sudamerica"),
  p("s05", "ZICO", "Galinho brasileño", "sudamerica"),
  p("s06", "RIVER", "Millonario de Núñez", "sudamerica"),
  p("s07", "PERU", "Blanquirroja", "sudamerica"),
  p("s08", "CHILE", "La Roja", "sudamerica"),
  p("s09", "TEVEZ", "El Apache", "sudamerica"),
  p("s10", "AGUERO", "El Kun", "sudamerica"),
  p("s11", "CAVANI", "Matador uruguayo", "sudamerica"),
  p("s12", "SUAREZ", "Luis, goleador celeste", "sudamerica"),
  p("s13", "FORLAN", "Diego, figura 2010", "sudamerica"),
  p("s14", "KEMPES", "Matador del Mundial 78", "sudamerica"),
  p("s15", "GARECA", "DT argentino en la región", "sudamerica"),
  p("s16", "BILARDO", "DT campeón 1986", "sudamerica"),
  p("s17", "MENOTTI", "DT campeón 1978", "sudamerica"),
  p("s18", "EMELEC", "Eléctrico de Guayaquil", "sudamerica"),
  p("s19", "OLIMPIA", "Decano paraguayo", "sudamerica"),
  p("s20", "RECOPA", "Libertadores vs Sudamericana", "sudamerica"),
  p("s21", "NEYMAR", "Astro brasileño", "sudamerica"),
  p("s22", "SANTOS", "Club de Pelé", "sudamerica"),
  p("s23", "ROMARIO", "Baixinho", "sudamerica"),
  p("s24", "RONALDO", "El Fenómeno", "sudamerica"),
  p("s25", "CRESPO", "Hernán, 9 argentino", "sudamerica"),
  p("s26", "VALDANO", "Jorge, Mundial 86", "sudamerica"),
  p("s27", "BOLIVAR", "Celeste de La Paz", "sudamerica"),
  p("s28", "CARACAS", "Capital y club venezolano", "sudamerica"),
  p("s29", "BRASIL", "Pentacampeón mundial", "sudamerica"),
  p("s30", "ECUADOR", "Tri", "sudamerica"),
  p("s31", "BOLIVIA", "Verde del altiplano", "sudamerica"),
  p("s32", "URUGUAY", "Celeste bicampeona", "sudamerica"),
  p("s33", "CELESTE", "Color de Uruguay", "sudamerica"),
  p("s34", "XENEIZE", "Apodo de Boca", "sudamerica"),
  p("s35", "CONMEBOL", "Confederación sudamericana", "sudamerica"),
  p("s36", "FLAMENGO", "Mengão de Río", "sudamerica"),
  p("s37", "MARACANA", "Gigante de Río", "sudamerica"),
  p("s38", "COLOCOLO", "Cacique chileno", "sudamerica"),
  p("s39", "PEÑAROL", "Carbonero uruguayo", "sudamerica"),
  p("s40", "PARAGUAY", "Albirroja", "sudamerica"),
  p("s41", "GARRINCHA", "Ángel torcido", "sudamerica"),
  p("s42", "BATISTUTA", "Batigol", "sudamerica"),
  p("s43", "SCOLARI", "Felipão", "sudamerica"),
  p("s44", "PARREIRA", "DT Brasil 94", "sudamerica"),
  p("s45", "BOMBONERA", "Cancha de Boca", "sudamerica"),
  p("s46", "MONUMENTAL", "Cancha de River", "sudamerica"),
  p("s47", "CENTENARIO", "Estadio de Montevideo", "sudamerica"),
  p("s48", "ARGENTINA", "Albiceleste", "sudamerica"),
  p("s49", "PALMEIRAS", "Verdão paulista", "sudamerica"),
  p("s50", "SAOPAULO", "Tricolor paulista", "sudamerica"),
  p("s51", "MARADONA", "Diez argentino eterno", "sudamerica"),
  p("s52", "DISTEFANO", "La Saeta Rubia", "sudamerica"),
  p("s53", "FRANCESCOLI", "El Príncipe", "sudamerica"),
  p("s54", "RONALDINHO", "Sonrisa mágica", "sudamerica"),
  p("s55", "VENEZUELA", "Vinotinto", "sudamerica"),
  p("s56", "ALBICELESTE", "Apodo de Argentina", "sudamerica"),
  p("s57", "LIBERTADORES", "Máxima copa de clubes", "sudamerica"),
  p("s58", "SUDAMERICANA", "Segunda copa CONMEBOL", "sudamerica"),
  p("s59", "CORINTHIANS", "Timão", "sudamerica"),
  p("s60", "UNIVERSIDAD", "U de Chile / concepto universitario", "sudamerica"),
  p("s61", "CRISTAL", "Sporting Cristal (apellido corto)", "sudamerica"),
  p("s62", "PORTEÑO", "Cerro Porteño", "sudamerica"),
  p("s63", "GUAYAQUIL", "Puerto ecuatoriano de clásicos", "sudamerica"),
  p("s64", "ASUNCION", "Capital paraguaya del fútbol", "sudamerica"),
  p("s65", "QUITO", "Sede de LDU", "sudamerica"),
  p("s66", "LIMA", "Capital de Alianza y Universitario", "sudamerica"),
  p("s67", "LAPAZ", "Sede de Bolívar (sin espacio)", "sudamerica"),
  p("s68", "ROSARIO", "Ciudad de Messi", "sudamerica"),
  p("s69", "GAUCHOS", "Identidad del sur brasileño", "sudamerica"),
  p("s70", "TRICOLOR", "Apodo frecuente en el continente", "sudamerica"),

  // Mundiales
  p("m01", "FIFA", "Órgano rector del fútbol", "mundiales"),
  p("m02", "USA", "Sede 1994 y coanfitrión 2026", "mundiales"),
  p("m03", "BOTA", "Premio al goleador", "mundiales"),
  p("m04", "FINAL", "Partido decisivo", "mundiales"),
  p("m05", "GRUPO", "Fase inicial de cuatro", "mundiales"),
  p("m06", "KANE", "Goleador inglés", "mundiales"),
  p("m07", "SON", "Estrella coreana", "mundiales"),
  p("m08", "XAVI", "Cerebro de España 2010", "mundiales"),
  p("m09", "LOEW", "DT alemán campeón 2014", "mundiales"),
  p("m10", "TATA", "Apodo de Martino", "mundiales"),
  p("m11", "QATAR", "Sede Mundial 2022", "mundiales"),
  p("m12", "RUSIA", "Sede Mundial 2018", "mundiales"),
  p("m13", "KLOSE", "Máximo goleador histórico", "mundiales"),
  p("m14", "MBAPPE", "Estrella francesa", "mundiales"),
  p("m15", "MODRIC", "Balón de Oro 2018", "mundiales"),
  p("m16", "ZIDANE", "Arquitecto francés", "mundiales"),
  p("m17", "MULLER", "Gerd, goleador alemán", "mundiales"),
  p("m18", "ROSSI", "Pablito en España 82", "mundiales"),
  p("m19", "BAGGIO", "Penal del 94", "mundiales"),
  p("m20", "SALAH", "Egipcio estelar", "mundiales"),
  p("m21", "POGBA", "Volante francés", "mundiales"),
  p("m22", "JAPAN", "Samurai Blue", "mundiales"),
  p("m23", "COREA", "Selección asiática histórica", "mundiales"),
  p("m24", "MEXICO", "Sede 70 y 86", "mundiales"),
  p("m25", "CANADA", "Coanfitrión 2026", "mundiales"),
  p("m26", "LUSAIL", "Estadio de la final 2022", "mundiales"),
  p("m27", "AZTECA", "Estadio de finales en México", "mundiales"),
  p("m28", "ITALIA", "Azzurra tetracampeona", "mundiales"),
  p("m29", "FRANCIA", "Campeona 98 y 2018", "mundiales"),
  p("m30", "ESPANA", "Campeona 2010", "mundiales"),
  p("m31", "CROACIA", "Finalista 2018", "mundiales"),
  p("m32", "OCTAVOS", "Primera eliminatoria", "mundiales"),
  p("m33", "CUARTOS", "Fase previa a semis", "mundiales"),
  p("m34", "INIESTA", "Autor del gol de la final 2010", "mundiales"),
  p("m35", "PLATINI", "Diez francés", "mundiales"),
  p("m36", "CRUYFF", "Ícono holandés", "mundiales"),
  p("m37", "WEMBLEY", "Templo inglés", "mundiales"),
  p("m38", "YOKOHAMA", "Final 2002", "mundiales"),
  p("m39", "MUNDIAL", "Copa del Mundo", "mundiales"),
  p("m40", "ALEMANIA", "Tetracampeona", "mundiales"),
  p("m41", "SCALONI", "DT campeón 2022", "mundiales"),
  p("m42", "LIPPI", "DT Italia 2006", "mundiales"),
  p("m43", "FONTAINE", "Récord de goles en un Mundial", "mundiales"),
  p("m44", "LINEKER", "Goleador inglés 86", "mundiales"),
  p("m45", "GRIEZMANN", "Atacante francés", "mundiales"),
  p("m46", "DESCHAMPS", "DT campeón 2018", "mundiales"),
  p("m47", "DELBOSQUE", "DT España 2010", "mundiales"),
  p("m48", "SEMIFINAL", "Paso previo a la final", "mundiales"),
  p("m49", "LUZHNIKI", "Final de Moscú 2018", "mundiales"),
  p("m50", "SUDAFRICA", "Sede 2010", "mundiales"),
  p("m51", "MARRUECOS", "Semifinalista 2022", "mundiales"),
  p("m52", "INGLATERRA", "Campeona 1966", "mundiales"),
  p("m53", "BECKENBAUER", "El Kaiser", "mundiales"),
  p("m54", "BALONORO", "Premio individual (sin espacios)", "mundiales"),
  p("m55", "GUANTE", "Premio al arquero", "mundiales"),
  p("m56", "PENALES", "Definición desde los doce pasos", "mundiales"),
  p("m57", "PRORROGA", "Tiempo extra", "mundiales"),
  p("m58", "SEDE", "País anfitrión", "mundiales"),
  p("m59", "TROFEO", "Lo que alza el campeón", "mundiales"),
  p("m60", "CAMPEON", "Ganador del torneo", "mundiales"),
];

function limpiar(raw: PalabraPista[]): PalabraPista[] {
  const seenId = new Set<string>();
  const seenWord = new Set<string>();
  const out: PalabraPista[] = [];
  for (const e of raw) {
    if (seenId.has(e.id)) continue;
    if (e.longitud < 3 || e.longitud > 12) continue;
    if (!/^[A-ZÑ]+$/.test(e.palabra)) continue;
    if (seenWord.has(e.palabra)) continue;
    if (/inválid|filtrable|Corto inválido/i.test(e.pista)) continue;
    seenId.add(e.id);
    seenWord.add(e.palabra);
    out.push({ ...e, longitud: e.palabra.length });
  }
  return out;
}

export const BANCO_PALABRAS: PalabraPista[] = limpiar(RAW);

export function validarDistribucionBanco(
  banco: PalabraPista[] = BANCO_PALABRAS
): { ok: boolean; porLongitud: Record<number, number>; total: number } {
  const porLongitud: Record<number, number> = {};
  for (let L = 3; L <= 12; L++) porLongitud[L] = 0;
  for (const w of banco) {
    porLongitud[w.longitud] = (porLongitud[w.longitud] ?? 0) + 1;
  }
  const short = [3, 4, 5].reduce((s, L) => s + (porLongitud[L] ?? 0), 0);
  const mid = [6, 7, 8].reduce((s, L) => s + (porLongitud[L] ?? 0), 0);
  const long = [9, 10, 11, 12].reduce((s, L) => s + (porLongitud[L] ?? 0), 0);
  const ok = short >= 20 && mid >= 25 && long >= 20;
  if (!ok && typeof console !== "undefined") {
    console.warn("[crucigrama] Distribución de longitudes pobre", {
      short,
      mid,
      long,
      total: banco.length,
      porLongitud,
    });
  }
  return { ok, porLongitud, total: banco.length };
}

validarDistribucionBanco();
