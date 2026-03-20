"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html, Stars, Sparkles, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing';
import { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { parseBoroughGeoJSON, BOROUGH_INFO, BoroughData } from '@/lib/boroughData';
// import Landmarks from './Landmarks'; // Temporarily disabled - focusing on perfecting base map first

const NYC_CENTER_LNG = -73.978;
const NYC_CENTER_LAT = 40.706;
const COORDINATE_SCALE = 400;

function projectCoordinate(lat: number, lng: number): { x: number; y: number } {
  const x = (lng - NYC_CENTER_LNG) * COORDINATE_SCALE;
  const y = (lat - NYC_CENTER_LAT) * COORDINATE_SCALE;
  return { x, y };
}

const BUILDING_SCALE_MULTIPLIER = 150;
const BOROUGH_HEIGHT_MULTIPLIER: Record<string, number> = { 'Manhattan': 1.0, 'Brooklyn': 0.7, 'Queens': 0.7, 'Bronx': 0.6, 'Staten Island': 0.5 };

const BOROUGH_BUILDING_CONFIG: Record<string, { count: number; minHeight: number; maxHeight: number; minWidth: number; maxWidth: number; clusterFactor: number }> = {
  'Manhattan':      { count: 220, minHeight: 0.3 * BUILDING_SCALE_MULTIPLIER * 1.0,  maxHeight: 2.0 * BUILDING_SCALE_MULTIPLIER * 1.0, minWidth: 0.35 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.75 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.65 },
  'Brooklyn':       { count: 120, minHeight: 0.1 * BUILDING_SCALE_MULTIPLIER * 0.7,  maxHeight: 0.8 * BUILDING_SCALE_MULTIPLIER * 0.7,  minWidth: 0.35 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.7 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.4 },
  'Queens':         { count: 80, minHeight: 0.06 * BUILDING_SCALE_MULTIPLIER * 0.7, maxHeight: 0.4 * BUILDING_SCALE_MULTIPLIER * 0.7, minWidth: 0.35 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.6 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.2 },
  'Bronx':          { count: 90, minHeight: 0.1 * BUILDING_SCALE_MULTIPLIER * 0.6,  maxHeight: 0.6 * BUILDING_SCALE_MULTIPLIER * 0.6,  minWidth: 0.35 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.65 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.3 },
  'Staten Island':  { count: 40,  minHeight: 0.04 * BUILDING_SCALE_MULTIPLIER * 0.5, maxHeight: 0.3 * BUILDING_SCALE_MULTIPLIER * 0.5, minWidth: 0.35 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.5 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.1 },
};

// Configuration for small residential/suburban buildings
// Heights kept VERY small to maintain clear hierarchy (skyscrapers >> residential)
const RESIDENTIAL_BUILDING_CONFIG: Record<string, { count: number; minHeight: number; maxHeight: number; minWidth: number; maxWidth: number; clusterFactor: number }> = {
  'Manhattan':      { count: 2000, minHeight: 0.01, maxHeight: 0.04, minWidth: 0.1, maxWidth: 0.18, clusterFactor: 0.25 },
  'Brooklyn':       { count: 2500, minHeight: 0.008, maxHeight: 0.03, minWidth: 0.08, maxWidth: 0.15, clusterFactor: 0.2 },
  'Queens':         { count: 3000, minHeight: 0.008, maxHeight: 0.025, minWidth: 0.08, maxWidth: 0.14, clusterFactor: 0.15 },
  'Bronx':          { count: 2200, minHeight: 0.008, maxHeight: 0.028, minWidth: 0.08, maxWidth: 0.15, clusterFactor: 0.18 },
  'Staten Island':  { count: 1500, minHeight: 0.006, maxHeight: 0.02, minWidth: 0.06, maxWidth: 0.12, clusterFactor: 0.1 },
};

function seededRandom(seed: number) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

function pointInPolygon(x: number, y: number, polygon: number[][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1], xj = polygon[j][0], yj = polygon[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// Central Park boundaries in projected coordinates (pre-calculated for performance)
// Central Park: 40.7679°N to 40.8003°N, 73.9496°W to 73.9735°W
// Note: -73.978 center lng, 40.706 center lat, scale 400
const CENTRAL_PARK_PROJECTED = {
  minX: (-73.9735 - (-73.978)) * 400,  // = 0.0045 * 400 = 1.8
  maxX: (-73.9496 - (-73.978)) * 400,  // = 0.0284 * 400 = 11.36
  minY: (40.7679 - 40.706) * 400,      // = 0.0619 * 400 = 24.76
  maxY: (40.8003 - 40.706) * 400       // = 0.0943 * 400 = 37.72
};

if (typeof window !== 'undefined') {
  console.log('[Borough Data] Central Park projected bounds:', CENTRAL_PARK_PROJECTED);
}

// Manhattan height zones for realistic building distribution
// Financial District (FiDi): Southern tip (below Canal St ~40.72)
// Midtown: Around 40.74-40.77 (Times Sq, Empire State, Chrysler)
// Uptown: Above 40.78 (Upper East/West Side - shorter buildings)
interface HeightZone {
  minLat: number;
  maxLat: number;
  heightMultiplier: number;
  densityMultiplier: number;
}

const MANHATTAN_HEIGHT_ZONES: HeightZone[] = [
  { minLat: 40.69, maxLat: 40.72, heightMultiplier: 2.2, densityMultiplier: 1.5 },  // Financial District
  { minLat: 40.74, maxLat: 40.77, heightMultiplier: 2.0, densityMultiplier: 1.4 },  // Midtown
  { minLat: 40.77, maxLat: 40.82, heightMultiplier: 0.6, densityMultiplier: 0.8 },  // Uptown
];

function getHeightMultiplierForLocation(lat: number, lng: number): number {
  // Only apply to Manhattan-ish longitudes
  if (lng < -74.02 || lng > -73.93) return 1.0;
  
  for (const zone of MANHATTAN_HEIGHT_ZONES) {
    if (lat >= zone.minLat && lat <= zone.maxLat) {
      return zone.heightMultiplier;
    }
  }
  return 1.0;
}

// Iconic Manhattan landmarks (approximate locations)
const MANHATTAN_LANDMARKS = [
  { name: "One World Trade", lat: 40.7127, lng: -74.0134, heightMultiplier: 3.5 },
  { name: "Empire State", lat: 40.7484, lng: -73.9857, heightMultiplier: 3.0 },
  { name: "Chrysler Building", lat: 40.7516, lng: -73.9755, heightMultiplier: 2.8 },
  { name: "432 Park Ave", lat: 40.7615, lng: -73.9719, heightMultiplier: 2.9 },
];

// Water exclusion zones around Manhattan (projected coordinates)
// These prevent buildings from appearing in rivers and harbor areas
const MANHATTAN_WATER_EXCLUSIONS_PROJECTED: { name: string; polygon: number[][] }[] = [
  {
    name: "Hudson River West",
    polygon: [
      [(-74.02 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.70 - NYC_CENTER_LAT) * COORDINATE_SCALE],
      [(-74.02 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.88 - NYC_CENTER_LAT) * COORDINATE_SCALE],
      [(-73.98 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.88 - NYC_CENTER_LAT) * COORDINATE_SCALE],
      [(-73.98 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.70 - NYC_CENTER_LAT) * COORDINATE_SCALE]
    ]
  },
  {
    name: "East River East",
    polygon: [
      [(-73.935 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.70 - NYC_CENTER_LAT) * COORDINATE_SCALE],
      [(-73.935 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.88 - NYC_CENTER_LAT) * COORDINATE_SCALE],
      [(-73.90 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.88 - NYC_CENTER_LAT) * COORDINATE_SCALE],
      [(-73.90 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.70 - NYC_CENTER_LAT) * COORDINATE_SCALE]
    ]
  },
  {
    name: "Lower Manhattan Harbor",
    polygon: [
      [(-74.02 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.68 - NYC_CENTER_LAT) * COORDINATE_SCALE],
      [(-74.02 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.72 - NYC_CENTER_LAT) * COORDINATE_SCALE],
      [(-73.98 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.72 - NYC_CENTER_LAT) * COORDINATE_SCALE],
      [(-73.98 - NYC_CENTER_LNG) * COORDINATE_SCALE, (40.68 - NYC_CENTER_LAT) * COORDINATE_SCALE]
    ]
  }
];

// Check if a projected x,y coordinate should be excluded (water or parks)
function isExcludedLocation(x: number, y: number, boroughName: string): boolean {
  // Apply Manhattan-specific exclusions
  if (boroughName === 'Manhattan') {
    // Check Central Park (simple rectangular bounds check)
    if (x >= CENTRAL_PARK_PROJECTED.minX && 
        x <= CENTRAL_PARK_PROJECTED.maxX && 
        y >= CENTRAL_PARK_PROJECTED.minY && 
        y <= CENTRAL_PARK_PROJECTED.maxY) {
      return true;
    }
    
    // Check water exclusion zones
    for (const zone of MANHATTAN_WATER_EXCLUSIONS_PROJECTED) {
      if (pointInPolygon(x, y, zone.polygon)) {
        return true;
      }
    }
  }
  
  return false;
}

interface BuildingInstance { x: number; y: number; width: number; depth: number; height: number }

function generateBuildings(name: string, coordinates: number[][][][]): BuildingInstance[] {
  const config = BOROUGH_BUILDING_CONFIG[name];
  if (!config) return [];
  const outerRings: number[][][] = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, centerX = 0, centerY = 0, pointCount = 0;
  coordinates.forEach((polygon) => { if (!polygon || !polygon[0]) return; const ring = polygon[0].map((pt: number[]) => { const { x, y } = projectCoordinate(pt[1], pt[0]); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); centerX += x; centerY += y; pointCount++; return [x, y]; }); outerRings.push(ring); });
  if (outerRings.length === 0 || pointCount === 0) return [];
  centerX /= pointCount; centerY /= pointCount;
  
  if (typeof window !== 'undefined' && name === 'Manhattan') {
    console.log(`[Borough Data] ${name} bounds:`, { minX, maxX, minY, maxY, centerX, centerY });
  }
  
  const rand = seededRandom(name.charCodeAt(0) * 1000 + name.length * 31);
  const buildings: BuildingInstance[] = [];
  
  // Add landmark buildings first for Manhattan
  if (name === 'Manhattan') {
    MANHATTAN_LANDMARKS.forEach(landmark => {
      const { x, y } = projectCoordinate(landmark.lat, landmark.lng);
      if (outerRings.some(ring => pointInPolygon(x, y, ring)) && !isExcludedLocation(x, y, name)) {
        buildings.push({
          x,
          y,
          width: config.maxWidth * 0.8,
          depth: config.maxWidth * 0.8,
          height: config.maxHeight * landmark.heightMultiplier
        });
      }
    });
  }
  
  let attempts = 0;
  let excludedCount = 0;
  while (buildings.length < config.count && attempts < config.count * 20) {
    attempts++;
    const x = rand() < config.clusterFactor ? centerX + (rand() - 0.5) * (maxX - minX) * 0.4 : minX + rand() * (maxX - minX);
    const y = rand() < config.clusterFactor ? centerY + (rand() - 0.5) * (maxY - minY) * 0.4 : minY + rand() * (maxY - minY);
    if (!outerRings.some(ring => pointInPolygon(x, y, ring))) continue;
    if (isExcludedLocation(x, y, name)) {
      excludedCount++;
      continue; // Skip Central Park and water
    }
    
    // Calculate height based on location zones (Manhattan only)
    let heightMultiplier = 1.0;
    if (name === 'Manhattan') {
      // Convert projected coords back to lat/lng for zone checking
      const lat = (y / COORDINATE_SCALE) + NYC_CENTER_LAT;
      const lng = (x / COORDINATE_SCALE) + NYC_CENTER_LNG;
      heightMultiplier = getHeightMultiplierForLocation(lat, lng);
    }
    
    const distRatio = Math.min(1, Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / (Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5));
    const centralBoost = 1 - distRatio * config.clusterFactor;
    buildings.push({ 
      x, 
      y, 
      width: config.minWidth + rand() * (config.maxWidth - config.minWidth), 
      depth: config.minWidth + rand() * (config.maxWidth - config.minWidth), 
      height: (config.minHeight + rand() * (config.maxHeight - config.minHeight) * centralBoost) * heightMultiplier 
    });
  }
  
  if (typeof window !== 'undefined') {
    console.log(`[Borough Data] Created ${buildings.length} buildings for ${name} (excluded: ${excludedCount}, attempts: ${attempts})`);
  }
  
  return buildings;
}

const BOROUGH_TAX_DATA: Record<string, { revenue: number; billionaireTaxShare: number; corporateTaxShare: number }> = { 'Manhattan': { revenue: 8e9, billionaireTaxShare: 0.6, corporateTaxShare: 0.5 }, 'Brooklyn': { revenue: 3.5e9, billionaireTaxShare: 0.15, corporateTaxShare: 0.2 }, 'Queens': { revenue: 2.8e9, billionaireTaxShare: 0.1, corporateTaxShare: 0.15 }, 'Bronx': { revenue: 1.2e9, billionaireTaxShare: 0.05, corporateTaxShare: 0.08 }, 'Staten Island': { revenue: 8e8, billionaireTaxShare: 0.1, corporateTaxShare: 0.07 } };

const BOROUGH_COLORS: Record<string, { base: string; emissive: string; glow: string }> = { 'Manhattan': { base: '#4A90E2', emissive: '#6BAEE8', glow: '#8CC5EE' }, 'Brooklyn': { base: '#D4866A', emissive: '#E09F88', glow: '#ECB8A6' }, 'Queens': { base: '#E8C468', emissive: '#F0D486', glow: '#F8E4A4' }, 'Bronx': { base: '#6BA888', emissive: '#89BCA3', glow: '#A7D0BE' }, 'Staten Island': { base: '#A87CA8', emissive: '#BF99BF', glow: '#D6B6D6' } };

// Vertical offsets to prevent z-fighting between boroughs (imperceptible to user, critical for clean borders)
const BOROUGH_Y_OFFSETS: Record<string, number> = {
  'Manhattan': 0.00,
  'Brooklyn': 0.02,
  'Queens': 0.04,
  'Bronx': 0.06,
  'Staten Island': 0.08
};

// Central Park component - visible green park area
function CentralPark() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create a simple box for Central Park
  const parkWidth = CENTRAL_PARK_PROJECTED.maxX - CENTRAL_PARK_PROJECTED.minX;
  const parkDepth = CENTRAL_PARK_PROJECTED.maxY - CENTRAL_PARK_PROJECTED.minY;
  const parkCenterX = (CENTRAL_PARK_PROJECTED.minX + CENTRAL_PARK_PROJECTED.maxX) / 2;
  const parkCenterY = (CENTRAL_PARK_PROJECTED.minY + CENTRAL_PARK_PROJECTED.maxY) / 2;
  
  return (
    <mesh 
      ref={meshRef}
      position={[parkCenterX, 2.1, -parkCenterY]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[parkWidth, parkDepth]} />
      <meshPhysicalMaterial 
        color="#2d5016"
        emissive="#3a6b1f"
        emissiveIntensity={0.2}
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
  );
}

function Borough({ name, coordinates, isHovered, isSelected, onClick, onHover, animationDelay }: { name: string; coordinates: number[][][][]; isHovered: boolean; isSelected: boolean; onClick: () => void; onHover: (h: boolean) => void; animationDelay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [mounted, setMounted] = useState(false);
  const yOffset = BOROUGH_Y_OFFSETS[name] || 0;
  
  useEffect(() => { setMounted(true); }, [animationDelay]);
  useEffect(() => { 
    if (groupRef.current && mounted) {
      gsap.to(groupRef.current.position, { 
        y: yOffset,
        z: isSelected ? 5 : 0, 
        duration: 0.6, 
        ease: 'power2.out' 
      }); 
    }
  }, [isSelected, mounted, yOffset]);
  useEffect(() => { if (groupRef.current && mounted) gsap.to(groupRef.current.scale, { x: isHovered ? 1.02 : 1, y: isHovered ? 1.02 : 1, z: isHovered ? 1.05 : 1, duration: 0.3, ease: 'power2.out' }); }, [isHovered, mounted]);
  useFrame((state) => { if (groupRef.current && mounted) groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2 + animationDelay) * 0.002; });
  const geometry = useMemo(() => {
    if (!coordinates || coordinates.length === 0) return new THREE.BoxGeometry(1, 1, 1);
    const shapes: THREE.Shape[] = [];
    coordinates.forEach((polygon) => { if (!polygon || !polygon[0] || polygon[0].length === 0) return; const shape = new THREE.Shape(); polygon[0].forEach((point: any, idx: number) => { if (!point || point.length < 2) return; const { x, y } = projectCoordinate(point[1], point[0]); idx === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y); }); for (let r = 1; r < polygon.length; r++) { if (!polygon[r] || polygon[r].length === 0) continue; const hole = new THREE.Path(); polygon[r].forEach((pt: any, i: number) => { if (!pt || pt.length < 2) return; const { x, y } = projectCoordinate(pt[1], pt[0]); i === 0 ? hole.moveTo(x, y) : hole.lineTo(x, y); }); shape.holes.push(hole); } if (shape.curves.length > 0) shapes.push(shape); });
    if (shapes.length === 0) return new THREE.BoxGeometry(1, 1, 1);
    const geo = new THREE.ExtrudeGeometry(shapes, { depth: 2, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.2, bevelSegments: 5, curveSegments: 32 });
    geo.rotateX(-Math.PI / 2); return geo;
  }, [coordinates, name]);
  const colors = BOROUGH_COLORS[name] || BOROUGH_COLORS['Manhattan'];
  return (<group ref={groupRef}><mesh ref={meshRef} geometry={geometry} onClick={onClick} onPointerOver={() => onHover(true)} onPointerOut={() => onHover(false)} castShadow receiveShadow><meshPhysicalMaterial color={colors.base} emissive={colors.emissive} emissiveIntensity={isHovered ? 0.4 : isSelected ? 0.25 : 0.15} metalness={0.4} roughness={0.45} envMapIntensity={0.8} clearcoat={0.3} clearcoatRoughness={0.4} transparent={isHovered} opacity={isHovered ? 0.95 : 1.0} /></mesh><BoroughBuildings name={name} coordinates={coordinates} /><ResidentialBuildings name={name} coordinates={coordinates} />{name === 'Manhattan' && <CentralPark />}</group>);
}

