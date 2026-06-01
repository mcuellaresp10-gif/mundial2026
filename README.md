# Mundial 2026 — Análisis Táctico & Estadísticas

Plataforma integral de análisis táctico y estadísticas del FIFA World Cup 2026.

## Stack

- Next.js 15 (App Router + API Routes)
- React 19 + TypeScript
- TanStack Query, Zustand, Recharts
- Tailwind CSS + shadcn-style components
- API-Football (proxy server-side)
- Claude/OpenAI para análisis IA

## Setup

1. Copia `.env.local.example` a `.env.local`
2. Configura `API_FOOTBALL_KEY` y claves de IA
3. Instala dependencias y arranca:

```bash
npm install
npm run dev
```

## Secciones

- Dashboard con Colombia Focus
- Calendario & resultados (72 partidos)
- 48 perfiles de selecciones
- 1000+ jugadores con radar charts
- Once Ideal dinámico + Mi XI
- Comparativas selección/jugador
- Estadísticas agregadas y top scorers
- Histórico 2010–2022
- Análisis táctico IA pre/post partido

## API-Football

League ID: `1` (World Cup) · Season: `2026`

Caché agresivo (4h) en server y cliente para respetar límite de 100 req/día.
