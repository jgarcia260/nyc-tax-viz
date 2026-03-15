'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Sphere } from '@react-three/drei';
import { Vector3 } from 'three';

interface SubwayLineProps {
  points: [number, number, number][];
  color?: string;
  delay?: number;
  onComplete?: () => void;
}

/**
 * Animated subway line that draws across the map
 * Includes stations that appear along the path
 */
export function SubwayLine({
  points,
  color = '#FF6B35',
  delay = 0,
  onComplete
}: SubwayLineProps) {
  const progressRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const linePointsRef = useRef<Vector3[]>([]);

  // Convert points to Vector3 for Line component
  const fullPath = useMemo(() => 
    points.map(p => new Vector3(p[0], p[1], p[2])),
    [points]
  );

  // Station positions (evenly distributed along path)
  const stationIndices = useMemo(() => {
    const numStations = Math.max(2, Math.floor(points.length / 3));
    return Array.from({ length: numStations }, (_, i) => 
      Math.floor((points.length - 1) * i / (numStations - 1))
    );
  }, [points]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    
    if (startTimeRef.current === null) {
      startTimeRef.current = elapsed;
    }

    const timeSinceStart = elapsed - startTimeRef.current - delay;

    if (timeSinceStart < 0) {
      linePointsRef.current = [];
      return;
    }

    // Animation duration: 2 seconds
    const duration = 2;
    progressRef.current = Math.min(timeSinceStart / duration, 1);

    // Ease-in-out for smooth acceleration and deceleration
    const eased = progressRef.current < 0.5
      ? 2 * progressRef.current * progressRef.current
      : 1 - Math.pow(-2 * progressRef.current + 2, 2) / 2;

    // Update visible portion of the line
    const pointsToShow = Math.floor(eased * fullPath.length);
    linePointsRef.current = fullPath.slice(0, pointsToShow);

    // Call onComplete once
    if (progressRef.current >= 1 && !completedRef.current) {
      completedRef.current = true;
      onComplete?.();
    }
  });

  const currentProgress = progressRef.current;

  return (
    <group>
      {/* Animated line */}
      {linePointsRef.current.length > 1 && (
        <Line
          points={linePointsRef.current}
          color={color}
          lineWidth={3}
        />
      )}
      
      {/* Stations appear as line passes */}
      {stationIndices.map((idx, i) => {
        const stationProgress = idx / (points.length - 1);
        const isVisible = currentProgress > stationProgress;
        const point = points[idx];
        
        if (!isVisible) return null;

        // Pop-in animation for stations
        const timeSinceVisible = (currentProgress - stationProgress) * 2;
        const scale = Math.min(timeSinceVisible * 3, 1);

        return (
          <Sphere
            key={i}
            args={[0.15, 16, 16]}
            position={point}
            scale={scale}
          >
            <meshStandardMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
            />
          </Sphere>
        );
      })}
    </group>
  );
}
