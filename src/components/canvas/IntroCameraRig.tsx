'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { introState } from '@/lib/introTween';
import { useUniverseStore } from '@/lib/store';
import { getCameraPose } from '@/lib/chapters';

const lookTarget = new Vector3();

export default function IntroCameraRig() {
  const { camera } = useThree();

  useFrame(() => {
    const introComplete = useUniverseStore.getState().introComplete;
    if (introComplete) return;

    const startZ = 22;
    const endPose = getCameraPose(0);
    const z = startZ + (endPose.position[2] - startZ) * introState.cameraPush;

    camera.position.set(
      endPose.position[0],
      endPose.position[1],
      z
    );
    lookTarget.set(0, 0, endPose.target[2] - (1 - introState.cameraPush) * 4);
    camera.lookAt(lookTarget);

    if ('fov' in camera) {
      const cam = camera as unknown as { fov: number; updateProjectionMatrix: () => void };
      cam.fov = 55 - introState.cameraPush * (55 - (endPose.fov ?? 45));
      cam.updateProjectionMatrix();
    }
  });

  return null;
}
