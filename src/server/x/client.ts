import { TwitterApi } from "twitter-api-v2";

export function isXForecastsDryRun(): boolean {
  return process.env.X_FORECASTS_DRY_RUN === "1" || process.env.X_FORECASTS_DRY_RUN === "true";
}

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v || v.startsWith("your_")) {
    throw new Error(`${name} not configured`);
  }
  return v;
}

export function createTwitterClient(): TwitterApi {
  return new TwitterApi({
    appKey: requireEnv("TWITTER_API_KEY"),
    appSecret: requireEnv("TWITTER_API_SECRET"),
    accessToken: requireEnv("TWITTER_ACCESS_TOKEN"),
    accessSecret: requireEnv("TWITTER_ACCESS_TOKEN_SECRET"),
  });
}

export interface PostTweetThreadOptions {
  /** Imágenes adjuntas solo al primer tuit del hilo. */
  mediaBuffers?: Buffer[];
}

export interface IndependentTweet {
  text: string;
  mediaBuffer?: Buffer;
}

/** Publica un hilo (primer tuit + replies). Devuelve id del tuit cabecera. */
export async function postTweetThread(
  tweets: string[],
  options?: PostTweetThreadOptions
): Promise<{ rootId: string }> {
  if (tweets.length === 0) {
    throw new Error("Empty tweet thread");
  }

  if (isXForecastsDryRun()) {
    console.info("[x] DRY RUN — thread not posted:");
    tweets.forEach((t, i) => console.info(`--- ${i + 1}/${tweets.length} ---\n${t}\n`));
    if (options?.mediaBuffers?.length) {
      console.info(`[x] DRY RUN — ${options.mediaBuffers.length} media buffer(s) on root tweet`);
    }
    return { rootId: "dry-run" };
  }

  const client = createTwitterClient().readWrite;
  let rootMediaIds: string[] | undefined;

  if (options?.mediaBuffers?.length) {
    const rwClient = createTwitterClient();
    rootMediaIds = [];
    for (const buf of options.mediaBuffers) {
      const mediaId = await rwClient.v1.uploadMedia(buf, { mimeType: "image/png" });
      rootMediaIds.push(mediaId);
    }
  }

  let rootId = "";
  let replyTo: string | undefined;

  for (let i = 0; i < tweets.length; i++) {
    const text = tweets[i];
    const isRoot = i === 0;
    const res = await client.v2.tweet({
      text,
      ...(replyTo ? { reply: { in_reply_to_tweet_id: replyTo } } : {}),
      ...(isRoot && rootMediaIds?.length
        ? { media: { media_ids: rootMediaIds as [string] | [string, string] | [string, string, string] | [string, string, string, string] } }
        : {}),
    });
    const id = res.data.id;
    if (!rootId) rootId = id;
    replyTo = id;
  }

  return { rootId };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Publica posts independientes (un partido = un tuit, cada uno con su imagen). */
export async function postIndependentTweets(
  tweets: IndependentTweet[]
): Promise<{ rootId: string; ids: string[] }> {
  if (tweets.length === 0) throw new Error("Empty tweet list");

  if (isXForecastsDryRun()) {
    console.info("[x] DRY RUN — independent posts:");
    tweets.forEach((t, i) => {
      console.info(`--- ${i + 1}/${tweets.length} ---\n${t.text}\n`);
      if (t.mediaBuffer) {
        console.info(`[x] DRY RUN — media ${t.mediaBuffer.length} bytes`);
      }
    });
    return { rootId: "dry-run", ids: tweets.map(() => "dry-run") };
  }

  const client = createTwitterClient().readWrite;
  const uploader = createTwitterClient();
  const ids: string[] = [];

  for (let i = 0; i < tweets.length; i++) {
    const item = tweets[i]!;
    let mediaIds: [string] | undefined;
    if (item.mediaBuffer) {
      const mediaId = await uploader.v1.uploadMedia(item.mediaBuffer, {
        mimeType: "image/png",
      });
      mediaIds = [mediaId];
    }
    const res = await client.v2.tweet({
      text: item.text,
      ...(mediaIds ? { media: { media_ids: mediaIds } } : {}),
    });
    ids.push(res.data.id);
    if (i < tweets.length - 1) await sleep(1500);
  }

  return { rootId: ids[0]!, ids };
}
