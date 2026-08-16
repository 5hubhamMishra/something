'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { BufferGeometry, Points as ThreePoints, PointsMaterial } from 'three';
import { introState } from '@/lib/introTween';
import { useUniverseStore } from '@/lib/store';

const COUNT = 850;

export default function OpeningFormation() {
  const pointsRef = useRef<ThreePoints>(null);
  const geoRef = useRef<BufferGeometry>(null);
  const matRef = useRef<PointsMaterial>(null);

  const { scatter, constellation } = useMemo(() => {
    const scatter = new Float32Array(COUNT * 3);
    const constellation = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const r1 = 14 + Math.random() * 6;
      const theta1 = Math.random() * Math.PI * 2;
      const phi1 = Math.acos(2 * Math.random() - 1);
      scatter[i * 3] = r1 * Math.sin(phi1) * Math.cos(theta1);
      scatter[i * 3 + 1] = r1 * Math.sin(phi1) * Math.sin(theta1);
      scatter[i * 3 + 2] = r1 * Math.cos(phi1) - 4;

      const arm = i % 5;
      const t = Math.random();
      const armAngle = (arm / 5) * Math.PI * 2;
      const radius = t * 3.2;
      const swirl = armAngle + t * 2.4;
      constellation[i * 3] = Math.cos(swirl) * radius + (Math.random() - 0.5) * 0.4;
      constellation[i * 3 + 1] = Math.sin(swirl) * radius * 0.5 + (Math.random() - 0.5) * 0.4;
      constellation[i * 3 + 2] = (Math.random() - 0.5) * 1.2 - 2;
    }

    return { scatter, constellation };
  }, []);

  const live = useMemo(() => scatter.slice(), [scatter]);
  const fadeStartRef = useRef<number | null>(null);
  const [hidden, setHidden] = useState(false);

  useFrame((state) => {
    const introComplete = useUniverseStore.getState().introComplete;

    if (introComplete) {
      // The overlay's own fade covers the screen for ~1.2s after intro completes;
      // once it lifts, these points must be gone too, or they sit frozen at full
      // opacity on top of the first chapter's content forever.
      if (hidden) return;
      if (fadeStartRef.current === null) fadeStartRef.current = state.clock.elapsedTime;
      const elapsed = state.clock.elapsedTime - fadeStartRef.current;
      const fadeDuration = 1.2;
      const t = Math.min(1, elapsed / fadeDuration);
      if (matRef.current) matRef.current.opacity = introState.field * (1 - t);
      if (t >= 1) setHidden(true);
      return;
    }

    const geo = geoRef.current;
    if (!geo) return;

    const m = introState.morph;
    for (let i = 0; i < COUNT; i++) {
      live[i * 3] = scatter[i * 3] + (constellation[i * 3] - scatter[i * 3]) * m;
      live[i * 3 + 1] = scatter[i * 3 + 1] + (constellation[i * 3 + 1] - scatter[i * 3 + 1]) * m;
      live[i * 3 + 2] = scatter[i * 3 + 2] + (constellation[i * 3 + 2] - scatter[i * 3 + 2]) * m;
    }
    const attr = geo.attributes.position;
    attr.array.set(live);
    attr.needsUpdate = true;

    if (matRef.current) {
      matRef.current.opacity = introState.field;
      matRef.current.size = 0.035 + introState.glow * 0.05;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0008;
    }
  });

  if (hidden) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[scatter, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        transparent
        color="#c9a15f"
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        opacity={0}
      />
    </points>
  );
}
