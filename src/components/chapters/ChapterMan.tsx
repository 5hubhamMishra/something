'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import ParticleField from '@/components/canvas/ParticleField';
import Reveal from '@/components/ui/Reveal';
import WordReveal from '@/components/ui/WordReveal';
import { siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';

const chapter = chapterById('man');
const ORBIT_COUNT = 10;
const ORBIT_RADIUS = 2.1;

function SymbolicForm() {
  const form = useRef<Group>(null);
  const ring = useRef<Group>(null);

  const orbitPoints = useMemo(
    () =>
      Array.from({ length: ORBIT_COUNT }, (_, i) => {
        const angle = (i / ORBIT_COUNT) * Math.PI * 2;
        return [
          Math.cos(angle) * ORBIT_RADIUS,
          Math.sin(angle * 0.6) * 0.5,
          Math.sin(angle) * ORBIT_RADIUS,
        ] as [number, number, number];
      }),
    []
  );

  useFrame((_, delta) => {
    if (form.current) form.current.rotation.y += delta * 0.08;
    if (ring.current) ring.current.rotation.y -= delta * 0.15;
  });

  return (
    <group>
      <group ref={form}>
        <mesh>
          <icosahedronGeometry args={[1.4, 1]} />
          <meshBasicMaterial wireframe color="#c9a15f" />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color="#f4f1ea"
            emissive="#c9a15f"
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
      </group>
      <group ref={ring}>
        {orbitPoints.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial
              color="#c9a15f"
              emissive="#c9a15f"
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function ManScene() {
  const wz = chapter.worldZ;
  return (
    <group position={[0, 0, wz]}>
      <SymbolicForm />
      <ParticleField count={500} radius={7} color="#8a6a3e" opacity={0.4} />
    </group>
  );
}

export function ManDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col justify-center px-8 md:px-24 max-w-4xl"
    >
      <Reveal>
        <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Three</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 text-warm-white">The Man</h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-silver leading-relaxed text-base md:text-lg max-w-xl mb-12">
          Beyond the roles he plays — father, provider, guide — there is a man made of the same
          few qualities, again and again.
        </p>
      </Reveal>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
        {siteConfig.father.traits.map((trait, i) => (
          <Reveal key={`${trait.word}-${i}`} delay={0.05 * i}>
            <WordReveal word={trait.word} detail={trait.story} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
