'use client';

import { useGameStore } from '@/store/gameStore';
import { Line } from '@react-three/drei';
import { Vector3 } from 'three';
import { PHYSICS } from '@/lib/constants';

export function AimGuide() {
  const balls = useGameStore(state => state.balls);
  const aimAngle = useGameStore(state => state.aimAngle);
  const aimPower = useGameStore(state => state.aimPower);
  
  const cueBall = balls.find(b => b.id === 0);
  
  if (!cueBall || aimPower < 0.05) return null;

  const startPoint = new Vector3(cueBall.position.x, PHYSICS.BALL_RADIUS, cueBall.position.y);
  
  // Calculate projected end point mapping angle out loosely
  const length = 5; // Long visual line
  const endPoint = new Vector3(
    startPoint.x + Math.cos(aimAngle) * length,
    PHYSICS.BALL_RADIUS,
    startPoint.z - Math.sin(aimAngle) * length
  );

  return (
    <group>
       <Line
         points={[startPoint, endPoint]}
         color="white"
         lineWidth={2}
         dashed={true}
         dashScale={10}
         dashSize={1}
         dashOffset={0}
         transparent
         opacity={0.6}
       />
    </group>
  );
}
