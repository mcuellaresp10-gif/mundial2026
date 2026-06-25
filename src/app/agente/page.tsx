import { MundialAgentChat } from "@/components/Agente/MundialAgentChat";

export default function AgentePage() {
  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Agente del Mundial</h1>
        <p className="text-muted-foreground mt-1">
          Historia completa de los Mundiales (1930-2022) con enfoque en el torneo 2026 en vivo:
          tablas, probabilidades, récords y curiosidades.
        </p>
      </div>
      <MundialAgentChat />
    </div>
  );
}
