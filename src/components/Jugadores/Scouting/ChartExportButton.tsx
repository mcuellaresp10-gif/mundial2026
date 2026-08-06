"use client";

import { useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartExportButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  filename?: string;
  className?: string;
  /** Ofrece también impresión → PDF del navegador. */
  allowPrint?: boolean;
}

export function ChartExportButton({
  targetRef,
  filename = "mundial-scouting.png",
  className,
  allowPrint = false,
}: ChartExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    const node = targetRef.current;
    if (!node) return;
    setExporting(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--background")
          ? undefined
          : "#0f172a",
      });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch {
      /* ignore export failures */
    } finally {
      setExporting(false);
    }
  }

  function handlePrint() {
    const node = targetRef.current;
    if (!node) return;
    const win = window.open("", "_blank", "noopener,noreferrer,width=800,height=900");
    if (!win) return;
    win.document.write(`<!doctype html><html><head><title>${filename}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #111; background: #fff; }
        img { max-width: 100%; }
      </style></head><body></body></html>`);
    win.document.close();
    void (async () => {
      try {
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2, backgroundColor: "#ffffff" });
        const img = win.document.createElement("img");
        img.src = dataUrl;
        img.onload = () => {
          win.document.body.appendChild(img);
          win.focus();
          win.print();
        };
      } catch {
        win.close();
      }
    })();
  }

  return (
    <div className={`inline-flex gap-1.5 ${className ?? ""}`}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exporting}
      >
        <Download className="h-4 w-4 mr-1.5" />
        {exporting ? "Exportando…" : "PNG"}
      </Button>
      {allowPrint && (
        <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-1.5" />
          PDF
        </Button>
      )}
    </div>
  );
}
