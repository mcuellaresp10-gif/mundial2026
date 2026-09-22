import { postTweetThread } from "@/server/x/client";
import {
  getArgentinaForecastDraftForDay,
  setArgentinaForecastDraftStatus,
} from "@/server/x/argentinaForecastDraftStore";

export async function publishApprovedArgentinaForecastThread(
  dayKey: string
): Promise<{ ok: boolean; rootId?: string; error?: string }> {
  const draft = getArgentinaForecastDraftForDay(dayKey);
  if (!draft) return { ok: false, error: "No hay borrador Argentina para ese día." };
  if (draft.status === "published") {
    return { ok: true, rootId: draft.publishedTweetId, error: "already_published" };
  }
  if (draft.status === "rejected") {
    return { ok: false, error: "El borrador fue descartado." };
  }
  if (draft.tweets.length === 0) return { ok: false, error: "Borrador vacío." };

  try {
    const { rootId } = await postTweetThread(draft.tweets);
    setArgentinaForecastDraftStatus(dayKey, "published", { publishedTweetId: rootId });
    return { ok: true, rootId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[x-argentina] publish failed:", message);
    return { ok: false, error: message };
  }
}

export function rejectArgentinaForecastDraft(dayKey: string): boolean {
  return setArgentinaForecastDraftStatus(dayKey, "rejected") != null;
}
