'use client';

import { NAV_CHAPTERS } from '@/lib/chapters';
import { useUniverseStore } from '@/lib/store';

export default function ChapterNav() {
  const introComplete = useUniverseStore((s) => s.introComplete);
  const activeChapter = useUniverseStore((s) => s.activeChapter);
  const requestScrollTo = useUniverseStore((s) => s.requestScrollTo);

  if (!introComplete) return null;

  return (
    <nav className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-end gap-3">
      {NAV_CHAPTERS.map((c) => {
        const active = c.id === activeChapter;
        return (
          <button
            key={c.id}
            onClick={() => requestScrollTo(c.start)}
            className="group flex items-center gap-3 cursor-pointer"
          >
            <span
              className={`text-[10px] tracking-[0.3em] uppercase transition-all duration-500 ${
                active ? 'text-gold opacity-100' : 'text-silver/50 opacity-0 group-hover:opacity-100'
              }`}
            >
              {c.navLabel}
            </span>
            <span
              className={`h-[3px] rounded-full transition-all duration-500 ${
                active ? 'w-7 bg-gold' : 'w-3 bg-silver/40 group-hover:bg-silver/70'
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
}
