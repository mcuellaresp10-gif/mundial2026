"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

function buildPagePath(pathname: string, searchParams: URLSearchParams): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const query = searchParams.toString();
  return query ? `${normalizedPath}?${query}` : normalizedPath;
}

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const pagePath = buildPagePath(pathname, searchParams);
    const frameId = window.requestAnimationFrame(() => {
      trackPageView(pagePath);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [pathname, searchParams]);

  return null;
}
