'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useState, useEffect } from 'react';
import { BuildingSpawnCinematic } from '@/components/animations/BuildingSpawnCinematic';
import { SubwayLineCinematic } from '@/components/animations/SubwayLineCinematic';
import { ParkGrowthCinematic } from '@/components/animations/ParkGrowthCinematic';
import { useCameraShake } from '@/components/animations/CameraShake';
import { useSoundEffects } from '@/components/animations/SoundManager';

export default function AnimationsCinematic() {
  const [taxRate, setTaxRate] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const handleSpawn = () => {
    setSpawnedCount(0);
    setIsPlaying(true);
    
    setTimeout(() => setIsPlaying(false), 12000);
  };

  const handleReset = () => {
    setSpawnedCount(0);
    setIsPlaying(false);
  };

  return (
    <div className="w-full h-screen bg-black">
      {/* Controls Panel */}
      <div className="absolute top-4 left-4 z-10 bg-gray-900/95 backdrop-blur-sm p-6 rounded-xl shadow-2xl text-white max-w-md border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            🎬 Cinematic Animations
          </h1>
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) {
                // Enable sound on first interaction
                const audio = new AudioContext();
                audio.resume();
              }
            }}
            className="text-2xl hover:scale-110 transition-transform"
            title={soundEnabled ? 'Mute' : 'Enable Sound'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
        </div>
        
        <div className="space-y-4">
          {/* Tax Rate Slider */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tax Rate: <span className="text-blue-400 font-bold">{taxRate}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full accent-blue-500"
              disabled={isPlaying}
            />
            <p className="text-xs text-gray-400 mt-1">
              {taxRate > 50 ? '🏘️ Focus: Social programs' : '🚇 Focus: Infrastructure'}
            </p>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Improvements:</span>
                <span className="font-bold text-green-400 text-xl">{spawnedCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Status:</span>
                <span className={`font-bold ${isPlaying ? 'text-yellow-400 animate-pulse' : 'text-gray-500'}`}>
                  {isPlaying ? '⚡ BUILDING...' : '✓ Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSpawn}
              disabled={isPlaying}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-bold transition-all transform hover:scale-105 disabled:scale-100 shadow-lg"
            >
              {isPlaying ? '🏗️ Building City...' : '🎬 Start Animation'}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3 bg-red-600/80 hover:bg-red-700 rounded-lg font-medium transition-all hover:scale-105 shadow-lg"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Effects Legend */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h3 className="text-sm font-semibold mb-3 text-gray-300">✨ Cinematic Effects</h3>
          <div className="space-y-1.5 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">✦</span>
              <span>Construction cranes + dust particles</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">⚡</span>
              <span>Light trails + energy pulses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">🌳</span>
              <span>Organic growth + crowd simulation</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-400">✨</span>
              <span>Bloom/glow post-processing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-orange-400">📹</span>
              <span>Camera shake on large spawns</span>
            </div>
          </div>
        </div>

        {/* Quality Badge */}
        <div className="mt-4 text-center">
          <div className="inline-block bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 py-1">
            <span className="text-xs font-semibold text-yellow-300">
              🎯 Disney/Pixar Quality
            </span>
          </div>
        </div>
      </div>

      {/* Performance Monitor */}
      <div className="absolute top-4 right-4 z-10 bg-gray-900/95 backdrop-blur-sm p-4 rounded-xl shadow-2xl text-white border border-gray-700">
        <h3 className="text-sm font-semibold mb-2 text-gray-300">⚡ Performance</h3>
        <div className="text-xs space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Target:</span>
            <span className="text-green-400 font-mono">60 FPS</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Particles:</span>
            <span className="text-blue-400 font-mono">Active</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Bloom:</span>
            <span className="text-purple-400 font-mono">Enabled</span>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas shadows gl={{ antialias: true, alpha: false }}>
        <SceneContent 
          isPlaying={isPlaying} 
          taxRate={taxRate}
          onSpawnComplete={() => setSpawnedCount(prev => prev + 1)}
          soundEnabled={soundEnabled}
        />
      </Canvas>
    </div>
  );
}

function SceneContent({ 
  isPlaying, 
  taxRate,
  onSpawnComplete,
  soundEnabled
}: { 
  isPlaying: boolean;
  taxRate: number;
  onSpawnComplete: () => void;
  soundEnabled: boolean;
}) {
  const { shake } = useCameraShake();
  const { playSound, enableSound, disableSound } = useSoundEffects();

  // Enable/disable sound based on toggle
  useEffect(() => {
    if (soundEnabled) {
      enableSound();
    } else {
      disableSound();
    }
  }, [soundEnabled, enableSound, disableSound]);

  const handleBuildingSpawn = () => {
    shake(0.15);
    if (soundEnabled) {
      playSound('construction', 0.2);
      setTimeout(() => playSound('complete', 0.3), 1500);
    }
    onSpawnComplete();
  };

  const handleSubwaySpawn = () => {
    shake(0.25);
    if (soundEnabled) {
      playSound('crane', 0.15);
      setTimeout(() => playSound('train', 0.2), 1000);
    }
    onSpawnComplete();
  };

  const handleParkSpawn = () => {
    shake(0.1);
    if (soundEnabled) {
      playSound('nature', 0.3);
      setTimeout(() => playSound('crowd', 0.15), 2000);
    }
    onSpawnComplete();
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[12, 10, 12]} fov={50} />
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05}
        minDistance={6}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.1}
        enablePan={false}
      />

      {/* Lighting Setup */}
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[15, 20, 10]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      <hemisphereLight intensity={0.4} groundColor="#1a1a2e" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        castShadow
      />

      {/* Environment for reflections */}
      <Environment preset="city" />

      {/* Ground Grid */}
      <Grid
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#3b82f6"
        sectionSize={5}
        sectionThickness={1.2}
        sectionColor="#8b5cf6"
        fadeDistance={35}
        fadeStrength={1}
        position={[0, -0.01, 0]}
      />

      {/* Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color="#0f0f1e" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Spawn Cinematic Improvements */}
      {isPlaying && (
        <>
          {/* Buildings (priority based on tax rate) */}
          {taxRate > 50 ? (
            <>
              <BuildingSpawnCinematic
                position={[-3, 0, -2]}
                height={2.5}
                color="#3498DB"
                delay={0}
                onComplete={handleBuildingSpawn}
              />
              <BuildingSpawnCinematic
                position={[2, 0, -3]}
                height={2}
                color="#2980B9"
                delay={0.8}
                onComplete={handleBuildingSpawn}
              />
            </>
          ) : (
            <BuildingSpawnCinematic
              position={[-3, 0, -2]}
              height={2}
              color="#3498DB"
              delay={3}
              onComplete={handleBuildingSpawn}
            />
          )}

          {/* Subway Lines */}
          <SubwayLineCinematic
            points={[
              [-5, 0, -5],
              [-2, 0, -3],
              [1, 0, -1],
              [4, 0, 1],
              [7, 0, 3]
            ]}
            color="#E74C3C"
            delay={taxRate > 50 ? 2.5 : 0}
            onComplete={handleSubwaySpawn}
          />

          {/* Parks */}
          <ParkGrowthCinematic
            position={[4, 0, -4]}
            size={2.5}
            delay={1.5}
            onComplete={handleParkSpawn}
          />
          <ParkGrowthCinematic
            position={[-4, 0, 3]}
            size={2}
            delay={2.2}
            onComplete={handleParkSpawn}
          />
        </>
      )}

      {/* Post-Processing Effects */}
      <EffectComposer>
        <Bloom 
          intensity={1.2}
          luminanceThreshold={0.3}
          luminanceSmoothing={0.9}
          height={300}
        />
        <Vignette 
          offset={0.3} 
          darkness={0.5} 
          eskil={false}
        />
      </EffectComposer>
    </>
  );
}
