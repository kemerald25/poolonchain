export type Vector2D = {
  x: number;
  y: number;
};

export enum BallState {
  STATIONARY = 0,
  SLIDING = 1,
  ROLLING = 2,
  SPINNING = 3,
  POCKETED = 4,
}

export type BallData = {
  id: number; // 0 for cue ball, 1-15 for others
  position: Vector2D;
  velocity: Vector2D;
  spin: Vector2D; // x axis spin (top/back spin), z axis spin (side spin)
  state: BallState;
};

export type ShotInput = {
  angle: number; // Radians
  power: number; // Force magnitude
  english: Vector2D; // Spin offset relative to center of cue ball
};

export type CollisionEvent = {
  time: number;
  type: 'ball-ball' | 'ball-cushion' | 'ball-pocket' | 'state-transition';
  ballIds: number[];
  data?: {
    axis?: 'x' | 'y';
  };
};

export type Keyframe = {
  time: number;
  balls: BallData[];
};

export type PhysicsResult = {
  keyframes: Keyframe[];
  pocketedBalls: number[];
  firstContactId: number | null;
  cushionContacts: number;
};
