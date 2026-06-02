"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isChunk =
    error.message.includes("Loading chunk") ||
    error.message.includes("ChunkLoadError");

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center">
      <h2 className="text-xl font-bold">Algo salió mal</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        {isChunk
          ? "La caché de desarrollo de Next.js está desincronizada. Recarga o reinicia con npm run dev:clean."
          : "Ocurrió un error inesperado en la aplicación."}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 rounded-lg bg-mundial-gold text-mundial-deep font-semibold text-sm"
        >
          Reintentar
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg border text-sm"
        >
          Recargar página
        </button>
      </div>
    </div>
  );
}
