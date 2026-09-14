import type { Options } from "html-to-image/lib/types";

type CaptureOptions = Options & {
  onClone?: (document: Document, element: HTMLElement) => void;
};

const TRANSPARENT_PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

function getExportBackground(node?: HTMLElement): string {
  if (node) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
  }

  const rootBg = getComputedStyle(document.documentElement).backgroundColor;
  if (rootBg && rootBg !== "rgba(0, 0, 0, 0)" && rootBg !== "transparent") return rootBg;

  return "#0b1220";
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

interface StyleSnapshot {
  element: HTMLElement;
  overflow: string;
  overflowX: string;
  overflowY: string;
  maxHeight: string;
  maxWidth: string;
  height: string;
  width: string;
  whiteSpace: string;
  textOverflow: string;
}

function collectSubtree(node: HTMLElement): HTMLElement[] {
  return [node, ...node.querySelectorAll<HTMLElement>("*")];
}

function isScrollConstraint(value: string): boolean {
  return value === "auto" || value === "scroll" || value === "hidden" || value === "clip";
}

/** Expande overflow/max-size para que html-to-image no recorte filas ni columnas. */
function expandNodeForFullCapture(node: HTMLElement): () => void {
  const snapshots: StyleSnapshot[] = [];

  for (const el of collectSubtree(node)) {
    const computed = getComputedStyle(el);
    const needsOverflowFix =
      isScrollConstraint(computed.overflowX) ||
      isScrollConstraint(computed.overflowY) ||
      isScrollConstraint(computed.overflow);
    const needsMaxFix =
      (computed.maxHeight !== "none" && computed.maxHeight !== "0px") ||
      (computed.maxWidth !== "none" && el !== node && computed.maxWidth.endsWith("px"));
    const needsTruncateFix =
      computed.textOverflow === "ellipsis" || computed.whiteSpace === "nowrap";

    if (!needsOverflowFix && !needsMaxFix && !needsTruncateFix) continue;

    snapshots.push({
      element: el,
      overflow: el.style.overflow,
      overflowX: el.style.overflowX,
      overflowY: el.style.overflowY,
      maxHeight: el.style.maxHeight,
      maxWidth: el.style.maxWidth,
      height: el.style.height,
      width: el.style.width,
      whiteSpace: el.style.whiteSpace,
      textOverflow: el.style.textOverflow,
    });

    if (needsOverflowFix) {
      el.style.overflow = "visible";
      el.style.overflowX = "visible";
      el.style.overflowY = "visible";
    }
    if (needsMaxFix) {
      el.style.maxHeight = "none";
      if (el !== node) el.style.maxWidth = "none";
    }
    if (needsTruncateFix) {
      el.style.whiteSpace = "normal";
      el.style.textOverflow = "clip";
    }
  }

  const zoomTarget = node.querySelector<HTMLElement>("[data-bracket-zoom]");
  const previousZoom = zoomTarget?.style.zoom ?? "";
  if (zoomTarget) zoomTarget.style.zoom = "1";

  const hideNodes = [...node.querySelectorAll<HTMLElement>("[data-export-hide]")];
  const previousDisplay = hideNodes.map((el) => el.style.display);
  for (const el of hideNodes) {
    el.style.display = "none";
  }

  return () => {
    if (zoomTarget) zoomTarget.style.zoom = previousZoom;
    hideNodes.forEach((el, i) => {
      el.style.display = previousDisplay[i] ?? "";
    });
    for (const snap of snapshots) {
      const el = snap.element;
      el.style.overflow = snap.overflow;
      el.style.overflowX = snap.overflowX;
      el.style.overflowY = snap.overflowY;
      el.style.maxHeight = snap.maxHeight;
      el.style.maxWidth = snap.maxWidth;
      el.style.height = snap.height;
      el.style.width = snap.width;
      el.style.whiteSpace = snap.whiteSpace;
      el.style.textOverflow = snap.textOverflow;
    }
  };
}

