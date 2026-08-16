import { Redis } from '@upstash/redis';

let _redis: Redis | null = null;

/**
 * Lazy singleton so build-time module evaluation never crashes on a missing env var.
 *
 * Vercel's Upstash integration provisions `KV_REST_API_URL` / `KV_REST_API_TOKEN`
 * (the legacy @vercel/kv naming), not the `UPSTASH_REDIS_REST_URL` / `_TOKEN` pair
 * that `Redis.fromEnv()` looks for — so this is built explicitly instead.
 */
export function getRedis(): Redis {
  if (!_redis) {
    _redis = new Redis({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return _redis;
}
