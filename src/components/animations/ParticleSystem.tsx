'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleSystemProps {
  position: [number, number, number];
  count?: number;
  color?: string;
  size?: number;
  lifetime?: number;
  spread?: number;
  velocity?: number;
  type?: 'dust' | 'sparkle' | 'smoke' | 'glow';
}

/**
 * Advanced particle system with custom shaders
 * Used for: Dust clouds, sparkles, construction effects, magic trails
 */
export function ParticleSystem({
  position,
  count = 100,
  color = '#ffffff',
  size = 0.05,
  lifetime = 2,
  spread = 1,
  velocity = 1,
  type = 'dust'
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const startTimeRef = useRef(Date.now());

  // Custom shader for particles
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uSize: { value: size },
        uOpacity: { value: 1.0 }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uSize;
        
        attribute float aLifetime;
        attribute vec3 aVelocity;
        attribute float aDelay;
        
        varying float vAlpha;
        
        void main() {
          float age = max(0.0, uTime - aDelay);
          float lifeProgress = age / aLifetime;
          
          // Fade out at end of lifetime
          vAlpha = 1.0 - smoothstep(0.7, 1.0, lifeProgress);
          
          // Move particles based on velocity
          vec3 pos = position + aVelocity * age;
          
          // Add gravity for dust
          pos.y -= 0.5 * age * age * 0.5;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          
          // Size decreases over time
          gl_PointSize = uSize * (300.0 / -mvPosition.z) * (1.0 - lifeProgress * 0.5);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        
        varying float vAlpha;
        
        void main() {
          // Circular particle shape
          vec2 center = gl_PointCoord - vec2(0.5);
          float dist = length(center);
          
          if (dist > 0.5) discard;
          
          // Soft edges
          float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
          alpha *= vAlpha * uOpacity;
          
          // Glow effect for sparkles
          ${type === 'sparkle' ? 'alpha *= 1.5;' : ''}
          
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }, [color, size, type]);

  // Generate particle attributes
  const particleAttributes = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);
    const delays = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Random starting positions within spread
      positions[i3] = (Math.random() - 0.5) * spread;
      positions[i3 + 1] = Math.random() * spread * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * spread;

      // Random velocities
      const angle = Math.random() * Math.PI * 2;
      const speed = velocity * (0.5 + Math.random() * 0.5);
      
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = Math.random() * speed * 2; // Upward bias
      velocities[i3 + 2] = Math.sin(angle) * speed;

      // Randomize lifetime and delay
      lifetimes[i] = lifetime * (0.8 + Math.random() * 0.4);
      delays[i] = Math.random() * 0.5;
    }

    return { positions, velocities, lifetimes, delays };
  }, [count, spread, velocity, lifetime]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    shaderMaterial.uniforms.uTime.value = elapsed;

    // Fade out entire system after lifetime
    if (elapsed > lifetime + 1) {
      shaderMaterial.uniforms.uOpacity.value = Math.max(
        0,
        1 - (elapsed - lifetime - 1)
      );
    }
  });

  return (
    <points ref={pointsRef} position={position} material={shaderMaterial}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particleAttributes.positions}
          itemSize={3}
          args={[particleAttributes.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aVelocity"
          count={count}
          array={particleAttributes.velocities}
          itemSize={3}
          args={[particleAttributes.velocities, 3]}
        />
        <bufferAttribute
          attach="attributes-aLifetime"
          count={count}
          array={particleAttributes.lifetimes}
          itemSize={1}
          args={[particleAttributes.lifetimes, 1]}
        />
        <bufferAttribute
          attach="attributes-aDelay"
          count={count}
          array={particleAttributes.delays}
          itemSize={1}
          args={[particleAttributes.delays, 1]}
        />
      </bufferGeometry>
    </points>
  );
}
