"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChartExportButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  filename?: string;
  className?: string;
}

export function ChartExportButton({
  targetRef,
  filename = "mundial-scouting.png",
  className,
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

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={handleExport}
      disabled={exporting}
    >
      <Download className="h-4 w-4 mr-1.5" />
      {exporting ? "Exportando…" : "Exportar PNG"}
    </Button>
  );
}
