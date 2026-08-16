'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import Reveal from '@/components/ui/Reveal';
import { siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';

const chapter = chapterById('years');

const TICK_COUNT = 60;
const RING_RADIUS = 2.2;

interface Tick {
  x: number;
  y: number;
  rotationZ: number;
  isMajor: boolean;
}

export function YearsScene() {
  const wz = chapter.worldZ;
  const ringGroupRef = useRef<Group>(null);
  const hourHandRef = useRef<Group>(null);
  const minuteHandRef = useRef<Group>(null);

  const ticks = useMemo(() => {
    const arr: Tick[] = [];
    for (let i = 0; i < TICK_COUNT; i++) {
      const angle = (i / TICK_COUNT) * Math.PI * 2;
      arr.push({
        x: Math.cos(angle) * RING_RADIUS,
        y: Math.sin(angle) * RING_RADIUS,
        rotationZ: angle - Math.PI / 2,
        isMajor: i % 5 === 0,
      });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ringGroupRef.current) {
      ringGroupRef.current.rotation.z += delta * 0.02;
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z -= delta * 0.15;
    }
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z -= delta * 0.04;
    }
  });

  return (
    <group position={[0, 0, wz]}>
      <group ref={ringGroupRef}>
        {ticks.map((tick, i) => (
          <mesh key={i} position={[tick.x, tick.y, 0]} rotation={[0, 0, tick.rotationZ]}>
            <boxGeometry args={tick.isMajor ? [0.03, 0.22, 0.03] : [0.02, 0.14, 0.02]} />
            <meshStandardMaterial
              color={tick.isMajor ? '#c9a15f' : '#9aa0a6'}
              emissive={tick.isMajor ? '#c9a15f' : '#000000'}
              emissiveIntensity={tick.isMajor ? 1.2 : 0}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <group ref={hourHandRef}>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.04, 0.9, 0.04]} />
          <meshStandardMaterial
            color="#c9a15f"
            emissive="#c9a15f"
            emissiveIntensity={0.8}
            toneMapped={false}
          />
        </mesh>
      </group>
      <group ref={minuteHandRef}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.04, 1.4, 0.04]} />
          <meshStandardMaterial
            color="#f4f1ea"
            emissive="#f4f1ea"
            emissiveIntensity={0.5}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

export function YearsDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col justify-center px-8 md:px-24 max-w-3xl"
    >
      <Reveal>
        <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Eight</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 text-warm-white">The Years</h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-silver leading-relaxed text-base md:text-lg max-w-xl">
          Time changes everything.
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        <p className="mt-2 text-silver/80 leading-relaxed max-w-xl">
          Except the moments that become memories.
        </p>
      </Reveal>

      <Reveal delay={0.4} className="mt-10 flex flex-col gap-6 max-w-xl">
        <div className="flex flex-col gap-6">
          {siteConfig.achievements.map((entry, i) => (
            <div key={`${entry.year}-${entry.title}-${i}`}>
              <span className="text-[11px] tracking-[0.4em] text-gold uppercase">
                {entry.year}
              </span>
              <h3 className="font-display text-xl md:text-2xl mt-2 mb-2 text-warm-white">
                {entry.title}
              </h3>
              <p className="text-silver/90 leading-relaxed text-sm md:text-base">
                {entry.description}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
