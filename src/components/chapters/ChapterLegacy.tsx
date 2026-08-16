'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, useScroll } from '@react-three/drei';
import { MathUtils, Vector3, type Mesh, type MeshStandardMaterial } from 'three';
import ParticleField from '@/components/canvas/ParticleField';
import Reveal from '@/components/ui/Reveal';
import { siteConfig } from '@/lib/config';
import { chapterById, chapterProgress } from '@/lib/chapters';

const chapter = chapterById('legacy');

interface BranchSegment {
  start: [number, number, number];
  end: [number, number, number];
  depth: number;
}

interface LeafTip {
  position: [number, number, number];
  threshold: number;
}

const SEED_DEPTH = 4;
const SEED_LENGTH = 1.8;
const LENGTH_FALLOFF = 0.68;

/** Recursively grows a branching tree, pushing every segment into `segments` and every terminal tip into `leaves`. */
function buildBranches(
  origin: [number, number, number],
  dir: [number, number, number],
  length: number,
  depth: number,
  segments: BranchSegment[],
  leaves: [number, number, number][]
) {
  const originV = new Vector3(origin[0], origin[1], origin[2]);
  const dirV = new Vector3(dir[0], dir[1], dir[2]).normalize();
  const endV = originV.clone().addScaledVector(dirV, length);
  const end: [number, number, number] = [endV.x, endV.y, endV.z];

  segments.push({ start: origin, end, depth });

  if (depth <= 0) {
    leaves.push(end);
    return;
  }

  const childCount = Math.random() < 0.5 ? 2 : 3;
  for (let i = 0; i < childCount; i++) {
    const axis = new Vector3(Math.random() - 0.5, 0.6 + Math.random() * 0.4, Math.random() - 0.5)
      .normalize();
    const spread = 0.4 + Math.random() * 0.35;
    const sign = i % 2 === 0 ? 1 : -1;
    const childDir = dirV
      .clone()
      .applyAxisAngle(axis, spread * sign + (Math.random() - 0.5) * 0.15);
    buildBranches(end, [childDir.x, childDir.y, childDir.z], length * LENGTH_FALLOFF, depth - 1, segments, leaves);
  }
}

function LegacyTree() {
  const scroll = useScroll();
  const leafRefs = useRef<(Mesh | null)[]>([]);

  const { segments, leaves } = useMemo(() => {
    const segments: BranchSegment[] = [];
    const tips: [number, number, number][] = [];
    buildBranches([0, 0.8, 0], [0, 1, 0], SEED_LENGTH, SEED_DEPTH, segments, tips);
    const leaves: LeafTip[] = tips.map((position) => ({ position, threshold: Math.random() }));
    return { segments, leaves };
  }, []);

  useFrame(() => {
    const progress = chapterProgress('legacy', scroll.offset);
    leafRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const leaf = leaves[i];
      const target = progress > leaf.threshold ? 1 : 0;
      const nextScale = MathUtils.lerp(mesh.scale.x, target, 0.06);
      mesh.scale.setScalar(nextScale);
      const mat = mesh.material as MeshStandardMaterial;
      mat.opacity = MathUtils.lerp(mat.opacity, target, 0.06);
      mat.emissiveIntensity = MathUtils.lerp(mat.emissiveIntensity, target * 2.2, 0.06);
    });
  });

  return (
    <>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.6, 8]} />
        <meshStandardMaterial color="#5c4630" roughness={0.9} metalness={0.1} />
      </mesh>

      {segments.map((seg, i) => (
        <Line
          key={i}
          points={[seg.start, seg.end]}
          color={seg.depth <= 1 ? '#c9a15f' : '#8a6a3e'}
          lineWidth={seg.depth <= 1 ? 1 : 1.6}
          transparent
          opacity={0.8}
        />
      ))}

      {leaves.map((leaf, i) => (
        <mesh
          key={i}
          position={leaf.position}
          scale={0}
          ref={(el) => {
            leafRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial
            color="#f4f1ea"
            emissive="#c9a15f"
            emissiveIntensity={0}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

export function LegacyScene() {
  const wz = chapter.worldZ;
  return (
    <group position={[0, 0, wz]}>
      <LegacyTree />
      <ParticleField count={250} radius={8} color="#c9a15f" opacity={0.35} />
    </group>
  );
}

export function LegacyDom() {
  const heightVh = (chapter.end - chapter.start) * 100;
  const name = siteConfig.father.displayName;
  return (
    <section
      style={{ minHeight: `${heightVh}vh` }}
      className="relative flex flex-col px-8 md:px-24 max-w-3xl py-[16vh] gap-[12vh]"
    >
      <div>
        <Reveal>
          <span className="text-[11px] tracking-[0.5em] text-gold uppercase">Chapter Nine</span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl md:text-6xl mt-4 mb-6 text-warm-white">
            His Legacy
          </h2>
        </Reveal>
      </div>

      <Reveal delay={0.1} className="max-w-xl">
        <span className="text-[11px] tracking-[0.4em] text-gold uppercase">Roots</span>
        <p className="mt-3 text-silver leading-relaxed text-base md:text-lg">
          {name}&apos;s parents, childhood, and struggles shaped the man he became.
        </p>
      </Reveal>

      <Reveal delay={0.2} className="max-w-xl">
        <span className="text-[11px] tracking-[0.4em] text-gold uppercase">Trunk</span>
        <p className="mt-3 text-silver leading-relaxed text-base md:text-lg">
          His character, his decisions, his values — the steady core beneath everything.
        </p>
      </Reveal>

      <Reveal delay={0.3} className="max-w-xl">
        <span className="text-[11px] tracking-[0.4em] text-gold uppercase">Branches</span>
        <p className="mt-3 text-silver leading-relaxed text-base md:text-lg">
          His family, his children, his achievements — reaching outward, always.
        </p>
      </Reveal>

      <Reveal delay={0.4} className="max-w-xl">
        <span className="text-[11px] tracking-[0.4em] text-gold uppercase">Leaves</span>
        <p className="mt-3 text-silver leading-relaxed text-base md:text-lg">
          Every memory, every person, every lesson — a light in the structure he built.
        </p>
      </Reveal>

      <div className="mt-[8vh] text-center mx-auto">
        <Reveal delay={0.5}>
          <p className="font-display text-2xl md:text-4xl text-gold">
            His greatest achievement isn&apos;t what he built.
          </p>
        </Reveal>
        <Reveal delay={0.65}>
          <p className="font-display text-2xl md:text-4xl text-gold mt-3">
            It&apos;s who he helped become.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
