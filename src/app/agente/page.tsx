import { MundialAgentChat } from "@/components/Agente/MundialAgentChat";

export default function AgentePage() {
  return (
    <div className="space-y-6 animate-in fade-in max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Agente del Mundial</h1>
        <p className="text-muted-foreground mt-1">
          Pregunta lo que quieras sobre el Mundial 2026 y la historia de los torneos — datos,
          probabilidades y curiosidades al estilo de un experto en estadísticas.
        </p>
      </div>
      <MundialAgentChat />
    </div>
  );
}
