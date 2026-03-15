'use client';

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface BuildingSpawnProps {
  position: [number, number, number];
  height?: number;
  color?: string;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Animated building that rises from the ground
 * Used for: Affordable Housing, Schools, Mental Health Facilities
 */
export function BuildingSpawn({
  position,
  height = 2,
  color = '#4A90E2',
  delay = 0,
  onComplete
}: BuildingSpawnProps) {
  const meshRef = useRef<Mesh>(null);
  const progressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  useFrame((state) => {
    if (!meshRef.current) return;

    const elapsed = state.clock.getElapsedTime();
    
    if (startTimeRef.current === null) {
      startTimeRef.current = elapsed;
    }

    const timeSinceStart = elapsed - startTimeRef.current - delay;

    if (timeSinceStart < 0) {
      // Waiting for delay
      meshRef.current.scale.y = 0;
      return;
    }

    // Animation duration: 1.5 seconds
    const duration = 1.5;
    progressRef.current = Math.min(timeSinceStart / duration, 1);

    // Ease-out cubic for smooth deceleration
    const eased = 1 - Math.pow(1 - progressRef.current, 3);

    // Scale up from ground
    meshRef.current.scale.y = eased;
    meshRef.current.position.y = position[1] + (height / 2) * eased;

    // Slight bounce at the end
    if (progressRef.current > 0.9 && progressRef.current < 1) {
      const bounceProgress = (progressRef.current - 0.9) / 0.1;
      const bounce = Math.sin(bounceProgress * Math.PI) * 0.05;
      meshRef.current.scale.y = eased + bounce;
    }

    // Call onComplete once
    if (progressRef.current >= 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={[0.8, height, 0.8]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}
