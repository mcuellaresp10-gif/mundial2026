import { postTweetThread } from "@/server/x/client";
import {
  getBrazilPhaseDraftForDay,
  setBrazilPhaseDraftStatus,
} from "@/server/x/brazilPhaseDraftStore";
import { renderBrazilPhaseProbsTablePng } from "@/server/x/renderBrazilPhaseProbsTablePng";

export async function publishApprovedBrazilPhaseThread(
  dayKey: string
): Promise<{ ok: boolean; rootId?: string; error?: string }> {
  const draft = getBrazilPhaseDraftForDay(dayKey);
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
      const png = await renderBrazilPhaseProbsTablePng(draft.rows, {
        jornada: draft.jornada,
        maxPlayed: draft.jornada,
        simulations: 1000,
      });
      mediaBuffers = [png];
      console.info(`[x-brazil-phase] PNG ${png.length} bytes`);
    } catch (imgErr) {
      console.error("[x-brazil-phase] PNG failed, text only:", imgErr);
    }

    const { rootId } = await postTweetThread(draft.tweets, { mediaBuffers });
    setBrazilPhaseDraftStatus(dayKey, "published", { publishedTweetId: rootId });
    return { ok: true, rootId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[x-brazil-phase] publish failed:", message);
    return { ok: false, error: message };
  }
}

export function rejectBrazilPhaseDraft(dayKey: string): boolean {
  return setBrazilPhaseDraftStatus(dayKey, "rejected") != null;
}
