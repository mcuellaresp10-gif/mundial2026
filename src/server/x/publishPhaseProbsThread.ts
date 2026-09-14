import { postTweetThread } from "@/server/x/client";
import {
  getPhaseProbsDraftForDay,
  setPhaseProbsDraftStatus,
} from "@/server/x/phaseProbsDraftStore";

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
    const { rootId } = await postTweetThread(draft.tweets);
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
