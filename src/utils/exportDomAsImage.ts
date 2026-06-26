import type { Options } from "html-to-image/lib/types";

function getExportBackground(): string {
  const bg = getComputedStyle(document.documentElement).getPropertyValue("--background").trim();
  if (bg) return `hsl(${bg})`;
  return document.documentElement.classList.contains("dark") ? "hsl(222 47% 6%)" : "hsl(0 0% 98%)";
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

function prepareCloneForExport(node: HTMLElement, sourceNode: HTMLElement): void {
  node.style.position = "fixed";
  node.style.left = "-100000px";
  node.style.top = "0";
  node.style.zIndex = "-1";
  node.style.background = getExportBackground();

  const zoomTarget = node.querySelector<HTMLElement>("[data-bracket-zoom]");
  if (zoomTarget) zoomTarget.style.zoom = "1";

  const sourceImages = sourceNode.querySelectorAll("img");
  const cloneImages = node.querySelectorAll("img");
  cloneImages.forEach((img, index) => {
    const source = sourceImages[index];
    const rawSrc = source?.currentSrc || source?.src || img.getAttribute("src") || "";
    img.src = resolveDirectImageUrl(rawSrc);
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.crossOrigin = "anonymous";
  });
}

function waitForImages(node: HTMLElement): Promise<void> {
  const images = [...node.querySelectorAll("img")];
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  ).then(() => undefined);
}

export function getDomImageCaptureOptions(overrides?: Partial<Options>): Options {
  return {
    cacheBust: true,
    includeQueryParams: true,
    pixelRatio: 2,
    backgroundColor: getExportBackground(),
    fetchRequestInit: { mode: "cors", credentials: "omit" },
    ...overrides,
  };
}

function createExportClone(node: HTMLElement): HTMLElement {
  const clone = node.cloneNode(true) as HTMLElement;
  prepareCloneForExport(clone, node);
  document.body.appendChild(clone);
  return clone;
}

async function withExportClone<T>(
  node: HTMLElement,
  overrides: Partial<Options> | undefined,
  capture: (clone: HTMLElement, options: Options) => Promise<T>
): Promise<T> {
  const clone = createExportClone(node);
  try {
    await waitForImages(clone);
    return await capture(clone, getDomImageCaptureOptions(overrides));
  } finally {
    clone.remove();
  }
}

export async function captureDomAsBlob(node: HTMLElement, overrides?: Partial<Options>): Promise<Blob> {
  return withExportClone(node, overrides, async (clone, options) => {
    const { toBlob } = await import("html-to-image");
    const blob = await toBlob(clone, options);
    if (!blob) throw new Error("No se pudo generar la imagen");
    return blob;
  });
}

export async function captureDomAsPngDataUrl(node: HTMLElement, overrides?: Partial<Options>): Promise<string> {
  return withExportClone(node, overrides, async (clone, options) => {
    const { toPng } = await import("html-to-image");
    return toPng(clone, options);
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
  link.click();
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
