import Redis from "ioredis";
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? undefined,
    retryStrategy(times) {
      return Math.min(times * 100, 10_000);
    },
    commandTimeout: 5_000,
    enableOfflineQueue: true,
    connectionName: "resido",
  });

  redisClient.on("connect", () => console.log("[Redis]: Connected"));
  redisClient.on("ready", () => console.log("[Redis]: Ready"));
  redisClient.on("error", () => console.log("[Redis]: Error"));
  redisClient.on("close", () => console.log("[Redis]: Connection closed"));
  redisClient.on("reconnecting", () => console.log("[Redis Reconnecting..."));
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient) return;

  await redisClient.quit();
  redisClient = null;
  console.log("[Redis] Disconnected");
}
