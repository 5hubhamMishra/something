import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendOtpEmail(code: string): Promise<void> {
  const to = process.env.OWNER_EMAIL;
  if (!to) throw new Error('OWNER_EMAIL is not set');

  const { error } = await getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    to,
    subject: 'Your password reset code',
    html: `
      <p>Someone requested a password reset for your site.</p>
      <p style="font-size: 28px; letter-spacing: 6px; font-weight: 600;">${code}</p>
      <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
    `,
  });

  // The SDK returns { error } instead of throwing on API-level failures (bad domain, restricted recipient, etc).
  if (error) {
    throw new Error(`Resend API error: ${error.name} — ${error.message}`);
  }
}
