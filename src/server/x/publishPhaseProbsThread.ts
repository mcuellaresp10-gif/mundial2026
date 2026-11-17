import { postTweetThread } from "@/server/x/client";
import {
  getPhaseProbsDraftForDay,
  setPhaseProbsDraftStatus,
} from "@/server/x/phaseProbsDraftStore";
import { renderCuadrangularesSemisPng } from "@/server/x/renderCuadrangularesSemisPng";
import { BETPLAY_SEMIS_SIMULATIONS } from "@/utils/betPlaySeasonSimulation";

export async function publishApprovedPhaseProbsThread(dayKey: string): Promise<{
  ok: boolean;
  rootId?: string;
  error?: string;
}> {
  const draft = getPhaseProbsDraftForDay(dayKey);
  if (!draft) return { ok: false, error: "No hay borrador para ese día." };
  if (draft.status === "published") {
    return { ok: true, rootId: draft.publishedTweetId, error: "already_published" };
  }
  if (draft.status === "rejected") {
    return { ok: false, error: "El borrador fue descartado." };
  }
  if (draft.tweets.length === 0) {
    return { ok: false, error: "Borrador vacío." };
  }

  try {
    let mediaBuffers: Buffer[] | undefined;
    try {
      const groupA = draft.rows
        .filter((r) => r.group === "A")
        .map((r) => ({
          teamId: r.teamId,
          teamName: r.teamName,
          teamLogo: r.teamLogo ?? "",
          group: "A" as const,
          isSeed: r.isSeed ?? false,
          probFinal: r.probFinal,
          probChampion: r.probChampion,
          projectedPoints: r.projectedPoints ?? 0,
        }));
      const groupB = draft.rows
        .filter((r) => r.group === "B")
        .map((r) => ({
          teamId: r.teamId,
          teamName: r.teamName,
          teamLogo: r.teamLogo ?? "",
          group: "B" as const,
          isSeed: r.isSeed ?? false,
          probFinal: r.probFinal,
          probChampion: r.probChampion,
          projectedPoints: r.projectedPoints ?? 0,
        }));

      const png = await renderCuadrangularesSemisPng({
        groupA,
        groupB,
        simulations: draft.simulations ?? BETPLAY_SEMIS_SIMULATIONS,
        phaseLabel: draft.phase === "apertura" ? "Apertura 2026" : "Clausura 2026",
      });
      mediaBuffers = [png];
      console.info(`[x-phase] semis PNG ${png.length} bytes`);
    } catch (imgErr) {
      console.error("[x-phase] PNG render failed, publishing text only:", imgErr);
    }

    const { rootId } = await postTweetThread(draft.tweets, { mediaBuffers });
    setPhaseProbsDraftStatus(dayKey, "published", { publishedTweetId: rootId });
    return { ok: true, rootId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[x-phase] publish failed:", message);
    return { ok: false, error: message };
  }
}

export function rejectPhaseProbsDraft(dayKey: string): boolean {
  return setPhaseProbsDraftStatus(dayKey, "rejected") != null;
}
