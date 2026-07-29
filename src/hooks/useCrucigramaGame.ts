"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BANCO_PALABRAS } from "@/data/crucigrama/banco-palabras";
import type {
  EstadoJuegoCrucigrama,
  PalabraUbicada,
} from "@/data/crucigrama/types";
import { claveCelda } from "@/data/crucigrama/types";
import {
  generarCrucigrama,
  letrasCoinciden,
  normalizarLetra,
} from "@/utils/crucigrama/generate";

function crearEstadoNuevo(): EstadoJuegoCrucigrama {
  const crucigrama = generarCrucigrama(BANCO_PALABRAS);
  const primera = crucigrama.palabrasUbicadas[0];
  return {
    crucigrama,
    respuestasUsuario: {},
    celdaSeleccionada: primera
      ? { fila: primera.filaInicio, columna: primera.columnaInicio }
      : null,
    direccionActiva: primera?.direccion ?? "across",
    tiempoSegundos: 0,
    errores: 0,
    completado: false,
  };
}

export function useCrucigramaGame() {
  const [estado, setEstado] = useState<EstadoJuegoCrucigrama>(() =>
    crearEstadoNuevo()
  );
  const [tecladoVisible, setTecladoVisible] = useState(true);

  useEffect(() => {
    if (estado.completado) return;
    const id = window.setInterval(() => {
      setEstado((prev) =>
        prev.completado
          ? prev
          : { ...prev, tiempoSegundos: prev.tiempoSegundos + 1 }
      );
    }, 1000);
    return () => window.clearInterval(id);
  }, [estado.completado]);

  const palabraActiva: PalabraUbicada | null = useMemo(() => {
    const sel = estado.celdaSeleccionada;
    if (!sel) return null;
    const cell =
      estado.crucigrama.celdas[sel.fila]?.[sel.columna];
    if (!cell?.letra) return null;
    const id =
      estado.direccionActiva === "across"
        ? cell.perteneceA.across
        : cell.perteneceA.down;
    const fallback =
      cell.perteneceA.across ?? cell.perteneceA.down ?? null;
    const useId = id ?? fallback;
    if (!useId) return null;
    return (
      estado.crucigrama.palabrasUbicadas.find((p) => p.id === useId) ?? null
    );
  }, [estado]);

  const celdasPalabraActiva = useMemo(() => {
    const set = new Set<string>();
    if (!palabraActiva) return set;
    const dr = palabraActiva.direccion === "down" ? 1 : 0;
    const dc = palabraActiva.direccion === "across" ? 1 : 0;
    for (let i = 0; i < palabraActiva.palabra.length; i++) {
      set.add(
        claveCelda(
          palabraActiva.filaInicio + dr * i,
          palabraActiva.columnaInicio + dc * i
        )
      );
    }
    return set;
  }, [palabraActiva]);

  const nuevoCrucigrama = useCallback(() => {
    setEstado(crearEstadoNuevo());
    setTecladoVisible(true);
  }, []);

  const seleccionarCelda = useCallback((fila: number, columna: number) => {
    setEstado((prev) => {
      const cell = prev.crucigrama.celdas[fila]?.[columna];
      if (!cell?.letra) return prev;

      const same =
        prev.celdaSeleccionada?.fila === fila &&
        prev.celdaSeleccionada?.columna === columna;

      let dir = prev.direccionActiva;
      if (same) {
        const hasA = Boolean(cell.perteneceA.across);
        const hasD = Boolean(cell.perteneceA.down);
        if (hasA && hasD) {
          dir = dir === "across" ? "down" : "across";
        }
      } else {
        if (cell.perteneceA[dir]) {
          // keep
        } else if (cell.perteneceA.across) dir = "across";
        else if (cell.perteneceA.down) dir = "down";
      }

      return {
        ...prev,
        celdaSeleccionada: { fila, columna },
        direccionActiva: dir,
      };
    });
  }, []);

  const avanzarCelda = useCallback(
    (
      prev: EstadoJuegoCrucigrama,
      fila: number,
      col: number,
      delta: number
    ): { fila: number; columna: number } => {
      const dir = prev.direccionActiva;
      const cell = prev.crucigrama.celdas[fila]?.[col];
      const id =
        (dir === "across" ? cell?.perteneceA.across : cell?.perteneceA.down) ??
        cell?.perteneceA.across ??
        cell?.perteneceA.down;
      const pal = prev.crucigrama.palabrasUbicadas.find((p) => p.id === id);
      if (!pal) return { fila, columna: col };
      const dr = pal.direccion === "down" ? 1 : 0;
      const dc = pal.direccion === "across" ? 1 : 0;
      const idx =
        dr !== 0
          ? fila - pal.filaInicio
          : col - pal.columnaInicio;
      const next = Math.max(0, Math.min(pal.palabra.length - 1, idx + delta));
      return {
        fila: pal.filaInicio + dr * next,
        columna: pal.columnaInicio + dc * next,
      };
    },
    []
  );

  const ingresarLetra = useCallback(
    (raw: string) => {
      const letra = normalizarLetra(raw);
      if (letra.length !== 1) return;

      setEstado((prev) => {
        if (prev.completado || !prev.celdaSeleccionada) return prev;
        const { fila, columna } = prev.celdaSeleccionada;
        const cell = prev.crucigrama.celdas[fila]?.[columna];
        if (!cell?.letra) return prev;

        const key = claveCelda(fila, columna);
        const respuestas = { ...prev.respuestasUsuario, [key]: letra };
        const errores = prev.errores;

        const dir = prev.direccionActiva;
        const palabraId =
          (dir === "across" ? cell.perteneceA.across : cell.perteneceA.down) ??
          cell.perteneceA.across ??
          cell.perteneceA.down;
        const palabra = prev.crucigrama.palabrasUbicadas.find(
          (p) => p.id === palabraId
        );

        if (palabra) {
          const dr = palabra.direccion === "down" ? 1 : 0;
          const dc = palabra.direccion === "across" ? 1 : 0;
          const celdasPalabra = Array.from(
            { length: palabra.palabra.length },
            (_, i) => ({
              fila: palabra.filaInicio + dr * i,
              columna: palabra.columnaInicio + dc * i,
              key: claveCelda(
                palabra.filaInicio + dr * i,
                palabra.columnaInicio + dc * i
              ),
              esperada: palabra.palabra[i]!,
            })
          );

          const palabraLlena = celdasPalabra.every((c) => respuestas[c.key]);
          if (palabraLlena) {
            const palabraOk = celdasPalabra.every((c) =>
              letrasCoinciden(respuestas[c.key]!, c.esperada)
            );

            if (!palabraOk) {
              for (const c of celdasPalabra) delete respuestas[c.key];
              return {
                ...prev,
                respuestasUsuario: respuestas,
                errores: errores + 1,
                celdaSeleccionada: {
                  fila: palabra.filaInicio,
                  columna: palabra.columnaInicio,
                },
              };
            }
          }
        }

        let faltan = false;
        for (const row of prev.crucigrama.celdas) {
          for (const c of row) {
            if (c.letra == null) continue;
            const v = respuestas[claveCelda(c.fila, c.columna)];
            if (!v || !letrasCoinciden(v, c.letra)) {
              faltan = true;
              break;
            }
          }
          if (faltan) break;
        }
        const completado = !faltan;

        const nextPos = avanzarCelda(prev, fila, columna, 1);
        return {
          ...prev,
          respuestasUsuario: respuestas,
          errores,
          completado,
          celdaSeleccionada: completado
            ? prev.celdaSeleccionada
            : nextPos,
        };
      });
    },
    [avanzarCelda]
  );

  const borrarLetra = useCallback(() => {
    setEstado((prev) => {
      if (prev.completado || !prev.celdaSeleccionada) return prev;
      const { fila, columna } = prev.celdaSeleccionada;
      const key = claveCelda(fila, columna);
      const respuestas = { ...prev.respuestasUsuario };
      if (respuestas[key]) {
        delete respuestas[key];
        return { ...prev, respuestasUsuario: respuestas };
      }
      const prevPos = avanzarCelda(prev, fila, columna, -1);
      const prevKey = claveCelda(prevPos.fila, prevPos.columna);
      delete respuestas[prevKey];
      return {
        ...prev,
        respuestasUsuario: respuestas,
        celdaSeleccionada: prevPos,
      };
    });
  }, [avanzarCelda]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        borrarLetra();
        return;
      }
      if (e.key.length === 1) {
        const n = normalizarLetra(e.key);
        if (n) {
          e.preventDefault();
          ingresarLetra(n);
        }
      }
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        setEstado((prev) => {
          if (!prev.celdaSeleccionada) return prev;
          const delta = e.key === "ArrowRight" ? 1 : -1;
          const next = avanzarCelda(
            { ...prev, direccionActiva: "across" },
            prev.celdaSeleccionada.fila,
            prev.celdaSeleccionada.columna,
            delta
          );
          return {
            ...prev,
            direccionActiva: "across",
            celdaSeleccionada: next,
          };
        });
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setEstado((prev) => {
          if (!prev.celdaSeleccionada) return prev;
          const delta = e.key === "ArrowDown" ? 1 : -1;
          const next = avanzarCelda(
            { ...prev, direccionActiva: "down" },
            prev.celdaSeleccionada.fila,
            prev.celdaSeleccionada.columna,
            delta
          );
          return {
            ...prev,
            direccionActiva: "down",
            celdaSeleccionada: next,
          };
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [avanzarCelda, borrarLetra, ingresarLetra]);

  const seleccionarPalabra = useCallback((palabra: PalabraUbicada) => {
    setEstado((prev) => ({
      ...prev,
      direccionActiva: palabra.direccion,
      celdaSeleccionada: {
        fila: palabra.filaInicio,
        columna: palabra.columnaInicio,
      },
    }));
  }, []);

  const usarPista = useCallback(() => {
    setEstado((prev) => {
      if (prev.completado || !prev.celdaSeleccionada) return prev;
      const { fila, columna } = prev.celdaSeleccionada;
      const cell = prev.crucigrama.celdas[fila]?.[columna];
      if (!cell?.letra) return prev;

      const dir = prev.direccionActiva;
      const palabraId =
        (dir === "across" ? cell.perteneceA.across : cell.perteneceA.down) ??
        cell.perteneceA.across ??
        cell.perteneceA.down;
      const palabra = prev.crucigrama.palabrasUbicadas.find(
        (p) => p.id === palabraId
      );
      if (!palabra) return prev;

      const dr = palabra.direccion === "down" ? 1 : 0;
      const dc = palabra.direccion === "across" ? 1 : 0;
      const celdasPalabra = Array.from({ length: palabra.palabra.length }, (_, i) => ({
        fila: palabra.filaInicio + dr * i,
        columna: palabra.columnaInicio + dc * i,
        key: claveCelda(
          palabra.filaInicio + dr * i,
          palabra.columnaInicio + dc * i
        ),
        esperada: palabra.palabra[i]!,
      }));

      const candidatos = celdasPalabra.filter((c) => {
        const actual = prev.respuestasUsuario[c.key];
        return !actual || !letrasCoinciden(actual, c.esperada);
      });
      if (candidatos.length === 0) return prev;

      const revelada = candidatos[Math.floor(Math.random() * candidatos.length)]!;
      const respuestas = {
        ...prev.respuestasUsuario,
        [revelada.key]: revelada.esperada,
      };

      let faltan = false;
      for (const row of prev.crucigrama.celdas) {
        for (const c of row) {
          if (c.letra == null) continue;
          const v = respuestas[claveCelda(c.fila, c.columna)];
          if (!v || !letrasCoinciden(v, c.letra)) {
            faltan = true;
            break;
          }
        }
        if (faltan) break;
      }

      return {
        ...prev,
        respuestasUsuario: respuestas,
        completado: !faltan,
        celdaSeleccionada: {
          fila: revelada.fila,
          columna: revelada.columna,
        },
      };
    });
  }, []);

  return {
    estado,
    palabraActiva,
    celdasPalabraActiva,
    tecladoVisible,
    setTecladoVisible,
    nuevoCrucigrama,
    seleccionarCelda,
    seleccionarPalabra,
    ingresarLetra,
    borrarLetra,
    usarPista,
  };
}

export function formatearTiempo(seg: number): string {
  const m = Math.floor(seg / 60);
  const s = seg % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