function BoroughBuildings({ name, coordinates }: { name: string; coordinates: number[][][][] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const buildings = useMemo(() => generateBuildings(name, coordinates), [name, coordinates]);
  const colors = BOROUGH_COLORS[name] || BOROUGH_COLORS['Manhattan'];
  const config = BOROUGH_BUILDING_CONFIG[name];
  useEffect(() => { if (!meshRef.current || buildings.length === 0) return; const dummy = new THREE.Object3D(); const base = new THREE.Color(colors.base); const emissive = new THREE.Color(colors.emissive); buildings.forEach((b, i) => { dummy.position.set(b.x, 2 + b.height / 2, -b.y); dummy.scale.set(b.width, b.height, b.depth); dummy.updateMatrix(); meshRef.current!.setMatrixAt(i, dummy.matrix); const t = config ? (b.height - config.minHeight) / (config.maxHeight - config.minHeight) : 0.5; const c = base.clone().lerp(emissive, t * 0.5); c.multiplyScalar(0.7 + t * 0.3); meshRef.current!.setColorAt(i, c); }); meshRef.current.instanceMatrix.needsUpdate = true; if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true; }, [buildings, colors, config, name]);
  useFrame((state) => { if (!meshRef.current) return; const mat = meshRef.current.material as THREE.MeshPhysicalMaterial; if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.03 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01; });
  if (buildings.length === 0) return null;
  return (<instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow><boxGeometry args={[1, 1, 1]} /><meshPhysicalMaterial metalness={0.5} roughness={0.4} envMapIntensity={0.8} emissive={colors.base} emissiveIntensity={0.03} clearcoat={0.15} clearcoatRoughness={0.6} /></instancedMesh>);
}

function ResidentialBuildings({ name, coordinates }: { name: string; coordinates: number[][][][] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const buildings = useMemo(() => {
    const config = RESIDENTIAL_BUILDING_CONFIG[name];
    if (!config) return [];
    const outerRings: number[][][] = [];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    coordinates.forEach((polygon) => {
      if (!polygon || !polygon[0]) return;
      const ring = polygon[0].map((pt: number[]) => {
        const { x, y } = projectCoordinate(pt[1], pt[0]);
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
        return [x, y];
      });
      outerRings.push(ring);
    });
    if (outerRings.length === 0) return [];
    
    const rand = seededRandom(name.charCodeAt(0) * 2000 + name.length * 17);
    const buildings: BuildingInstance[] = [];
    let attempts = 0;
    
    while (buildings.length < config.count && attempts < config.count * 30) {
      attempts++;
      const x = minX + rand() * (maxX - minX);
      const y = minY + rand() * (maxY - minY);
      
      if (!outerRings.some(ring => pointInPolygon(x, y, ring))) continue;
      if (isExcludedLocation(x, y, name)) continue; // Skip Central Park and water
      
      buildings.push({
        x,
        y,
        width: config.minWidth + rand() * (config.maxWidth - config.minWidth),
        depth: config.minWidth + rand() * (config.maxWidth - config.minWidth),
        height: config.minHeight + rand() * (config.maxHeight - config.minHeight)
      });
    }
    
    return buildings;
  }, [name, coordinates]);
  
  const colors = BOROUGH_COLORS[name] || BOROUGH_COLORS['Manhattan'];
  
  useEffect(() => {
    if (!meshRef.current || buildings.length === 0) return;
    const dummy = new THREE.Object3D();
    const base = new THREE.Color(colors.base);
    
    buildings.forEach((b, i) => {
      dummy.position.set(b.x, 2 + b.height / 2, -b.y);
      dummy.scale.set(b.width, b.height, b.depth);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      
      const c = base.clone();
      c.multiplyScalar(0.4 + Math.random() * 0.3);
      meshRef.current!.setColorAt(i, c);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [buildings, colors, name]);
  
  if (buildings.length === 0) return null;
  
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial 
        metalness={0.2} 
        roughness={0.7} 
        envMapIntensity={0.4} 
        emissive={colors.base} 
        emissiveIntensity={0.01} 
        opacity={0.85}
        transparent={false}
      />
    </instancedMesh>
  );
}

function Scene({ boroughs, showTaxData = true, autoRotate = true }: { boroughs: BoroughData[]; showTaxData?: boolean; autoRotate?: boolean }) {
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  return (<>
    <color attach="background" args={['#0e1419']} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}><planeGeometry args={[600, 600]} /><meshBasicMaterial color="#101520" /></mesh>
    <PerspectiveCamera makeDefault position={[80, 200, 100]} fov={50} />
    <OrbitControls enablePan enableZoom enableRotate enableDamping dampingFactor={0.15} minDistance={40} maxDistance={300} maxPolarAngle={Math.PI / 1.1} minPolarAngle={Math.PI / 8} rotateSpeed={0.6} zoomSpeed={1.0} panSpeed={0.6} autoRotate={autoRotate} autoRotateSpeed={0.5} />
    <ambientLight intensity={1.4} color="#f5f8fa" />
    <directionalLight position={[150, 250, 100]} intensity={1.1} color="#ffffff" />
    <directionalLight position={[-100, 180, 80]} intensity={0.7} color="#f8fafc" />
    <directionalLight position={[80, 150, -100]} intensity={0.6} color="#ffffff" />
    <hemisphereLight intensity={0.9} color="#e8f0f8" groundColor="#6b7280" />
    <Environment preset="city" background={false} environmentIntensity={0.8} />
    <fog attach="fog" args={["#131820", 200, 500]} />
    <Stars radius={350} depth={70} count={2000} factor={4} saturation={0.3} fade speed={0.3} />
    {boroughs.map((b, i) => <Borough key={b.name} name={b.name} coordinates={b.coordinates} isHovered={hoveredBorough === b.name} isSelected={selectedBorough === b.name} onClick={() => setSelectedBorough(selectedBorough === b.name ? null : b.name)} onHover={(h) => setHoveredBorough(h ? b.name : null)} animationDelay={i * 0.2} />)}
    {/* <Landmarks /> */} {/* Temporarily disabled - focusing on perfecting base map first */}
    {(hoveredBorough || selectedBorough) && (() => { const b = hoveredBorough || selectedBorough || ''; const td = BOROUGH_TAX_DATA[b]; const bi = BOROUGH_INFO[b]; const bc = BOROUGH_COLORS[b]; return (<Html position={[0, 40, 0]} center><div className="bg-white rounded-lg shadow-lg px-6 py-4 border border-gray-200 max-w-sm pointer-events-none"><h3 className="text-2xl font-bold mb-3" style={{ color: bc?.base || '#000' }}>{b}</h3>{showTaxData && td && <div className="mb-3"><p className="text-3xl font-bold text-gray-900">${(td.revenue / 1e9).toFixed(2)}B</p><p className="text-sm text-gray-500 mt-1">Tax Revenue Potential</p></div>}{showTaxData && td && <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200"><div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Billionaire Tax</p><p className="text-lg font-semibold text-gray-900">{(td.billionaireTaxShare * 100).toFixed(0)}%</p></div><div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Corporate Tax</p><p className="text-lg font-semibold text-gray-900">{(td.corporateTaxShare * 100).toFixed(0)}%</p></div></div>}{bi && <div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Population</p><p className="font-semibold text-gray-900">{(bi.population / 1e6).toFixed(2)}M</p></div><div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Area</p><p className="font-semibold text-gray-900">{bi.area} mi²</p></div></div>}</div></Html>); })()}
    <EffectComposer multisampling={4}><N8AO aoRadius={0.5} intensity={0.8} quality="medium" /><Bloom intensity={0.2} luminanceThreshold={0.7} luminanceSmoothing={0.8} mipmapBlur /><Vignette offset={0.4} darkness={0.3} eskil={false} /></EffectComposer>
  </>);
}

function LoadingScreen() { return (<div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"><div className="text-center space-y-4"><h2 className="text-3xl font-bold text-white animate-pulse">Loading NYC 3D Map</h2></div></div>); }

export interface BoroughMap3DUnifiedProps { showTaxData?: boolean; title?: string; description?: string }

export default function BoroughMap3DUnified({ showTaxData = true, title = "NYC Tax Revenue by Borough", description = "Building heights represent tax revenue potential. Click a borough for details." }: BoroughMap3DUnifiedProps) {
  const [boroughs, setBoroughs] = useState<BoroughData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  useEffect(() => { (async () => { try { const r = await fetch('/borough-boundaries.geojson'); if (!r.ok) throw new Error('Failed to load'); const g = await r.json(); const p = parseBoroughGeoJSON(g); if (p.length === 0) throw new Error('No data'); setBoroughs(p); setTimeout(() => setLoading(false), 500); } catch (e) { setError(e instanceof Error ? e.message : 'Unknown error'); setLoading(false); } })(); }, []);
  if (loading) return <LoadingScreen />;
  if (error) return <div className="w-full h-full flex items-center justify-center bg-slate-950"><div className="text-red-400 text-xl font-bold">Error: {error}</div></div>;
  return (<div className="w-full h-full relative overflow-hidden">
    <div className="absolute top-4 left-4 z-10 space-y-3 max-w-xs">
      <div className="bg-black/70 backdrop-blur-xl p-5 rounded-2xl border border-white/15"><h1 className="text-2xl font-bold mb-1 text-white">{title}</h1><p className="text-xs text-zinc-200 mb-4">{description}</p><div className="space-y-1.5">{Object.entries(BOROUGH_COLORS).map(([n, c]) => { const td = BOROUGH_TAX_DATA[n]; return (<div key={n} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"><div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: c.base, boxShadow: `0 0 8px ${c.glow}` }} /><span className="text-xs font-medium text-white">{n}</span></div>{showTaxData && td && <span className="text-xs font-semibold text-emerald-400">${(td.revenue / 1e9).toFixed(1)}B</span>}</div>); })}</div></div>
      <div className="bg-black/70 backdrop-blur-xl p-4 rounded-2xl border border-white/15"><div className="text-xs text-zinc-200 mb-3"><p>Drag to rotate · Scroll to zoom · Click for details</p></div><button onClick={() => setAutoRotate(!autoRotate)} className={`w-full px-3 py-2 rounded-lg font-medium text-xs transition-all ${autoRotate ? 'bg-white/15 text-zinc-300 hover:bg-white/20' : 'bg-white/10 text-zinc-200 hover:bg-white/15'}`}>{autoRotate ? 'Pause Rotation' : 'Auto Rotate'}</button></div>
    </div>
    <Canvas shadows gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }} dpr={[1, 2]}><Suspense fallback={null}><Scene boroughs={boroughs} showTaxData={showTaxData} autoRotate={autoRotate} /></Suspense></Canvas>
  </div>);
}
