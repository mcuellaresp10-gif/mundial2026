"use client";

import { useRef, useEffect, useState, FormEvent, KeyboardEvent } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAgentChat } from "@/hooks/useAgentChat";
import { cn } from "@/lib/utils";

const SUGGESTED_PROMPTS = [
  "¿Quién es favorito para ganar el Grupo A?",
  "Curiosidades del Mundial de 1986",
  "¿Cuál es la probabilidad de que Colombia clasifique?",
  "Compara Argentina 2022 vs Brasil 2002",
  "¿Cuáles son los 8 mejores terceros ahora?",
  "¿Qué selección tiene más títulos del Mundial?",
];

function formatAnswer(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1");
}

export function MundialAgentChat() {
  const { messages, isLoading, sendMessage, clearChat, hydrated } = useAgentChat();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const submit = async (text?: string) => {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput("");
    await sendMessage(value);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  };

  if (!hydrated) {
    return (
      <Card className="min-h-[480px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="flex flex-col min-h-[560px] max-h-[calc(100vh-12rem)] overflow-hidden">
      <CardHeader className="pb-3 border-b border-border shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="text-lg">Experto en datos del Mundial</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Estadísticas, historia, probabilidades y curiosidades · Mundial 2026
            </p>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat} className="shrink-0">
              <Trash2 className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1 min-h-0 p-0">
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pregúntame sobre el Mundial 2026, la historia de los torneos, probabilidades de
                clasificación, récords y curiosidades. Respondo con datos del sitio y análisis
                contextual.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void submit(prompt)}
                    disabled={isLoading}
                    className="text-left text-xs px-3 py-2 rounded-full border border-border bg-muted/40 hover:bg-muted hover:border-mundial-gold/40 transition-colors disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed",
                  msg.role === "user"
                    ? "bg-mundial-gold/20 text-foreground rounded-br-md"
                    : "bg-muted/60 border border-border/60 rounded-bl-md"
                )}
              >
                {formatAnswer(msg.content)}
                {msg.sources && msg.sources.length > 0 && msg.role === "assistant" && (
                  <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/40">
                    Fuentes: {msg.sources.join(", ")}
                  </p>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Consultando datos del torneo…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="shrink-0 border-t border-border p-4 flex gap-2 items-end bg-background/80"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Pregunta sobre el Mundial…"
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm min-h-[44px] max-h-32 focus:outline-none focus:ring-2 focus:ring-mundial-gold/40 disabled:opacity-50"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="shrink-0 h-11 w-11">
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <p className="text-[10px] text-muted-foreground text-center px-4 pb-3">
          Respuestas basadas en datos del sitio + IA. Verifica cifras críticas antes de citarlas.
        </p>
      </CardContent>
    </Card>
  );
}
