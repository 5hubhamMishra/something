'use client';

import ConstellationGraph, { type ConstellationNode } from '@/components/canvas/ConstellationGraph';
import ParticleField from '@/components/canvas/ParticleField';
import Reveal from '@/components/ui/Reveal';
import { siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';
import { useUniverseStore } from '@/lib/store';

const chapter = chapterById('family');

export function FamilyScene() {
  const wz = chapter.worldZ;
  const selectedId = useUniverseStore((s) => s.selectedFamilyId);

  const nodes: ConstellationNode[] = siteConfig.family.map((m) => ({
    id: m.id,
    position: [m.x, m.y, m.z],
    label: m.name,
    sublabel: m.relation,
    image: m.image,
  }));

  return (
    <group position={[0, 0, wz]}>
      <ParticleField count={300} radius={6} />
      <ConstellationGraph
        nodes={nodes}
        centerLabel={siteConfig.father.displayName}
        centerImage="/images/portrait-casual.jpg"
        selectedId={selectedId}
        onSelect={(id) => useUniverseStore.getState().setSelectedFamily(id)}
      />
    </group>
  );
}

export function FamilyDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  const selectedId = useUniverseStore((s) => s.selectedFamilyId);
  const selected = siteConfig.family.find((m) => m.id === selectedId) ?? null;

  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col justify-center px-8 md:px-24 max-w-3xl"
    >
      <Reveal>
        <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Four</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display text-4xl md:text-6xl mt-4 mb-8 text-warm-white">
          The Family
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-silver leading-relaxed text-base md:text-lg max-w-xl">
          One person can become the center of an entire universe — his parents above him,
          his wife beside him, his son carrying him forward.
        </p>
      </Reveal>

      <Reveal delay={0.3}>
        <div className="mt-10 min-h-[9rem] rounded-lg border border-bronze/30 bg-charcoal/60 p-6 max-w-xl backdrop-blur-sm">
          {selected ? (
            <div key={selected.id}>
              <span className="text-[11px] tracking-[0.4em] text-gold uppercase">
                {selected.relation}
              </span>
              <h3 className="font-display text-2xl md:text-3xl mt-2 mb-3 text-warm-white">
                {selected.name}
              </h3>
              <p className="text-silver/90 leading-relaxed">{selected.message}</p>
            </div>
          ) : (
            <p className="text-silver/60 italic">
              Click a face in the family tree to learn more about them.
            </p>
          )}
        </div>
      </Reveal>

      <Reveal delay={0.4}>
        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-1 text-xs text-silver/50 max-w-xl">
          {siteConfig.family.map((m) => (
            <li key={m.id}>
              {m.name} <span className="text-silver/30">— {m.relation}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
