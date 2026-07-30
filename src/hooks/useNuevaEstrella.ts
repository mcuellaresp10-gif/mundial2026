"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AtributoEntrenable,
  CrearJugadorNEInput,
  FaseNuevaEstrella,
  PartidaNuevaEstrella,
  PartidoSemana,
  ResultadoMinijuego,
  TipoMomentoPartido,
} from "@/data/nueva-estrella/types";
import {
  aceptarTransferencia,
  aplicarDescanso,
  aplicarEntrenamiento,
  aplicarMedios,
  aplicarSocializar,
  cerrarSemana,
  comprarItem,
  crearPartida,
  finalizarPartido,
  forzarRetiro,
  iniciarPartido,
  rechazarTransferencia,
  registrarMomentoPartido,
  tiposMomentosPartido,
} from "@/utils/nueva-estrella/engine";
import { exportarCodigo, importarCodigo } from "@/utils/nueva-estrella/persistencia";
import {
  borrarPartidaGuardada,
  cargarPartidaGuardada,
  guardarPartida,
} from "@/utils/nueva-estrella/save";

export function useNuevaEstrella() {
  const [fase, setFase] = useState<FaseNuevaEstrella>("continuar");
  const [partida, setPartida] = useState<PartidaNuevaEstrella | null>(null);
  const partidaRef = useRef<PartidaNuevaEstrella | null>(null);
  const [atributoEntrenar, setAtributoEntrenar] =
    useState<AtributoEntrenable | null>(null);
  const [ultimoPartido, setUltimoPartido] = useState<PartidoSemana | null>(null);
  const [codigoExport, setCodigoExport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await cargarPartidaGuardada();
      if (cancelled) return;
      if (saved && !saved.retirado) {
        partidaRef.current = saved;
        setPartida(saved);
        setFase("continuar");
      } else {
        setFase("setup");
      }
      setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (p: PartidaNuevaEstrella) => {
    partidaRef.current = p;
    setPartida(p);
    try {
      await guardarPartida(p);
    } catch {
      /* ignore quota */
    }
  }, []);

  const start = useCallback(
    async (input: CrearJugadorNEInput) => {
      setError(null);
      const p = crearPartida(input);
      await persist(p);
      setFase("hub");
      setUltimoPartido(null);
    },
    [persist]
  );

  const continuarGuardada = useCallback(() => {
    if (!partida) return;
    if (partida.retirado) {
      setFase("retiro");
      return;
    }
    if (partida.ofertaPendiente) {
      setFase("transferencia");
      return;
    }
    setFase("hub");
  }, [partida]);

  const nuevaPartida = useCallback(async () => {
    await borrarPartidaGuardada();
    partidaRef.current = null;
    setPartida(null);
    setUltimoPartido(null);
    setCodigoExport(null);
    setFase("setup");
  }, []);

  const cargarCodigo = useCallback(
    async (codigo: string) => {
      const p = importarCodigo(codigo);
      await persist(p);
      setFase(p.retirado ? "retiro" : p.ofertaPendiente ? "transferencia" : "hub");
    },
    [persist]
  );

  const irEntrenar = useCallback((attr: AtributoEntrenable) => {
    setAtributoEntrenar(attr);
    setFase("entrenar");
  }, []);

  const finEntrenar = useCallback(
    async (r: ResultadoMinijuego) => {
      const actual = partidaRef.current;
      if (!actual || !atributoEntrenar) return;
      try {
        const next = aplicarEntrenamiento(actual, atributoEntrenar, r);
        await persist(next);
        setAtributoEntrenar(null);
        setFase("hub");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
        setFase("hub");
      }
    },
    [atributoEntrenar, persist]
  );

  const socializar = useCallback(
    async (
      tipo: "socializar_familia" | "socializar_pareja" | "socializar_agente"
    ) => {
      const actual = partidaRef.current;
      if (!actual) return;
      try {
        await persist(aplicarSocializar(actual, tipo));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    },
    [persist]
  );

  const irMedios = useCallback(() => setFase("medios"), []);

  const finMedios = useCallback(
    async (preguntaId: string, opcionId: string) => {
      const actual = partidaRef.current;
      if (!actual) return;
      try {
        await persist(aplicarMedios(actual, preguntaId, opcionId));
        setFase("hub");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
        setFase("hub");
      }
    },
    [persist]
  );

  const descansar = useCallback(async () => {
    const actual = partidaRef.current;
    if (!actual) return;
    try {
      await persist(aplicarDescanso(actual));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }, [persist]);

  const irTienda = useCallback(() => setFase("tienda"), []);

  const comprar = useCallback(
    async (itemId: string) => {
      const actual = partidaRef.current;
      if (!actual) return;
      try {
        setError(null);
        await persist(comprarItem(actual, itemId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error");
      }
    },
    [persist]
  );

  const irPartido = useCallback(async () => {
    const actual = partidaRef.current;
    if (!actual) return;
    const conPartido = iniciarPartido(actual);
    await persist(conPartido);
    setFase("partido");
  }, [persist]);

  const momentoPartido = useCallback(
    async (tipo: TipoMomentoPartido, r: ResultadoMinijuego) => {
      const actual = partidaRef.current;
      if (!actual) return;
      let next = registrarMomentoPartido(actual, tipo, r);
      const tipos = tiposMomentosPartido(next);
      if (next.momentoPartidoIndex >= tipos.length) {
        next = finalizarPartido(next);
        const last = next.historialPartidos[next.historialPartidos.length - 1]!;
        setUltimoPartido(last);
        await persist(next);
        setFase("resultado_partido");
        return;
      }
      await persist(next);
    },
    [persist]
  );

  const despuesResultado = useCallback(async () => {
    const actual = partidaRef.current;
    if (!actual) return;
    const next = cerrarSemana(actual);
    await persist(next);
    if (next.retirado) {
      setFase("retiro");
      return;
    }
    if (next.ofertaPendiente) {
      setFase("transferencia");
      return;
    }
    setFase("hub");
  }, [persist]);

  const aceptarOferta = useCallback(async () => {
    const actual = partidaRef.current;
    if (!actual) return;
    await persist(aceptarTransferencia(actual));
    setFase("hub");
  }, [persist]);

  const rechazarOferta = useCallback(async () => {
    const actual = partidaRef.current;
    if (!actual) return;
    await persist(rechazarTransferencia(actual));
    setFase("hub");
  }, [persist]);

  const generarCodigo = useCallback(() => {
    const actual = partidaRef.current;
    if (!actual) return;
    setCodigoExport(exportarCodigo(actual));
  }, []);

  const retirarse = useCallback(async () => {
    const actual = partidaRef.current;
    if (!actual) return;
    const next = forzarRetiro(actual);
    await persist(next);
    setFase("retiro");
  }, [persist]);

  return {
    hydrated,
    fase,
    setFase,
    partida,
    atributoEntrenar,
    ultimoPartido,
    codigoExport,
    setCodigoExport,
    error,
    setError,
    start,
    continuarGuardada,
    nuevaPartida,
    cargarCodigo,
    irEntrenar,
    finEntrenar,
    socializar,
    irMedios,
    finMedios,
    descansar,
    irTienda,
    comprar,
    irPartido,
    momentoPartido,
    despuesResultado,
    aceptarOferta,
    rechazarOferta,
    generarCodigo,
    retirarse,
  };
}
