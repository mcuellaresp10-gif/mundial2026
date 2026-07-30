import type { PartidaNuevaEstrella } from "@/data/nueva-estrella/types";
import { validarPartida } from "./engine";

const PREFIX = "NE1.";

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  const b64 =
    typeof btoa === "function"
      ? btoa(bin)
      : Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(s: string): Uint8Array {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  const b64 = padded + pad;
  if (typeof atob === "function") {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64, "base64"));
}

/** Serializa partida a código pegable (JSON UTF-8 → base64url). */
export function exportarCodigo(partida: PartidaNuevaEstrella): string {
  const json = JSON.stringify(partida);
  const bytes = new TextEncoder().encode(json);
  return PREFIX + toBase64Url(bytes);
}

export function importarCodigo(codigo: string): PartidaNuevaEstrella {
  const trimmed = codigo.trim().replace(/\s+/g, "");
  if (!trimmed.startsWith(PREFIX)) {
    throw new Error("Código inválido: falta prefijo NE1.");
  }
  const payload = trimmed.slice(PREFIX.length);
  const bytes = fromBase64Url(payload);
  const json = new TextDecoder().decode(bytes);
  const parsed = JSON.parse(json) as unknown;
  const ok = validarPartida(parsed);
  if (!ok) throw new Error("Código inválido o versión no soportada");
  return ok;
}
