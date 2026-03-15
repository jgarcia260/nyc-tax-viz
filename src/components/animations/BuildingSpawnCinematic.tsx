'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { animated, useSpring } from '@react-spring/three';
import gsap from 'gsap';
import { ParticleSystem } from './ParticleSystem';

interface BuildingSpawnCinematicProps {
  position: [number, number, number];
  height?: number;
  color?: string;
  delay?: number;
  onComplete?: () => void;
}

/**
 * CINEMATIC building spawn with:
 * - Construction crane animation
 * - Dust particle effects
 * - Glass reflection shimmer
 * - Physics-based bounce (React Spring)
 * - GSAP timeline orchestration
 */
export function BuildingSpawnCinematic({
  position,
  height = 2,
  color = '#4A90E2',
  delay = 0,
  onComplete
}: BuildingSpawnCinematicProps) {
  const groupRef = useRef<THREE.Group>(null);
  const buildingRef = useRef<THREE.Mesh>(null);
  const craneRef = useRef<THREE.Group>(null);
  
  const [showDust, setShowDust] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [craneActive, setCraneActive] = useState(true);

  // Physics-based spring animation for final bounce
  const [springProps, springApi] = useSpring(() => ({
    scale: 0,
    config: { tension: 120, friction: 14 }
  }));

  useEffect(() => {
    if (!groupRef.current || !buildingRef.current || !craneRef.current) return;

    // GSAP Timeline for construction sequence
    const tl = gsap.timeline({
      delay,
      onComplete: () => {
        setCraneActive(false);
        onComplete?.();
      }
    });

    // 1. Crane lowers into position (0.5s)
    tl.fromTo(
      craneRef.current.position,
      { y: height + 3 },
      { y: height, duration: 0.5, ease: 'power2.inOut' }
    );

    // 2. Building rises with crane (1.5s)
    tl.to(
      buildingRef.current.scale,
      {
        y: 1,
        duration: 1.5,
        ease: 'power2.out',
        onStart: () => setShowDust(true),
        onUpdate: function() {
          // Crane follows building top
          if (craneRef.current && buildingRef.current) {
            craneRef.current.position.y = 
              position[1] + (height * buildingRef.current.scale.y) + 0.5;
          }
        }
      },
      '-=0.2' // Overlap slightly
    );

    // 3. Sparkles when construction completes (0.3s)
    tl.call(() => setShowSparkles(true));
    
    // 4. Crane lifts away (0.6s)
    tl.to(
      craneRef.current.position,
      { y: height + 5, duration: 0.6, ease: 'power2.in' }
    );

    // 5. Final spring bounce (React Spring takes over)
    tl.call(() => {
      springApi.start({ scale: 1 });
    });

    return () => {
      tl.kill();
    };
  }, [delay, height, position, onComplete, springApi]);

  // Glass reflection shimmer effect
  useFrame((state) => {
    if (!buildingRef.current) return;
    
    const time = state.clock.getElapsedTime();
    const material = buildingRef.current.material as THREE.MeshStandardMaterial;
    
    // Shimmer emissive intensity
    if (material.emissive) {
      material.emissiveIntensity = 0.2 + Math.sin(time * 3) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main Building */}
      <animated.mesh
        ref={buildingRef}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        scale-y={0}
        scale-x={springProps.scale}
        scale-z={springProps.scale}
      >
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </animated.mesh>

      {/* Construction Crane */}
      {craneActive && (
        <group ref={craneRef} position={[0, height + 3, 0]}>
          {/* Crane arm */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.5, 0.05, 0.05]} />
            <meshStandardMaterial color="#FFD700" metalness={0.8} />
          </mesh>
          
          {/* Crane mast */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
            <meshStandardMaterial color="#888888" />
          </mesh>

          {/* Hook/cable */}
          <mesh position={[0, -1, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 1, 6]} />
            <meshStandardMaterial color="#333333" />
          </mesh>

          {/* Rotating beacon light */}
          <mesh position={[0.7, 0.1, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial
              color="#FF0000"
              emissive="#FF0000"
              emissiveIntensity={1}
            />
          </mesh>
        </group>
      )}

      {/* Dust particles during construction */}
      {showDust && (
        <>
          <ParticleSystem
            position={[0, 0, 0]}
            count={150}
            color="#8B7355"
            size={0.08}
            lifetime={1.5}
            spread={1.2}
            velocity={0.5}
            type="dust"
          />
          <ParticleSystem
            position={[0.4, 0, 0.4]}
            count={100}
            color="#A0826D"
            size={0.06}
            lifetime={1.8}
            spread={0.8}
            velocity={0.4}
            type="smoke"
          />
        </>
      )}

      {/* Sparkles on completion */}
      {showSparkles && (
        <ParticleSystem
          position={[0, height, 0]}
          count={80}
          color="#FFD700"
          size={0.1}
          lifetime={1.2}
          spread={1}
          velocity={1.5}
          type="sparkle"
        />
      )}
    </group>
  );
}
