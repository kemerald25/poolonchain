import { useEffect, useRef, useCallback } from 'react';
import { ShotInput, Keyframe, PhysicsResult } from '../lib/physics/types';
import { PhysicsWorkerRequest, PhysicsWorkerResponse } from '../lib/physics/worker';
import { useGameStore } from '@/store/gameStore';
import { evaluateShot } from '@/lib/game/rules';

export function usePhysics() {
  const workerRef = useRef<Worker | null>(null);
  const setKeyframes = useGameStore(state => state.setKeyframes);
  const balls = useGameStore(state => state.balls);

  const workerPromiseResolvers = useRef<((keyframes: Keyframe[]) => void)[]>([]);

  useEffect(() => {
    workerRef.current = new Worker(new URL('../lib/physics/worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (event: MessageEvent<PhysicsWorkerResponse>) => {
      const { type, payload } = event.data;
      if (type === 'SIMULATION_COMPLETE') {
        const nextGameState = evaluateShot(useGameStore.getState().gameState, payload);
        useGameStore.getState().setGameState(nextGameState);
        
        setKeyframes(payload.keyframes);
        
        // Resolve waiting promises
        const resolvers = workerPromiseResolvers.current;
        workerPromiseResolvers.current = [];
        resolvers.forEach(resolve => resolve(payload.keyframes));
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [setKeyframes]);

  const simulateShot = useCallback((shotInput: ShotInput): Promise<Keyframe[]> => {
    return new Promise((resolve) => {
       if (!workerRef.current) {
          resolve([]);
          return;
       }

       workerPromiseResolvers.current.push(resolve);

       const request: PhysicsWorkerRequest = {
         type: 'SIMULATE_SHOT',
         payload: {
           initialBalls: balls,
           shotInput
         }
       };

       workerRef.current.postMessage(request);
    });
  }, [balls]);

  return { simulateShot };
}
