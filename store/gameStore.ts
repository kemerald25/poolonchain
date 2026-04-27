import { create } from 'zustand';
import { BallData, BallState, Keyframe } from '@/lib/physics/types';
import { GameState } from '@/lib/game/types';
import { PHYSICS } from '@/lib/constants';

export interface GameStore {
  balls: BallData[];
  keyframes: Keyframe[];
  currentFrameIndex: number;
  aimAngle: number;
  aimPower: number; // 0 to 1
  gameState: GameState;
  isPlaying: boolean;
  
  setBalls: (balls: BallData[]) => void;
  setKeyframes: (keyframes: Keyframe[]) => void;
  setCurrentFrameIndex: (idx: number) => void;
  setAimAngle: (angle: number | ((prev: number) => number)) => void;
  setAimPower: (power: number | ((prev: number) => number)) => void;
  setGameState: (state: Partial<GameState>) => void;
  setIsPlaying: (playing: boolean) => void;
  endAnimation: () => void;
}

const createRack = () => {
    const balls: BallData[] = [];
    const r = PHYSICS.BALL_RADIUS;
    const startX = PHYSICS.TABLE_LENGTH / 4;
    const startY = 0;
    
    let count = 1;
    // Standard 5-row triangle rack
    for (let row = 0; row < 5; row++) {
        for (let i = 0; i <= row; i++) {
            balls.push({
                id: count++,
                position: { 
                    x: startX + row * (r * 1.75), 
                    y: startY + (i - row / 2) * (r * 2.1) 
                },
                velocity: { x: 0, y: 0 },
                spin: { x: 0, y: 0 },
                state: BallState.STATIONARY,
            });
        }
    }
    return balls;
};

const initialBalls: BallData[] = [
  ...createRack(),
  { id: 0, position: { x: -PHYSICS.TABLE_LENGTH / 4, y: 0 }, velocity: { x: 0, y: 0 }, spin: { x: 0, y: 0 }, state: BallState.STATIONARY },
];

export const useGameStore = create<GameStore>()((set) => ({
  balls: initialBalls,
  keyframes: [],
  currentFrameIndex: 0,
  aimAngle: 0,
  aimPower: 0,
  isPlaying: false,
  
  gameState: {
    matchState: 'playing',
    turn: 'p1',
    p1Group: 'unassigned',
    p2Group: 'unassigned',
    isFirstBreak: true,
    fouls: [],
    winner: null,
    winReason: null,
    message: "Player 1 to break."
  },

  setBalls: (balls) => set({ balls }),
  setKeyframes: (keyframes: Keyframe[]) => set({ keyframes, currentFrameIndex: 0, isPlaying: true }),
  setCurrentFrameIndex: (idx: number) => set({ currentFrameIndex: idx }),
  setAimAngle: (angle: number | ((prev: number) => number)) => set((s: GameStore) => ({ aimAngle: typeof angle === 'function' ? angle(s.aimAngle) : angle })),
  setAimPower: (power: number | ((prev: number) => number)) => set((s: GameStore) => ({ aimPower: typeof power === 'function' ? power(s.aimPower) : power })),
  setGameState: (state: Partial<GameState>) => set((s: GameStore) => ({ gameState: { ...s.gameState, ...state } })),
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  endAnimation: () => set((state: GameStore) => {
    if (state.keyframes.length === 0) return { isPlaying: false };
    const lastFrame = state.keyframes[state.keyframes.length - 1];
    return { balls: lastFrame.balls, isPlaying: false, keyframes: [] };
  }),
}));