/** Tamaño real del contenido (incluye tablas/scroll internos ya expandidos). */
export function measureExportNodeSize(node: HTMLElement): { width: number; height: number } {
  const rect = node.getBoundingClientRect();
  let width = Math.max(node.scrollWidth, node.offsetWidth, Math.ceil(rect.width));
  let height = Math.max(node.scrollHeight, node.offsetHeight, Math.ceil(rect.height));

  for (const el of collectSubtree(node)) {
    width = Math.max(width, el.scrollWidth, el.offsetWidth);
    height = Math.max(height, el.scrollHeight, el.offsetHeight);
  }

  return {
    width: Math.ceil(width),
    height: Math.ceil(height),
  };
}

function withTemporaryExportStyles<T>(node: HTMLElement, run: () => Promise<T>): Promise<T> {
  const restore = expandNodeForFullCapture(node);
  return run().finally(restore);
}

function rewriteImageSrcForExport(cloned: HTMLElement): void {
  const imgs = cloned.querySelectorAll("img");
  imgs.forEach((img) => {
    const current = img.getAttribute("src");
    if (!current) return;
    const direct = resolveDirectImageUrl(current);
    if (direct !== current) img.setAttribute("src", direct);
  });
}

export function getDomImageCaptureOptions(
  node?: HTMLElement,
  overrides?: Partial<CaptureOptions>
): CaptureOptions {
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
  overrides: Partial<CaptureOptions> | undefined,
  capture: (target: HTMLElement, options: CaptureOptions) => Promise<T>
): Promise<T> {
  return withTemporaryExportStyles(node, async () => {
    // Esperar layout tras expandir overflow.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const size = measureExportNodeSize(node);
    const userOnClone = overrides?.onClone;
    const { onClone: _ignored, ...restOverrides } = overrides ?? {};

    const options = getDomImageCaptureOptions(node, {
      width: size.width,
      height: size.height,
      style: {
        overflow: "visible",
        height: `${size.height}px`,
        width: `${size.width}px`,
      },
      filter: (domNode) => {
        if (domNode instanceof HTMLElement && domNode.hasAttribute("data-export-hide")) {
          return false;
        }
        return true;
      },
      onClone: (clonedDoc: Document, clonedNode: HTMLElement) => {
        if (clonedNode instanceof HTMLElement) {
          rewriteImageSrcForExport(clonedNode);
          clonedNode.style.overflow = "visible";
          clonedNode.style.maxHeight = "none";
          clonedNode.style.height = `${size.height}px`;
          clonedNode.style.width = `${size.width}px`;
          for (const el of collectSubtree(clonedNode)) {
            const computed = (clonedDoc.defaultView ?? window).getComputedStyle(el);
            if (
              isScrollConstraint(computed.overflow) ||
              isScrollConstraint(computed.overflowX) ||
              isScrollConstraint(computed.overflowY)
            ) {
              el.style.overflow = "visible";
              el.style.overflowX = "visible";
              el.style.overflowY = "visible";
            }
            if (computed.maxHeight !== "none") {
              el.style.maxHeight = "none";
            }
            if (computed.textOverflow === "ellipsis") {
              el.style.textOverflow = "clip";
              el.style.whiteSpace = "normal";
            }
          }
        }
        userOnClone?.(clonedDoc, clonedNode);
      },
      ...restOverrides,
    });
    return capture(node, options);
  });
}

export async function captureDomAsBlob(
  node: HTMLElement,
  overrides?: Partial<CaptureOptions>
): Promise<Blob> {
  return captureFromNode(node, overrides, async (target, options) => {
    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(target, options);
    if (!blob) throw new Error("No se pudo generar la imagen");
    return blob;
  });
}

export async function captureDomAsPngDataUrl(
  node: HTMLElement,
  overrides?: Partial<CaptureOptions>
): Promise<string> {
  return captureFromNode(node, overrides, async (target, options) => {
    const { toPng } = await import("html-to-image");
    return toPng(target, options);
  });
}

export async function downloadDomAsPng(
  node: HTMLElement,
  filename: string,
  overrides?: Partial<CaptureOptions>
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

export async function copyDomAsImage(
  node: HTMLElement,
  overrides?: Partial<CaptureOptions>
): Promise<void> {
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
