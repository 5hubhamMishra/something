'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function WordReveal({
  word,
  detail,
  quote,
}: {
  word: string;
  detail: string;
  quote?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-warm-white/10 py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className="w-full flex items-center justify-between text-left cursor-pointer group"
      >
        <span className="font-display text-2xl md:text-3xl text-warm-white group-hover:text-gold transition-colors duration-300">
          {word}
        </span>
        <span className="text-gold text-sm">{open ? '—' : '+'}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1 max-w-lg">
              {quote ? (
                <p className="font-display italic text-gold/90 mb-2">&ldquo;{quote}&rdquo;</p>
              ) : null}
              <p className="text-silver leading-relaxed text-sm md:text-base">{detail}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
