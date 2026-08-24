'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV_CHAPTERS } from '@/lib/chapters';
import { useUniverseStore } from '@/lib/store';

export default function MobileChapterNav() {
  const introComplete = useUniverseStore((s) => s.introComplete);
  const activeChapter = useUniverseStore((s) => s.activeChapter);
  const requestScrollTo = useUniverseStore((s) => s.requestScrollTo);
  const [open, setOpen] = useState(false);

  if (!introComplete) return null;

  const index = Math.max(0, NAV_CHAPTERS.findIndex((c) => c.id === activeChapter));
  const total = NAV_CHAPTERS.length;
  const progressPct = ((index + 1) / total) * 100;

  return (
    <div className="fixed bottom-20 inset-x-0 z-30 flex justify-center md:hidden">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-4 bottom-36 max-h-[55vh] overflow-y-auto rounded-lg border border-bronze/30 bg-charcoal/95 backdrop-blur-sm p-2"
          >
            {NAV_CHAPTERS.map((c) => {
              const active = c.id === activeChapter;
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => {
                    requestScrollTo(c.start);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-4 py-3 text-left transition-colors cursor-pointer ${
                    active ? 'bg-gold/10 text-gold' : 'text-silver/80'
                  }`}
                >
                  <span className="text-xs tracking-[0.2em] uppercase">{c.navLabel}</span>
                  {active ? <span className="h-2 w-2 rounded-full bg-gold" /> : null}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Chapter navigation"
        className="flex items-center gap-3 rounded-full border border-bronze/40 bg-charcoal/80 backdrop-blur-sm px-5 py-3 cursor-pointer"
        style={{ minHeight: 44 }}
      >
        <span className="text-[11px] tracking-[0.2em] text-warm-white">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <span className="relative h-1 w-16 overflow-hidden rounded-full bg-warm-white/15">
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-gold transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </span>
      </button>
    </div>
  );
}
