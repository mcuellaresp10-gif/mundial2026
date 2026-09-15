import { postTweetThread } from "@/server/x/client";
import {
  getConmebolForecastDraftForDay,
  setConmebolForecastDraftStatus,
} from "@/server/x/conmebolForecastDraftStore";

export async function publishApprovedConmebolForecastThread(
  dayKey: string
): Promise<{
  ok: boolean;
  rootId?: string;
  error?: string;
}> {
  const draft = getConmebolForecastDraftForDay(dayKey);
  if (!draft) return { ok: false, error: "No hay borrador Conmebol para ese día." };
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
    setConmebolForecastDraftStatus(dayKey, "published", {
      publishedTweetId: rootId,
    });
    return { ok: true, rootId };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[x-conmebol] publish failed:", message);
    return { ok: false, error: message };
  }
}

export function rejectConmebolForecastDraft(dayKey: string): boolean {
  return setConmebolForecastDraftStatus(dayKey, "rejected") != null;
}
