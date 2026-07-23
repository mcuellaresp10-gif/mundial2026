import { MundialAgentChat } from "@/components/Agente/MundialAgentChat";

export default function AgentePage() {
  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Agente Américas</h1>
        <p className="text-muted-foreground mt-1">
          Ligas CONMEBOL, Liga MX, MLS, Libertadores, Sudamericana y copas domésticas:
          tablas, goleadores, próximos partidos y análisis. El archivo del Mundial 2026
          sigue disponible si lo preguntas.
        </p>
      </div>
      <MundialAgentChat />
    </div>
  );
}
