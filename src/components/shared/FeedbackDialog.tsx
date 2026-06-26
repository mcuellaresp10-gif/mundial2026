"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trackFeedbackSubmit } from "@/lib/analytics";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
  FEEDBACK_MAX_DESCRIPTION,
  type FeedbackCategory,
} from "@/lib/feedback";
import { cn } from "@/lib/utils";

interface FeedbackDialogProps {
  trigger: React.ReactNode;
}

export function FeedbackDialog({ trigger }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory | "">("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [includeContext, setIncludeContext] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const resetForm = useCallback(() => {
    setCategory("");
    setDescription("");
    setEmail("");
    setIncludeContext(true);
    setHoneypot("");
    setError(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    resetForm();
  }, [open, resetForm]);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = window.setTimeout(() => setToastVisible(false), 3500);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!category) {
      setError("Selecciona una categoría.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          description: description.trim() || undefined,
          email: email.trim() || undefined,
          includeContext,
          pageUrl: includeContext ? window.location.href : undefined,
          userAgent: includeContext ? navigator.userAgent : undefined,
          honeypot,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? "No se pudo enviar el reporte. Intenta más tarde.");
        return;
      }

      trackFeedbackSubmit(category);
      setOpen(false);
      setToastVisible(true);
    } catch {
      setError("Error de conexión. Comprueba tu red e inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reportar problema</DialogTitle>
            <DialogDescription>
              Cuéntanos qué falló. Revisamos los reportes durante el torneo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="feedback-website">Sitio web</label>
              <input
                id="feedback-website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback-category" className="text-sm font-medium">
                Categoría <span className="text-mundial-red">*</span>
              </label>
              <Select
                id="feedback-category"
                required
                value={category}
                onChange={(event) => setCategory(event.target.value as FeedbackCategory | "")}
              >
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {FEEDBACK_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {FEEDBACK_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback-description" className="text-sm font-medium">
                Descripción <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <Textarea
                id="feedback-description"
                placeholder="Ej.: el marcador de Colombia vs X no coincide con el partido en vivo"
                maxLength={FEEDBACK_MAX_DESCRIPTION}
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <p className="text-xs text-muted-foreground text-right tabular-nums">
                {description.length}/{FEEDBACK_MAX_DESCRIPTION}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="feedback-email" className="text-sm font-medium">
                Email <span className="text-muted-foreground font-normal">(opcional)</span>
              </label>
              <Input
                id="feedback-email"
                type="email"
                placeholder="Solo si quieres que te contactemos"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 rounded border-input"
                checked={includeContext}
                onChange={(event) => setIncludeContext(event.target.checked)}
              />
              <span>Incluir URL y datos técnicos del navegador</span>
            </label>

            {error && (
              <p className="text-sm text-mundial-red" role="alert">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting || !category}>
                {submitting ? "Enviando…" : "Enviar reporte"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-md border border-mundial-gold/30 bg-mundial-deep px-4 py-3 text-sm text-white shadow-lg transition-all duration-300",
          toastVisible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"
        )}
      >
        Gracias, lo revisaremos.
      </div>
    </>
  );
}
