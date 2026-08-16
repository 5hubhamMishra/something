import { getRedis } from '@/lib/redis';

const PASSWORD_KEY = 'auth:password_hash';
const OTP_KEY = 'auth:otp:reset';
const OTP_TTL_SECONDS = 10 * 60;

export async function getPasswordHash(): Promise<string | null> {
  return (await getRedis().get<string>(PASSWORD_KEY)) ?? null;
}

export async function setPasswordHash(hash: string): Promise<void> {
  await getRedis().set(PASSWORD_KEY, hash);
}

export async function setOtp(code: string): Promise<void> {
  await getRedis().set(OTP_KEY, code, { ex: OTP_TTL_SECONDS });
}

export async function getOtp(): Promise<string | null> {
  return (await getRedis().get<string>(OTP_KEY)) ?? null;
}

export async function clearOtp(): Promise<void> {
  await getRedis().del(OTP_KEY);
}

/** Fixed-window rate limit. Returns true while under `max` hits per `windowSeconds`. */
export async function checkRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const redis = getRedis();
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }
  return count <= max;
}
