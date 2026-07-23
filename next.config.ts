import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "media-*.api-sports.io" },
    ],
  },
  async redirects() {
    return [
      { source: "/grupos", destination: "/mundial/grupos", permanent: false },
      { source: "/historico", destination: "/mundial/historico", permanent: false },
      { source: "/selecciones", destination: "/equipos", permanent: false },
      { source: "/selecciones/:id", destination: "/equipos/:id", permanent: false },
    ];
  },
};

export default nextConfig;
