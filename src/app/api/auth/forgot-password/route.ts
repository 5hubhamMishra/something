import { randomInt } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { setOtp, checkRateLimit } from '@/lib/credentials-store';
import { sendOtpEmail } from '@/lib/email';
import { getClientIp } from '@/lib/request-ip';
import { isRedisConfigured } from '@/lib/env';

export async function POST(req: NextRequest) {
  if (!process.env.OWNER_EMAIL || !process.env.RESEND_API_KEY || !isRedisConfigured()) {
    return NextResponse.json({ error: 'Password reset is not configured yet.' }, { status: 500 });
  }

  const ip = getClientIp(req);
  const withinLimit = await checkRateLimit(`ratelimit:forgot:${ip}`, 3, 60 * 60);
  if (!withinLimit) {
    return NextResponse.json({ error: 'Too many requests. Try again in an hour.' }, { status: 429 });
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await setOtp(code);

  try {
    await sendOtpEmail(code);
  } catch {
    return NextResponse.json({ error: 'Could not send the reset email. Try again shortly.' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
