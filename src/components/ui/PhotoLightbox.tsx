'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useUniverseStore } from '@/lib/store';

export default function PhotoLightbox() {
  const photo = useUniverseStore((s) => s.lightboxPhoto);
  const closeLightbox = useUniverseStore((s) => s.closeLightbox);

  useEffect(() => {
    if (!photo) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeLightbox();
    }
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [photo, closeLightbox]);

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-void/95 backdrop-blur-sm px-6 py-10"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={photo.label}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close photo"
            className="fixed top-5 right-5 z-[61] flex h-11 w-11 items-center justify-center rounded-full border border-warm-white/25 text-warm-white/80 transition-colors hover:border-gold hover:text-gold cursor-pointer"
          >
            <span className="text-lg leading-none">&times;</span>
          </button>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[92vw] h-[70vh] md:w-[80vw] md:h-[78vh]"
          >
            <Image
              src={photo.image}
              alt={photo.label}
              fill
              sizes="92vw"
              quality={90}
              className="object-contain"
              unoptimized
            />
          </motion.div>

          <div className="mt-6 text-center max-w-lg">
            <p className="font-display text-lg md:text-xl text-warm-white">{photo.label}</p>
            {photo.sublabel ? (
              <p className="mt-1 text-[11px] tracking-[0.3em] uppercase text-gold/80">
                {photo.sublabel}
              </p>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
