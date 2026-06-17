import { getRedisClient } from "../redis.client";

const redis = getRedisClient();

///////// ------------ GET ----------////////////
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key);
    if (!raw) return null;

    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[Redis] cacheGet failed for key "#${key}": `, error);
    return null;
  }
}

///////// ------------ SET WITH TTL ----------////////////
export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.log(`[Redis]: cacheSet failed for key "#${key}": `, error);
  }
}

///////// ------------ DELETE ONE OR MANY KEYS ----------////////////

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!keys.length) return;

  try {
    await redis.del(...keys);
  } catch (error) {
    console.log(
      `[Redis]: cacheDel failed for keys "#${keys.join(", ")}"`,
      error,
    );
  }
}

///////// ------------ DELETE BY PATTERN ----------////////////
export async function cacheDelByPattern(pattern: string): Promise<void> {
  try {
    const stream = redis.scanStream({ match: pattern, count: 100 });
    const pipeline = redis.pipeline();
    let found = 0;

    stream.on("data", (keys: string[]) => {
      keys.forEach((key: string) => {
        pipeline.del(key);
        found++;
      });
    });

    await new Promise<void>((resolve, reject) => {
      stream.on("end", async () => {
        if (found > 0) {
          await pipeline.exec();
          resolve();
        }
      });

      stream.on("error", reject);
    });
  } catch (error) {
    console.log(
      `[Redis]: cacheDelByPattern failed for pattern "#${pattern}"`,
      error,
    );
  }
}

///////// ------------ TTL inspect ----------////////////

export async function cacheTTL(key: string): Promise<number> {
  try {
    return await redis.ttl(key);
  } catch (error) {
    console.log(`[Redis]: cacheTTL failed for key "#${key}"`, error);

    return -2;
  }
}

///////// ------------  EXISTS ----------////////////
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const result = await redis.exists(key);
    return result === 1;
  } catch (error) {
    console.log(`[Redis]: cacheExists failed for key "#${key}"`, error);
  }
  return false;
}

///////// ------------  RESET TTL on an existing key ----------////////////
export async function cacheRefresh(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  await cacheSet(key, value, ttlSeconds);
}

///////// ------------  GET or SET (cache-aside in one call) ----------////////////

export async function cacheGetOrSet<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}
