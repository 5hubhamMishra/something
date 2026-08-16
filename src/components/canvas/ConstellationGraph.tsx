'use client';

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Line, Text, useTexture } from '@react-three/drei';
import { MathUtils, type Mesh } from 'three';

// Portraits referenced before their image file is actually uploaded (e.g. a
// family member added ahead of the photo landing in public/images) would
// otherwise throw during texture load and take the whole graph down with
// them. Fall back to the initial-letter disc instead.
class PortraitErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export interface ConstellationNode {
  id: string;
  position: [number, number, number];
  label: string;
  sublabel?: string;
  image?: string;
  color?: string;
}

interface ConstellationGraphProps {
  nodes: ConstellationNode[];
  centerLabel?: string;
  centerImage?: string;
  onSelect?: (id: string | null) => void;
  selectedId?: string | null;
}

function PortraitDisc({ image, radius }: { image: string; radius: number }) {
  const texture = useTexture(image);
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    texture.anisotropy = gl.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
  }, [texture, gl]);

  return (
    <mesh position={[0, 0, 0.01]}>
      <circleGeometry args={[radius, 48]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function PlaceholderDisc({ label, radius }: { label: string; radius: number }) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  return (
    <group position={[0, 0, 0.01]}>
      <mesh>
        <circleGeometry args={[radius, 48]} />
        <meshBasicMaterial color="#15161c" toneMapped={false} />
      </mesh>
      <Text fontSize={radius * 0.9} color="#8a6a3e" anchorX="center" anchorY="middle">
        {initial}
      </Text>
    </group>
  );
}

function StarNode({
  node,
  isSelected,
  onSelect,
}: {
  node: ConstellationNode;
  isSelected: boolean;
  onSelect?: (id: string | null) => void;
}) {
  const ref = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const radius = 0.34;

  useFrame((state) => {
    if (!ref.current) return;
    // Idle nodes stay at a perfectly fixed scale — continuously rescaling a
    // photo texture (even by a few percent) resamples it at a slightly
    // different size every frame, which reads as a constant shimmer/blur on
    // the photo itself. The pulse is reserved for hover/select, where it's a
    // deliberate, purposeful pop rather than distracting ambient motion.
    let target = 1;
    if (hovered || isSelected) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6 + node.position[0]) * 0.05;
      target = 1.25 * pulse;
    }
    const next = MathUtils.lerp(ref.current.scale.x, target, 0.15);
    ref.current.scale.setScalar(next);
  });

  return (
    <group position={node.position}>
      <Billboard>
        <group
          ref={ref}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(isSelected ? null : node.id);
          }}
        >
          <mesh>
            <circleGeometry args={[radius + 0.045, 48]} />
            <meshStandardMaterial
              color={node.color ?? '#c9a15f'}
              emissive={node.color ?? '#c9a15f'}
              emissiveIntensity={hovered || isSelected ? 2.2 : 1.1}
              toneMapped={false}
            />
          </mesh>
          {node.image ? (
            <PortraitErrorBoundary fallback={<PlaceholderDisc label={node.label} radius={radius} />}>
              <Suspense fallback={<PlaceholderDisc label={node.label} radius={radius} />}>
                <PortraitDisc image={node.image} radius={radius} />
              </Suspense>
            </PortraitErrorBoundary>
          ) : (
            <PlaceholderDisc label={node.label} radius={radius} />
          )}
        </group>
        <Text
          fontSize={0.1}
          color="#f4f1ea"
          anchorX="center"
          anchorY="middle"
          position={[0, -radius - 0.16, 0]}
        >
          {node.label}
        </Text>
        {node.sublabel ? (
          <Text
            fontSize={0.07}
            color="#c9a15f"
            anchorX="center"
            anchorY="middle"
            position={[0, -radius - 0.29, 0]}
          >
            {node.sublabel}
          </Text>
        ) : null}
      </Billboard>
    </group>
  );
}

export default function ConstellationGraph({
  nodes,
  centerLabel,
  centerImage,
  onSelect,
  selectedId,
}: ConstellationGraphProps) {
  const center: [number, number, number] = [0, 0, 0];
  const centerRadius = 0.5;

  return (
    <group>
      <Billboard position={center}>
        <mesh>
          <circleGeometry args={[centerRadius + 0.06, 48]} />
          <meshStandardMaterial
            color="#f4f1ea"
            emissive="#c9a15f"
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>
        {centerImage ? (
          <PortraitErrorBoundary fallback={null}>
            <Suspense fallback={null}>
              <PortraitDisc image={centerImage} radius={centerRadius} />
            </Suspense>
          </PortraitErrorBoundary>
        ) : null}
        {centerLabel ? (
          <Text
            fontSize={0.11}
            color="#f4f1ea"
            anchorX="center"
            anchorY="middle"
            position={[0, -centerRadius - 0.17, 0]}
          >
            {centerLabel}
          </Text>
        ) : null}
      </Billboard>

      {nodes.map((node) => (
        <Line
          key={`line-${node.id}`}
          points={[center, node.position]}
          color="#8a6a3e"
          lineWidth={0.6}
          transparent
          opacity={0.45}
        />
      ))}

      {nodes.map((node) => (
        <StarNode
          key={node.id}
          node={node}
          isSelected={selectedId === node.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
