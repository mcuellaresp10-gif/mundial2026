"use client";

import { useEffect } from "react";

const RELOAD_KEY = "mundial-chunk-reload";

function isChunkLoadError(message: string): boolean {
  return (
    message.includes("Loading chunk") ||
    message.includes("ChunkLoadError") ||
    message.includes("Failed to fetch dynamically imported module")
  );
}

/**
 * En dev, si .next se corrompe el navegador puede quedar con chunks viejos.
 * Recarga una vez automáticamente; si persiste, el usuario debe usar dev:clean.
 */
export function ChunkLoadRecovery() {
  useEffect(() => {
    const timer = setTimeout(() => sessionStorage.removeItem(RELOAD_KEY), 8000);

    const reloadOnce = () => {
      if (sessionStorage.getItem(RELOAD_KEY)) return;
      sessionStorage.setItem(RELOAD_KEY, "1");
      window.location.reload();
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
