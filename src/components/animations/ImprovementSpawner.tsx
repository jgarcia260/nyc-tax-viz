'use client';

import { useState, useCallback } from 'react';
import { BuildingSpawn } from './BuildingSpawn';
import { SubwayLine } from './SubwayLine';
import { ParkGrowth } from './ParkGrowth';

export type ImprovementType = 
  | 'housing'
  | 'school'
  | 'mental-health'
  | 'subway'
  | 'park';

interface Improvement {
  id: string;
  type: ImprovementType;
  position: [number, number, number];
  data?: any;
}

interface ImprovementSpawnerProps {
  taxRate: number; // 0-100
  availableFunding: number; // in millions
  onSpawnComplete?: (improvement: Improvement) => void;
}

/**
 * Main controller that spawns improvements based on tax slider and funding
 * Determines what gets built and when
 */
export function ImprovementSpawner({
  taxRate,
  availableFunding,
  onSpawnComplete
}: ImprovementSpawnerProps) {
  const [improvements, setImprovements] = useState<Improvement[]>([]);

  // Calculate what can be built based on funding
  const affordableImprovements = useCallback(() => {
    const costs = {
      housing: 50, // $50M per building
      school: 80, // $80M per school
      'mental-health': 30, // $30M per clinic
      subway: 500, // $500M per subway extension
      park: 10 // $10M per park
    };

    const items: Improvement[] = [];
    let remaining = availableFunding;

    // Priority order based on tax rate
    // Higher tax = more social programs
    const priorities: ImprovementType[] = taxRate > 50
      ? ['housing', 'mental-health', 'park', 'school', 'subway']
      : ['subway', 'school', 'park', 'housing', 'mental-health'];

    let id = 0;

    for (const type of priorities) {
      const cost = costs[type];
      const count = Math.floor(remaining / cost);

      for (let i = 0; i < Math.min(count, 3); i++) {
        // Random positions in a grid
        const x = (Math.random() - 0.5) * 8;
        const z = (Math.random() - 0.5) * 8;

        items.push({
          id: `${type}-${id++}`,
          type,
          position: [x, 0, z],
          data: type === 'subway' ? {
            points: generateSubwayPath([x, 0, z])
          } : undefined
        });

        remaining -= cost;
      }
    }

    return items;
  }, [taxRate, availableFunding]);

  // Trigger spawn when funding changes
  const handleSpawn = useCallback(() => {
    const newImprovements = affordableImprovements();
    setImprovements(newImprovements);
  }, [affordableImprovements]);

  // Auto-spawn when funding threshold is reached
  useState(() => {
    if (availableFunding > 0) {
      handleSpawn();
    }
  });

  return (
    <>
      {improvements.map((improvement, index) => {
        const delay = index * 0.3; // Stagger animations

        switch (improvement.type) {
          case 'housing':
            return (
              <BuildingSpawn
                key={improvement.id}
                position={improvement.position}
                height={2 + Math.random()}
                color="#3498DB"
                delay={delay}
                onComplete={() => onSpawnComplete?.(improvement)}
              />
            );

          case 'school':
            return (
              <BuildingSpawn
                key={improvement.id}
                position={improvement.position}
                height={1.5}
                color="#F39C12"
                delay={delay}
                onComplete={() => onSpawnComplete?.(improvement)}
              />
            );

          case 'mental-health':
            return (
              <BuildingSpawn
                key={improvement.id}
                position={improvement.position}
                height={1}
                color="#9B59B6"
                delay={delay}
                onComplete={() => onSpawnComplete?.(improvement)}
              />
            );

          case 'subway':
            return (
              <SubwayLine
                key={improvement.id}
                points={improvement.data?.points || []}
                color="#E74C3C"
                delay={delay}
                onComplete={() => onSpawnComplete?.(improvement)}
              />
            );

          case 'park':
            return (
              <ParkGrowth
                key={improvement.id}
                position={improvement.position}
                size={1.5 + Math.random() * 0.5}
                delay={delay}
                onComplete={() => onSpawnComplete?.(improvement)}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}

// Helper: Generate random subway path
function generateSubwayPath(start: [number, number, number]): [number, number, number][] {
  const points: [number, number, number][] = [start];
  let [x, y, z] = start;

  // Create 5-8 connected points
  const segments = 5 + Math.floor(Math.random() * 3);

  for (let i = 0; i < segments; i++) {
    // Move in a somewhat straight direction with slight curves
    x += (Math.random() - 0.5) * 2 + 1;
    z += (Math.random() - 0.5) * 2;
    points.push([x, y, z]);
  }

  return points;
}
