"use client";

import { GruposSection } from "@/components/Estadisticas/GruposSection";
import { BestThirdsSection } from "@/components/Grupos/BestThirdsSection";
import { KnockoutBracketSection } from "@/components/Grupos/KnockoutBracketSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function GruposPageContent() {
  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Grupos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Fase de grupos · 2 primeros + 8 mejores terceros
        </p>
      </div>

      <Tabs defaultValue="posiciones" className="gap-4">
        <TabsList className="sticky top-[70px] z-20 w-full h-auto flex-wrap gap-1 p-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border border-border shadow-sm">
          <TabsTrigger value="posiciones" className="flex-1 min-w-[100px] text-xs sm:text-sm">
            Posiciones
          </TabsTrigger>
          <TabsTrigger value="terceros" className="flex-1 min-w-[100px] text-xs sm:text-sm">
            Mejores 3º
          </TabsTrigger>
          <TabsTrigger value="eliminatorias" className="flex-1 min-w-[100px] text-xs sm:text-sm">
            Eliminatorias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posiciones" className="mt-3 md:mt-4 focus-visible:outline-none">
          <GruposSection />
        </TabsContent>

        <TabsContent value="terceros" className="mt-3 md:mt-4 focus-visible:outline-none">
          <BestThirdsSection />
        </TabsContent>

        <TabsContent value="eliminatorias" className="mt-3 md:mt-4 focus-visible:outline-none">
          <KnockoutBracketSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
