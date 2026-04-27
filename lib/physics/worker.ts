import { PhysicsEngine } from './engine';
import { BallData, ShotInput, PhysicsResult } from './types';

// Define the discriminated union message protocol
export type PhysicsWorkerRequest = {
  type: 'SIMULATE_SHOT';
  payload: {
    initialBalls: BallData[];
    shotInput: ShotInput;
  };
};

export type PhysicsWorkerResponse = {
  type: 'SIMULATION_COMPLETE';
  payload: PhysicsResult;
};

// Worker message listener
self.addEventListener('message', (event: MessageEvent<PhysicsWorkerRequest>) => {
  const { type, payload } = event.data;

  if (type === 'SIMULATE_SHOT') {
    const { initialBalls, shotInput } = payload;
    
    // Initialize engine with isolated state copying
    const engine = new PhysicsEngine(initialBalls);
    
    // Execute synchronous, purely mathematical deterministic shot
    const result = engine.executeShot(shotInput);
    
    // Post result back to main thread
    const response: PhysicsWorkerResponse = {
      type: 'SIMULATION_COMPLETE',
      payload: result,
    };
    self.postMessage(response);
  }
});
