'use client';

import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { useRef } from 'react';
import { useUniverseStore } from '@/lib/store';
import { activeChapterId, TOTAL_PAGES } from '@/lib/chapters';

/** Bridges R3F's per-frame scroll offset into the DOM-facing zustand store. */
export default function ScrollBridge() {
  const scroll = useScroll();
  const lastChapter = useRef('beginning');
  const frameCount = useRef(0);

  useFrame(() => {
    frameCount.current += 1;
    const offset = scroll.offset;
    if (frameCount.current % 3 === 0) {
      useUniverseStore.setState({ scrollOffset: offset });
    }
    const chapter = activeChapterId(offset);
    if (chapter !== lastChapter.current) {
      lastChapter.current = chapter;
      useUniverseStore.getState().setActiveChapter(chapter);
    }

    const request = useUniverseStore.getState().scrollRequest;
    if (request !== null) {
      const el = scroll.el;
      const target = (request / TOTAL_PAGES) * (el.scrollHeight - el.clientHeight);
      el.scrollTo({ top: target, behavior: 'smooth' });
      useUniverseStore.getState().clearScrollRequest();
    }
  });

  return null;
}
