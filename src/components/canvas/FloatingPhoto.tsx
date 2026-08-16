'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, RoundedBox, Text } from '@react-three/drei';
import type { Group } from 'three';

interface FloatingPhotoProps {
  image?: string;
  label: string;
  sublabel?: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  float?: number;
}

function PhotoTexture({ image, width, height }: { image: string; width: number; height: number }) {
  const texture = useTexture(image);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    // Photos sit at an angle to the camera almost everywhere on the site, so
    // without anisotropic filtering the default mip sampling smears them —
    // this is the "blurry photos" look. Max out anisotropy for crisp detail
    // at oblique viewing angles.
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
  }, [texture, gl]);

  return (
    <mesh position={[0, 0, 0.02]}>
      <planeGeometry args={[width - 0.14, height - 0.14]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function PlaceholderFace({ label, width, height }: { label: string; width: number; height: number }) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  return (
    <group position={[0, 0, 0.02]}>
      <mesh>
        <planeGeometry args={[width - 0.14, height - 0.14]} />
        <meshBasicMaterial color="#15161c" toneMapped={false} />
      </mesh>
      <Text
        fontSize={Math.min(width, height) * 0.32}
        color="#8a6a3e"
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0.01]}
      >
        {initial}
      </Text>
    </group>
  );
}

export default function FloatingPhoto({
  image,
  label,
  sublabel,
  position,
  rotation = [0, 0, 0],
  width = 1.6,
  height = 2.0,
  float = 1,
}: FloatingPhotoProps) {
  const group = useRef<Group>(null);
  const seed = position[0] + position[2];

  useFrame((state) => {
    if (!group.current) return;
    group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + seed) * 0.12 * float;
    group.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 0.3 + seed) * 0.02;
  });

  return (
    <group ref={group} position={position} rotation={rotation}>
      <RoundedBox args={[width, height, 0.04]} radius={0.02} smoothness={4}>
        <meshStandardMaterial color="#f4f1ea" roughness={0.6} metalness={0.1} />
      </RoundedBox>
      {image ? (
        <Suspense fallback={<PlaceholderFace label={label} width={width} height={height} />}>
          <PhotoTexture image={image} width={width} height={height} />
        </Suspense>
      ) : (
        <PlaceholderFace label={label} width={width} height={height} />
      )}
      {sublabel ? (
        <Text
          fontSize={0.09}
          color="#c9a15f"
          anchorX="center"
          anchorY="middle"
          position={[0, -height / 2 - 0.14, 0.02]}
        >
          {sublabel}
        </Text>
      ) : null}
    </group>
  );
}
