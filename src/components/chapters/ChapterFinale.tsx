'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import type { BufferGeometry, Mesh, MeshStandardMaterial, Points as ThreePoints, PointsMaterial } from 'three';
import Reveal from '@/components/ui/Reveal';
import { siteConfig } from '@/lib/config';
import { chapterById, chapterProgress } from '@/lib/chapters';

const chapter = chapterById('finale');
const wz = chapter.worldZ;

const COUNT = 500;
const RADIUS = 7;

export function FinaleScene() {
  const scroll = useScroll();
  const pointsRef = useRef<ThreePoints>(null);
  const geoRef = useRef<BufferGeometry>(null);
  const matRef = useRef<PointsMaterial>(null);
  const coreRef = useRef<Mesh>(null);

  const original = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      const r = RADIUS * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  const live = useMemo(() => original.slice(), [original]);

  useFrame((state) => {
    const progress = chapterProgress('finale', scroll.offset);
    const geo = geoRef.current;

    if (geo) {
      for (let i = 0; i < COUNT; i++) {
        live[i * 3] = original[i * 3] * (1 - progress);
        live[i * 3 + 1] = original[i * 3 + 1] * (1 - progress);
        live[i * 3 + 2] = original[i * 3 + 2] * (1 - progress);
      }
      const attr = geo.attributes.position;
      attr.array.set(live);
      attr.needsUpdate = true;
    }

    if (matRef.current) {
      const collapse = Math.min(1, Math.max(0, (progress - 0.85) / 0.15));
      matRef.current.opacity = 0.6 * (1 - collapse);
      matRef.current.size = 0.045 * (1 - collapse * 0.85);
    }

    if (coreRef.current) {
      const rampT = Math.min(1, Math.max(0, (progress - 0.55) / 0.45));
      const scale = 0.04 + rampT * 0.4;
      coreRef.current.scale.setScalar(scale);
      const mat = coreRef.current.material as MeshStandardMaterial;
      mat.emissiveIntensity = 0.4 + rampT * 3.2;
      mat.opacity = 0.2 + rampT * 0.8;
    }

    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group position={[0, 0, wz]}>
      <points ref={pointsRef}>
        <bufferGeometry ref={geoRef}>
          <bufferAttribute attach="attributes-position" args={[original, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={matRef}
          transparent
          color="#c9a15f"
          size={0.045}
          sizeAttenuation
          depthWrite={false}
          opacity={0.6}
          toneMapped={false}
        />
      </points>
      <mesh ref={coreRef} scale={0.04}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#f4f1ea"
          emissive="#f4f1ea"
          emissiveIntensity={0.4}
          toneMapped={false}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
}

function closingLineClass(i: number, total: number) {
  if (total <= 1 || i === total - 1) {
    return 'font-display text-3xl md:text-5xl text-gold';
  }
  const ratio = i / (total - 1);
  if (ratio < 0.34) return 'font-display text-xl md:text-3xl text-warm-white/80';
  if (ratio < 0.67) return 'font-display text-2xl md:text-4xl text-warm-white/90';
  return 'font-display text-2xl md:text-4xl text-warm-white';
}

export function FinaleDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  const { heading, body, closing } = siteConfig.finalMessage;

  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col px-6 md:px-16 py-24"
    >
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center">
        <Reveal>
          <h2 className="font-display text-5xl md:text-8xl text-gold text-center">{heading}</h2>
        </Reveal>
        <Reveal delay={0.25}>
          <p className="font-display text-3xl md:text-5xl text-warm-white text-center">
            {siteConfig.father.displayName}
          </p>
        </Reveal>
      </div>

      {body.map((line, i) => (
        <div
          key={`body-${i}`}
          className="min-h-screen flex items-center justify-center"
        >
          <Reveal delay={0.1 * i} className="max-w-2xl mx-auto">
            <p className="font-display italic text-lg md:text-2xl text-warm-white/90 text-center leading-relaxed">
              {line}
            </p>
          </Reveal>
        </div>
      ))}

      {closing.map((line, i) => (
        <div
          key={`closing-${i}`}
          className="min-h-screen flex items-center justify-center"
        >
          <Reveal delay={0.1 * i}>
            <p className={`${closingLineClass(i, closing.length)} text-center`}>{line}</p>
          </Reveal>
        </div>
      ))}

      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <Reveal>
          <div className="w-3 h-3 rounded-full bg-gold shadow-[0_0_24px_6px_rgba(201,161,95,0.55)] animate-gentle-pulse" />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="text-silver/60 text-xs tracking-widest uppercase text-center">
            The Universe of {siteConfig.father.displayName}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
