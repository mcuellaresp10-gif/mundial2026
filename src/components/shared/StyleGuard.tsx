"use client";

import { useEffect, useState } from "react";

/**
 * Detecta cuando Tailwind/CSS no cargó (caché .next corrupta en dev)
 * y ofrece recargar. Usa estilos inline para seguir siendo visible sin CSS.
 */
export function StyleGuard() {
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const check = async () => {
      const probe = document.createElement("div");
      probe.className = "fixed pointer-events-none opacity-0 bg-mundial-gold";
      document.body.appendChild(probe);
      const bg = getComputedStyle(probe).backgroundColor;
      document.body.removeChild(probe);

      const goldLoaded =
        bg.includes("252") && bg.includes("209") && bg.includes("22");

      if (goldLoaded) return;

      const cssLink = document.querySelector<HTMLLinkElement>(
        'link[href*="/_next/static/css/"]'
      );
      if (cssLink) {
        try {
          const res = await fetch(cssLink.href, { method: "HEAD" });
          if (res.ok) return;
        } catch {
          /* CSS no disponible */
        }
      }

      setBroken(true);
    };

    const timer = setTimeout(check, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!broken) return null;

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 420,
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", color: "#0F172A" }}>
          Los estilos no cargaron
        </p>
        <p style={{ fontSize: 14, color: "#64748B", margin: "0 0 20px", lineHeight: 1.5 }}>
          La caché de Next.js se corrompió. Es habitual en desarrollo tras muchos cambios.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            display: "block",
            width: "100%",
            padding: "12px 16px",
            marginBottom: 12,
            background: "#FCD116",
            color: "#0F172A",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Recargar página
        </button>
        <p style={{ fontSize: 12, color: "#64748B", margin: 0, lineHeight: 1.5 }}>
          Si sigue igual, para el servidor (Ctrl+C) y ejecuta:{" "}
          <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: 4 }}>
            npm run dev:clean
          </code>
        </p>
      </div>
    </div>
  );
}
