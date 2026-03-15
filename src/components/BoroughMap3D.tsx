"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Html } from '@react-three/drei';
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
  coordinates: number[][][][]; // Array of polygons (MultiPolygon support)
  isHovered: boolean;
  isSelected: boolean;
  onClick: () => void;
  onHover: (hovered: boolean) => void;
}

function Borough({ name, coordinates, isHovered, isSelected, onClick, onHover }: BoroughProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Convert GeoJSON coordinates to Three.js shape
  const geometry = useMemo(() => {
    if (!coordinates || coordinates.length === 0) {
      console.error(`[Borough:${name}] No coordinates provided!`);
      return new THREE.BoxGeometry(1, 1, 1);
    }
    
    console.log(`[Borough:${name}] Creating geometry with ${coordinates.length} polygon(s)`);
    const shapes: THREE.Shape[] = [];

    // Iterate over all polygons in the MultiPolygon
    coordinates.forEach((polygon, polyIndex) => {
      if (!polygon || polygon.length === 0) {
        console.warn(`[Borough:${name}] Empty polygon at index ${polyIndex}`);
        return;
      }
      
      console.log(`[Borough:${name}] Processing polygon ${polyIndex} with ${polygon.length} ring(s)`);
      
      // First ring is the outer boundary
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
        
        // Convert longitude/latitude to x/y coordinates
        // NYC is roughly centered at [-74.0, 40.7]
        // Scale and center the coordinates
        const x = (point[0] + 74.0) * 100; // Longitude
        const y = (point[1] - 40.7) * 100; // Latitude

        if (pointIndex === 0) {
          if (polyIndex === 0) {
            console.log(`[Borough:${name}] First point: [${point[0]}, ${point[1]}] -> [${x}, ${y}]`);
          }
          shape.moveTo(x, y);
        } else {
          shape.lineTo(x, y);
        }
      });
      
      // Process holes (inner rings) if they exist
      for (let ringIdx = 1; ringIdx < polygon.length; ringIdx++) {
        const holeRing = polygon[ringIdx];
        if (!holeRing || holeRing.length === 0) continue;
        
        const holePath = new THREE.Path();
        holeRing.forEach((point: any, pointIndex: number) => {
          if (!point || point.length < 2) return;
          
          const x = (point[0] + 74.0) * 100;
          const y = (point[1] - 40.7) * 100;
          
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

    // Create extruded geometry for 3D effect
    const extrudeSettings = {
      depth: isSelected ? 3 : (isHovered ? 2 : 1),
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 2
    };

    if (shapes.length === 0) {
      console.error(`[Borough:${name}] No shapes created! Cannot create geometry.`);
      return new THREE.BoxGeometry(1, 1, 1); // Fallback geometry
    }

    const extrudedGeometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
    console.log(`[Borough:${name}] Created extruded geometry:`, {
      vertices: extrudedGeometry.attributes.position.count,
      boundingBox: extrudedGeometry.boundingBox
    });
    
    return extrudedGeometry;
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
      <PerspectiveCamera makeDefault position={[0, 50, 50]} fov={50} />
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={20}
        maxDistance={150}
        maxPolarAngle={Math.PI / 2}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
      />
      
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />
      
      <Environment preset="city" />
      
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

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1a2e" />
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
        console.log('[BoroughMap3D] Starting to load borough data...');
        const response = await fetch('/borough-boundaries.geojson');
        console.log('[BoroughMap3D] Fetch response:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Failed to load borough data: ${response.status} ${response.statusText}`);
        }
        
        const geojson = await response.json();
        console.log('[BoroughMap3D] GeoJSON loaded:', {
          type: geojson.type,
          featuresCount: geojson.features?.length,
          features: geojson.features?.map((f: any) => ({
            name: f.properties?.BoroName,
            geometryType: f.geometry?.type,
            coordinatesLength: f.geometry?.coordinates?.length
          }))
        });
        
        const parsed = parseBoroughGeoJSON(geojson);
        console.log('[BoroughMap3D] Parsed boroughs:', parsed.map(b => ({
          name: b.name,
          coordinatesLength: b.coordinates?.length,
          firstRingPoints: b.coordinates?.[0]?.length
        })));
        
        if (parsed.length === 0) {
          throw new Error('No borough data parsed from GeoJSON');
        }
        
        setBoroughs(parsed);
        setLoading(false);
      } catch (err) {
        console.error('[BoroughMap3D] Error loading borough data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadBoroughData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700">
        <div className="text-white text-2xl">Loading NYC Boroughs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-900 to-blue-700">
        <div className="text-red-500 text-2xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-blue-900 via-purple-800 to-indigo-900 relative">
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
