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

// Tax revenue data per borough (optional overlay)
const BOROUGH_TAX_DATA: Record<string, { revenue: number; billionaireTaxShare: number; corporateTaxShare: number }> = {
  'Manhattan': { revenue: 8000000000, billionaireTaxShare: 0.6, corporateTaxShare: 0.5 },
  'Brooklyn': { revenue: 3500000000, billionaireTaxShare: 0.15, corporateTaxShare: 0.2 },
  'Queens': { revenue: 2800000000, billionaireTaxShare: 0.1, corporateTaxShare: 0.15 },
  'Bronx': { revenue: 1200000000, billionaireTaxShare: 0.05, corporateTaxShare: 0.08 },
  'Staten Island': { revenue: 800000000, billionaireTaxShare: 0.1, corporateTaxShare: 0.07 }
};

// Premium SimCity-inspired colors
const BOROUGH_COLORS: Record<string, { base: string; emissive: string; glow: string }> = {
  'Manhattan': { base: '#FF6B6B', emissive: '#FF3333', glow: '#FF9999' },
  'Brooklyn': { base: '#4ECDC4', emissive: '#2EAD9D', glow: '#6EDDD4' },
  'Queens': { base: '#FFE66D', emissive: '#FFD633', glow: '#FFF09D' },
  'Bronx': { base: '#95E1D3', emissive: '#75C1B3', glow: '#B5F1E3' },
  'Staten Island': { base: '#C7CEEA', emissive: '#A7AECA', glow: '#E7EEFA' }
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
  const materialRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  // Entry animation
  useEffect(() => {
    if (meshRef.current) {
      gsap.from(meshRef.current.position, {
        y: -50,
        duration: 1.5,
        delay: animationDelay,
        ease: 'elastic.out(1, 0.5)',
        onComplete: () => setMounted(true)
      });
      
      gsap.from(meshRef.current.scale, {
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
    if (meshRef.current && mounted) {
      gsap.to(meshRef.current.position, {
        z: isSelected ? 5 : 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }, [isSelected, mounted]);

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
    if (meshRef.current && mounted) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2 + animationDelay) * 0.002;
    }
  });

  const geometry = useMemo(() => {
    if (!coordinates || coordinates.length === 0) {
      console.error(`[Borough:${name}] No coordinates provided!`);
      return new THREE.BoxGeometry(1, 1, 1);
    }
    
    console.log(`[Borough:${name}] Creating geometry with ${coordinates.length} polygon(s)`);
    const shapes: THREE.Shape[] = [];

    // NYC center coordinates (from BoroughMap3D - better transformation)
    const NYC_CENTER_LON = -73.978;
    const NYC_CENTER_LAT = 40.706;
    const SCALE = 400;

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
      
      // Process outer boundary
      outerRing.forEach((point: any, pointIndex: number) => {
        if (!point || point.length < 2) {
          console.warn(`[Borough:${name}] Invalid point at ${polyIndex}.${pointIndex}:`, point);
          return;
        }
        
        const x = (point[0] - NYC_CENTER_LON) * SCALE;
        const y = (point[1] - NYC_CENTER_LAT) * SCALE;

        if (pointIndex === 0) {
          if (polyIndex === 0) {
            console.log(`[Borough:${name}] First point: [${point[0]}, ${point[1]}] -> [${x}, ${y}]`);
          }
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      });
      
      // Process holes
      for (let ringIdx = 1; ringIdx < polygon.length; ringIdx++) {
        const holeRing = polygon[ringIdx];
        if (!holeRing || holeRing.length === 0) continue;
        
        const holePath = new THREE.Path();
        holeRing.forEach((point: any, pointIndex: number) => {
          if (!point || point.length < 2) return;
          
          const x = (point[0] - NYC_CENTER_LON) * SCALE;
          const y = (point[1] - NYC_CENTER_LAT) * SCALE;
          
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
      bevelSegments: 3,
      curveSegments: 12
    };

    if (shapes.length === 0) {
      console.error(`[Borough:${name}] No shapes created! Cannot create geometry.`);
      return new THREE.BoxGeometry(1, 1, 1);
    }

    const extrudedGeometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
    console.log(`[Borough:${name}] Created extruded geometry:`, {
      vertices: extrudedGeometry.attributes.position.count,
      boundingBox: extrudedGeometry.boundingBox
    });
    
    return extrudedGeometry;
  }, [coordinates, name]);

  const colors = BOROUGH_COLORS[name] || BOROUGH_COLORS['Manhattan'];

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={onClick}
        onPointerOver={() => onHover(true)}
        onPointerOut={() => onHover(false)}
        castShadow
        receiveShadow
      >
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{
            baseColor: { value: new THREE.Color(colors.base) },
            emissiveColor: { value: new THREE.Color(colors.emissive) },
            time: { value: 0 },
            hover: { value: 0 },
            selected: { value: 0 }
          }}
        />
      </mesh>

      {/* Sparkles on hover */}
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

function Scene({ boroughs, showTaxData = true }: SceneProps) {
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 60, 80]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={30}
        maxDistance={200}
        maxPolarAngle={Math.PI / 2.2}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        autoRotate
        autoRotateSpeed={0.3}
      />
      
      {/* Premium lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={1.5} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-20, 20, -10]} intensity={0.8} color="#4ECDC4" />
      <pointLight position={[20, 10, 20]} intensity={0.8} color="#FFE66D" />
      <spotLight
        position={[0, 50, 0]}
        angle={0.6}
        penumbra={1}
        intensity={1}
        castShadow
        color="#ffffff"
      />
      
      <Environment preset="night" />
      <Stars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <AtmosphericParticles />
      
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

      {/* Info overlay */}
      {(hoveredBorough || selectedBorough) && (() => {
        const borough = hoveredBorough || selectedBorough || '';
        const taxData = BOROUGH_TAX_DATA[borough];
        const boroughInfo = BOROUGH_INFO[borough];
        const colors = BOROUGH_COLORS[borough];

        return (
          <Html position={[0, 40, 0]} center>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-blue-500/40 blur-2xl" />
              <div className="relative bg-black/80 backdrop-blur-xl px-8 py-6 rounded-3xl shadow-2xl border-2 border-white/30 max-w-md">
                <h3 
                  className="font-black text-3xl mb-3 drop-shadow-lg"
                  style={{ 
                    color: colors?.glow || '#fff',
                    textShadow: `0 0 30px ${colors?.emissive}, 0 2px 10px rgba(0,0,0,0.8)`
                  }}
                >
                  {borough}
                </h3>
                
                {showTaxData && taxData && (
                  <div className="mb-4 p-4 bg-white/10 rounded-xl border border-white/20">
                    <p className="text-sm font-bold text-white mb-2 drop-shadow">Tax Revenue Potential</p>
                    <p className="text-2xl font-black text-emerald-400 drop-shadow-lg">
                      ${(taxData.revenue / 1000000000).toFixed(2)}B
                    </p>
                    <div className="mt-3 space-y-1 text-xs text-white">
                      <p className="drop-shadow">💰 Billionaire Tax: {(taxData.billionaireTaxShare * 100).toFixed(0)}% share</p>
                      <p className="drop-shadow">🏢 Corporate Tax: {(taxData.corporateTaxShare * 100).toFixed(0)}% share</p>
                    </div>
                  </div>
                )}

                {boroughInfo && (
                  <div className="text-sm space-y-2 text-white">
                    <p className="text-gray-100 drop-shadow leading-relaxed">{boroughInfo.description}</p>
                    <div className="flex justify-between text-xs pt-3 border-t border-white/20">
                      <span className="font-bold drop-shadow">👥 {(boroughInfo.population / 1000000).toFixed(2)}M</span>
                      <span className="font-bold drop-shadow">📏 {boroughInfo.area} mi²</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Html>
        );
      })()}

      {/* Ground plane with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial 
          color="#0a0a1e" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
      <gridHelper args={[300, 30, '#4ECDC4', '#2EAD9D']} position={[0, -0.9, 0]} />

      {/* Post-processing - DISABLED TO FIX RENDERING */}
      {/* <EffectComposer>
        <Bloom 
          intensity={2.0} 
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          radius={1.0}
        />
        <DepthOfField 
          focusDistance={0.05}
          focalLength={0.02}
          bokehScale={3}
        />
        <SSAO 
          intensity={50}
          radius={10}
          luminanceInfluence={0.6}
        />
        <ChromaticAberration offset={[0.001, 0.001]} />
        <Vignette eskil={false} offset={0.1} darkness={0.5} />
        <ToneMapping />
      </EffectComposer> */}
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
  title = "NYC Borough 3D Map",
  description = "Interactive 3D visualization of NYC's 5 boroughs"
}: BoroughMap3DUnifiedProps) {
  const [boroughs, setBoroughs] = useState<BoroughData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-900 to-blue-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

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
              <div className="bg-white/10 p-4 rounded-xl border border-white/20 mb-4">
                <p className="text-sm text-gray-200 drop-shadow">
                  <span className="font-bold text-white">💡 Data Source:</span> Tax revenue projections from billionaire and corporate tax reform proposals (2026)
                </p>
              </div>
            )}

            {/* Borough legend */}
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

        {/* Controls */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 blur-xl" />
          <div className="relative bg-black/70 backdrop-blur-2xl p-5 rounded-2xl border-2 border-white/20">
            <p className="text-sm font-black text-emerald-400 mb-3 drop-shadow">🎮 CONTROLS</p>
            <div className="text-sm text-white space-y-2 drop-shadow-md">
              <p className="font-semibold">🖱️ Drag to rotate (auto-rotating)</p>
              <p className="font-semibold">🔍 Scroll to zoom in/out</p>
              <p className="font-semibold">👆 Click borough for details</p>
              <p className="font-semibold">✨ Hover for sparkles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature badges */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        {['3D Boroughs', 'Interactive', 'GSAP'].map((effect) => (
          <div 
            key={effect}
            className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 backdrop-blur-xl px-5 py-2 rounded-full border-2 border-white/30 text-white text-sm font-bold shadow-lg drop-shadow-lg"
          >
            ✨ {effect}
          </div>
        ))}
      </div>

      <Canvas shadows gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene boroughs={boroughs} showTaxData={showTaxData} />
        </Suspense>
      </Canvas>
    </div>
  );
}
