"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import { Suspense, useState, useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { parseBoroughGeoJSON, BOROUGH_INFO, BoroughData } from '@/lib/boroughData';

// NYC Borough colors - SimCity vibrant style
const BOROUGH_COLORS: Record<string, string> = {
  'Manhattan': '#FF6B6B',
  'Brooklyn': '#4ECDC4',
  'Queens': '#FFE66D',
  'Bronx': '#95E1D3',
  'Staten Island': '#C7CEEA'
};

interface BoroughProps {
  name: string;
  coordinates: number[][][];
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

function Borough({ name, coordinates, isHovered, isSelected, onClick, onHover }: BoroughProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Convert GeoJSON coordinates to Three.js shape
  const geometry = useMemo(() => {
    const shapes: THREE.Shape[] = [];

    // NYC center coordinates (from bounding box analysis)
    const NYC_CENTER_LON = -73.978;
    const NYC_CENTER_LAT = 40.706;
    
    // Scale factor - larger value = bigger map
    // We want the map to be about 40-50 units wide in Three.js space
    const SCALE = 400; // This will make ~0.55 lon range = ~220 units

    coordinates.forEach((polygon) => {
      const shape = new THREE.Shape();
      
      polygon.forEach((ring, ringIndex) => {
        ring.forEach((point: any, pointIndex: number) => {
          // Convert longitude/latitude to x/y coordinates
          // Center around NYC and scale up for visibility
          const x = (point[0] - NYC_CENTER_LON) * SCALE;
          const y = (point[1] - NYC_CENTER_LAT) * SCALE;

          if (pointIndex === 0) {
            shape.moveTo(x, y);
          } else {
            shape.lineTo(x, y);
          }
        });
      });

      shapes.push(shape);
    });

    // Create extruded geometry for 3D effect
    const extrudeSettings = {
      depth: isSelected ? 3 : (isHovered ? 2 : 1),
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2
    };

    return new THREE.ExtrudeGeometry(shapes, extrudeSettings);
  }, [coordinates, isHovered, isSelected]);

  const color = BOROUGH_COLORS[name] || '#FFFFFF';

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onClick={onClick}
      onPointerOver={() => onHover(true)}
      onPointerOut={() => onHover(false)}
      position={[0, 0, 0]}
    >
      <meshStandardMaterial
        color={color}
        emissive={isHovered || isSelected ? color : '#000000'}
        emissiveIntensity={isHovered ? 0.5 : (isSelected ? 0.3 : 0)}
        metalness={0.2}
        roughness={0.4}
      />
    </mesh>
  );
}

interface SceneProps {
  boroughs: BoroughData[];
}

function Scene({ boroughs }: SceneProps) {
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);

  return (
    <>
      {/* Top-down camera view - map is horizontal, boroughs extrude upward */}
      <PerspectiveCamera makeDefault position={[0, 200, 0]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={100}
        maxDistance={500}
        maxPolarAngle={Math.PI / 2}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        target={[0, 0, 0]}
      />
      
      {/* Clean, bright lighting for professional aesthetic */}
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-10, 10, -5]} intensity={0.6} />
      <hemisphereLight intensity={0.5} groundColor="#ffffff" />
      
      {boroughs.map((borough) => (
        <Borough
          key={borough.name}
          name={borough.name}
          coordinates={borough.coordinates}
          isHovered={hoveredBorough === borough.name}
          isSelected={selectedBorough === borough.name}
          onClick={() => setSelectedBorough(borough.name)}
          onHover={(hovered) => setHoveredBorough(hovered ? borough.name : null)}
        />
      ))}

      {/* Info overlay */}
      {(hoveredBorough || selectedBorough) && (
        <Html position={[0, 30, 0]} center>
          <div className="bg-white/95 px-4 py-3 rounded-xl shadow-2xl text-black backdrop-blur-sm border-2 border-gray-200 max-w-xs">
            <h3 className="font-bold text-xl mb-1" style={{ color: BOROUGH_COLORS[hoveredBorough || selectedBorough || ''] }}>
              {hoveredBorough || selectedBorough}
            </h3>
            {BOROUGH_INFO[hoveredBorough || selectedBorough || ''] && (
              <div className="text-sm space-y-1">
                <p className="text-gray-700">{BOROUGH_INFO[hoveredBorough || selectedBorough || ''].description}</p>
                <div className="flex justify-between text-xs text-gray-600 pt-2 border-t">
                  <span>Pop: {(BOROUGH_INFO[hoveredBorough || selectedBorough || ''].population / 1000000).toFixed(2)}M</span>
                  <span>Area: {BOROUGH_INFO[hoveredBorough || selectedBorough || ''].area} mi²</span>
                </div>
              </div>
            )}
          </div>
        </Html>
      )}

      {/* Clean white ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.0} />
      </mesh>
    </>
  );
}

export default function BoroughMap3D() {
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
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadBoroughData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-gray-800 text-2xl">Loading NYC Boroughs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-red-600 text-2xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white relative">
      {/* Info Panel */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-2xl max-w-md border-2 border-white/20">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          NYC Borough 3D Map
        </h1>
        <p className="text-sm text-gray-700 mb-3">
          Interactive 3D SimCity-style visualization
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {Object.entries(BOROUGH_COLORS).map(([name, color]) => (
            <div key={name} className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-lg">
              <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: color }} />
              <span className="text-xs font-medium">{name}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded-lg">
          <p className="font-semibold text-gray-800 mb-1">Controls:</p>
          <p>🖱️ Click + drag to rotate</p>
          <p>🔍 Scroll / pinch to zoom</p>
          <p>👆 Click borough for info</p>
          <p>📱 Touch-friendly on mobile</p>
        </div>
      </div>

      {/* Mobile Controls Hint */}
      <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg md:hidden">
        <p className="text-xs text-gray-700 font-medium">
          ↔️ Swipe to explore
        </p>
      </div>

      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene boroughs={boroughs} />
        </Suspense>
      </Canvas>
    </div>
  );
}
