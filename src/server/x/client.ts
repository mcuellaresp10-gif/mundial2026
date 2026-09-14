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

/** Publica un hilo (primer tuit + replies). Devuelve id del tuit cabecera. */
export async function postTweetThread(tweets: string[]): Promise<{ rootId: string }> {
  if (tweets.length === 0) {
    throw new Error("Empty tweet thread");
  }

  if (isXForecastsDryRun()) {
    console.info("[x] DRY RUN — thread not posted:");
    tweets.forEach((t, i) => console.info(`--- ${i + 1}/${tweets.length} ---\n${t}\n`));
    return { rootId: "dry-run" };
  }

  const client = createTwitterClient().readWrite;
  let rootId = "";
  let replyTo: string | undefined;

  for (const text of tweets) {
    const res = await client.v2.tweet(
      replyTo ? { text, reply: { in_reply_to_tweet_id: replyTo } } : { text }
    );
    const id = res.data.id;
    if (!rootId) rootId = id;
    replyTo = id;
  }

  return { rootId };
}
