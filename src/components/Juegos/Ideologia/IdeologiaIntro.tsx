"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  onStart: () => void;
}

export function IdeologiaIntro({ onStart }: Props) {
  return (
    <Card className="border-mundial-gold/25 max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">
          ¿Con qué DT te identificas?
        </CardTitle>
        <p className="text-sm text-muted-foreground font-normal leading-relaxed">
          20 dilemas de fútbol. Sin punto medio: eliges A o B. Al final te
          emparejamos con un director técnico (internacionales y colombianos) según
          tu ideología de juego.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>Resultadismo ↔ Idealismo</li>
          <li>Orden ↔ Libertad</li>
          <li>Posesión ↔ Verticalidad</li>
          <li>Individual ↔ Colectivo</li>
        </ul>
        <Button size="lg" className="w-full sm:w-auto" onClick={onStart}>
          Empezar test
        </Button>
      </CardContent>
    </Card>
  );
}
