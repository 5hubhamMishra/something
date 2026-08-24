'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as ThreePoints } from 'three';
import { useIsMobile, useReducedMotion } from '@/hooks/useMediaFlags';

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
 *
 * Reads device/motion capability itself (rather than requiring every call site
 * to thread isMobile/reducedMotion through) so every chapter that uses this
 * component gets adaptive density for free: mobile gets ~45% of the requested
 * count (matching CorridorDust's existing ratio), and reduced-motion visitors
 * get that same lighter count with the drift animation stopped outright.
 */
export default function ParticleField({
  count: requestedCount = 350,
  radius = 10,
  color = '#c9a15f',
  size = 0.012,
  speed = 0.02,
  opacity = 0.3,
}: ParticleFieldProps) {
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const count = isMobile || reducedMotion ? Math.round(requestedCount * 0.45) : requestedCount;
  const effectiveSpeed = reducedMotion ? 0 : speed;

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
    if (!ref.current || effectiveSpeed === 0) return;
    ref.current.rotation.y += delta * effectiveSpeed;
    ref.current.rotation.x += delta * effectiveSpeed * 0.2;
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
