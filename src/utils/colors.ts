export const TEAM_COLORS: Record<string, { primary: string; secondary: string; accent?: string }> = {
  Colombia: { primary: "#003DA5", secondary: "#FCD116", accent: "#CE1126" },
  Brazil: { primary: "#FFD600", secondary: "#002B7F" },
  Argentina: { primary: "#4BA3FF", secondary: "#0032A0", accent: "#FFFFFF" },
  Germany: { primary: "#000000", secondary: "#DD0000", accent: "#FFCE00" },
  France: { primary: "#002654", secondary: "#ED2939", accent: "#FFFFFF" },
  Spain: { primary: "#AA151B", secondary: "#F1BF00" },
  England: { primary: "#FFFFFF", secondary: "#CE1124", accent: "#00247D" },
  Italy: { primary: "#009246", secondary: "#CE2B37", accent: "#FFFFFF" },
  Portugal: { primary: "#006600", secondary: "#FF0000" },
  Mexico: { primary: "#006847", secondary: "#CE1126", accent: "#FFFFFF" },
  USA: { primary: "#002868", secondary: "#BF0A30", accent: "#FFFFFF" },
  Japan: { primary: "#BC002D", secondary: "#FFFFFF" },
  Netherlands: { primary: "#FF6600", secondary: "#21468B", accent: "#FFFFFF" },
  Uruguay: { primary: "#003DA5", secondary: "#FFFFFF" },
  Belgium: { primary: "#ED2939", secondary: "#FAE042", accent: "#000000" },
  Croatia: { primary: "#FF0000", secondary: "#FFFFFF", accent: "#171796" },
  Morocco: { primary: "#C1272D", secondary: "#006233" },
  Ecuador: { primary: "#FFD100", secondary: "#003DA5", accent: "#CE1126" },
  Chile: { primary: "#D52B1E", secondary: "#0039A6", accent: "#FFFFFF" },
  Peru: { primary: "#D91023", secondary: "#FFFFFF" },
};

export function getTeamColors(teamName: string) {
  const key = Object.keys(TEAM_COLORS).find(
    (k) => teamName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(teamName.toLowerCase())
  );
  return key ? TEAM_COLORS[key] : { primary: "#64748B", secondary: "#0F172A" };
}

export function getRatingColor(rating: number): string {
  if (rating >= 8) return "text-mundial-green";
  if (rating >= 6) return "text-mundial-gold";
  return "text-mundial-red";
}

export function getRatingBgColor(rating: number): string {
  if (rating >= 8) return "bg-emerald-500/10 border-emerald-500/30";
  if (rating >= 6) return "bg-yellow-500/10 border-yellow-500/30";
  return "bg-red-500/10 border-red-500/30";
}
