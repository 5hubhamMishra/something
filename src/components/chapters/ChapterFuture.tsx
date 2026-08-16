'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh, MeshStandardMaterial } from 'three';
import ParticleField from '@/components/canvas/ParticleField';
import Reveal from '@/components/ui/Reveal';
import { hasContent, siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';

const chapter = chapterById('future');
const wz = chapter.worldZ;
const filledDreams = siteConfig.futureDreams.filter((d) => hasContent(d.title));

function PortalRing({
  position,
  color,
  speed,
  phase,
}: {
  position: [number, number, number];
  color: string;
  speed: number;
  phase: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z += delta * speed * 0.4;
    const mat = ref.current.material as MeshStandardMaterial;
    mat.emissiveIntensity = 1.3 + Math.sin(state.clock.elapsedTime * speed + phase) * 0.7;
  });

  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.9, 0.05, 16, 48]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.3}
        toneMapped={false}
      />
    </mesh>
  );
}

export function FutureScene() {
  const dreams = filledDreams.slice(0, 4);
  const count = dreams.length;

  return (
    <group position={[0, 0, wz]}>
      <ParticleField count={300} radius={10} color="#f4f1ea" opacity={0.4} speed={0.015} />
      {dreams.map((dream, i) => {
        const t = count > 1 ? i / (count - 1) : 0.5;
        const x = -3.5 + t * 7;
        const y = Math.sin(i * 1.7) * 0.5;
        const z = -1 - t * 4;
        return (
          <PortalRing
            key={`${dream.title}-${i}`}
            position={[x, y, z]}
            color={i % 2 === 0 ? '#c9a15f' : '#f4f1ea'}
            speed={0.5 + i * 0.15}
            phase={i * 1.3}
          />
        );
      })}
    </group>
  );
}

export function FutureDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col justify-center px-8 md:px-24 max-w-3xl"
    >
      <Reveal>
        <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Ten</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 text-warm-white">
          The Future
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="font-display italic text-lg md:text-2xl text-warm-white/90 leading-relaxed max-w-xl mb-10">
          There are still chapters left to write.
        </p>
      </Reveal>

      {filledDreams.length > 0 ? (
        <Reveal delay={0.3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-xl">
            {filledDreams.map((dream, i) => (
              <div
                key={`${dream.title}-${i}`}
                className="rounded-lg border border-gold/20 bg-charcoal/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gold/50 hover:shadow-[0_0_30px_-10px_rgba(201,161,95,0.35)]"
              >
                <h3 className="font-display text-lg md:text-xl text-gold mb-2">{dream.title}</h3>
                {hasContent(dream.description) ? (
                  <p className="text-silver/80 text-sm leading-relaxed">{dream.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Reveal>
      ) : null}
    </section>
  );
}
