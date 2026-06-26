import Script from "next/script";
import { GA_MEASUREMENT_ID, GA_MEASUREMENT_IDS } from "@/lib/analytics";

export function GoogleAnalytics() {
  const configLines = GA_MEASUREMENT_IDS.map(
    (id) => `gtag('config', '${id}', { send_page_view: false });`
  ).join("\n          ");

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${configLines}
        `}
      </Script>
    </>
  );
}
