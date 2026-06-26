const DEFAULT_GA_MEASUREMENT_ID = "G-36EZDRTFPC";

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackPageView(pagePath: string): void {
  if (typeof window === "undefined" || !GA_MEASUREMENT_ID) return;

  const normalizedPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const pageLocation = `${window.location.origin}${normalizedPath}`;
  const pageTitle = document.title;

  const config = {
    page_path: normalizedPath,
    page_location: pageLocation,
    page_title: pageTitle,
  };

  const send = () => {
    window.gtag?.("config", GA_MEASUREMENT_ID, config);
  };

  if (typeof window.gtag === "function") {
    send();
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(["config", GA_MEASUREMENT_ID, config]);
}
