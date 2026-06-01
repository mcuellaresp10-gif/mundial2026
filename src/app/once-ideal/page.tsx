"use client";

import { OnceIdealDisplay, ArmarMiXI } from "@/components/OnceIdeal/OnceIdealDisplay";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function OnceIdealPage() {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold">Once Ideal del Torneo</h1>
        <p className="text-muted-foreground mt-1">Actualizado jornada a jornada según ratings</p>
      </div>

      <Tabs defaultValue="ideal">
        <TabsList>
          <TabsTrigger value="ideal">Once Ideal</TabsTrigger>
          <TabsTrigger value="mi-xi">Armar Mi XI</TabsTrigger>
        </TabsList>
        <TabsContent value="ideal">
          <OnceIdealDisplay />
        </TabsContent>
        <TabsContent value="mi-xi">
          <ArmarMiXI />
        </TabsContent>
      </Tabs>
    </div>
  );
}
