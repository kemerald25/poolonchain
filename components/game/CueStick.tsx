'use client';

import { useRef, useState, useEffect } from 'react';
import { Mesh } from 'three';
import { useGameStore, GameStore } from '@/store/gameStore';
import { usePhysics } from '@/hooks/usePhysics';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useAudio } from '@/hooks/useAudio';
import { PHYSICS } from '@/lib/constants';
import { useParams } from 'next/navigation';

export function CueStick() {
  const meshRef = useRef<Mesh>(null);
  const balls = useGameStore((state: GameStore) => state.balls);
  const isPlaying = useGameStore((state: GameStore) => state.isPlaying);
  const aimAngle = useGameStore((state: GameStore) => state.aimAngle);
  const setAimAngle = useGameStore((state: GameStore) => state.setAimAngle);
  const aimPower = useGameStore((state: GameStore) => state.aimPower);
  const setAimPower = useGameStore((state: GameStore) => state.setAimPower);
  
  const { id: matchId } = useParams<{ id: string }>();
  const { simulateShot } = usePhysics();
  const { broadcastShot } = useMultiplayer(matchId);
  const { playSound } = useAudio();
  
  const [isDragging, setIsDragging] = useState(false);
  
  const cueBall = balls.find(b => b.id === 0);

  useEffect(() => {
    if (isPlaying) return;

    const handleMouseMove = (e: MouseEvent) => {
      setAimAngle(aimAngle + e.movementX * 0.01);
    };

    const handleMouseDown = () => setIsDragging(true);
    const handleMouseUp = async () => {
      if (isDragging) {
         setIsDragging(false);
         if (aimPower > 0.05) {
             const shotInput = {
                angle: aimAngle,
                power: aimPower * 10,
                english: { x: 0, y: 0 }
             };
             
             // Play strike sound with volume scaled by power
             playSound('cue_hit', Math.min(1, aimPower + 0.2));
             
             // Running the pure math simulation through the Web Worker
             const keyframes = await simulateShot(shotInput);
             
             // Broadcast the optimistic result to the opponent for immediate sync!
             if (keyframes && keyframes.length > 0) {
                 broadcastShot(shotInput, keyframes);
             }
         }
         setAimPower(0);
      }
    };
    
    const handleDragMove = (e: MouseEvent) => {
        const newPower = Math.min(1, Math.max(0, aimPower + e.movementY * 0.01));
        setAimPower(newPower);
    };

    window.addEventListener('mousemove', isDragging ? handleDragMove : handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', isDragging ? handleDragMove : handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [aimAngle, aimPower, isDragging, isPlaying, setAimAngle, setAimPower, simulateShot, broadcastShot, playSound]);

  if (!cueBall || isPlaying) return null;

  const cueDistBase = PHYSICS.BALL_RADIUS * 2;
  const cueDistPull = cueDistBase + aimPower * 0.5; // Visual pullback
  
  const posX = cueBall.position.x - Math.cos(aimAngle) * cueDistPull;
  const posZ = cueBall.position.y - Math.sin(aimAngle) * cueDistPull;
  const posY = PHYSICS.BALL_RADIUS + 0.05;

  return (
    <group position={[cueBall.position.x, PHYSICS.BALL_RADIUS, cueBall.position.y]} rotation={[0, -aimAngle, 0]}>
      {/* 
          Inner group handles the pullback and tilt.
          We move it back by cueDistPull and up slightly.
      */}
      <group position={[-cueDistPull, 0.05, 0]} rotation={[0, 0, -Math.PI / 16]}>
          {/* Wooden Cue Stick */}
          <mesh ref={meshRef} position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow> 
            <cylinderGeometry args={[0.015, 0.005, 1, 16]} />
            <meshStandardMaterial color="#8b5a2b" roughness={0.7} />
          </mesh>
          
          {/* Chalk tip */}
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 0.01, 16]} />
            <meshStandardMaterial color="#4169E1" roughness={0.9} />
          </mesh>
      </group>
    </group>
  );
}
