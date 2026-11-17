import { postTweetThread } from "@/server/x/client";
import {
  getOnceIdealDraftForDay,
  setOnceIdealDraftStatus,
} from "@/server/x/onceIdealDraftStore";
import { renderOnceIdealPng } from "@/server/x/renderOnceIdealPng";

export async function publishApprovedOnceIdealThread(dayKey: string): Promise<{
  ok: boolean;
  rootId?: string;
  error?: string;
}> {
  const draft = getOnceIdealDraftForDay(dayKey);
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
      const png = await renderOnceIdealPng({
        players: draft.players,
        formation: draft.formation,
        phaseLabel: draft.phaseLabel,
        averageRating: draft.averageRating,
      });
      mediaBuffers = [png];
      console.info(`[x-once-ideal] PNG ${png.length} bytes`);
    } catch (imgErr) {
      console.error("[x-once-ideal] PNG render failed, publishing text only:", imgErr);
    }

    const { rootId } = await postTweetThread(draft.tweets, { mediaBuffers });
    setOnceIdealDraftStatus(dayKey, "published", { publishedTweetId: rootId });
    return { ok: true, rootId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[x-once-ideal] publish failed:", message);
    return { ok: false, error: message };
  }
}

export function rejectOnceIdealDraft(dayKey: string): boolean {
  return setOnceIdealDraftStatus(dayKey, "rejected") != null;
}
