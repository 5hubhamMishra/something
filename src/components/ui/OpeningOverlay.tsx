'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { introState } from '@/lib/introTween';
import { useUniverseStore } from '@/lib/store';
import { siteConfig } from '@/lib/config';

export default function OpeningOverlay() {
  const hasEntered = useUniverseStore((s) => s.hasEntered);
  const introComplete = useUniverseStore((s) => s.introComplete);
  const enter = useUniverseStore((s) => s.enter);
  const completeIntro = useUniverseStore((s) => s.completeIntro);

  const [visible, setVisible] = useState(true);

  const overlayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLParagraphElement>(null);
  const line2Ref = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!hasEntered || startedRef.current) return;
    startedRef.current = true;

    const tl = gsap.timeline({
      onComplete: () => {
        completeIntro();
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 1.2,
          onComplete: () => setVisible(false),
        });
      },
    });

    tl.to(introState, { glow: 1, duration: 1.6, ease: 'power1.out' })
      .fromTo(line1Ref.current, { opacity: 0 }, { opacity: 1, duration: 1.1 }, '<')
      .to({}, { duration: 1.2 })
      .to(line1Ref.current, { opacity: 0, duration: 0.8 })
      .to(introState, { field: 1, duration: 2, ease: 'power2.out' }, '<')
      .fromTo(line2Ref.current, { opacity: 0 }, { opacity: 1, duration: 1.1 }, '<+0.4')
      .to({}, { duration: 1.2 })
      .to(line2Ref.current, { opacity: 0, duration: 0.8 })
      .to(introState, { morph: 1, duration: 2.4, ease: 'power3.inOut' }, '<')
      .fromTo(
        nameRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' },
        '<+0.6'
      )
      .fromTo(taglineRef.current, { opacity: 0 }, { opacity: 1, duration: 1 }, '<+0.5')
      .to({}, { duration: 1.6 })
      .to([nameRef.current, taglineRef.current], { opacity: 0, duration: 0.9 })
      .to(introState, { cameraPush: 1, duration: 2.6, ease: 'power2.in' }, '<');

    return () => {
      tl.kill();
    };
  }, [hasEntered, completeIntro]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-void select-none"
    >
      {!hasEntered ? (
        <button
          onClick={enter}
          className="group flex flex-col items-center gap-6 px-8 py-6 text-warm-white cursor-pointer"
        >
          <span className="text-[10px] tracking-[0.45em] text-silver/70 uppercase">
            A Story Begins
          </span>
          <span className="font-display italic text-2xl md:text-3xl text-warm-white/90">
            The Universe of {siteConfig.father.displayName}
          </span>
          <span className="mt-4 text-xs tracking-[0.3em] uppercase text-gold border border-gold/40 rounded-full px-6 py-3 group-hover:bg-gold/10 transition-colors duration-500">
            Enter
          </span>
        </button>
      ) : (
        !introComplete && (
          <div className="relative w-full h-40 md:h-48 flex items-center justify-center px-6">
            <p
              ref={line1Ref}
              className="absolute inset-x-0 text-center whitespace-normal md:whitespace-nowrap font-display italic text-xl md:text-3xl text-warm-white/90 opacity-0"
            >
              Every family has a story.
            </p>
            <p
              ref={line2Ref}
              className="absolute inset-x-0 text-center whitespace-normal md:whitespace-nowrap font-display italic text-xl md:text-3xl text-warm-white/90 opacity-0"
            >
              And every story begins with someone.
            </p>
            <h1
              ref={nameRef}
              className="absolute inset-x-0 text-center whitespace-normal md:whitespace-nowrap font-display text-4xl md:text-7xl tracking-wide text-gold opacity-0"
            >
              {siteConfig.father.displayName}
            </h1>
            <p
              ref={taglineRef}
              className="absolute inset-x-0 top-full mt-6 text-center whitespace-nowrap text-xs md:text-sm tracking-[0.4em] uppercase text-silver opacity-0"
            >
              {siteConfig.father.tagline}
            </p>
          </div>
        )
      )}
    </div>
  );
}
