'use client';

import { Line } from '@react-three/drei';
import FloatingPhoto from '@/components/canvas/FloatingPhoto';
import ParticleField from '@/components/canvas/ParticleField';
import Reveal from '@/components/ui/Reveal';
import { hasContent, siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';

const chapter = chapterById('journey');

export function JourneyScene() {
  const wz = chapter.worldZ;
  const pathStart: [number, number, number] = [0, -1.2, wz + 2];
  const pathEnd: [number, number, number] = [0, -1.2, wz - 13];
  const entries = siteConfig.timeline;
  const span = 15; // wz + 2 down to wz - 13

  return (
    <group>
      <Line
        points={[pathStart, pathEnd]}
        color="#c9a15f"
        lineWidth={1.4}
        transparent
        opacity={0.5}
      />
      <ParticleField count={300} radius={10} color="#c9a15f" opacity={0.4} />
      {entries.map((entry, i) => {
        const t = entries.length > 1 ? i / (entries.length - 1) : 0;
        const z = wz + 2 - t * span;
        const side = i % 2 === 0 ? 1 : -1;
        const x = side * (1.6 + (i % 3) * 0.2);
        const y = -0.6 + Math.sin(i * 1.3) * 0.5;
        return (
          <FloatingPhoto
            key={`${entry.year}-${entry.title}-${i}`}
            image={entry.image ?? ''}
            label={entry.title}
            sublabel={entry.year}
            position={[x, y, z]}
            rotation={[0, side * -0.25, 0]}
            width={1.4}
            height={1.7}
          />
        );
      })}
    </group>
  );
}

export function JourneyDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col px-8 md:px-24 max-w-3xl py-[20vh] gap-[16vh]"
    >
      <div>
        <Reveal>
          <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Two</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 text-warm-white">
            The Journey
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-silver leading-relaxed text-base md:text-lg max-w-xl">
            A path stretching across years — each step a place he stood, a choice he made, a
            reason we&apos;re here.
          </p>
        </Reveal>
      </div>

      {siteConfig.timeline.map((entry, i) => (
        <Reveal key={`${entry.year}-${entry.title}-${i}`}>
          <div className="max-w-xl">
            <span className="text-[11px] tracking-[0.4em] text-gold uppercase">{entry.year}</span>
            <h3 className="font-display text-2xl md:text-4xl mt-3 mb-4 text-warm-white">
              {entry.title}
            </h3>
            {hasContent(entry.description) ? (
              <p className="text-silver/90 leading-relaxed text-sm md:text-base">
                {entry.description}
              </p>
            ) : null}
          </div>
        </Reveal>
      ))}
    </section>
  );
}
