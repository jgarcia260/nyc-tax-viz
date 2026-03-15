'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, InstancedMesh, Object3D, Color } from 'three';
import gsap from 'gsap';
import { ParticleSystem } from './ParticleSystem';

interface ParkGrowthCinematicProps {
  position: [number, number, number];
  size?: number;
  delay?: number;
  onComplete?: () => void;
}

/**
 * CINEMATIC park growth with:
 * - Organic spreading animation
 * - Crowd simulation (people dots moving)
 * - Flowering effect (colors bloom)
 * - Birds/butterflies (ambient life)
 * - GSAP timeline orchestration
 */
export function ParkGrowthCinematic({
  position,
  size = 2,
  delay = 0,
  onComplete
}: ParkGrowthCinematicProps) {
  const groupRef = useRef<Group>(null);
  const crowdRef = useRef<InstancedMesh>(null);
  
  const [growthProgress, setGrowthProgress] = useState(0);
  const [showFlowers, setShowFlowers] = useState(false);
  const [showCrowd, setShowCrowd] = useState(false);

  // Grass patches for organic look
  const patches = useMemo(() => {
    const count = 16;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = size * 0.35;
      return {
        x: Math.cos(angle) * distance,
        z: Math.sin(angle) * distance,
        delay: i * 0.04,
        size: 0.25 + Math.random() * 0.15
      };
    });
  }, [size]);

  // Crowd simulation data
  const crowdPeople = useMemo(() => {
    const count = 20;
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * size * 0.8,
      z: (Math.random() - 0.5) * size * 0.8,
      speed: 0.3 + Math.random() * 0.2,
      angle: Math.random() * Math.PI * 2
    }));
  }, [size]);

  useEffect(() => {
    // GSAP timeline for park creation
    const tl = gsap.timeline({
      delay,
      onComplete
    });

    // 1. Grass spreads organically (2s)
    tl.to(
      { progress: 0 },
      {
        progress: 1,
        duration: 2,
        ease: 'power2.out',
        onUpdate: function() {
          setGrowthProgress(this.targets()[0].progress);
        }
      }
    );

    // 2. Flowers bloom (0.8s, overlaps)
    tl.call(() => setShowFlowers(true), [], '-=0.5');

    // 3. People start appearing (0.5s delay)
    tl.call(() => setShowCrowd(true), [], '+=0.5');

    return () => {
      tl.kill();
    };
  }, [delay, onComplete]);

  // Animate crowd movement
  useFrame((state) => {
    if (!crowdRef.current || !showCrowd) return;

    const time = state.clock.getElapsedTime();
    const tempObj = new Object3D();

    crowdPeople.forEach((person, i) => {
      // Wander pattern
      const x = person.x + Math.sin(time * person.speed + i) * 0.3;
      const z = person.z + Math.cos(time * person.speed + i) * 0.3;

      tempObj.position.set(x, 0.05, z);
      tempObj.scale.setScalar(0.08);
      tempObj.updateMatrix();
      
      crowdRef.current!.setMatrixAt(i, tempObj.matrix);
    });

    crowdRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Main park base */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[size * growthProgress, size * growthProgress, 0.05, 32]} />
        <meshStandardMaterial
          color="#2ECC71"
          roughness={0.9}
          emissive="#1a5c30"
          emissiveIntensity={growthProgress * 0.2}
        />
      </mesh>

      {/* Grass patches (staggered growth) */}
      {patches.map((patch, i) => {
        const patchProgress = Math.max(0, growthProgress - patch.delay);
        const patchScale = Math.min(patchProgress * 1.8, 1);

        if (patchScale <= 0) return null;

        return (
          <mesh
            key={i}
            position={[patch.x, 0.02, patch.z]}
            scale={patchScale}
            receiveShadow
          >
            <cylinderGeometry args={[size * patch.size, size * patch.size, 0.03, 12]} />
            <meshStandardMaterial
              color="#27AE60"
              roughness={0.95}
            />
          </mesh>
        );
      })}

      {/* Trees with growth animation */}
      {[0, 1, 2, 3].map(i => {
        const angle = (i / 4) * Math.PI * 2;
        const dist = size * 0.5;
        const treeProgress = Math.max(0, growthProgress - 0.3 - i * 0.08);
        const treeScale = Math.min(treeProgress * 2.5, 1);

        if (treeScale <= 0) return null;

        return (
          <group
            key={`tree-${i}`}
            position={[Math.cos(angle) * dist, 0, Math.sin(angle) * dist]}
            scale={treeScale}
          >
            {/* Trunk */}
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 0.4, 8]} />
              <meshStandardMaterial color="#654321" roughness={0.9} />
            </mesh>
            
            {/* Foliage (multiple layers) */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <sphereGeometry args={[0.25, 12, 12]} />
              <meshStandardMaterial
                color="#228B22"
                emissive="#0a2f0a"
                emissiveIntensity={0.1}
              />
            </mesh>
            <mesh position={[0, 0.65, 0]} castShadow>
              <sphereGeometry args={[0.18, 10, 10]} />
              <meshStandardMaterial color="#2a9d2a" />
            </mesh>
          </group>
        );
      })}

      {/* Flower bloom particles */}
      {showFlowers && (
        <>
          <ParticleSystem
            position={[0, 0.1, 0]}
            count={100}
            color="#FFB6C1"
            size={0.06}
            lifetime={2}
            spread={size * 0.8}
            velocity={0.3}
            type="sparkle"
          />
          <ParticleSystem
            position={[0, 0.1, 0]}
            count={80}
            color="#FF69B4"
            size={0.05}
            lifetime={2.5}
            spread={size * 0.6}
            velocity={0.25}
            type="sparkle"
          />
        </>
      )}

      {/* Crowd simulation (people dots) */}
      {showCrowd && (
        <instancedMesh
          ref={crowdRef}
          args={[undefined, undefined, crowdPeople.length]}
          castShadow
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color="#3498DB"
            emissive="#2980B9"
            emissiveIntensity={0.3}
          />
        </instancedMesh>
      )}

      {/* Ambient butterflies/birds */}
      {showCrowd && <AmbientLife size={size} />}
    </group>
  );
}

// Ambient life (butterflies/birds flying around)
function AmbientLife({ size }: { size: number }) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.2;
  });

  return (
    <group ref={groupRef}>
      {[0, 1, 2].map(i => {
        const angle = (i / 3) * Math.PI * 2;
        const radius = size * 0.6;
        
        return (
          <FloatingBird
            key={i}
            position={[
              Math.cos(angle) * radius,
              0.5 + Math.sin(angle * 2) * 0.2,
              Math.sin(angle) * radius
            ]}
            offset={i}
          />
        );
      })}
    </group>
  );
}

function FloatingBird({ position, offset }: { position: [number, number, number]; offset: number }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * 2 + offset) * 0.15;
    meshRef.current.rotation.z = Math.sin(time * 3 + offset) * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial
        color="#FFD700"
        emissive="#FFA500"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}
