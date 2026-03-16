"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html, Stars, Sparkles, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing';
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
const BOROUGH_HEIGHT_MULTIPLIER: Record<string, number> = { 'Manhattan': 1.0, 'Brooklyn': 0.7, 'Queens': 0.7, 'Bronx': 0.6, 'Staten Island': 0.5 };

const BOROUGH_BUILDING_CONFIG: Record<string, { count: number; minHeight: number; maxHeight: number; minWidth: number; maxWidth: number; clusterFactor: number }> = {
  'Manhattan':      { count: 220, minHeight: 4 * BUILDING_SCALE_MULTIPLIER * 1.0,  maxHeight: 28 * BUILDING_SCALE_MULTIPLIER * 1.0, minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.7 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.7 },
  'Brooklyn':       { count: 150, minHeight: 1 * BUILDING_SCALE_MULTIPLIER * 0.7,  maxHeight: 8 * BUILDING_SCALE_MULTIPLIER * 0.7,  minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.6 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.4 },
  'Queens':         { count: 100, minHeight: 0.5 * BUILDING_SCALE_MULTIPLIER * 0.7, maxHeight: 4 * BUILDING_SCALE_MULTIPLIER * 0.7, minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.5 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.2 },
  'Bronx':          { count: 110, minHeight: 1 * BUILDING_SCALE_MULTIPLIER * 0.6,  maxHeight: 6 * BUILDING_SCALE_MULTIPLIER * 0.6,  minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.55 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.3 },
  'Staten Island':  { count: 50,  minHeight: 0.3 * BUILDING_SCALE_MULTIPLIER * 0.5, maxHeight: 2.5 * BUILDING_SCALE_MULTIPLIER * 0.5, minWidth: 0.25 * BUILDING_SCALE_MULTIPLIER, maxWidth: 0.45 * BUILDING_SCALE_MULTIPLIER, clusterFactor: 0.1 },
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

interface BuildingInstance { x: number; y: number; width: number; depth: number; height: number }

function generateBuildings(name: string, coordinates: number[][][][]): BuildingInstance[] {
  const config = BOROUGH_BUILDING_CONFIG[name];
  if (!config) return [];
  const outerRings: number[][][] = [];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, centerX = 0, centerY = 0, pointCount = 0;
  coordinates.forEach((polygon) => { if (!polygon || !polygon[0]) return; const ring = polygon[0].map((pt: number[]) => { const { x, y } = projectCoordinate(pt[1], pt[0]); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); centerX += x; centerY += y; pointCount++; return [x, y]; }); outerRings.push(ring); });
  if (outerRings.length === 0 || pointCount === 0) return [];
  centerX /= pointCount; centerY /= pointCount;
  const rand = seededRandom(name.charCodeAt(0) * 1000 + name.length * 31);
  const buildings: BuildingInstance[] = [];
  let attempts = 0;
  while (buildings.length < config.count && attempts < config.count * 20) {
    attempts++;
    const x = rand() < config.clusterFactor ? centerX + (rand() - 0.5) * (maxX - minX) * 0.4 : minX + rand() * (maxX - minX);
    const y = rand() < config.clusterFactor ? centerY + (rand() - 0.5) * (maxY - minY) * 0.4 : minY + rand() * (maxY - minY);
    if (!outerRings.some(ring => pointInPolygon(x, y, ring))) continue;
    const distRatio = Math.min(1, Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2) / (Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2) * 0.5));
    const centralBoost = 1 - distRatio * config.clusterFactor;
    buildings.push({ x, y, width: config.minWidth + rand() * (config.maxWidth - config.minWidth), depth: config.minWidth + rand() * (config.maxWidth - config.minWidth), height: config.minHeight + rand() * (config.maxHeight - config.minHeight) * centralBoost });
  }
  return buildings;
}

const BOROUGH_TAX_DATA: Record<string, { revenue: number; billionaireTaxShare: number; corporateTaxShare: number }> = { 'Manhattan': { revenue: 8e9, billionaireTaxShare: 0.6, corporateTaxShare: 0.5 }, 'Brooklyn': { revenue: 3.5e9, billionaireTaxShare: 0.15, corporateTaxShare: 0.2 }, 'Queens': { revenue: 2.8e9, billionaireTaxShare: 0.1, corporateTaxShare: 0.15 }, 'Bronx': { revenue: 1.2e9, billionaireTaxShare: 0.05, corporateTaxShare: 0.08 }, 'Staten Island': { revenue: 8e8, billionaireTaxShare: 0.1, corporateTaxShare: 0.07 } };

const BOROUGH_COLORS: Record<string, { base: string; emissive: string; glow: string }> = { 'Manhattan': { base: '#0066FF', emissive: '#3385FF', glow: '#66A3FF' }, 'Brooklyn': { base: '#FF6B35', emissive: '#FF8A5C', glow: '#FFA982' }, 'Queens': { base: '#FFD700', emissive: '#FFE033', glow: '#FFEA66' }, 'Bronx': { base: '#50C878', emissive: '#70D88F', glow: '#90E7A6' }, 'Staten Island': { base: '#9B59B6', emissive: '#AE7AC7', glow: '#C19AD7' } };

