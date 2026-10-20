import { postIndependentTweets } from "@/server/x/client";
import type { ForecastDraftMatch } from "@/server/x/forecastDraftStore";
import { renderForecastMatchPng } from "@/server/x/renderForecastMatchPng";

export async function publishForecastMatchPosts(
  matches: ForecastDraftMatch[],
  tweets: string[]
): Promise<{ rootId: string }> {
  const items = [];
  for (let i = 0; i < tweets.length; i++) {
    const match = matches[i];
    let mediaBuffer: Buffer | undefined;
    if (match) {
      try {
        mediaBuffer = await renderForecastMatchPng(match);
        console.info(`[x-forecast] PNG match ${match.fixtureId} ${mediaBuffer.length} bytes`);
      } catch (e) {
        console.error("[x-forecast] PNG failed, text only:", e);
      }
    }
    items.push({ text: tweets[i]!, mediaBuffer });
  }
  return postIndependentTweets(items);
}
