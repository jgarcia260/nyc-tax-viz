'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface CameraShakeProps {
  intensity?: number;
  duration?: number;
  decay?: number;
}

/**
 * Camera shake effect for dramatic moments
 * Triggered when large improvements spawn
 */
export function useCameraShake() {
  const { camera } = useThree();
  const shakeIntensityRef = useRef(0);
  const originalPositionRef = useRef(new Vector3());
  const isShakingRef = useRef(false);

  useFrame((state) => {
    if (shakeIntensityRef.current > 0) {
      const shake = shakeIntensityRef.current;
      
      if (!isShakingRef.current) {
        originalPositionRef.current.copy(camera.position);
        isShakingRef.current = true;
      }

      // Random shake offset
      camera.position.x = originalPositionRef.current.x + (Math.random() - 0.5) * shake;
      camera.position.y = originalPositionRef.current.y + (Math.random() - 0.5) * shake;
      camera.position.z = originalPositionRef.current.z + (Math.random() - 0.5) * shake;

      // Decay
      shakeIntensityRef.current *= 0.92;

      if (shakeIntensityRef.current < 0.001) {
        shakeIntensityRef.current = 0;
        camera.position.copy(originalPositionRef.current);
        isShakingRef.current = false;
      }
    }
  });

  const shake = (intensity: number = 0.1) => {
    shakeIntensityRef.current = intensity;
  };

  return { shake };
}

/**
 * Component version that auto-shakes on mount
 */
export function CameraShake({ intensity = 0.1, duration = 0.5, decay = 0.92 }: CameraShakeProps) {
  const { shake } = useCameraShake();

  useEffect(() => {
    shake(intensity);
  }, [intensity, shake]);

  return null;
}
