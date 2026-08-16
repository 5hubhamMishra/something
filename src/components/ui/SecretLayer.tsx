'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useUniverseStore } from '@/lib/store';
import { hasContent, siteConfig } from '@/lib/config';

export function SecretHotspot() {
  const activeChapter = useUniverseStore((s) => s.activeChapter);
  const introComplete = useUniverseStore((s) => s.introComplete);
  const discovered = useUniverseStore((s) => s.discovered);
  const discoverSecret = useUniverseStore((s) => s.discoverSecret);
  const openSecret = useUniverseStore((s) => s.openSecret);

  if (!introComplete) return null;

  const secret = siteConfig.hiddenMemories.find(
    (m) => m.chapter === activeChapter && hasContent(m.title) && hasContent(m.content)
  );
  if (!secret) return null;

  const found = !!discovered[secret.id];

  return (
    <button
      onClick={() => {
        discoverSecret(secret.id);
        openSecret(secret.id);
      }}
      aria-label="A hidden memory"
      className="fixed bottom-8 left-6 z-30 flex items-center gap-2 cursor-pointer group"
    >
      <span
        className={`inline-block w-[6px] h-[6px] rounded-full transition-opacity duration-700 ${
          found ? 'bg-silver/50' : 'bg-gold animate-gentle-pulse'
        }`}
      />
      <span className="text-[9px] tracking-[0.35em] uppercase text-silver/0 group-hover:text-silver/60 transition-colors duration-500">
        {found ? 'revisit' : 'a hidden memory'}
      </span>
    </button>
  );
}

export function SecretModal() {
  const activeSecret = useUniverseStore((s) => s.activeSecret);
  const openSecret = useUniverseStore((s) => s.openSecret);
  const secret = siteConfig.hiddenMemories.find((m) => m.id === activeSecret);

  return (
    <AnimatePresence>
      {secret && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-sm px-6"
          onClick={() => openSecret(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full border border-gold/30 bg-charcoal/90 rounded-lg p-8 text-center"
          >
            <span className="text-[10px] tracking-[0.4em] text-gold uppercase">
              A Hidden Memory
            </span>
            <h3 className="font-display text-2xl md:text-3xl text-warm-white mt-4 mb-4">
              {secret.title}
            </h3>
            <p className="text-silver leading-relaxed text-sm md:text-base">{secret.content}</p>
            <button
              onClick={() => openSecret(null)}
              className="mt-8 text-xs tracking-[0.3em] uppercase text-gold border border-gold/40 rounded-full px-6 py-3 hover:bg-gold/10 transition-colors duration-500 cursor-pointer"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
