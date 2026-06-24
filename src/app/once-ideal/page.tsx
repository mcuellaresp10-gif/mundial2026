"use client";

import {
  OnceIdealDisplay,
  OnceIdealJornadaDisplay,
  ArmarMiXI,
} from "@/components/OnceIdeal/OnceIdealDisplay";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function OnceIdealPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Once Ideal</h1>
        <p className="text-muted-foreground mt-1">
          Torneo completo, jornada a jornada o tu propio XI
        </p>
      </div>

      <Tabs defaultValue="torneo">
        <TabsList>
          <TabsTrigger value="torneo">Once del torneo</TabsTrigger>
          <TabsTrigger value="jornada">Por jornada</TabsTrigger>
          <TabsTrigger value="mi-xi">Armar Mi XI</TabsTrigger>
        </TabsList>
        <TabsContent value="torneo">
          <OnceIdealDisplay />
        </TabsContent>
        <TabsContent value="jornada">
          <OnceIdealJornadaDisplay />
        </TabsContent>
        <TabsContent value="mi-xi">
          <ArmarMiXI />
        </TabsContent>
      </Tabs>
    </div>
  );
}
