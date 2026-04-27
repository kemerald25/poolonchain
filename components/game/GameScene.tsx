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
    <div className="w-full h-full min-h-screen bg-[#050505]">
      <Canvas shadows camera={{ position: [0, 4.5, 0], fov: 35 }}>
        {/* Environment & Lighting */}
        <color attach="background" args={['#050505']} />
        
        {/* Stronger ambient light for base visibility */}
        <ambientLight intensity={0.8} />
        
        {/* Pool hall overhead lamps (Multiple for even coverage) */}
        <spotLight position={[-1, 4, 0]} angle={0.8} penumbra={1} intensity={5} castShadow />
        <spotLight position={[1, 4, 0]} angle={0.8} penumbra={1} intensity={5} castShadow />
        <spotLight position={[0, 4, 0]} angle={1.2} penumbra={1} intensity={3} castShadow />
        
        {/* Basic environment map for ball reflections */}
        <Environment preset="studio" />

        <Suspense fallback={null}>
            <group position={[0, 0, 0]}> 
                <Table />
                <BallGroup balls={balls} />
                <CueStick />
                <AimGuide />
                
                {/* Visual Floor / Room shadow */}
                <ContactShadows resolution={1024} position={[0, -0.1, 0]} opacity={0.4} scale={15} blur={1} far={1} />
            </group>
        </Suspense>

        {/* Fixed Top-Down View (Disable Rotation) */}
        <OrbitControls 
            makeDefault 
            enableRotate={false} 
            target={[0, 0, 0]}
            minDistance={1} 
            maxDistance={10} 
        />
      </Canvas>
    </div>
  );
}
