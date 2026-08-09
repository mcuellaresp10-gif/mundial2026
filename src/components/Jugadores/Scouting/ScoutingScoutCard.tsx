"use client";

import { useRef } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ScoutingProfile } from "@/utils/worldCupScoutingMetrics";
import { ScoutingRadarWC, peerAverageRadarFromPool, syntheticPeerProfile } from "./ScoutingRadarWC";
import { ScoutingPercentileBar } from "./ScoutingPer90Table";
import { ChartExportButton } from "./ChartExportButton";
import { buildAnchoredScoutBrief } from "@/utils/scoutingInsights";
import type { ScoutingPosition } from "@/config/positionMetricProfiles";

interface ScoutingScoutCardProps {
  profile: ScoutingProfile;
  peers: ScoutingProfile[];
  position: ScoutingPosition;
}

export function ScoutingScoutCard({ profile, peers, position }: ScoutingScoutCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const peerValues = peerAverageRadarFromPool(peers, position, profile.playerId);
  const peer = peerValues
    ? syntheticPeerProfile(peerValues, position, profile)
    : null;
  const brief = buildAnchoredScoutBrief(profile);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <CardTitle className="text-base">Ficha scout</CardTitle>
        <ChartExportButton
          targetRef={ref}
          filename={`ficha-${profile.playerId}-${profile.name.replace(/\s+/g, "-")}.png`}
          allowPrint
        />
      </CardHeader>
      <CardContent>
        <div ref={ref} className="space-y-3 rounded-lg bg-background p-3">
          <div className="flex items-center gap-3">
            <Image
              src={profile.photo}
              alt=""
              width={56}
              height={56}
              className="rounded-full border"
              unoptimized
            />
            <div className="min-w-0">
              <p className="font-semibold truncate">{profile.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {profile.team} · {profile.position}
              </p>
              <p className="text-xs font-mono mt-1">
                {profile.goals}G · {profile.assists}A · {profile.rating.toFixed(1)} ·{" "}
                {profile.minutes}&apos;
              </p>
            </div>
          </div>
          {peer && (
            <ScoutingRadarWC
              profile={profile}
              compareProfile={peer}
              labelA={profile.name.split(" ").pop()}
              labelB="Pool"
              height={220}
            />
          )}
          <ScoutingPercentileBar profile={profile} />
          <ul className="space-y-1 text-xs text-muted-foreground">
            {brief.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
          <p className="text-[10px] text-muted-foreground/80 text-right">
            Fútbol Américas · scouting
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ScoutingDataHonestyBadge() {
  return (
    <p className="text-[11px] text-muted-foreground">
      Datos: volumen API-Football. Sin xG, pases/carries progresivos, pressures ni
      video.
    </p>
  );
}

export function ScoutingMarketPanel({ profile }: { profile: ScoutingProfile }) {
  const q = encodeURIComponent(profile.name);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Mercado</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className="text-muted-foreground text-xs">
          Sin feed de valor/contrato propio. Enlaces externos (verificar
          siempre):
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a
              href={`https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${q}`}
              target="_blank"
              rel="noreferrer"
            >
              Transfermarkt
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a
              href={`https://www.sofascore.com/search?q=${q}`}
              target="_blank"
              rel="noreferrer"
            >
              Sofascore
            </a>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Valor / contrato: N/D</p>
      </CardContent>
    </Card>
  );
}
