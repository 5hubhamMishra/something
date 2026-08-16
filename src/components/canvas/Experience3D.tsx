'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import CameraRig from './CameraRig';
import IntroCameraRig from './IntroCameraRig';
import ScrollBridge from './ScrollBridge';
import CorridorDust from './CorridorDust';
import OpeningFormation from './OpeningFormation';

import { BeginningScene, BeginningDom } from '@/components/chapters/ChapterBeginning';
import { JourneyScene, JourneyDom } from '@/components/chapters/ChapterJourney';
import { ManScene, ManDom } from '@/components/chapters/ChapterMan';
import { FamilyScene, FamilyDom } from '@/components/chapters/ChapterFamily';
import { FamilyTreeScene, FamilyTreeDom } from '@/components/chapters/ChapterFamilyTree';
import { MemoriesScene, MemoriesDom } from '@/components/chapters/ChapterMemories';
import { FunSideScene, FunSideDom } from '@/components/chapters/ChapterFunSide';
import { LessonsScene, LessonsDom } from '@/components/chapters/ChapterLessons';
import { YearsScene, YearsDom } from '@/components/chapters/ChapterYears';
import { LegacyScene, LegacyDom } from '@/components/chapters/ChapterLegacy';
import { FutureScene, FutureDom } from '@/components/chapters/ChapterFuture';
import { FinaleScene, FinaleDom } from '@/components/chapters/ChapterFinale';

import { CHAPTERS, TOTAL_PAGES } from '@/lib/chapters';
import { useUniverseStore } from '@/lib/store';
import { useIsMobile, useReducedMotion } from '@/hooks/useMediaFlags';

const CORRIDOR_LENGTH = Math.abs(CHAPTERS[CHAPTERS.length - 1].worldZ) + 24;

export default function Experience3D() {
  const introComplete = useUniverseStore((s) => s.introComplete);
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.3, 22], fov: 55, near: 0.1, far: 220 }}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#05050a']} />
        <fog attach="fog" args={['#05050a', 8, 30]} />
        <ambientLight intensity={0.35} />
        <pointLight position={[0, 3, 8]} intensity={1.4} color="#c9a15f" />
        <pointLight position={[0, -2, -20]} intensity={0.5} color="#8a6a3e" />

        <Suspense fallback={null}>
          <ScrollControls pages={TOTAL_PAGES} damping={0.25} enabled={introComplete}>
            <ScrollBridge />
            <CameraRig />
            <IntroCameraRig />
            <OpeningFormation />
            <CorridorDust
              length={CORRIDOR_LENGTH}
              count={isMobile || reducedMotion ? 200 : 500}
            />

            <BeginningScene />
            <JourneyScene />
            <ManScene />
            <FamilyScene />
            <FamilyTreeScene />
            <MemoriesScene />
            <FunSideScene />
            <LessonsScene />
            <YearsScene />
            <LegacyScene />
            <FutureScene />
            <FinaleScene />

            <Scroll html style={{ width: '100%' }}>
              <div className="w-screen">
                <BeginningDom />
                <JourneyDom />
                <ManDom />
                <FamilyDom />
                <FamilyTreeDom />
                <MemoriesDom />
                <FunSideDom />
                <LessonsDom />
                <YearsDom />
                <LegacyDom />
                <FutureDom />
                <FinaleDom />
              </div>
            </Scroll>
          </ScrollControls>
        </Suspense>

        {!isMobile && !reducedMotion && (
          <EffectComposer multisampling={0}>
            <Bloom
              luminanceThreshold={0.35}
              luminanceSmoothing={0.9}
              intensity={0.55}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
