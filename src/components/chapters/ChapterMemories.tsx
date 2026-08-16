'use client';

import FloatingPhoto from '@/components/canvas/FloatingPhoto';
import ParticleField from '@/components/canvas/ParticleField';
import Reveal from '@/components/ui/Reveal';
import { hasContent, siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';

const chapter = chapterById('memories');

const memoryLayout = siteConfig.memories.map((memory, i) => {
  const t = i / Math.max(1, siteConfig.memories.length - 1);
  const side = i % 2 === 0 ? 1 : -1;
  const position: [number, number, number] = [
    side * (1.6 + (i % 3) * 1.1),
    Math.sin(i * 1.9) * 1.2,
    -t * 9,
  ];
  const rotation: [number, number, number] = [0, -side * 0.22, 0];
  return { memory, position, rotation };
});

export function MemoriesScene() {
  const wz = chapter.worldZ;
  return (
    <group position={[0, 0, wz]}>
      <ParticleField count={350} radius={7} />
      {memoryLayout.map(({ memory, position, rotation }) => (
        <FloatingPhoto
          key={memory.id}
          image={memory.image}
          label={memory.title}
          sublabel={memory.date ?? ''}
          position={position}
          rotation={rotation}
          width={1.5}
          height={1.85}
        />
      ))}
    </group>
  );
}

export function MemoriesDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col justify-center px-8 md:px-24"
    >
      <div className="max-w-3xl">
        <Reveal>
          <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Five</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl md:text-6xl mt-4 mb-8 text-warm-white">
            The Memory Archive
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-silver leading-relaxed text-base md:text-lg max-w-xl">
            Step into a museum built from moments.
          </p>
        </Reveal>
      </div>

      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {siteConfig.memories.map((memory, i) => (
          <Reveal key={memory.id} delay={0.25 + i * 0.05}>
            <div className="rounded-lg border border-bronze/25 bg-charcoal/50 p-4 h-full">
              <span className="text-[10px] tracking-[0.3em] text-gold/80 uppercase">
                {memory.date ?? ''}
              </span>
              <h3 className="font-display text-lg mt-1 mb-2 text-warm-white">{memory.title}</h3>
              {hasContent(memory.description) ? (
                <p className="text-silver/70 text-sm leading-relaxed">{memory.description}</p>
              ) : null}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
