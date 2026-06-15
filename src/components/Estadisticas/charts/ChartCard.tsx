"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  loading,
  empty,
  emptyMessage = "Sin datos aún",
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[220px] w-full rounded-lg" />
        ) : empty ? (
          <p className="text-sm text-muted-foreground py-8 text-center">{emptyMessage}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

export const CHART_COLORS = {
  gold: "#FCD116",
  blue: "#003DA5",
  red: "#CE1126",
  green: "#008751",
  orange: "#FF6B00",
  teal: "#00A1DE",
};

export const PIE_COLORS = ["#FCD116", "#003DA5", "#CE1126", "#008751", "#FF6B00", "#00A1DE", "#9333ea"];
