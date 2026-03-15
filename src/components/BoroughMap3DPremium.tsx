"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  Html,
  Stars,
  Float,
  MeshDistortMaterial,
  Sparkles,
  useTexture
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
import { useControls } from 'leva';
import gsap from 'gsap';
import { parseBoroughGeoJSON, BOROUGH_INFO, BoroughData } from '@/lib/boroughData';

// Premium SimCity-inspired colors with metallic sheen
const BOROUGH_COLORS: Record<string, { base: string; emissive: string; glow: string }> = {
  'Manhattan': { base: '#FF6B6B', emissive: '#FF3333', glow: '#FF9999' },
  'Brooklyn': { base: '#4ECDC4', emissive: '#2EAD9D', glow: '#6EDDD4' },
  'Queens': { base: '#FFE66D', emissive: '#FFD633', glow: '#FFF09D' },
  'Bronx': { base: '#95E1D3', emissive: '#75C1B3', glow: '#B5F1E3' },
  'Staten Island': { base: '#C7CEEA', emissive: '#A7AECA', glow: '#E7EEFA' }
};

interface BoroughProps {
  name: string;
  coordinates: number[][][];
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
  animationDelay: number;
}

// Custom shader material for premium look
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
    
    // Add subtle wave effect on hover
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
    
    // Add scanline effect
    float scanline = sin(vUv.y * 50.0 + time * 5.0) * 0.05 + 0.95;
    color *= scanline;
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

function Borough({ name, coordinates, isHovered, isSelected, onClick, onHover, animationDelay }: BoroughProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  // Animate entry
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

  // Animate selection
  useEffect(() => {
    if (meshRef.current && mounted) {
      gsap.to(meshRef.current.position, {
        z: isSelected ? 5 : 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }, [isSelected, mounted]);

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

    // Gentle floating animation
    if (meshRef.current && mounted) {
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2 + animationDelay) * 0.002;
    }
  });

  const geometry = useMemo(() => {
    const shapes: THREE.Shape[] = [];

    coordinates.forEach((polygon) => {
      const shape = new THREE.Shape();
      
      polygon.forEach((ring) => {
        ring.forEach((point: any, pointIndex: number) => {
          const x = (point[0] + 74.0) * 100;
          const y = (point[1] - 40.7) * 100;

          if (pointIndex === 0) {
            shape.moveTo(x, y);
          } else {
            shape.lineTo(x, y);
          }
        });
      });

      shapes.push(shape);
    });

    const extrudeSettings = {
      depth: 2,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.2,
      bevelSegments: 3,
      curveSegments: 12
    };

    return new THREE.ExtrudeGeometry(shapes, extrudeSettings);
  }, [coordinates]);

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

      {/* Glow particles when hovered */}
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

// Floating particles for atmosphere
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
}

