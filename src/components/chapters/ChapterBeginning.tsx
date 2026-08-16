'use client';

import FloatingPhoto from '@/components/canvas/FloatingPhoto';
import Reveal from '@/components/ui/Reveal';
import { siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';

const chapter = chapterById('beginning');

export function BeginningScene() {
  const wz = chapter.worldZ;
  return (
    <group position={[0, 0, wz]}>
      <FloatingPhoto
        image="/images/portrait-casual.jpg"
        label={siteConfig.father.displayName}
        sublabel={siteConfig.father.birthplace}
        position={[-0.4, 0.3, -2]}
        rotation={[0, 0.25, 0]}
      />
      <FloatingPhoto
        image="/images/home-porch.jpg"
        label="Home"
        sublabel="Janakpur"
        position={[2.7, -0.5, -4.5]}
        rotation={[0, -0.3, 0]}
        width={1.3}
        height={1.6}
      />
      <FloatingPhoto
        image="/images/janaki-mandir.jpg"
        label="Family"
        sublabel="Janakpur"
        position={[1.1, 1.5, -7]}
        rotation={[0, 0.1, 0]}
        width={1.5}
        height={1.9}
      />
    </group>
  );
}

export function BeginningDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col justify-center px-8 md:px-24 max-w-3xl"
    >
      <Reveal>
        <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter One</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display text-4xl md:text-6xl mt-4 mb-8 text-warm-white">
          Before We Knew Him<br />As Dad
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-silver leading-relaxed text-base md:text-lg max-w-xl">
          Born in <span className="text-warm-white">{siteConfig.father.birthplace}</span>, long
          before the world knew him as a father, he was simply a boy with a family, a home, and a
          future he hadn&apos;t yet imagined.
        </p>
      </Reveal>
    </section>
  );
}
