/** True once the Redis integration's env vars are actually present (vs. mid-provisioning). */
export function isRedisConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}
