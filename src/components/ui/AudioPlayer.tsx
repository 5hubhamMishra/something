'use client';

import { useEffect, useRef } from 'react';
import { useUniverseStore } from '@/lib/store';
import { siteConfig } from '@/lib/config';
import { activeChapterId } from '@/lib/chapters';

const AMBIENT_BY_CHAPTER: Record<string, string | undefined> = {
  beginning: siteConfig.audio.ambientOpening,
  journey: siteConfig.audio.ambientJourney,
  man: siteConfig.audio.ambientJourney,
  family: siteConfig.audio.ambientFamily,
  memories: siteConfig.audio.ambientMemories,
  funside: siteConfig.audio.ambientMemories,
  lessons: siteConfig.audio.ambientLegacy,
  years: siteConfig.audio.ambientLegacy,
  legacy: siteConfig.audio.ambientLegacy,
  future: siteConfig.audio.ambientFinal,
  finale: siteConfig.audio.ambientFinal,
};

/** Fades a single ambient bed between chapter-appropriate tracks. Silently no-ops if no src is configured. */
export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSrc = useRef<string | undefined>(undefined);
  const audioEnabled = useUniverseStore((s) => s.audioEnabled);
  const introComplete = useUniverseStore((s) => s.introComplete);
  const scrollOffset = useUniverseStore((s) => s.scrollOffset);
  const toggleAudio = useUniverseStore((s) => s.toggleAudio);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = 0;
    }
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioEnabled || !introComplete) return;

    const chapter = activeChapterId(scrollOffset);
    const src = AMBIENT_BY_CHAPTER[chapter];
    if (!src) return;

    if (currentSrc.current !== src) {
      currentSrc.current = src;
      el.src = src;
      el.play().catch(() => {
        /* autoplay blocked; user can retry via the toggle */
      });
      el.volume = 0;
      const fade = setInterval(() => {
        if (el.volume < 0.45) el.volume = Math.min(0.45, el.volume + 0.03);
        else clearInterval(fade);
      }, 120);
      return () => clearInterval(fade);
    }
  }, [audioEnabled, introComplete, scrollOffset]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!audioEnabled) {
      const fade = setInterval(() => {
        if (el.volume > 0.02) el.volume = Math.max(0, el.volume - 0.03);
        else {
          el.pause();
          clearInterval(fade);
        }
      }, 100);
      return () => clearInterval(fade);
    }
  }, [audioEnabled]);

  if (!introComplete) return null;

  return (
    <button
      onClick={toggleAudio}
      aria-label={audioEnabled ? 'Mute ambient score' : 'Play ambient score'}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-silver/70 hover:text-gold transition-colors duration-300 cursor-pointer"
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          audioEnabled ? 'bg-gold animate-gentle-pulse' : 'bg-silver/40'
        }`}
      />
      {audioEnabled ? 'Sound On' : 'Sound Off'}
    </button>
  );
}
