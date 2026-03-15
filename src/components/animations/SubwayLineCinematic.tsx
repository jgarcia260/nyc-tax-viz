'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Trail, Sphere } from '@react-three/drei';
import { Vector3, Group } from 'three';
import gsap from 'gsap';
import { ParticleSystem } from './ParticleSystem';

interface SubwayLineCinematicProps {
  points: [number, number, number][];
  color?: string;
  delay?: number;
  onComplete?: () => void;
}

/**
 * CINEMATIC subway line with:
 * - Light trail effects
 * - Energy pulse along track
 * - Station spawn with glow
 * - Electric sparkles at connection points
 * - GSAP-orchestrated timeline
 */
export function SubwayLineCinematic({
  points,
  color = '#FF6B35',
  delay = 0,
  onComplete
}: SubwayLineCinematicProps) {
  const groupRef = useRef<Group>(null);
  const trainRef = useRef<Group>(null);
  const [visiblePoints, setVisiblePoints] = useState<Vector3[]>([]);
  const [currentStation, setCurrentStation] = useState(-1);
  const [showPulse, setShowPulse] = useState(false);

  const fullPath = points.map(p => new Vector3(p[0], p[1], p[2]));
  
  // Station positions (evenly distributed)
  const stationIndices = Array.from({ length: Math.max(2, Math.floor(points.length / 3)) }, 
    (_, i) => Math.floor((points.length - 1) * i / (Math.max(2, Math.floor(points.length / 3)) - 1))
  );

  useEffect(() => {
    // GSAP timeline for subway construction
    const tl = gsap.timeline({
      delay,
      onComplete
    });

    // Animate line drawing (2.5s)
    tl.to(
      { progress: 0 },
      {
        progress: 1,
        duration: 2.5,
        ease: 'power1.inOut',
        onUpdate: function() {
          const prog = this.targets()[0].progress;
          const pointsToShow = Math.floor(prog * fullPath.length);
          setVisiblePoints(fullPath.slice(0, pointsToShow));

          // Show stations as line reaches them
          for (let i = 0; i < stationIndices.length; i++) {
            const stationPoint = stationIndices[i];
            if (pointsToShow >= stationPoint && currentStation < i) {
              setCurrentStation(i);
            }
          }
        }
      }
    );

    // Energy pulse after construction (0.5s delay, then 1s pulse)
    tl.call(() => setShowPulse(true), [], '+=0.5');

    return () => {
      tl.kill();
    };
  }, [delay, fullPath.length, onComplete]);

  // Animated train that rides the line once complete
  useFrame((state) => {
    if (!trainRef.current || visiblePoints.length < fullPath.length) return;

    const time = state.clock.getElapsedTime();
    const speed = 0.3;
    const progress = (time * speed) % 1;
    const pathIndex = Math.floor(progress * (points.length - 1));
    
    if (pathIndex < points.length) {
      const pos = points[pathIndex];
      trainRef.current.position.set(pos[0], pos[1] + 0.1, pos[2]);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main subway line */}
      {visiblePoints.length > 1 && (
        <>
          {/* Base track */}
          <Line
            points={visiblePoints}
            color={color}
            lineWidth={3}
          />
          
          {/* Glow overlay */}
          <Line
            points={visiblePoints}
            color="#FFFFFF"
            lineWidth={6}
            transparent
            opacity={0.3}
          />
        </>
      )}

      {/* Stations with expansion animation */}
      {stationIndices.map((idx, i) => {
        if (i > currentStation) return null;

        const point = points[idx];
        const isNew = i === currentStation;

        return (
          <group key={i} position={point}>
            {/* Station structure */}
            <Sphere args={[0.2, 16, 16]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={isNew ? 1.5 : 0.5}
                metalness={0.8}
                roughness={0.2}
              />
            </Sphere>

            {/* Station entrance marker */}
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
              <meshStandardMaterial color="#888888" />
            </mesh>

            {/* Sparkles on new station spawn */}
            {isNew && (
              <ParticleSystem
                position={[0, 0, 0]}
                count={60}
                color="#FFFF00"
                size={0.08}
                lifetime={1}
                spread={0.6}
                velocity={1.2}
                type="sparkle"
              />
            )}
          </group>
        );
      })}

      {/* Energy pulse effect along completed line */}
      {showPulse && visiblePoints.length >= fullPath.length && (
        <EnergyPulse points={points} color={color} />
      )}

      {/* Animated train */}
      {visiblePoints.length >= fullPath.length && (
        <group ref={trainRef}>
          <Trail
            width={0.3}
            length={2}
            color={color}
            attenuation={(width) => width}
          >
            <mesh>
              <boxGeometry args={[0.15, 0.1, 0.15]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1}
              />
            </mesh>
          </Trail>
        </group>
      )}
    </group>
  );
}

// Energy pulse that travels along the line
function EnergyPulse({ points, color }: { points: [number, number, number][]; color: string }) {
  const pulseRef = useRef<Group>(null);

  useFrame((state) => {
    if (!pulseRef.current) return;

    const time = state.clock.getElapsedTime();
    const progress = (time * 0.5) % 1;
    const pathIndex = Math.floor(progress * (points.length - 1));
    
    if (pathIndex < points.length) {
      const pos = points[pathIndex];
      pulseRef.current.position.set(pos[0], pos[1], pos[2]);
    }
  });

  return (
    <group ref={pulseRef}>
      <Sphere args={[0.15, 16, 16]}>
        <meshStandardMaterial
          color="#FFFFFF"
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.8}
        />
      </Sphere>
    </group>
  );
}
