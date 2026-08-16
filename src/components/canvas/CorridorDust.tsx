'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import type { Points as ThreePoints } from 'three';

interface CorridorDustProps {
  length: number;
  count?: number;
  radius?: number;
}

/**
 * Sparse gold/silver dust distributed along the entire Z corridor for ambient depth.
 * Kept out of the "content tube" around the corridor axis, where photos and 3D
 * content actually sit, so it reads as background atmosphere instead of clutter
 * drawn on top of foreground objects. Points near the vanishing point (far down
 * the corridor) still converge toward screen-center under perspective, so the
 * exclusion radius is kept wide and the points small/dim to stay unobtrusive
 * even when that happens.
 */
export default function CorridorDust({ length, count = 650, radius = 19 }: CorridorDustProps) {
  const ref = useRef<ThreePoints>(null);
  const minRadius = radius * 0.84;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const gold = [0.79, 0.63, 0.37];
    const silver = [0.66, 0.68, 0.72];
    for (let i = 0; i < count; i++) {
      const r = minRadius + (radius - minRadius) * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(theta) * r * 0.7;
      pos[i * 3 + 2] = -Math.random() * length + 8;

      const c = Math.random() > 0.7 ? gold : silver;
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return [pos, col];
  }, [count, radius, minRadius, length]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.01;
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.007}
        sizeAttenuation
        depthWrite={false}
        opacity={0.12}
        fog
      />
    </Points>
  );
}
