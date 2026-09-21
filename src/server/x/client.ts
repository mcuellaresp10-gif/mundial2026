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
