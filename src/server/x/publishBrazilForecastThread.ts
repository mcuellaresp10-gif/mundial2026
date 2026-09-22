import { postTweetThread } from "@/server/x/client";
import {
  getBrazilForecastDraftForDay,
  setBrazilForecastDraftStatus,
} from "@/server/x/brazilForecastDraftStore";

export async function publishApprovedBrazilForecastThread(
  dayKey: string
): Promise<{ ok: boolean; rootId?: string; error?: string }> {
  const draft = getBrazilForecastDraftForDay(dayKey);
  if (!draft) return { ok: false, error: "No hay borrador Brasileirão para ese día." };
  if (draft.status === "published") {
    return { ok: true, rootId: draft.publishedTweetId, error: "already_published" };
  }
  if (draft.status === "rejected") {
    return { ok: false, error: "El borrador fue descartado." };
  }
  if (draft.tweets.length === 0) return { ok: false, error: "Borrador vacío." };

  try {
    const { rootId } = await postTweetThread(draft.tweets);
    setBrazilForecastDraftStatus(dayKey, "published", { publishedTweetId: rootId });
    return { ok: true, rootId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[x-brazil] publish failed:", message);
    return { ok: false, error: message };
  }
}

export function rejectBrazilForecastDraft(dayKey: string): boolean {
  return setBrazilForecastDraftStatus(dayKey, "rejected") != null;
}
