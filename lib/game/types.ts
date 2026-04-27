export type PlayerTurn = 'p1' | 'p2';

export type BallGroup = 'solids' | 'stripes' | 'unassigned';

export interface GameState {
  matchState: 'waiting' | 'playing' | 'game_over';
  turn: PlayerTurn;
  p1Group: BallGroup;
  p2Group: BallGroup;
  isFirstBreak: boolean;
  fouls: string[];
  winner: PlayerTurn | null;
  winReason: string | null;
  message: string | null; // e.g. "Player 1's Turn", "Foul: Cue ball scratched"
}
