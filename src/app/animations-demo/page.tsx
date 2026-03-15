'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { useState } from 'react';
import { ImprovementSpawner, ImprovementType } from '@/components/animations';

export default function AnimationsDemo() {
  const [taxRate, setTaxRate] = useState(50);
  const [funding, setFunding] = useState(0);
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpawn = () => {
    setFunding(1000 + taxRate * 20); // $1B + tax-dependent bonus
    setSpawnedCount(0);
    setIsPlaying(true);
    
    // Reset after animation completes
    setTimeout(() => setIsPlaying(false), 8000);
  };

  const handleReset = () => {
    setFunding(0);
    setSpawnedCount(0);
    setIsPlaying(false);
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-10 bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-md">
        <h1 className="text-2xl font-bold mb-4">SimCity-Style Animations</h1>
        
        <div className="space-y-4">
          {/* Tax Rate Slider */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tax Rate: {taxRate}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full"
              disabled={isPlaying}
            />
            <p className="text-xs text-gray-400 mt-1">
              {taxRate > 50 ? 'Focus: Social programs' : 'Focus: Infrastructure'}
            </p>
          </div>

          {/* Funding Display */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Available Funding
            </label>
            <div className="text-2xl font-bold text-green-400">
              ${(funding / 1000).toFixed(1)}B
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-700 p-3 rounded">
            <div className="text-sm">
              <div className="flex justify-between mb-1">
                <span>Improvements Spawned:</span>
                <span className="font-bold">{spawnedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-bold ${isPlaying ? 'text-yellow-400' : 'text-gray-400'}`}>
                  {isPlaying ? 'Building...' : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSpawn}
              disabled={isPlaying}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-medium transition-colors"
            >
              {isPlaying ? 'Building...' : 'Build City'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold mb-3">Improvement Types</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Affordable Housing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Schools</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Mental Health Facilities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Subway Lines</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Parks & Recreation</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold mb-2">Instructions</h3>
          <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
            <li>Adjust tax rate to change priorities</li>
            <li>Click "Build City" to spawn improvements</li>
            <li>Drag to rotate, scroll to zoom</li>
            <li>Watch animations unfold in sequence</li>
          </ul>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="absolute top-4 right-4 z-10 bg-gray-800 p-4 rounded-lg shadow-lg text-white">
        <h3 className="text-sm font-semibold mb-2">Performance</h3>
        <div className="text-xs text-gray-400">
          <div>Target: 60 FPS</div>
          <div className="text-green-400">Mobile-optimized ✓</div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 8, 10]} fov={50} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          minDistance={5}
          maxDistance={25}
          maxPolarAngle={Math.PI / 2.2}
        />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <hemisphereLight intensity={0.3} groundColor="#444444" />

        {/* Ground Grid */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6366f1"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#8b5cf6"
          fadeDistance={25}
          fadeStrength={1}
          position={[0, -0.01, 0]}
        />

        {/* Ground Plane for shadows */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Spawn Improvements */}
        {funding > 0 && (
          <ImprovementSpawner
            taxRate={taxRate}
            availableFunding={funding}
            onSpawnComplete={() => setSpawnedCount(prev => prev + 1)}
          />
        )}
      </Canvas>
    </div>
  );
}
