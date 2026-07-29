import type {
  CeldaGrilla,
  CrucigramaGenerado,
  DireccionPalabra,
  PalabraPista,
  PalabraUbicada,
} from "@/data/crucigrama/types";
import { BANCO_PALABRAS } from "@/data/crucigrama/banco-palabras";

export const TAMANO_DEFAULT = 10;
export const MAX_REINTENTOS_GLOBAL = 48;
export const MAX_INTENTOS_COLOCACION = 220;
export const MIN_PALABRAS = 7;
export const MIN_LETRAS = 28;

type LetterGrid = (string | null)[][];

function crearGridVacio(n: number): LetterGrid {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => null));
}

function enRango(n: number, v: number): boolean {
  return v >= 0 && v < n;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function filtrarBanco(banco: PalabraPista[]): PalabraPista[] {
  const seen = new Set<string>();
  const out: PalabraPista[] = [];
  for (const w of banco) {
    if (w.longitud < 3 || w.longitud > 12) continue;
    if (!/^[A-ZÑ]+$/.test(w.palabra)) continue;
    if (seen.has(w.palabra)) continue;
    seen.add(w.palabra);
    out.push(w);
  }
  return out;
}

/** ¿Se puede colocar la palabra sin colisiones ilegales? */
export function puedeColocar(
  grid: LetterGrid,
  palabra: string,
  fila: number,
  col: number,
  dir: DireccionPalabra,
  exigirCruce: boolean
): boolean {
  const n = grid.length;
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;
  const len = palabra.length;

  const beforeR = fila - dr;
  const beforeC = col - dc;
  if (enRango(n, beforeR) && enRango(n, beforeC) && grid[beforeR]![beforeC] != null) {
    return false;
  }
  const afterR = fila + dr * len;
  const afterC = col + dc * len;
  if (enRango(n, afterR) && enRango(n, afterC) && grid[afterR]![afterC] != null) {
    return false;
  }

  let cruces = 0;
  for (let i = 0; i < len; i++) {
    const r = fila + dr * i;
    const c = col + dc * i;
    if (!enRango(n, r) || !enRango(n, c)) return false;
    const actual = grid[r]![c];
    const letra = palabra[i]!;
    if (actual != null) {
      if (actual !== letra) return false;
      cruces += 1;
    } else {
      // No pegarse a letras en perpendicular (salvo cruce en esta celda).
      if (dir === "across") {
        if (enRango(n, r - 1) && grid[r - 1]![c] != null) return false;
        if (enRango(n, r + 1) && grid[r + 1]![c] != null) return false;
      } else {
        if (enRango(n, c - 1) && grid[r]![c - 1] != null) return false;
        if (enRango(n, c + 1) && grid[r]![c + 1] != null) return false;
      }
    }
  }

  if (exigirCruce && cruces === 0) return false;
  return true;
}

function colocarEnGrid(
  grid: LetterGrid,
  palabra: string,
  fila: number,
  col: number,
  dir: DireccionPalabra
): void {
  const dr = dir === "down" ? 1 : 0;
  const dc = dir === "across" ? 1 : 0;
  for (let i = 0; i < palabra.length; i++) {
    grid[fila + dr * i]![col + dc * i] = palabra[i]!;
  }
}

interface ColocadaTemp {
  palabra: PalabraPista;
  dir: DireccionPalabra;
  fila: number;
  col: number;
}

function intentarArmar(
  pool: PalabraPista[],
  tamano: number,
  rng: () => number
): ColocadaTemp[] | null {
  const grid = crearGridVacio(tamano);
  const colocadas: ColocadaTemp[] = [];
  const usadas = new Set<string>();

  const semillas = shuffle(
    pool.filter((w) => w.longitud >= 5 && w.longitud <= 8),
    rng
  );
  const semilla =
    semillas[0] ??
    shuffle(
      pool.filter((w) => w.longitud >= 4 && w.longitud <= 9),
      rng
    )[0];
  if (!semilla) return null;

  const fila0 = Math.floor((tamano - 1) / 2);
  const col0 = Math.max(0, Math.floor((tamano - semilla.longitud) / 2));
  if (!puedeColocar(grid, semilla.palabra, fila0, col0, "across", false)) {
    return null;
  }
  colocarEnGrid(grid, semilla.palabra, fila0, col0, "across");
  colocadas.push({ palabra: semilla, dir: "across", fila: fila0, col: col0 });
  usadas.add(semilla.palabra);

  let intentos = 0;
  let estancado = 0;
  while (intentos < MAX_INTENTOS_COLOCACION && estancado < 40) {
    intentos += 1;
    const candidatos = shuffle(
      pool.filter((w) => !usadas.has(w.palabra)),
      rng
    );
    let colocado = false;

    for (const cand of candidatos) {
      const slots: { fila: number; col: number; dir: DireccionPalabra }[] = [];

      // Buscar cruces con letras ya en grilla
      for (let r = 0; r < tamano; r++) {
        for (let c = 0; c < tamano; c++) {
          const letra = grid[r]![c];
          if (letra == null) continue;
          for (let i = 0; i < cand.palabra.length; i++) {
            if (cand.palabra[i] !== letra) continue;
            // Horizontal: la letra i cae en (r,c) → inicio en (r, c-i)
            const cStart = c - i;
            if (cStart >= 0) {
              slots.push({ fila: r, col: cStart, dir: "across" });
            }
            // Vertical
            const rStart = r - i;
            if (rStart >= 0) {
              slots.push({ fila: rStart, col: c, dir: "down" });
            }
          }
        }
      }

      const mezclados = shuffle(slots, rng);
      for (const s of mezclados) {
        if (!puedeColocar(grid, cand.palabra, s.fila, s.col, s.dir, true)) {
          continue;
        }
        // Evitar duplicar misma dirección exacta sobre palabra existente
        const solapaTotal = [...cand.palabra].every((_, i) => {
          const rr = s.fila + (s.dir === "down" ? i : 0);
          const cc = s.col + (s.dir === "across" ? i : 0);
          return grid[rr]![cc] === cand.palabra[i];
        });
        if (solapaTotal) continue;

        colocarEnGrid(grid, cand.palabra, s.fila, s.col, s.dir);
        colocadas.push({
          palabra: cand,
          dir: s.dir,
          fila: s.fila,
          col: s.col,
        });
        usadas.add(cand.palabra);
        colocado = true;
        break;
      }
      if (colocado) break;
    }

    if (!colocado) estancado += 1;
    else estancado = 0;

    if (colocadas.length >= 14) break;
  }

  let letras = 0;
  for (const row of grid) {
    for (const cell of row) if (cell != null) letras += 1;
  }
  if (colocadas.length < MIN_PALABRAS || letras < MIN_LETRAS) return null;
  return colocadas;
}

function construirResultado(
  colocadas: ColocadaTemp[],
  tamano: number
): CrucigramaGenerado {
  const celdas: CeldaGrilla[][] = Array.from({ length: tamano }, (_, fila) =>
    Array.from({ length: tamano }, (_, columna) => ({
      fila,
      columna,
      letra: null as string | null,
      perteneceA: {},
    }))
  );

  const palabrasUbicadas: PalabraUbicada[] = [];
  const bancoUsado: PalabraPista[] = [];

  // Orden de numeración: por fila, luego columna
  const starts = colocadas
    .map((c, idx) => ({ ...c, idx }))
    .sort((a, b) => a.fila - b.fila || a.col - b.col);

  const numeroPorInicio = new Map<string, number>();
  let nextNum = 1;
  for (const c of starts) {
    const key = `${c.fila}-${c.col}`;
    if (!numeroPorInicio.has(key)) {
      numeroPorInicio.set(key, nextNum++);
    }
  }

  for (const c of colocadas) {
    const id = `${c.dir}-${c.palabra.id}`;
    const numero = numeroPorInicio.get(`${c.fila}-${c.col}`) ?? 0;
    const dr = c.dir === "down" ? 1 : 0;
    const dc = c.dir === "across" ? 1 : 0;
    for (let i = 0; i < c.palabra.palabra.length; i++) {
      const r = c.fila + dr * i;
      const cc = c.col + dc * i;
      const cell = celdas[r]![cc]!;
      cell.letra = c.palabra.palabra[i]!;
      if (c.dir === "across") cell.perteneceA.across = id;
      else cell.perteneceA.down = id;
      if (i === 0) cell.numero = numero;
    }
    palabrasUbicadas.push({
      id,
      palabraPistaId: c.palabra.id,
      direccion: c.dir,
      filaInicio: c.fila,
      columnaInicio: c.col,
      numero,
      palabra: c.palabra.palabra,
      pista: c.palabra.pista,
    });
    bancoUsado.push(c.palabra);
  }

  palabrasUbicadas.sort(
    (a, b) =>
      a.numero - b.numero ||
      (a.direccion === b.direccion ? 0 : a.direccion === "across" ? -1 : 1)
  );

  return {
    tamano: { filas: tamano, columnas: tamano },
    celdas,
    palabrasUbicadas,
    bancoUsado,
  };
}

/**
 * Genera un crucigrama 10×10 con intersecciones.
 * Función pura (inyectar rng para tests).
 */
export function generarCrucigrama(
  banco: PalabraPista[] = BANCO_PALABRAS,
  rng: () => number = Math.random,
  tamano = TAMANO_DEFAULT
): CrucigramaGenerado {
  const pool = filtrarBanco(banco);
  if (pool.length < MIN_PALABRAS) {
    throw new Error("Banco insuficiente para generar crucigrama");
  }

  for (let intento = 0; intento < MAX_REINTENTOS_GLOBAL; intento++) {
    const armado = intentarArmar(pool, tamano, rng);
    if (armado) return construirResultado(armado, tamano);
  }

  // Fallback laxo: una sola palabra para no romper la UI
  const w =
    pool.find((x) => x.longitud <= tamano) ??
    pool[0]!;
  const col = Math.max(0, Math.floor((tamano - w.longitud) / 2));
  const fila = Math.floor(tamano / 2);
  return construirResultado(
    [{ palabra: w, dir: "across", fila, col }],
    tamano
  );
}

/** Normaliza letra de usuario: sin tildes; Ñ se conserva. */
export function normalizarLetra(ch: string): string {
  const up = ch.toUpperCase();
  if (up === "Ñ") return "Ñ";
  return up
    .replace(/Ñ/g, "#")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/#/g, "Ñ")
    .replace(/[^A-ZÑ]/g, "");
}

export function letrasCoinciden(ingresada: string, correcta: string): boolean {
  const a = normalizarLetra(ingresada);
  const b = normalizarLetra(correcta);
  return a.length === 1 && a === b;
}
