import { postTweetThread } from "@/server/x/client";
import {
  getArgentinaPhaseDraftForDay,
  setArgentinaPhaseDraftStatus,
} from "@/server/x/argentinaPhaseDraftStore";
import { renderArgentinaPhaseProbsTablePng } from "@/server/x/renderArgentinaPhaseProbsTablePng";

export async function publishApprovedArgentinaPhaseThread(
  dayKey: string
): Promise<{ ok: boolean; rootId?: string; error?: string }> {
  const draft = getArgentinaPhaseDraftForDay(dayKey);
  if (!draft) return { ok: false, error: "No hay borrador para ese día." };
  if (draft.status === "published") {
    return { ok: true, rootId: draft.publishedTweetId, error: "already_published" };
  }
  if (draft.status === "rejected") {
    return { ok: false, error: "El borrador fue descartado." };
  }
  if (draft.tweets.length === 0) return { ok: false, error: "Borrador vacío." };

  try {
    let mediaBuffers: Buffer[] | undefined;
    try {
      const png = await renderArgentinaPhaseProbsTablePng(draft.rows, {
        jornada: draft.jornada,
        phase: draft.phase,
        maxPlayed: draft.jornada,
        simulations: 1000,
      });
      mediaBuffers = [png];
      console.info(`[x-argentina-phase] PNG ${png.length} bytes`);
    } catch (imgErr) {
      console.error("[x-argentina-phase] PNG failed, text only:", imgErr);
    }

    const { rootId } = await postTweetThread(draft.tweets, { mediaBuffers });
    setArgentinaPhaseDraftStatus(dayKey, "published", { publishedTweetId: rootId });
    return { ok: true, rootId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[x-argentina-phase] publish failed:", message);
    return { ok: false, error: message };
  }
}

export function rejectArgentinaPhaseDraft(dayKey: string): boolean {
  return setArgentinaPhaseDraftStatus(dayKey, "rejected") != null;
}
