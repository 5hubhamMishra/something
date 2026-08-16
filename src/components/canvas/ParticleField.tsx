'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as ThreePoints } from 'three';

interface ParticleFieldProps {
  count?: number;
  radius?: number;
  color?: string;
  size?: number;
  speed?: number;
  opacity?: number;
}

/**
 * Ambient drifting dust field used as a background presence in every chapter.
 * Particles are kept out of a clear "content bubble" near the group origin (where
 * floating photos and other foreground objects are placed) so the dust reads as
 * atmosphere behind the content rather than clutter drawn on top of it.
 */
export default function ParticleField({
  count = 350,
  radius = 10,
  color = '#c9a15f',
  size = 0.012,
  speed = 0.02,
  opacity = 0.3,
}: ParticleFieldProps) {
  const ref = useRef<ThreePoints>(null);
  const minRadius = radius * 0.65;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = minRadius + (radius - minRadius) * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count, radius, minRadius]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * speed;
    ref.current.rotation.x += delta * speed * 0.2;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity}
      />
    </Points>
  );
}
