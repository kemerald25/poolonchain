'use client';

import { forwardRef } from 'react';
import { Mesh } from 'three';
import { PHYSICS } from '@/lib/constants';
import { BallData } from '@/lib/physics/types';

interface BallProps {
  data: BallData;
}

export const Ball = forwardRef<Mesh, BallProps>(({ data }, ref) => {
  const isCueBall = data.id === 0;
  
  // Basic colors per ball number (standard pool sets)
  const getBallColor = (id: number) => {
    if (id === 0) return '#ffffff'; // Cue ball
    const colors = [
      '#f5d300', // 1/9 Yellow
      '#0033cc', // 2/10 Blue
      '#ff3300', // 3/11 Red
      '#330066', // 4/12 Purple
      '#ff6600', // 5/13 Orange
      '#006600', // 6/14 Green
      '#660000', // 7/15 Maroon
      '#111111', // 8 Black
    ];
    // id 1-8 uses colors[id-1]
    // id 9-15 uses colors[id-9]
    return colors[(id - 1) % 8];
  };

  // We add half the sphere's radius to its y-position so it rests perfectly on the table (y=0)
  return (
    <mesh
      ref={ref}
      castShadow
      receiveShadow
      position={[data.position.x, PHYSICS.BALL_RADIUS, data.position.y]}
    >
      <sphereGeometry args={[PHYSICS.BALL_RADIUS, 32, 32]} />
      {/* Glossy standard pool ball material */}
      <meshStandardMaterial 
        color={getBallColor(data.id)} 
        roughness={0.05} 
        metalness={0.1}
        envMapIntensity={1.0}
      />
    </mesh>
  );
});

Ball.displayName = 'Ball';
