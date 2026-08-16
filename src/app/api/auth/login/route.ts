import { NextResponse, type NextRequest } from 'next/server';
import { getPasswordHash, checkRateLimit } from '@/lib/credentials-store';
import { verifyPassword, safeEqual } from '@/lib/password';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from '@/lib/session';
import { getClientIp } from '@/lib/request-ip';
import { isRedisConfigured } from '@/lib/env';

export async function POST(req: NextRequest) {
  const expectedUsername = process.env.SITE_USERNAME;
  const secret = process.env.SESSION_SECRET;
  if (!expectedUsername || !secret || !isRedisConfigured()) {
    return NextResponse.json({ error: 'The site is not configured yet.' }, { status: 500 });
  }

  const ip = getClientIp(req);
  const withinLimit = await checkRateLimit(`ratelimit:login:${ip}`, 10, 15 * 60);
  if (!withinLimit) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  const storedHash = await getPasswordHash();
  if (!storedHash) {
    return NextResponse.json({ error: 'No password has been set up yet.' }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  const usernameOk = safeEqual(username, expectedUsername);
  const passwordOk = verifyPassword(password, storedHash);

  if (!usernameOk || !passwordOk) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const token = createSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return res;
}
