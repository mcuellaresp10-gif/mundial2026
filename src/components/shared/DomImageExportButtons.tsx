"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  canCopyImagesToClipboard,
  copyDomAsImage,
  downloadDomAsPng,
  getDomExportErrorMessage,
} from "@/utils/exportDomAsImage";
import { cn } from "@/lib/utils";

interface DomImageExportButtonsProps {
  targetRef: React.RefObject<HTMLElement | null>;
  filename?: string;
  className?: string;
}

export function DomImageExportButtons({
  targetRef,
  filename = "mundial-2026.png",
  className,
}: DomImageExportButtonsProps) {
  const [copySupported, setCopySupported] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "loading" | "done">("idle");
  const [downloadState, setDownloadState] = useState<"idle" | "loading">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setCopySupported(canCopyImagesToClipboard());
  }, []);

  function getTargetNode(): HTMLElement | null {
    const node = targetRef.current;
    if (!node) {
      setErrorMessage("El cuadro aún no está listo. Espera a que cargue e inténtalo de nuevo.");
    }
    return node;
  }

  async function handleCopy() {
    const node = getTargetNode();
    if (!node) return;
    if (!copySupported) {
      setErrorMessage(copyUnavailableMessage);
      return;
    }
    setCopyState("loading");
    setErrorMessage(null);
    try {
      await copyDomAsImage(node);
      setCopyState("done");
      window.setTimeout(() => setCopyState("idle"), 2500);
    } catch (error) {
      setErrorMessage(getDomExportErrorMessage(error));
      setCopyState("idle");
    }
  }

  async function handleDownload() {
    const node = getTargetNode();
    if (!node) return;
    setDownloadState("loading");
    setErrorMessage(null);
    try {
      await downloadDomAsPng(node, filename);
    } catch (error) {
      setErrorMessage(getDomExportErrorMessage(error));
    } finally {
      setDownloadState("idle");
    }
  }

  const copyLabel =
    copyState === "loading" ? "Copiando…" : copyState === "done" ? "¡Copiado!" : "Copiar imagen";

  const copyUnavailableMessage =
    typeof window !== "undefined" && !window.isSecureContext
      ? "Copiar imagen requiere HTTPS o localhost (no IP local). Usa Descargar PNG."
      : "Tu navegador no permite copiar imágenes. Usa Descargar PNG.";

  return (
    <div className={cn("flex flex-col items-stretch sm:items-end gap-1.5", className)}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          disabled={copyState === "loading" || downloadState === "loading"}
          title={copySupported ? "Copiar al portapapeles" : copyUnavailableMessage}
        >
          {copyState === "done" ? (
            <Check className="h-4 w-4 mr-1.5 text-emerald-600" />
          ) : (
            <Copy className="h-4 w-4 mr-1.5" />
          )}
          {copyLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={copyState === "loading" || downloadState === "loading"}
        >
          <Download className="h-4 w-4 mr-1.5" />
          {downloadState === "loading" ? "Descargando…" : "Descargar PNG"}
        </Button>
      </div>
      {errorMessage && (
        <p className="text-[11px] text-destructive sm:text-right max-w-xs">{errorMessage}</p>
      )}
    </div>
  );
}
