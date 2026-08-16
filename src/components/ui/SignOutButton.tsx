'use client';

import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleSignOut}
      aria-label="Sign out"
      className="fixed bottom-6 left-6 z-30 text-[10px] tracking-[0.3em] uppercase text-silver/70 transition-colors duration-300 hover:text-gold cursor-pointer"
    >
      Sign Out
    </button>
  );
}
