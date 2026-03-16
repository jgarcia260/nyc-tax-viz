"use client";

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const NYC_CENTER_LNG = -73.978;
const NYC_CENTER_LAT = 40.706;
const COORDINATE_SCALE = 400;

function projectCoordinate(lat: number, lng: number): { x: number; y: number } {
  const x = (lng - NYC_CENTER_LNG) * COORDINATE_SCALE;
  const y = (lat - NYC_CENTER_LAT) * COORDINATE_SCALE;
  return { x, y };
}

interface Landmark {
  name: string;
  lat: number;
  lng: number;
  color: string;
  height: number;
  shape: 'tower' | 'sphere' | 'statue';
}

const LANDMARKS: Landmark[] = [
  {
    name: 'Empire State Building',
    lat: 40.7484,
    lng: -73.9857,
    color: '#FFD700',
    height: 8,
    shape: 'tower',
  },
  {
    name: 'Unisphere',
    lat: 40.7478,
    lng: -73.8458,
    color: '#C0C0C0',
    height: 4,
    shape: 'sphere',
  },
  {
    name: 'Statue of Liberty',
    lat: 40.6892,
    lng: -74.0445,
    color: '#87CEEB',
    height: 5,
    shape: 'statue',
  },
];

function LandmarkIcon({ landmark }: { landmark: Landmark }) {
  const meshRef = useRef<THREE.Group>(null);
  const { x, y } = projectCoordinate(landmark.lat, landmark.lng);

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = landmark.height + 1.5 + Math.sin(state.clock.elapsedTime + x) * 0.15;
    }
  });

  return (
    <group ref={meshRef} position={[x, landmark.height + 1.5, -y]}>
      {/* Main landmark shape */}
      {landmark.shape === 'tower' && (
        <group>
          {/* Simple tower - tapered box */}
          <mesh castShadow>
            <cylinderGeometry args={[0.3, 0.5, landmark.height, 4]} />
            <meshPhysicalMaterial
              color={landmark.color}
              emissive={landmark.color}
              emissiveIntensity={0.4}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
          {/* Top spire */}
          <mesh position={[0, landmark.height / 2 + 0.3, 0]} castShadow>
            <coneGeometry args={[0.2, 0.8, 4]} />
            <meshPhysicalMaterial
              color={landmark.color}
              emissive={landmark.color}
              emissiveIntensity={0.5}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}

      {landmark.shape === 'sphere' && (
        <group>
          {/* Unisphere - globe with rings */}
          <mesh castShadow>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshPhysicalMaterial
              color={landmark.color}
              emissive={landmark.color}
              emissiveIntensity={0.3}
              metalness={0.7}
              roughness={0.2}
              wireframe
            />
          </mesh>
          {/* Ring around globe */}
          <mesh rotation={[Math.PI / 6, 0, 0]} castShadow>
            <torusGeometry args={[1, 0.08, 8, 16]} />
            <meshPhysicalMaterial
              color={landmark.color}
              emissive={landmark.color}
              emissiveIntensity={0.4}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>
      )}

      {landmark.shape === 'statue' && (
        <group>
          {/* Pedestal */}
          <mesh position={[0, -landmark.height / 4, 0]} castShadow>
            <boxGeometry args={[0.6, landmark.height / 2, 0.6]} />
            <meshPhysicalMaterial
              color="#8B7355"
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
          {/* Statue body - simple cone */}
          <mesh position={[0, landmark.height / 4, 0]} castShadow>
            <coneGeometry args={[0.35, landmark.height / 2, 6]} />
            <meshPhysicalMaterial
              color={landmark.color}
              emissive={landmark.color}
              emissiveIntensity={0.3}
              metalness={0.4}
              roughness={0.5}
            />
          </mesh>
          {/* Torch/Crown - small sphere on top */}
          <mesh position={[0.2, landmark.height / 2 + 0.3, 0]} castShadow>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshPhysicalMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.8}
              metalness={0.5}
              roughness={0.3}
            />
          </mesh>
        </group>
      )}

      {/* Glow effect at base */}
      <mesh position={[0, -landmark.height / 2 - 0.5, 0]}>
        <circleGeometry args={[1.2, 16]} />
        <meshBasicMaterial
          color={landmark.color}
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

export default function Landmarks() {
  return (
    <group>
      {LANDMARKS.map((landmark) => (
        <LandmarkIcon key={landmark.name} landmark={landmark} />
      ))}
    </group>
  );
}
