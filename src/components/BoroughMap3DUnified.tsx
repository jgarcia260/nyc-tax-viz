"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  PerspectiveCamera,
  Environment,
  Html,
  Stars,
  Sparkles,
} from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  SSAO,
  ChromaticAberration,
  Vignette,
  ToneMapping
} from '@react-three/postprocessing';
import { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { parseBoroughGeoJSON, BOROUGH_INFO, BoroughData } from '@/lib/boroughData';

// ===== SHARED COORDINATE PROJECTION =====
// Single source of truth for coordinate transformation
const NYC_CENTER_LNG = -73.978;
const NYC_CENTER_LAT = 40.706;
const COORDINATE_SCALE = 400;

/**
 * Projects geographic coordinates (lat/lng) to 2D plane coordinates
 * Returns x (longitude offset) and y (latitude offset)
 * After 3D extrusion and rotation: x stays x, y becomes z, extrude becomes y
 */
function projectCoordinate(lat: number, lng: number): { x: number; y: number } {
  const x = (lng - NYC_CENTER_LNG) * COORDINATE_SCALE;
  const y = (lat - NYC_CENTER_LAT) * COORDINATE_SCALE;
  return { x, y };
}

// Building density configuration per borough
// FIX: Reduced overall height (0.6x) + borough-specific multipliers to show Manhattan as tallest
const BUILDING_SCALE_MULTIPLIER = 0.9;  // Reduced from 1.8 to 0.9 for subtle building emphasis

// Borough-specific height multipliers (Manhattan = tallest)
const BOROUGH_HEIGHT_MULTIPLIER: Record<string, number> = {
  'Manhattan': 1.0,      // Tallest
  'Brooklyn': 0.7,
  'Queens': 0.7,
  'Bronx': 0.6,
  'Staten Island': 0.5   // Shortest
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

// Seeded random for deterministic building placement
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Point-in-polygon test (ray casting)
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

function generateBuildings(
  name: string,
  coordinates: number[][][][],
): BuildingInstance[] {
  const config = BOROUGH_BUILDING_CONFIG[name];
  if (!config) return [];

  const outerRings: number[][][] = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let centerX = 0, centerY = 0, pointCount = 0;

  coordinates.forEach((polygon) => {
    if (!polygon || !polygon[0]) return;
    const ring = polygon[0].map((pt: number[]) => {
      // Use shared projection function
      const { x, y } = projectCoordinate(pt[1], pt[0]); // pt[0]=lng, pt[1]=lat
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

// Tax revenue data per borough (optional overlay)
const BOROUGH_TAX_DATA: Record<string, { revenue: number; billionaireTaxShare: number; corporateTaxShare: number }> = {
  'Manhattan': { revenue: 8000000000, billionaireTaxShare: 0.6, corporateTaxShare: 0.5 },
  'Brooklyn': { revenue: 3500000000, billionaireTaxShare: 0.15, corporateTaxShare: 0.2 },
  'Queens': { revenue: 2800000000, billionaireTaxShare: 0.1, corporateTaxShare: 0.15 },
  'Bronx': { revenue: 1200000000, billionaireTaxShare: 0.05, corporateTaxShare: 0.08 },
  'Staten Island': { revenue: 800000000, billionaireTaxShare: 0.1, corporateTaxShare: 0.07 }
};

// FIX: Use DISTINCT colors (not sequential blues) so boroughs are visually distinguishable
// Each borough gets a unique, vibrant color
const BOROUGH_COLORS: Record<string, { base: string; emissive: string; glow: string }> = {
  'Manhattan': { base: '#0066FF', emissive: '#3385FF', glow: '#66A3FF' },        // Bright Blue
  'Brooklyn': { base: '#FF6B35', emissive: '#FF8A5C', glow: '#FFA982' },         // Orange
  'Queens': { base: '#FFD700', emissive: '#FFE033', glow: '#FFEA66' },           // Gold/Yellow
  'Bronx': { base: '#50C878', emissive: '#70D88F', glow: '#90E7A6' },            // Green
  'Staten Island': { base: '#9B59B6', emissive: '#AE7AC7', glow: '#C19AD7' }     // Purple
};

// Custom shader for premium visual effects
const vertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  uniform float time;
  uniform float hover;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;

    // Subtle wave effect on hover
    vec3 pos = position;
    if (hover > 0.5) {
      pos.z += sin(position.x * 0.5 + time) * 0.05 * hover;
    }

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 baseColor;
  uniform vec3 emissiveColor;
  uniform float time;
  uniform float hover;
  uniform float selected;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;

  void main() {
    // Fresnel effect for rim lighting
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(vNormal, viewDirection), 3.0);

    // Pulsing glow effect
    float pulse = sin(time * 2.0) * 0.5 + 0.5;

    // Combine effects
    vec3 color = baseColor;
    color += emissiveColor * fresnel * 0.5;
    color += emissiveColor * hover * 0.3;
    color += emissiveColor * selected * pulse * 0.2;

    // Scanline effect - DISABLED (was causing green scan lines)
    // float scanline = sin(vUv.y * 50.0 + time * 5.0) * 0.05 + 0.95;
    // color *= scanline;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface BoroughProps {
  name: string;
  coordinates: number[][][][];
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  animationDelay: number;
  showTaxData?: boolean;
}

function Borough({
  name,
  coordinates,
  isHovered,
  isSelected,
  onClick,
  onHover,
  animationDelay,
  showTaxData = true
}: BoroughProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  // Entry animation
  useEffect(() => {
    if (groupRef.current) {
      gsap.from(groupRef.current.position, {
        y: -50,
        duration: 1.5,
        delay: animationDelay,
        ease: 'elastic.out(1, 0.5)',
        onComplete: () => setMounted(true)
      });

      gsap.from(groupRef.current.scale, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        delay: animationDelay,
        ease: 'back.out(1.7)'
      });
    }
  }, [animationDelay]);

  // Selection animation
  useEffect(() => {
    if (groupRef.current && mounted) {
      gsap.to(groupRef.current.position, {
        z: isSelected ? 5 : 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }, [isSelected, mounted]);

  // Hover animation
  useEffect(() => {
    if (groupRef.current && mounted) {
      gsap.to(groupRef.current.scale, {
        x: isHovered ? 1.02 : 1,
        y: isHovered ? 1.02 : 1,
        z: isHovered ? 1.05 : 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  }, [isHovered, mounted]);

  // Shader animation frame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.hover.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.hover.value,
        isHovered ? 1 : 0,
        0.1
      );
      materialRef.current.uniforms.selected.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.selected.value,
        isSelected ? 1 : 0,
        0.1
      );
    }

    // Gentle floating
    if (groupRef.current && mounted) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2 + animationDelay) * 0.002;
    }
  });

  const geometry = useMemo(() => {
    if (!coordinates || coordinates.length === 0) {
      console.error(`[Borough:${name}] No coordinates provided!`);
      return new THREE.BoxGeometry(1, 1, 1);
    }

    console.log(`[Borough:${name}] Creating geometry with ${coordinates.length} polygon(s)`);
    const shapes: THREE.Shape[] = [];

    coordinates.forEach((polygon, polyIndex) => {
      if (!polygon || polygon.length === 0) {
        console.warn(`[Borough:${name}] Empty polygon at index ${polyIndex}`);
        return;
      }

      console.log(`[Borough:${name}] Processing polygon ${polyIndex} with ${polygon.length} ring(s)`);

      const outerRing = polygon[0];
      if (!outerRing || outerRing.length === 0) {
        console.warn(`[Borough:${name}] No outer ring in polygon ${polyIndex}`);
        return;
      }

      console.log(`[Borough:${name}] Polygon ${polyIndex} outer ring has ${outerRing.length} points`);
      const shape = new THREE.Shape();

      outerRing.forEach((point: any, pointIndex: number) => {
        if (!point || point.length < 2) {
          console.warn(`[Borough:${name}] Invalid point at ${polyIndex}.${pointIndex}:`, point);
          return;
        }

        // Use shared projection function - point[0]=lng, point[1]=lat
        const { x, y } = projectCoordinate(point[1], point[0]);

        if (pointIndex === 0) {
          if (polyIndex === 0) {
            console.log(`[Borough:${name}] First point: [${point[0]}, ${point[1]}] -> [${x}, ${y}]`);
          }
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      });

      for (let ringIdx = 1; ringIdx < polygon.length; ringIdx++) {
        const holeRing = polygon[ringIdx];
        if (!holeRing || holeRing.length === 0) continue;

        const holePath = new THREE.Path();
        holeRing.forEach((point: any, pointIndex: number) => {
          if (!point || point.length < 2) return;

          // Use shared projection function
          const { x, y } = projectCoordinate(point[1], point[0]);

          if (pointIndex === 0) {
            holePath.moveTo(x, y);
          } else {
            holePath.lineTo(x, y);
          }
        });

        shape.holes.push(holePath);
        console.log(`[Borough:${name}] Polygon ${polyIndex} added hole ${ringIdx} with ${holeRing.length} points`);
      }

      if (shape.curves.length > 0) {
        shapes.push(shape);
        console.log(`[Borough:${name}] Added shape ${polyIndex} with ${shape.curves.length} curves and ${shape.holes.length} holes`);
      } else {
        console.warn(`[Borough:${name}] Polygon ${polyIndex} has no curves, skipping`);
      }
    });

    const extrudeSettings = {
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.2,
      bevelSegments: 5,
      curveSegments: 32  // FIX: Increase from 12 to 32 for smoother edges
    };

    if (shapes.length === 0) {
      console.error(`[Borough:${name}] No shapes created! Cannot create geometry.`);
      return new THREE.BoxGeometry(1, 1, 1);
    }

    const extrudedGeometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
    
    // FIX: Rotate geometry -90° around X-axis to lay flat on XZ plane
    // This maps: X→X (longitude), Y→Z (latitude), Z→Y (height)
    extrudedGeometry.rotateX(-Math.PI / 2);
    
    console.log(`[Borough:${name}] Created extruded geometry:`, {
      vertices: extrudedGeometry.attributes.position.count,
      boundingBox: extrudedGeometry.boundingBox
    });

    return extrudedGeometry;
  }, [coordinates, name]);

  const colors = BOROUGH_COLORS[name] || BOROUGH_COLORS['Manhattan'];

  // Debug logging for color application
  useEffect(() => {
    console.log(`[Borough:${name}] Applying colors:`, {
      base: colors.base,
      emissive: colors.emissive,
      glow: colors.glow
    });
  }, [name, colors]);

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
        {/* Enhanced material with better reflections and depth - VISUAL POLISH */}
        <meshStandardMaterial
          color={colors.base}
          emissive={colors.emissive}
          emissiveIntensity={isHovered ? 0.8 : isSelected ? 0.6 : 0.3}
          metalness={isHovered ? 0.6 : 0.5}
          roughness={0.4}
          envMapIntensity={1.5}
          flatShading={false}
          transparent={isHovered}
          opacity={isHovered ? 0.95 : 1.0}
        />
      </mesh>

      {/* FIX: Buildings are now children of the borough group - they rotate together! */}
      <BoroughBuildings name={name} coordinates={coordinates} />

      {isHovered && (
        <Sparkles
          count={50}
          scale={[50, 50, 10]}
          size={2}
          speed={0.4}
          color={colors.glow}
        />
      )}
    </group>
  );
}

// Procedural buildings rendered with InstancedMesh for performance
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

    console.log(`[BoroughBuildings:${name}] Positioning ${buildings.length} buildings`);

    buildings.forEach((b, i) => {
      // CRITICAL FIX: The parent borough's geometry is rotated -90° around X
      // This means the 2D shape (x,y) becomes (x,z) and extrude depth becomes y
      // Buildings must match: X = longitude, Y = height, Z = latitude
      // Borough extrusion depth is 2, so top surface is at y=2
      // Buildings sit ON the borough surface, base at y=2
      dummy.position.set(
        b.x,           // X: longitude (unchanged)
        2 + b.height / 2,  // Y: borough surface (2) + half building height
        -b.y           // Z: NEGATED latitude to fix mirroring (was y in 2D)
      );
      dummy.scale.set(b.width, b.height, b.depth);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      const t = config ? (b.height - config.minHeight) / (config.maxHeight - config.minHeight) : 0.5;
      const c = base.clone().lerp(emissive, t * 0.5);
      c.multiplyScalar(0.7 + t * 0.3);
      meshRef.current!.setColorAt(i, c);

      // Log first building with actual numeric values
      if (i === 0) {
        console.log(`[BoroughBuildings:${name}] First building:`, 
          `pos=(${b.x.toFixed(2)}, ${(b.height/2).toFixed(2)}, ${b.y.toFixed(2)})`,
          `scale=(${b.width.toFixed(2)}, ${b.height.toFixed(2)}, ${b.depth.toFixed(2)})`
        );
      }
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    
    console.log(`[BoroughBuildings:${name}] Completed positioning ${buildings.length} buildings`);
  }, [buildings, colors, config, name]);

  if (buildings.length === 0) return null;

  // VISUAL POLISH: Create separate instance groups for different material types
  const buildingsByType = useMemo(() => {
    const glass = [];      // Tallest buildings (top 20%)
    const metallic = [];   // Mid-rise buildings (20-60%)
    const concrete = [];   // Low-rise buildings (60-100%)
    
    const sortedByHeight = [...buildings].sort((a, b) => b.height - a.height);
    const tallThreshold = sortedByHeight[Math.floor(sortedByHeight.length * 0.2)]?.height || 10;
    const midThreshold = sortedByHeight[Math.floor(sortedByHeight.length * 0.6)]?.height || 5;
    
    buildings.forEach(b => {
      if (b.height >= tallThreshold) glass.push(b);
      else if (b.height >= midThreshold) metallic.push(b);
      else concrete.push(b);
    });
    
    return { glass, metallic, concrete };
  }, [buildings]);

  return (
    <group>
      {/* Glass buildings (tallest) - reflective, modern */}
      {buildingsByType.glass.length > 0 && (
        <BuildingInstances 
          buildings={buildingsByType.glass} 
          colors={colors}
          material="glass"
        />
      )}
      
      {/* Metallic buildings (mid-rise) - sleek, semi-reflective */}
      {buildingsByType.metallic.length > 0 && (
        <BuildingInstances 
          buildings={buildingsByType.metallic} 
          colors={colors}
          material="metallic"
        />
      )}
      
      {/* Concrete buildings (low-rise) - matte, traditional */}
      {buildingsByType.concrete.length > 0 && (
        <BuildingInstances 
          buildings={buildingsByType.concrete} 
          colors={colors}
          material="concrete"
        />
      )}
    </group>
  );
}

// Helper component for different material types
function BuildingInstances({ 
  buildings, 
  colors, 
  material 
}: { 
  buildings: BuildingInstance[]; 
  colors: any;
  material: 'glass' | 'metallic' | 'concrete';
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const config = BOROUGH_BUILDING_CONFIG[Object.keys(BOROUGH_BUILDING_CONFIG)[0]]; // fallback

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
      
      // Material-specific color adjustments
      if (material === 'glass') {
        c.multiplyScalar(0.9 + t * 0.2); // Brighter for glass
      } else if (material === 'metallic') {
        c.multiplyScalar(0.8 + t * 0.2);
      } else {
        c.multiplyScalar(0.7 + t * 0.2); // Darker for concrete
      }
      
      meshRef.current!.setColorAt(i, c);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [buildings, colors, config, material]);

  if (buildings.length === 0) return null;

  // Material properties based on type
  const materialProps = {
    glass: {
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 2.0,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.95,
      transmission: 0.1,
    },
    metallic: {
      metalness: 0.8,
      roughness: 0.3,
      envMapIntensity: 1.8,
      emissiveIntensity: 0.1,
    },
    concrete: {
      metalness: 0.2,
      roughness: 0.7,
      envMapIntensity: 0.8,
      emissiveIntensity: 0.05,
    }
  };

  const props = materialProps[material];

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        metalness={props.metalness}
        roughness={props.roughness}
        envMapIntensity={props.envMapIntensity}
        emissive={colors.base}
        emissiveIntensity={props.emissiveIntensity}
        transparent={props.transparent}
        opacity={props.opacity}
      />
    </instancedMesh>
  );
}

// Atmospheric particles
function AtmosphericParticles() {
  const count = 1000;
  const particlesRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 100 - 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.2 + 0.5, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
          args={[particles.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
          args={[particles.colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

interface SceneProps {
  boroughs: BoroughData[];
  showTaxData?: boolean;
}

function Scene({ boroughs, showTaxData = true, autoRotate = true }: SceneProps & { autoRotate?: boolean }) {
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);

  return (
    <>
      {/* Gradient sky background for SimCity vibe */}
      <color attach="background" args={['#0f172a']} />
      
      {/* Ground plane for depth and shadows - enhanced for visual polish */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial
          color="#0f1419"
          roughness={0.85}
          metalness={0.15}
          envMapIntensity={0.3}
          emissive="#0a0e14"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Subtle grid on ground for better spatial reference */}
      <gridHelper
        args={[400, 40, '#334155', '#1e293b']}
        position={[0, -0.4, 0]}
      />

      {/* FIX: Zoom out further and adjust angle to fit all 5 boroughs in frame */}
      <PerspectiveCamera makeDefault position={[120, 140, 120]} fov={60} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
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

      {/* Enhanced lighting for SimCity-style aesthetic - VISUAL POLISH */}
      {/* Soft ambient base lighting */}
      <ambientLight intensity={0.4} color="#556b8a" />
      
      {/* Primary sun light - warm golden hour lighting, creates main shadows */}
      <directionalLight
        position={[100, 120, 80]}
        intensity={1.8}
        color="#ffe4b5"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-bias={-0.0003}
        shadow-radius={2}
      />
      
      {/* Secondary sun light for softer shadows (dual-shadow SimCity effect) */}
      <directionalLight
        position={[80, 100, -60]}
        intensity={0.8}
        color="#ffd4a3"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-bias={-0.0002}
      />
      
      {/* Fill light - cool blue from opposite side */}
      <directionalLight
        position={[-50, 60, -40]}
        intensity={0.6}
        color="#7da3cc"
      />
      
      {/* Rim/accent light for edge highlighting */}
      <directionalLight
        position={[-30, 30, 50]}
        intensity={0.4}
        color="#c4b5fd"
      />
      
      {/* Subtle uplight for atmosphere */}
      <directionalLight
        position={[0, -10, 0]}
        intensity={0.2}
        color="#a78bfa"
      />
      
      {/* Hemisphere light for natural sky/ground ambient */}
      <hemisphereLight
        intensity={0.6}
        color="#b8d4ff"
        groundColor="#3b4252"
      />

      {/* HDR environment for reflections and realistic lighting */}
      <Environment preset="city" background={false} environmentIntensity={1.2} />
      
      {/* Enhanced atmospheric fog for depth and SimCity vibe */}
      <fog attach="fog" args={["#1e2847", 120, 350]} />
      
      {/* Animated stars in the background */}
      <Stars
        radius={300}
        depth={60}
        count={3000}
        factor={6}
        saturation={0.5}
        fade
        speed={0.5}
      />

      {/* Boroughs with staggered animation */}
      {boroughs.map((borough, index) => (
        <Borough
          key={borough.name}
          name={borough.name}
          coordinates={borough.coordinates}
          isHovered={hoveredBorough === borough.name}
          isSelected={selectedBorough === borough.name}
          onClick={() => setSelectedBorough(borough.name)}
          onHover={(hovered) => setHoveredBorough(hovered ? borough.name : null)}
          animationDelay={index * 0.2}
          showTaxData={showTaxData}
        />
      ))}

      {/* Info overlay - Clean, minimal tooltip */}
      {(hoveredBorough || selectedBorough) && (() => {
        const borough = hoveredBorough || selectedBorough || '';
        const taxData = BOROUGH_TAX_DATA[borough];
        const boroughInfo = BOROUGH_INFO[borough];
        const colors = BOROUGH_COLORS[borough];

        return (
          <Html position={[0, 40, 0]} center>
            <div className="bg-white rounded-lg shadow-lg px-6 py-4 border border-gray-200 max-w-sm">
              {/* Borough name with accent color */}
              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: colors?.base || '#000' }}
              >
                {borough}
              </h3>

              {/* Tax revenue - primary metric */}
              {showTaxData && taxData && (
                <div className="mb-3">
                  <p className="text-3xl font-bold text-gray-900">
                    ${(taxData.revenue / 1000000000).toFixed(2)}B
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Tax Revenue Potential</p>
                </div>
              )}

              {/* Stats grid */}
              {showTaxData && taxData && (
                <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Billionaire Tax</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(taxData.billionaireTaxShare * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Corporate Tax</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {(taxData.corporateTaxShare * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Borough stats */}
              {boroughInfo && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Population</p>
                    <p className="font-semibold text-gray-900">
                      {(boroughInfo.population / 1000000).toFixed(2)}M
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Area</p>
                    <p className="font-semibold text-gray-900">
                      {boroughInfo.area} mi²
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Html>
        );
      })()}
      
      {/* Post-processing for cinematic SimCity-style visuals - VISUAL POLISH */}
      <EffectComposer multisampling={8}>
        {/* Ambient occlusion for realistic depth and shadows in crevices */}
        <SSAO
          samples={31}
          radius={0.15}
          intensity={60}
          luminanceInfluence={0.5}
          color="#000000"
          bias={0.001}
        />
        
        {/* Bloom for glowing lights and emissive materials - more prominent */}
        <Bloom
          intensity={0.9}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.8}
          mipmapBlur
          radius={0.9}
        />
        
        {/* Subtle vignette for cinematic focus */}
        <Vignette
          offset={0.2}
          darkness={0.6}
          eskil={false}
        />
        
        {/* Depth of field for atmospheric depth */}
        <DepthOfField
          focusDistance={0.01}
          focalLength={0.08}
          bokehScale={3}
          height={480}
        />
        
        {/* Tone mapping for better color range and HDR feel */}
        <ToneMapping
          adaptive={true}
          resolution={256}
          middleGrey={0.65}
          maxLuminance={18.0}
          averageLuminance={1.2}
          adaptationRate={1.8}
        />
        
        {/* Subtle chromatic aberration for cinematic realism */}
        <ChromaticAberration
          offset={[0.001, 0.0012]}
          radialModulation={true}
          modulationOffset={0.5}
        />
      </EffectComposer>

    </>
  );
}

function LoadingScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/30 blur-3xl animate-pulse" />
          <h2 className="relative text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            Loading NYC 3D Map
          </h2>
        </div>
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-blue-500"
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite`
              }}
            />
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
  title = "NYC Tax Revenue Potential by Borough",
  description = "3D visualization showing potential revenue from billionaire and corporate tax reforms. Building heights represent revenue potential, colors identify boroughs."
}: BoroughMap3DUnifiedProps) {
  const [boroughs, setBoroughs] = useState<BoroughData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    async function loadBoroughData() {
      try {
        console.log('[BoroughMap3DUnified] Starting to load borough data...');
        const response = await fetch('/borough-boundaries.geojson');
        console.log('[BoroughMap3DUnified] Fetch response:', response.status, response.statusText);

        if (!response.ok) {
          throw new Error(`Failed to load borough data: ${response.status} ${response.statusText}`);
        }

        const geojson = await response.json();
        console.log('[BoroughMap3DUnified] GeoJSON loaded:', {
          type: geojson.type,
          featuresCount: geojson.features?.length,
          features: geojson.features?.map((f: any) => ({
            name: f.properties?.BoroName,
            geometryType: f.geometry?.type,
            coordinatesLength: f.geometry?.coordinates?.length
          }))
        });

        const parsed = parseBoroughGeoJSON(geojson);
        console.log('[BoroughMap3DUnified] Parsed boroughs:', parsed.map(b => ({
          name: b.name,
          coordinatesLength: b.coordinates?.length,
          firstRingPoints: b.coordinates?.[0]?.length
        })));

        if (parsed.length === 0) {
          throw new Error('No borough data parsed from GeoJSON');
        }

        setBoroughs(parsed);
        setTimeout(() => setLoading(false), 500);
      } catch (err) {
        console.error('[BoroughMap3DUnified] Error loading borough data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadBoroughData();
  }, []);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-950 to-black">
        <div className="text-red-400 text-2xl font-bold">⚠️ Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative overflow-hidden">

      {/* UI Panel */}
      <div className="absolute top-6 left-6 z-10 space-y-4 max-w-md">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 blur-2xl group-hover:blur-3xl transition-all" />
          <div className="relative bg-black/70 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border-2 border-white/20">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              {title}
            </h1>
            <p className="text-base text-white mb-4 leading-relaxed drop-shadow-md font-medium">
              {description}
            </p>

            {showTaxData && (
              <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-4 space-y-3">
                <div>
                  <p className="text-xs font-bold text-emerald-400 mb-1 drop-shadow">📊 WHAT YOU'RE SEEING</p>
                  <p className="text-sm text-gray-200 drop-shadow leading-relaxed">
                    <span className="font-bold text-white">Building heights</span> represent tax revenue potential from each borough. Taller buildings = higher revenue.
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-400 mb-1 drop-shadow">💰 TAX POLICIES EXPLAINED</p>
                  <p className="text-xs text-gray-200 drop-shadow leading-relaxed mb-2">
                    <span className="font-bold text-white">Billionaire Tax:</span> Wealth tax on NYC residents worth $1B+. Each borough's "share" shows what % of billionaires live there.
                  </p>
                  <p className="text-xs text-gray-200 drop-shadow leading-relaxed">
                    <span className="font-bold text-white">Corporate Tax:</span> Tax on large businesses. Each borough's "share" shows what % of corporate activity happens there.
                  </p>
                </div>
                <div className="pt-2 border-t border-white/20">
                  <p className="text-xs text-gray-300 drop-shadow">
                    <span className="font-bold text-white">📚 Sources:</span> NYC Open Data, NYC Comptroller, City & State NY (2026)
                  </p>
                </div>
              </div>
            )}

            {/* Borough legend */}
            <div>
              <p className="text-xs font-bold text-blue-400 mb-2 drop-shadow">🗺️ BOROUGH COLORS & REVENUE</p>
              <p className="text-xs text-gray-300 drop-shadow mb-3">
                💡 <strong className="text-white">Color Guide:</strong> Darker shades = higher tax revenue potential
              </p>
              <div className="grid grid-cols-1 gap-2">
              {Object.entries(BOROUGH_COLORS).map(([name, colors]) => {
                const taxData = BOROUGH_TAX_DATA[name];
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between gap-3 bg-white/5 hover:bg-white/10 px-4 py-3 rounded-xl transition-all cursor-pointer group/item border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-lg shadow-lg group-hover/item:scale-110 transition-transform"
                        style={{
                          backgroundColor: colors.base,
                          boxShadow: `0 0 20px ${colors.glow}`
                        }}
                      />
                      <span className="text-sm font-bold text-white drop-shadow">{name}</span>
                    </div>
                    {showTaxData && taxData && (
                      <span className="text-xs font-bold text-emerald-400 drop-shadow">
                        ${(taxData.revenue / 1000000000).toFixed(1)}B
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 blur-xl" />
          <div className="relative bg-black/70 backdrop-blur-2xl p-5 rounded-2xl border-2 border-white/20">
            <p className="text-sm font-black text-emerald-400 mb-3 drop-shadow">🎮 CONTROLS</p>
            <div className="text-sm text-white space-y-2 drop-shadow-md mb-4">
              <p className="font-semibold">🖱️ Drag to rotate</p>
              <p className="font-semibold">🔍 Scroll to zoom in/out</p>
              <p className="font-semibold">👆 Click borough for details</p>
              <p className="font-semibold">✨ Hover for sparkles</p>
            </div>

            {/* Auto-rotate toggle */}
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`w-full px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                autoRotate
                  ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white hover:from-emerald-600 hover:to-blue-600'
                  : 'bg-white/10 text-white hover:bg-white/20 border-2 border-white/30'
              }`}
            >
              {autoRotate ? '⏸️ Pause Rotation' : '▶️ Auto Rotate'}
            </button>
          </div>
        </div>
      </div>

      {/* Feature badges */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        {['3D Boroughs', 'Buildings', 'Interactive', 'GSAP'].map((effect) => (
          <div
            key={effect}
            className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 backdrop-blur-xl px-5 py-2 rounded-full border-2 border-white/30 text-white text-sm font-bold shadow-lg drop-shadow-lg"
          >
            ✨ {effect}
          </div>
        ))}
      </div>

      <Canvas 
        shadows 
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"  // FIX: Better rendering quality
        }} 
        dpr={[1, 2]}  // FIX: Device pixel ratio for sharper edges
      >
        <Suspense fallback={null}>
          <Scene boroughs={boroughs} showTaxData={showTaxData} autoRotate={autoRotate} />
        </Suspense>
      </Canvas>
    </div>
  );
}