function Scene({ boroughs }: SceneProps) {
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);

  // Leva debug controls
  const { 
    bloomIntensity,
    bloomRadius,
    dofFocusDistance,
    dofBokehScale,
    ssaoIntensity,
    enableEffects,
    showParticles
  } = useControls('Visual Effects', {
    bloomIntensity: { value: 2.0, min: 0, max: 5, step: 0.1 },
    bloomRadius: { value: 1.0, min: 0, max: 2, step: 0.1 },
    dofFocusDistance: { value: 0.05, min: 0, max: 1, step: 0.01 },
    dofBokehScale: { value: 3, min: 0, max: 10, step: 0.5 },
    ssaoIntensity: { value: 50, min: 0, max: 100, step: 1 },
    enableEffects: true,
    showParticles: true
  });

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
      
      {/* Premium lighting setup */}
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
      
      {/* Atmospheric particles */}
      {showParticles && <AtmosphericParticles />}
      
      {/* Boroughs with staggered animation */}
      {boroughs.map((borough, index) => (
        <Borough
          key={borough.name}
          name={borough.name}
          coordinates={borough.coordinates}
          isHovered={hoveredBorough === borough.name}
          isSelected={selectedBorough === borough.name}
          onClick={() => {
            setSelectedBorough(borough.name);
            // Camera animation to selected borough
            // (would need camera ref for full implementation)
          }}
          onHover={(hovered) => setHoveredBorough(hovered ? borough.name : null)}
          animationDelay={index * 0.2}
        />
      ))}

      {/* Premium info overlay with glassmorphism */}
      {(hoveredBorough || selectedBorough) && (
        <Html position={[0, 40, 0]} center>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-xl" />
            <div className="relative bg-white/10 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl border border-white/20 max-w-xs">
              <h3 
                className="font-bold text-2xl mb-2 animate-pulse"
                style={{ 
                  color: BOROUGH_COLORS[hoveredBorough || selectedBorough || '']?.glow || '#fff',
                  textShadow: `0 0 20px ${BOROUGH_COLORS[hoveredBorough || selectedBorough || '']?.emissive}`
                }}
              >
                {hoveredBorough || selectedBorough}
              </h3>
              {BOROUGH_INFO[hoveredBorough || selectedBorough || ''] && (
                <div className="text-sm space-y-2 text-white">
                  <p className="text-gray-200">{BOROUGH_INFO[hoveredBorough || selectedBorough || ''].description}</p>
                  <div className="flex justify-between text-xs pt-2 border-t border-white/20">
                    <span className="font-semibold">👥 {(BOROUGH_INFO[hoveredBorough || selectedBorough || ''].population / 1000000).toFixed(2)}M</span>
                    <span className="font-semibold">📏 {BOROUGH_INFO[hoveredBorough || selectedBorough || ''].area} mi²</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Html>
      )}

      {/* Elevated ground plane with grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial 
          color="#0a0a1e" 
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Grid helper for depth */}
      <gridHelper args={[300, 30, '#4ECDC4', '#2EAD9D']} position={[0, -0.9, 0]} />

      {/* Post-processing effects */}
      {enableEffects && (
        <EffectComposer>
          <Bloom 
            intensity={bloomIntensity} 
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            radius={bloomRadius}
          />
          <DepthOfField 
            focusDistance={dofFocusDistance}
            focalLength={0.02}
            bokehScale={dofBokehScale}
          />
          <SSAO 
            intensity={ssaoIntensity}
            radius={10}
            luminanceInfluence={0.6}
          />
          <ChromaticAberration offset={[0.001, 0.001]} />
          <Vignette eskil={false} offset={0.1} darkness={0.5} />
          <ToneMapping />
        </EffectComposer>
      )}
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
            Loading Premium Experience
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

export default function BoroughMap3DPremium() {
  const [boroughs, setBoroughs] = useState<BoroughData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoroughData() {
      try {
        const response = await fetch('/borough-boundaries.geojson');
        if (!response.ok) {
          throw new Error('Failed to load borough data');
        }
        const geojson = await response.json();
        const parsed = parseBoroughGeoJSON(geojson);
        setBoroughs(parsed);
        setTimeout(() => setLoading(false), 500); // Smooth transition
      } catch (err) {
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
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Premium info panel */}
      <div className="absolute top-6 left-6 z-10 space-y-4 max-w-sm">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative bg-black/40 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/10">
            <h1 className="text-3xl md:text-4xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              NYC Boroughs
            </h1>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              AAA Game-Quality 3D Visualization
            </p>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(BOROUGH_COLORS).map(([name, colors]) => (
                <div 
                  key={name} 
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl transition-all cursor-pointer group/item border border-white/5"
                >
                  <div 
                    className="w-5 h-5 rounded-lg shadow-lg group-hover/item:scale-110 transition-transform" 
                    style={{ 
                      backgroundColor: colors.base,
                      boxShadow: `0 0 20px ${colors.glow}`
                    }} 
                  />
                  <span className="text-sm font-semibold text-white">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-xl" />
          <div className="relative bg-black/40 backdrop-blur-2xl p-4 rounded-2xl border border-white/10">
            <p className="text-xs font-bold text-emerald-400 mb-2">🎮 PREMIUM CONTROLS</p>
            <div className="text-xs text-gray-300 space-y-1">
              <p>🖱️ Drag to rotate (auto-rotating)</p>
              <p>🔍 Scroll to zoom</p>
              <p>👆 Click borough for details</p>
              <p>⚙️ Use Leva panel for tweaks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature badges */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        {['Bloom', 'DOF', 'SSAO', 'Shaders', 'GSAP'].map((effect) => (
          <div 
            key={effect}
            className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-xl px-4 py-2 rounded-full border border-white/20 text-white text-xs font-bold shadow-lg"
          >
            ✨ {effect}
          </div>
        ))}
      </div>

      <Canvas shadows gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <Scene boroughs={boroughs} />
        </Suspense>
      </Canvas>
    </div>
  );
}
