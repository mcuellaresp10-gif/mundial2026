import { FEEDBACK_CATEGORY_LABELS, type FeedbackCategory } from "@/lib/feedback";

const DEFAULT_GA_MEASUREMENT_ID = "G-36EZDRTFPC";
const DEFAULT_GA_MEASUREMENT_ID_2 = "G-CHL1EE8KM1";

function parseMeasurementIds(): string[] {
  const fromList = process.env.NEXT_PUBLIC_GA_MEASUREMENT_IDS?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (fromList?.length) {
    return [...new Set(fromList)];
  }

  const primary =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || DEFAULT_GA_MEASUREMENT_ID;
  const secondary =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID_2?.trim() || DEFAULT_GA_MEASUREMENT_ID_2;

  return secondary ? [...new Set([primary, secondary])] : [primary];
}

/** IDs activos (primario + opcional secundario). */
export const GA_MEASUREMENT_IDS = parseMeasurementIds();

/** Primer ID; usado para cargar gtag.js. */
export const GA_MEASUREMENT_ID = GA_MEASUREMENT_IDS[0] ?? DEFAULT_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function pushGtag(...args: unknown[]): void {
  if (typeof window.gtag === "function") {
    window.gtag(...args);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function trackPageView(pagePath: string): void {
  if (typeof window === "undefined" || GA_MEASUREMENT_IDS.length === 0) return;

  const normalizedPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const pageLocation = `${window.location.origin}${normalizedPath}`;
  const pageTitle = document.title;

  const config = {
    page_path: normalizedPath,
    page_location: pageLocation,
    page_title: pageTitle,
  };

  for (const id of GA_MEASUREMENT_IDS) {
    pushGtag("config", id, config);
  }
}

export function trackFeedbackSubmit(category: FeedbackCategory): void {
  if (typeof window === "undefined" || GA_MEASUREMENT_IDS.length === 0) return;

  const params = {
    category,
    category_label: FEEDBACK_CATEGORY_LABELS[category],
  };

  pushGtag("event", "feedback_submit", params);
}
