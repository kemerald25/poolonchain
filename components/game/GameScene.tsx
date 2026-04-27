'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Table } from './Table';
import { BallGroup } from './BallGroup';
import { CueStick } from './CueStick';
import { AimGuide } from './AimGuide';
import { useGameStore, GameStore } from '@/store/gameStore';

export function GameScene() {
  const balls = useGameStore((state: GameStore) => state.balls);
  return (
    <div className="w-full h-full min-h-screen bg-pool-dark">
      <Canvas shadows camera={{ position: [0, 4, 0], fov: 40 }}>
        {/* Environment & Lighting */}
        <color attach="background" args={['#0b0c10']} />
        
        {/* A soft ambient fill */}
        <ambientLight intensity={0.4} />
        
        {/* Pool hall overhead lamp */}
        <spotLight 
            position={[0, 4, 0]} 
            angle={1.2} 
            penumbra={1} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
        />
        
        {/* Basic environment map for ball reflections */}
        <Environment preset="night" />

        <Suspense fallback={null}>
            <group position={[0, 0, 0]}> 
                <Table />
                <BallGroup balls={balls} />
                <CueStick />
                <AimGuide />
                
                {/* Fake soft contact shadow under table geometry */}
                <ContactShadows resolution={1024} position={[0, -0.1, 0]} opacity={0.6} scale={10} blur={2.5} far={1} />
            </group>
        </Suspense>

        {/* Fixed Top-Down View (Disable Rotation) */}
        <OrbitControls makeDefault enableRotate={false} minDistance={1} maxDistance={10} />
      </Canvas>
    </div>
  );
}
