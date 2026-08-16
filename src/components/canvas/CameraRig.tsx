'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import { damp3, damp } from 'maath/easing';
import { Vector3 } from 'three';
import { getCameraPose } from '@/lib/chapters';
import { useUniverseStore } from '@/lib/store';

const target = new Vector3();
const desiredPos = new Vector3();
const desiredTarget = new Vector3();

export default function CameraRig() {
  const scroll = useScroll();
  const { camera, pointer } = useThree();
  const introComplete = useUniverseStore((s) => s.introComplete);

  useFrame((_, delta) => {
    if (!introComplete) return;

    const pose = getCameraPose(scroll.offset);
    desiredPos.set(pose.position[0], pose.position[1], pose.position[2]);
    desiredTarget.set(pose.target[0], pose.target[1], pose.target[2]);

    // subtle parallax from pointer position
    desiredPos.x += pointer.x * 0.25;
    desiredPos.y += pointer.y * 0.15;

    damp3(camera.position, desiredPos, 0.55, delta);
    damp3(target, desiredTarget, 0.55, delta);
    if ('fov' in camera) {
      damp(camera as unknown as { fov: number }, 'fov', pose.fov, 0.6, delta);
      camera.updateProjectionMatrix();
    }
    camera.lookAt(target);
  });

  return null;
}
