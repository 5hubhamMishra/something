import { NextResponse, type NextRequest } from 'next/server';
import { getOtp, clearOtp, setPasswordHash, checkRateLimit } from '@/lib/credentials-store';
import { hashPassword, safeEqual } from '@/lib/password';
import { getClientIp } from '@/lib/request-ip';
import { isRedisConfigured } from '@/lib/env';

export async function POST(req: NextRequest) {
  if (!isRedisConfigured()) {
    return NextResponse.json({ error: 'Password reset is not configured yet.' }, { status: 500 });
  }

  const ip = getClientIp(req);
  const withinLimit = await checkRateLimit(`ratelimit:reset:${ip}`, 8, 15 * 60);
  if (!withinLimit) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.trim() : '';
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Enter the 6-digit code from your email.' }, { status: 400 });
  }
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
  }

  const storedCode = await getOtp();
  if (!storedCode || !safeEqual(storedCode, code)) {
    return NextResponse.json({ error: 'That code is invalid or has expired.' }, { status: 400 });
  }

  await setPasswordHash(hashPassword(newPassword));
  await clearOtp();

  return NextResponse.json({ ok: true });
}