function Borough({ name, coordinates, isHovered, isSelected, onClick, onHover, animationDelay }: { name: string; coordinates: number[][][][]; isHovered: boolean; isSelected: boolean; onClick: () => void; onHover: (h: boolean) => void; animationDelay: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { if (groupRef.current) { gsap.from(groupRef.current.position, { y: -50, duration: 1.5, delay: animationDelay, ease: 'elastic.out(1, 0.5)', onComplete: () => setMounted(true) }); gsap.from(groupRef.current.scale, { x: 0, y: 0, z: 0, duration: 1.5, delay: animationDelay, ease: 'back.out(1.7)' }); } }, [animationDelay]);
  useEffect(() => { if (groupRef.current && mounted) gsap.to(groupRef.current.position, { z: isSelected ? 5 : 0, duration: 0.6, ease: 'power2.out' }); }, [isSelected, mounted]);
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
  return (<group ref={groupRef}><mesh ref={meshRef} geometry={geometry} onClick={onClick} onPointerOver={() => onHover(true)} onPointerOut={() => onHover(false)} castShadow receiveShadow><meshPhysicalMaterial color={colors.base} emissive={colors.emissive} emissiveIntensity={isHovered ? 0.6 : isSelected ? 0.4 : 0.2} metalness={0.5} roughness={0.35} envMapIntensity={1.0} clearcoat={0.4} clearcoatRoughness={0.3} transparent={isHovered} opacity={isHovered ? 0.95 : 1.0} /></mesh><BoroughBuildings name={name} coordinates={coordinates} />{isHovered && <Sparkles count={50} scale={[50, 50, 10]} size={2} speed={0.4} color={colors.glow} />}</group>);
}

function BoroughBuildings({ name, coordinates }: { name: string; coordinates: number[][][][] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const buildings = useMemo(() => generateBuildings(name, coordinates), [name, coordinates]);
  const colors = BOROUGH_COLORS[name] || BOROUGH_COLORS['Manhattan'];
  const config = BOROUGH_BUILDING_CONFIG[name];
  useEffect(() => { if (!meshRef.current || buildings.length === 0) return; const dummy = new THREE.Object3D(); const base = new THREE.Color(colors.base); const emissive = new THREE.Color(colors.emissive); buildings.forEach((b, i) => { dummy.position.set(b.x, 2 + b.height / 2, -b.y); dummy.scale.set(b.width, b.height, b.depth); dummy.updateMatrix(); meshRef.current!.setMatrixAt(i, dummy.matrix); const t = config ? (b.height - config.minHeight) / (config.maxHeight - config.minHeight) : 0.5; const c = base.clone().lerp(emissive, t * 0.5); c.multiplyScalar(0.7 + t * 0.3); meshRef.current!.setColorAt(i, c); }); meshRef.current.instanceMatrix.needsUpdate = true; if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true; }, [buildings, colors, config, name]);
  useFrame((state) => { if (!meshRef.current) return; const mat = meshRef.current.material as THREE.MeshPhysicalMaterial; if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = 0.06 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02; });
  if (buildings.length === 0) return null;
  return (<instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]} castShadow receiveShadow><boxGeometry args={[1, 1, 1]} /><meshPhysicalMaterial metalness={0.6} roughness={0.3} envMapIntensity={1.0} emissive={colors.base} emissiveIntensity={0.06} clearcoat={0.2} clearcoatRoughness={0.5} /></instancedMesh>);
}

