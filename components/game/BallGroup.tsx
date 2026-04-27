import { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { BallData, BallState } from '@/lib/physics/types';
import { Ball } from './Ball';
import { useGameStore } from '@/store/gameStore';

interface BallGroupProps {
  balls: BallData[];
}

export function BallGroup({ balls }: BallGroupProps) {
  // Only render balls that are not pocketed
  const visibleBalls = useMemo(() => balls.filter(b => b.state !== BallState.POCKETED), [balls]);

  // Create refs for every possible ball (0-15)
  const ballRefs = useRef<(Mesh | null)[]>(new Array(16).fill(null));

  const isPlaying = useGameStore(state => state.isPlaying);
  const keyframes = useGameStore(state => state.keyframes);
  const endAnimation = useGameStore(state => state.endAnimation);

  // Time tracker for playback
  const playbackTime = useRef(0);

  // Reset playback time when a new animation starts
  useEffect(() => {
    if (isPlaying && keyframes.length > 0) {
      playbackTime.current = keyframes[0].time;
    }
  }, [isPlaying, keyframes]);

  useFrame((state, delta) => {
    if (!isPlaying || keyframes.length === 0) return;

    playbackTime.current += delta;
    const t = playbackTime.current;

    // Find bounding keyframes
    let frameIdx = 0;
    while (frameIdx < keyframes.length - 1 && keyframes[frameIdx + 1].time < t) {
      frameIdx++;
    }

    if (frameIdx >= keyframes.length - 1) {
      // Reached the end of the simulation
      const finalFrame = keyframes[keyframes.length - 1];
      finalFrame.balls.forEach(b => {
        const mesh = ballRefs.current[b.id];
        if (mesh) {
           mesh.position.x = b.position.x;
           mesh.position.z = b.position.y;
        }
      });
      endAnimation();
      return;
    }

    // Interpolate between frameIdx and frameIdx + 1
    const f0 = keyframes[frameIdx];
    const f1 = keyframes[frameIdx + 1];
    const progress = (t - f0.time) / (f1.time - f0.time);

    f0.balls.forEach(b0 => {
       const b1 = f1.balls.find(b => b.id === b0.id);
       if (!b1) return;

       const mesh = ballRefs.current[b0.id];
       if (mesh) {
          const interpX = b0.position.x + (b1.position.x - b0.position.x) * progress;
          const interpY = b0.position.y + (b1.position.y - b0.position.y) * progress;
          mesh.position.x = interpX;
          mesh.position.z = interpY;
       }
    });
  });

  return (
    <group>
      {visibleBalls.map(ball => (
        <Ball 
          key={ball.id} 
          data={ball} 
          ref={(el: Mesh | null) => {
             ballRefs.current[ball.id] = el;
          }} 
        />
      ))}
    </group>
  );
}
