import { create } from 'zustand';
import { BallData, BallState, Keyframe } from '@/lib/physics/types';
import { GameState } from '@/lib/game/types';
import { PHYSICS } from '@/lib/constants';

interface GameStore {
  balls: BallData[];
  keyframes: Keyframe[];
  currentFrameIndex: number;
  aimAngle: number;
  aimPower: number; // 0 to 1
  gameState: GameState;
  
  setBalls: (balls: BallData[]) => void;
  setKeyframes: (keyframes: Keyframe[]) => void;
  setCurrentFrameIndex: (idx: number) => void;
  setAimAngle: (angle: number) => void;
  setAimPower: (power: number) => void;
  setGameState: (state: Partial<GameState>) => void;
}

const initialBalls: BallData[] = [
  ...Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    position: { x: PHYSICS.TABLE_LENGTH / 4 - 0.5 + Math.random() * 0.1, y: -0.2 + Math.random() * 0.4 },
    velocity: { x: 0, y: 0 },
    spin: { x: 0, y: 0 },
    state: BallState.STATIONARY,
  })),
  { id: 0, position: { x: -PHYSICS.TABLE_LENGTH / 4, y: 0 }, velocity: { x: 0, y: 0 }, spin: { x: 0, y: 0 }, state: BallState.STATIONARY },
];

export const useGameStore = create<GameStore>((set) => ({
  balls: initialBalls,
  keyframes: [],
  currentFrameIndex: 0,
  aimAngle: 0,
  aimPower: 0,
  
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
  setKeyframes: (keyframes) => set({ keyframes, currentFrameIndex: 0 }),
  setCurrentFrameIndex: (idx) => set({ currentFrameIndex: idx }),
  setAimAngle: (aimAngle) => set({ aimAngle }),
  setAimPower: (aimPower) => set({ aimPower }),
  setGameState: (state) => set((s) => ({ gameState: { ...s.gameState, ...state } })),
}));