function Scene({ boroughs, showTaxData = true, autoRotate = true }: { boroughs: BoroughData[]; showTaxData?: boolean; autoRotate?: boolean }) {
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  return (<>
    <color attach="background" args={['#0f172a']} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow><planeGeometry args={[500, 500]} /><meshStandardMaterial color="#0f1419" roughness={0.95} metalness={0.05} envMapIntensity={0.1} emissive="#0a0e14" emissiveIntensity={0.1} /></mesh>
    <gridHelper args={[400, 40, '#334155', '#1e293b']} position={[0, -0.4, 0]} />
    <ContactShadows position={[0, -0.45, 0]} opacity={0.5} scale={200} blur={2} far={50} resolution={512} color="#000020" />
    <PerspectiveCamera makeDefault position={[120, 140, 120]} fov={60} />
    <OrbitControls enablePan enableZoom enableRotate enableDamping dampingFactor={0.15} minDistance={40} maxDistance={300} maxPolarAngle={Math.PI / 1.1} minPolarAngle={Math.PI / 8} rotateSpeed={0.6} zoomSpeed={1.0} panSpeed={0.6} autoRotate={autoRotate} autoRotateSpeed={0.5} />
    <ambientLight intensity={0.3} color="#556b8a" />
    <directionalLight position={[100, 120, 80]} intensity={1.2} color="#ffe4b5" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-200} shadow-camera-right={200} shadow-camera-top={200} shadow-camera-bottom={-200} shadow-camera-near={0.5} shadow-camera-far={500} shadow-bias={-0.0003} shadow-radius={2} />
    <directionalLight position={[80, 100, -60]} intensity={0.5} color="#ffd4a3" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-150} shadow-camera-right={150} shadow-camera-top={150} shadow-camera-bottom={-150} shadow-bias={-0.0002} />
    <directionalLight position={[-50, 60, -40]} intensity={0.4} color="#7da3cc" />
    <directionalLight position={[-30, 30, 50]} intensity={0.3} color="#c4b5fd" />
    <hemisphereLight intensity={0.4} color="#b8d4ff" groundColor="#3b4252" />
    <Environment preset="city" background={false} environmentIntensity={0.6} />
    <fog attach="fog" args={["#1e2847", 150, 400]} />
    <Stars radius={300} depth={60} count={3000} factor={6} saturation={0.5} fade speed={0.5} />
    {boroughs.map((b, i) => <Borough key={b.name} name={b.name} coordinates={b.coordinates} isHovered={hoveredBorough === b.name} isSelected={selectedBorough === b.name} onClick={() => setSelectedBorough(selectedBorough === b.name ? null : b.name)} onHover={(h) => setHoveredBorough(h ? b.name : null)} animationDelay={i * 0.2} />)}
    {(hoveredBorough || selectedBorough) && (() => { const b = hoveredBorough || selectedBorough || ''; const td = BOROUGH_TAX_DATA[b]; const bi = BOROUGH_INFO[b]; const bc = BOROUGH_COLORS[b]; return (<Html position={[0, 40, 0]} center><div className="bg-white rounded-lg shadow-lg px-6 py-4 border border-gray-200 max-w-sm pointer-events-none"><h3 className="text-2xl font-bold mb-3" style={{ color: bc?.base || '#000' }}>{b}</h3>{showTaxData && td && <div className="mb-3"><p className="text-3xl font-bold text-gray-900">${(td.revenue / 1e9).toFixed(2)}B</p><p className="text-sm text-gray-500 mt-1">Tax Revenue Potential</p></div>}{showTaxData && td && <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-200"><div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Billionaire Tax</p><p className="text-lg font-semibold text-gray-900">{(td.billionaireTaxShare * 100).toFixed(0)}%</p></div><div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Corporate Tax</p><p className="text-lg font-semibold text-gray-900">{(td.corporateTaxShare * 100).toFixed(0)}%</p></div></div>}{bi && <div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Population</p><p className="font-semibold text-gray-900">{(bi.population / 1e6).toFixed(2)}M</p></div><div><p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Area</p><p className="font-semibold text-gray-900">{bi.area} mi²</p></div></div>}</div></Html>); })()}
    <EffectComposer multisampling={4}><N8AO aoRadius={0.5} intensity={1.0} quality="performance" halfRes /><Bloom intensity={0.3} luminanceThreshold={0.6} luminanceSmoothing={0.7} mipmapBlur /><Vignette offset={0.3} darkness={0.4} eskil={false} /></EffectComposer>
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
      <div className="bg-black/70 backdrop-blur-xl p-5 rounded-2xl border border-white/15"><h1 className="text-2xl font-bold mb-1 text-white">{title}</h1><p className="text-xs text-zinc-400 mb-4">{description}</p><div className="space-y-1.5">{Object.entries(BOROUGH_COLORS).map(([n, c]) => { const td = BOROUGH_TAX_DATA[n]; return (<div key={n} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"><div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded" style={{ backgroundColor: c.base, boxShadow: `0 0 8px ${c.glow}` }} /><span className="text-xs font-medium text-white">{n}</span></div>{showTaxData && td && <span className="text-xs font-semibold text-emerald-400">${(td.revenue / 1e9).toFixed(1)}B</span>}</div>); })}</div></div>
      <div className="bg-black/70 backdrop-blur-xl p-4 rounded-2xl border border-white/15"><div className="text-xs text-zinc-400 mb-3"><p>Drag to rotate · Scroll to zoom · Click for details</p></div><button onClick={() => setAutoRotate(!autoRotate)} className={`w-full px-3 py-2 rounded-lg font-medium text-xs transition-all ${autoRotate ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/10 text-white hover:bg-white/20'}`}>{autoRotate ? 'Pause Rotation' : 'Auto Rotate'}</button></div>
    </div>
    <Canvas shadows gl={{ antialias: true, alpha: false, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.9 }} dpr={[1, 2]}><Suspense fallback={null}><Scene boroughs={boroughs} showTaxData={showTaxData} autoRotate={autoRotate} /></Suspense></Canvas>
  </div>);
}
