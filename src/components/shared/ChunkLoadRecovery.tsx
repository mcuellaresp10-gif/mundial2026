"use client";

import { useEffect } from "react";

const RELOAD_KEY = "mundial-chunk-reload";

function isChunkLoadError(message: string): boolean {
  return (
    message.includes("Loading chunk") ||
    message.includes("ChunkLoadError") ||
    message.includes("Failed to fetch dynamically imported module") ||
    /timeout:.*\/_next\/static\/chunks/i.test(message)
  );
}

/**
 * En dev, si .next se reinicia el navegador puede quedar con chunks viejos.
 * Fuerza una recarga con cache-bust una sola vez por sesión corta.
 */
export function ChunkLoadRecovery() {
  useEffect(() => {
    const timer = setTimeout(() => sessionStorage.removeItem(RELOAD_KEY), 15000);

    const reloadOnce = () => {
      if (sessionStorage.getItem(RELOAD_KEY)) return;
      sessionStorage.setItem(RELOAD_KEY, "1");
      const url = new URL(window.location.href);
      url.searchParams.set("_chunk", String(Date.now()));
      window.location.replace(url.toString());
    };

    const onError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.message ?? "")) reloadOnce();
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg =
        typeof reason === "object" && reason && "message" in reason
          ? String((reason as Error).message)
          : String(reason ?? "");
      if (isChunkLoadError(msg)) reloadOnce();
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
