'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import type { Mesh } from 'three';
import Reveal from '@/components/ui/Reveal';
import { hasContent, siteConfig } from '@/lib/config';
import { chapterById } from '@/lib/chapters';

const chapter = chapterById('funside');

function DriftingOrb({
  position,
  color,
  radius = 0.16,
  speed = 0.6,
}: {
  position: [number, number, number];
  color: string;
  radius?: number;
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);
  const base = position[1];

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = base + Math.sin(clock.elapsedTime * speed) * 0.3;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 24, 24]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.8}
        toneMapped={false}
      />
    </mesh>
  );
}

export function FunSideScene() {
  const wz = chapter.worldZ;
  return (
    <group position={[0, 0, wz]}>
      <Sparkles count={120} scale={5} size={3} speed={0.4} color="#c9a15f" />
      <DriftingOrb position={[-1.8, 0.6, -1.5]} color="#c9a15f" speed={0.5} />
      <DriftingOrb position={[2, -0.4, -3]} color="#e8e2d0" radius={0.1} speed={0.8} />
    </group>
  );
}

export function FunSideDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  const entries = siteConfig.funSide.console.filter((entry) => hasContent(entry.content));
  const [active, setActive] = useState(0);
  const current = entries[active] ?? entries[0];

  const favorites = [
    { label: 'Favorite Food', value: siteConfig.funSide.favoriteFood },
    { label: 'Favorite Movie', value: siteConfig.funSide.favoriteMovie },
    { label: 'Favorite Song', value: siteConfig.funSide.favoriteSong },
  ].filter((f) => hasContent(f.value));

  const lines = [...siteConfig.funSide.favoritePhrases, ...siteConfig.funSide.insideJokes].filter(
    hasContent
  );

  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col justify-center px-8 md:px-24 max-w-3xl"
    >
      <Reveal>
        <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Six</span>
      </Reveal>
      <Reveal delay={0.1}>
        <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 text-warm-white">
          The Side Of Dad<br />We Know
        </h2>
      </Reveal>
      <Reveal delay={0.2}>
        <p className="text-silver leading-relaxed text-base md:text-lg max-w-xl mb-10">
          Underneath the lessons and the legacy, there&apos;s a man who tells the same jokes on
          repeat and still finds them funny every time.
          {entries.length > 0 ? ' Press a button.' : ''}
        </p>
      </Reveal>

      {entries.length > 0 ? (
        <>
          <Reveal delay={0.3}>
            <div className="flex flex-wrap gap-2 max-w-xl">
              {entries.map((entry, i) => (
                <button
                  key={`${entry.category}-${i}`}
                  onClick={() => setActive(i)}
                  className={`px-4 py-2 rounded-full text-[11px] tracking-[0.15em] uppercase border transition-colors duration-300 cursor-pointer ${
                    active === i
                      ? 'border-gold text-gold bg-gold/10'
                      : 'border-warm-white/15 text-silver/70 hover:border-gold/50 hover:text-gold'
                  }`}
                >
                  {entry.category}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.35}>
            <div className="mt-6 min-h-[8rem] max-w-xl rounded-lg border border-gold/30 bg-charcoal/70 p-6 backdrop-blur-sm shadow-[0_0_30px_-10px_rgba(201,161,95,0.35)]">
              <span className="text-[10px] tracking-[0.4em] text-bronze uppercase">
                {current?.category}
              </span>
              <p key={active} className="font-display italic text-xl md:text-2xl mt-3 text-warm-white">
                &ldquo;{current?.content}&rdquo;
              </p>
            </div>
          </Reveal>
        </>
      ) : null}

      {favorites.length > 0 ? (
        <Reveal delay={0.4}>
          <div className="mt-10 flex flex-wrap gap-x-10 gap-y-3 max-w-xl text-sm">
            {favorites.map((f) => (
              <div key={f.label}>
                <span className="block text-[10px] tracking-[0.4em] text-gold uppercase mb-1">
                  {f.label}
                </span>
                <span className="text-silver">{f.value}</span>
              </div>
            ))}
          </div>
        </Reveal>
      ) : null}

      {lines.length > 0 ? (
        <Reveal delay={0.45}>
          <ul className="mt-8 space-y-2 max-w-xl">
            {lines.map((line, i) => (
              <li key={i} className="text-silver/70 italic text-sm">
                &ldquo;{line}&rdquo;
              </li>
            ))}
          </ul>
        </Reveal>
      ) : null}
    </section>
  );
}
