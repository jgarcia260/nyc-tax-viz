'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParkGrowthProps {
  position: [number, number, number];
  size?: number;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Animated park/green space that grows and spreads
 * Organic, flowing expansion effect
 */
export function ParkGrowth({
  position,
  size = 2,
  delay = 0,
  onComplete
}: ParkGrowthProps) {
  const groupRef = useRef<THREE.Group>(null);
  const progressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  // Create multiple "grass patches" for organic growth
  const patches = useMemo(() => {
    const count = 12;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = size * 0.3;
      return {
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        delay: i * 0.05, // Stagger growth
        size: 0.3 + Math.random() * 0.2
      };
    });
  }, [size]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const elapsed = state.clock.getElapsedTime();
    
    if (startTimeRef.current === null) {
      startTimeRef.current = elapsed;
    }

    const timeSinceStart = elapsed - startTimeRef.current - delay;

    if (timeSinceStart < 0) {
      groupRef.current.scale.setScalar(0);
      return;
    }

    // Animation duration: 1.8 seconds
    const duration = 1.8;
    progressRef.current = Math.min(timeSinceStart / duration, 1);

    // Ease-out for organic growth feeling
    const eased = 1 - Math.pow(1 - progressRef.current, 2);

    // Main park area grows
    groupRef.current.scale.setScalar(eased);

    // Subtle pulsing at the end (living/breathing effect)
    if (progressRef.current > 0.8) {
      const pulse = Math.sin(elapsed * 2) * 0.02 + 1;
      groupRef.current.scale.setScalar(eased * pulse);
    }

    // Call onComplete once
    if (progressRef.current >= 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main park base */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[size, size, 0.05, 32]} />
        <meshStandardMaterial 
          color="#2ECC71"
          roughness={0.8}
        />
      </mesh>

      {/* Grass patches for organic look */}
      {patches.map((patch, i) => {
        const patchProgress = Math.max(0, progressRef.current - patch.delay);
        const patchScale = Math.min(patchProgress * 1.5, 1);

        return (
          <mesh 
            key={i}
            position={[patch.x, 0.02, patch.z]}
            scale={patchScale}
            receiveShadow
          >
            <cylinderGeometry args={[size * patch.size, size * patch.size, 0.03, 16]} />
            <meshStandardMaterial 
              color="#27AE60"
              roughness={0.9}
            />
          </mesh>
        );
      })}

      {/* Trees (simple cylinders with spheres) */}
      {[0, 1, 2].map(i => {
        const angle = (i / 3) * Math.PI * 2;
        const dist = size * 0.5;
        const treeProgress = Math.max(0, progressRef.current - 0.3 - i * 0.1);
        const treeScale = Math.min(treeProgress * 2, 1);

        return (
          <group 
            key={`tree-${i}`}
            position={[Math.cos(angle) * dist, 0, Math.sin(angle) * dist]}
            scale={treeScale}
          >
            {/* Trunk */}
            <mesh position={[0, 0.15, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Foliage */}
            <mesh position={[0, 0.4, 0]} castShadow>
              <sphereGeometry args={[0.2, 12, 12]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
