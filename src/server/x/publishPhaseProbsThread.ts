import { postTweetThread } from "@/server/x/client";
import {
  getPhaseProbsDraftForDay,
  setPhaseProbsDraftStatus,
} from "@/server/x/phaseProbsDraftStore";
import { renderPhaseProbsTablePng } from "@/server/x/renderPhaseProbsTablePng";

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
      const png = await renderPhaseProbsTablePng(draft.rows, {
        jornada: draft.jornada,
        phase: draft.phase,
        maxPlayed: draft.jornada,
        simulations: 1000,
      });
      mediaBuffers = [png];
      console.info(`[x-phase] PNG table ${png.length} bytes`);
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
