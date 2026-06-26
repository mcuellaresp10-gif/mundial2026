import type { Options } from "html-to-image/lib/types";

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function getExportBackground(node?: HTMLElement): string {
  if (node) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
  }

  const rootBg = getComputedStyle(document.documentElement).backgroundColor;
  if (rootBg && rootBg !== "rgba(0, 0, 0, 0)" && rootBg !== "transparent") return rootBg;

  return document.documentElement.classList.contains("dark") ? "#0b1220" : "#fafafa";
}

/** Next.js Image optimizer URLs share the same path; html-to-image caches by path unless query params are kept. */
export function resolveDirectImageUrl(src: string): string {
  try {
    const url = src.startsWith("http")
      ? new URL(src)
      : new URL(src, typeof window !== "undefined" ? window.location.origin : "http://localhost");
    if (url.pathname === "/_next/image") {
      const original = url.searchParams.get("url");
      if (original) return decodeURIComponent(original);
    }
  } catch {
    /* ignore malformed URLs */
  }
  return src;
}

function withTemporaryExportStyles<T>(node: HTMLElement, run: () => Promise<T>): Promise<T> {
  const zoomTarget = node.querySelector<HTMLElement>("[data-bracket-zoom]");
  const previousZoom = zoomTarget?.style.zoom ?? "";
  if (zoomTarget) zoomTarget.style.zoom = "1";

  return run().finally(() => {
    if (zoomTarget) zoomTarget.style.zoom = previousZoom;
  });
}

export function getDomImageCaptureOptions(node?: HTMLElement, overrides?: Partial<Options>): Options {
  return {
    cacheBust: true,
    includeQueryParams: true,
    pixelRatio: 2,
    skipFonts: true,
    backgroundColor: getExportBackground(node),
    imagePlaceholder: TRANSPARENT_PIXEL,
    onImageErrorHandler: () => undefined,
    ...overrides,
  };
}

async function captureFromNode<T>(
  node: HTMLElement,
  overrides: Partial<Options> | undefined,
  capture: (target: HTMLElement, options: Options) => Promise<T>
): Promise<T> {
  return withTemporaryExportStyles(node, async () => {
    const options = getDomImageCaptureOptions(node, {
      width: node.scrollWidth,
      height: node.scrollHeight,
      ...overrides,
    });
    return capture(node, options);
  });
}

export async function captureDomAsBlob(node: HTMLElement, overrides?: Partial<Options>): Promise<Blob> {
  return captureFromNode(node, overrides, async (target, options) => {
    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(target, options);
    if (!blob) throw new Error("No se pudo generar la imagen");
    return blob;
  });
}

export async function captureDomAsPngDataUrl(node: HTMLElement, overrides?: Partial<Options>): Promise<string> {
  return captureFromNode(node, overrides, async (target, options) => {
    const { toPng } = await import("html-to-image");
    return toPng(target, options);
  });
}

export async function downloadDomAsPng(
  node: HTMLElement,
  filename: string,
  overrides?: Partial<Options>
): Promise<void> {
  const dataUrl = await captureDomAsPngDataUrl(node, overrides);
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function canCopyImagesToClipboard(): boolean {
  return (
    typeof window !== "undefined" &&
    window.isSecureContext &&
    typeof navigator.clipboard?.write === "function" &&
    typeof ClipboardItem !== "undefined"
  );
}

export async function copyDomAsImage(node: HTMLElement, overrides?: Partial<Options>): Promise<void> {
  if (!canCopyImagesToClipboard()) {
    throw new Error("CLIPBOARD_UNAVAILABLE");
  }

  const blob = await captureDomAsBlob(node, overrides);
  const clipboardItem = new ClipboardItem({
    "image/png": Promise.resolve(blob),
  });
  await navigator.clipboard.write([clipboardItem]);
}

export function getDomExportErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "CLIPBOARD_UNAVAILABLE") {
      if (typeof window !== "undefined" && !window.isSecureContext) {
        return "Copiar imagen requiere HTTPS o localhost (no IP local). Usa Descargar PNG.";
      }
      return "Tu navegador no permite copiar imágenes. Usa Descargar PNG.";
    }
    return error.message;
  }
  return "No se pudo exportar la imagen.";
}
