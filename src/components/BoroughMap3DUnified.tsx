"use client";

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Html,
  Stars,
  Sparkles,
  ContactShadows,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  SSAO,
  ChromaticAberration,
  Vignette,
  ToneMapping,
  DepthOfField,
  N8AO,
} from '@react-three/postprocessing';
import { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { parseBoroughGeoJSON, BOROUGH_INFO, BoroughData } from '@/lib/boroughData';

const NYC_CENTER_LNG = -73.978;
const NYC_CENTER_LAT = 40.706;
const COORDINATE_SCALE = 400;

function projectCoordinate(lat: number, lng: number): { x: number; y: number } {
  const x = (lng - NYC_CENTER_LNG) * COORDINATE_SCALE;
  const y = (lat - NYC_CENTER_LAT) * COORDINATE_SCALE;
  return { x, y };
}

const BUILDING_SCALE_MULTIPLIER = 0.9;

const BOROUGH_HEIGHT_MULTIPLIER: Record<string, number> = {
  'Manhattan': 1.0,
  'Brooklyn': 0.7,
  'Queens': 0.7,
  'Bronx': 0.6,
  'Staten Island': 0.5,
};

const BOROUGH_BUILDING_CONFIG: Record<string, {
  count: number;
  minHeight: number;
  maxHeight: number;
  minWidth: number;
  maxWidth: number;
  clusterFactor: number;
}> = {
  'Manhattan':      { count: 220, minHeight: 4 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Manhattan'],   maxHeight: 28 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Manhattan'],  minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.7 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.7 },
  'Brooklyn':       { count: 150, minHeight: 1 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Brooklyn'],   maxHeight: 8 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Brooklyn'],   minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.6 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.4 },
  'Queens':         { count: 100, minHeight: 0.5 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Queens'], maxHeight: 4 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Queens'],   minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.5 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.2 },
  'Bronx':          { count: 110, minHeight: 1 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Bronx'],   maxHeight: 6 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Bronx'],   minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.55 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.3 },
  'Staten Island':  { count: 50,  minHeight: 0.3 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Staten Island'], maxHeight: 2.5 * BUILDING_SCALE_MULTIPLIER * BOROUGH_HEIGHT_MULTIPLIER['Staten Island'], minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.45 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.1 },
};

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pointInPolygon(x: number, y: number, polygon: number[][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

interface BuildingInstance {
  x: number;
  y: number;
  width: number;
  depth: number;
  height: number;
}

function generateBuildings(name: string, coordinates: number[][][][]): BuildingInstance[] {
  const config = BOROUGH_BUILDING_CONFIG[name];
  if (!config) return [];

  const outerRings: number[][][] = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let centerX = 0, centerY = 0, pointCount = 0;

  coordinates.forEach((polygon) => {
    if (!polygon || !polygon[0]) return;
    const ring = polygon[0].map((pt: number[]) => {
      const { x, y } = projectCoordinate(pt[1], pt[0]);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      centerX += x; centerY += y; pointCount++;
      return [x, y];
    });
    outerRings.push(ring);
  });

  if (outerRings.length === 0 || pointCount === 0) return [];
  centerX /= pointCount;
  centerY /= pointCount;

  const rand = seededRandom(name.charCodeAt(0) * 1000 + name.length * 31);
  const buildings: BuildingInstance[] = [];
  let attempts = 0;
  const maxAttempts = config.count * 20;

  while (buildings.length < config.count && attempts < maxAttempts) {
    attempts++;
    let x: number, y: number;

    if (rand() < config.clusterFactor) {
      const spread = 0.4;
      x = centerX + (rand() - 0.5) * (maxX - minX) * spread;
      y = centerY + (rand() - 0.5) * (maxY - minY) * spread;
    } else {
      x = minX + rand() * (maxX - minX);
      y = minY + rand() * (maxY - minY);
    }

    const inside = outerRings.some(ring => pointInPolygon(x, y, ring));
    if (!inside) continue;

    const dx = x - centerX, dy = y - centerY;
    const maxDist = Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5;
    const distRatio = Math.min(1, Math.sqrt(dx * dx + dy * dy) / maxDist);
    const centralBoost = 1 - distRatio * config.clusterFactor;

    const heightRange = config.maxHeight - config.minHeight;
    const height = config.minHeight + rand() * heightRange * centralBoost;
    const widthRange = config.maxWidth - config.minWidth;
    const width = config.minWidth + rand() * widthRange;
    const depth = config.minWidth + rand() * widthRange;

    buildings.push({ x, y, width, depth, height });
  }

  return buildings;
}

const BOROUGH_TAX_DATA: Record<string, { revenue: number; billionaireTaxShare: number; corporateTaxShare: number }> = {
  'Manhattan': { revenue: 8000000000, billionaireTaxShare: 0.6, corporateTaxShare: 0.5 },
  'Brooklyn': { revenue: 3500000000, billionaireTaxShare: 0.15, corporateTaxShare: 0.2 },
  'Queens': { revenue: 2800000000, billionaireTaxShare: 0.1, corporateTaxShare: 0.15 },
  'Bronx': { revenue: 1200000000, billionaireTaxShare: 0.05, corporateTaxShare: 0.08 },
  'Staten Island': { revenue: 800000000, billionaireTaxShare: 0.1, corporateTaxShare: 0.07 }
};

const BOROUGH_COLORS: Record<string, { base: string; emissive: string; glow: string }> = {
  'Manhattan': { base: '#0066FF', emissive: '#3385FF', glow: '#66A3FF' },
  'Brooklyn': { base: '#FF6B35', emissive: '#FF8A5C', glow: '#FFA982' },
  'Queens': { base: '#FFD700', emissive: '#FFE033', glow: '#FFEA66' },
  'Bronx': { base: '#50C878', emissive: '#70D88F', glow: '#90E7A6' },
  'Staten Island': { base: '#9B59B6', emissive: '#AE7AC7', glow: '#C19AD7' },
};

// Enhanced atmosphere with volumetric fog
function VolumetricAtmosphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      uniforms: {
        time: { value: 0 },
        fogColor: { value: new THREE.Color('#1e2847') },
        fogDensity: { value: 0.008 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 fogColor;
        uniform float fogDensity;
        
        varying vec3 vWorldPosition;
        varying vec3 vViewPosition;
        
        float noise(vec3 p) {
          return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
        }
        
        void main() {
          float distance = length(vViewPosition);
          
          // Layered fog with movement
          float fogFactor = 1.0 - exp(-distance * fogDensity);
          
          // Add subtle movement
          vec3 pos = vWorldPosition * 0.01;
          float n = noise(pos + vec3(time * 0.05));
          fogFactor *= (0.8 + n * 0.2);
          
          // Height-based density (more fog at ground level)
          float heightFactor = smoothstep(-10.0, 50.0, vWorldPosition.y);
          fogFactor *= (1.0 - heightFactor * 0.5);
          
          gl_FragColor = vec4(fogColor, fogFactor * 0.3);
        }
      `,
    });
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 25, 0]}>
      <sphereGeometry args={[400, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// Rim light component for enhanced lighting
function RimLighting() {
  return (
    <>
      {/* Key rim lights from different angles for depth */}
      <directionalLight 
        position={[150, 80, 100]} 
        intensity={0.4} 
        color="#88ccff" 
      />
      <directionalLight 
        position={[-150, 60, -100]} 
        intensity={0.3} 
        color="#ff8844" 
      />
      <directionalLight 
        position={[0, 100, -150]} 
        intensity={0.25} 
        color="#cc88ff" 
      />
    </>
  );
}

interface BoroughProps {
  name: string;
  coordinates: number[][][][];
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  animationDelay: number;
}

function Borough({ name, coordinates, isHovered, isSelected, onClick, onHover, animationDelay }: BoroughProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (groupRef.current) {
      gsap.from(groupRef.current.position, { y: -50, duration: 1.5, delay: animationDelay, ease: 'elastic.out(1, 0.5)', onComplete: () => setMounted(true) });
      gsap.from(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 1.5, delay: animationDelay, ease: 'back.out(1.7)' });
    }
  }, [animationDelay]);

  useEffect(() => {
    if (groupRef.current && mounted) {
      gsap.to(groupRef.current.position, { z: isSelected ? 5 : 0, duration: 0.6, ease: 'power2.out' });
    }
  }, [isSelected, mounted]);

  useEffect(() => {
    if (groupRef.current && mounted) {
      gsap.to(groupRef.current.scale, { x: isHovered ? 1.02 : 1, y: isHovered ? 1.02 : 1, z: isHovered ? 1.05 : 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [isHovered, mounted]);

  useFrame((state) => {
    if (groupRef.current && mounted) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2 + animationDelay) * 0.002;
    }
  });

  const geometry = useMemo(() => {
    if (!coordinates || coordinates.length === 0) return new THREE.BoxGeometry(1, 1, 1);

    const shapes: THREE.Shape[] = [];
    coordinates.forEach((polygon) => {
      if (!polygon || polygon.length === 0) return;
      const outerRing = polygon[0];
      if (!outerRing || outerRing.length === 0) return;

      const shape = new THREE.Shape();
      outerRing.forEach((point: any, idx: number) => {
        if (!point || point.length < 2) return;
        const { x, y } = projectCoordinate(point[1], point[0]);
        if (idx === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
      });

      for (let ringIdx = 1; ringIdx < polygon.length; ringIdx++) {
        const holeRing = polygon[ringIdx];
        if (!holeRing || holeRing.length === 0) continue;
        const holePath = new THREE.Path();
        holeRing.forEach((point: any, idx: number) => {
          if (!point || point.length < 2) return;
          const { x, y } = projectCoordinate(point[1], point[0]);
          if (idx === 0) holePath.moveTo(x, y);
          else holePath.lineTo(x, y);
        });
        shape.holes.push(holePath);
      }

      if (shape.curves.length > 0) shapes.push(shape);
    });

    if (shapes.length === 0) return new THREE.BoxGeometry(1, 1, 1);

    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 2, 
      bevelEnabled: true, 
      bevelThickness: 0.3, 
      bevelSize: 0.2, 
      bevelSegments: 5, 
      curveSegments: 32,
    });
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, [coordinates, name]);

  const colors = BOROUGH_COLORS[name] || BOROUGH_COLORS['Manhattan'];

  return (
    <group ref={groupRef}>
      <mesh 
        ref={meshRef} 
        geometry={geometry} 
        onClick={onClick} 
        onPointerOver={() => onHover(true)} 
        onPointerOut={() => onHover(false)} 
        castShadow 
        receiveShadow
      >
        {/* Enhanced material with better reflections and glass-like appearance */}
        <meshPhysicalMaterial 
          color={colors.base}
          emissive={colors.emissive}
          emissiveIntensity={isHovered ? 0.9 : isSelected ? 0.7 : 0.4}
          metalness={isHovered ? 0.7 : 0.6}
          roughness={0.3}
          envMapIntensity={2.0}
          clearcoat={0.5}
          clearcoatRoughness={0.2}
          transparent={isHovered}
          opacity={isHovered ? 0.95 : 1.0}
          reflectivity={0.8}
        />
      </mesh>
      <BoroughBuildings name={name} coordinates={coordinates} />
      {isHovered && <Sparkles count={50} scale={[50, 50, 10]} size={2} speed={0.4} color={colors.glow} />}
    </group>
  );
}

function BoroughBuildings({ name, coordinates }: { name: string; coordinates: number[][][][] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const buildings = useMemo(() => generateBuildings(name, coordinates), [name, coordinates]);
  const colors = BOROUGH_COLORS[name] || BOROUGH_COLORS['Manhattan'];
  const config = BOROUGH_BUILDING_CONFIG[name];

  useEffect(() => {
    if (!meshRef.current || buildings.length === 0) return;
    const dummy = new THREE.Object3D();
    const base = new THREE.Color(colors.base);
    const emissive = new THREE.Color(colors.emissive);

    buildings.forEach((b, i) => {
      dummy.position.set(b.x, 2 + b.height / 2, -b.y);
      dummy.scale.set(b.width, b.height, b.depth);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      const t = config ? (b.height - config.minHeight) / (config.maxHeight - config.minHeight) : 0.5;
      const c = base.clone().lerp(emissive, t * 0.5);
      c.multiplyScalar(0.7 + t * 0.3);
      meshRef.current!.setColorAt(i, c);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [buildings, colors, config, name]);

  // Animate emissive for window effect
  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
    if (material.emissiveIntensity !== undefined) {
      material.emissiveIntensity = 0.08 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  if (buildings.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      {/* Enhanced building material with metallic and glass-like properties */}
      <meshPhysicalMaterial 
        metalness={0.7}
        roughness={0.25}
        envMapIntensity={1.8}
        emissive={colors.base}
        emissiveIntensity={0.08}
        clearcoat={0.3}
        clearcoatRoughness={0.4}
        reflectivity={0.7}
      />
    </instancedMesh>
  );
}

function Scene({ boroughs, showTaxData = true, autoRotate = true }: { boroughs: BoroughData[]; showTaxData?: boolean; autoRotate?: boolean }) {
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);

  return (
    <>
      {/* Enhanced background with gradient */}
      <color attach="background" args={['#0a0f1a']} />
      
      {/* Ground plane with enhanced material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshPhysicalMaterial 
          color="#0f1419"
          roughness={0.9}
          metalness={0.2}
          envMapIntensity={0.4}
          emissive="#0a0e14"
          emissiveIntensity={0.15}
          clearcoat={0.1}
          clearcoatRoughness={0.8}
        />
      </mesh>
      
      {/* Enhanced grid with glow */}
      <gridHelper args={[400, 40, '#3366aa', '#1e293b']} position={[0, -0.4, 0]} />
      
      {/* Contact shadows for better ground interaction */}
      <ContactShadows 
        position={[0, -0.45, 0]} 
        opacity={0.6} 
        scale={200} 
        blur={2.5} 
        far={50} 
        resolution={512}
        color="#000022"
      />

      <PerspectiveCamera makeDefault position={[120, 140, 120]} fov={60} />
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate 
        enableDamping 
        dampingFactor={0.15} 
        minDistance={40} 
        maxDistance={300} 
        maxPolarAngle={Math.PI / 1.1} 
        minPolarAngle={Math.PI / 8} 
        rotateSpeed={0.6} 
        zoomSpeed={1.0} 
        panSpeed={0.6} 
        autoRotate={autoRotate} 
        autoRotateSpeed={0.5} 
      />

      {/* Enhanced lighting setup */}
      <ambientLight intensity={0.5} color="#4a5b7a" />
      
      {/* Main directional lights with enhanced shadows */}
      <directionalLight 
        position={[100, 120, 80]} 
        intensity={2.2} 
        color="#ffe8c5" 
        castShadow 
        shadow-mapSize-width={4096} 
        shadow-mapSize-height={4096} 
        shadow-camera-left={-200} 
        shadow-camera-right={200} 
        shadow-camera-top={200} 
        shadow-camera-bottom={-200} 
        shadow-camera-near={0.5} 
        shadow-camera-far={500} 
        shadow-bias={-0.0001}
        shadow-radius={3}
      />
      
      <directionalLight 
        position={[80, 100, -60]} 
        intensity={1.0} 
        color="#ffd8b3" 
        castShadow 
        shadow-mapSize-width={2048} 
        shadow-mapSize-height={2048} 
        shadow-camera-left={-150} 
        shadow-camera-right={150} 
        shadow-camera-top={150} 
        shadow-camera-bottom={-150} 
        shadow-bias={-0.0001}
      />
      
      {/* Fill lights for better atmosphere */}
      <directionalLight position={[-50, 60, -40]} intensity={0.7} color="#7da3cc" />
      <directionalLight position={[-30, 30, 50]} intensity={0.5} color="#c4b5fd" />
      <directionalLight position={[0, -10, 0]} intensity={0.3} color="#a78bfa" />
      
      {/* Enhanced hemisphere light */}
      <hemisphereLight intensity={0.8} color="#b8d4ff" groundColor="#2b3252" />
      
      {/* Rim lighting for depth */}
      <RimLighting />

      {/* Enhanced environment */}
      <Environment preset="city" background={false} environmentIntensity={1.5} />
      
      {/* Volumetric atmosphere */}
      <VolumetricAtmosphere />
      
      {/* Enhanced fog */}
      <fog attach="fog" args={["#1a2035", 100, 380]} />
      
      {/* Enhanced stars */}
      <Stars 
        radius={320} 
        depth={70} 
        count={4000} 
        factor={6.5} 
        saturation={0.6} 
        fade 
        speed={0.6} 
      />

      {boroughs.map((borough, index) => (
        <Borough
          key={borough.name} 
          name={borough.name} 
          coordinates={borough.coordinates}
          isHovered={hoveredBorough === borough.name} 
          isSelected={selectedBorough === borough.name}
          onClick={() => setSelectedBorough(selectedBorough === borough.name ? null : borough.name)}
          onHover={(hovered) => setHoveredBorough(hovered ? borough.name : null)}
          animationDelay={index * 0.2}
        />
      ))}

      {(hoveredBorough || selectedBorough) && (() => {
        const borough = hoveredBorough || selectedBorough || '';
        const taxData = BOROUGH_TAX_DATA[borough];
        const boroughInfo = BOROUGH_INFO[borough];
        const bColors = BOROUGH_COLORS[borough];
        return (
          <Html position={[0, 40, 0]} center>
            <div className="bg-white rounded-lg shadow-lg px-6 py-4 border border-gray-200 max-w-sm pointer-events-none">
              <h3 className="text-2xl font-bold mb-3" style={{ color: bColors?.base || '#000' }}>{borough}</h3>
              {showTaxData && taxData && (
                <div className="mb-3">
                  <p className="text-3xl font-bold text-gray-900">${(taxData.revenue / 1000000000).toFixed(2)}B</p>
                  <p className="text-sm text-gray-500 mt-1">Tax Revenue Potential</p>
                </div>
              )}
              {showTaxData && taxData && (
                <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Billionaire Tax</p>
                    <p className="text-lg font-semibold text-gray-900">{(taxData.billionaireTaxShare * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Corporate Tax</p>
                    <p className="text-lg font-semibold text-gray-900">{(taxData.corporateTaxShare * 100).toFixed(0)}%</p>
                  </div>
                </div>
              )}
              {boroughInfo && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Population</p>
                    <p className="font-semibold text-gray-900">{(boroughInfo.population / 1000000).toFixed(2)}M</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Area</p>
                    <p className="font-semibold text-gray-900">{boroughInfo.area} mi²</p>
                  </div>
                </div>
              )}
            </div>
          </Html>
        );
      })()}

      {/* Enhanced post-processing */}
      <EffectComposer multisampling={8}>
        {/* N8AO for better ambient occlusion */}
        <N8AO 
          aoRadius={0.5}
          intensity={2.5}
          quality="performance"
          halfRes
        />
        
        {/* Enhanced bloom for glow effects */}
        <Bloom 
          intensity={0.8} 
          luminanceThreshold={0.25} 
          luminanceSmoothing={0.8} 
          mipmapBlur 
        />
        
        {/* Subtle depth of field for atmospheric depth */}
        <DepthOfField 
          focusDistance={0.015}
          focalLength={0.08}
          bokehScale={3}
          height={480}
        />
        
        {/* Enhanced vignette */}
        <Vignette offset={0.25} darkness={0.6} eskil={false} />
        
        {/* Tone mapping for better HDR */}
        <ToneMapping 
          adaptive 
          resolution={256} 
          middleGrey={0.55} 
          maxLuminance={18.0} 
          averageLuminance={1.2} 
          adaptationRate={1.8} 
        />
        
        {/* Subtle chromatic aberration */}
        <ChromaticAberration offset={[0.001, 0.001]} />
      </EffectComposer>
    </>
  );
}

function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white animate-pulse">Loading NYC 3D Map</h2>
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-3 h-3 rounded-full bg-blue-500" style={{ animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export interface BoroughMap3DUnifiedProps {
  showTaxData?: boolean;
  title?: string;
  description?: string;
}

export default function BoroughMap3DUnified({
  showTaxData = true,
  title = "NYC Tax Revenue by Borough",
  description = "Building heights represent tax revenue potential. Click a borough for details."
}: BoroughMap3DUnifiedProps) {
  const [boroughs, setBoroughs] = useState<BoroughData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    async function loadBoroughData() {
      try {
        const response = await fetch('/borough-boundaries.geojson');
        if (!response.ok) throw new Error(`Failed to load borough data: ${response.status}`);
        const geojson = await response.json();
        const parsed = parseBoroughGeoJSON(geojson);
        if (parsed.length === 0) throw new Error('No borough data parsed from GeoJSON');
        setBoroughs(parsed);
        setTimeout(() => setLoading(false), 500);
      } catch (err) {
        console.error('Error loading borough data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    loadBoroughData();
  }, []);

  if (loading) return <LoadingScreen />;
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950">
        <div className="text-red-400 text-xl font-bold">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10 space-y-3 max-w-xs">
        <div className="bg-black/70 backdrop-blur-xl p-5 rounded-2xl border border-white/15">
          <h1 className="text-2xl font-bold mb-1 text-white">{title}</h1>
          <p className="text-xs text-zinc-400 mb-4">{description}</p>
          <div className="space-y-1.5">
            {Object.entries(BOROUGH_COLORS).map(([name, colors]) => {
              const taxData = BOROUGH_TAX_DATA[name];
              return (
                <div key={name} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: colors.base, boxShadow: `0 0 8px ${colors.glow}` }} />
                    <span className="text-xs font-medium text-white">{name}</span>
                  </div>
                  {showTaxData && taxData && (
                    <span className="text-xs font-semibold text-emerald-400">${(taxData.revenue / 1000000000).toFixed(1)}B</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="bg-black/70 backdrop-blur-xl p-4 rounded-2xl border border-white/15">
          <div className="text-xs text-zinc-400 mb-3">
            <p>Drag to rotate &middot; Scroll to zoom &middot; Click for details</p>
          </div>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`w-full px-3 py-2 rounded-lg font-medium text-xs transition-all ${autoRotate ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          </button>
        </div>
      </div>

      <Canvas 
        shadows="soft"
        gl={{ 
          antialias: true, 
          alpha: false, 
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }} 
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene boroughs={boroughs} showTaxData={showTaxData} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  );
}
