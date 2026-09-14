import { postTweetThread } from "@/server/x/client";
import {
  getForecastDraftForDay,
  setForecastDraftStatus,
} from "@/server/x/forecastDraftStore";

export async function publishApprovedForecastThread(dayKey: string): Promise<{
  ok: boolean;
  rootId?: string;
  error?: string;
}> {
  const draft = getForecastDraftForDay(dayKey);
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
    const { rootId } = await postTweetThread(draft.tweets);
    setForecastDraftStatus(dayKey, "published", { publishedTweetId: rootId });
    return { ok: true, rootId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[x-forecast] publish failed:", message);
    return { ok: false, error: message };
  }
}

export function rejectForecastDraft(dayKey: string): boolean {
  return setForecastDraftStatus(dayKey, "rejected") != null;
}
