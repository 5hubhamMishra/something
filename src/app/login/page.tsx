'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Mode = 'login' | 'forgot-request' | 'forgot-reset';

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/';

  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function resetMessages() {
    setError(null);
    setNotice(null);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      await postJson('/api/auth/login', { username, password });
      router.replace(from);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestCode(e: FormEvent) {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      await postJson('/api/auth/forgot-password', {});
      setNotice('If the site is configured, a code has been emailed to you. It expires in 10 minutes.');
      setMode('forgot-reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    resetMessages();
    setBusy(true);
    try {
      await postJson('/api/auth/reset-password', { code, newPassword });
      setNotice('Password updated. You can log in now.');
      setMode('login');
      setPassword('');
      setCode('');
      setNewPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-void px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p className="text-[10px] tracking-[0.4em] uppercase text-silver/60">Private</p>
          <h1 className="font-display mt-2 text-2xl text-warm-white">The Universe of Dad</h1>
        </div>

        <div className="rounded-lg border border-graphite bg-charcoal/60 p-8 shadow-2xl backdrop-blur-sm">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <Field label="Username">
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputClass}
                  autoComplete="username"
                  required
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                  autoComplete="current-password"
                  required
                />
              </Field>

              <Messages error={error} notice={notice} />

              <button type="submit" disabled={busy} className={buttonClass}>
                {busy ? 'Signing in…' : 'Enter'}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setMode('forgot-request');
                }}
                className="block w-full text-center text-[11px] tracking-[0.2em] uppercase text-silver/60 transition-colors hover:text-gold"
              >
                Forgot password?
              </button>
            </form>
          )}

          {mode === 'forgot-request' && (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <p className="text-sm text-silver/80">
                We&apos;ll email a one-time code to the address configured for this site.
              </p>

              <Messages error={error} notice={notice} />

              <button type="submit" disabled={busy} className={buttonClass}>
                {busy ? 'Sending…' : 'Send code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setMode('login');
                }}
                className="block w-full text-center text-[11px] tracking-[0.2em] uppercase text-silver/60 transition-colors hover:text-gold"
              >
                Back to login
              </button>
            </form>
          )}

          {mode === 'forgot-reset' && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <Field label="6-digit code">
                <input
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={inputClass}
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                />
              </Field>
              <Field label="New password">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </Field>

              <Messages error={error} notice={notice} />

              <button type="submit" disabled={busy} className={buttonClass}>
                {busy ? 'Updating…' : 'Set new password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setMode('login');
                }}
                className="block w-full text-center text-[11px] tracking-[0.2em] uppercase text-silver/60 transition-colors hover:text-gold"
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-md border border-graphite bg-void px-3 py-2 text-sm text-warm-white outline-none transition-colors focus:border-gold';

const buttonClass =
  'w-full rounded-md bg-gold py-2 text-sm font-medium tracking-wide text-void transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] tracking-[0.2em] uppercase text-silver/60">{label}</span>
      {children}
    </label>
  );
}

function Messages({ error, notice }: { error: string | null; notice: string | null }) {
  if (!error && !notice) return null;
  return (
    <p className={`text-xs ${error ? 'text-red-400' : 'text-gold'}`} role="status">
      {error || notice}
    </p>
  );
}
