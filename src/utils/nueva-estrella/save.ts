import { get, set, del } from "idb-keyval";
import { SAVE_KEY } from "@/data/nueva-estrella/constantes";
import type { PartidaNuevaEstrella } from "@/data/nueva-estrella/types";
import { validarPartida } from "./engine";

export async function cargarPartidaGuardada(): Promise<PartidaNuevaEstrella | null> {
  try {
    const raw = await get(SAVE_KEY);
    return validarPartida(raw);
  } catch {
    return null;
  }
}

export async function guardarPartida(partida: PartidaNuevaEstrella): Promise<void> {
  await set(SAVE_KEY, partida);
}

export async function borrarPartidaGuardada(): Promise<void> {
  await del(SAVE_KEY);
}
