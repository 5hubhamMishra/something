'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import OpeningOverlay from '@/components/ui/OpeningOverlay';
import ChapterNav from '@/components/ui/ChapterNav';
import AudioPlayer from '@/components/ui/AudioPlayer';
import SignOutButton from '@/components/ui/SignOutButton';
import { SecretHotspot, SecretModal } from '@/components/ui/SecretLayer';
import { hydrateDiscovered } from '@/lib/store';

const Experience3D = dynamic(() => import('@/components/canvas/Experience3D'), {
  ssr: false,
});

export default function Experience() {
  useEffect(() => {
    hydrateDiscovered();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-void">
      <Experience3D />
      <OpeningOverlay />
      <ChapterNav />
      <AudioPlayer />
      <SignOutButton />
      <SecretHotspot />
      <SecretModal />
    </div>
  );
}
