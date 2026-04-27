// App-wide constants

export const CP_WIN_AWARD = 50;
export const WAGER_PLATFORM_RAKE = 0.025;
export const FORFEIT_TIMEOUT_SECONDS = 60;
export const ESCROW_EXPIRY_MINUTES = 10;

// Physics constants (MKS system - Meters, Kilograms, Seconds)
export const PHYSICS = {
  BALL_RADIUS: 0.028575, // 57.15mm diameter
  BALL_MASS: 0.16, // 160 grams
  TABLE_LENGTH: 2.54, // 9 foot table playing surface length
  TABLE_WIDTH: 1.27, // 9 foot table playing surface width
  GRAVITY: 9.81, // m/s^2
  
  // Friction coefficients (approximate for typical worsted felt)
  MU_S: 0.2, // Sliding friction
  MU_R: 0.01, // Rolling friction
  MU_SP: 0.044, // Spinning friction (z-axis)
  
  // Restitution coefficients
  COR_BALL_BALL: 0.95, // Elasticity of ball-ball collision
  COR_CUSHION: 0.6, // Elasticity of cushion collision
};
